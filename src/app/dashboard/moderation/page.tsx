'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  ShieldAlert, UserX, Eye, EyeOff, CheckCircle2, AlertOctagon,
  RefreshCw, Filter, Search, Ban, Check, ShieldCheck, FileWarning
} from 'lucide-react';
import { SudoConfirmModal } from '@/components/ui/SudoConfirmModal';

interface ModerationReport {
  id: string;
  blob_hash: string;
  reported_user_id: string;
  reason: string;
  status: string;
  created: string;
}

export default function ModerationPage() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [totalItems, setTotalItems] = useState(0);
  const [unblurredIds, setUnblurredIds] = useState<Record<string, boolean>>({});

  // Sudo Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: '',
    onConfirm: async () => {},
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pb.send(`/api/amritam/admin/moderation/queue?status=${statusFilter}&page=1&perPage=50`, {
        method: 'GET',
      });
      setReports(res.items || []);
      setTotalItems(res.totalItems || 0);
    } catch (err) {
      console.error('Failed to load moderation queue:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const toggleBlur = (id: string) => {
    setUnblurredIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAction = (reportId: string, action: 'dismiss' | 'quarantine' | 'ban_user') => {
    const titles = {
      dismiss: 'Dismiss Moderation Report',
      quarantine: 'Quarantine Media Blob',
      ban_user: 'Ban User & Revoke Sessions',
    };

    const descriptions = {
      dismiss: 'This report will be marked as dismissed. No action will be taken against the content.',
      quarantine: 'This content hash will be quarantined across R2 CDN and app cache immediately.',
      ban_user: 'The user account will be deactivated, device sessions revoked, and content quarantined.',
    };

    setConfirmModal({
      isOpen: true,
      title: titles[action],
      description: descriptions[action],
      actionLabel: action === 'ban_user' ? 'Ban User' : action === 'quarantine' ? 'Quarantine' : 'Dismiss',
      onConfirm: async () => {
        try {
          await pb.send('/api/amritam/admin/moderation/resolve', {
            method: 'POST',
            body: {
              report_id: reportId,
              action: action,
              reason: `Resolved via admin console as ${action}`,
            },
          });
          fetchReports();
        } catch (err) {
          console.error('Failed to resolve report:', err);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">UGC & Media Moderation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
              {totalItems} in Queue
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Safe blur-shield media review, content-addressable quarantine, and zero-tolerance user bans.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black text-sm font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/8 pb-3">
        {[
          { id: 'pending', label: 'Pending Review', count: statusFilter === 'pending' ? totalItems : null },
          { id: 'quarantined', label: 'Quarantined Blobs', count: statusFilter === 'quarantined' ? totalItems : null },
          { id: 'dismissed', label: 'Dismissed Reports', count: statusFilter === 'dismissed' ? totalItems : null },
          { id: 'banned', label: 'Banned Users', count: statusFilter === 'banned' ? totalItems : null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              statusFilter === tab.id
                ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white font-mono">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Report Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#d4af37]" />
          <span>Scanning moderation queue...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl py-16 text-center text-gray-500">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-60" />
          <div className="text-base font-bold text-white">Clean Moderation Desk</div>
          <p className="text-xs text-gray-400 mt-1">There are no flagged items in the {statusFilter} queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => {
            const isUnblurred = unblurredIds[report.id];

            return (
              <div
                key={report.id}
                className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Media Preview Box with Safe Blur */}
                <div className="relative aspect-video bg-black/80 flex items-center justify-center border-b border-white/8 overflow-hidden group">
                  <div className={`w-full h-full flex flex-col items-center justify-center p-4 transition duration-300 ${isUnblurred ? 'filter-none' : 'blur-xl opacity-30 select-none'}`}>
                    <FileWarning className="w-12 h-12 text-red-400 mb-2" />
                    <span className="text-xs font-mono text-gray-400 truncate max-w-full">{report.blob_hash}</span>
                  </div>

                  {/* Unblur Overlay Button */}
                  <button
                    onClick={() => toggleBlur(report.id)}
                    className="absolute inset-0 m-auto w-fit h-fit px-3.5 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-medium border border-white/20 backdrop-blur-md flex items-center gap-2 shadow-2xl transition"
                  >
                    {isUnblurred ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-[#d4af37]" />}
                    <span>{isUnblurred ? 'Shield Image' : 'Reveal Preview'}</span>
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3 flex-1">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold">Flag Reason</span>
                    <div className="text-sm font-semibold text-red-400 mt-0.5">{report.reason || 'User Reported Content'}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Reported User:</span>
                      <div className="font-mono text-gray-300 truncate">{report.reported_user_id || 'Anonymous'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Reported At:</span>
                      <div className="text-gray-300">{new Date(report.created).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-500 font-mono">CAS SHA-256:</span>
                    <div className="font-mono text-[11px] text-gray-400 bg-black/40 p-2 rounded-lg truncate border border-white/5">
                      {report.blob_hash}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {statusFilter === 'pending' && (
                  <div className="p-4 bg-white/2 border-t border-white/8 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAction(report.id, 'dismiss')}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'quarantine')}
                      className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
                    >
                      Quarantine
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'ban_user')}
                      className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition"
                    >
                      Ban User
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sudo Confirmation Modal */}
      <SudoConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        actionLabel={confirmModal.actionLabel}
        requiredText={confirmModal.actionLabel === 'Ban User' ? 'CONFIRM' : undefined}
      />
    </div>
  );
}
