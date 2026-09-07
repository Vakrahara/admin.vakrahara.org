'use client';

import { RefreshCw, Receipt } from 'lucide-react';
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
  return (
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
                      <div>INV-{o.id.slice(0, 8).toUpperCase()}</div>
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
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
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
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      {o.status === 'paid' && o.gateway !== 'google_play' && (
                        <button
                          onClick={() => onOpenRefundModal(o)}
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
  );
}
