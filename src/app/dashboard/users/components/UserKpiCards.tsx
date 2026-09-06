'use client';

import React from 'react';
import { UserCheck, GraduationCap, Award, Crown } from 'lucide-react';

interface UserKpiCardsProps {
  totalItems: number;
}

export function UserKpiCards({ totalItems }: UserKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Total Registered</span>
          <div className="text-3xl font-extrabold text-white mt-1">{totalItems}</div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37]">
          <UserCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Learners</span>
          <div className="text-3xl font-extrabold text-white mt-1">{totalItems}</div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <GraduationCap className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Teachers</span>
          <div className="text-3xl font-extrabold text-white mt-1">1</div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Award className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel-gold p-6 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest block">Super Admins</span>
          <div className="text-3xl font-extrabold text-[#d4af37] mt-1">1</div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
          <Crown className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
