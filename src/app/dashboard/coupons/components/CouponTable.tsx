'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Coupon, PLAN_LABELS, fmtDiscount, fmtDate, getCouponStatus } from './types';

interface CouponTableProps {
  coupons: Coupon[];
  loading: boolean;
  totalItems: number;
  page: number;
  totalPages: number;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  planFilter: string;
  onPlanFilterChange: (val: string) => void;
  onToggle: (coupon: Coupon) => void;
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => Promise<void>;
  onPageChange: (newPage: number) => void;
}

export function CouponTable({
  coupons,
  loading,
  totalItems,
  page,
  totalPages,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  planFilter,
  onPlanFilterChange,
  onToggle,
  onEdit,
  onDelete,
  onPageChange,
}: CouponTableProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDeleteClick = async (id: string) => {
    setDeleting(id);
    try {
      await onDelete(id);
      setConfirmDelete(null);
    } finally {
      setDeleting(null);
    }
  };

  const displayedCoupons =
    statusFilter === 'all'
      ? coupons
      : coupons.filter((c) => getCouponStatus(c).label.toLowerCase() === statusFilter);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => onPlanFilterChange(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none"
          >
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
                {['Code', 'Discount', 'Plan', 'Uses', 'Valid From', 'Valid Until', 'Status', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-600">
                    Loading coupons...
                  </td>
                </tr>
              ) : displayedCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-600">
                    No coupons found
                  </td>
                </tr>
              ) : (
                displayedCoupons.map((c) => {
                  const st = getCouponStatus(c);
                  return (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-[#d4af37] tracking-wider">
                        {c.code}
                      </td>
                      <td className="px-5 py-3.5 text-white font-semibold">{fmtDiscount(c)}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 capitalize">
                        {PLAN_LABELS[c.applicable_plan] || c.applicable_plan}
                      </td>
                      <td className="px-5 py-3.5 text-gray-300">
                        {c.used_count} / {c.max_uses === 0 ? '∞' : c.max_uses}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{fmtDate(c.valid_from)}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{fmtDate(c.valid_until)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggle(c)}
                            title={c.active ? 'Deactivate' : 'Activate'}
                            className="p-1.5 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {c.active ? (
                              <ToggleRight className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(c)}
                            className="p-1.5 text-gray-600 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {confirmDelete === c.id ? (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(c.id)}
                                disabled={deleting === c.id}
                                className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-lg"
                              >
                                {deleting === c.id ? '...' : 'Confirm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDelete(null)}
                                className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-lg"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(c.id)}
                              className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/8">
            <span className="text-xs text-gray-500">
              {totalItems} coupons · Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
