'use client';

import React, { useState } from 'react';
import { VideoCheckpoint, VideoCheckpointType, VideoCheckpointResumeAction } from '@/types/curriculum';

interface CheckpointItemEditorProps {
  chk: VideoCheckpoint;
  onUpdate: (patch: Partial<VideoCheckpoint>) => void;
}

export function CheckpointItemEditor({ chk, onUpdate }: CheckpointItemEditorProps) {
  const [langTab, setLangTab] = useState<'en' | 'hi' | 'hng'>('en');

  // Resilient option arrays ensuring zero sparse arrays or vanishing elements
  const baseOpts = (chk.options && chk.options.length > 0) ? chk.options : ['Option A', 'Option B', 'Option C', 'Option D'];
  const currentOptions = langTab === 'hi'
    ? baseOpts.map((_, i) => chk.optionsHi?.[i] || '')
    : langTab === 'hng'
    ? baseOpts.map((_, i) => chk.optionsHng?.[i] || '')
    : baseOpts;

  const handleOptionChange = (oIdx: number, val: string) => {
    const nextOpts = [...currentOptions];
    while (nextOpts.length <= oIdx) {
      nextOpts.push('');
    }
    nextOpts[oIdx] = val;
    if (langTab === 'hi') {
      onUpdate({ optionsHi: nextOpts });
    } else if (langTab === 'hng') {
      onUpdate({ optionsHng: nextOpts });
    } else {
      onUpdate({ options: nextOpts });
    }
  };

  const currentExplanation = langTab === 'hi'
    ? (chk.explanationHi || '')
    : langTab === 'hng'
    ? (chk.explanationHng || '')
    : (chk.explanationEn || '');

  const handleExplanationChange = (val: string) => {
    if (langTab === 'hi') onUpdate({ explanationHi: val });
    else if (langTab === 'hng') onUpdate({ explanationHng: val });
    else onUpdate({ explanationEn: val });
  };

  return (
    <div className="p-3 border-t border-slate-800 space-y-3 bg-[#080C14]">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Timestamp (seconds)</label>
          <input
            type="number"
            min={0}
            value={Math.max(0, Math.round(chk.timestampMs / 1000))}
            onChange={(e) => onUpdate({ timestampMs: Math.max(0, (parseInt(e.target.value, 10) || 0) * 1000) })}
            className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-400 outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Checkpoint Type</label>
          <select
            value={chk.type}
            onChange={(e) => onUpdate({ type: e.target.value as VideoCheckpointType })}
            className="w-full text-xs bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-400 outline-none"
          >
            <option value="question">Question (MCQ)</option>
            <option value="simulation_prompt">Simulation Prompt</option>
            <option value="gurutatva_pause">Gurutatva Pause</option>
            <option value="explorable_note">Explorable Note</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Resume Action</label>
          <select
            value={chk.resumeAction || 'manual_continue'}
            onChange={(e) => onUpdate({ resumeAction: e.target.value as VideoCheckpointResumeAction })}
            className="w-full text-xs bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-400 outline-none"
          >
            <option value="on_answer">Resume On Answer</option>
            <option value="manual_continue">Manual Continue Button</option>
            <option value="auto_after_sec">Auto Resume After N Sec</option>
          </select>
        </div>
      </div>

      {chk.resumeAction === 'auto_after_sec' && (
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Auto Resume Seconds</label>
          <input
            type="number"
            min={1}
            max={60}
            value={chk.autoResumeSeconds || 5}
            onChange={(e) => onUpdate({ autoResumeSeconds: Math.max(1, parseInt(e.target.value, 10) || 5) })}
            className="w-32 text-xs font-mono bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-400 outline-none"
          />
        </div>
      )}

      <div>
        <label className="text-[11px] text-slate-400 block mb-1">Title / Label</label>
        <input
          type="text"
          value={chk.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Checkpoint Title..."
          className="w-full text-xs bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-amber-400 outline-none"
        />
      </div>

      {/* Language Switcher Tab for Content */}
      {(chk.type === 'question' || chk.type === 'gurutatva_pause' || chk.type === 'explorable_note') && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-bold text-amber-300">
            {chk.type === 'question' ? 'Interactive Question & Options' : chk.type === 'gurutatva_pause' ? 'Gurutatva Heritage Content' : 'Explorable Note Content'}
          </span>
          <div className="flex gap-1 bg-[#03050B] p-0.5 rounded border border-slate-800">
            {(['en', 'hi', 'hng'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLangTab(l)}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${langTab === l ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {chk.type === 'question' && (
        <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
          <textarea
            value={(langTab === 'en' ? chk.questionEn : langTab === 'hi' ? chk.questionHi : chk.questionHng) || ''}
            onChange={(e) => onUpdate(langTab === 'en' ? { questionEn: e.target.value } : langTab === 'hi' ? { questionHi: e.target.value } : { questionHng: e.target.value })}
            placeholder={langTab === 'hi' ? 'हिन्दी प्रश्न...' : langTab === 'hng' ? 'Hinglish question...' : 'Enter English question text...'}
            rows={2}
            className="w-full text-xs bg-[#03050B] border border-slate-800 rounded p-2 text-white focus:border-amber-400 outline-none"
          />

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Options ({langTab.toUpperCase()}) - Select radio for correct answer
            </label>
            {currentOptions.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct_${chk.id}`}
                  checked={chk.correctOptionIndex === oIdx}
                  onChange={() => onUpdate({ correctOptionIndex: oIdx })}
                  className="accent-amber-500"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                  placeholder={`Option ${oIdx + 1} (${langTab})`}
                  className="flex-1 text-xs bg-[#03050B] border border-slate-800 rounded px-2 py-1 text-white focus:border-amber-400 outline-none"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Explanation ({langTab.toUpperCase()})
            </label>
            <input
              type="text"
              value={currentExplanation}
              onChange={(e) => handleExplanationChange(e.target.value)}
              placeholder={`Explanation shown after answering (${langTab})...`}
              className="w-full text-xs bg-[#03050B] border border-slate-800 rounded px-2 py-1 text-white focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {chk.type === 'simulation_prompt' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Target Simulation ID</label>
            <input
              type="text"
              value={chk.simulationId || ''}
              onChange={(e) => onUpdate({ simulationId: e.target.value })}
              placeholder="e.g. ray_optics, prism_dispersion"
              className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Params (JSON)</label>
            <input
              key={`sim_${chk.id}`}
              type="text"
              defaultValue={chk.simulationParams ? JSON.stringify(chk.simulationParams) : ''}
              onBlur={(e) => {
                try {
                  const val = e.target.value.trim();
                  onUpdate({ simulationParams: val ? JSON.parse(val) : undefined });
                } catch {
                  // ignore invalid json on blur
                }
              }}
              placeholder='{"mode": 1.0}'
              className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Explanation / Prompt</label>
            <input
              type="text"
              value={chk.explanationEn || ''}
              onChange={(e) => onUpdate({ explanationEn: e.target.value })}
              placeholder="Try interacting with the lens simulation..."
              className="w-full text-xs bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-400 outline-none"
            />
          </div>
        </div>
      )}

      {chk.type === 'gurutatva_pause' && (
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <label className="text-[11px] text-slate-400 block">Classical Sūtra</label>
          <input
            type="text"
            value={chk.gurutatva?.sutra || ''}
            onChange={(e) => onUpdate({
              gurutatva: { ...(chk.gurutatva || { titleEn: '', bodyEn: '' }), sutra: e.target.value }
            })}
            placeholder="e.g. कणाद वैशेषिक सूत्र..."
            className="w-full text-xs font-serif bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-purple-400 outline-none"
          />
          <label className="text-[11px] text-slate-400 block">Sūtra Translation</label>
          <input
            type="text"
            value={chk.gurutatva?.sutraTranslation || ''}
            onChange={(e) => onUpdate({
              gurutatva: { ...(chk.gurutatva || { titleEn: '', bodyEn: '' }), sutraTranslation: e.target.value }
            })}
            placeholder="Literal translation of the sutra..."
            className="w-full text-xs bg-[#03050B] border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-purple-400 outline-none"
          />
          <label className="text-[11px] text-slate-400 block">
            Insight Body ({langTab.toUpperCase()})
          </label>
          <textarea
            value={(langTab === 'hi' ? chk.gurutatva?.bodyHi : langTab === 'hng' ? chk.gurutatva?.bodyHng : chk.gurutatva?.bodyEn) || ''}
            onChange={(e) => {
              const prev = chk.gurutatva || { titleEn: '', bodyEn: '' };
              const patch = langTab === 'hi' ? { bodyHi: e.target.value } : langTab === 'hng' ? { bodyHng: e.target.value } : { bodyEn: e.target.value };
              onUpdate({ gurutatva: { ...prev, ...patch } });
            }}
            placeholder={`Insight body text explaining connection (${langTab})...`}
            rows={2}
            className="w-full text-xs bg-[#03050B] border border-slate-800 rounded p-2 text-white focus:border-purple-400 outline-none"
          />
        </div>
      )}

      {chk.type === 'explorable_note' && (
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <label className="text-[11px] text-slate-400 block">
            Note Content ({langTab.toUpperCase()})
          </label>
          <textarea
            value={currentExplanation}
            onChange={(e) => handleExplanationChange(e.target.value)}
            placeholder={`Note text to display during pause (${langTab})...`}
            rows={2}
            className="w-full text-xs bg-[#03050B] border border-slate-800 rounded p-2 text-white focus:border-sky-400 outline-none"
          />
        </div>
      )}
    </div>
  );
}
