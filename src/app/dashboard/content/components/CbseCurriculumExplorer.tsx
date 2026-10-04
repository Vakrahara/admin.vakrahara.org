'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Plus, 
  Search, 
  X,
  PanelLeftClose, 
  PanelLeftOpen
} from 'lucide-react';
import { Chapter, Module } from '@/types/curriculum';
import { CbseExplorerChapterNode } from './CbseExplorerChapterNode';

interface CbseCurriculumExplorerProps {
  chapters: Chapter[];
  allChapters?: Chapter[];
  selectedChapterId: string | null;
  selectedModuleId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onSelectModule: (chapterId: string, moduleId: string) => void;
  onAddChapter: () => void;
  onAddModuleToChapter: (chapterId: string) => void;
  onMoveChapter: (index: number, direction: 'up' | 'down') => void;
  onMoveModule: (chapterId: string, moduleIndex: number, direction: 'up' | 'down') => void;
  onRequestDeleteChapter: (chapter: Chapter) => void;
  onRequestDeleteModule: (chapterId: string, module: Module) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CbseCurriculumExplorer({
  chapters,
  allChapters,
  selectedChapterId,
  selectedModuleId,
  onSelectChapter,
  onSelectModule,
  onAddChapter,
  onAddModuleToChapter,
  onMoveChapter,
  onMoveModule,
  onRequestDeleteChapter,
  onRequestDeleteModule,
  isCollapsed = false,
  onToggleCollapse
}: CbseCurriculumExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(() => 
    new Set(selectedChapterId ? [selectedChapterId] : [])
  );

  // Auto-expand selected chapter
  useEffect(() => {
    if (selectedChapterId) {
      setExpandedChapterIds(prev => {
        const next = new Set(prev);
        next.add(selectedChapterId);
        return next;
      });
    }
  }, [selectedChapterId]);

  const toggleExpand = (chId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedChapterIds(prev => {
      const next = new Set(prev);
      if (next.has(chId)) next.delete(chId);
      else next.add(chId);
      return next;
    });
  };

  const isFiltered = Boolean(searchQuery.trim());
  const filteredChapters = chapters.filter(c => {
    if (!isFiltered) return true;
    const query = searchQuery.trim().toLowerCase();
    const chMatch = (c.title || '').toLowerCase().includes(query) ||
                    (c.id || '').toLowerCase().includes(query) ||
                    (c.branchId || '').toLowerCase().includes(query) ||
                    (c.titleHi || '').toLowerCase().includes(query) ||
                    (c.titleDeva || '').toLowerCase().includes(query);
    const modMatch = (c.modules || []).some(m => 
      (m.title || '').toLowerCase().includes(query) ||
      (m.titleEn || '').toLowerCase().includes(query) ||
      (m.titleHi || '').toLowerCase().includes(query) ||
      (m.titleHng || '').toLowerCase().includes(query) ||
      (m.id || '').toLowerCase().includes(query)
    );
    return chMatch || modMatch;
  });

  const totalCount = allChapters && allChapters.length !== chapters.length ? allChapters.length : null;

  if (isCollapsed) {
    return (
      <div className="glass-panel border border-white/10 bg-[#080C14]/90 rounded-2xl p-2.5 flex flex-row lg:flex-col items-center justify-between lg:justify-start gap-3 py-3 lg:py-4 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 bg-white/5 hover:bg-white/10 text-[#d4af37] rounded-xl transition-all cursor-pointer"
            title="Expand Curriculum Explorer"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <span className="lg:hidden text-xs font-bold text-gray-300 font-mono">
            Curriculum Explorer
          </span>
        </div>
        <div className="h-[1px] w-6 bg-white/10 hidden lg:block" />
        <div className="hidden lg:block [writing-mode:vertical-rl] text-[11px] font-bold text-gray-400 tracking-wider uppercase font-mono py-2">
          Curriculum Explorer
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel border border-white/10 bg-[#080C14]/95 rounded-2xl p-4 shadow-xl space-y-3.5 flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-[#d4af37]" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-200 font-mono">
            Explorer ({chapters.length}{totalCount !== null ? ` of ${totalCount}` : ''})
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAddChapter}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] rounded-lg border border-[#d4af37]/30 text-[11px] font-bold transition-all cursor-pointer"
            title="Add New Chapter"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Chapter</span>
          </button>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              title="Collapse Explorer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search chapters or modules..."
          className="w-full pl-8 pr-8 py-1.5 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-[#d4af37]/60"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
            title="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tree Content Area */}
      <div className="space-y-2 max-h-[calc(100vh-280px)] min-h-[350px] overflow-y-auto pr-1">
        {filteredChapters.map((ch) => {
          const isChSelected = ch.id === selectedChapterId;
          const isChActiveOverview = isChSelected && !selectedModuleId;
          const isExpanded = expandedChapterIds.has(ch.id) || Boolean(searchQuery.trim());
          const sourceList = allChapters && allChapters.length > 0 ? allChapters : chapters;
          const realIndex = sourceList.findIndex(c => c.id === ch.id);
          const canMoveUp = totalCount === null && !isFiltered && realIndex > 0;
          const canMoveDown = totalCount === null && !isFiltered && realIndex >= 0 && realIndex < sourceList.length - 1;

          return (
            <CbseExplorerChapterNode
              key={ch.id}
              chapter={ch}
              realIndex={realIndex}
              isChSelected={isChSelected}
              isChActiveOverview={isChActiveOverview}
              selectedModuleId={selectedModuleId}
              isExpanded={isExpanded}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              searchQuery={searchQuery.trim()}
              isSearchFiltered={isFiltered}
              onToggleExpand={(e) => toggleExpand(ch.id, e)}
              onSelectChapter={() => onSelectChapter(ch.id)}
              onSelectModule={(modId) => onSelectModule(ch.id, modId)}
              onAddModuleToChapter={() => onAddModuleToChapter(ch.id)}
              onMoveChapter={(dir) => onMoveChapter(realIndex, dir)}
              onMoveModule={(mIdx, dir) => onMoveModule(ch.id, mIdx, dir)}
              onRequestDeleteChapter={() => onRequestDeleteChapter(ch)}
              onRequestDeleteModule={(mod) => onRequestDeleteModule(ch.id, mod)}
            />
          );
        })}

        {filteredChapters.length === 0 && (
          <div className="p-6 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
            {searchQuery ? 'No matching chapters or modules' : 'No chapters in view'}
          </div>
        )}
      </div>
    </div>
  );
}
