'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { Plus } from 'lucide-react';
import { Coupon, CouponForm, EMPTY_FORM } from './components/types';
import { CouponKpiCards } from './components/CouponKpiCards';
import { CouponFormCard } from './components/CouponFormCard';
import { CouponTable } from './components/CouponTable';

const PER_PAGE = 20;

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);

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
        requestKey: null,
      });
      setCoupons(result.items);
      setTotalItems(result.totalItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, buildFilter]);

  const fetchKpis = useCallback(async () => {
    try {
      const [all, active] = await Promise.all([
        pb.collection('coupons').getList(1, 500, { fields: 'id,active,used_count', requestKey: null }),
        pb.collection('coupons').getList(1, 1, { filter: 'active = true', requestKey: null }),
      ]);
      setTotalCount(all.totalItems);
      setActiveCount(active.totalItems);
      setTotalUses(all.items.reduce((s, c) => s + (c.used_count || 0), 0));
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, planFilter, search]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSaveMsg('');
    setShowForm(true);
  };

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
    if (!code) {
      setSaveMsg('❌ Code is required');
      setSaving(false);
      return;
    }
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
      setTimeout(() => {
        setShowForm(false);
        fetchCoupons();
        fetchKpis();
      }, 800);
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
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('coupons').delete(id);
      fetchCoupons();
      fetchKpis();
    } catch (e) {
      console.error(e);
    }
  };

  const totalPages = Math.ceil(totalItems / PER_PAGE);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Discount codes for premium plans</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#d4af37]/20"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* KPIs */}
      <CouponKpiCards totalCount={totalCount} activeCount={activeCount} totalUses={totalUses} />

      {/* Create/Edit Form */}
      {showForm && (
        <CouponFormCard
          editingId={editingId}
          form={form}
          setForm={setForm}
          saving={saving}
          saveMsg={saveMsg}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Coupons Table with Filters and Pagination */}
      <CouponTable
        coupons={coupons}
        loading={loading}
        totalItems={totalItems}
        page={page}
        totalPages={totalPages}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        planFilter={planFilter}
        onPlanFilterChange={setPlanFilter}
        onToggle={handleToggle}
        onEdit={openEdit}
        onDelete={handleDelete}
        onPageChange={setPage}
      />
    </div>
  );
}
