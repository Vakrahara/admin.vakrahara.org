'use client';

import React, { useState } from 'react';
import { Plus, ChevronUp, ChevronDown, Trash2, Search, BookOpen } from 'lucide-react';
import { Chapter } from '@/types/curriculum';

interface CbseChaptersSidebarProps {
  chapters: Chapter[];
  allChapters?: Chapter[];
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onAddChapter: () => void;
  onMoveChapter: (index: number, direction: 'up' | 'down') => void;
  onRequestDeleteChapter: (chapter: Chapter) => void;
}

export function CbseChaptersSidebar({
  chapters,
  allChapters,
  selectedChapterId,
  onSelectChapter,
  onAddChapter,
  onMoveChapter,
  onRequestDeleteChapter
}: CbseChaptersSidebarProps) {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredChapters = chapters.filter(c =>
    (c.title || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (c.id || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (c.branchId || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalCount = allChapters && allChapters.length !== chapters.length ? allChapters.length : null;

  return (
    <div className="xl:col-span-3 space-y-4">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#d4af37]" />
          <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wider">
            Chapters ({chapters.length}{totalCount !== null ? ` of ${totalCount}` : ''})
          </h3>
        </div>
        <button
          type="button"
          onClick={onAddChapter}
          className="p-1.5 bg-white/5 hover:bg-white/10 text-[#d4af37] rounded-lg border border-white/5 transition-all cursor-pointer"
          title="Add New Chapter"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Search */}
      {(chapters.length > 4 || filterQuery) && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search chapters..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
      )}

      {/* Chapter Cards List */}
      <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
        {filteredChapters.map((ch) => {
          const isSelected = ch.id === selectedChapterId;
          const sourceList = allChapters && allChapters.length > 0 ? allChapters : chapters;
          const realIndex = sourceList.findIndex(c => c.id === ch.id);

          return (
            <div
              key={ch.id}
              className={`group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-white shadow-md'
                  : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              onClick={() => onSelectChapter(ch.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold font-mono tracking-wider opacity-60 uppercase block">
                    {ch.branchId || 'physics'} • {ch.modules?.length || 0} modules
                  </span>
                  <span className="font-semibold text-sm line-clamp-2 mt-1 block">
                    {ch.title || ch.id}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveChapter(realIndex, 'up');
                    }}
                    disabled={totalCount !== null || filterQuery.trim().length > 0 || realIndex <= 0}
                    className="p-1 text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer"
                    title={totalCount !== null || filterQuery.trim().length > 0 ? 'Clear filters to reorder chapters' : 'Move Chapter Up'}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveChapter(realIndex, 'down');
                    }}
                    disabled={totalCount !== null || filterQuery.trim().length > 0 || realIndex < 0 || realIndex >= sourceList.length - 1}
                    className="p-1 text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer"
                    title={totalCount !== null || filterQuery.trim().length > 0 ? 'Clear filters to reorder chapters' : 'Move Chapter Down'}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDeleteChapter(ch);
                    }}
                    className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
                    title="Delete Chapter"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredChapters.length === 0 && (
          <div className="p-6 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
            {filterQuery ? 'No chapters match search query' : 'No chapters match current filter criteria'}
          </div>
        )}
      </div>
    </div>
  );
}
