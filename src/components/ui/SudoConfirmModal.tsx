"use client";

import React, { useState } from "react";
import { AlertTriangle, Lock, X } from "lucide-react";

interface SudoConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  actionLabel?: string;
  requiredText?: string;
  isDangerous?: boolean;
}

export function SudoConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm Action",
  actionLabel,
  requiredText,
  isDangerous = false,
}: SudoConfirmModalProps) {
  const [typedKeyword, setTypedKeyword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const targetKeyword = requiredText || (isDangerous ? "CONFIRM" : "");
  const buttonLabel = actionLabel || confirmText;

  const handleConfirm = async () => {
    if (targetKeyword && typedKeyword.toUpperCase() !== targetKeyword.toUpperCase()) {
      setError(`Please type "${targetKeyword}" exactly to proceed`);
      return;
    }
    setError("");
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e0e17] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/80">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDangerous
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20"
            }`}
          >
            {isDangerous ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <span className="text-[11px] text-white/40 uppercase tracking-widest font-mono">
              Sudo Verification Required
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-white/70 leading-relaxed mb-5">
          {description}
        </p>

        {/* Typed confirmation for dangerous actions or explicit keyword */}
        {targetKeyword && (
          <div className="mb-5">
            <label className="block text-[11px] font-mono uppercase text-white/50 mb-1.5">
              Type <span className="text-rose-400 font-bold">{targetKeyword}</span> to proceed:
            </label>
            <input
              type="text"
              value={typedKeyword}
              onChange={(e) => {
                setTypedKeyword(e.target.value);
                if (error) setError("");
              }}
              placeholder={targetKeyword}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500/50"
            />
            {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shadow-lg ${
              isDangerous || targetKeyword
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                : "bg-[#d4af37] hover:bg-[#e6c34f] text-black shadow-[#d4af37]/20 font-bold"
            }`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
