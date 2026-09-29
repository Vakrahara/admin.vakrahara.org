'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Save, 
  UploadCloud, 
  Loader2, 
  AlertTriangle, 
  Check, 
  ChevronUp, 
  ChevronDown,
  Database
} from 'lucide-react';
import { CurriculumDataSource } from './CurriculumDataSourceBar';

interface CurriculumPublishFooterProps {
  isPublishing: boolean;
  isSavingDraft: boolean;
  publishCooldown: number;
  publishStatus: 'idle' | 'success' | 'error';
  publishSuccessMessage?: string;
  publishErrorMessage: string;
  validationErrors: string[] | null;
  onSaveDraft: () => void;
  onPublish: () => void;
  currentSource: CurriculumDataSource;
}

export function CurriculumPublishFooter({
  isPublishing,
  isSavingDraft,
  publishCooldown,
  publishStatus,
  publishSuccessMessage,
  publishErrorMessage,
  validationErrors = [],
  onSaveDraft,
  onPublish,
  currentSource
}: CurriculumPublishFooterProps) {
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const errorsList = validationErrors || [];

  return (
    <div className="fixed bottom-6 left-6 right-6 xl:left-72 bg-[#06080f]/95 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 z-40 animate-slideUp">
      {/* Expandable Validation Errors Drawer */}
      {errorsList.length > 0 && (
        <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-red-400">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Validation Blockers ({errorsList.length})
            </span>
            <button
              type="button"
              onClick={() => setShowErrorDrawer(!showErrorDrawer)}
              className="text-[11px] underline text-red-400 hover:text-white cursor-pointer"
            >
              {showErrorDrawer ? 'Hide' : 'Show details'}
            </button>
          </div>
          {showErrorDrawer && (
            <div className="max-h-32 overflow-y-auto space-y-1 font-mono text-[11px] pr-2">
              {errorsList.map((err, i) => (
                <div key={i} className="text-red-300/90">• {err}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Pipeline Status info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-white flex items-center gap-2">
              <span>Curriculum Control Hub</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-gray-400">
                Active Source: {currentSource === 'pb' ? 'PocketBase' : currentSource === 'cdn' ? 'R2 CDN' : 'Canonical Bundled'}
              </span>
            </div>
            <span className="text-gray-400 text-[11px]">
              Directly persist draft changes to PocketBase or publish live to Cloudflare R2 production CDN.
            </span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Save Draft to PocketBase */}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSavingDraft || isPublishing}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
            title="Save changes to PocketBase database without publishing to public CDN"
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                <span>Saving to PB...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4 text-[#d4af37]" />
                <span>Save Draft to PB</span>
              </>
            )}
          </button>

          {/* Publish to Cloudflare R2 Production CDN */}
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing || isSavingDraft || publishCooldown > 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:brightness-110 active:scale-[0.98] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
            title="Upload to Cloudflare R2 Production CDN and synchronize to PocketBase"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Publishing to R2...</span>
              </>
            ) : publishCooldown > 0 ? (
              <>
                <span>Cooldown ({publishCooldown}s)</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-black" />
                <span>Publish to R2 CDN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {publishStatus === 'success' && (
        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{publishSuccessMessage || 'Curriculum successfully published to Cloudflare R2 and synced to PocketBase database!'}</span>
        </div>
      )}

      {publishStatus === 'error' && publishErrorMessage && (
        <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="truncate">{publishErrorMessage}</span>
        </div>
      )}
    </div>
  );
}
