'use client';

import React from 'react';
import { 
  Video, 
  Sparkles, 
  Brain, 
  FileText, 
  Play, 
  HelpCircle, 
  Landmark 
} from 'lucide-react';
import { StepType } from '@/types/curriculum';

interface StepTypeOption {
  type: StepType;
  label: string;
  shortLabel: string;
  badge: 'MODERN' | 'LEGACY';
  icon: React.ElementType;
}

const STEP_OPTIONS: StepTypeOption[] = [
  { type: 'video_simulation', label: 'Video & Simulation', shortLabel: 'Video & Sim', badge: 'MODERN', icon: Video },
  { type: 'saraswati', label: 'Saraswati सयुक्तिक', shortLabel: 'Saraswati', badge: 'MODERN', icon: Sparkles },
  { type: 'anveshana', label: 'Anveshana (30-Q)', shortLabel: 'Anveshana', badge: 'MODERN', icon: Brain },
  { type: 'concept', label: 'Concept Note', shortLabel: 'Concept', badge: 'LEGACY', icon: FileText },
  { type: 'simulation', label: 'Lab Simulation', shortLabel: 'Lab Sim', badge: 'LEGACY', icon: Play },
  { type: 'predict_quiz', label: 'Predict Quiz', shortLabel: 'Quiz', badge: 'LEGACY', icon: HelpCircle },
  { type: 'heritage_connection', label: 'Heritage Sutra', shortLabel: 'Heritage', badge: 'LEGACY', icon: Landmark }
];

interface StepTypeSelectorProps {
  currentType: StepType;
  onTypeChange: (newType: StepType) => void;
  disabled?: boolean;
}

export function StepTypeSelector({ currentType, onTypeChange, disabled = false }: StepTypeSelectorProps) {
  const modernOptions = STEP_OPTIONS.filter(o => o.badge === 'MODERN');
  const legacyOptions = STEP_OPTIONS.filter(o => o.badge === 'LEGACY');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
          Pedagogical Architecture
        </label>
        <span className="text-[10px] text-[#d4af37] font-mono">
          Canonical Specification (§6)
        </span>
      </div>

      {/* Segmented Pill Selector Strip */}
      <div role="group" aria-label="Pedagogical Architecture" className="flex flex-wrap items-center gap-1.5 p-1 bg-[#05070d] border border-white/5 rounded-xl">
        {/* Modern Segment */}
        <span className="text-[9px] uppercase font-bold text-amber-400/80 px-1.5 font-mono">
          Modern:
        </span>
        {modernOptions.map((opt) => {
          const isSelected = currentType === opt.type;
          const IconComp = opt.icon;

          return (
            <button
              key={opt.type}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onTypeChange(opt.type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm ring-1 ring-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={opt.label}
            >
              <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-gray-500'}`} />
              <span>{opt.shortLabel}</span>
            </button>
          );
        })}

        <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

        {/* Legacy Segment */}
        <span className="text-[9px] uppercase font-bold text-gray-500 px-1.5 font-mono">
          Legacy:
        </span>
        {legacyOptions.map((opt) => {
          const isSelected = currentType === opt.type;
          const IconComp = opt.icon;

          return (
            <button
              key={opt.type}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onTypeChange(opt.type)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={opt.label}
            >
              <IconComp className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
              <span>{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
