'use client';

import React from 'react';
import { X, ChevronLeft, ChevronRight, Layers, Check } from 'lucide-react';
import { Step, StepType, MediaMode } from '@/types/curriculum';
import { StepTypeSelector } from './StepTypeSelector';
import { StepSlotSwitchboard } from './StepSlotSwitchboard';
import { SlotSubEditorsRenderer } from './SlotSubEditorsRenderer';
import { CbseLegacyStepEditor } from './CbseLegacyStepEditor';

interface FocusedStepEditorModalProps {
  isOpen: boolean;
  step: Step | null;
  moduleTitle?: string;
  chapterTitle?: string;
  allSteps: Step[];
  onClose: () => void;
  onUpdateStep: (updatedStep: Step) => void;
  onSelectStep: (stepId: string) => void;
  onOpenBulkImport: () => void;
}

export function FocusedStepEditorModal({
  isOpen,
  step,
  moduleTitle,
  chapterTitle,
  allSteps,
  onClose,
  onUpdateStep,
  onSelectStep,
  onOpenBulkImport
}: FocusedStepEditorModalProps) {
  if (!isOpen || !step) return null;

  const currentIndex = allSteps.findIndex(s => s.id === step.id);
  const prevStep = currentIndex > 0 ? allSteps[currentIndex - 1] : null;
  const nextStep = currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null;

  const isLegacy = ['concept', 'simulation', 'predict_quiz', 'heritage_connection'].includes(step.type);

  const handlePatch = (patch: Partial<Step>) => {
    onUpdateStep({ ...step, ...patch });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="glass-panel bg-[#090b12] border border-amber-500/20 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-[#05070d]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 truncate uppercase tracking-wider flex items-center gap-1.5">
                <span>{chapterTitle || 'Chapter'}</span>
                <span>›</span>
                <span className="text-gray-300">{moduleTitle || 'Module'}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Step Focus Editor:</span>
                <span className="font-mono text-[#d4af37] text-xs sm:text-sm">{step.id}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Step Navigation */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => prevStep && onSelectStep(prevStep.id)}
                disabled={!prevStep}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                title="Previous Step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-gray-400 px-2">
                {currentIndex + 1} / {allSteps.length}
              </span>
              <button
                type="button"
                onClick={() => nextStep && onSelectStep(nextStep.id)}
                disabled={!nextStep}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                title="Next Step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              title="Close Focused Editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 pr-4">
          {/* Step Identity & Type Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-white/5 bg-[#0d0f17]">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                Step ID
              </label>
              <input
                type="text"
                value={step.id}
                onChange={(e) => handlePatch({ id: e.target.value })}
                className="w-full px-3 py-2 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#d4af37]/60"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                Pedagogical Step Type
              </label>
              <StepTypeSelector
                currentType={step.type}
                onTypeChange={(newType: StepType) => {
                  handlePatch({
                    type: newType,
                    ...(newType === 'video_simulation' && !step.mediaMode ? { mediaMode: 'both' as MediaMode, subStepCount: 3 } : {}),
                    ...(newType === 'saraswati' && !step.miniSteps ? { miniSteps: [], definitionEn: '' } : {}),
                    ...(newType === 'anveshana' && !step.questionPool ? { pool: [], questionPool: [], questionsPerAttempt: 5, passingScore: 4 } : {})
                  });
                }}
              />
            </div>
          </div>

          {/* Visual Step Slot Switchboard (§R2, TICKET-03) */}
          <StepSlotSwitchboard
            step={step}
            onUpdateStep={handlePatch}
          />

          {/* Sub-Editors conditionally rendered based on toggled slots or legacy fallback (§R3) */}
          {step.slots || !isLegacy ? (
            <SlotSubEditorsRenderer
              step={step}
              onUpdateStep={handlePatch}
              onOpenBulkImport={onOpenBulkImport}
            />
          ) : (
            <div className="p-4 rounded-xl border border-white/5 bg-[#0d0f17]">
              <CbseLegacyStepEditor
                step={step}
                onUpdateStep={handlePatch}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 flex items-center justify-between bg-[#05070d]">
          <span className="text-xs text-gray-400">
            All edits are synchronized in memory to the active module.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-amber-500 hover:brightness-110 text-black font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Done Editing Step</span>
          </button>
        </div>
      </div>
    </div>
  );
}
