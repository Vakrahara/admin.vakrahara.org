'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { ShadowData, FeedbackReport } from './types';
import { StudentShadowLookup } from './components/StudentShadowLookup';
import { StudentShadowSnapshot } from './components/StudentShadowSnapshot';
import { FeedbackDeskTable } from './components/FeedbackDeskTable';

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
          <StudentShadowLookup
            search={shadowSearch}
            onSearchChange={setShadowSearch}
            onSearch={handleShadowLookup}
            loading={shadowLoading}
            error={shadowError}
          />
          {shadowData && <StudentShadowSnapshot shadowData={shadowData} />}
        </div>
      ) : (
        <FeedbackDeskTable
          reports={feedbackReports}
          loading={feedbackLoading}
          selectedReport={selectedReport}
          onSelectReport={setSelectedReport}
          resolveNotes={resolveNotes}
          onNotesChange={setResolveNotes}
          onResolve={handleResolveFeedback}
          resolving={resolving}
        />
      )}
    </div>
  );
}
