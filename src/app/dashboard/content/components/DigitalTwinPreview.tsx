'use client';

import React from 'react';
import { Smartphone, Play, Sparkles, HelpCircle, BookOpen } from 'lucide-react';

interface Step {
  type: 'concept' | 'simulation' | 'predict_quiz' | 'heritage_connection';
  id?: string;
  textDeva?: string;
  textEng?: string;
  simulationId?: string;
  params?: Record<string, any>;
  questionText?: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  hints?: string[];
  sutra?: string;
}

interface DigitalTwinPreviewProps {
  step: Step | null;
  moduleTitle?: string;
}

export const DigitalTwinPreview: React.FC<DigitalTwinPreviewProps> = ({ step, moduleTitle }) => {
  if (!step) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 border border-slate-800 rounded-2xl bg-slate-950/40">
        <Smartphone className="w-12 h-12 mb-3 text-amber-500/40 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-400">Digital Twin Live Preview</h4>
        <p className="text-xs text-slate-600 mt-1 max-w-xs">
          Select a step to see how it renders inside the Amritam Android App in real-time.
        </p>
      </div>
    );
  }

  const cdnUrl = 'https://cdn.vakrahara.org/v1';

  return (
    <div className="flex flex-col h-full bg-slate-950/80 border border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Mobile Bar Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-amber-500/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-[11px] font-bold tracking-wide uppercase text-amber-400">Amritam Live View</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{step.type}</span>
      </div>

      {/* Main Canvas / Content Simulation Screen */}
      <div className="relative flex-1 bg-[#0b0d17] overflow-hidden flex flex-col justify-between p-4">
        {/* Module Title Overlay */}
        <div className="z-10 flex items-center justify-between bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
          <span className="text-xs font-medium text-slate-300 truncate">{moduleTitle || 'Module Walkthrough'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
            {step.type.replace('_', ' ')}
          </span>
        </div>

        {/* Center Canvas / Simulation Frame */}
        <div className="my-auto relative flex items-center justify-center min-h-[220px]">
          {step.simulationId ? (
            <iframe
              src={`${cdnUrl}/cbse/simulations/${step.simulationId}.html`}
              className="w-full h-56 border-0 rounded-xl bg-black/40 shadow-inner"
              title="Simulation Preview"
            />
          ) : (
            <div className="w-full h-44 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-purple-500/5 flex flex-col items-center justify-center p-4 text-center">
              {step.type === 'predict_quiz' ? (
                <HelpCircle className="w-10 h-10 text-purple-400 mb-2" />
              ) : step.type === 'heritage_connection' ? (
                <Sparkles className="w-10 h-10 text-amber-400 mb-2" />
              ) : (
                <BookOpen className="w-10 h-10 text-blue-400 mb-2" />
              )}
              <span className="text-xs text-slate-400 font-medium">Concept Explanation Canvas</span>
            </div>
          )}
        </div>

        {/* Quiz View or Concept Insight Card */}
        {step.type === 'predict_quiz' ? (
          <div className="z-10 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-xl p-3 shadow-xl">
            <h5 className="text-xs font-bold text-amber-300 mb-2">{step.questionText || 'Quiz Question'}</h5>
            <div className="space-y-1.5">
              {(step.options || ['Option A', 'Option B']).map((opt, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    idx === step.correctOptionIndex
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Native Glassmorphic Insight Card */
          <div className="z-10 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-xl p-3.5 shadow-xl">
            {step.textDeva && (
              <p className="text-sm font-semibold text-amber-200 font-serif leading-relaxed mb-1">
                {step.textDeva}
              </p>
            )}
            {step.textEng && (
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {step.textEng}
              </p>
            )}
            {step.sutra && (
              <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
                <Sparkles className="w-3 h-3" />
                <span>Paninian Sutra: {step.sutra}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-amber-500/10 flex items-center justify-between text-xs text-slate-400">
        <button disabled className="px-3 py-1 rounded-md bg-slate-800 text-slate-500 opacity-60">Back</button>
        <button disabled className="px-4 py-1 rounded-md bg-amber-500 text-slate-950 font-bold">Next</button>
      </div>
    </div>
  );
};
