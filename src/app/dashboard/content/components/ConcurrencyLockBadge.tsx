'use client';

import React, { useEffect, useState } from 'react';
import { Lock, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface ConcurrencyLockBadgeProps {
  lockedBy: string | null;
  lockedAt?: string | null;
  currentUser: string;
  onAcquireLock?: () => void;
  onReleaseLock?: () => void;
  onHeartbeat?: () => void;
}

export const ConcurrencyLockBadge: React.FC<ConcurrencyLockBadgeProps> = ({
  lockedBy,
  lockedAt,
  currentUser,
  onReleaseLock,
  onHeartbeat,
}) => {
  const [minutesRemaining, setMinutesRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!lockedAt) {
      setMinutesRemaining(null);
      return;
    }

    const calculateRemaining = () => {
      const lockTime = new Date(lockedAt).getTime();
      const elapsedMs = Date.now() - lockTime;
      const ttlMs = 30 * 60 * 1000; // 30 min TTL (§6g, SEC-11)
      const remainingMs = ttlMs - elapsedMs;
      setMinutesRemaining(Math.max(0, Math.ceil(remainingMs / (60 * 1000))));
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 60000);
    return () => clearInterval(interval);
  }, [lockedAt]);

  // Periodic heartbeat every 5 minutes while active session is held
  useEffect(() => {
    if (!lockedBy || lockedBy.toLowerCase() !== currentUser.toLowerCase() || !onHeartbeat) return;
    const heartbeatTimer = setInterval(() => {
      onHeartbeat();
    }, 5 * 60 * 1000);
    return () => clearInterval(heartbeatTimer);
  }, [lockedBy, currentUser, onHeartbeat]);

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
        {minutesRemaining !== null && (
          <span className="text-[10px] text-amber-400/80 font-mono flex items-center gap-0.5">
            <Clock className="w-3 h-3 inline" />
            {minutesRemaining}m TTL
          </span>
        )}
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
      {minutesRemaining !== null && (
        <span className="text-[10px] text-rose-400 font-mono">
          ({minutesRemaining}m left)
        </span>
      )}
    </div>
  );
};
