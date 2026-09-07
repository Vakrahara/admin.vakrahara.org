'use client';

import React from 'react';
import { X, ToggleLeft, ToggleRight } from 'lucide-react';
import { CouponForm, PLAN_LABELS } from './types';

interface CouponFormCardProps {
  editingId: string | null;
  form: CouponForm;
  setForm: React.Dispatch<React.SetStateAction<CouponForm>>;
  saving: boolean;
  saveMsg: string;
  onSave: () => void;
  onClose: () => void;
}

export function CouponFormCard({
  editingId,
  form,
  setForm,
  saving,
  saveMsg,
  onSave,
  onClose,
}: CouponFormCardProps) {
  return (
    <div className="bg-[#0d0d15] border border-[#d4af37]/20 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          {editingId ? 'Edit Coupon' : 'Create Coupon'}
        </h2>
        <button type="button" onClick={onClose} className="p-1.5 text-gray-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Code</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="e.g. DIWALI25"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono uppercase placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Discount Type</label>
          <select
            value={form.discount_type}
            onChange={(e) =>
              setForm((f) => ({ ...f, discount_type: e.target.value as 'pct' | 'flat' }))
            }
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40"
          >
            <option value="pct">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">
            {form.discount_type === 'pct' ? 'Discount %' : 'Discount ₹'}
          </label>
          <input
            type="number"
            min={0}
            max={form.discount_type === 'pct' ? 100 : 99999}
            value={form.discount_value}
            onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Applicable Plan</label>
          <select
            value={form.applicable_plan}
            onChange={(e) => setForm((f) => ({ ...f, applicable_plan: e.target.value }))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40"
          >
            {Object.entries(PLAN_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Max Uses (0 = unlimited)</label>
          <input
            type="number"
            min={0}
            value={form.max_uses}
            onChange={(e) => setForm((f) => ({ ...f, max_uses: Number(e.target.value) }))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Valid From</label>
          <input
            type="date"
            value={form.valid_from}
            onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Valid Until</label>
          <input
            type="date"
            value={form.valid_until}
            onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40"
          />
        </div>
        <div className="flex items-center gap-3 pt-5">
          <button type="button" onClick={() => setForm((f) => ({ ...f, active: !f.active }))}>
            {form.active ? (
              <ToggleRight className="w-8 h-8 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-gray-600" />
            )}
          </button>
          <span className="text-sm text-gray-300">{form.active ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Coupon'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm"
        >
          Cancel
        </button>
        {saveMsg && <span className="text-sm">{saveMsg}</span>}
      </div>
    </div>
  );
}
