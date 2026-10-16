import { AlertTriangle, Info } from 'lucide-react';

export interface AuditLog {
  id: string;
  admin_email: string;
  admin_id: string;
  action: string;
  target_collection: string;
  target_id: string;
  details: string;
  before_state: any;
  after_state: any;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ip_address: string;
  created: string;
}

export const SEVERITY_BADGES: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: AlertTriangle },
  WARNING:  { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: AlertTriangle },
  INFO:     { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Info },
};

export const ACTION_COLORS: Record<string, string> = {
  USER_PREMIUM_GRANTED: 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30',
  USER_PREMIUM_REVOKED: 'text-red-400 bg-red-500/10 border-red-500/30',
  USER_TRIAL_GRANTED: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  FEEDBACK_REPORT_RESOLVED: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  MODERATION_REPORT_RESOLVED: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};
