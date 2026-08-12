'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  Tag, Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2,
  RefreshCw, ToggleLeft, ToggleRight, X, Check
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_pct: number;
  flat_discount_paise: number;
  applicable_plan: string;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
  created: string;
}

type CouponForm = {
  code: string;
  discount_type: 'pct' | 'flat';
  discount_value: number;
  applicable_plan: string;
  max_uses: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
};

const PLAN_LABELS: Record<string, string> = { all: 'All Plans', monthly: 'Monthly', yearly: 'Yearly', lifetime: 'Lifetime' };

function fmtDiscount(c: Coupon) {
  if (c.discount_pct > 0) return `${c.discount_pct}% off`;
  if (c.flat_discount_paise > 0) return `₹${(c.flat_discount_paise / 100).toFixed(0)} off`;
  return '—';
}

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—';
}

function getCouponStatus(c: Coupon) {
  if (!c.active) return { label: 'Inactive', cls: 'bg-gray-500/10 text-gray-500' };
  if (c.valid_until && new Date(c.valid_until) < new Date()) return { label: 'Expired', cls: 'bg-red-500/10 text-red-400' };
  if (c.valid_from && new Date(c.valid_from) > new Date()) return { label: 'Scheduled', cls: 'bg-blue-500/10 text-blue-400' };
  return { label: 'Active', cls: 'bg-emerald-500/10 text-emerald-400' };
}

const EMPTY_FORM: CouponForm = {
  code: '', discount_type: 'pct', discount_value: 20,
  applicable_plan: 'all', max_uses: 0, valid_from: '', valid_until: '', active: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // KPIs
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [totalUses, setTotalUses] = useState(0);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const buildFilter = useCallback(() => {
    const parts: string[] = [];
    if (planFilter !== 'all') parts.push(`applicable_plan = "${planFilter}" || applicable_plan = "all"`);
    if (search.trim()) parts.push(`code ~ "${search.trim().replace(/"/g, '')}"`);
    return parts.join(' && ');
  }, [planFilter, search]);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const result = await pb.collection('coupons').getList<Coupon>(page, PER_PAGE, {
        filter: buildFilter() || undefined,
        sort: '-created',
      });
      setCoupons(result.items);
      setTotalItems(result.totalItems);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, buildFilter]);

  const fetchKpis = useCallback(async () => {
    try {
      const [all, active] = await Promise.all([
        pb.collection('coupons').getList(1, 500, { fields: 'id,active,used_count' }),
        pb.collection('coupons').getList(1, 1, { filter: 'active = true' }),
      ]);
      setTotalCount(all.totalItems);
      setActiveCount(active.totalItems);
      setTotalUses(all.items.reduce((s, c) => s + (c.used_count || 0), 0));
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);
  useEffect(() => { fetchKpis(); }, [fetchKpis]);
  useEffect(() => { setPage(1); }, [statusFilter, planFilter, search]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setSaveMsg(''); setShowForm(true); };
  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      discount_type: c.discount_pct > 0 ? 'pct' : 'flat',
      discount_value: c.discount_pct > 0 ? c.discount_pct : c.flat_discount_paise / 100,
      applicable_plan: c.applicable_plan,
      max_uses: c.max_uses,
      valid_from: c.valid_from ? c.valid_from.slice(0, 10) : '',
      valid_until: c.valid_until ? c.valid_until.slice(0, 10) : '',
      active: c.active,
    });
    setEditingId(c.id);
    setSaveMsg('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    const code = form.code.trim().toUpperCase();
    if (!code) { setSaveMsg('❌ Code is required'); setSaving(false); return; }
    const data = {
      code,
      discount_pct: form.discount_type === 'pct' ? form.discount_value : 0,
      flat_discount_paise: form.discount_type === 'flat' ? Math.round(form.discount_value * 100) : 0,
      applicable_plan: form.applicable_plan,
      max_uses: form.max_uses,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      active: form.active,
    };
    try {
      if (editingId) {
        await pb.collection('coupons').update(editingId, data);
      } else {
        await pb.collection('coupons').create({ ...data, used_count: 0 });
      }
      setSaveMsg('✅ Saved!');
      setTimeout(() => { setShowForm(false); fetchCoupons(); fetchKpis(); }, 800);
    } catch (e: any) {
      setSaveMsg('❌ ' + (e.message || 'Error saving'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: Coupon) => {
    try {
      await pb.collection('coupons').update(c.id, { active: !c.active });
      fetchCoupons();
      fetchKpis();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await pb.collection('coupons').delete(id);
      setConfirmDelete(null);
      fetchCoupons();
      fetchKpis();
    } catch (e) { console.error(e); }
    finally { setDeleting(null); }
  };

  const totalPages = Math.ceil(totalItems / PER_PAGE);
  const displayedCoupons = statusFilter === 'all' ? coupons : coupons.filter(c => {
    const s = getCouponStatus(c).label.toLowerCase();
    return s === statusFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Discount codes for premium plans</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#d4af37]/20">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Coupons', value: totalCount, cls: 'text-blue-400 bg-blue-500/10', icon: Tag },
          { label: 'Active',        value: activeCount, cls: 'text-emerald-400 bg-emerald-500/10', icon: Check },
          { label: 'Total Uses',    value: totalUses,   cls: 'text-[#d4af37] bg-[#d4af37]/10', icon: RefreshCw },
        ].map(k => (
          <div key={k.label} className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{k.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${k.cls}`}><k.icon className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-white">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-[#0d0d15] border border-[#d4af37]/20 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Code</label>
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. DIWALI25"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono uppercase placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Discount Type</label>
              <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as 'pct' | 'flat' }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40">
                <option value="pct">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">{form.discount_type === 'pct' ? 'Discount %' : 'Discount ₹'}</label>
              <input type="number" min={0} max={form.discount_type === 'pct' ? 100 : 99999} value={form.discount_value}
                onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Applicable Plan</label>
              <select value={form.applicable_plan} onChange={e => setForm(f => ({ ...f, applicable_plan: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40">
                {Object.entries(PLAN_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Max Uses (0 = unlimited)</label>
              <input type="number" min={0} value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Valid From</label>
              <input type="date" value={form.valid_from} onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Valid Until</label>
              <input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <button onClick={() => setForm(f => ({ ...f, active: !f.active }))}>
                {form.active
                  ? <ToggleRight className="w-8 h-8 text-emerald-400" />
                  : <ToggleLeft className="w-8 h-8 text-gray-600" />}
              </button>
              <span className="text-sm text-gray-300">{form.active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Coupon'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm">Cancel</button>
            {saveMsg && <span className="text-sm">{saveMsg}</span>}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search coupon code..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none">
            <option value="all">All Plans</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {['Code', 'Discount', 'Plan', 'Uses', 'Valid From', 'Valid Until', 'Status', ''].map(h => (
                  <th key={h + Math.random()} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-600">Loading coupons...</td></tr>
              ) : displayedCoupons.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-600">No coupons found</td></tr>
              ) : displayedCoupons.map(c => {
                const st = getCouponStatus(c);
                return (
                  <tr key={c.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-sm font-bold text-[#d4af37] tracking-wider">{c.code}</td>
                    <td className="px-5 py-3.5 text-white font-semibold">{fmtDiscount(c)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 capitalize">{PLAN_LABELS[c.applicable_plan] || c.applicable_plan}</td>
                    <td className="px-5 py-3.5 text-gray-300">
                      {c.used_count} / {c.max_uses === 0 ? '∞' : c.max_uses}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{fmtDate(c.valid_from)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{fmtDate(c.valid_until)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(c)} title={c.active ? 'Deactivate' : 'Activate'}
                          className="p-1.5 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          {c.active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(c)}
                          className="p-1.5 text-gray-600 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {confirmDelete === c.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                              className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-lg">
                              {deleting === c.id ? '...' : 'Confirm'}
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-lg">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(c.id)}
                            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/8">
            <span className="text-xs text-gray-500">{totalItems} coupons · Page {page} of {totalPages}</span>
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
