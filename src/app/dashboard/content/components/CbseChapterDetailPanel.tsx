'use client';

import React, { useState } from 'react';
import { Layers, Plus, ChevronUp, ChevronDown, Trash2, Link2 } from 'lucide-react';
import { Chapter, Module } from '@/types/curriculum';
import { ChapterSettingsCard } from './ChapterSettingsCard';
import { LinkModuleModal } from './LinkModuleModal';

interface CbseChapterDetailPanelProps {
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
}

export function CbseChapterDetailPanel({
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
  onRequestDeleteModule
}: CbseChapterDetailPanelProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  return (
    <div className="xl:col-span-4 space-y-6">
      {/* Chapter Metadata & Settings Card */}
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

      {/* Modules Manifest List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#d4af37]" />
            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">
              Chapter Modules ({activeChapter.modules?.length || 0})
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
              className="p-1.5 bg-white/5 hover:bg-white/10 text-[#d4af37] rounded-lg border border-white/5 transition-all cursor-pointer"
              title="Add New Module"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {activeChapter.modules?.map((mod, index) => {
            const isSelected = mod.id === selectedModuleId;
            const stepsCount = (mod.learningSteps && mod.learningSteps.length > 0)
              ? mod.learningSteps.length
              : (mod.steps?.length || 0);

            return (
              <div
                key={mod.id}
                className={`group p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-white shadow-md'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                onClick={() => onSelectModule(mod.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">
                      Module {index + 1} • {stepsCount} steps
                    </span>
                    <span className="font-semibold text-xs truncate mt-0.5 block">
                      {mod.title || mod.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveModule(index, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Module Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveModule(index, 'down');
                      }}
                      disabled={index === activeChapter.modules.length - 1}
                      className="p-1 text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Module Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDeleteModule(mod);
                      }}
                      className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
                      title="Delete Module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {(!activeChapter.modules || activeChapter.modules.length === 0) && (
            <div className="p-8 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
              No modules in this chapter. Click &apos;+&apos; or &apos;Link from Library&apos; to add.
            </div>
          )}
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
