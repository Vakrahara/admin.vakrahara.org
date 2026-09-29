'use client';

import React from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Layers, Check, Eye } from 'lucide-react';
import { Step, StepType, MediaMode } from '@/types/curriculum';
import { StepTypeSelector } from './StepTypeSelector';
import { VideoMediaForm } from './VideoMediaForm';
import { TranscriptEditor } from './TranscriptEditor';
import { GurutatvaEditor } from './GurutatvaEditor';
import { SaraswatiBuilderForm } from './SaraswatiBuilderForm';
import { AnveshanaPoolManager } from './AnveshanaPoolManager';

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

          {/* Form per Step Type */}
          {step.type === 'video_simulation' && (
            <div className="space-y-6">
              <VideoMediaForm step={step} onChange={handlePatch} />
              <TranscriptEditor transcript={step.transcript || []} onChange={(transcript) => handlePatch({ transcript })} />
              <GurutatvaEditor gurutatva={step.gurutatva} onChange={(gurutatva) => handlePatch({ gurutatva })} />
            </div>
          )}

          {step.type === 'saraswati' && (
            <SaraswatiBuilderForm step={step} onChange={handlePatch} />
          )}

          {step.type === 'anveshana' && (
            <AnveshanaPoolManager step={step} onChange={handlePatch} onOpenBulkImport={onOpenBulkImport} />
          )}

          {step.type === 'concept' && (
            <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-[#0d0f17]">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Devanagari Title (Deva)
                </label>
                <input
                  type="text"
                  value={step.textDeva || ''}
                  onChange={(e) => handlePatch({ textDeva: e.target.value })}
                  className="w-full px-3 py-2 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  English Concept Text (Eng)
                </label>
                <textarea
                  value={step.textEng || ''}
                  rows={6}
                  onChange={(e) => handlePatch({ textEng: e.target.value })}
                  className="w-full px-3 py-2 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {step.type === 'simulation' && (
            <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-[#0d0f17]">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Simulation ID
                </label>
                <input
                  type="text"
                  value={step.simulationId || ''}
                  onChange={(e) => handlePatch({ simulationId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Prompt Question / Text
                </label>
                <textarea
                  value={step.questionText || ''}
                  rows={3}
                  onChange={(e) => handlePatch({ questionText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {step.type === 'predict_quiz' && (
            <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-[#0d0f17]">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={step.question || step.questionText || ''}
                  onChange={(e) => handlePatch({ question: e.target.value, questionText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Explanation
                </label>
                <textarea
                  value={step.explanation || ''}
                  rows={3}
                  onChange={(e) => handlePatch({ explanation: e.target.value })}
                  className="w-full px-3 py-2 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {step.type === 'heritage_connection' && (
            <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-[#0d0f17]">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Heritage Title
                </label>
                <input
                  type="text"
                  value={step.title || ''}
                  onChange={(e) => handlePatch({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Sutra / Classical Citation
                </label>
                <input
                  type="text"
                  value={step.sutra || ''}
                  onChange={(e) => handlePatch({ sutra: e.target.value })}
                  className="w-full px-3 py-2 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs font-serif"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Significance & Scientific Mapping
                </label>
                <textarea
                  value={step.significance || ''}
                  rows={4}
                  onChange={(e) => handlePatch({ significance: e.target.value })}
                  className="w-full px-3 py-2 bg-[#05070d] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>
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
