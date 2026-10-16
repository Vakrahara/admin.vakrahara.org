import { SlideOver } from '@/components/ui/SlideOver';
import { Check, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { MasterInstitutionRecord } from '@/types/institutions';

interface EditMasterInstitutionDrawerProps {
  selectedMaster: MasterInstitutionRecord | null;
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
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

export function EditMasterInstitutionDrawer({
  selectedMaster,
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
  onUpdate,
  onDelete,
}: EditMasterInstitutionDrawerProps) {
  return (
    <SlideOver
      isOpen={!!selectedMaster}
      onClose={onClose}
      title="Edit Master Institution Record"
      subtitle={`School ID: ${selectedMaster?.id}`}
    >
      {selectedMaster && (
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
              Edit Master Directory School
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">School / Institution Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">Category</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400"
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
                  className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">State</label>
                <input
                  type="text"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  placeholder="e.g. Jharkhand"
                  className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <button
              onClick={onUpdate}
              disabled={isProcessing || !editName.trim()}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 hover:opacity-95 disabled:opacity-40 transition-all"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes to Master Directory
            </button>

            <button
              onClick={() => onDelete(selectedMaster.id)}
              disabled={isProcessing}
              className="w-full py-3 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/40 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-all mt-4"
            >
              <Trash2 className="w-4 h-4" />
              Delete School from Directory
            </button>
          </div>
        </div>
      )}
    </SlideOver>
  );
}
