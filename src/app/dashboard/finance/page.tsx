'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  IndianRupee, Receipt, Download, RefreshCw, FileSpreadsheet,
  CheckCircle2, AlertTriangle, ArrowDownRight, CreditCard, Undo2
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { SudoConfirmModal } from '@/components/ui/SudoConfirmModal';

interface Order {
  id: string;
  order_id: string;
  user_id: string;
  plan: string;
  amount_paise: number;
  status: string;
  gateway: string;
  cf_order_id: string;
  cf_payment_id: string;
  created: string;
}

interface OrderItem {
  id: string;
  order: string;
  hsn_sac_code: string;
  gst_rate: number;
  amount_paise: number;
}

interface GSTBreakdown {
  hsn_sac_code: string;
  rate: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
}

export default function FinanceGSTPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [gstBreakdowns, setGstBreakdowns] = useState<GSTBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [cashfreeRevenue, setCashfreeRevenue] = useState(0);
  const [playRevenue, setPlayRevenue] = useState(0);
  const [totalGST, setTotalGST] = useState(0);

  const [refundModal, setRefundModal] = useState<{ isOpen: boolean; order: Order | null }>({
    isOpen: false,
    order: null,
  });

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pb.collection('orders').getList(1, 500, { sort: '-created' });
      const items = res.items as unknown as Order[];
      setOrders(items);

      // fetch order items for GST breakdown
      const itemsRes = await pb.collection('order_items').getFullList({ expand: 'order' });
      const orderItems = itemsRes as unknown as OrderItem[];

      let rev = 0;
      let cfRev = 0;
      let playRev = 0;
      
      const paidOrderIds = new Set(items.filter(i => i.status === 'paid').map(i => i.id));
      
      const breakdownMap = new Map<string, GSTBreakdown>();
      let totalGstCalc = 0;

      for (const item of items) {
        if (item.status === 'paid') {
          const amt = item.amount_paise / 100;
          rev += amt;
          if (item.gateway === 'google_play') playRev += amt;
          else cfRev += amt;
        }
      }
      
      for (const oItem of orderItems) {
        if (paidOrderIds.has(oItem.order)) {
          const amt = oItem.amount_paise / 100;
          const rate = oItem.gst_rate / 100;
          const taxable = Math.round((amt / (1 + rate)) * 100) / 100;
          const gst = Math.round((amt - taxable) * 100) / 100;
          
          totalGstCalc += gst;
          
          const key = `${oItem.hsn_sac_code}_${oItem.gst_rate}`;
          if (!breakdownMap.has(key)) {
            breakdownMap.set(key, { hsn_sac_code: oItem.hsn_sac_code, rate: oItem.gst_rate, taxable_value: 0, cgst: 0, sgst: 0 });
          }
          const entry = breakdownMap.get(key)!;
          entry.taxable_value += taxable;
          entry.cgst += gst / 2;
          entry.sgst += gst / 2;
        }
      }

      setTotalRevenue(rev);
      setCashfreeRevenue(cfRev);
      setPlayRevenue(playRev);
      setTotalGST(totalGstCalc);
      
      // format breakdown
      const arr = Array.from(breakdownMap.values()).map(e => ({
        ...e,
        taxable_value: Math.round(e.taxable_value * 100) / 100,
        cgst: Math.round(e.cgst * 100) / 100,
        sgst: Math.round(e.sgst * 100) / 100,
      }));
      setGstBreakdowns(arr);
    } catch (err) {
      console.error('Failed to fetch finance records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const handleExportGSTR1 = () => {
    const data = [];
    
    // In GSTR-1, we usually want to export itemized GST.
    // However, keeping the structure similar but enriched.
    for (const b of gstBreakdowns) {
      data.push({
        HSN_SAC_Code: b.hsn_sac_code,
        Rate_Percent: b.rate,
        TaxableValueINR: b.taxable_value,
        CGST_INR: b.cgst,
        SGST_INR: b.sgst,
        TotalTaxINR: b.cgst + b.sgst
      });
    }
    
    exportToCsv(data, `gstr1_report_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleProcessRefund = async (adminPassword?: string) => {
    if (!refundModal.order || !adminPassword) return;
    try {
      const res = await fetch('https://pb.vakrahara.org/api/admin/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: refundModal.order.id, adminPassword }),
      });
      if (!res.ok) throw new Error('Refund API failed');
      
      await pb.collection('orders').update(refundModal.order.id, { status: 'refunded' });
      setRefundModal({ isOpen: false, order: null });
      fetchFinance();
    } catch (err) {
      console.error('Failed to process refund:', err);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Finance & GST Reconciliation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              SAC/HSN Compliance
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Cashfree payment reconciliations, GST ledger exports (GSTR-1), and secure refund ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportGSTR1}
            disabled={gstBreakdowns.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            <span>Export GSTR-1 CSV</span>
          </button>
          <button
            onClick={fetchFinance}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black text-sm font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Reconcile</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total Gross Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-500 mt-1">Cumulative settled orders</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Cashfree UPI Volume</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">₹{cashfreeRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-500 mt-1">Web prepaid passes</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Google Play Volume</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">₹{playRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-500 mt-1">Android app subscriptions</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total GST Liability</span>
            <Receipt className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-2xl font-bold text-[#d4af37]">₹{totalGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-500 mt-1">Dynamic from item rates</div>
        </div>
      </div>

      {/* GST Breakdown Table */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="text-lg font-semibold text-white">GST Breakdown by Category</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/3 border-b border-white/8 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">HSN / SAC Code</th>
                <th className="py-3.5 px-4">Rate (%)</th>
                <th className="py-3.5 px-4">Taxable Value ₹</th>
                <th className="py-3.5 px-4">CGST ₹</th>
                <th className="py-3.5 px-4">SGST ₹</th>
                <th className="py-3.5 px-4">Total Tax ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {gstBreakdowns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No GST breakdown data available.
                  </td>
                </tr>
              ) : (
                gstBreakdowns.map((b, i) => (
                  <tr key={i} className="hover:bg-white/2 transition">
                    <td className="py-3.5 px-4 font-mono text-white">{b.hsn_sac_code}</td>
                    <td className="py-3.5 px-4 font-mono text-[#d4af37]">{b.rate}%</td>
                    <td className="py-3.5 px-4 font-mono">₹{b.taxable_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 font-mono">₹{b.cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 font-mono">₹{b.sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">₹{(b.cgst + b.sgst).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders & Tax Invoices Table */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/3 border-b border-white/8 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Invoice / Date</th>
                <th className="py-3.5 px-4">Customer User ID</th>
                <th className="py-3.5 px-4">Gateway</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Gross ₹</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d4af37]" />
                    <span>Loading financial ledger...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <span>No settled invoices recorded yet.</span>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const gross = o.amount_paise / 100;

                  return (
                    <tr key={o.id} className="hover:bg-white/2 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono text-white">
                        <div>INV-{o.id.slice(0,8).toUpperCase()}</div>
                        <div className="text-gray-500 font-normal">{new Date(o.created).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono text-gray-400">
                        {o.user_id}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          o.gateway === 'google_play'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {o.gateway === 'google_play' ? 'Google Play' : 'Cashfree'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {o.plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-white text-xs font-mono">
                        ₹{gross.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          o.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : o.status === 'refunded'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        {o.status === 'paid' && o.gateway !== 'google_play' && (
                          <button
                            onClick={() => setRefundModal({ isOpen: true, order: o })}
                            className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30 transition"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sudo Refund Confirmation Modal */}
      {refundModal.order && (
        <SudoConfirmModal
          isOpen={refundModal.isOpen}
          onClose={() => setRefundModal({ isOpen: false, order: null })}
          onConfirm={handleProcessRefund}
          title={`Process Refund for INV-${refundModal.order.id.slice(0,8).toUpperCase()}`}
          description={`This will issue a full refund of ₹${refundModal.order.amount_paise / 100} via Cashfree and revoke the associated subscription. Admin password required.`}
          actionLabel="Execute Refund"
          requirePassword={true}
          isDangerous={true}
        />
      )}
    </div>
  );
}
