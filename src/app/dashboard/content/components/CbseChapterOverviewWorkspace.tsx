'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Plus, 
  Link2, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Chapter, Module, Pyq } from '@/types/curriculum';
import { ChapterSettingsCard } from './ChapterSettingsCard';
import { LinkModuleModal } from './LinkModuleModal';
import { CbsePyqEditorPanel } from './CbsePyqEditorPanel';

interface CbseChapterOverviewWorkspaceProps {
  activeChapter: Chapter;
  chapters: Chapter[];
  selectedModuleId: string | null;
  editingPyqId: string | null;
  showReadinessMatrix: boolean;
  onToggleReadinessMatrix: () => void;
  onTogglePyqMode: () => void;
  onOpenBulkImport: () => void;
  onOpenVersionHistory: () => void;
  onUpdateChapter: (updated: Partial<Chapter>) => void;
  onSelectModule: (moduleId: string) => void;
  onAddModule: () => void;
  onMoveModule: (index: number, direction: 'up' | 'down') => void;
  onRequestDeleteModule: (module: Module) => void;
  onAddPyq: () => void;
  onDeletePyq: (pyqId: string) => void;
  onUpdatePyq: (pyqId: string, patch: Partial<Pyq>) => void;
}

export function CbseChapterOverviewWorkspace({
  activeChapter,
  chapters,
  selectedModuleId,
  editingPyqId,
  showReadinessMatrix,
  onToggleReadinessMatrix,
  onTogglePyqMode,
  onOpenBulkImport,
  onOpenVersionHistory,
  onUpdateChapter,
  onSelectModule,
  onAddModule,
  onMoveModule,
  onRequestDeleteModule,
  onAddPyq,
  onDeletePyq,
  onUpdatePyq
}: CbseChapterOverviewWorkspaceProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // If currently in PYQ management mode, show full-width PYQ editor with back button
  if (editingPyqId === 'pyq_list') {
    return (
      <div className="space-y-4">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePyqMode}
              className="text-[#d4af37] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{activeChapter.title || 'Chapter Overview'}</span>
            </button>
            <span className="text-gray-500">›</span>
            <span className="text-white font-medium">Past Year Questions (PYQs)</span>
          </div>
          <button
            type="button"
            onClick={onTogglePyqMode}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-semibold text-xs transition-all cursor-pointer"
          >
            Done with PYQs
          </button>
        </div>

        <CbsePyqEditorPanel
          activeChapter={activeChapter}
          onAddPyq={onAddPyq}
          onDeletePyq={onDeletePyq}
          onUpdatePyq={onUpdatePyq}
        />
      </div>
    );
  }

  const modules = activeChapter.modules || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Contextual Breadcrumb */}
      <div className="flex items-center justify-between p-3.5 bg-[#080C14]/90 border border-white/10 rounded-2xl text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-gray-400">
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="text-gray-500 font-mono uppercase text-[10px]">Chapter Workspace</span>
            <span className="text-gray-600">›</span>
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide">
            {activeChapter.title || activeChapter.id}
          </h2>
          <span className="px-2 py-0.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-mono rounded-md uppercase">
            {activeChapter.branchId || 'physics'}
          </span>
          <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-mono rounded-md uppercase">
            Class {activeChapter.grade || 10}
          </span>
        </div>
        <div className="text-gray-400 text-xs hidden sm:block font-mono">
          {modules.length} modules • {activeChapter.pyqs?.length || 0} PYQs
        </div>
      </div>

      {/* Spacious 2-Column or Stacked Grid: Settings & Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Column: Chapter Metadata & Settings Card (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <ChapterSettingsCard
            activeChapter={activeChapter}
            selectedModuleId={selectedModuleId}
            editingPyqId={editingPyqId}
            showReadinessMatrix={showReadinessMatrix}
            onToggleReadinessMatrix={onToggleReadinessMatrix}
            onTogglePyqMode={onTogglePyqMode}
            onOpenBulkImport={onOpenBulkImport}
            onOpenVersionHistory={onOpenVersionHistory}
            onUpdateChapter={onUpdateChapter}
            onSelectModule={onSelectModule}
          />
        </div>

        {/* Right Sub-Column: Chapter Modules Manifest Catalog (lg:col-span-7) */}
        <div className="lg:col-span-7 glass-panel border border-white/5 bg-black/40 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d4af37]" />
              <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider font-mono">
                Chapter Modules ({modules.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Link Module from Library"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Link from Library</span>
              </button>
              <button
                type="button"
                onClick={onAddModule}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#d4af37] to-amber-500 hover:brightness-110 text-black rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                title="Add New Module"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            </div>
          </div>

          {/* Modules List Cards */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {modules.map((mod, index) => {
              const stepsCount = mod.learningSteps?.length || mod.steps?.length || 0;

              return (
                <div
                  key={mod.id}
                  className="group p-4 rounded-xl border border-white/5 bg-[#08080C] hover:border-[#d4af37]/40 hover:bg-[#0c0e17] transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSelectModule(mod.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#d4af37] uppercase font-bold">
                          Module {index + 1}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {stepsCount} pedagogical steps
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-white mt-1 group-hover:text-[#d4af37] transition-colors line-clamp-1">
                        {mod.title || mod.id}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                        ID: {mod.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Open Studio action button */}
                      <button
                        type="button"
                        onClick={() => onSelectModule(mod.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/30 text-[#d4af37] rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        title="Open Module Studio & Step Editor"
                      >
                        <span>Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Reorder and Delete controls */}
                      <div className="flex items-center gap-0.5 ml-1">
                        <button
                          type="button"
                          onClick={() => onMoveModule(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveModule(index, 'down')}
                          disabled={index === modules.length - 1}
                          className="p-1 text-gray-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDeleteModule(mod)}
                          className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
                          title="Delete Module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {modules.length === 0 && (
              <div className="p-8 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
                No modules in this chapter. Click &apos;Add Module&apos; or &apos;Link from Library&apos; to begin.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Library Linking Modal */}
      <LinkModuleModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        activeChapter={activeChapter}
        allChapters={chapters}
        onLinkModule={(linkedMod) => {
          if (activeChapter.modules?.some(m => m.id === linkedMod.id)) return;
          onUpdateChapter({
            modules: [...(activeChapter.modules || []), linkedMod]
          });
          onSelectModule(linkedMod.id);
        }}
      />
    </div>
  );
}
