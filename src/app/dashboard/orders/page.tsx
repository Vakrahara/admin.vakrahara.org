'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  ShoppingBag, CheckCircle2, Clock, RefreshCw,
  Search, ChevronLeft, ChevronRight, IndianRupee, Download, XCircle
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import {
  Order, STATUS_STYLES, PLAN_STYLES,
  KpiCard, CopyButton, GatewayBadge, fmtRupees, fmtDate
} from './components/OrderComponents';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [gateways, setGateways] = useState<string[]>([]);

  // KPI totals
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const buildFilter = useCallback(() => {
    const parts: string[] = [];
    if (statusFilter !== 'all') parts.push(`status = "${statusFilter}"`);
    if (planFilter !== 'all') parts.push(`plan = "${planFilter}"`);
    if (gatewayFilter !== 'all') parts.push(`gateway = "${gatewayFilter}"`);
    if (search.trim()) {
      const s = search.trim().replace(/"/g, '');
      parts.push(`(order_id ~ "${s}" || user_id ~ "${s}" || gateway_payment_id ~ "${s}")`);
    }
    return parts.join(' && ');
  }, [statusFilter, planFilter, gatewayFilter, search]);

  const fetchGateways = useCallback(async () => {
    try {
      const result = await pb.collection('orders').getFullList({ fields: 'gateway' });
      const uniqueGateways = Array.from(new Set(result.map((o: any) => o.gateway).filter(Boolean)));
      setGateways(uniqueGateways as string[]);
    } catch (e) {
      console.error('Failed to fetch gateways', e);
    }
  }, []);

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

  const fetchKpis = useCallback(async () => {
    try {
      const [allRes, paidRes, pendingRes] = await Promise.all([
        pb.collection('orders').getList(1, 1, {}),
        pb.collection('orders').getFullList({ filter: 'status = "paid"', fields: 'amount_paise' }),
        pb.collection('orders').getList(1, 1, { filter: 'status = "pending"' }),
      ]);
      setTotalCount(allRes.totalItems);
      setPaidCount(paidRes.length);
      setPendingCount(pendingRes.totalItems);
      const rev = paidRes.reduce((sum, o) => sum + (o.amount_paise || 0), 0);
      setTotalRevenue(rev);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => { fetchGateways(); }, [fetchGateways]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchKpis(); }, [fetchKpis]);
  useEffect(() => { setPage(1); }, [statusFilter, planFilter, gatewayFilter, search]);

  const totalPages = Math.ceil(totalItems / PER_PAGE);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders & Subscriptions</h1>
          <p className="text-sm text-gray-500 mt-1">Transactions across multiple gateways</p>
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
                Gateway: o.gateway || 'cashfree',
                CouponUsed: o.coupon_used || '',
                gateway_payment_id: o.gateway_payment_id || o.order_id,
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
            onClick={() => { fetchOrders(); fetchKpis(); fetchGateways(); }}
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
            value={gatewayFilter}
            onChange={e => setGatewayFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#d4af37]/40"
          >
            <option value="all">All Gateways</option>
            {gateways.map(g => (
              <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1).replace('_', ' ')}</option>
            ))}
          </select>
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
                {['Order ID', 'User ID', 'Gateway', 'Plan', 'Amount', 'Status', 'gateway_payment_id', 'Created'].map(h => (
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
                const paymentId = o.gateway_payment_id || (o.gateway === 'google_play' ? o.order_id : '');
                return (
                  <tr key={o.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-300 whitespace-nowrap">
                      {o.order_id.slice(0, 24)}…<CopyButton text={o.order_id} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400 whitespace-nowrap">
                      {o.user_id.slice(0, 12)}…<CopyButton text={o.user_id} />
                    </td>
                    <td className="px-5 py-3.5">
                      <GatewayBadge gateway={o.gateway} />
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
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {paymentId ? <>{paymentId.slice(0, 16)}…<CopyButton text={paymentId} /></> : <span className="text-gray-700">—</span>}
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

      {/* Gateway reconciliation note */}
      <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
        <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
        <span>Dual Gateway Reconciliation: Cashfree transactions settle T+1 via UPI/Cards. Google Play subscriptions auto-renew on Play Console and sync via PocketBase play_billing hook.</span>
      </div>
    </div>
  );
}
