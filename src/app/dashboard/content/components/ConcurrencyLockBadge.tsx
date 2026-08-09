'use client';

import React from 'react';
import { Lock, ShieldAlert, CheckCircle } from 'lucide-react';

interface ConcurrencyLockBadgeProps {
  lockedBy: string | null;
  currentUser: string;
  onAcquireLock?: () => void;
  onReleaseLock?: () => void;
}

export const ConcurrencyLockBadge: React.FC<ConcurrencyLockBadgeProps> = ({
  lockedBy,
  currentUser,
  onAcquireLock,
  onReleaseLock,
}) => {
  if (!lockedBy) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Unlocked (Editable)</span>
      </div>
    );
  }

  const isSelfLocked = lockedBy.toLowerCase() === currentUser.toLowerCase();

  if (isSelfLocked) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
        <Lock className="w-3.5 h-3.5" />
        <span>Editing Session Active</span>
        {onReleaseLock && (
          <button
            onClick={onReleaseLock}
            className="ml-2 text-[10px] underline hover:text-amber-200"
          >
            Release Lock
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-pulse">
      <ShieldAlert className="w-4 h-4 text-rose-400" />
      <span>Locked by: {lockedBy} (Read-Only Mode)</span>
    </div>
  );
};
