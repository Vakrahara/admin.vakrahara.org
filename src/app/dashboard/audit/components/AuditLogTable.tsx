import { ShieldAlert, RefreshCw, FileCode2, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuditLog, SEVERITY_BADGES, ACTION_COLORS } from '../types';

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  totalItems: number;
  totalPages: number;
  page: number;
  onPageChange: (p: number) => void;
  onSelectLog: (log: AuditLog) => void;
  onOpenDiff: (diff: { title: string; before: any; after: any }) => void;
}

export function AuditLogTable({
  logs,
  loading,
  totalItems,
  totalPages,
  page,
  onPageChange,
  onSelectLog,
  onOpenDiff,
}: AuditLogTableProps) {
  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch {
      return dateStr || '—';
    }
  };

  return (
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
                    onClick={() => onSelectLog(log)}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {formatTimestamp(log.created)}
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
                          onClick={() => onOpenDiff({
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
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
