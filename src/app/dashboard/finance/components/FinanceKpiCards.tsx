'use client';

import { IndianRupee, Receipt, Gift, Globe } from 'lucide-react';

interface FinanceKpiCardsProps {
  totalRevenue: number;
  promotionalSubsidy: number;
  gmv: number;
  totalGST: number;
}

export function FinanceKpiCards({
  totalRevenue,
  promotionalSubsidy,
  gmv,
  totalGST,
}: FinanceKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Card 1: Net Realized Revenue */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Net Realized Revenue</span>
          <IndianRupee className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-white">
          ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-emerald-400/80 mt-1">Actual Cash in Bank (Paid Orders)</div>
      </div>

      {/* Card 2: Promotional Subsidies / Scholarships */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Promotional Subsidies</span>
          <Gift className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-purple-400">
          ₹{promotionalSubsidy.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-gray-400 mt-1">Scholarships, Giveaways & 100% Coupons</div>
      </div>

      {/* Card 3: Gross Merchandise Value (GMV) */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Gross Merchandise Value</span>
          <Globe className="w-4 h-4 text-sky-400" />
        </div>
        <div className="text-2xl font-bold text-sky-400">
          ₹{gmv.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-gray-400 mt-1">Cash Revenue + Subsidies (Platform Total)</div>
      </div>

      {/* Card 4: Total GST Liability */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Total GST Liability</span>
          <Receipt className="w-4 h-4 text-[#d4af37]" />
        </div>
        <div className="text-2xl font-bold text-[#d4af37]">
          ₹{totalGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-gray-400 mt-1">Dynamic on paid orders (GSTR-1)</div>
      </div>
    </div>
  );
}
