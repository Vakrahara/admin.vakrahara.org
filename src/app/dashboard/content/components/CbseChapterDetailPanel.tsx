'use client';

import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  Layers, 
  FileText, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Sparkles, 
  UploadCloud, 
  FileCode 
} from 'lucide-react';
import { Chapter, Module } from '@/types/curriculum';
import { ConcurrencyLockBadge } from './ConcurrencyLockBadge';
import { QuestionReadinessMatrix } from './QuestionReadinessMatrix';

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
  return (
    <div className="xl:col-span-4 space-y-6">
      {/* Chapter Metadata Editor */}
      <div className="glass-panel border border-white/5 bg-black/40 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4" />
            Chapter Settings
          </h4>
          <ConcurrencyLockBadge
            lockedBy={(activeChapter as any).lockedBy || null}
            currentUser="admin@vakrahara.org"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Chapter ID
            </label>
            <input
              type="text"
              value={activeChapter.id}
              onChange={(e) => onUpdateChapter({ id: e.target.value })}
              className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Chapter Title
            </label>
            <input
              type="text"
              value={activeChapter.title}
              onChange={(e) => onUpdateChapter({ title: e.target.value })}
              className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
                Branch ID
              </label>
              <input
                type="text"
                value={activeChapter.branchId || 'physics'}
                onChange={(e) => onUpdateChapter({ branchId: e.target.value })}
                placeholder="e.g. physics"
                className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={onTogglePyqMode}
                className={`w-full py-2 border rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  editingPyqId === 'pyq_list'
                    ? 'bg-[#d4af37] text-black border-transparent shadow-md'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Manage PYQs ({activeChapter.pyqs?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* Chapter Toolkit */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onToggleReadinessMatrix}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showReadinessMatrix
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-[#08080c] text-gray-400 hover:text-white border-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showReadinessMatrix ? 'Hide' : 'Audit'} 30-Q Readiness</span>
            </button>

            <button
              type="button"
              onClick={onOpenBulkImport}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/5 bg-[#08080c] text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bulk Import</span>
            </button>

            <button
              type="button"
              onClick={onOpenVersionHistory}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/5 bg-[#08080c] text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <BookOpenCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Version History</span>
            </button>
          </div>

          {/* Collapsible Readiness Matrix */}
          {showReadinessMatrix && (
            <div className="pt-2 animate-fadeIn">
              <QuestionReadinessMatrix
                chapter={activeChapter}
                selectedModuleId={selectedModuleId}
                onSelectModule={onSelectModule}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#d4af37]" />
            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">
              Chapter Modules ({activeChapter.modules?.length || 0})
            </h3>
          </div>
          <button
            type="button"
            onClick={onAddModule}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-[#d4af37] rounded-lg border border-white/5 transition-all cursor-pointer"
            title="Add New Module"
          >
            <Plus className="w-4 h-4" />
          </button>
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
              No modules in this chapter. Click '+' to add.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
