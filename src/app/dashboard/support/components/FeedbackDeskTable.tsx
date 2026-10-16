import { RefreshCw, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { SlideOver } from '@/components/ui/SlideOver';
import { FeedbackReport } from '../types';

interface FeedbackDeskTableProps {
  reports: FeedbackReport[];
  loading: boolean;
  selectedReport: FeedbackReport | null;
  onSelectReport: (r: FeedbackReport | null) => void;
  resolveNotes: string;
  onNotesChange: (v: string) => void;
  onResolve: (id: string, status: string) => void;
  resolving: boolean;
}

export function FeedbackDeskTable({
  reports,
  loading,
  selectedReport,
  onSelectReport,
  resolveNotes,
  onNotesChange,
  onResolve,
  resolving,
}: FeedbackDeskTableProps) {
  return (
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d4af37]" />
                    <span>Loading feedback tickets...</span>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                    <span>All feedback reports have been resolved!</span>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-white/2 transition cursor-pointer"
                    onClick={() => onSelectReport(report)}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {new Date(report.created).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        {report.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-xs font-medium text-white">
                      {report.subject || 'No subject'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      v{report.app_version || '1.0.0'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        report.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : report.status === 'in_progress'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {report.status?.toUpperCase() || 'NEW'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right text-xs">
                      <button className="text-gray-400 hover:text-white flex items-center gap-1 ml-auto">
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Resolution Drawer */}
      {selectedReport && (
        <SlideOver
          isOpen={true}
          onClose={() => onSelectReport(null)}
          title="Feedback Ticket Details"
        >
          <div className="space-y-5 text-sm">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Subject</span>
              <div className="text-base font-bold text-white mt-1">{selectedReport.subject}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Category</span>
                <div className="mt-1">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    {selectedReport.category}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Submitted At</span>
                <div className="text-xs text-gray-400 mt-1">{new Date(selectedReport.created).toLocaleString()}</div>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">User Description</span>
              <div className="mt-1 p-3 bg-black/40 border border-white/10 rounded-xl text-gray-300 text-xs whitespace-pre-wrap">
                {selectedReport.description}
              </div>
            </div>

            {selectedReport.device_info && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Hardware / Telemetry</span>
                <div className="mt-1 p-3 bg-black/40 border border-white/10 rounded-xl text-gray-400 font-mono text-xs">
                  {selectedReport.device_info}
                </div>
              </div>
            )}

            {/* Resolution Form */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Resolution Notes</span>
              <textarea
                rows={3}
                placeholder="Enter internal resolution rationale or reply notes..."
                value={resolveNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onResolve(selectedReport.id, 'in_progress')}
                  disabled={resolving}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs transition"
                >
                  Mark In-Progress
                </button>
                <button
                  onClick={() => onResolve(selectedReport.id, 'resolved')}
                  disabled={resolving}
                  className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  {resolving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Mark Resolved</span>
                </button>
              </div>
            </div>
          </div>
        </SlideOver>
      )}
    </div>
  );
}
