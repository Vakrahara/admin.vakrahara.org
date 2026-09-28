'use client';

import React from 'react';
import { Video, Play, Layers } from 'lucide-react';
import { Step, MediaMode } from '@/types/curriculum';

interface VideoMediaFormProps {
  step: Step;
  onChange: (updated: Partial<Step>) => void;
}

export function VideoMediaForm({ step, onChange }: VideoMediaFormProps) {
  const mediaMode: MediaMode = step.mediaMode || (
    step.videoUrl && step.simulationId ? 'both' :
    step.videoUrl ? 'video_only' :
    step.simulationId ? 'simulation_only' : 'none'
  );

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-[#080C14]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Content-Aware Media Area (§7.1)</h4>
            <p className="text-[11px] text-slate-400">Configure video streaming, interactive simulation, or dual toggle</p>
          </div>
        </div>

        {/* Media Mode Segmented Switch */}
        <div className="flex items-center p-1 rounded-lg bg-[#03050B] border border-slate-800">
          {(['none', 'video_only', 'simulation_only', 'both'] as MediaMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ mediaMode: mode })}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                mediaMode === mode
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Video Settings */}
      {(mediaMode === 'video_only' || mediaMode === 'both') && (
        <div className="space-y-3 p-3 rounded-lg border border-slate-800/60 bg-[#0B0F19]">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <Play className="w-3.5 h-3.5" />
            <span>Embedded Video Streaming (Cloudflare R2 / HLS)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-[11px] text-slate-400 block mb-1">Direct MP4 or HLS Stream URL</label>
              <input
                type="text"
                value={step.videoUrl || ''}
                onChange={(e) => onChange({ videoUrl: e.target.value })}
                placeholder="https://cdn.vakrahara.org/v1/videos/light_reflection.mp4"
                className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Duration (seconds)</label>
              <input
                type="number"
                value={step.videoDurationMs ? Math.round(step.videoDurationMs / 1000) : ''}
                onChange={(e) => onChange({ videoDurationMs: (parseInt(e.target.value, 10) || 0) * 1000 })}
                placeholder="120"
                className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Simulation Settings */}
      {(mediaMode === 'simulation_only' || mediaMode === 'both') && (
        <div className="space-y-3 p-3 rounded-lg border border-slate-800/60 bg-[#0B0F19]">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Layers className="w-3.5 h-3.5" />
            <span>ACE Simulation Canvas & Parameters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Simulation ID</label>
              <input
                type="text"
                value={step.simulationId || ''}
                onChange={(e) => onChange({ simulationId: e.target.value })}
                placeholder="e.g. ray_optics, what_is_a_wave"
                className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Sub-Step Count (Dynamic Progress)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={step.subStepCount || 1}
                onChange={(e) => onChange({ subStepCount: parseInt(e.target.value, 10) || 1 })}
                className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Params (JSON Format)</label>
              <input
                type="text"
                value={step.params ? JSON.stringify(step.params) : '{}'}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onChange({ params: parsed });
                  } catch {
                    // allow typing
                  }
                }}
                placeholder='{"type": 1.0, "mode": 0.0}'
                className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-400 outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
