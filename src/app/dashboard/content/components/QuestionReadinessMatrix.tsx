'use client';

import React from 'react';
import { Chapter, Module, Step } from '@/types/curriculum';
import { CheckCircle2, AlertTriangle, AlertCircle, ChevronRight, BarChart3 } from 'lucide-react';

interface QuestionReadinessMatrixProps {
  chapter: Chapter;
  onSelectModule: (moduleId: string) => void;
  selectedModuleId?: string | null;
}

export function QuestionReadinessMatrix({
  chapter,
  onSelectModule,
  selectedModuleId
}: QuestionReadinessMatrixProps) {
  const modules = chapter.modules || [];

  const getModulePoolCount = (mod: Module): number => {
    const anveshanaStep = mod.steps.find(s => s.type === 'anveshana');
    if (anveshanaStep?.questionPool) return anveshanaStep.questionPool.length;
    // Fallback: check legacy predict_quiz
    const hasQuiz = mod.steps.some(s => s.type === 'predict_quiz');
    return hasQuiz ? 1 : 0;
  };

  const readinessStats = modules.reduce(
    (acc, m) => {
      const count = getModulePoolCount(m);
      if (count >= 30) acc.ready++;
      else if (count >= 15) acc.partial++;
      else acc.incomplete++;
      return acc;
    },
    { ready: 0, partial: 0, incomplete: 0 }
  );

  const total = modules.length;
  const pctReady = total > 0 ? Math.round((readinessStats.ready / total) * 100) : 0;

  return (
    <div className="space-y-3 p-4 rounded-xl border border-slate-800 bg-[#080C14]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Anveshana 30-Q Readiness Matrix (§16)
            </h4>
            <p className="text-[11px] text-slate-400">
              Curriculum question bank audit for &quot;{chapter.title}&quot;
            </p>
          </div>
        </div>

        {/* Aggregate Status Badges */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{readinessStats.ready} Ready</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{readinessStats.partial} Partial</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{readinessStats.incomplete} Incomplete</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>Chapter Pool Completion</span>
          <span className="text-emerald-400 font-bold">{pctReady}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#03050B] overflow-hidden flex">
          <div
            style={{ width: `${(readinessStats.ready / Math.max(1, total)) * 100}%` }}
            className="h-full bg-emerald-500"
          />
          <div
            style={{ width: `${(readinessStats.partial / Math.max(1, total)) * 100}%` }}
            className="h-full bg-amber-500"
          />
          <div
            style={{ width: `${(readinessStats.incomplete / Math.max(1, total)) * 100}%` }}
            className="h-full bg-red-500/60"
          />
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
        {modules.map((m, idx) => {
          const count = getModulePoolCount(m);
          const isSelected = selectedModuleId === m.id;
          const statusClass =
            count >= 30
              ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
              : count >= 15
              ? 'border-amber-500/40 bg-amber-500/5 text-amber-300'
              : 'border-red-500/30 bg-red-500/5 text-red-400';

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectModule(m.id)}
              className={`p-2 rounded-lg border text-left transition-all ${statusClass} ${
                isSelected ? 'ring-2 ring-amber-400' : 'hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span>M{idx + 1}</span>
                <span className="font-bold">{count}/30</span>
              </div>
              <p className="text-[11px] font-medium truncate text-white">
                {m.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
