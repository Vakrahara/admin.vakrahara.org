'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Link2, Check, Plus, BookOpen, Layers } from 'lucide-react';
import { Chapter, Module, getModuleTitle } from '@/types/curriculum';
import { getDisciplineById } from '@/lib/disciplinesRegistry';
import { resolveBranchDisciplineId } from '../utils/curriculumFilterUtils';

interface LinkModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChapter: Chapter;
  allChapters: Chapter[];
  onLinkModule: (module: Module) => void;
}

interface LibraryModuleItem {
  module: Module;
  sourceChapterId: string;
  sourceChapterTitle: string;
  sourceChaptersCount: number;
}

export function LinkModuleModal({
  isOpen,
  onClose,
  activeChapter,
  allChapters,
  onLinkModule
}: LinkModuleModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Aggregate all unique modules across all chapters with intelligent authoring chapter attribution
  const libraryModules = useMemo(() => {
    const itemsMap = new Map<string, LibraryModuleItem>();

    for (const ch of (allChapters || [])) {
      if (!ch.modules || !Array.isArray(ch.modules)) continue;
      for (const mod of ch.modules) {
        if (!mod || !mod.id) continue;
        if (!itemsMap.has(mod.id)) {
          itemsMap.set(mod.id, {
            module: mod,
            sourceChapterId: ch.id,
            sourceChapterTitle: ch.title || ch.id,
            sourceChaptersCount: 1
          });
        } else {
          const item = itemsMap.get(mod.id)!;
          item.sourceChaptersCount++;
          // Prioritize original authoring chapter (module ID starts with chapter ID)
          if (mod.id.startsWith(ch.id) && !mod.id.startsWith(item.sourceChapterId)) {
            item.sourceChapterId = ch.id;
            item.sourceChapterTitle = ch.title || ch.id;
            item.module = mod;
          } else if (item.sourceChapterId === activeChapter?.id && ch.id !== activeChapter?.id && !mod.id.startsWith(item.sourceChapterId)) {
            item.sourceChapterId = ch.id;
            item.sourceChapterTitle = ch.title || ch.id;
          }
        }
      }
    }
    return Array.from(itemsMap.values());
  }, [allChapters, activeChapter?.id]);

  // Real-time search filter by title, subtitle, ID, discipline, grade, or source chapter
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return libraryModules;

    const resolvedQDiscipline = resolveBranchDisciplineId(q);

    return libraryModules.filter(({ module, sourceChapterTitle }) => {
      const title = getModuleTitle(module).toLowerCase();
      const id = (module.id || '').toLowerCase();
      const primaryDisc = (module.primaryDisciplineId || '').toLowerCase();
      const primaryResolved = resolveBranchDisciplineId(primaryDisc);
      const discEntry = module.primaryDisciplineId ? getDisciplineById(module.primaryDisciplineId) : undefined;
      const discName = discEntry ? discEntry.nameEn.toLowerCase() : '';
      const discNameHi = discEntry ? discEntry.nameHi.toLowerCase() : '';
      const sourceTitle = sourceChapterTitle.toLowerCase();
      const subtitle = (module.subtitle || module.subtitleEn || '').toLowerCase();
      const grades = module.applicableGrades || module.timelineMetadata?.applicableGrades || [];
      const gradeStr = grades.map(g => `class ${g} grade ${g} c${g}`).join(' ');

      const matchesResolvedDisc = resolvedQDiscipline
        ? (primaryDisc === resolvedQDiscipline ||
           primaryResolved === resolvedQDiscipline ||
           (module.disciplineIds && module.disciplineIds.some(d => {
             const dClean = d.toLowerCase();
             return dClean === resolvedQDiscipline || resolveBranchDisciplineId(dClean) === resolvedQDiscipline;
           })))
        : false;

      return (
        title.includes(q) ||
        subtitle.includes(q) ||
        id.includes(q) ||
        primaryDisc.includes(q) ||
        discName.includes(q) ||
        discNameHi.includes(q) ||
        sourceTitle.includes(q) ||
        gradeStr.includes(q) ||
        matchesResolvedDisc ||
        (module.disciplineIds && module.disciplineIds.some(d => d.toLowerCase().includes(q)))
      );
    });
  }, [libraryModules, searchQuery]);

  if (!isOpen) return null;

  const handleLink = (mod: Module) => {
    // Deep clone module to prevent accidental state reference leakage
    const cloned = JSON.parse(JSON.stringify(mod)) as Module;
    onLinkModule(cloned);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#080C14] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#d4af37]" />
              <h3 className="font-bold text-base text-white tracking-wide">
                Amrtam Module Library
              </h3>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Link existing modules into manifest: <span className="text-[#d4af37] font-semibold">{activeChapter?.title || 'Active Chapter'}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all cursor-pointer"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-white/5 bg-[#0d111a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library by module title, ID, grade, or discipline..."
              className="w-full pl-10 pr-9 py-2 bg-[#080C14] border border-white/10 rounded-xl text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#d4af37]/60"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-xs text-gray-400 font-mono shrink-0">
            {filteredItems.length} of {libraryModules.length} modules
          </div>
        </div>

        {/* Modules List View */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-white/5">
          {filteredItems.map(({ module, sourceChapterTitle, sourceChaptersCount }) => {
            const isAlreadyInChapter = activeChapter.modules?.some(m => m.id === module.id) ?? false;
            const stepsCount = (module.learningSteps && module.learningSteps.length > 0)
              ? module.learningSteps.length
              : (module.steps?.length || 0);
            const discEntry = module.primaryDisciplineId ? getDisciplineById(module.primaryDisciplineId) : undefined;
            const grades = module.applicableGrades || module.timelineMetadata?.applicableGrades || [];

            return (
              <div
                key={module.id}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] p-3 rounded-xl transition-all"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-white truncate">
                      {getModuleTitle(module)}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                      {module.id}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 text-gray-400">
                      <BookOpen className="w-3 h-3 text-gray-500" />
                      From: <span className="text-gray-300 font-medium">{sourceChapterTitle}</span>
                      {sourceChaptersCount > 1 && (
                        <span className="text-[10px] text-gray-500 font-mono">
                          (+{sourceChaptersCount - 1} other{sourceChaptersCount > 2 ? 's' : ''})
                        </span>
                      )}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-gray-400">
                      <Layers className="w-3 h-3 text-gray-500" />
                      {stepsCount} steps
                    </span>

                    {discEntry && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                          {discEntry.icon} {discEntry.nameEn}
                        </span>
                      </>
                    )}

                    {grades.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono">
                          Class {grades.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  {isAlreadyInChapter ? (
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold cursor-not-allowed opacity-80"
                      title="Module is already included in this chapter manifest"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Already in Chapter</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleLink(module)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d4af37] hover:bg-[#e5c04b] text-black font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                      title="Clone and attach module to current chapter"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Link Module</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="p-12 text-center text-gray-500 text-xs border border-dashed border-white/5 rounded-xl">
              {searchQuery ? 'No modules match search query.' : 'No modules found in library.'}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-gray-500">
          <span>Clicking &quot;+ Link Module&quot; immediately attaches the module to this chapter manifest.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
