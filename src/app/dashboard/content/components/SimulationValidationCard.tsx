'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import { SimulationValidationResult } from '../utils/simulationValidator';

interface SimulationValidationCardProps {
  validation: SimulationValidationResult | null;
  isIdInUse: boolean;
  allowBypass: boolean;
  onToggleBypass: (allow: boolean) => void;
}

export function SimulationValidationCard({
  validation,
  isIdInUse,
  allowBypass,
  onToggleBypass
}: SimulationValidationCardProps) {
  if (!validation && !isIdInUse) return null;

  const passedRequiredCount = validation ? Math.max(0, 3 - validation.errors.length) : 3;

  return (
    <div className="space-y-2.5">
      {isIdInUse && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>⚠️ Simulation ID already in use. Uploading will overwrite.</span>
        </div>
      )}

      {validation && (
        <div className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all ${
          validation.valid
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : 'bg-red-950/20 border-red-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {validation.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-red-400" />
              )}
              <span className={`font-semibold ${validation.valid ? 'text-emerald-300' : 'text-red-300'}`}>
                Bridge Check: {passedRequiredCount}/3 Passed
              </span>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
              validation.warnings.length > 0
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            }`}>
              Warnings: {validation.warnings.length}
            </span>
          </div>

          {validation.errors.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                Required Interface Errors
              </span>
              {validation.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-300 bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              ))}
              <label className="flex items-center gap-2 pt-2 text-[11px] text-red-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowBypass}
                  onChange={(e) => onToggleBypass(e.target.checked)}
                  className="rounded bg-[#05070D] border-red-500/40 text-red-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-medium">Confirm upload anyway despite missing bridge interfaces</span>
              </label>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Recommended / Offline Warnings
              </span>
              {validation.warnings.map((warn, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
