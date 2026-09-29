'use client';

import React from 'react';
import { Trash2, Lightbulb, ChevronRight, X } from 'lucide-react';
import { SaraswatiMiniStep } from '@/types/curriculum';

interface SaraswatiMiniStepEditorProps {
  miniStep: SaraswatiMiniStep;
  index: number;
  langTab: 'EN' | 'HI' | 'HNG';
  onUpdate: (patch: Partial<SaraswatiMiniStep>) => void;
  onRemove: () => void;
}

export function SaraswatiMiniStepEditor({
  miniStep,
  index,
  langTab,
  onUpdate,
  onRemove
}: SaraswatiMiniStepEditorProps) {
  const addOption = () => {
    if (miniStep.options.length >= 4) return;
    const newOpts = [...miniStep.options, `Option ${String.fromCharCode(65 + miniStep.options.length)}`];
    const newOptsHi = [...(miniStep.optionsHi || []), ''];
    const newOptsHng = [...(miniStep.optionsHng || []), ''];
    onUpdate({ options: newOpts, optionsHi: newOptsHi, optionsHng: newOptsHng });
  };

  const removeOption = (optIdx: number) => {
    if (miniStep.options.length <= 2) return;
    const newOpts = miniStep.options.filter((_, idx) => idx !== optIdx);
    const newOptsHi = (miniStep.optionsHi || []).filter((_, idx) => idx !== optIdx);
    const newOptsHng = (miniStep.optionsHng || []).filter((_, idx) => idx !== optIdx);
    let newCorrect = miniStep.correctIndex;
    if (newCorrect === optIdx) {
      newCorrect = Math.max(0, optIdx - 1);
    } else if (newCorrect > optIdx) {
      newCorrect = newCorrect - 1;
    }
    onUpdate({
      options: newOpts,
      optionsHi: newOptsHi,
      optionsHng: newOptsHng,
      correctIndex: newCorrect
    });
  };

  return (
    <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0B0F19] space-y-3">
      <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
        <span className="font-bold text-yellow-400">Mini-Step #{index + 1} ({langTab})</span>
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete Mini-Step</span>
        </button>
      </div>

      {/* Question Prompt */}
      <div>
        <label className="text-[11px] text-slate-400 block mb-1">Question Prompt ({langTab})</label>
        <input
          type="text"
          value={langTab === 'EN' ? miniStep.questionEn : langTab === 'HI' ? (miniStep.questionHi || '') : (miniStep.questionHng || '')}
          onChange={(e) => {
            if (langTab === 'EN') onUpdate({ questionEn: e.target.value });
            else if (langTab === 'HI') onUpdate({ questionHi: e.target.value });
            else onUpdate({ questionHng: e.target.value });
          }}
          placeholder="e.g. When the stone hits the water, what actually moves across the pond?"
          className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none"
        />
      </div>

      {/* Revealed Definition Fragment */}
      <div>
        <label className="text-[11px] text-amber-300 block mb-1 font-semibold flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          <span>Revealed Definition Fragment ({langTab})</span>
        </label>
        <input
          type="text"
          value={langTab === 'EN' ? miniStep.definitionFragmentEn : langTab === 'HI' ? (miniStep.definitionFragmentHi || '') : (miniStep.definitionFragmentHng || '')}
          onChange={(e) => {
            if (langTab === 'EN') onUpdate({ definitionFragmentEn: e.target.value });
            else if (langTab === 'HI') onUpdate({ definitionFragmentHi: e.target.value });
            else onUpdate({ definitionFragmentHng: e.target.value });
          }}
          placeholder='e.g. "A wave is a periodic disturbance..."'
          className="w-full text-xs font-medium bg-[#03050B] border border-amber-500/30 rounded-lg px-3 py-2 text-amber-200 focus:border-amber-400 outline-none"
        />
      </div>

      {/* Options & Correct Choice */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-slate-400">Options ({langTab}) — Select radio for correct answer</label>
          {miniStep.options.length < 4 && (
            <button
              type="button"
              onClick={addOption}
              className="text-[11px] text-yellow-400 hover:underline font-semibold"
            >
              + Add Option
            </button>
          )}
        </div>

        {miniStep.options.map((opt, optIdx) => {
          const currentVal = langTab === 'EN'
            ? opt
            : langTab === 'HI'
            ? (miniStep.optionsHi?.[optIdx] || '')
            : (miniStep.optionsHng?.[optIdx] || '');

          return (
            <div key={optIdx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct_${index}`}
                checked={miniStep.correctIndex === optIdx}
                onChange={() => onUpdate({ correctIndex: optIdx })}
                className="accent-yellow-400 cursor-pointer"
              />
              <input
                type="text"
                value={currentVal}
                onChange={(e) => {
                  if (langTab === 'EN') {
                    const newOpts = [...miniStep.options];
                    newOpts[optIdx] = e.target.value;
                    onUpdate({ options: newOpts });
                  } else if (langTab === 'HI') {
                    const newOptsHi = [...(miniStep.optionsHi || miniStep.options.map(() => ''))];
                    newOptsHi[optIdx] = e.target.value;
                    onUpdate({ optionsHi: newOptsHi });
                  } else {
                    const newOptsHng = [...(miniStep.optionsHng || miniStep.options.map(() => ''))];
                    newOptsHng[optIdx] = e.target.value;
                    onUpdate({ optionsHng: newOptsHng });
                  }
                }}
                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                className="flex-1 text-xs bg-[#03050B] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:border-yellow-400 outline-none"
              />
              {miniStep.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(optIdx)}
                  className="text-slate-500 hover:text-red-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Socratic Clue & Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-yellow-400" />
            <span>सयुक्तिक Clue</span>
          </label>
          <input
            type="text"
            value={miniStep.clue || ''}
            onChange={(e) => onUpdate({ clue: e.target.value })}
            placeholder="Notice what happens to the floating leaf..."
            className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Feedback Message</label>
          <input
            type="text"
            value={miniStep.feedback || ''}
            onChange={(e) => onUpdate({ feedback: e.target.value })}
            placeholder="Correct! The water particles only oscillate locally."
            className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
