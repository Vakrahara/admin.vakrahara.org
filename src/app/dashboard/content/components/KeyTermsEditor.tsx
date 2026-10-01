'use client';

import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, ChevronDown, ChevronUp, Tag, Sparkles } from 'lucide-react';
import { KeyTermsRecap, KeyTerm } from '@/types/curriculumTriad';

interface KeyTermsEditorProps {
  keyTermsRecap?: KeyTermsRecap;
  onChange: (recap: KeyTermsRecap) => void;
}

export function KeyTermsEditor({ keyTermsRecap, onChange }: KeyTermsEditorProps) {
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);

  const recap: KeyTermsRecap = keyTermsRecap || {
    enabled: false,
    titleEn: 'Key Concepts Mastered',
    titleHi: 'सीखी गई प्रमुख शब्दावली',
    titleHng: 'Shabdakosha Recap',
    terms: []
  };

  const handleToggleEnabled = () => {
    onChange({ ...recap, enabled: !recap.enabled });
  };

  const handleAddTerm = () => {
    const newId = `kt_${Date.now()}`;
    const newTerm: KeyTerm = {
      id: newId,
      termEn: '',
      termHi: '',
      termHng: '',
      definitionEn: '',
      definitionHi: '',
      definitionHng: '',
      tags: []
    };
    onChange({ ...recap, terms: [...recap.terms, newTerm] });
    setExpandedTermId(newId);
  };

  const handleUpdateTerm = (id: string, patch: Partial<KeyTerm>) => {
    const updated = recap.terms.map(t => t.id === id ? { ...t, ...patch } : t);
    onChange({ ...recap, terms: updated });
  };

  const handleDeleteTerm = (id: string) => {
    onChange({ ...recap, terms: recap.terms.filter(t => t.id !== id) });
    if (expandedTermId === id) setExpandedTermId(null);
  };

  return (
    <div className="glass-panel border border-white/5 bg-black/40 p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#d4af37]" />
          <div>
            <h4 className="font-bold text-xs text-[#d4af37] uppercase tracking-wider">
              शब्दकोश • Key Concepts Lexicon
            </h4>
            <p className="text-[10px] text-gray-500">Post-module 3D flip card glossary</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={recap.enabled}
              onChange={handleToggleEnabled}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d4af37]"></div>
          </label>
          <span className="text-[10px] font-mono uppercase text-gray-400">
            {recap.enabled ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      {recap.enabled && (
        <div className="space-y-4 pt-1">
          {/* Header Title Inputs */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Title (EN)</label>
              <input
                type="text"
                value={recap.titleEn}
                onChange={(e) => onChange({ ...recap, titleEn: e.target.value })}
                className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Title (HI)</label>
              <input
                type="text"
                value={recap.titleHi}
                onChange={(e) => onChange({ ...recap, titleHi: e.target.value })}
                className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Title (HNG)</label>
              <input
                type="text"
                value={recap.titleHng}
                onChange={(e) => onChange({ ...recap, titleHng: e.target.value })}
                className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          {/* Terms List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Key Terms ({recap.terms.length})
              </span>
              <button
                type="button"
                onClick={handleAddTerm}
                className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-bold rounded-lg transition-all"
              >
                <Plus className="w-3 h-3" />
                Add Term
              </button>
            </div>

            {recap.terms.map((term, index) => {
              const isExpanded = expandedTermId === term.id;
              return (
                <div key={term.id} className="p-3 bg-[#08080c] border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedTermId(isExpanded ? null : term.id)}
                      className="flex items-center gap-2 text-left flex-1"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#d4af37]/10 text-[#d4af37] text-[10px] flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {term.termEn || term.termHi || 'Untitled Term'}
                      </span>
                      {term.termHi && <span className="text-[10px] text-gray-400">({term.termHi})</span>}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500 ml-auto mr-2" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-auto mr-2" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTerm(term.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-white/5 text-xs">
                      {/* Term Names */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-500 block mb-0.5">Term (EN)</label>
                          <input
                            type="text"
                            value={term.termEn}
                            onChange={(e) => handleUpdateTerm(term.id, { termEn: e.target.value })}
                            placeholder="e.g. Wave (Taranga)"
                            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 block mb-0.5">Term (HI)</label>
                          <input
                            type="text"
                            value={term.termHi}
                            onChange={(e) => handleUpdateTerm(term.id, { termHi: e.target.value })}
                            placeholder="तरङ्ग (Wave)"
                            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 block mb-0.5">Term (HNG)</label>
                          <input
                            type="text"
                            value={term.termHng}
                            onChange={(e) => handleUpdateTerm(term.id, { termHng: e.target.value })}
                            placeholder="Tarang (Wave)"
                            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                          />
                        </div>
                      </div>

                      {/* Definitions (Card Back) */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] text-gray-500 block mb-0.5">Definition (EN)</label>
                          <textarea
                            value={term.definitionEn}
                            onChange={(e) => handleUpdateTerm(term.id, { definitionEn: e.target.value })}
                            rows={2}
                            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-0.5">Definition (HI)</label>
                            <textarea
                              value={term.definitionHi}
                              onChange={(e) => handleUpdateTerm(term.id, { definitionHi: e.target.value })}
                              rows={2}
                              className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-0.5">Definition (HNG)</label>
                            <textarea
                              value={term.definitionHng}
                              onChange={(e) => handleUpdateTerm(term.id, { definitionHng: e.target.value })}
                              rows={2}
                              className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Insight Note (Card Front Badge) */}
                      <div className="p-2 bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-lg space-y-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-[#d4af37] font-bold">
                          <Sparkles className="w-3 h-3" />
                          <span>1-Line Front Insight Hook</span>
                        </div>
                        <input
                          type="text"
                          value={term.insightNoteEn || ''}
                          onChange={(e) => handleUpdateTerm(term.id, { insightNoteEn: e.target.value })}
                          placeholder="e.g. Energy moves forward through ripples while particles oscillate."
                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="text-[9px] text-gray-500 flex items-center gap-1 mb-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={term.tags?.join(', ') || ''}
                          onChange={(e) => handleUpdateTerm(term.id, {
                            tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="Physics, Mechanics, Classical Indic"
                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
