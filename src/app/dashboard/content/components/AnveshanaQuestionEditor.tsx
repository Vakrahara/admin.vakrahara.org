'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, Plus, Trash2, KeyRound, X } from 'lucide-react';
import { AnveshanaQuestion, QuestionType, BloomsTaxonomy } from '@/types/curriculum';
import { computeAnveshanaHash } from './anveshanaCrypto';

interface AnveshanaQuestionEditorProps {
  question: AnveshanaQuestion;
  index: number;
  onUpdate: (patch: Partial<AnveshanaQuestion>) => void;
}

export function AnveshanaQuestionEditor({
  question,
  index,
  onUpdate
}: AnveshanaQuestionEditorProps) {
  const [langTab, setLangTab] = useState<'EN' | 'HI' | 'HNG'>('EN');

  // Auto-compute SHA-256 anti-tamper hash when question text or correct option changes
  useEffect(() => {
    const cIdx = question.correctOptionIndex ?? 0;
    const optText = question.options[cIdx] || '';
    if (optText && question.questionEn) {
      computeAnveshanaHash(optText, question.questionEn).then((hash) => {
        if (hash && hash !== question.correctOptionHash) {
          onUpdate({ correctOptionHash: hash });
        }
      });
    }
  }, [question.questionEn, question.correctOptionIndex, question.options]);

  const addOption = () => {
    if (question.options.length >= 4) return;
    const newOpts = [...question.options, `Option ${String.fromCharCode(65 + question.options.length)}`];
    const newOptsHi = [...(question.optionsHi || []), ''];
    const newOptsHng = [...(question.optionsHng || []), ''];
    onUpdate({ options: newOpts, optionsHi: newOptsHi, optionsHng: newOptsHng });
  };

  const removeOption = (optIdx: number) => {
    if (question.options.length <= 2) return;
    const newOpts = question.options.filter((_, idx) => idx !== optIdx);
    const newOptsHi = (question.optionsHi || []).filter((_, idx) => idx !== optIdx);
    const newOptsHng = (question.optionsHng || []).filter((_, idx) => idx !== optIdx);
    let newCorrect = question.correctOptionIndex ?? 0;
    if (newCorrect === optIdx) newCorrect = Math.max(0, optIdx - 1);
    else if (newCorrect > optIdx) newCorrect = newCorrect - 1;
    newCorrect = Math.min(newCorrect, newOpts.length - 1);
    onUpdate({
      options: newOpts,
      optionsHi: newOptsHi,
      optionsHng: newOptsHng,
      correctOptionIndex: newCorrect
    });
  };

  const addHint = () => {
    onUpdate({
      hints: [...(question.hints || []), ''],
      hintsHi: [...(question.hintsHi || []), ''],
      hintsHng: [...(question.hintsHng || []), '']
    });
  };

  const removeHint = (hIdx: number) => {
    onUpdate({
      hints: (question.hints || []).filter((_, i) => i !== hIdx),
      hintsHi: (question.hintsHi || []).filter((_, i) => i !== hIdx),
      hintsHng: (question.hintsHng || []).filter((_, i) => i !== hIdx)
    });
  };

  return (
    <div className="pt-3 border-t border-slate-800 space-y-3">
      {/* Sub-header: Language Tabs & Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <select
            value={question.questionType || 'mcq'}
            onChange={(e) => onUpdate({ questionType: e.target.value as QuestionType })}
            className="text-[10px] font-bold bg-[#03050B] border border-slate-800 rounded px-2 py-1 text-emerald-400 outline-none"
          >
            <option value="mcq">Standard MCQ</option>
            <option value="assertion_reason">Assertion-Reason (A/R)</option>
            <option value="statement_1_2">Statement I & II</option>
          </select>

          <select
            value={question.bloomsLevel || 'understand'}
            onChange={(e) => onUpdate({ bloomsLevel: e.target.value as BloomsTaxonomy })}
            className="text-[10px] font-bold bg-[#03050B] border border-slate-800 rounded px-2 py-1 text-amber-400 outline-none"
          >
            <option value="remember">Bloom: Remember</option>
            <option value="understand">Bloom: Understand</option>
            <option value="apply">Bloom: Apply</option>
            <option value="analyze">Bloom: Analyze</option>
            <option value="evaluate">Bloom: Evaluate</option>
          </select>
        </div>

        <div className="flex items-center p-0.5 rounded bg-[#03050B] border border-slate-800">
          {(['EN', 'HI', 'HNG'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setLangTab(tab)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                langTab === tab ? 'bg-emerald-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Question Prompt Input */}
      <div>
        <label className="text-[10px] text-slate-400 block mb-1">Question Text ({langTab})</label>
        <textarea
          rows={2}
          value={langTab === 'EN' ? question.questionEn : langTab === 'HI' ? question.questionHi || '' : question.questionHng || ''}
          onChange={(e) => {
            if (langTab === 'EN') onUpdate({ questionEn: e.target.value });
            else if (langTab === 'HI') onUpdate({ questionHi: e.target.value });
            else onUpdate({ questionHng: e.target.value });
          }}
          placeholder="Enter question text or Assertion/Reason prompt..."
          className="w-full text-xs bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white outline-none resize-none"
        />
      </div>

      {/* Options List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-slate-400">Options ({langTab}) — Select radio for correct answer</label>
          {question.options.length < 4 && (
            <button
              type="button"
              onClick={addOption}
              className="text-[10px] text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Add Option
            </button>
          )}
        </div>

        {question.options.map((opt, optIdx) => {
          const currentText = langTab === 'EN' ? opt : langTab === 'HI' ? question.optionsHi?.[optIdx] || '' : question.optionsHng?.[optIdx] || '';

          return (
            <div key={optIdx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct_q_${index}`}
                checked={(question.correctOptionIndex || 0) === optIdx}
                onChange={() => onUpdate({ correctOptionIndex: optIdx })}
                className="accent-emerald-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-500 w-3">{String.fromCharCode(65 + optIdx)}</span>
              <input
                type="text"
                value={currentText}
                onChange={(e) => {
                  if (langTab === 'EN') {
                    const newOpts = [...question.options];
                    newOpts[optIdx] = e.target.value;
                    onUpdate({ options: newOpts });
                  } else if (langTab === 'HI') {
                    const newOptsHi = [...(question.optionsHi || question.options.map(() => ''))];
                    newOptsHi[optIdx] = e.target.value;
                    onUpdate({ optionsHi: newOptsHi });
                  } else {
                    const newOptsHng = [...(question.optionsHng || question.options.map(() => ''))];
                    newOptsHng[optIdx] = e.target.value;
                    onUpdate({ optionsHng: newOptsHng });
                  }
                }}
                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                className="flex-1 text-xs bg-[#03050B] border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none"
              />
              {question.options.length > 2 && (
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

      {/* Explanation */}
      <div>
        <label className="text-[10px] text-slate-400 block mb-1">Explanation ({langTab})</label>
        <input
          type="text"
          value={langTab === 'EN' ? question.explanationEn || '' : langTab === 'HI' ? question.explanationHi || '' : question.explanationHng || ''}
          onChange={(e) => {
            if (langTab === 'EN') onUpdate({ explanationEn: e.target.value });
            else if (langTab === 'HI') onUpdate({ explanationHi: e.target.value });
            else onUpdate({ explanationHng: e.target.value });
          }}
          placeholder="Why this answer is correct..."
          className="w-full text-xs bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 outline-none"
        />
      </div>

      {/* Scaffolded Hints Manager */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-slate-400 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Scaffolded Hints ({langTab})</span>
          </label>
          <button
            type="button"
            onClick={addHint}
            className="text-[10px] text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" /> Add Hint
          </button>
        </div>
        {(question.hints || []).map((hint, hIdx) => {
          const hintVal = langTab === 'EN' ? hint : langTab === 'HI' ? question.hintsHi?.[hIdx] || '' : question.hintsHng?.[hIdx] || '';

          return (
            <div key={hIdx} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono w-4">#{hIdx + 1}</span>
              <input
                type="text"
                value={hintVal}
                onChange={(e) => {
                  if (langTab === 'EN') {
                    const newHints = [...(question.hints || [])];
                    newHints[hIdx] = e.target.value;
                    onUpdate({ hints: newHints });
                  } else if (langTab === 'HI') {
                    const newHintsHi = [...(question.hintsHi || (question.hints || []).map(() => ''))];
                    newHintsHi[hIdx] = e.target.value;
                    onUpdate({ hintsHi: newHintsHi });
                  } else {
                    const newHintsHng = [...(question.hintsHng || (question.hints || []).map(() => ''))];
                    newHintsHng[hIdx] = e.target.value;
                    onUpdate({ hintsHng: newHintsHng });
                  }
                }}
                placeholder={`Scaffold hint #${hIdx + 1}`}
                className="flex-1 text-xs bg-[#03050B] border border-slate-800 rounded px-2 py-1 text-slate-300 outline-none"
              />
              <button
                type="button"
                onClick={() => removeHint(hIdx)}
                className="text-slate-500 hover:text-red-400 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Anti-tamper Hash Preview */}
      {question.correctOptionHash && (
        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono bg-[#03050B] p-1.5 rounded border border-slate-800/80">
          <KeyRound className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-slate-400">SHA-256 Hash:</span>
          <span className="truncate text-emerald-400/80">{question.correctOptionHash}</span>
        </div>
      )}
    </div>
  );
}
