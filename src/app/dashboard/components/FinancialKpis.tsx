'use client';

import { Activity, Sparkles, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { UserStats } from '../types';

interface FinancialKpisProps {
  stats: UserStats | null;
}

export function FinancialKpis({ stats }: FinancialKpisProps) {
  const totalRevenue = stats?.totalRevenue || 0;
  const activeSubscribers = stats?.activeSubscribers || 0;
  const mrr = stats?.mrr || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Total Revenue */}
      <div className="glass-panel-gold p-6 rounded-2xl flex items-center justify-between border-[#d4af37]/30">
        <div>
          <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest block">
            Total Revenue
          </span>
          <div className="text-3xl font-extrabold text-white mt-1.5">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-[#d4af37]/80 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            All-time processed volume
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
          <Activity className="w-6 h-6" />
        </div>
      </div>

      {/* Active Subscribers */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-emerald-500/20">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
            Active Subscribers
          </span>
          <div className="text-3xl font-extrabold text-white mt-1.5">
            {activeSubscribers}
          </div>
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            Currently premium
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* Estimated MRR */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-blue-500/20">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
            Estimated MRR
          </span>
          <div className="text-3xl font-extrabold text-white mt-1.5">
            ₹{mrr.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            Monthly recurring revenue
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
