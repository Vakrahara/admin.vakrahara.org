'use client';

import React from 'react';
import { Video, Sparkles, Brain, FileText, Play, HelpCircle, Landmark } from 'lucide-react';
import { StepType } from '@/types/curriculum';

interface StepTypeOption {
  type: StepType;
  label: string;
  badge: 'MODERN' | 'LEGACY';
  description: string;
  icon: React.ElementType;
  accent: string;
}

const STEP_OPTIONS: StepTypeOption[] = [
  {
    type: 'video_simulation',
    label: 'Video & Simulation',
    badge: 'MODERN',
    description: 'Content-aware media area with R2 video streaming, WebGL simulation, 3-locale transcripts, and Gurutatva IKS insights.',
    icon: Video,
    accent: 'border-amber-500/50 text-amber-400 bg-amber-500/10'
  },
  {
    type: 'saraswati',
    label: 'Saraswati सयुक्तिक Builder',
    badge: 'MODERN',
    description: 'Native Compose progressive definition assembler with socratic mini-steps, clues, and gold shimmer reveal.',
    icon: Sparkles,
    accent: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
  },
  {
    type: 'anveshana',
    label: 'Anveshana Assessment',
    badge: 'MODERN',
    description: '30-question pool sampling, randomized MCQs, 80% passing gate, option permutations, and offline validation.',
    icon: Brain,
    accent: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
  },
  {
    type: 'concept',
    label: 'Concept Note (Legacy)',
    badge: 'LEGACY',
    description: 'Static bilingual reading text card with optional image illustration.',
    icon: FileText,
    accent: 'border-slate-700 text-slate-400 bg-slate-900/40'
  },
  {
    type: 'simulation',
    label: 'Simulation Canvas (Legacy)',
    badge: 'LEGACY',
    description: 'ACE simulation iframe without embedded video player or transcript.',
    icon: Play,
    accent: 'border-slate-700 text-slate-400 bg-slate-900/40'
  },
  {
    type: 'predict_quiz',
    label: 'Predict Quiz (Legacy)',
    badge: 'LEGACY',
    description: 'Single-question MCQ check with formative hint sheet.',
    icon: HelpCircle,
    accent: 'border-slate-700 text-slate-400 bg-slate-900/40'
  },
  {
    type: 'heritage_connection',
    label: 'Heritage Connection (Legacy)',
    badge: 'LEGACY',
    description: 'Sanskrit sutra card linking modern science to ancient Indian scientific insights.',
    icon: Landmark,
    accent: 'border-slate-700 text-slate-400 bg-slate-900/40'
  }
];

interface StepTypeSelectorProps {
  currentType: StepType;
  onTypeChange: (newType: StepType) => void;
  disabled?: boolean;
}

export function StepTypeSelector({ currentType, onTypeChange, disabled = false }: StepTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Pedagogical Step Architecture
        </label>
        <span className="text-[11px] text-amber-400/80 font-mono">
          Canonical Specification (§6)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {STEP_OPTIONS.map((opt) => {
          const isSelected = currentType === opt.type;
          const IconComponent = opt.icon;

          return (
            <button
              key={opt.type}
              type="button"
              disabled={disabled}
              onClick={() => onTypeChange(opt.type)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                  : 'border-slate-800 bg-[#0B0F19] hover:border-slate-700 hover:bg-[#0E1424]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className={`p-1.5 rounded-lg border ${opt.accent}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wide ${
                    opt.badge === 'MODERN'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {opt.badge}
                </span>
              </div>

              <div className="font-semibold text-xs text-white mb-1">
                {opt.label}
              </div>

              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
