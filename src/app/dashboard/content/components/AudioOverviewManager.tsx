'use client';

import React, { useState } from 'react';
import { Headphones, Plus, Trash2, Upload, Music, Clock } from 'lucide-react';
import { AudioOverview, SubtitleCue } from '@/types/curriculumTriad';
import { generate64PeaksFromBuffer } from '../utils/audioWaveformGenerator';

interface AudioOverviewManagerProps {
  audioOverview?: AudioOverview;
  onChange: (overview: AudioOverview) => void;
}

export function AudioOverviewManager({ audioOverview, onChange }: AudioOverviewManagerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const overview: AudioOverview = audioOverview || {
    enabled: false,
    durationMs: 60000,
    bitrateKbps: 64,
    audioUrlEn: '',
    waveformPeaks: new Array(64).fill(0.3),
    cues: [],
    sourceType: 'notebooklm'
  };

  const handleToggleEnabled = () => {
    onChange({ ...overview, enabled: !overview.enabled });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = await generate64PeaksFromBuffer(buffer);
      onChange({
        ...overview,
        durationMs: result.durationMs,
        waveformPeaks: result.peaks
      });
    } catch (err: unknown) {
      setAnalysisError((err as Error)?.message || 'Failed to decode audio file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddCue = () => {
    const newCue: SubtitleCue = {
      id: `cue_${overview.cues.length + 1}`,
      startMs: overview.cues.length > 0 ? overview.cues[overview.cues.length - 1].endMs : 0,
      endMs: (overview.cues.length > 0 ? overview.cues[overview.cues.length - 1].endMs : 0) + 15000,
      textEn: ''
    };
    onChange({ ...overview, cues: [...overview.cues, newCue] });
  };

  const handleUpdateCue = (id: string, patch: Partial<SubtitleCue>) => {
    const updated = overview.cues.map(c => c.id === id ? { ...c, ...patch } : c);
    onChange({ ...overview, cues: updated });
  };

  const handleDeleteCue = (id: string) => {
    onChange({ ...overview, cues: overview.cues.filter(c => c.id !== id) });
  };

  return (
    <div className="glass-panel border border-white/5 bg-black/40 p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-cyan-400" />
          <div>
            <h4 className="font-bold text-xs text-cyan-400 uppercase tracking-wider">
              स्मृति-श्रुति • Revisit Audio Overview
            </h4>
            <p className="text-[10px] text-gray-500">64-peak waveform & synchronized karaōke</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={overview.enabled}
              onChange={handleToggleEnabled}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
          <span className="text-[10px] font-mono uppercase text-gray-400">
            {overview.enabled ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      {overview.enabled && (
        <div className="space-y-4 pt-1">
          {/* Audio CDN URLs */}
          <div className="space-y-2">
            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Audio URL (Canonical EN R2)</label>
              <input
                type="text"
                value={overview.audioUrlEn}
                onChange={(e) => onChange({ ...overview, audioUrlEn: e.target.value })}
                placeholder="https://amritam-cdn.vakrahara.org/.../overview_en.mp3"
                className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Audio URL (Hindi)</label>
                <input
                  type="text"
                  value={overview.audioUrlHi || ''}
                  onChange={(e) => onChange({ ...overview, audioUrlHi: e.target.value })}
                  placeholder="https://.../overview_hi.mp3"
                  className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Audio URL (Hinglish)</label>
                <input
                  type="text"
                  value={overview.audioUrlHng || ''}
                  onChange={(e) => onChange({ ...overview, audioUrlHng: e.target.value })}
                  placeholder="https://.../overview_hng.mp3"
                  className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* 64-Peak Waveform Visualizer & Prober */}
          <div className="p-3 bg-[#08080c] border border-cyan-500/20 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <Music className="w-3.5 h-3.5" />
                <span>64-Peak Tactile Waveform</span>
                <span className="text-[10px] text-gray-500 font-mono font-normal">
                  ({Math.round((overview.durationMs || 0) / 1000)}s • {overview.bitrateKbps || 64} kbps)
                </span>
              </div>
              <label className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold rounded-lg cursor-pointer transition-all">
                <Upload className="w-3 h-3" />
                <span>{isAnalyzing ? 'Decoding...' : 'Probe Local Audio'}</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  disabled={isAnalyzing}
                  className="hidden"
                />
              </label>
            </div>

            {analysisError && (
              <p className="text-[10px] text-red-400">{analysisError}</p>
            )}

            {/* Waveform Bars */}
            <div className="h-12 bg-black/60 border border-white/5 rounded-lg p-2 flex items-center gap-[2px]">
              {(overview.waveformPeaks || []).map((peak, pIndex) => (
                <div
                  key={pIndex}
                  className="flex-1 bg-cyan-400/80 rounded-full transition-all hover:bg-cyan-300"
                  style={{ height: `${Math.max(10, Math.round(peak * 100))}%` }}
                  title={`Slice ${pIndex + 1}: ${Math.round(peak * 100)}%`}
                />
              ))}
            </div>
          </div>

          {/* Subtitle Karaōke Cues List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Synchronized Cues ({overview.cues.length})
              </span>
              <button
                type="button"
                onClick={handleAddCue}
                className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold rounded-lg transition-all"
              >
                <Plus className="w-3 h-3" />
                Add Cue
              </button>
            </div>

            {overview.cues.map((cue, index) => (
              <div key={cue.id} className="p-2.5 bg-[#08080c] border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                      <Clock className="w-3 h-3 text-cyan-500/60" />
                      <input
                        type="number"
                        value={cue.startMs}
                        onChange={(e) => handleUpdateCue(cue.id, { startMs: parseInt(e.target.value, 10) || 0 })}
                        className="w-16 px-1 py-0.5 bg-[#0d0d15] border border-white/5 rounded text-white text-[10px]"
                      />
                      <span>ms →</span>
                      <input
                        type="number"
                        value={cue.endMs}
                        onChange={(e) => handleUpdateCue(cue.id, { endMs: parseInt(e.target.value, 10) || 0 })}
                        className="w-16 px-1 py-0.5 bg-[#0d0d15] border border-white/5 rounded text-white text-[10px]"
                      />
                      <span>ms</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCue(cue.id)}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    value={cue.textEn}
                    onChange={(e) => handleUpdateCue(cue.id, { textEn: e.target.value })}
                    placeholder="English Karaōke subtitle..."
                    className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={cue.textHi || ''}
                      onChange={(e) => handleUpdateCue(cue.id, { textHi: e.target.value })}
                      placeholder="हिन्दी सबटाइटल..."
                      className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                    />
                    <input
                      type="text"
                      value={cue.textHng || ''}
                      onChange={(e) => handleUpdateCue(cue.id, { textHng: e.target.value })}
                      placeholder="Hinglish subtitle..."
                      className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
