import { Building2, Clock, CheckCircle2, Globe } from 'lucide-react';

interface InstitutionKpiCardsProps {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  masterTotal: number;
}

export function InstitutionKpiCards({
  totalCount,
  pendingCount,
  approvedCount,
  masterTotal,
}: InstitutionKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Total User Requests</span>
          <div className="text-3xl font-extrabold text-white mt-1">{totalCount}</div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel-gold p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest block">Pending Submissions</span>
          <div className="text-3xl font-extrabold text-[#d4af37] mt-1">{pendingCount}</div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Approved Requests</span>
          <div className="text-3xl font-extrabold text-white mt-1">{approvedCount}</div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">Master Live Directory</span>
          <div className="text-3xl font-extrabold text-white mt-1">{masterTotal === -1 ? '1.5M+' : masterTotal}</div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
          <Globe className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
