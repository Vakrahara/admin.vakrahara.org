'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  Headphones, Search, UserCheck, Smartphone, ShoppingBag, BookOpen,
  Swords, CheckCircle2, MessageSquare, RefreshCw, ChevronRight,
  AlertTriangle, Filter, ExternalLink, Shield
} from 'lucide-react';
import { SlideOver } from '@/components/ui/SlideOver';

interface ShadowData {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    is_premium: boolean;
    premium_plan: string;
    subscription_expiry: string;
    trial_end_date: string;
    ad_premium_end_date: string;
    created: string;
    updated: string;
    discipline_stats: any;
  };
  devices: any[];
  orders: any[];
  yatraProgress: any[];
  arenaMatches: any[];
}

interface FeedbackReport {
  id: string;
  user_id: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  admin_notes: string;
  device_info: string;
  app_version: string;
  created: string;
}

export default function SupportDeskPage() {
  const [activeTab, setActiveTab] = useState<'shadow' | 'feedback'>('shadow');
  
  // Shadow Mode State
  const [shadowSearch, setShadowSearch] = useState('');
  const [shadowLoading, setShadowLoading] = useState(false);
  const [shadowData, setShadowData] = useState<ShadowData | null>(null);
  const [shadowError, setShadowError] = useState('');

  // Feedback Desk State
  const [feedbackReports, setFeedbackReports] = useState<FeedbackReport[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FeedbackReport | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const handleShadowLookup = async (userIdOrEmail: string) => {
    if (!userIdOrEmail.trim()) return;
    setShadowLoading(true);
    setShadowError('');
    setShadowData(null);

    try {
      let targetId = userIdOrEmail.trim();
      if (targetId.includes('@')) {
        const userRec = await pb.collection('users').getFirstListItem(`email = "${targetId}"`);
        targetId = userRec.id;
      }

      const res = await pb.send(`/api/amritam/admin/student-shadow/${targetId}`, {
        method: 'GET',
      });
      setShadowData(res);
    } catch (err: any) {
      setShadowError(err.message || 'User not found or unable to fetch student shadow state.');
    } finally {
      setShadowLoading(false);
    }
  };

  const fetchFeedback = useCallback(async () => {
    setFeedbackLoading(true);
    try {
      const res = await pb.collection('user_feedback_reports').getList(1, 50, {
        sort: '-created',
      });
      setFeedbackReports(res.items as unknown as FeedbackReport[]);
    } catch (err) {
      console.error('Failed to load feedback reports:', err);
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedback();
    }
  }, [activeTab, fetchFeedback]);

  const handleResolveFeedback = async (reportId: string, status: string) => {
    setResolving(true);
    try {
      await pb.send('/api/amritam/admin/feedback/resolve', {
        method: 'POST',
        body: {
          report_id: reportId,
          status: status,
          admin_notes: resolveNotes,
        },
      });
      setSelectedReport(null);
      setResolveNotes('');
      fetchFeedback();
    } catch (err) {
      console.error('Failed to resolve feedback:', err);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Customer Support & Shadow Desk</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              Tier-3 Console
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            "View-As-Student" real-time session introspection and in-app feedback resolution.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#0d0d15] border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('shadow')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'shadow'
                ? 'bg-[#d4af37] text-black font-semibold shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Shadow Mode
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'feedback'
                ? 'bg-[#d4af37] text-black font-semibold shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Feedback Desk
          </button>
        </div>
      </div>

      {activeTab === 'shadow' ? (
        <div className="space-y-6">
          {/* Lookup Input Bar */}
          <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Lookup Student Profile
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter student Email (e.g. user@gmail.com) or Record ID..."
                  value={shadowSearch}
                  onChange={(e) => setShadowSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleShadowLookup(shadowSearch)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>
              <button
                onClick={() => handleShadowLookup(shadowSearch)}
                disabled={shadowLoading || !shadowSearch.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black font-semibold text-sm transition disabled:opacity-50 flex items-center gap-2"
              >
                {shadowLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Inspect Student</span>
              </button>
            </div>
            {shadowError && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{shadowError}</span>
              </div>
            )}
          </div>

          {/* Student Profile Snapshot */}
          {shadowData && (
            <div className="space-y-6">
              {/* Account Summary Banner */}
              <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Student Identity</span>
                  <div className="text-lg font-bold text-white mt-1">{shadowData.user.name || 'Anonymous'}</div>
                  <div className="text-xs text-gray-400 font-mono">{shadowData.user.email}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {shadowData.user.id}</div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Subscription State</span>
                  <div className="mt-1">
                    {shadowData.user.is_premium ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
                        PREMIUM ({shadowData.user.premium_plan.toUpperCase()})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/30">
                        FREE TIER
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Expiry: {shadowData.user.subscription_expiry ? new Date(shadowData.user.subscription_expiry).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Registered Devices</span>
                  <div className="text-lg font-bold text-white mt-1">{shadowData.devices.length} Devices</div>
                  <div className="text-xs text-gray-400 mt-0.5">Multi-device FCM active</div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Account Age</span>
                  <div className="text-sm font-medium text-white mt-1">
                    {new Date(shadowData.user.created).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-500">Last active: {new Date(shadowData.user.updated).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Multi-Section Tabs: Devices, Orders, Syllabus, Arena */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Syllabus / Yatra Progress */}
                <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-white">Yatra & Syllabus Progress</h2>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {shadowData.yatraProgress.length === 0 ? (
                      <div className="text-xs text-gray-500 py-6 text-center">No syllabus progress recorded yet.</div>
                    ) : (
                      shadowData.yatraProgress.map((yp) => (
                        <div key={yp.id} className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="font-medium text-white">{yp.chapter_id || 'Chapter'}</div>
                            <div className="text-gray-500">Step: {yp.current_step || '1'}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                            {yp.is_completed ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Buddhi Arena Match History */}
                <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Swords className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-white">Buddhi Arena Challenges</h2>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {shadowData.arenaMatches.length === 0 ? (
                      <div className="text-xs text-gray-500 py-6 text-center">No multiplayer duel records.</div>
                    ) : (
                      shadowData.arenaMatches.map((m) => (
                        <div key={m.id} className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="font-medium text-white">{m.is_rated ? 'Ranked Match' : 'Friendly Duel'}</div>
                            <div className="text-gray-500">Status: {m.status}</div>
                          </div>
                          <span className="text-gray-400 font-mono">{new Date(m.created).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* In-App Feedback Desk */
        <div className="space-y-4">
          <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/3 border-b border-white/8 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">App Version</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {feedbackLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d4af37]" />
                        <span>Loading feedback tickets...</span>
                      </td>
                    </tr>
                  ) : feedbackReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                        <span>All feedback reports have been resolved!</span>
                      </td>
                    </tr>
                  ) : (
                    feedbackReports.map((report) => (
                      <tr
                        key={report.id}
                        className="hover:bg-white/2 transition cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                          {new Date(report.created).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            {report.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-sm truncate text-xs font-medium text-white">
                          {report.subject || report.description || 'No subject'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                          {report.app_version || 'v1.0.0'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'Resolved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {report.status || 'Open'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition"
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Feedback SlideOver */}
      {selectedReport && (
        <SlideOver
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          title="Resolve User Feedback Ticket"
        >
          <div className="space-y-5 text-sm">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Subject</span>
              <div className="text-base font-bold text-white mt-1">{selectedReport.subject || 'User Ticket'}</div>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">User Description</span>
              <div className="mt-1 p-3 bg-black/40 border border-white/10 rounded-xl text-gray-300 text-xs whitespace-pre-wrap">
                {selectedReport.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Category:</span>
                <div className="text-white font-medium">{selectedReport.category}</div>
              </div>
              <div>
                <span className="text-gray-500">App Version:</span>
                <div className="text-white font-mono">{selectedReport.app_version}</div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Admin Resolution Notes</label>
              <textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Enter notes about root cause, bugfix version, or follow-up action..."
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]/50 h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleResolveFeedback(selectedReport.id, 'In Progress')}
                disabled={resolving}
                className="py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleResolveFeedback(selectedReport.id, 'Resolved')}
                disabled={resolving}
                className="py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </SlideOver>
      )}
    </div>
  );
}
