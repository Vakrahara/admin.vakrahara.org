'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  Key, Plus, Search, ChevronLeft, ChevronRight, Copy, Check,
  Trash2, RefreshCw, CheckCircle2, Clock, XCircle, AlertTriangle
} from 'lucide-react';

interface ActivationKey {
  id: string;
  key: string;
  plan: string;
  duration_days: number;
  valid_until: string;
  used_by: string;
  used_at: string;
  campaign: string;
  note: string;
  created: string;
}

const PLAN_STYLES: Record<string, string> = {
  monthly:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  yearly:   'text-purple-400 bg-purple-500/10 border-purple-500/20',
  lifetime: 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded text-gray-600 hover:text-gray-300 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function generateKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `AMRIT-${seg()}-${seg()}-${seg()}`;
}

function getKeyStatus(k: ActivationKey): { label: string; cls: string } {
  if (k.used_by) return { label: 'Used', cls: 'bg-gray-500/10 text-gray-400' };
  if (k.valid_until && new Date(k.valid_until) < new Date()) return { label: 'Expired', cls: 'bg-red-500/10 text-red-400' };
  return { label: 'Available', cls: 'bg-emerald-500/10 text-emerald-400' };
}

export default function ActivationKeysPage() {
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // KPIs
  const [totalCount, setTotalCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [usedCount, setUsedCount] = useState(0);

  // Generate form
  const [showForm, setShowForm] = useState(false);
  const [genPlan, setGenPlan] = useState('yearly');
  const [genDuration, setGenDuration] = useState(365);
  const [genQty, setGenQty] = useState(1);
  const [genCampaign, setGenCampaign] = useState('');
  const [genValidUntil, setGenValidUntil] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState('');

  // Delete
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const buildFilter = useCallback(() => {
    const parts: string[] = [];
    if (planFilter !== 'all') parts.push(`plan = "${planFilter}"`);
    if (search.trim()) {
      const s = search.trim().replace(/"/g, '');
      parts.push(`key ~ "${s}"`);
    }
    // status filter done client-side as PB doesn't have computed fields
    return parts.join(' && ');
  }, [planFilter, search]);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const result = await pb.collection('activation_keys').getList<ActivationKey>(page, PER_PAGE, {
        filter: buildFilter() || undefined,
        sort: '-created',
      });
      setKeys(result.items);
      setTotalItems(result.totalItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, buildFilter]);

  const fetchKpis = useCallback(async () => {
    try {
      const [all, used] = await Promise.all([
        pb.collection('activation_keys').getList(1, 1, {}),
        pb.collection('activation_keys').getList(1, 1, { filter: 'used_by != ""' }),
      ]);
      setTotalCount(all.totalItems);
      setUsedCount(used.totalItems);
      setAvailableCount(all.totalItems - used.totalItems);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);
  useEffect(() => { fetchKpis(); }, [fetchKpis]);
  useEffect(() => { setPage(1); }, [statusFilter, planFilter, search]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenSuccess('');
    try {
      const created: string[] = [];
      for (let i = 0; i < genQty; i++) {
        const keyStr = generateKey();
        await pb.collection('activation_keys').create({
          key: keyStr,
          plan: genPlan,
          duration_days: genDuration,
          campaign: genCampaign,
          valid_until: genValidUntil || null,
          note: '',
          used_by: '',
          used_at: null,
        });
        created.push(keyStr);
      }
      setGenSuccess(`✅ ${genQty} key${genQty > 1 ? 's' : ''} generated!`);
      setShowForm(false);
      fetchKeys();
      fetchKpis();
    } catch (e: any) {
      setGenSuccess('❌ Error: ' + (e.message || 'Failed to generate'));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await pb.collection('activation_keys').delete(id);
      setConfirmDelete(null);
      fetchKeys();
      fetchKpis();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(totalItems / PER_PAGE);
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—';

  // Apply status filter client-side
  const displayedKeys = statusFilter === 'all' ? keys : keys.filter(k => {
    const s = getKeyStatus(k).label.toLowerCase();
    return s === statusFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Activation Keys</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and manage offline premium access keys</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setGenSuccess(''); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#d4af37]/20"
        >
          <Plus className="w-4 h-4" /> Generate Keys
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Keys', value: totalCount, color: 'text-blue-400 bg-blue-500/10', icon: Key },
          { label: 'Available', value: availableCount, color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Used', value: usedCount, color: 'text-gray-400 bg-gray-500/10', icon: Clock },
        ].map(k => (
          <div key={k.label} className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{k.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${k.color}`}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Generate Form */}
      {showForm && (
        <div className="bg-[#0d0d15] border border-[#d4af37]/20 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-[#d4af37]" /> Generate New Keys
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Plan</label>
              <select value={genPlan} onChange={e => setGenPlan(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Duration (days)</label>
              <input type="number" min={1} max={36500} value={genDuration} onChange={e => setGenDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Quantity</label>
              <input type="number" min={1} max={100} value={genQty} onChange={e => setGenQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Campaign / Label</label>
              <input type="text" placeholder="e.g. Diwali2025" value={genCampaign} onChange={e => setGenCampaign(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Valid Until (optional)</label>
              <input type="date" value={genValidUntil} onChange={e => setGenValidUntil(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {generating ? 'Generating...' : `Generate ${genQty} Key${genQty > 1 ? 's' : ''}`}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-all">
              Cancel
            </button>
            {genSuccess && <span className="text-sm text-emerald-400">{genSuccess}</span>}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search key code..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none">
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
          </select>
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none">
            <option value="all">All Plans</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="lifetime">Lifetime</option>
          </select>
          <button onClick={() => { fetchKeys(); fetchKpis(); }} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {['Key', 'Plan', 'Duration', 'Status', 'Valid Until', 'Campaign', 'Used By', 'Used At', ''].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-gray-600">Loading keys...</td></tr>
              ) : displayedKeys.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-gray-600">No activation keys found</td></tr>
              ) : displayedKeys.map(k => {
                const st = getKeyStatus(k);
                return (
                  <tr key={k.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-[#d4af37] font-semibold tracking-wider">{k.key}</span>
                        <CopyButton text={k.key} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${PLAN_STYLES[k.plan] || 'text-gray-400 bg-white/5 border-white/10'}`}>
                        {k.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300 whitespace-nowrap">{k.duration_days}d</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{fmtDate(k.valid_until)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{k.campaign || '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                      {k.used_by ? <>{k.used_by.slice(0, 10)}…<CopyButton text={k.used_by} /></> : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{fmtDate(k.used_at)}</td>
                    <td className="px-5 py-3.5">
                      {!k.used_by && (
                        confirmDelete === k.id ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDelete(k.id)} disabled={deleting === k.id}
                              className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                              {deleting === k.id ? '...' : 'Confirm'}
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-lg">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(k.id)}
                            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/8">
            <span className="text-xs text-gray-500">{totalItems} keys · Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
