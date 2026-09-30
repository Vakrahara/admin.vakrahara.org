'use client';

import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { Step, StepType } from '@/types/curriculum';
import { CbseInlineStepEditor } from './CbseInlineStepEditor';

interface ModuleStepsListProps {
  steps: Step[];
  activeEditStepId: string | null;
  onMoveStep: (index: number, direction: 'up' | 'down') => void;
  onSetActiveEditStepId: (stepId: string | null) => void;
  onOpenFocusedEditor: (stepId: string) => void;
  onUpdateModuleSteps: (steps: Step[]) => void;
  onPatchStep: (stepId: string, patch: Partial<Step>) => void;
  onTypeChange: (stepId: string, newType: StepType) => void;
  onOpenBulkImport: () => void;
}

export function ModuleStepsList({
  steps,
  activeEditStepId,
  onMoveStep,
  onSetActiveEditStepId,
  onOpenFocusedEditor,
  onUpdateModuleSteps,
  onPatchStep,
  onTypeChange,
  onOpenBulkImport
}: ModuleStepsListProps) {
  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
      {steps.map((step, sIndex) => {
        const isEditingStep = step.id === activeEditStepId;
        return (
          <div key={step.id} className="p-4 bg-[#08080c] border border-white/5 rounded-xl space-y-4 relative group">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-[#d4af37]/5 border border-[#d4af37]/20 text-[9px] font-bold text-[#d4af37] rounded-md uppercase tracking-wider">
                {step.type.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onMoveStep(sIndex, 'up')}
                  disabled={sIndex === 0}
                  className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveStep(sIndex, 'down')}
                  disabled={sIndex === steps.length - 1}
                  className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetActiveEditStepId(step.id);
                    onOpenFocusedEditor(step.id);
                  }}
                  className="p-1 text-gray-400 hover:text-[#d4af37] transition-colors cursor-pointer"
                  title="Open Full-Screen Focused Step Editor"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onSetActiveEditStepId(isEditingStep ? null : step.id)}
                  className={`p-1 transition-colors cursor-pointer ${isEditingStep ? 'text-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37]'}`}
                  title={isEditingStep ? "Collapse Step Details" : "Expand Inline Step Details"}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this step?')) {
                      onUpdateModuleSteps(steps.filter(s => s.id !== step.id));
                    }
                  }}
                  className="p-0.5 text-gray-500 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Step ID</label>
              <input
                type="text"
                value={step.id}
                onChange={(e) => {
                  const newId = e.target.value;
                  const updated = steps.map(s => s.id === step.id ? { ...s, id: newId } : s);
                  onUpdateModuleSteps(updated);
                  if (isEditingStep) onSetActiveEditStepId(newId);
                }}
                className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>

            <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  onSetActiveEditStepId(step.id);
                  onOpenFocusedEditor(step.id);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-[#d4af37] text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Edit Step (Focus Editor)</span>
              </button>
              <button
                type="button"
                onClick={() => onSetActiveEditStepId(isEditingStep ? null : step.id)}
                className="text-[10px] text-gray-500 hover:text-gray-300 text-center transition-colors cursor-pointer"
              >
                {isEditingStep ? '▲ Collapse Quick View' : '▼ Expand Quick Inline View'}
              </button>
            </div>

            {isEditingStep && (
              <CbseInlineStepEditor
                step={step}
                onUpdateStep={(patch) => onPatchStep(step.id, patch)}
                onTypeChange={(newType) => onTypeChange(step.id, newType)}
                onOpenBulkImport={onOpenBulkImport}
              />
            )}
          </div>
        );
      })}

      {steps.length === 0 && (
        <div className="p-8 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
          No steps inside this module. Select from the dropdown to add.
        </div>
      )}
    </div>
  );
}
