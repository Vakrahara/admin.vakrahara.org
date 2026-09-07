export interface Coupon {
  id: string;
  code: string;
  discount_pct: number;
  flat_discount_paise: number;
  applicable_plan: string;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
  created: string;
}

export type CouponForm = {
  code: string;
  discount_type: 'pct' | 'flat';
  discount_value: number;
  applicable_plan: string;
  max_uses: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
};

export const PLAN_LABELS: Record<string, string> = {
  all: 'All Plans',
  monthly: 'Monthly',
  yearly: 'Yearly',
  lifetime: 'Lifetime',
};

export const EMPTY_FORM: CouponForm = {
  code: '',
  discount_type: 'pct',
  discount_value: 20,
  applicable_plan: 'all',
  max_uses: 0,
  valid_from: '',
  valid_until: '',
  active: true,
};

export function fmtDiscount(c: Coupon) {
  if (c.discount_pct > 0) return `${c.discount_pct}% off`;
  if (c.flat_discount_paise > 0) return `₹${(c.flat_discount_paise / 100).toFixed(0)} off`;
  return '—';
}

export function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—';
}

export function getCouponStatus(c: Coupon) {
  if (!c.active) return { label: 'Inactive', cls: 'bg-gray-500/10 text-gray-500' };
  const now = new Date();
  if (c.valid_until) {
    const until = c.valid_until.length === 10 ? new Date(`${c.valid_until}T23:59:59`) : new Date(c.valid_until);
    if (!isNaN(until.getTime()) && until < now) return { label: 'Expired', cls: 'bg-red-500/10 text-red-400' };
  }
  if (c.valid_from) {
    const from = c.valid_from.length === 10 ? new Date(`${c.valid_from}T00:00:00`) : new Date(c.valid_from);
    if (!isNaN(from.getTime()) && from > now) return { label: 'Scheduled', cls: 'bg-blue-500/10 text-blue-400' };
  }
  return { label: 'Active', cls: 'bg-emerald-500/10 text-emerald-400' };
}
