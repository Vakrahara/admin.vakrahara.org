export interface ActivationKey {
  id: string;
  key: string;
  plan: string;
  duration_days: number;
  valid_until: string;
  used_by: string;
  used_at: string;
  campaign: string;
  note: string;
  created: string;
}

export const PLAN_STYLES: Record<string, string> = {
  monthly:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  yearly:   'text-purple-400 bg-purple-500/10 border-purple-500/20',
  lifetime: 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20',
};

export function getKeyStatus(k: ActivationKey): { label: string; cls: string } {
  if (k.used_by) return { label: 'Used', cls: 'bg-gray-500/10 text-gray-400' };
  if (k.valid_until && new Date(k.valid_until) < new Date()) return { label: 'Expired', cls: 'bg-red-500/10 text-red-400' };
  return { label: 'Available', cls: 'bg-emerald-500/10 text-emerald-400' };
}

export function generateSecureKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const getSeg = () => {
    const bytes = new Uint8Array(4);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes, (b) => chars[b % chars.length]).join('');
  };
  return `AMRIT-${getSeg()}-${getSeg()}-${getSeg()}`;
}
