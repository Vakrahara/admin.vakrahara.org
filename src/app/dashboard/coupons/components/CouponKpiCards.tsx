'use client';

import { Tag, Check, RefreshCw } from 'lucide-react';

interface CouponKpiCardsProps {
  totalCount: number;
  activeCount: number;
  totalUses: number;
}

export function CouponKpiCards({ totalCount, activeCount, totalUses }: CouponKpiCardsProps) {
  const cards = [
    { label: 'Total Coupons', value: totalCount, cls: 'text-blue-400 bg-blue-500/10', icon: Tag },
    { label: 'Active', value: activeCount, cls: 'text-emerald-400 bg-emerald-500/10', icon: Check },
    { label: 'Total Uses', value: totalUses, cls: 'text-[#d4af37] bg-[#d4af37]/10', icon: RefreshCw },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((k) => (
        <div key={k.label} className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{k.label}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${k.cls}`}>
              <k.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{k.value}</div>
        </div>
      ))}
    </div>
  );
}
