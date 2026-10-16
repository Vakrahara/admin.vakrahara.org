import { Plus, X } from 'lucide-react';

interface DirectAddInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (v: string) => void;
  type: string;
  setType: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  state: string;
  setState: (v: string) => void;
  isProcessing: boolean;
}

export function DirectAddInstitutionModal({
  isOpen,
  onClose,
  onSubmit,
  name,
  setName,
  type,
  setType,
  city,
  setCity,
  state,
  setState,
  isProcessing,
}: DirectAddInstitutionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-md w-full bg-[#08080c] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#d4af37]" />
            Add Institution Manually
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium">Institution Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MGM Public School"
              className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium">Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
            >
              <option value="school">School (K-12)</option>
              <option value="college">College / University</option>
              <option value="company">Company / Organization / EdTech</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bokaro"
                className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Jharkhand"
                className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !name.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#d4af37]/20 hover:opacity-95 disabled:opacity-40"
            >
              {isProcessing ? 'Adding...' : 'Add Institution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
