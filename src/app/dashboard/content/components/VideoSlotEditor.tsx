'use client';

import React from 'react';
import { Video, Play } from 'lucide-react';
import { Step } from '@/types/curriculum';
import { TranscriptEditor } from './TranscriptEditor';
import { VideoCheckpointsManager } from './VideoCheckpointsManager';

interface VideoSlotEditorProps {
  step: Step;
  onChange: (patch: Partial<Step>) => void;
}

export function VideoSlotEditor({ step, onChange }: VideoSlotEditorProps) {
  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-[#080C14]">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Video className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Video Streaming Slot</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              R2 / Stream
            </span>
          </h4>
          <p className="text-[11px] text-slate-400">Cloudflare R2 streaming video with 3-locale synchronized subtitles</p>
        </div>
      </div>

      <div className="space-y-3 p-3 rounded-lg border border-slate-800/60 bg-[#0B0F19]">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
          <Play className="w-3.5 h-3.5" />
          <span>Stream Sources & Media Metadata</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
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
            <label className="text-[11px] text-slate-400 block mb-1">Cloudflare Stream UID (Optional)</label>
            <input
              type="text"
              value={step.streamUid || ''}
              onChange={(e) => onChange({ streamUid: e.target.value })}
              placeholder="e.g. 5d5380d4e654460d3e1a91da7645efd6"
              className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Aspect Ratio</label>
            <select
              value={step.aspectRatio || '16:9'}
              onChange={(e) => onChange({ aspectRatio: e.target.value as '16:9' | '9:16' | '4:3' })}
              className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
            >
              <option value="16:9">16:9 Landscape (Standard)</option>
              <option value="9:16">9:16 Portrait (Mobile Story)</option>
              <option value="4:3">4:3 Classical Academy</option>
            </select>
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

      <TranscriptEditor
        transcript={step.transcript || []}
        onChange={(transcript) => onChange({ transcript })}
      />

      <VideoCheckpointsManager
        checkpoints={step.checkpoints || []}
        videoDurationMs={step.videoDurationMs || 0}
        onChange={(checkpoints) => onChange({ checkpoints })}
      />
    </div>
  );
}
