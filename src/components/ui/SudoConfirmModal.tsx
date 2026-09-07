"use client";

import React, { useState } from "react";
import { AlertTriangle, Lock, X, Key } from "lucide-react";

interface SudoConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password?: string) => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  actionLabel?: string;
  requiredText?: string;
  requirePassword?: boolean;
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
  requirePassword = false,
  isDangerous = false,
}: SudoConfirmModalProps) {
  const [typedKeyword, setTypedKeyword] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetKeyword = requiredText || (isDangerous && !requirePassword ? "CONFIRM" : "");
  const buttonLabel = actionLabel || confirmText;

  const handleConfirm = async () => {
    if (targetKeyword && typedKeyword.toUpperCase() !== targetKeyword.toUpperCase()) {
      setError(`Please type "${targetKeyword}" exactly to proceed`);
      return;
    }
    if (requirePassword && !password) {
      setError(`Admin password is required to proceed`);
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    try {
      await onConfirm(requirePassword ? password : undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || "Action failed. Please check credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e0e17] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/80">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors disabled:opacity-50"
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
            ) : requirePassword ? (
              <Key className="w-5 h-5" />
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
        {targetKeyword && !requirePassword && (
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
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500/50 disabled:opacity-50"
            />
          </div>
        )}

        {/* Password input */}
        {requirePassword && (
          <div className="mb-5">
            <label className="block text-[11px] font-mono uppercase text-white/50 mb-1.5">
              Enter Admin Password to proceed:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="Admin Password"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#d4af37]/50 disabled:opacity-50"
            />
          </div>
        )}
        
        {error && <p className="text-xs text-rose-400 mt-1.5 mb-5">{error}</p>}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shadow-lg disabled:opacity-50 ${
              isDangerous || targetKeyword
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                : "bg-[#d4af37] hover:bg-[#e6c34f] text-black shadow-[#d4af37]/20 font-bold"
            }`}
          >
            {isSubmitting ? "Processing..." : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
