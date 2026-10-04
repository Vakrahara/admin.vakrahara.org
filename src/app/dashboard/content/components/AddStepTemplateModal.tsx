'use client';

import React, { useEffect } from 'react';
import { 
  X, 
  Video, 
  Sparkles, 
  Brain, 
  FileText, 
  Play, 
  HelpCircle, 
  Landmark,
  PlusCircle
} from 'lucide-react';
import { StepType } from '@/types/curriculum';

interface StepTemplate {
  type: StepType;
  label: string;
  badge: 'MODERN' | 'LEGACY';
  description: string;
  icon: React.ElementType;
  accent: string;
}

const TEMPLATES: StepTemplate[] = [
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

interface AddStepTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: StepType) => void;
}

export function AddStepTemplateModal({
  isOpen,
  onClose,
  onSelectType
}: AddStepTemplateModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-step-template-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="glass-panel bg-[#090B12] border border-[#d4af37]/30 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#05070D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center shrink-0">
              <PlusCircle className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h3 id="add-step-template-title" className="text-base font-bold text-white tracking-wide">
                Add Pedagogical Step Template
              </h3>
              <p className="text-xs text-gray-400">
                Select an architectural blueprint for this learning step in Amrtam (अमृतम्).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Grid Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Modern Pedagogical Blueprints */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider font-mono">
              Modern Pedagogical Blueprints (Interactive &amp; Socratic)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TEMPLATES.filter(t => t.badge === 'MODERN').map(tmpl => {
                const IconComponent = tmpl.icon;
                return (
                  <button
                    key={tmpl.type}
                    type="button"
                    onClick={() => {
                      onSelectType(tmpl.type);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0D111A] hover:border-[#d4af37] hover:bg-[#d4af37]/10 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-1.5 rounded-lg border ${tmpl.accent}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {tmpl.badge}
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-white group-hover:text-[#d4af37] transition-colors mb-1">
                        {tmpl.label}
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-3 leading-snug">
                        {tmpl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legacy Steps */}
          <div className="space-y-2.5 pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              Legacy Step Architecture
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {TEMPLATES.filter(t => t.badge === 'LEGACY').map(tmpl => {
                const IconComponent = tmpl.icon;
                return (
                  <button
                    key={tmpl.type}
                    type="button"
                    onClick={() => {
                      onSelectType(tmpl.type);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-white/5 bg-[#08080C] hover:border-white/20 hover:bg-white/[0.04] text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`p-1 rounded-md border ${tmpl.accent}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="font-semibold text-xs text-gray-200 group-hover:text-white truncate">
                        {tmpl.label.replace(' (Legacy)', '')}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">
                      {tmpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-end bg-[#05070D]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
