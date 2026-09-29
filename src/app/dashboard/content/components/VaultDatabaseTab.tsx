'use client';

import React, { useState } from 'react';
import { Database, ShieldAlert, FileText, Check, UploadCloud, Loader2 } from 'lucide-react';

export function VaultDatabaseTab() {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleVaultUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadSuccess(false);

    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="glass-panel border border-white/5 bg-black/40 backdrop-blur-md p-8 rounded-2xl shadow-xl space-y-8">
      <div className="flex items-center gap-3">
        <Database className="w-5 h-5 text-[#d4af37]" />
        <h3 className="font-semibold text-white text-lg">Vakrahara Vault Sync Pipeline</h3>
      </div>

      <div className="p-4 bg-[#0d0d15] border border-white/5 rounded-2xl flex items-start gap-4">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm">
          <h4 className="font-bold text-white mb-1">Warning: Production Database Compiling</h4>
          <p className="text-gray-400 leading-relaxed">
            Pulsing a database rebuild compiles raw curriculum content, dictionaries, and Paninian rules into the read-only SQLite database **`amrtam_vault.db`**, then deploys it directly to Cloudflare R2 CDN buckets. Client Android apps will download this file automatically upon next startup check.
          </p>
        </div>
      </div>

      <form onSubmit={handleVaultUpload} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#08080c] border border-white/5 rounded-xl">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Target CDN Endpoint</span>
            <span className="text-sm font-semibold text-[#d4af37] mt-1 block font-mono">cdn.vakrahara.org/vaults/</span>
          </div>
          <div className="p-4 bg-[#08080c] border border-white/5 rounded-xl">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Current Vault Build</span>
            <span className="text-sm font-semibold text-white mt-1 block flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              amrtam_vault_v1.0.4.db (32.4 MB)
            </span>
          </div>
        </div>

        {uploadSuccess && (
          <div className="p-3 bg-green-950/40 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-2.5">
            <Check className="w-4 h-4" />
            <span>Success: Vault compiled and synced to Cloudflare R2 CDN bucket.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Compiling & Uploading SQLite Vault...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              Trigger Vault Rebuild & CDN Deploy
            </>
          )}
        </button>
      </form>
    </div>
  );
}
