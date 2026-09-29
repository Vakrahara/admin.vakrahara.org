'use client';

import React from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { Chapter, Pyq } from '@/types/curriculum';

interface CbsePyqEditorPanelProps {
  activeChapter: Chapter;
  onAddPyq: () => void;
  onDeletePyq: (pyqId: string) => void;
  onUpdatePyq: (pyqId: string, patch: Partial<Pyq>) => void;
}

export function CbsePyqEditorPanel({
  activeChapter,
  onAddPyq,
  onDeletePyq,
  onUpdatePyq
}: CbsePyqEditorPanelProps) {
  const pyqs = activeChapter.pyqs || [];

  return (
    <div className="glass-panel border border-white/5 bg-black/40 p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Previous Year Questions (PYQs)
        </h4>
        <button
          type="button"
          onClick={onAddPyq}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/20 text-[#d4af37] rounded-lg text-xs font-semibold transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add PYQ
        </button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {pyqs.map((pyq) => (
          <div key={pyq.id} className="p-4 bg-[#08080c] border border-white/5 rounded-xl space-y-3 relative">
            <button
              type="button"
              onClick={() => onDeletePyq(pyq.id)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete PYQ"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Year</label>
                <input
                  type="text"
                  value={pyq.year}
                  onChange={(e) => onUpdatePyq(pyq.id, { year: e.target.value })}
                  className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Marks weightage</label>
                <input
                  type="text"
                  value={pyq.marks}
                  onChange={(e) => onUpdatePyq(pyq.id, { marks: e.target.value })}
                  className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Question text</label>
              <textarea
                value={pyq.question}
                rows={2}
                onChange={(e) => onUpdatePyq(pyq.id, { question: e.target.value })}
                className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>

            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Sample Answer</label>
              <textarea
                value={pyq.sampleAnswer}
                rows={3}
                onChange={(e) => onUpdatePyq(pyq.id, { sampleAnswer: e.target.value })}
                className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>

            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Marking Scheme Rubric</label>
              <textarea
                value={pyq.markingScheme}
                rows={2}
                onChange={(e) => onUpdatePyq(pyq.id, { markingScheme: e.target.value })}
                className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>

            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Related Module IDs (comma separated)</label>
              <input
                type="text"
                value={pyq.relatedModuleIds?.join(', ') || ''}
                onChange={(e) => {
                  const ids = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                  onUpdatePyq(pyq.id, { relatedModuleIds: ids });
                }}
                className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
          </div>
        ))}

        {pyqs.length === 0 && (
          <div className="p-8 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
            No PYQs added. Click &quot;Add PYQ&quot; above.
          </div>
        )}
      </div>
    </div>
  );
}
