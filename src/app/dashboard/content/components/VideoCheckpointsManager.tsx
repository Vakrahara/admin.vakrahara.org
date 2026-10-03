'use client';

import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { VideoCheckpoint, VideoCheckpointType } from '@/types/curriculum';
import { CheckpointItemEditor } from './CheckpointItemEditor';

interface VideoCheckpointsManagerProps {
  checkpoints?: VideoCheckpoint[];
  videoDurationMs?: number;
  onChange: (updated: VideoCheckpoint[]) => void;
}

export function VideoCheckpointsManager({
  checkpoints = [],
  videoDurationMs = 120000,
  onChange,
}: VideoCheckpointsManagerProps) {
  const effectiveDurationMs = Math.max(1000, videoDurationMs > 0 ? videoDurationMs : 120000);
  const [currentScrubMs, setCurrentScrubMs] = useState<number>(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatMs = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const addCheckpointAtCurrentScrub = () => {
    const id = `chk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newChk: VideoCheckpoint = {
      id,
      timestampMs: Math.max(0, currentScrubMs),
      type: 'question',
      title: 'Interactive Checkpoint',
      questionEn: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: 0,
      resumeAction: 'on_answer',
    };
    const updated = [...checkpoints, newChk].sort((a, b) => a.timestampMs - b.timestampMs);
    onChange(updated);
    setExpandedId(id);
  };

  const updateCheckpoint = (id: string, patch: Partial<VideoCheckpoint>) => {
    const updated = checkpoints.map((chk) => (chk.id === id ? { ...chk, ...patch } : chk));
    onChange(updated.sort((a, b) => a.timestampMs - b.timestampMs));
  };

  const removeCheckpoint = (id: string) => {
    onChange(checkpoints.filter((chk) => chk.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const getTypeBadgeClass = (type: VideoCheckpointType) => {
    switch (type) {
      case 'question': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'simulation_prompt': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'gurutatva_pause': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'explorable_note': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-[#080C14]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>In-Video Interactive Checkpoints (§8.4)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {checkpoints.length} Active
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Trigger MCQs, simulation prompts, and Gurutatva pauses during playback</p>
          </div>
        </div>

        <button
          type="button"
          onClick={addCheckpointAtCurrentScrub}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg shadow transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add at {formatMs(currentScrubMs)}</span>
        </button>
      </div>

      {/* Visual Timeline Scrubber */}
      <div className="p-3 rounded-lg border border-slate-800/80 bg-[#03050B] space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>0:00</span>
          <span className="text-amber-400 font-bold">Scrubber: {formatMs(currentScrubMs)} ({Math.round(currentScrubMs / 1000)}s)</span>
          <span>{formatMs(effectiveDurationMs)}</span>
        </div>

        <div className="relative py-2">
          <input
            type="range"
            min={0}
            max={effectiveDurationMs}
            step={1000}
            value={currentScrubMs}
            onChange={(e) => setCurrentScrubMs(parseInt(e.target.value, 10) || 0)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          {/* Checkpoint Markers on Scrubber */}
          <div className="absolute top-2 left-0 right-0 h-2 pointer-events-none">
            {checkpoints.map((chk) => {
              const pct = Math.min(100, Math.max(0, (chk.timestampMs / effectiveDurationMs) * 100));
              return (
                <div
                  key={chk.id}
                  style={{ left: `${pct}%` }}
                  title={`${chk.title || chk.type} at ${formatMs(chk.timestampMs)}`}
                  className={`absolute -top-1 w-2.5 h-4 -translate-x-1/2 rounded-sm border shadow-sm ${
                    chk.type === 'question' ? 'bg-amber-400 border-amber-300' :
                    chk.type === 'simulation_prompt' ? 'bg-emerald-400 border-emerald-300' :
                    chk.type === 'gurutatva_pause' ? 'bg-purple-400 border-purple-300' :
                    'bg-sky-400 border-sky-300'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Checkpoints List */}
      {checkpoints.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
          No checkpoints defined. Scrub the timeline and click &quot;+ Add at mm:ss&quot;.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {checkpoints.map((chk, idx) => {
            const isExpanded = expandedId === chk.id;
            return (
              <div
                key={chk.id}
                className="rounded-lg border border-slate-800/80 bg-[#0B0F19] overflow-hidden hover:border-slate-700 transition-colors"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : chk.id)}
                  className="flex items-center justify-between p-3 cursor-pointer select-none bg-[#0B0F19]/90 hover:bg-[#0E1422]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {formatMs(chk.timestampMs)}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getTypeBadgeClass(chk.type)}`}>
                      {chk.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-200 font-medium truncate max-w-[200px] sm:max-w-xs">
                      {chk.title || chk.questionEn || 'Untitled Checkpoint'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeCheckpoint(chk.id); }}
                      className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <CheckpointItemEditor
                    chk={chk}
                    onUpdate={(patch) => updateCheckpoint(chk.id, patch)}
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
