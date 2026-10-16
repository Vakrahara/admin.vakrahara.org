import { School, Users, IndianRupee, Percent } from 'lucide-react';
import { AffiliatePartner } from '../types';

interface AffiliateKpiCardsProps {
  partners: AffiliatePartner[];
}

export function AffiliateKpiCards({ partners }: AffiliateKpiCardsProps) {
  const totalStudents = partners.reduce((acc, p) => acc + (p.total_students_referred || 0), 0);
  const totalCommission = partners.reduce((acc, p) => acc + ((p.total_earnings_paise || 0) / 100), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Partner Schools</span>
          <School className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-white">{partners.length} Institutions</div>
        <div className="text-xs text-gray-500 mt-1">Verified UDISE partners</div>
      </div>

      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Students Enrolled</span>
          <Users className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-emerald-400">
          {totalStudents} Students
        </div>
        <div className="text-xs text-gray-500 mt-1">Via school referral codes</div>
      </div>

      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Commission Accrued</span>
          <IndianRupee className="w-4 h-4 text-[#d4af37]" />
        </div>
        <div className="text-2xl font-bold text-[#d4af37]">
          ₹{totalCommission.toLocaleString('en-IN')}
        </div>
        <div className="text-xs text-gray-500 mt-1">Direct institutional payouts</div>
      </div>

      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Avg Commission</span>
          <Percent className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-purple-400">20% Share</div>
        <div className="text-xs text-gray-500 mt-1">Standard institutional revshare</div>
      </div>
    </div>
  );
}
