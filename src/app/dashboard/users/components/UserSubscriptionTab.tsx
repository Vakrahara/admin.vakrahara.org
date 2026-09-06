'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { Crown, AlertCircle, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  order_id: string;
  plan: string;
  amount_paise: number;
  status: string;
  gateway: string;
  created: string;
}

interface UserSubscriptionTabProps {
  user: {
    id: string;
    isPremium?: boolean;
    premium_plan?: string;
    subscription_expiry?: string;
    trial_end_date?: string;
  };
  isUpdatingUser: boolean;
  onGrantPremium: (userId: string, plan: string, durationDays: number) => void;
  onGiveTrial: (userId: string, trialDays: number) => void;
  onRevokePremium: (userId: string) => void;
}

export function UserSubscriptionTab({
  user,
  isUpdatingUser,
  onGrantPremium,
  onGiveTrial,
  onRevokePremium,
}: UserSubscriptionTabProps) {
  const [userOrders, setUserOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchUserOrders = useCallback(async () => {
    if (!user?.id) return;
    setLoadingOrders(true);
    try {
      const res = await pb.collection('orders').getList<OrderItem>(1, 10, {
        filter: `user_id = "${user.id}"`,
        sort: '-created',
      });
      setUserOrders(res.items);
    } catch (e) {
      console.error('Failed to load user orders', e);
    } finally {
      setLoadingOrders(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  // Determine Subscription Origin
  const latestPaidOrder = userOrders.find(o => o.status === 'paid');
  let originLabel = 'Free Learner Tier';
  let originBadgeColor = 'bg-gray-500/10 text-gray-400 border-gray-500/30';

  if (user.isPremium) {
    if (latestPaidOrder?.gateway === 'google_play') {
      originLabel = 'Google Play Auto-Renew';
      originBadgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    } else if (latestPaidOrder?.gateway === 'cashfree') {
      originLabel = 'Cashfree Web Pass';
      originBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    } else if (user.trial_end_date && new Date(user.trial_end_date) > new Date()) {
      originLabel = 'Free Trial Active';
      originBadgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    } else {
      originLabel = 'Manual Admin Grant';
      originBadgeColor = 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30';
    }
  }

  return (
    <div className="space-y-6">
      {/* Origin Status Header */}
      <div className="p-4 bg-[#0d0d15] border border-white/8 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            Subscription Origin
          </span>
          <span className="text-sm font-semibold text-white mt-0.5 block">
            {user.isPremium ? (user.premium_plan?.toUpperCase() || 'PREMIUM') : 'FREE TIER'}
          </span>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${originBadgeColor}`}>
          {originLabel}
        </span>
      </div>

      {/* Grant / Control Buttons */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest block">
          Grant / Control Premium Access
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onGrantPremium(user.id, 'monthly', 30)}
            disabled={isUpdatingUser}
            className="py-3 px-4 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 text-xs text-[#f3e5ab] font-bold hover:bg-[#d4af37]/20 transition-all flex items-center justify-center gap-2"
          >
            👑 1-Month Premium (30d)
          </button>
          <button
            onClick={() => onGrantPremium(user.id, 'yearly', 365)}
            disabled={isUpdatingUser}
            className="py-3 px-4 rounded-xl border border-[#d4af37] bg-gradient-to-r from-amber-600 to-[#d4af37] text-xs text-black font-extrabold hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            👑 1-Year Premium (365d)
          </button>
          <button
            onClick={() => onGrantPremium(user.id, 'lifetime', 36500)}
            disabled={isUpdatingUser}
            className="py-3 px-4 rounded-xl border border-cyan-500/50 bg-cyan-950/40 text-xs text-cyan-300 font-extrabold hover:bg-cyan-900/50 transition-all flex items-center justify-center gap-2"
          >
            ♾️ Lifetime Premium
          </button>
          <button
            onClick={() => onGiveTrial(user.id, 7)}
            disabled={isUpdatingUser}
            className="py-3 px-4 rounded-xl border border-purple-500/50 bg-purple-950/40 text-xs text-purple-300 font-bold hover:bg-purple-900/50 transition-all flex items-center justify-center gap-2"
          >
            ⌛ Give 7-Day Trial
          </button>
        </div>

        <div className="pt-1">
          <button
            onClick={() => onRevokePremium(user.id)}
            disabled={isUpdatingUser}
            className="w-full py-3 px-4 rounded-xl border border-rose-500/40 bg-rose-950/40 text-xs text-rose-300 font-bold hover:bg-rose-900/50 transition-all flex items-center justify-center gap-2"
          >
            ❌ Revoke Premium & Reset to Free Tier
          </button>
        </div>
      </div>

      {/* User Order History Table */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <ShoppingBag className="w-3.5 h-3.5 text-[#d4af37]" />
          Order & Transaction History
        </span>
        <div className="bg-black/40 border border-white/8 rounded-xl overflow-hidden">
          {loadingOrders ? (
            <div className="p-4 text-center text-xs text-gray-500">Loading order history...</div>
          ) : userOrders.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-600">No payment orders on record for this user.</div>
          ) : (
            <table className="w-full text-xs text-left text-gray-300">
              <thead className="bg-white/3 border-b border-white/8 text-[10px] uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {userOrders.map(o => (
                  <tr key={o.id} className="hover:bg-white/2">
                    <td className="py-2 px-3 font-mono text-[11px] text-gray-400">{o.order_id.slice(0, 16)}…</td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        o.gateway === 'google_play'
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {o.gateway === 'google_play' ? 'Google Play' : 'Cashfree'}
                      </span>
                    </td>
                    <td className="py-2 px-3 capitalize text-white">{o.plan}</td>
                    <td className="py-2 px-3 text-white font-mono">₹{o.amount_paise / 100}</td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        o.status === 'paid'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                      {new Date(o.created).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
