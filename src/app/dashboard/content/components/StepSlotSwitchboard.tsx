'use client';

import React from 'react';
import { 
  Sliders, 
  Video, 
  Layers, 
  Sparkles, 
  Landmark, 
  Brain, 
  FileText, 
  Check 
} from 'lucide-react';
import { 
  Step, 
  StepSlotKey, 
  StepTriggerMode, 
  STEP_SLOT_METAS, 
  TRIGGER_MODES, 
  getEffectiveStepSlots, 
  getEffectiveSlotOrder 
} from '@/types/curriculum';
import { StepSlotOrderList } from './StepSlotOrderList';

interface StepSlotSwitchboardProps {
  step: Step;
  onUpdateStep: (patch: Partial<Step>) => void;
  disabled?: boolean;
}

const SLOT_ICONS: Record<StepSlotKey, React.ElementType> = {
  video: Video,
  simulation: Layers,
  saraswati: Sparkles,
  gurutatva: Landmark,
  anveshana: Brain,
  explorableText: FileText
};

export function StepSlotSwitchboard({
  step,
  onUpdateStep,
  disabled = false
}: StepSlotSwitchboardProps) {
  const effectiveSlots = getEffectiveStepSlots(step);
  const effectiveOrder = getEffectiveSlotOrder(step);
  const currentTriggerMode = step?.triggerMode || 'immediate';

  const activeSlotsInOrder = effectiveOrder.filter(key => effectiveSlots[key]);

  const handleToggleSlot = (key: StepSlotKey) => {
    if (disabled || !step) return;
    const isCurrentlyActive = Boolean(effectiveSlots[key]);
    const nextSlots = {
      ...effectiveSlots,
      [key]: !isCurrentlyActive
    };

    let nextOrder: StepSlotKey[];
    if (!isCurrentlyActive) {
      // Activating slot: append to active slots, followed by remaining inactive slots
      const nextActiveOrder = [...activeSlotsInOrder, key];
      const remainingInactive = effectiveOrder.filter(k => k !== key && !nextSlots[k]);
      nextOrder = [...nextActiveOrder, ...remainingInactive];
    } else {
      // Deactivating slot: remove from active slots, followed by all inactive slots
      const nextActiveOrder = activeSlotsInOrder.filter(k => k !== key);
      const remainingInactive = effectiveOrder.filter(k => !nextSlots[k]);
      nextOrder = [...nextActiveOrder, ...remainingInactive];
    }

    onUpdateStep({
      slots: nextSlots,
      slotOrder: nextOrder
    });
  };

  const handleTriggerModeChange = (mode: StepTriggerMode) => {
    if (disabled || !step) return;
    onUpdateStep({ triggerMode: mode });
  };

  const handleReorderActive = (newActiveOrder: StepSlotKey[]) => {
    if (disabled || !step) return;
    const inactiveSlots = effectiveOrder.filter(k => !effectiveSlots[k]);
    const finalOrder = [...newActiveOrder, ...inactiveSlots];
    onUpdateStep({ slotOrder: finalOrder });
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-[#080C14] shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Orchestration Switchboard
              </h4>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 uppercase">
                Yantric HUD (§6)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Compose interactive components onto any step with dynamic trigger modes
            </p>
          </div>
        </div>

        <div className="text-[10px] text-amber-400/90 font-mono">
          {activeSlotsInOrder.length} of {Object.keys(STEP_SLOT_METAS).length} Slots Attached
        </div>
      </div>

      {/* Tactile Slot Toggles Grid */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Component Slots Attachments
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {(Object.keys(STEP_SLOT_METAS) as StepSlotKey[]).map((key) => {
            const meta = STEP_SLOT_METAS[key];
            const IconComponent = SLOT_ICONS[key];
            const isActive = Boolean(effectiveSlots[key]);

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => handleToggleSlot(key)}
                className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                  isActive
                    ? 'border-amber-400/70 bg-[#0B101D] shadow-md shadow-amber-500/5 ring-1 ring-amber-400/30'
                    : 'border-slate-800/80 bg-[#04060A] hover:border-slate-700 hover:bg-[#070B13] opacity-75'
                } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg border mt-0.5 shrink-0 ${
                      isActive
                        ? 'border-amber-400/50 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900 text-slate-500'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">
                      {meta.label}
                    </span>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                      {meta.tagline}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isActive
                      ? 'bg-amber-400 border-amber-300 text-black font-bold'
                      : 'border-slate-700 bg-slate-900/60 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trigger Mode Segmented Pills */}
      <div className="space-y-2 pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Trigger Mode & Orchestration Gate
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            Mode: {currentTriggerMode}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-[#03050B] border border-slate-800 rounded-xl">
          {TRIGGER_MODES.map((item) => {
            const isSelected = currentTriggerMode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                disabled={disabled}
                onClick={() => handleTriggerModeChange(item.mode)}
                title={item.description}
                className={`min-h-[44px] py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#d4af37] to-amber-500 text-black shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Slot Reordering */}
      <StepSlotOrderList
        activeSlotsInOrder={activeSlotsInOrder}
        disabled={disabled}
        onReorder={handleReorderActive}
      />
    </div>
  );
}
