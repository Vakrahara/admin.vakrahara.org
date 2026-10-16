import { SlideOver } from '@/components/ui/SlideOver';
import { AuditLog } from '../types';

interface AuditLogDetailDrawerProps {
  selectedLog: AuditLog | null;
  onClose: () => void;
}

export function AuditLogDetailDrawer({ selectedLog, onClose }: AuditLogDetailDrawerProps) {
  if (!selectedLog) return null;

  return (
    <SlideOver
      isOpen={true}
      onClose={onClose}
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
  );
}
