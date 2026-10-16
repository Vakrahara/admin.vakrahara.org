'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { RefreshCw, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { DiffViewerModal } from '@/components/ui/DiffViewerModal';
import { AuditLog } from './types';
import { AuditFilterToolbar } from './components/AuditFilterToolbar';
import { AuditLogTable } from './components/AuditLogTable';
import { AuditLogDetailDrawer } from './components/AuditLogDetailDrawer';

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
    exportToCsv(exportData, `admin_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
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
      <AuditFilterToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        actionFilter={actionFilter}
        onActionChange={(val) => { setActionFilter(val); setPage(1); }}
        severityFilter={severityFilter}
        onSeverityChange={(val) => { setSeverityFilter(val); setPage(1); }}
      />

      {/* Audit Log Table */}
      <AuditLogTable
        logs={logs}
        loading={loading}
        totalItems={totalItems}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onSelectLog={setSelectedLog}
        onOpenDiff={setSelectedDiff}
      />

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
      <AuditLogDetailDrawer
        selectedLog={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
