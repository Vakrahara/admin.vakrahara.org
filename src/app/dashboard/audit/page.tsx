'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  ShieldAlert, Search, Filter, RefreshCw, Download, FileCode2,
  AlertTriangle, Info, CheckCircle2, ChevronLeft, ChevronRight,
  Eye, Clock, Terminal, UserCheck
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { DiffViewerModal } from '@/components/ui/DiffViewerModal';
import { SlideOver } from '@/components/ui/SlideOver';

interface AuditLog {
  id: string;
  admin_email: string;
  admin_id: string;
  action: string;
  target_collection: string;
  target_id: string;
  details: string;
  before_state: any;
  after_state: any;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ip_address: string;
  created: string;
}

const SEVERITY_BADGES: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: AlertTriangle },
  WARNING:  { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: AlertTriangle },
  INFO:     { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Info },
};

const ACTION_COLORS: Record<string, string> = {
  USER_PREMIUM_GRANTED: 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30',
  USER_PREMIUM_REVOKED: 'text-red-400 bg-red-500/10 border-red-500/30',
  USER_TRIAL_GRANTED: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  FEEDBACK_REPORT_RESOLVED: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  MODERATION_REPORT_RESOLVED: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Modals / Drawers
  const [selectedDiff, setSelectedDiff] = useState<{ title: string; before: any; after: any } | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('perPage', '25');
      if (search) params.set('search', search);
      if (actionFilter) params.set('action', actionFilter);
      if (severityFilter) params.set('severity', severityFilter);

      const res = await pb.send(`/api/amritam/admin/audit-logs?${params.toString()}`, {
        method: 'GET',
      });

      setLogs(res.items || []);
      setTotalItems(res.totalItems || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, severityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExport = () => {
    const exportData = logs.map(l => ({
      Timestamp: l.created,
      Admin: l.admin_email,
      Action: l.action,
      TargetCollection: l.target_collection,
      TargetID: l.target_id,
      Severity: l.severity,
      Details: l.details,
      IPAddress: l.ip_address,
      BeforeState: typeof l.before_state === 'object' ? JSON.stringify(l.before_state) : l.before_state,
      AfterState: typeof l.after_state === 'object' ? JSON.stringify(l.after_state) : l.after_state,
    }));
    exportToCsv(exportData, `admin_audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Audit Trail</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              {totalItems} Events
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Tamper-evident ledger of administrative state changes, privilege grants, and moderation actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-sm font-medium transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black text-sm font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search email, target ID, or action..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#0d0d15] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]/50"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-[#0d0d15] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#d4af37]/50"
        >
          <option value="">All Action Types</option>
          <option value="USER_PREMIUM_GRANTED">USER_PREMIUM_GRANTED</option>
          <option value="USER_PREMIUM_REVOKED">USER_PREMIUM_REVOKED</option>
          <option value="USER_TRIAL_GRANTED">USER_TRIAL_GRANTED</option>
          <option value="FEEDBACK_REPORT_RESOLVED">FEEDBACK_REPORT_RESOLVED</option>
          <option value="MODERATION_REPORT_RESOLVED">MODERATION_REPORT_RESOLVED</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          className="bg-[#0d0d15] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#d4af37]/50"
        >
          <option value="">All Severities</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/3 border-b border-white/8 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Admin</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4 text-right">State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d4af37]" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <span>No audit log records found for current filters.</span>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const sev = SEVERITY_BADGES[log.severity] || SEVERITY_BADGES.INFO;
                  const hasDiff = log.before_state || log.after_state;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-white/2 transition cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                        {new Date(log.created).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-white">{log.admin_email}</div>
                        <div className="text-xs text-gray-500 font-mono">{log.ip_address || 'Internal'}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${ACTION_COLORS[log.action] || 'text-gray-300 bg-gray-500/10 border-gray-500/30'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        <span className="text-gray-400">{log.target_collection}</span>
                        {log.target_id && (
                          <div className="font-mono text-gray-500">{log.target_id}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${sev.bg} ${sev.text} ${sev.border}`}>
                          <sev.icon className="w-3 h-3" />
                          <span>{log.severity || 'INFO'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-xs text-gray-300">
                        {log.details || '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        {hasDiff ? (
                          <button
                            onClick={() => setSelectedDiff({
                              title: `${log.action} (${log.target_collection}/${log.target_id})`,
                              before: log.before_state,
                              after: log.after_state
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] text-xs font-medium border border-[#d4af37]/30 transition"
                          >
                            <FileCode2 className="w-3.5 h-3.5" />
                            <span>View Diff</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="py-3.5 px-4 bg-white/2 border-t border-white/8 flex items-center justify-between text-xs text-gray-400">
          <div>
            Showing <span className="text-white font-medium">{logs.length}</span> of <span className="text-white font-medium">{totalItems}</span> events
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Diff Viewer Modal */}
      {selectedDiff && (
        <DiffViewerModal
          isOpen={true}
          onClose={() => setSelectedDiff(null)}
          title={selectedDiff.title}
          beforeState={selectedDiff.before}
          afterState={selectedDiff.after}
        />
      )}

      {/* Row Details SlideOver Drawer */}
      {selectedLog && (
        <SlideOver
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title="Audit Log Event Details"
        >
          <div className="space-y-5 text-sm">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Action</label>
              <div className="mt-1 font-mono font-bold text-lg text-[#d4af37]">{selectedLog.action}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Admin</label>
                <div className="mt-1 text-white font-medium">{selectedLog.admin_email}</div>
                <div className="text-xs text-gray-500 font-mono">{selectedLog.admin_id}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Timestamp</label>
                <div className="mt-1 text-white">{new Date(selectedLog.created).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Target Collection</label>
                <div className="mt-1 text-gray-300 font-mono">{selectedLog.target_collection || 'N/A'}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Target Record ID</label>
                <div className="mt-1 text-gray-300 font-mono">{selectedLog.target_id || 'N/A'}</div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Details</label>
              <div className="mt-1 p-3 bg-black/40 border border-white/10 rounded-xl text-gray-300 font-mono text-xs">
                {selectedLog.details || 'No narrative details provided.'}
              </div>
            </div>

            {(selectedLog.before_state || selectedLog.after_state) && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">State Payload</label>
                <div className="mt-2 space-y-3">
                  {selectedLog.before_state && (
                    <div>
                      <span className="text-xs text-red-400 font-semibold">Before:</span>
                      <pre className="mt-1 p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-200 text-xs overflow-x-auto">
                        {typeof selectedLog.before_state === 'string' ? selectedLog.before_state : JSON.stringify(selectedLog.before_state, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.after_state && (
                    <div>
                      <span className="text-xs text-emerald-400 font-semibold">After:</span>
                      <pre className="mt-1 p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-emerald-200 text-xs overflow-x-auto">
                        {typeof selectedLog.after_state === 'string' ? selectedLog.after_state : JSON.stringify(selectedLog.after_state, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SlideOver>
      )}
    </div>
  );
}
