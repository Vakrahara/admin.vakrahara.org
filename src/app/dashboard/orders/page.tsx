'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  ShoppingBag, TrendingUp, Clock, CheckCircle2, XCircle, RefreshCw,
  Search, Filter, ChevronLeft, ChevronRight, IndianRupee, Copy, Check, Download
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface Order {
  id: string;
  order_id: string;
  user_id: string;
  plan: string;
  amount_paise: number;
  status: string;
  coupon_used: string;
  gateway: string;
  cf_order_id: string;
  cf_payment_id: string;
  processed_at: string;
  created: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  paid:     { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  pending:  { bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  failed:   { bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-400' },
  refunded: { bg: 'bg-gray-500/10',    text: 'text-gray-400',    dot: 'bg-gray-400' },
};

const PLAN_STYLES: Record<string, string> = {
  monthly:  'text-blue-400 bg-blue-500/10',
  yearly:   'text-purple-400 bg-purple-500/10',
  lifetime: 'text-[#d4af37] bg-[#d4af37]/10',
};

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="ml-1 p-0.5 text-gray-600 hover:text-gray-300 transition-colors">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // KPI totals
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const buildFilter = useCallback(() => {
    const parts: string[] = [];
    if (statusFilter !== 'all') parts.push(`status = "${statusFilter}"`);
    if (planFilter !== 'all') parts.push(`plan = "${planFilter}"`);
    if (search.trim()) {
      const s = search.trim().replace(/"/g, '');
      parts.push(`(order_id ~ "${s}" || user_id ~ "${s}" || cf_payment_id ~ "${s}")`);
    }
    return parts.join(' && ');
  }, [statusFilter, planFilter, search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const filter = buildFilter();
      const result = await pb.collection('orders').getList<Order>(page, PER_PAGE, {
        filter: filter || undefined,
        sort: '-created',
      });
      setOrders(result.items);
      setTotalItems(result.totalItems);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setLoading(false);
    }
  }, [page, buildFilter]);

  // Fetch KPI stats (all paid orders)
  const fetchKpis = useCallback(async () => {
    try {
      const [allRes, paidRes, pendingRes] = await Promise.all([
        pb.collection('orders').getList(1, 1, {}),
        pb.collection('orders').getList(1, 500, { filter: 'status = "paid"', fields: 'amount_paise' }),
        pb.collection('orders').getList(1, 1, { filter: 'status = "pending"' }),
      ]);
      setTotalCount(allRes.totalItems);
      setPaidCount(paidRes.totalItems);
      setPendingCount(pendingRes.totalItems);
      const rev = paidRes.items.reduce((sum, o) => sum + (o.amount_paise || 0), 0);
      setTotalRevenue(rev);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchKpis(); }, [fetchKpis]);
  useEffect(() => { setPage(1); }, [statusFilter, planFilter, search]);

  const totalPages = Math.ceil(totalItems / PER_PAGE);
  const fmtRupees = (paise: number) => '₹' + (paise / 100).toLocaleString('en-IN');
  const fmtDate = (d: string) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">All payment transactions via Cashfree</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const exportData = orders.map(o => ({
                OrderID: o.order_id,
                UserID: o.user_id,
                Plan: o.plan,
                AmountINR: o.amount_paise / 100,
                Status: o.status,
                CouponUsed: o.coupon_used || '',
                Gateway: o.gateway,
                CFPaymentID: o.cf_payment_id || '',
                ProcessedAt: o.processed_at || '',
                CreatedAt: o.created,
              }));
              exportToCsv(exportData, `orders_export_${new Date().toISOString().slice(0,10)}.csv`);
            }}
            disabled={orders.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => { fetchOrders(); fetchKpis(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={IndianRupee} label="Total Revenue" value={fmtRupees(totalRevenue)} sub="from paid orders" color="bg-emerald-500/10 text-emerald-400" />
        <KpiCard icon={ShoppingBag} label="Total Orders" value={String(totalCount)} color="bg-blue-500/10 text-blue-400" />
        <KpiCard icon={CheckCircle2} label="Paid" value={String(paidCount)} color="bg-[#d4af37]/10 text-[#d4af37]" />
        <KpiCard icon={Clock} label="Pending" value={String(pendingCount)} color="bg-amber-500/10 text-amber-400" />
      </div>

      {/* Filters */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by order ID, user ID, payment ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#d4af37]/40"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#d4af37]/40"
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
                {['Order ID', 'User ID', 'Plan', 'Amount', 'Status', 'Coupon', 'CF Payment ID', 'Created'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-600">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-600">No orders found</td></tr>
              ) : orders.map(o => {
                const st = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
                return (
                  <tr key={o.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-300 whitespace-nowrap">
                      {o.order_id.slice(0, 24)}…<CopyButton text={o.order_id} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400 whitespace-nowrap">
                      {o.user_id.slice(0, 12)}…<CopyButton text={o.user_id} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${PLAN_STYLES[o.plan] || 'text-gray-400 bg-white/5'}`}>
                        {o.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white font-semibold whitespace-nowrap">
                      {fmtRupees(o.amount_paise)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {o.coupon_used || <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {o.cf_payment_id
                        ? <>{o.cf_payment_id.slice(0, 14)}…<CopyButton text={o.cf_payment_id} /></>
                        : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{fmtDate(o.created)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/8">
            <span className="text-xs text-gray-500">{totalItems} orders · Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refund note */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-400">
        <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>To issue a refund, go to your <strong>Cashfree Dashboard → Orders → Refunds</strong>. After processing, manually update the order status here if needed.</span>
      </div>
    </div>
  );
}
