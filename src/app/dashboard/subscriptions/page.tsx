'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { RefreshCw, Users, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  amount_paise: number;
  status: string;
  expires_at: string;
  renewal_count: number;
  created: string;
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // metrics
  const [activeCount, setActiveCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [churnedCount, setChurnedCount] = useState(0);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pb.collection('subscriptions').getList(1, 100, {
        sort: '-created',
        filter: 'gateway = "cashfree"'
      });
      const items = res.items as unknown as Subscription[];
      setSubs(items);

      let active = 0;
      let expiring = 0;
      let churned = 0;

      const now = new Date();
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);

      for (const sub of items) {
        if (sub.status === 'active') {
          active++;
          if (sub.expires_at) {
            const expiresAt = new Date(sub.expires_at);
            if (expiresAt <= in7Days && expiresAt > now) {
              expiring++;
            }
          }
        } else if (sub.status === 'expired' || sub.status === 'cancelled') {
          churned++;
        }
      }
      setActiveCount(active);
      setExpiringSoonCount(expiring);
      setChurnedCount(churned);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const getStatusBadge = (status: string, expiresAtStr: string) => {
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    if (status === 'active') {
      if (expiresAt && expiresAt <= in7Days && expiresAt > now) {
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">Expiring Soon</span>;
      }
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Active</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 capitalize">{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscriptions Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Cashfree active subscriptions and churn metrics.</p>
        </div>
        <button
          onClick={fetchSubs}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-sm font-medium transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Active Subs</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
        </div>
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Expiring Soon</span>
            <Activity className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">{expiringSoonCount}</div>
        </div>
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Churned (Expired/Canceled)</span>
            <Activity className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{churnedCount}</div>
        </div>
      </div>

      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/3 border-b border-white/8 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Amount ₹</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Expires At</th>
                <th className="py-3.5 px-4">Renewal Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d4af37]" /> Loading subscriptions...
                  </td>
                </tr>
              ) : subs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">No subscriptions found.</td>
                </tr>
              ) : (
                subs.map(s => (
                  <tr key={s.id} className="hover:bg-white/2 transition">
                    <td className="py-3.5 px-4 font-mono text-xs">{s.user_id}</td>
                    <td className="py-3.5 px-4 capitalize font-semibold">{s.plan}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">₹{s.amount_paise / 100}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(s.status, s.expires_at)}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{s.renewal_count || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
