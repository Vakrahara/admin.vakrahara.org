'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { Key, Plus, Search, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { ActivationKey, getKeyStatus } from './components/types';
import { ActivationKeyGenerationModal } from './components/ActivationKeyGenerationModal';
import { ActivationKeysTable } from './components/ActivationKeysTable';

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
  const [genSuccess, setGenSuccess] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const buildFilter = useCallback(() => {
    const parts: string[] = [];
    if (planFilter !== 'all') parts.push(`plan = "${planFilter}"`);
    if (search.trim()) {
      const s = search.trim().replace(/"/g, '');
      parts.push(`key ~ "${s}"`);
    }
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
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);
  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);
  useEffect(() => {
    setPage(1);
  }, [statusFilter, planFilter, search]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await pb.collection('activation_keys').delete(id);
      fetchKeys();
      fetchKpis();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  const displayedKeys =
    statusFilter === 'all'
      ? keys
      : keys.filter((k) => {
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
          onClick={() => {
            setShowForm(!showForm);
            setGenSuccess('');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#d4af37]/20"
        >
          <Plus className="w-4 h-4" /> Generate Keys
        </button>
      </div>

      {genSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
          {genSuccess}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Keys', value: totalCount, color: 'text-blue-400 bg-blue-500/10', icon: Key },
          { label: 'Available', value: availableCount, color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Used', value: usedCount, color: 'text-gray-400 bg-gray-500/10', icon: Clock },
        ].map((k) => (
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

      {/* Generate Form Modal */}
      {showForm && (
        <ActivationKeyGenerationModal
          onSuccess={(msg) => {
            setGenSuccess(msg);
            fetchKeys();
            fetchKpis();
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Filters */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search key code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none"
          >
            <option value="all">All Plans</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="lifetime">Lifetime</option>
          </select>
          <button
            onClick={() => {
              fetchKeys();
              fetchKpis();
            }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keys Table */}
      <ActivationKeysTable
        keys={displayedKeys}
        loading={loading}
        totalItems={totalItems}
        page={page}
        perPage={PER_PAGE}
        onPageChange={setPage}
        onDelete={handleDelete}
        deletingId={deleting}
      />
    </div>
  );
}
