'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  MapPin, Globe2, Shield, Crown, RefreshCw, Trophy,
  Flame, Award, Search, Users, Swords
} from 'lucide-react';

interface Territory {
  id: string;
  name: string;
  sanskrit_name: string;
  region: string;
  ruling_guild: string;
  ruling_user: string;
  points_required: number;
  total_conquests: number;
  bonus_xp_multiplier: number;
  created: string;
  updated: string;
}

export default function JambudvipaControlPage() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTerritories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pb.collection('territories').getList(1, 50, {
        sort: 'name',
      });
      setTerritories(res.items as unknown as Territory[]);
    } catch (err) {
      console.error('Failed to fetch territories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerritories();
  }, [fetchTerritories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Jambudvipa Territory Control</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              Vedic Map Engine
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Territory conquest ledger, regional XP multipliers, and guild sovereignty management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTerritories}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black text-sm font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Territories</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total Territories</span>
            <Globe2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{territories.length || 16} Realms</div>
          <div className="text-xs text-gray-500 mt-1">Aryavarta, Magadha, Dravida, etc.</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Territory Reset</span>
            <Crown className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-2xl font-bold text-[#d4af37]">Weekly Cron</div>
          <div className="text-xs text-gray-500 mt-1">Every Sunday at midnight</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">XP Multipliers</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">1.2x – 2.0x</div>
          <div className="text-xs text-gray-500 mt-1">Active regional learning boost</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Conquest Engine</span>
            <Swords className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">Automated</div>
          <div className="text-xs text-gray-500 mt-1">Buddhi Arena integration</div>
        </div>
      </div>

      {/* Territory Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#d4af37]" />
          <span>Loading territory map...</span>
        </div>
      ) : territories.length === 0 ? (
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl py-16 text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <div className="text-base font-bold text-white">No Territories Synchronized</div>
          <p className="text-xs text-gray-400 mt-1">Territories are populated via the weekly conquest cron.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {territories.map((t) => (
            <div
              key={t.id}
              className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{t.name}</h3>
                  <div className="text-xs text-[#d4af37] font-semibold">{t.sanskrit_name}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {t.bonus_xp_multiplier || 1.5}x XP
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Ruling Sovereign:</span>
                  <span className="font-mono text-white">{t.ruling_user || 'Unconquered'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Points Threshold:</span>
                  <span className="font-mono text-[#d4af37]">{t.points_required || 1000}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
