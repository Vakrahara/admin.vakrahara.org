import React from 'react';

export type BadgeVariant = 'gold' | 'green' | 'amber' | 'red' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function Badge({ variant = 'gray', children, icon: Icon, className = '' }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    gold: 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]',
    green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    red: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    gray: 'bg-white/5 border-white/10 text-gray-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold tracking-wide ${styles[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}
