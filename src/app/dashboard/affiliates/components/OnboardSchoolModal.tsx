interface OnboardSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formName: string;
  setFormName: (v: string) => void;
  formUdise: string;
  setFormUdise: (v: string) => void;
  formContact: string;
  setFormContact: (v: string) => void;
  formEmail: string;
  setFormEmail: (v: string) => void;
  formCode: string;
  setFormCode: (v: string) => void;
  formCommission: number;
  setFormCommission: (v: number) => void;
}

export function OnboardSchoolModal({
  isOpen,
  onClose,
  onSubmit,
  formName,
  setFormName,
  formUdise,
  setFormUdise,
  formContact,
  setFormContact,
  formEmail,
  setFormEmail,
  formCode,
  setFormCode,
  formCommission,
  setFormCommission,
}: OnboardSchoolModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0d0d15] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-bold text-white">Onboard School Partner</h2>
        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-gray-400 font-semibold uppercase tracking-wider">School / Institution Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Delhi Public School, R.K. Puram"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 font-semibold uppercase tracking-wider">UDISE Code</label>
              <input
                type="text"
                placeholder="e.g. 07010100101"
                value={formUdise}
                onChange={(e) => setFormUdise(e.target.value)}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 font-mono"
              />
            </div>
            <div>
              <label className="text-gray-400 font-semibold uppercase tracking-wider">Referral Code</label>
              <input
                type="text"
                required
                placeholder="e.g. DPSRKP20"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 font-semibold uppercase tracking-wider">Contact Person</label>
              <input
                type="text"
                placeholder="Principal / Coordinator"
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50"
              />
            </div>
            <div>
              <label className="text-gray-400 font-semibold uppercase tracking-wider">Commission %</label>
              <input
                type="number"
                min="5"
                max="50"
                value={formCommission}
                onChange={(e) => setFormCommission(Number(e.target.value))}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 font-semibold uppercase tracking-wider">Contact Email</label>
            <input
              type="email"
              placeholder="admin@school.edu.in"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black font-bold transition"
            >
              Save Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
