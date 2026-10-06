'use client';

import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Chapter, Module } from '@/types/curriculum';

interface CbseStudioWorkspaceHeaderProps {
  activeChapter: Chapter;
  activeModule: Module;
  stepsCount: number;
  isDirty?: boolean;
  isSaving?: boolean;
  onSave?: () => Promise<void> | void;
  onDiscard?: () => void;
  onBackToChapter: () => void;
}

export function CbseStudioWorkspaceHeader({
  activeChapter,
  activeModule,
  stepsCount,
  isDirty = false,
  isSaving = false,
  onSave,
  onDiscard,
  onBackToChapter
}: CbseStudioWorkspaceHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-[#080C14]/90 border border-white/10 rounded-2xl text-xs flex-wrap gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onBackToChapter}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-all cursor-pointer font-medium"
          title="Return to Chapter Overview"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Back to Chapter</span>
        </button>
        <span className="text-gray-600">›</span>
        <button
          type="button"
          onClick={onBackToChapter}
          className="text-gray-400 hover:text-[#d4af37] transition-colors font-medium truncate max-w-[180px]"
          title="Click to view Chapter Overview"
        >
          {activeChapter.title || activeChapter.id}
        </button>
        <span className="text-gray-600">›</span>
        <span className="font-bold text-white truncate max-w-[220px]">
          {activeModule.title || activeModule.id}
        </span>
        <span className="px-2 py-0.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-mono rounded-md">
          {stepsCount} Steps
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isDirty ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Unsaved Changes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
            ✓ Saved
          </span>
        )}

        {isDirty && onDiscard && (
          <button
            type="button"
            onClick={onDiscard}
            className="px-2.5 py-1 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 rounded-lg transition-all cursor-pointer text-xs font-semibold"
            title="Discard changes made since last save"
          >
            ↺ Discard
          </button>
        )}

        {onSave && (
          <button
            type="button"
            onClick={() => onSave()}
            disabled={isSaving || !isDirty}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isDirty
                ? 'bg-gradient-to-r from-[#d4af37] to-amber-500 text-black shadow-lg hover:brightness-110 active:scale-95'
                : 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed opacity-50'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
