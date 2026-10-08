'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Globe, Server, CheckCircle2 } from 'lucide-react';
import { R2Config } from '@/lib/r2-upload';

interface R2SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  r2Config: R2Config;
  onSaveConfig: (config: R2Config) => void;
}

export function R2SettingsModal({
  isOpen,
  onClose,
  r2Config,
  onSaveConfig
}: R2SettingsModalProps) {
  const [formConfig, setFormConfig] = useState<R2Config>(r2Config);

  useEffect(() => {
    setFormConfig(r2Config);
  }, [r2Config]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formConfig);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="r2-settings-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="glass-panel bg-[#0d0d15] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scaleUp">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 id="r2-settings-modal-title" className="text-lg font-bold text-white tracking-wide mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Cloudflare R2 Delivery Hub
        </h3>

        <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Server-Side SigV4 Vault Active
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Curriculum publishing is authenticated and signed server-side via PocketBase environment credentials. Secret access keys are never held or requested in browser storage.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
              Public Edge CDN Custom Domain
            </label>
            <input
              type="text"
              required
              value={formConfig.customDomain || ''}
              onChange={(e) => setFormConfig({ ...formConfig, customDomain: e.target.value })}
              placeholder="https://cdn.vakrahara.org/v1"
              className="w-full px-3 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Default: https://cdn.vakrahara.org/v1
            </span>
          </div>

          <div className="p-3 bg-white/2 border border-white/5 rounded-xl space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#d4af37]" />
              Dual Edge Targets Configured
            </div>
            <div className="text-[11px] font-mono text-gray-300 space-y-1">
              <div>• cbse/chapters_data.json <span className="text-gray-500">(Amrtam Android app)</span></div>
              <div>• v1/cbse/chapters_data.json <span className="text-gray-500">(Web portal & v1 API)</span></div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#d4af37] text-[#050508] rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
