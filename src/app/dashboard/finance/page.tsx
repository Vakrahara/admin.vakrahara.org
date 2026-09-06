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

export default function FinanceGSTPage() {
  const [orders, setOrders] = useState<Order[]>([]);
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
      const res = await pb.collection('orders').getList(1, 100, { sort: '-created' });
      const items = res.items as unknown as Order[];
      setOrders(items);

      let rev = 0;
      let cfRev = 0;
      let playRev = 0;
      for (const item of items) {
        if (item.status === 'paid') {
          const amt = item.amount_paise / 100;
          rev += amt;
          if (item.gateway === 'google_play') playRev += amt;
          else cfRev += amt;
        }
      }
      setTotalRevenue(rev);
      setCashfreeRevenue(cfRev);
      setPlayRevenue(playRev);
      setTotalGST(Math.round(rev * 0.18)); // 18% GST SAC 9984
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
    const data = orders.map(o => {
      const amt = o.amount_paise / 100;
      const taxable = Math.round((amt / 1.18) * 100) / 100;
      const gst = Math.round((amt - taxable) * 100) / 100;
      return {
        InvoiceNumber: `INV-${o.id.slice(0,8).toUpperCase()}`,
        InvoiceDate: o.created.slice(0,10),
        CustomerUserID: o.user_id,
        Plan: o.plan,
        TotalAmountINR: amt,
        TaxableValueINR: taxable,
        CGST_9_Percent: Math.round(gst / 2 * 100) / 100,
        SGST_9_Percent: Math.round(gst / 2 * 100) / 100,
        SAC_Code: '998439', // Online education service
        Gateway: o.gateway,
        PaymentID: o.cf_payment_id || o.order_id,
        Status: o.status,
      };
    });
    exportToCsv(data, `gstr1_report_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleProcessRefund = async (orderId: string) => {
    try {
      await pb.collection('orders').update(orderId, { status: 'refunded' });
      setRefundModal({ isOpen: false, order: null });
      fetchFinance();
    } catch (err) {
      console.error('Failed to process refund:', err);
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
              SAC 9984 Compliance
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Cashfree payment reconciliations, 18% GST ledger exports (GSTR-1), and 1-click refund ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportGSTR1}
            disabled={orders.length === 0}
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
          <div className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500 mt-1">Cumulative settled orders</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Cashfree UPI Volume</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">₹{cashfreeRevenue.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500 mt-1">Web prepaid passes</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Google Play Volume</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">₹{playRevenue.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500 mt-1">Android app subscriptions</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">GST Liability (18%)</span>
            <Receipt className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-2xl font-bold text-[#d4af37]">₹{totalGST.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500 mt-1">CGST (9%) + SGST (9%)</div>
        </div>
      </div>

      {/* Orders & Tax Invoices Table */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/3 border-b border-white/8 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Invoice / Date</th>
                <th className="py-3.5 px-4">Customer User ID</th>
                <th className="py-3.5 px-4">Gateway</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Gross ₹</th>
                <th className="py-3.5 px-4">GST (18%)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d4af37]" />
                    <span>Loading financial ledger...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <span>No settled invoices recorded yet.</span>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const gross = o.amount_paise / 100;
                  const gst = Math.round(gross * 0.18);

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
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono text-[#d4af37]">
                        ₹{gst.toLocaleString('en-IN')}
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
                        {o.status === 'paid' && (
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
          onConfirm={() => handleProcessRefund(refundModal.order!.id)}
          title={`Process Refund for INV-${refundModal.order.id.slice(0,8).toUpperCase()}`}
          description={`This will issue a full refund of ₹${refundModal.order.amount_paise / 100} and revoke the associated subscription.`}
          actionLabel="Execute Refund"
          requiredText="REFUND"
        />
      )}
    </div>
  );
}
