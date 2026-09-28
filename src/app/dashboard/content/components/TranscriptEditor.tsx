'use client';

import React, { useState } from 'react';
import { Subtitles, Plus, Trash2, Clock } from 'lucide-react';
import { TranscriptSegment } from '@/types/curriculum';

interface TranscriptEditorProps {
  transcript: TranscriptSegment[];
  onChange: (updated: TranscriptSegment[]) => void;
}

export function TranscriptEditor({ transcript = [], onChange }: TranscriptEditorProps) {
  const [activeLang, setActiveLang] = useState<'en' | 'hi' | 'hng'>('en');

  const addSegment = () => {
    const last = transcript[transcript.length - 1];
    const startMs = last ? last.endMs : 0;
    const endMs = startMs + 10000;
    onChange([
      ...transcript,
      { startMs, endMs, textEn: '', textHi: '', textHng: '' }
    ]);
  };

  const updateSegment = (index: number, patch: Partial<TranscriptSegment>) => {
    const updated = transcript.map((seg, i) => i === index ? { ...seg, ...patch } : seg);
    onChange(updated);
  };

  const removeSegment = (index: number) => {
    onChange(transcript.filter((_, i) => i !== index));
  };

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-[#080C14]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Subtitles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">3-Locale Video Transcript (§9)</h4>
            <p className="text-[11px] text-slate-400">Timestamped text synced across English, Hindi, and Hinglish</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center p-1 rounded-lg bg-[#03050B] border border-slate-800">
            {(['en', 'hi', 'hng'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                  activeLang === lang
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'HI (हिन्दी)' : 'HNG'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={addSegment}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Segment</span>
          </button>
        </div>
      </div>

      {transcript.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
          No transcript segments configured. Click &quot;Add Segment&quot; to begin.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {transcript.map((seg, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-slate-800/80 bg-[#0B0F19] space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>#{idx + 1}</span>
                  <input
                    type="number"
                    value={Math.round(seg.startMs / 1000)}
                    onChange={(e) => updateSegment(idx, { startMs: (parseInt(e.target.value, 10) || 0) * 1000 })}
                    className="w-14 px-1.5 py-0.5 bg-[#03050B] border border-slate-800 rounded text-center text-white"
                  />
                  <span>s to</span>
                  <input
                    type="number"
                    value={Math.round(seg.endMs / 1000)}
                    onChange={(e) => updateSegment(idx, { endMs: (parseInt(e.target.value, 10) || 0) * 1000 })}
                    className="w-14 px-1.5 py-0.5 bg-[#03050B] border border-slate-800 rounded text-center text-white"
                  />
                  <span>s ({formatMs(seg.startMs)} - {formatMs(seg.endMs)})</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeSegment(idx)}
                  className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeLang === 'en' && (
                <textarea
                  value={seg.textEn}
                  onChange={(e) => updateSegment(idx, { textEn: e.target.value })}
                  placeholder="English transcript text..."
                  rows={2}
                  className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-indigo-400 outline-none resize-none"
                />
              )}

              {activeLang === 'hi' && (
                <textarea
                  value={seg.textHi || ''}
                  onChange={(e) => updateSegment(idx, { textHi: e.target.value })}
                  placeholder="हिन्दी अनुवाद..."
                  rows={2}
                  className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-indigo-400 outline-none resize-none font-sans"
                />
              )}

              {activeLang === 'hng' && (
                <textarea
                  value={seg.textHng || ''}
                  onChange={(e) => updateSegment(idx, { textHng: e.target.value })}
                  placeholder="Hinglish transcription..."
                  rows={2}
                  className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-indigo-400 outline-none resize-none"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
