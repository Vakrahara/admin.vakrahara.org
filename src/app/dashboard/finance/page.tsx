'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { Download, RefreshCw } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { SudoConfirmModal } from '@/components/ui/SudoConfirmModal';
import { Order, OrderItem, GSTBreakdown } from './components/types';
import { FinanceKpiCards } from './components/FinanceKpiCards';
import { FinanceGstTable } from './components/FinanceGstTable';
import { FinanceOrdersTable } from './components/FinanceOrdersTable';

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
      const itemsRes = await pb.collection('order_items').getFullList({ expand: 'order_id' });
      const orderItems = itemsRes as unknown as OrderItem[];

      let rev = 0;
      let cfRev = 0;
      let playRev = 0;

      const paidOrders = items.filter((i) => i.status === 'paid');
      const paidOrderIds = new Set<string>();
      for (const po of paidOrders) {
        if (po.id) paidOrderIds.add(po.id);
        if (po.order_id) paidOrderIds.add(po.order_id);
      }
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
        const isPaid = paidOrderIds.has(oItem.order_id) || (oItem as any).expand?.order_id?.status === 'paid';
        if (isPaid) {
          const gst = (oItem.gst_amount_paise || 0) / 100;
          const taxable = Math.max(0, ((oItem.unit_price_paise || 0) - (oItem.gst_amount_paise || 0)) / 100);
          const rate = oItem.gst_rate_pct || 18;
          const hsn = oItem.hsn_sac_code || '998439';

          totalGstCalc += gst;

          const key = `${hsn}_${rate}`;
          if (!breakdownMap.has(key)) {
            breakdownMap.set(key, {
              hsn_sac_code: hsn,
              rate: rate,
              taxable_value: 0,
              cgst: 0,
              sgst: 0,
            });
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

      const arr = Array.from(breakdownMap.values()).map((e) => ({
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
    const data = gstBreakdowns.map((b) => ({
      HSN_SAC_Code: b.hsn_sac_code,
      Rate_Percent: b.rate,
      TaxableValueINR: b.taxable_value,
      CGST_INR: b.cgst,
      SGST_INR: b.sgst,
      TotalTaxINR: Math.round((b.cgst + b.sgst) * 100) / 100,
    }));

    exportToCsv(data, `gstr1_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleProcessRefund = async () => {
    if (!refundModal.order) return;
    try {
      await pb.send('/api/admin/payments/refund', {
        method: 'POST',
        body: {
          order_id: refundModal.order.order_id || refundModal.order.cf_order_id || refundModal.order.id,
          reason: 'Admin portal refund',
        },
      });

      setRefundModal({ isOpen: false, order: null });
      fetchFinance();
    } catch (err: any) {
      console.error('Failed to process refund:', err);
      const msg = err?.data?.message || err?.message || 'Failed to process refund';
      throw new Error(msg);
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
      <FinanceKpiCards
        totalRevenue={totalRevenue}
        cashfreeRevenue={cashfreeRevenue}
        playRevenue={playRevenue}
        totalGST={totalGST}
      />

      {/* GST Breakdown Table */}
      <FinanceGstTable gstBreakdowns={gstBreakdowns} />

      {/* Orders & Tax Invoices Table */}
      <FinanceOrdersTable
        orders={orders}
        loading={loading}
        onOpenRefundModal={(o) => setRefundModal({ isOpen: true, order: o })}
      />

      {/* Sudo Refund Confirmation Modal */}
      {refundModal.order && (
        <SudoConfirmModal
          isOpen={refundModal.isOpen}
          onClose={() => setRefundModal({ isOpen: false, order: null })}
          onConfirm={handleProcessRefund}
          title={`Process Refund for INV-${refundModal.order.id.slice(0, 8).toUpperCase()}`}
          description={`This will issue a full refund of ₹${refundModal.order.amount_paise / 100} via Cashfree and revoke the associated subscription. Type REFUND to confirm.`}
          actionLabel="Execute Refund"
          requiredText="REFUND"
          requirePassword={false}
          isDangerous={true}
        />
      )}
    </div>
  );
}
