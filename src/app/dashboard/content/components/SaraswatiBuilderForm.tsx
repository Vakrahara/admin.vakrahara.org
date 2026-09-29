'use client';

import React, { useState } from 'react';
import { Sparkles, Plus, CheckCircle2 } from 'lucide-react';
import { Step, SaraswatiMiniStep } from '@/types/curriculum';
import { SaraswatiMiniStepEditor } from './SaraswatiMiniStepEditor';

interface SaraswatiBuilderFormProps {
  step: Step;
  onChange: (updated: Partial<Step>) => void;
}

export function SaraswatiBuilderForm({ step, onChange }: SaraswatiBuilderFormProps) {
  const miniSteps = step.miniSteps || [];
  const [activeMiniStepIdx, setActiveMiniStepIdx] = useState<number>(0);
  const [langTab, setLangTab] = useState<'EN' | 'HI' | 'HNG'>('EN');

  const addMiniStep = () => {
    const defaultOpts = ['Option A', 'Option B', 'Option C'];
    const newStep: SaraswatiMiniStep = {
      questionEn: '',
      questionHi: '',
      questionHng: '',
      answerEn: defaultOpts[0],
      answerHi: '',
      answerHng: '',
      options: defaultOpts,
      optionsHi: ['', '', ''],
      optionsHng: ['', '', ''],
      correctIndex: 0,
      clue: '',
      feedback: '',
      definitionFragmentEn: '',
      definitionFragmentHi: '',
      definitionFragmentHng: ''
    };
    const updated = [...miniSteps, newStep];
    onChange({ miniSteps: updated });
    setActiveMiniStepIdx(updated.length - 1);
  };

  const updateActiveMiniStep = (patch: Partial<SaraswatiMiniStep>) => {
    const updated = miniSteps.map((s, i) => {
      if (i !== activeMiniStepIdx) return s;
      const merged = { ...s, ...patch };
      const cIdx = merged.correctIndex ?? 0;
      if (merged.options && merged.options[cIdx] !== undefined) {
        merged.answerEn = merged.options[cIdx];
      }
      if (merged.optionsHi && merged.optionsHi[cIdx] !== undefined) {
        merged.answerHi = merged.optionsHi[cIdx];
      }
      if (merged.optionsHng && merged.optionsHng[cIdx] !== undefined) {
        merged.answerHng = merged.optionsHng[cIdx];
      }
      return merged;
    });
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
      {/* Header with Language Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Saraswati सयुक्तिक Concept Builder (§13)
            </h4>
            <p className="text-[11px] text-slate-400">
              Socratic definition assembly with auto-sync answers and 3-locale support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded bg-[#03050B] border border-slate-800">
            {(['EN', 'HI', 'HNG'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLangTab(tab)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                  langTab === tab
                    ? 'bg-yellow-500 text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
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
      </div>

      {/* Target Definition */}
      <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 space-y-1.5">
        <label className="text-[11px] font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Final Assembled Definition ({langTab})</span>
        </label>
        {langTab === 'EN' && (
          <textarea
            value={step.definitionEn || ''}
            onChange={(e) => onChange({ definitionEn: e.target.value })}
            placeholder="e.g. A wave is a periodic disturbance that transfers energy through a medium..."
            rows={2}
            className="w-full text-xs bg-[#03050B] border border-yellow-500/30 rounded-lg p-2.5 text-white focus:border-yellow-400 outline-none resize-none font-sans"
          />
        )}
        {langTab === 'HI' && (
          <textarea
            value={step.definitionHi || ''}
            onChange={(e) => onChange({ definitionHi: e.target.value })}
            placeholder="e.g. तरंग एक आवर्ती विक्षोभ है जो पदार्थ का स्थायी परिवहन किए बिना..."
            rows={2}
            className="w-full text-xs font-serif bg-[#03050B] border border-yellow-500/30 rounded-lg p-2.5 text-white focus:border-yellow-400 outline-none resize-none"
          />
        )}
        {langTab === 'HNG' && (
          <textarea
            value={step.definitionHng || ''}
            onChange={(e) => onChange({ definitionHng: e.target.value })}
            placeholder="e.g. Wave ek periodic disturbance hai jo bina matter transport kiye..."
            rows={2}
            className="w-full text-xs bg-[#03050B] border border-yellow-500/30 rounded-lg p-2.5 text-white focus:border-yellow-400 outline-none resize-none"
          />
        )}
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
        <SaraswatiMiniStepEditor
          miniStep={activeMiniStep}
          index={activeMiniStepIdx}
          langTab={langTab}
          onUpdate={updateActiveMiniStep}
          onRemove={() => removeMiniStep(activeMiniStepIdx)}
        />
      ) : (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
          No mini-steps configured yet. Click &quot;Add Mini-Step&quot; above.
        </div>
      )}
    </div>
  );
}
