import { SlideOver } from '@/components/ui/SlideOver';
import { Check, AlertCircle, Loader2, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { InstitutionRequestRecord } from '@/types/institutions';

interface ReviewRequestDrawerProps {
  selectedRequest: InstitutionRequestRecord | null;
  onClose: () => void;
  actionSuccess: string | null;
  actionError: string | null;
  editName: string;
  setEditName: (v: string) => void;
  editType: string;
  setEditType: (v: string) => void;
  editCity: string;
  setEditCity: (v: string) => void;
  editState: string;
  setEditState: (v: string) => void;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: (id: string) => void;
}

export function ReviewRequestDrawer({
  selectedRequest,
  onClose,
  actionSuccess,
  actionError,
  editName,
  setEditName,
  editType,
  setEditType,
  editCity,
  setEditCity,
  editState,
  setEditState,
  isProcessing,
  onApprove,
  onReject,
  onDelete,
}: ReviewRequestDrawerProps) {
  return (
    <SlideOver
      isOpen={!!selectedRequest}
      onClose={onClose}
      title="Review Institution Request"
      subtitle={`Request ID: ${selectedRequest?.id}`}
    >
      {selectedRequest && (
        <div className="space-y-6">
          {actionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              {actionSuccess}
            </div>
          )}

          {actionError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {actionError}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Edit & Standardize Details
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">Institution Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">Category</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
              >
                <option value="school">School (K-12)</option>
                <option value="college">College / University</option>
                <option value="company">Company / Organization / EdTech</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">City / District</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="e.g. Bokaro"
                  className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">State</label>
                <input
                  type="text"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  placeholder="e.g. Jharkhand"
                  className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <button
              onClick={onApprove}
              disabled={isProcessing || !editName.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:opacity-95 disabled:opacity-40 transition-all"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve & Publish Globally
            </button>

            <button
              onClick={onReject}
              disabled={isProcessing}
              className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            >
              <XCircle className="w-4 h-4" />
              Reject Submission
            </button>

            <button
              onClick={() => onDelete(selectedRequest.id)}
              disabled={isProcessing}
              className="w-full py-3 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/40 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-all mt-4"
            >
              <Trash2 className="w-4 h-4" />
              Delete Request Permanently
            </button>
          </div>
        </div>
      )}
    </SlideOver>
  );
}
