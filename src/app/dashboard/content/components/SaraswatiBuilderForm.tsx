'use client';

import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, CheckCircle2, Lightbulb, ChevronRight } from 'lucide-react';
import { Step, SaraswatiMiniStep } from '@/types/curriculum';

interface SaraswatiBuilderFormProps {
  step: Step;
  onChange: (updated: Partial<Step>) => void;
}

export function SaraswatiBuilderForm({ step, onChange }: SaraswatiBuilderFormProps) {
  const miniSteps = step.miniSteps || [];
  const [activeMiniStepIdx, setActiveMiniStepIdx] = useState<number>(0);

  const addMiniStep = () => {
    const newStep: SaraswatiMiniStep = {
      questionEn: '',
      answerEn: '',
      options: ['Option A', 'Option B', 'Option C'],
      correctIndex: 0,
      clue: '',
      feedback: '',
      definitionFragmentEn: ''
    };
    const updated = [...miniSteps, newStep];
    onChange({ miniSteps: updated });
    setActiveMiniStepIdx(updated.length - 1);
  };

  const updateActiveMiniStep = (patch: Partial<SaraswatiMiniStep>) => {
    const updated = miniSteps.map((s, i) => i === activeMiniStepIdx ? { ...s, ...patch } : s);
    onChange({ miniSteps: updated });
  };

  const removeMiniStep = (idx: number) => {
    const updated = miniSteps.filter((_, i) => i !== idx);
    onChange({ miniSteps: updated });
    setActiveMiniStepIdx(Math.max(0, idx - 1));
  };

  const activeMiniStep = miniSteps[activeMiniStepIdx];

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-[#080C14]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Saraswati सयुक्तिक Concept Builder (§13)</h4>
            <p className="text-[11px] text-slate-400">Step-by-step socratic discovery that progressive assembles the canonical definition</p>
          </div>
        </div>

        <button
          type="button"
          onClick={addMiniStep}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black text-xs font-bold rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Mini-Step</span>
        </button>
      </div>

      {/* Complete Target Definition */}
      <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 space-y-1.5">
        <label className="text-[11px] font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Final Complete Assembled Definition (§15)</span>
        </label>
        <textarea
          value={step.definitionEn || ''}
          onChange={(e) => onChange({ definitionEn: e.target.value })}
          placeholder="e.g. A wave is a periodic disturbance that transfers energy through a medium without permanently transporting matter."
          rows={2}
          className="w-full text-xs bg-[#03050B] border border-yellow-500/30 rounded-lg p-2.5 text-white focus:border-yellow-400 outline-none resize-none font-sans"
        />
      </div>

      {/* Mini-Step Pills Nav */}
      {miniSteps.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {miniSteps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveMiniStepIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeMiniStepIdx === idx
                  ? 'bg-yellow-500 text-black shadow'
                  : 'bg-[#0B0F19] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>Step {idx + 1}</span>
              {s.definitionFragmentEn && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </div>
      )}

      {/* Active Mini-Step Editor */}
      {activeMiniStep ? (
        <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0B0F19] space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
            <span className="font-bold text-yellow-400">Mini-Step #{activeMiniStepIdx + 1} Editor</span>
            <button
              type="button"
              onClick={() => removeMiniStep(activeMiniStepIdx)}
              className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete Mini-Step</span>
            </button>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Question Prompt</label>
            <input
              type="text"
              value={activeMiniStep.questionEn}
              onChange={(e) => updateActiveMiniStep({ questionEn: e.target.value })}
              placeholder="e.g. When the stone hits the water, what actually moves across the pond?"
              className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none"
            />
          </div>

          {/* Revealed Definition Fragment */}
          <div>
            <label className="text-[11px] text-amber-300 block mb-1 font-semibold flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              <span>Revealed Definition Fragment (Unlocked upon correct choice)</span>
            </label>
            <input
              type="text"
              value={activeMiniStep.definitionFragmentEn}
              onChange={(e) => updateActiveMiniStep({ definitionFragmentEn: e.target.value })}
              placeholder='e.g. "A wave is a periodic disturbance..."'
              className="w-full text-xs font-medium bg-[#03050B] border border-amber-500/30 rounded-lg px-3 py-2 text-amber-200 focus:border-amber-400 outline-none"
            />
          </div>

          {/* Options & Correct Choice */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 block">Answer Options (Select correct radio)</label>
            {activeMiniStep.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct_${activeMiniStepIdx}`}
                  checked={activeMiniStep.correctIndex === optIdx}
                  onChange={() => updateActiveMiniStep({ correctIndex: optIdx })}
                  className="accent-yellow-400 cursor-pointer"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...activeMiniStep.options];
                    newOpts[optIdx] = e.target.value;
                    updateActiveMiniStep({ options: newOpts });
                  }}
                  className="flex-1 text-xs bg-[#03050B] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:border-yellow-400 outline-none"
                />
              </div>
            ))}
          </div>

          {/* Socratic Clue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-yellow-400" />
                <span>सयुक्तिक Clue (Socratic hint)</span>
              </label>
              <input
                type="text"
                value={activeMiniStep.clue || ''}
                onChange={(e) => updateActiveMiniStep({ clue: e.target.value })}
                placeholder="Notice what happens to the floating leaf..."
                className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Feedback Message</label>
              <input
                type="text"
                value={activeMiniStep.feedback || ''}
                onChange={(e) => updateActiveMiniStep({ feedback: e.target.value })}
                placeholder="Correct! The water particles only oscillate locally."
                className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
          No mini-steps configured yet. Click &quot;Add Mini-Step&quot; above.
        </div>
      )}
    </div>
  );
}
