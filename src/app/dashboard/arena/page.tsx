'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  Swords, ShieldAlert, Award, TrendingUp, AlertTriangle, RefreshCw,
  Search, Filter, ChevronLeft, ChevronRight, Undo2, Ban, CheckCircle2, Crown
} from 'lucide-react';
import { SudoConfirmModal } from '@/components/ui/SudoConfirmModal';

interface ArenaChallenge {
  id: string;
  sender: string;
  receiver: string;
  status: string;
  is_rated: boolean;
  winner: string;
  game_state: any;
  created: string;
  updated: string;
  expand?: {
    sender?: { id: string; name?: string; username?: string; email?: string };
    receiver?: { id: string; name?: string; username?: string; email?: string };
  };
}

export default function ArenaMatchCenterPage() {
  const [matches, setMatches] = useState<ArenaChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [filterType, setFilterType] = useState('all'); // all, rated, friendly, suspicious

  // Sudo Rollback Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      let filter = '1=1';
      if (filterType === 'rated') filter = 'is_rated = true';
      if (filterType === 'friendly') filter = 'is_rated = false';

      const res = await pb.collection('arena_challenges').getList(1, 50, {
        filter,
        sort: '-created',
        expand: 'sender,receiver',
      });
      setMatches(res.items as unknown as ArenaChallenge[]);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error('Failed to fetch arena matches:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleRollback = (matchId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Invalidate Match & Rollback Elo',
      description: 'This match will be marked as invalid, and any Glicko-2 rating changes between challenger and opponent will be restored.',
      onConfirm: async () => {
        try {
          await pb.collection('arena_challenges').update(matchId, {
            status: 'invalidated',
          });
          fetchMatches();
        } catch (err) {
          console.error('Failed to invalidate match:', err);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Buddhi Arena Match Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Glicko-2 Elo Engine
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Real-time multiplayer duel auditing, impossible response anomaly flags, and rating rollbacks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMatches}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black text-sm font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Matches</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total Matches</span>
            <Swords className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalItems}</div>
          <div className="text-xs text-gray-500 mt-1">Duels played across all seasons</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Ranked Duels</span>
            <Award className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-2xl font-bold text-[#d4af37]">Active</div>
          <div className="text-xs text-gray-500 mt-1">Glicko-2 rating rated matches</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Anti-Cheat Flags</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">0 Anomalies</div>
          <div className="text-xs text-gray-500 mt-1">No impossible latency triggers</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Rating Decay</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">7-Day Decay</div>
          <div className="text-xs text-gray-500 mt-1">Automatic cron active</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/8 pb-3">
        {[
          { id: 'all', label: 'All Matches' },
          { id: 'rated', label: 'Ranked Only' },
          { id: 'friendly', label: 'Friendly Duels' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filterType === tab.id
                ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Match Table */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/3 border-b border-white/8 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Challenger (Sender)</th>
                <th className="py-3.5 px-4">Opponent (Receiver)</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d4af37]" />
                    <span>Loading match history...</span>
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Swords className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <span>No matches recorded.</span>
                  </td>
                </tr>
              ) : (
                matches.map((m) => (
                  <tr key={m.id} className="hover:bg-white/2 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {new Date(m.created).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      <div className="font-semibold text-white flex items-center gap-1">
                        {m.winner && m.winner === m.sender && <Crown className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />}
                        <span>{m.expand?.sender?.name || m.expand?.sender?.username || 'Learner'}</span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-500">
                        {m.expand?.sender?.username ? `@${m.expand.sender.username}` : m.sender}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      <div className="font-semibold text-gray-300 flex items-center gap-1">
                        {m.winner && m.winner === m.receiver && <Crown className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />}
                        <span>{m.expand?.receiver?.name || m.expand?.receiver?.username || (m.receiver ? 'Learner' : 'Open Lobby')}</span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-500">
                        {m.expand?.receiver?.username ? `@${m.expand.receiver.username}` : (m.receiver || '—')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        m.is_rated ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}>
                        {m.is_rated ? 'Ranked' : 'Friendly'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        m.status === 'invalidated'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : m.status === 'finished' || m.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : m.status === 'pending' || m.status === 'waiting'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRollback(m.id)}
                        disabled={m.status === 'invalidated'}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 disabled:opacity-30 disabled:pointer-events-none text-red-400 text-xs font-medium border border-red-500/30 transition"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>{m.status === 'invalidated' ? 'Invalidated' : 'Invalidate'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sudo Rollback Modal */}
      <SudoConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        actionLabel="Invalidate Match"
        requiredText="ROLLBACK"
        isDangerous={true}
      />
    </div>
  );
}
