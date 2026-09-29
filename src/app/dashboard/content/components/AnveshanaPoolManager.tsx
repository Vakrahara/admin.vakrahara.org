'use client';

import React, { useState } from 'react';
import { Brain, Plus, Upload, Trash2, Search } from 'lucide-react';
import { Step, AnveshanaQuestion } from '@/types/curriculum';
import { AnveshanaQuestionEditor } from './AnveshanaQuestionEditor';

interface AnveshanaPoolManagerProps {
  step: Step;
  onChange: (updated: Partial<Step>) => void;
  onOpenBulkImport?: () => void;
}

export function AnveshanaPoolManager({
  step,
  onChange,
  onOpenBulkImport
}: AnveshanaPoolManagerProps) {
  const pool = step.pool || step.questionPool || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number | null>(null);

  const poolCount = pool.length;
  const isReady = poolCount >= 30;
  const isPartial = poolCount >= 15 && poolCount < 30;

  const emitPoolUpdate = (updated: AnveshanaQuestion[]) => {
    onChange({
      pool: updated,
      questionPool: updated
    });
  };

  const addQuestion = () => {
    const newQ: AnveshanaQuestion = {
      id: `q_${Date.now()}`,
      questionType: 'mcq',
      bloomsLevel: 'understand',
      questionEn: '',
      questionHi: '',
      questionHng: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      optionsHi: ['', '', '', ''],
      optionsHng: ['', '', '', ''],
      correctOptionIndex: 0,
      explanationEn: '',
      explanationHi: '',
      explanationHng: '',
      hints: []
    };
    const updated = [...pool, newQ];
    emitPoolUpdate(updated);
    setActiveQuestionIdx(updated.length - 1);
  };

  const updateQuestion = (idx: number, patch: Partial<AnveshanaQuestion>) => {
    const updated = pool.map((q, i) => (i === idx ? { ...q, ...patch } : q));
    emitPoolUpdate(updated);
  };

  const removeQuestion = (idx: number) => {
    const updated = pool.filter((_, i) => i !== idx);
    emitPoolUpdate(updated);
    if (activeQuestionIdx === idx) setActiveQuestionIdx(null);
  };

  const poolWithIndices = pool.map((q, originalIdx) => ({ q, originalIdx }));
  const filteredPool = poolWithIndices.filter(({ q }) =>
    (q.questionEn || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-[#080C14]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Anveshana Assessment Pool (§16)
              </h4>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isReady
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : isPartial
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {poolCount} / 30 Questions ({isReady ? 'READY' : isPartial ? 'PARTIAL' : 'INCOMPLETE'})
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Randomized sampling with anti-tamper answer hashing and 80% passing threshold
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBulkImport && (
            <button
              type="button"
              onClick={onOpenBulkImport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bulk Import</span>
            </button>
          )}

          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Progress & Config Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-slate-800/60 bg-[#0B0F19]">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Questions Per Attempt</label>
          <input
            type="number"
            value={step.questionsPerAttempt || 5}
            onChange={(e) => onChange({ questionsPerAttempt: parseInt(e.target.value, 10) || 5 })}
            className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Passing Threshold Score</label>
          <input
            type="number"
            value={step.passingScore || 4}
            onChange={(e) => onChange({ passingScore: parseInt(e.target.value, 10) || 4 })}
            className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Pool Search</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in questions..."
              className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      {filteredPool.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
          {poolCount === 0 ? 'No questions in pool yet. Add one manually or use Bulk Import.' : 'No matching questions found.'}
        </div>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredPool.map(({ q, originalIdx }) => {
            const isEditing = activeQuestionIdx === originalIdx;

            return (
              <div
                key={q.id || originalIdx}
                className="p-3 rounded-lg border border-slate-800 bg-[#0B0F19] space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">#{originalIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setActiveQuestionIdx(isEditing ? null : originalIdx)}
                      className="text-left font-medium text-slate-200 hover:text-white line-clamp-1"
                    >
                      {q.questionEn || <span className="text-slate-500 italic">Untitled Question</span>}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {q.questionType && q.questionType !== 'mcq' && (
                      <span className="text-[9px] uppercase font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {q.questionType.replace('_', ' ')}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 bg-[#03050B] px-1.5 py-0.5 rounded border border-slate-800">
                      Answer: {String.fromCharCode(65 + (q.correctOptionIndex || 0))}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(originalIdx)}
                      className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Question Editor */}
                {isEditing && (
                  <AnveshanaQuestionEditor
                    question={q}
                    index={originalIdx}
                    onUpdate={(patch) => updateQuestion(originalIdx, patch)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
