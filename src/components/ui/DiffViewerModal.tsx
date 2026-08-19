"use client";

import React from "react";
import { X, ArrowRight } from "lucide-react";

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  beforeState: any;
  afterState: any;
  actionName?: string;
}

export function DiffViewerModal({
  isOpen,
  onClose,
  title,
  beforeState,
  afterState,
  actionName,
}: DiffViewerModalProps) {
  if (!isOpen) return null;

  const formatJSON = (val: any) => {
    if (!val) return "null";
    if (typeof val === "string") {
      try {
        return JSON.stringify(JSON.parse(val), null, 2);
      } catch (e) {
        return val;
      }
    }
    return JSON.stringify(val, null, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/90 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
              {actionName && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
                  {actionName}
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 font-mono mt-0.5">
              Side-by-side State Modification Comparison
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Side-by-Side Diff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {/* Before State */}
          <div className="flex flex-col bg-black/40 border border-rose-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Before State
              </span>
            </div>
            <pre className="text-xs font-mono text-rose-200/90 whitespace-pre-wrap break-all overflow-x-auto bg-black/60 p-3 rounded-lg flex-1 border border-white/5">
              {formatJSON(beforeState)}
            </pre>
          </div>

          {/* After State */}
          <div className="flex flex-col bg-black/40 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> After State
              </span>
            </div>
            <pre className="text-xs font-mono text-emerald-200/90 whitespace-pre-wrap break-all overflow-x-auto bg-black/60 p-3 rounded-lg flex-1 border border-white/5">
              {formatJSON(afterState)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all"
          >
            Close Diff View
          </button>
        </div>
      </div>
    </div>
  );
}
