'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface Order {
  id: string;
  order_id: string;
  user_id: string;
  plan: string;
  amount_paise: number;
  status: string;
  coupon_used: string;
  gateway: string;
  cf_order_id: string;
  gateway_payment_id: string;
  processed_at: string;
  created: string;
}

export const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  paid:     { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  pending:  { bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  failed:   { bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-400' },
  refunded: { bg: 'bg-gray-500/10',    text: 'text-gray-400',    dot: 'bg-gray-400' },
};

export const PLAN_STYLES: Record<string, string> = {
  monthly:  'text-blue-400 bg-blue-500/10',
  yearly:   'text-purple-400 bg-purple-500/10',
  lifetime: 'text-[#d4af37] bg-[#d4af37]/10',
};

export function KpiCard({ icon: Icon, label, value, sub, color }: {
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

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!text) return;
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

export function GatewayBadge({ gateway }: { gateway: string }) {
  const g = (gateway || '').toLowerCase();
  if (g === 'google_play' || g === 'play_store') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 whitespace-nowrap">
        Google Play
      </span>
    );
  }
  if (g === 'cashfree' || g === 'cashfree_upi') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
        Cashfree UPI
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 text-gray-400 border border-white/10 whitespace-nowrap">
      {gateway || 'Direct'}
    </span>
  );
}

export const fmtRupees = (paise: number) => '₹' + (paise / 100).toLocaleString('en-IN');
export const fmtDate = (d: string) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
