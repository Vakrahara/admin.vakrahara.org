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
  const [promotionalSubsidy, setPromotionalSubsidy] = useState(0);
  const [gmv, setGmv] = useState(0);
  const [totalGST, setTotalGST] = useState(0);

  const [refundModal, setRefundModal] = useState<{ isOpen: boolean; order: Order | null }>({
    isOpen: false,
    order: null,
  });

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all orders without truncation for accurate revenue and tax calculation
      const items = (await pb.collection('orders').getFullList({ sort: '-created' })) as unknown as Order[];
      setOrders(items);

      // Fetch order items with fallback to orders collection if empty
      let orderItems: OrderItem[] = [];
      try {
        const itemsRes = await pb.collection('order_items').getFullList({ expand: 'order_id' });
        orderItems = itemsRes as unknown as OrderItem[];
      } catch (oiErr) {
        console.warn('Notice: order_items fetch fallback to orders table:', oiErr);
      }

      let rev = 0;
      let promoSub = 0;

      // Filter paid commercial orders (Statutory Cash Ledger)
      const paidCommercialOrders = items.filter(
        (i) => i.status === 'paid' && (i.amount_paise || 0) > 0 && i.invoice_type !== 'bill_of_supply'
      );

      // Filter complimentary orders (Promotional / Scholarship Ledger)
      const complimentaryOrders = items.filter(
        (i) =>
          (i.amount_paise || 0) === 0 ||
          i.invoice_type === 'bill_of_supply' ||
          i.order_type === 'complimentary' ||
          i.order_type === 'activation_key'
      );

      for (const item of paidCommercialOrders) {
        const amt = (item.amount_paise || 0) / 100;
        rev += amt;
      }

      for (const item of complimentaryOrders) {
        const val =
          (item.discount_paise || item.subtotal_paise || 0) / 100 ||
          (item.plan === 'lifetime' ? 1999 : item.plan === 'yearly' ? 799 : 99);
        promoSub += val;
      }

      const paidCommercialOrdersMap = new Map<string, Order>();
      for (const po of paidCommercialOrders) {
        if (po.id) paidCommercialOrdersMap.set(po.id, po);
        if (po.order_id) paidCommercialOrdersMap.set(po.order_id, po);
      }

      const breakdownMap = new Map<string, GSTBreakdown>();
      let totalGstCalc = 0;

      if (orderItems.length > 0) {
        for (const oItem of orderItems) {
          const parentOrder = paidCommercialOrdersMap.get(oItem.order_id) || (oItem as any).expand?.order_id;
          const isPaidCommercial = parentOrder && (parentOrder.amount_paise || 0) > 0 && parentOrder.invoice_type !== 'bill_of_supply';
          if (isPaidCommercial) {
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
                igst: 0,
                cgst: 0,
                sgst: 0,
              });
            }
            const entry = breakdownMap.get(key)!;
            entry.taxable_value += taxable;

            // Statutory Place of Supply: UP (09) = CGST+SGST, all other states = IGST
            const isIntrastate = parentOrder?.place_of_supply === '09' || ((parentOrder?.cgst_paise || 0) > 0);
            if (isIntrastate) {
              entry.cgst += gst / 2;
              entry.sgst += gst / 2;
            } else {
              entry.igst += gst;
            }
          }
        }
      } else {
        // Fallback: Compute statutory GST breakdown directly from paid commercial orders
        for (const po of paidCommercialOrders) {
          const rate = 18;
          const hsn = '998439';
          const amt = (po.amount_paise || 0) / 100;
          const taxable = po.taxable_paise ? po.taxable_paise / 100 : Math.round((amt / 1.18) * 100) / 100;
          const gst = amt - taxable;
          totalGstCalc += gst;

          const key = `${hsn}_${rate}`;
          if (!breakdownMap.has(key)) {
            breakdownMap.set(key, {
              hsn_sac_code: hsn,
              rate: rate,
              taxable_value: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
            });
          }
          const entry = breakdownMap.get(key)!;
          entry.taxable_value += taxable;

          const isIntrastate = po.place_of_supply === '09' || ((po.cgst_paise || 0) > 0);
          if (isIntrastate) {
            entry.cgst += gst / 2;
            entry.sgst += gst / 2;
          } else {
            entry.igst += gst;
          }
        }
      }

      setTotalRevenue(rev);
      setPromotionalSubsidy(promoSub);
      setGmv(rev + promoSub);
      setTotalGST(totalGstCalc);

      const arr = Array.from(breakdownMap.values()).map((e) => ({
        ...e,
        taxable_value: Math.round(e.taxable_value * 100) / 100,
        igst: Math.round(e.igst * 100) / 100,
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
      IGST_INR: b.igst,
      CGST_INR: b.cgst,
      SGST_INR: b.sgst,
      TotalTaxINR: Math.round((b.igst + b.cgst + b.sgst) * 100) / 100,
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
        promotionalSubsidy={promotionalSubsidy}
        gmv={gmv}
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
