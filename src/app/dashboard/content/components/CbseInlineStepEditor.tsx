'use client';

import React from 'react';
import { Step, StepType } from '@/types/curriculum';
import { StepTypeSelector } from './StepTypeSelector';
import { StepSlotSwitchboard } from './StepSlotSwitchboard';
import { SlotSubEditorsRenderer } from './SlotSubEditorsRenderer';
import { CbseLegacyStepEditor } from './CbseLegacyStepEditor';
import { TextHotspotsEditor } from './TextHotspotsEditor';

interface CbseInlineStepEditorProps {
  step: Step;
  onUpdateStep: (patch: Partial<Step>) => void;
  onTypeChange: (newType: StepType) => void;
  onOpenBulkImport: () => void;
  moduleId?: string;
}

export function CbseInlineStepEditor({
  step,
  onUpdateStep,
  onTypeChange,
  onOpenBulkImport,
  moduleId
}: CbseInlineStepEditorProps) {
  const isLegacy = ['concept', 'simulation', 'predict_quiz', 'heritage_connection'].includes(step.type);

  return (
    <div className="space-y-4 border-t border-white/5 pt-3 animate-fadeIn">
      {/* Pedagogical Step Architecture Selector */}
      <StepTypeSelector
        currentType={step.type}
        onTypeChange={onTypeChange}
      />

      {/* Composable Step Slot Switchboard (§R2, TICKET-03) */}
      <StepSlotSwitchboard
        step={step}
        onUpdateStep={onUpdateStep}
      />

      {/* Conditional Sub-Editors or Legacy Fallback (§R3) */}
      {step.slots || !isLegacy ? (
        <SlotSubEditorsRenderer
          step={step}
          onUpdateStep={onUpdateStep}
          onOpenBulkImport={onOpenBulkImport}
          moduleId={moduleId}
        />
      ) : (
        <>
          <CbseLegacyStepEditor
            step={step}
            onUpdateStep={onUpdateStep}
          />
          {step.type === 'concept' && (
            <TextHotspotsEditor
              step={step}
              onChange={onUpdateStep}
            />
          )}
        </>
      )}
    </div>
  );
}
