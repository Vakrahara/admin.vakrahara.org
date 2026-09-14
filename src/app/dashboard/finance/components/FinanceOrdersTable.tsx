'use client';

import { useState } from 'react';
import { RefreshCw, Receipt, Gift, ShieldCheck } from 'lucide-react';
import { Order } from './types';

interface FinanceOrdersTableProps {
  orders: Order[];
  loading: boolean;
  onOpenRefundModal: (order: Order) => void;
}

export function FinanceOrdersTable({
  orders,
  loading,
  onOpenRefundModal,
}: FinanceOrdersTableProps) {
  const [ledgerTab, setLedgerTab] = useState<'commercial' | 'complimentary'>('commercial');

  const commercialOrders = orders.filter(
    (o) => (o.amount_paise || 0) > 0 && o.invoice_type !== 'bill_of_supply'
  );
  const complimentaryOrders = orders.filter(
    (o) =>
      (o.amount_paise || 0) === 0 ||
      o.invoice_type === 'bill_of_supply' ||
      o.order_type === 'complimentary' ||
      o.order_type === 'activation_key'
  );

  const displayedOrders = ledgerTab === 'commercial' ? commercialOrders : complimentaryOrders;

  return (
    <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl mt-6">
      {/* Dual-Ledger Tab Switcher */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLedgerTab('commercial')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              ledgerTab === 'commercial'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Commercial Orders ({commercialOrders.length})</span>
          </button>

          <button
            onClick={() => setLedgerTab('complimentary')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              ledgerTab === 'complimentary'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Complimentary & Giveaways ({complimentaryOrders.length})</span>
          </button>
        </div>

        <div className="text-xs text-gray-400">
          {ledgerTab === 'commercial' ? (
            <span className="text-emerald-400/80">Tax Invoices (Subject to 18% GST)</span>
          ) : (
            <span className="text-purple-400/80">Bills of Supply (Statutory ₹0 GST)</span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-white/3 border-b border-white/8 text-xs uppercase tracking-wider text-gray-400 font-semibold">
            <tr>
              <th className="py-3.5 px-4">{ledgerTab === 'commercial' ? 'Invoice / Date' : 'Voucher / Date'}</th>
              <th className="py-3.5 px-4">Recipient User ID</th>
              <th className="py-3.5 px-4">Channel / Source</th>
              <th className="py-3.5 px-4">Plan</th>
              <th className="py-3.5 px-4">{ledgerTab === 'commercial' ? 'Gross ₹' : 'Subsidized ₹'}</th>
              <th className="py-3.5 px-4">{ledgerTab === 'commercial' ? 'Status' : 'Reason / Campaign'}</th>
              <th className="py-3.5 px-4 text-right">{ledgerTab === 'commercial' ? 'Actions' : 'GST Status'}</th>
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
            ) : displayedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <span>
                    {ledgerTab === 'commercial'
                      ? 'No settled commercial invoices recorded yet.'
                      : 'No complimentary giveaways or promotional vouchers issued yet.'}
                  </span>
                </td>
              </tr>
            ) : (
              displayedOrders.map((o) => {
                const amount = ledgerTab === 'commercial'
                  ? (o.amount_paise || 0) / 100
                  : ((o.discount_paise || o.subtotal_paise || 0) / 100 || (o.plan === 'lifetime' ? 1999 : o.plan === 'yearly' ? 799 : 99));

                return (
                  <tr key={o.id} className="hover:bg-white/2 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono text-white">
                      <div>{ledgerTab === 'commercial' ? `INV-${o.id.slice(0, 8).toUpperCase()}` : `BOS-${o.id.slice(0, 8).toUpperCase()}`}</div>
                      <div className="text-gray-500 font-normal">
                        {new Date(o.created).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono text-gray-400">
                      {o.user_id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          o.gateway === 'google_play'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            : o.gateway === 'admin_grant'
                            ? 'bg-pink-500/10 text-pink-400 border border-pink-500/30'
                            : o.gateway === 'activation_key'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : o.gateway === 'promotional_voucher'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {o.gateway === 'google_play'
                          ? 'Google Play'
                          : o.gateway === 'admin_grant'
                          ? 'Admin Direct Grant'
                          : o.gateway === 'activation_key'
                          ? 'Offline Key'
                          : o.gateway === 'promotional_voucher'
                          ? '100% Coupon'
                          : 'Cashfree UPI'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        {o.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-white text-xs font-mono">
                      ₹{amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ledgerTab === 'commercial' ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            o.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : o.status === 'refunded'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {o.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 font-mono">
                          {o.grant_reason || o.campaign_id || o.coupon_code || 'Promotional Giveaway'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      {ledgerTab === 'commercial' ? (
                        o.status === 'paid' && o.gateway !== 'google_play' && (
                          <button
                            onClick={() => onOpenRefundModal(o)}
                            className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30 transition"
                          >
                            Refund
                          </button>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Exempt (₹0 GST)</span>
                        </span>
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
  );
}
