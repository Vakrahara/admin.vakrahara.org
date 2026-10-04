'use client';

import React from 'react';
import { Database, Cloud, Package } from 'lucide-react';
import { CurriculumDataSource } from './CurriculumSourceModal';

interface CurriculumSourceOriginSelectorProps {
  currentSource: CurriculumDataSource;
  onSourceChange: (source: CurriculumDataSource) => void;
}

export function CurriculumSourceOriginSelector({
  currentSource,
  onSourceChange
}: CurriculumSourceOriginSelectorProps) {
  return (
    <div className="space-y-2.5">
      <label className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider block font-mono">
        Active Storage Origin
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* PocketBase */}
        <button
          type="button"
          onClick={() => onSourceChange('pb')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            currentSource === 'pb'
              ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-md ring-1 ring-[#d4af37]/40'
              : 'border-white/5 bg-[#0D111A] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Database className={`w-4 h-4 ${currentSource === 'pb' ? 'text-[#d4af37]' : 'text-gray-400'}`} />
            {currentSource === 'pb' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">ACTIVE</span>
            )}
          </div>
          <div>
            <div className="font-bold text-white text-xs">PocketBase</div>
            <div className="text-[10px] text-gray-400 mt-1">Draft DB &amp; Live Edits (Oracle VPS)</div>
          </div>
        </button>

        {/* Cloudflare R2 */}
        <button
          type="button"
          onClick={() => onSourceChange('cdn')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            currentSource === 'cdn'
              ? 'border-amber-400 bg-amber-500/10 shadow-md ring-1 ring-amber-400/40'
              : 'border-white/5 bg-[#0D111A] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Cloud className={`w-4 h-4 ${currentSource === 'cdn' ? 'text-amber-400' : 'text-gray-400'}`} />
            {currentSource === 'cdn' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">ACTIVE</span>
            )}
          </div>
          <div>
            <div className="font-bold text-white text-xs">Cloudflare R2</div>
            <div className="text-[10px] text-gray-400 mt-1">Production CDN Public Artifacts</div>
          </div>
        </button>

        {/* Canonical Core */}
        <button
          type="button"
          onClick={() => onSourceChange('canonical')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            currentSource === 'canonical'
              ? 'border-emerald-400 bg-emerald-500/10 shadow-md ring-1 ring-emerald-400/40'
              : 'border-white/5 bg-[#0D111A] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Package className={`w-4 h-4 ${currentSource === 'canonical' ? 'text-emerald-400' : 'text-gray-400'}`} />
            {currentSource === 'canonical' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">ACTIVE</span>
            )}
          </div>
          <div>
            <div className="font-bold text-white text-xs">Canonical Core</div>
            <div className="text-[10px] text-gray-400 mt-1">Bundled 42-Module Offline Spec</div>
          </div>
        </button>
      </div>
    </div>
  );
}
