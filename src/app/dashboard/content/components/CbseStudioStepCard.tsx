'use client';

import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Edit3, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { Step, StepType } from '@/types/curriculum';
import { formatStepId } from '@/lib/semanticId';
import { CbseInlineStepEditor } from './CbseInlineStepEditor';

interface CbseStudioStepCardProps {
  step: Step;
  sIndex: number;
  totalSteps: number;
  isEditingStep: boolean;
  onMoveStep: (dir: 'up' | 'down') => void;
  onOpenFocusedEditor: () => void;
  onToggleEditing: () => void;
  onDeleteStep: () => void;
  onUpdateStepId: (newId: string) => void;
  onPatchStep: (patch: Partial<Step>) => void;
  onTypeChange: (newType: StepType) => void;
  onOpenBulkImport: () => void;
  activeModuleId?: string;
}

export function CbseStudioStepCard({
  step,
  sIndex,
  totalSteps,
  isEditingStep,
  onMoveStep,
  onOpenFocusedEditor,
  onToggleEditing,
  onDeleteStep,
  onUpdateStepId,
  onPatchStep,
  onTypeChange,
  onOpenBulkImport,
  activeModuleId
}: CbseStudioStepCardProps) {
  return (
    <div className="p-4 bg-[#08080c] border border-white/10 rounded-xl space-y-3 relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] font-bold text-[#d4af37] rounded-md uppercase font-mono">
            {step.type.replace('_', ' ')}
          </span>
          {step.triggerMode && (
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-300 rounded uppercase">
              {step.triggerMode}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onMoveStep('up')}
            disabled={sIndex === 0}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer"
            title="Move Step Up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveStep('down')}
            disabled={sIndex === totalSteps - 1}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer"
            title="Move Step Down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onOpenFocusedEditor}
            className="p-1 text-gray-400 hover:text-[#d4af37] transition-colors cursor-pointer"
            title="Open Full-Screen Focus Editor"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleEditing}
            className={`p-1 transition-colors cursor-pointer ${isEditingStep ? 'text-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37]'}`}
            title={isEditingStep ? "Collapse Step" : "Expand Quick Inline Editor"}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDeleteStep}
            className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
            title="Delete Step"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block font-mono">
              Step ID
            </label>
            {activeModuleId && (
              <button
                type="button"
                onClick={() => onUpdateStepId(formatStepId(activeModuleId, sIndex + 1))}
                className="text-[9px] text-[#d4af37] hover:text-[#facc15] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Align to canonical ID format (mod_..._stp_NN)"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>✨ Align</span>
              </button>
            )}
          </div>
          <input
            type="text"
            value={step.id}
            onChange={(e) => onUpdateStepId(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={onOpenFocusedEditor}
            className="w-full py-1.5 px-3 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Launch Full Focus Editor</span>
          </button>
        </div>
      </div>

      {isEditingStep && (
        <CbseInlineStepEditor
          step={step}
          onUpdateStep={onPatchStep}
          onTypeChange={onTypeChange}
          onOpenBulkImport={onOpenBulkImport}
          moduleId={activeModuleId}
        />
      )}
    </div>
  );
}
