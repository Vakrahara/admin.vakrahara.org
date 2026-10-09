'use client';

import { Users, Activity, Clock, Globe, TrendingUp } from 'lucide-react';
import { UserStats } from '../types';

interface ActivityKpisProps {
  stats: UserStats | null;
}

export function ActivityKpis({ stats }: ActivityKpisProps) {
  const totalUsers = stats?.totalUsers || 0;
  const active24h = stats?.activeStats?.active24h || 0;
  const active7d = stats?.activeStats?.active7d || 0;
  const inactive = stats?.activeStats?.inactive || 0;

  const activeRate = totalUsers > 0
    ? Math.round(((active24h + active7d) / totalUsers) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Enrolled */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Total Enrolled
          </span>
          <div className="text-3xl font-extrabold text-white mt-1.5">{totalUsers}</div>
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#d4af37]" />
            Lifetime registrations
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37]">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Daily Active (24h) */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
            Daily Active (24h)
          </span>
          <div className="text-3xl font-extrabold text-white mt-1.5">{active24h}</div>
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Users sync'd today
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Activity className="w-6 h-6" />
        </div>
      </div>

      {/* Weekly Active (7d) */}
      <div className="glass-panel-gold p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest block">
            Weekly Active (7d)
          </span>
          <div className="text-3xl font-extrabold text-white mt-1.5">{active7d}</div>
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
            {activeRate}% activity index
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* Inactive (>30d) */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
            Inactive (&gt;30d)
          </span>
          <div className="text-3xl font-extrabold text-white mt-1.5">{inactive}</div>
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-rose-400" />
            Drop-offs needing nudge
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Globe className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
