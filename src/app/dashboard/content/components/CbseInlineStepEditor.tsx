'use client';

import React from 'react';
import { Step, StepType } from '@/types/curriculum';
import { StepTypeSelector } from './StepTypeSelector';
import { VideoMediaForm } from './VideoMediaForm';
import { TranscriptEditor } from './TranscriptEditor';
import { SaraswatiBuilderForm } from './SaraswatiBuilderForm';
import { AnveshanaPoolManager } from './AnveshanaPoolManager';
import { CbseLegacyStepEditor } from './CbseLegacyStepEditor';

interface CbseInlineStepEditorProps {
  step: Step;
  onUpdateStep: (patch: Partial<Step>) => void;
  onTypeChange: (newType: StepType) => void;
  onOpenBulkImport: () => void;
}

export function CbseInlineStepEditor({
  step,
  onUpdateStep,
  onTypeChange,
  onOpenBulkImport
}: CbseInlineStepEditorProps) {
  const isLegacy = ['concept', 'simulation', 'predict_quiz', 'heritage_connection'].includes(step.type);

  return (
    <div className="space-y-4 border-t border-white/5 pt-3 animate-fadeIn">
      {/* Pedagogical Step Architecture Selector */}
      <StepTypeSelector
        currentType={step.type}
        onTypeChange={onTypeChange}
      />

      {/* Video & Simulation Modern Step */}
      {step.type === 'video_simulation' && (
        <div className="space-y-4">
          <VideoMediaForm
            step={step}
            onChange={(patch) => onUpdateStep(patch)}
          />

          <TranscriptEditor
            transcript={step.transcript || []}
            onChange={(transcript) => onUpdateStep({ transcript })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl border border-slate-800 bg-[#080C14]">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
                Devanagari Subtitle (Deva)
              </label>
              <input
                type="text"
                value={step.textDeva || ''}
                onChange={(e) => onUpdateStep({ textDeva: e.target.value })}
                placeholder="e.g. प्रकाश का परावर्तन"
                className="w-full px-2.5 py-1.5 bg-[#03050B] border border-slate-800 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
                English Subtitle (Eng)
              </label>
              <input
                type="text"
                value={step.textEng || ''}
                onChange={(e) => onUpdateStep({ textEng: e.target.value })}
                placeholder="e.g. Reflection of Light"
                className="w-full px-2.5 py-1.5 bg-[#03050B] border border-slate-800 rounded-lg text-white text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Saraswati सयुक्तिक Concept Builder Modern Step */}
      {step.type === 'saraswati' && (
        <SaraswatiBuilderForm
          step={step}
          onChange={(patch) => onUpdateStep(patch)}
        />
      )}

      {/* Anveshana Dynamic Assessment Modern Step */}
      {step.type === 'anveshana' && (
        <AnveshanaPoolManager
          step={step}
          onChange={(patch) => onUpdateStep(patch)}
          onOpenBulkImport={onOpenBulkImport}
        />
      )}

      {/* Legacy Steps: concept, simulation, predict_quiz, heritage_connection */}
      {isLegacy && (
        <CbseLegacyStepEditor
          step={step}
          onUpdateStep={onUpdateStep}
        />
      )}
    </div>
  );
}
