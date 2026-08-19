'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  ToggleLeft, ToggleRight, Sliders, Plus, RefreshCw, CheckCircle2,
  AlertTriangle, Filter, Search, Shield, Sparkles, Tag
} from 'lucide-react';
import { SudoConfirmModal } from '@/components/ui/SudoConfirmModal';

interface FeatureFlag {
  id: string;
  flag_key: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_cohort: string;
  created: string;
  updated: string;
}

export default function ExperimentsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCohort, setNewCohort] = useState('all');
  const [newRollout, setNewRollout] = useState(100);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pb.collection('feature_flags').getList(1, 50, {
        sort: '-created',
      });
      setFlags(res.items as unknown as FeatureFlag[]);
    } catch (err) {
      console.error('Failed to fetch feature flags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await pb.collection('feature_flags').update(flag.id, {
        is_enabled: !flag.is_enabled,
      });
      fetchFlags();
    } catch (err) {
      console.error('Failed to toggle flag:', err);
    }
  };

  const handleRolloutChange = async (flagId: string, percentage: number) => {
    try {
      await pb.collection('feature_flags').update(flagId, {
        rollout_percentage: percentage,
      });
      fetchFlags();
    } catch (err) {
      console.error('Failed to update rollout:', err);
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    try {
      await pb.collection('feature_flags').create({
        flag_key: newKey.trim(),
        description: newDesc.trim(),
        is_enabled: true,
        rollout_percentage: newRollout,
        target_cohort: newCohort,
      });
      setIsCreating(false);
      setNewKey('');
      setNewDesc('');
      fetchFlags();
    } catch (err) {
      console.error('Failed to create flag:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Feature Flags & Experiments</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              Remote Switchboard
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Dynamic killswitches, percentage rollouts, and cohort targeting without client app releases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Flag</span>
          </button>
        </div>
      </div>

      {/* Flag Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#d4af37]" />
          <span>Loading feature switchboard...</span>
        </div>
      ) : flags.length === 0 ? (
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl py-16 text-center text-gray-500">
          <Sliders className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <div className="text-base font-bold text-white">No Feature Flags Defined</div>
          <p className="text-xs text-gray-400 mt-1">Create your first dynamic remote toggle above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">{flag.flag_key}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      {flag.target_cohort || 'all'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{flag.description || 'No description provided.'}</p>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => handleToggle(flag)}
                  className={`p-1.5 rounded-xl transition ${
                    flag.is_enabled
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                  }`}
                >
                  {flag.is_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              {/* Percentage Rollout Slider */}
              <div className="pt-2 space-y-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Rollout Percentage:</span>
                  <span className="font-mono font-bold text-[#d4af37]">{flag.rollout_percentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={flag.rollout_percentage}
                  onChange={(e) => handleRolloutChange(flag.id, Number(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Flag Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0d0d15] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Create Feature Flag</h2>
            <form onSubmit={handleCreateFlag} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Flag Key (camelCase or snake_case)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. enable_buddhi_arena_v2"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Explain the purpose of this experiment or killswitch..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Target Cohort</label>
                  <select
                    value={newCohort}
                    onChange={(e) => setNewCohort(e.target.value)}
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50"
                  >
                    <option value="all">All Students (Global)</option>
                    <option value="premium_only">Premium Subscribers</option>
                    <option value="internal_testers">Internal Testers</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Initial Rollout %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newRollout}
                    onChange={(e) => setNewRollout(Number(e.target.value))}
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black text-xs font-bold transition"
                >
                  Deploy Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
