'use client';

import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  ChevronUp, 
  Trash2, 
  Layers, 
  BookOpen
} from 'lucide-react';
import { Chapter, Module } from '@/types/curriculum';

interface CbseExplorerChapterNodeProps {
  chapter: Chapter;
  realIndex: number;
  isChSelected: boolean;
  isChActiveOverview: boolean;
  selectedModuleId: string | null;
  isExpanded: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  searchQuery?: string;
  isSearchFiltered?: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
  onSelectChapter: () => void;
  onSelectModule: (moduleId: string) => void;
  onAddModuleToChapter: () => void;
  onMoveChapter: (dir: 'up' | 'down') => void;
  onMoveModule: (mIdx: number, dir: 'up' | 'down') => void;
  onRequestDeleteChapter: () => void;
  onRequestDeleteModule: (module: Module) => void;
}

export function CbseExplorerChapterNode({
  chapter,
  isChSelected,
  isChActiveOverview,
  selectedModuleId,
  isExpanded,
  canMoveUp,
  canMoveDown,
  searchQuery,
  isSearchFiltered = false,
  onToggleExpand,
  onSelectChapter,
  onSelectModule,
  onAddModuleToChapter,
  onMoveChapter,
  onMoveModule,
  onRequestDeleteChapter,
  onRequestDeleteModule
}: CbseExplorerChapterNodeProps) {
  const modules = chapter.modules || [];

  return (
    <div className="rounded-xl border border-white/5 bg-[#05070d]/60 overflow-hidden">
      {/* Chapter Node Header */}
      <div
        onClick={onSelectChapter}
        className={`group flex items-center justify-between p-2.5 transition-all cursor-pointer select-none ${
          isChActiveOverview
            ? 'bg-[#d4af37]/15 border-l-2 border-l-[#d4af37] text-white'
            : isChSelected
            ? 'bg-white/[0.04] text-gray-200'
            : 'hover:bg-white/[0.03] text-gray-400 hover:text-gray-200'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-0.5 text-gray-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isChActiveOverview ? 'text-[#d4af37]' : 'text-gray-500'}`} />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-xs truncate block">
              {chapter.title || chapter.id}
            </span>
            <span className="text-[10px] text-gray-500 font-mono block">
              {chapter.branchId || 'physics'} • {modules.length} mod
            </span>
          </div>
        </div>

        {/* Chapter Hover Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddModuleToChapter(); }}
            className="p-1 text-gray-400 hover:text-[#d4af37] cursor-pointer"
            title="Add Module to this Chapter"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveChapter('up'); }}
            disabled={!canMoveUp}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            title={canMoveUp ? "Move Chapter Up" : "Cannot reorder chapter when filtered or at top"}
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveChapter('down'); }}
            disabled={!canMoveDown}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            title={canMoveDown ? "Move Chapter Down" : "Cannot reorder chapter when filtered or at bottom"}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRequestDeleteChapter(); }}
            className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
            title="Delete Chapter"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Nested Modules Tree */}
      {isExpanded && (
        <div className="pl-6 pr-2 py-1.5 space-y-1 bg-black/20 border-t border-white/5">
          {modules.map((mod, mIdx) => {
            const isModSelected = isChSelected && mod.id === selectedModuleId;
            const stepsCount = mod.learningSteps?.length || mod.steps?.length || 0;
            const q = (searchQuery || '').toLowerCase();
            const isSearchMatch = Boolean(
              q && (
                (mod.title || '').toLowerCase().includes(q) ||
                (mod.titleEn || '').toLowerCase().includes(q) ||
                (mod.titleHi || '').toLowerCase().includes(q) ||
                (mod.titleHng || '').toLowerCase().includes(q) ||
                (mod.id || '').toLowerCase().includes(q)
              )
            );

            return (
              <div
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`group flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-all cursor-pointer ${
                  isModSelected
                    ? 'bg-[#d4af37]/20 text-[#d4af37] font-semibold border border-[#d4af37]/30 shadow-sm'
                    : isSearchMatch
                    ? 'bg-[#d4af37]/10 text-white font-medium border border-[#d4af37]/40 ring-1 ring-[#d4af37]/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Layers className={`w-3 h-3 shrink-0 ${isModSelected ? 'text-[#d4af37]' : isSearchMatch ? 'text-amber-300' : 'text-gray-500'}`} />
                  <span className="truncate flex-1 text-[11px]">
                    {mod.title || mod.id}
                  </span>
                  <span className="text-[9px] font-mono opacity-60 shrink-0">
                    {stepsCount}s
                  </span>
                </div>

                {/* Module Actions on Hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onMoveModule(mIdx, 'up'); }}
                    disabled={mIdx === 0 || isSearchFiltered}
                    className="p-0.5 text-gray-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                    title={isSearchFiltered ? "Clear search to reorder modules" : "Move Module Up"}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onMoveModule(mIdx, 'down'); }}
                    disabled={mIdx === modules.length - 1 || isSearchFiltered}
                    className="p-0.5 text-gray-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                    title={isSearchFiltered ? "Clear search to reorder modules" : "Move Module Down"}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRequestDeleteModule(mod); }}
                    className="p-0.5 text-gray-400 hover:text-red-400 cursor-pointer"
                    title="Delete Module"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {modules.length === 0 && (
            <div className="py-2 text-[10px] text-gray-500 italic pl-2">
              No modules yet. Click &apos;+&apos; to add.
            </div>
          )}

          {/* Quick Add Module button inside chapter tree */}
          <button
            type="button"
            onClick={onAddModuleToChapter}
            className="w-full text-left py-1 px-2 text-[10px] text-[#d4af37]/70 hover:text-[#d4af37] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Module...</span>
          </button>
        </div>
      )}
    </div>
  );
}
