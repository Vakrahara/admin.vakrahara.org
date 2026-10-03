'use client';

import React from 'react';
import { BookOpenCheck, FileText, Sparkles, UploadCloud } from 'lucide-react';
import { Chapter } from '@/types/curriculum';
import { ConcurrencyLockBadge } from './ConcurrencyLockBadge';
import { QuestionReadinessMatrix } from './QuestionReadinessMatrix';

interface ChapterSettingsCardProps {
  activeChapter: Chapter;
  selectedModuleId: string | null;
  editingPyqId: string | null;
  showReadinessMatrix: boolean;
  onToggleReadinessMatrix: () => void;
  onTogglePyqMode: () => void;
  onOpenBulkImport: () => void;
  onOpenVersionHistory: () => void;
  onUpdateChapter: (updated: Partial<Chapter>) => void;
  onSelectModule: (moduleId: string) => void;
}

export function ChapterSettingsCard({
  activeChapter,
  selectedModuleId,
  editingPyqId,
  showReadinessMatrix,
  onToggleReadinessMatrix,
  onTogglePyqMode,
  onOpenBulkImport,
  onOpenVersionHistory,
  onUpdateChapter,
  onSelectModule
}: ChapterSettingsCardProps) {
  return (
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
          <label htmlFor="chapter-id-input" className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
            Chapter ID
          </label>
          <input
            id="chapter-id-input"
            type="text"
            value={activeChapter.id}
            onChange={(e) => onUpdateChapter({ id: e.target.value })}
            className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>

        <div>
          <label htmlFor="chapter-title-input" className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
            Chapter Title
          </label>
          <input
            id="chapter-title-input"
            type="text"
            value={activeChapter.title}
            onChange={(e) => onUpdateChapter({ title: e.target.value })}
            className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="chapter-branch-input" className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Branch ID
            </label>
            <input
              id="chapter-branch-input"
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
  );
}
