'use client';

import { IndianRupee, Receipt, CreditCard } from 'lucide-react';

interface FinanceKpiCardsProps {
  totalRevenue: number;
  cashfreeRevenue: number;
  playRevenue: number;
  totalGST: number;
}

export function FinanceKpiCards({
  totalRevenue,
  cashfreeRevenue,
  playRevenue,
  totalGST,
}: FinanceKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total Gross Revenue</span>
          <IndianRupee className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-white">
          ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-gray-500 mt-1">Cumulative settled orders</div>
      </div>

      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Cashfree UPI Volume</span>
          <CreditCard className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-emerald-400">
          ₹{cashfreeRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-gray-500 mt-1">Web prepaid passes</div>
      </div>

      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Google Play Volume</span>
          <CreditCard className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-indigo-400">
          ₹{playRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-gray-500 mt-1">Android app subscriptions</div>
      </div>

      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total GST Liability</span>
          <Receipt className="w-4 h-4 text-[#d4af37]" />
        </div>
        <div className="text-2xl font-bold text-[#d4af37]">
          ₹{totalGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-gray-500 mt-1">Dynamic from item rates</div>
      </div>
    </div>
  );
}
