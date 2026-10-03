'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { 
  Step, 
  StepSlotKey, 
  getEffectiveStepSlots, 
  getEffectiveSlotOrder 
} from '@/types/curriculum';
import { VideoSlotEditor } from './VideoSlotEditor';
import { SimulationSlotEditor } from './SimulationSlotEditor';
import { ExplorableTextSlotEditor } from './ExplorableTextSlotEditor';
import { SaraswatiBuilderForm } from './SaraswatiBuilderForm';
import { AnveshanaPoolManager } from './AnveshanaPoolManager';
import { GurutatvaEditor } from './GurutatvaEditor';

interface SlotSubEditorsRendererProps {
  step: Step;
  onUpdateStep: (patch: Partial<Step>) => void;
  onOpenBulkImport?: () => void;
}

export function SlotSubEditorsRenderer({
  step,
  onUpdateStep,
  onOpenBulkImport
}: SlotSubEditorsRendererProps) {
  const effectiveSlots = getEffectiveStepSlots(step);
  const effectiveOrder = getEffectiveSlotOrder(step);

  const activeSlots = effectiveOrder.filter(key => effectiveSlots[key]);

  if (activeSlots.length === 0) {
    return (
      <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center space-y-2 bg-[#04060A]/60">
        <div className="inline-flex p-2 rounded-lg bg-slate-800/60 text-slate-400">
          <Layers className="w-5 h-5" />
        </div>
        <div className="text-xs font-semibold text-slate-300">
          No Component Slots Attached
        </div>
        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
          Use the Orchestration Switchboard above to attach Video, Simulation, Saraswati, Gurutatva, Anveshana, or Explorable Text.
        </p>
      </div>
    );
  }

  const renderSlotEditor = (slotKey: StepSlotKey) => {
    switch (slotKey) {
      case 'video':
        return (
          <VideoSlotEditor
            key="slot_video"
            step={step}
            onChange={onUpdateStep}
          />
        );
      case 'simulation':
        return (
          <SimulationSlotEditor
            key="slot_simulation"
            step={step}
            onChange={onUpdateStep}
          />
        );
      case 'saraswati':
        return (
          <SaraswatiBuilderForm
            key="slot_saraswati"
            step={step}
            onChange={onUpdateStep}
          />
        );
      case 'gurutatva':
        return (
          <GurutatvaEditor
            key="slot_gurutatva"
            gurutatva={step.gurutatva}
            onChange={(gurutatva) => onUpdateStep({ gurutatva })}
          />
        );
      case 'anveshana':
        return (
          <AnveshanaPoolManager
            key="slot_anveshana"
            step={step}
            onChange={onUpdateStep}
            onOpenBulkImport={onOpenBulkImport || (() => {})}
          />
        );
      case 'explorableText':
        return (
          <ExplorableTextSlotEditor
            key="slot_explorableText"
            step={step}
            onChange={onUpdateStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {activeSlots.map(key => renderSlotEditor(key))}
    </div>
  );
}
