'use client';

import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formConfig);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel bg-[#0d0d15] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scaleUp">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white tracking-wide mb-2 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#d4af37]" />
          Cloudflare R2 Credentials
        </h3>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          These S3 keys are used directly by your browser for AWS SigV4 signed requests. They are stored locally in your browser and are never uploaded to our servers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">R2 Account ID</label>
            <input
              type="text"
              required
              value={formConfig.accountId}
              onChange={(e) => setFormConfig({ ...formConfig, accountId: e.target.value })}
              placeholder="e.g. 5ab6...ef21"
              className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">R2 Bucket Name</label>
            <input
              type="text"
              required
              value={formConfig.bucketName}
              onChange={(e) => setFormConfig({ ...formConfig, bucketName: e.target.value })}
              placeholder="e.g. vakrahara-cdn"
              className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Access Key ID</label>
            <input
              type="text"
              required
              value={formConfig.accessKeyId}
              onChange={(e) => setFormConfig({ ...formConfig, accessKeyId: e.target.value })}
              placeholder="e.g. A213...43B2"
              className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Secret Access Key</label>
            <input
              type="password"
              required
              value={formConfig.secretAccessKey}
              onChange={(e) => setFormConfig({ ...formConfig, secretAccessKey: e.target.value })}
              placeholder="••••••••••••••••••••••••••••••••"
              className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Bucket Region</label>
            <input
              type="text"
              value={formConfig.region}
              onChange={(e) => setFormConfig({ ...formConfig, region: e.target.value })}
              placeholder="auto"
              className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Public Custom Domain</label>
            <input
              type="text"
              required
              value={formConfig.customDomain || ''}
              onChange={(e) => setFormConfig({ ...formConfig, customDomain: e.target.value })}
              placeholder="https://cdn.vakrahara.org/v1"
              className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#d4af37] text-[#050508] rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
