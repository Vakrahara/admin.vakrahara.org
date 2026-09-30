'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Headphones, Play, Pause, UploadCloud, 
  Sparkles, Plus, Trash2, Clock 
} from 'lucide-react';
import { AudioOverview, TranscriptCue } from '@/types/curriculum';

interface AudioOverviewManagerProps {
  audioOverview?: AudioOverview;
  moduleTitle: string;
  onChange: (updated: AudioOverview) => void;
}

export function AudioOverviewManager({
  audioOverview = {
    enabled: false,
    durationMs: 0,
    audioUrlEn: '',
    waveformPeaks: [],
    cues: []
  },
  moduleTitle,
  onChange
}: AudioOverviewManagerProps) {
  const [activeLang, setActiveLang] = useState<'en' | 'hi' | 'hng'>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [playbackPosMs, setPlaybackPosMs] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeAudioUrl = activeLang === 'en' 
    ? audioOverview.audioUrlEn 
    : activeLang === 'hi' 
      ? audioOverview.audioUrlHi || audioOverview.audioUrlEn
      : audioOverview.audioUrlHng || audioOverview.audioUrlEn;

  useEffect(() => {
    setIsPlaying(false);
    setPlaybackPosMs(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [activeLang]);

  const handleToggleEnabled = () => {
    onChange({ ...audioOverview, enabled: !audioOverview.enabled });
  };

  const handlePlayToggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackPosMs(Math.round(audioRef.current.currentTime * 1000));
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackPosMs(0);
  };

  const seekToMs = (ms: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = ms / 1000;
      setPlaybackPosMs(ms);
    }
  };

  // Web Audio API Peak Extraction with proper cleanup
  const extractPeaksAndDuration = async (blob: Blob): Promise<{ peaks: number[]; durationMs: number }> => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioCtx();
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const rawData = audioBuffer.getChannelData(0);
      const samples = 64;
      const blockSize = Math.max(1, Math.floor(rawData.length / samples));
      const peaks: number[] = [];

      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i;
        let sum = 0;
        let count = 0;
        for (let j = 0; j < blockSize && (blockStart + j) < rawData.length; j++) {
          const val = rawData[blockStart + j];
          sum += val * val;
          count++;
        }
        const rms = count > 0 ? Math.sqrt(sum / count) : 0;
        peaks.push(Math.min(1.0, rms * 2.5));
      }
      return { peaks, durationMs: Math.round(audioBuffer.duration * 1000) };
    } finally {
      await audioContext.close().catch(() => {});
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { peaks, durationMs } = await extractPeaksAndDuration(file);
      const tempUrl = URL.createObjectURL(file);
      const patch = activeLang === 'en' 
        ? { audioUrlEn: tempUrl }
        : activeLang === 'hi' 
          ? { audioUrlHi: tempUrl }
          : { audioUrlHng: tempUrl };

      onChange({
        ...audioOverview,
        enabled: true,
        ...patch,
        waveformPeaks: peaks,
        durationMs
      });
    } catch {
      alert('Failed to decode audio. Please ensure valid MP3/WAV file.');
    }
  };

  const handleSynthesizeTts = () => {
    setIsGeneratingTts(true);
    setTimeout(() => {
      const dummyPeaks = Array.from({ length: 64 }, () => Math.round((Math.random() * 0.7 + 0.15) * 100) / 100);
      const patch = activeLang === 'en'
        ? { audioUrlEn: 'https://amritam-cdn.vakrahara.org/audio/sample_en.mp3' }
        : activeLang === 'hi'
          ? { audioUrlHi: 'https://amritam-cdn.vakrahara.org/audio/sample_hi.mp3' }
          : { audioUrlHng: 'https://amritam-cdn.vakrahara.org/audio/sample_hng.mp3' };

      onChange({
        ...audioOverview,
        enabled: true,
        durationMs: 75000,
        ...patch,
        waveformPeaks: dummyPeaks,
        cues: audioOverview.cues.length > 0 ? audioOverview.cues : [
          { id: 'c1', startMs: 0, endMs: 8000, textEn: `Welcome back to ${moduleTitle}. Here is your recap.`, textHi: `${moduleTitle} में पुनः स्वागत है।`, textHng: `${moduleTitle} mein fir se swagat hai.` },
          { id: 'c2', startMs: 8000, endMs: 18000, textEn: 'Review the core forces and historical connections covered.', textHi: 'पाठ में प्रस्तुत मुख्य सिद्धांतों का अवलोकन करें।', textHng: 'Lesson ke core concepts ko review karein.' }
        ]
      });
      setIsGeneratingTts(false);
    }, 1200);
  };

  const addCue = () => {
    const last = audioOverview.cues[audioOverview.cues.length - 1];
    const startMs = last ? last.endMs : 0;
    const endMs = startMs + 6000;
    onChange({
      ...audioOverview,
      cues: [...audioOverview.cues, { id: `cue_${Date.now()}`, startMs, endMs, textEn: '', textHi: '', textHng: '' }]
    });
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl border border-white/5 bg-black/40">
      <audio
        ref={audioRef}
        src={activeAudioUrl}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Revisit Audio Micro-Podcast (स्मृति-श्रुति)
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                audioOverview.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400'
              }`}>
                {audioOverview.enabled ? 'Active' : 'Disabled'}
              </span>
            </h4>
            <p className="text-xs text-gray-400">60–120s studio recap with synchronized Karaōke transcript</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleEnabled}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              audioOverview.enabled ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            {audioOverview.enabled ? 'Deactivate Podcast' : 'Activate Podcast'}
          </button>

          <button
            type="button"
            onClick={handleSynthesizeTts}
            disabled={isGeneratingTts}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingTts ? 'Synthesizing...' : `⚡ AI TTS (${activeLang.toUpperCase()})`}</span>
          </button>
        </div>
      </div>

      {audioOverview.enabled && (
        <div className="space-y-4 pt-2">
          {/* Locale Bar */}
          <div className="flex items-center justify-between bg-[#08080c] p-2.5 rounded-xl border border-white/5">
            <div className="text-xs font-semibold text-gray-300">Active Audio Locale:</div>
            <div className="flex items-center p-0.5 rounded-lg bg-black/60 border border-white/10">
              {(['en', 'hi', 'hng'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLang(l)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md uppercase transition-all cursor-pointer ${
                    activeLang === l ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'Hinglish'}
                </button>
              ))}
            </div>
          </div>

          {/* Player & Waveform */}
          <div className="p-4 rounded-xl border border-white/5 bg-[#08080c] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  disabled={!activeAudioUrl}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-amber-300 text-black flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer disabled:opacity-30"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <div>
                  <div className="text-xs font-bold text-white font-mono">
                    {Math.floor(playbackPosMs / 1000)}s / {Math.floor(audioOverview.durationMs / 1000)}s
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono truncate max-w-[240px]">
                    {activeAudioUrl ? activeAudioUrl.split('/').pop() : 'No audio loaded for this locale'}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300 hover:text-white cursor-pointer transition-all">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload {activeLang.toUpperCase()} MP3</span>
                <input type="file" accept="audio/mp3,audio/wav" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Clickable Waveform */}
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                seekToMs(Math.round(ratio * audioOverview.durationMs));
              }}
              className="h-16 w-full flex items-center gap-1 px-2 bg-black/60 rounded-lg border border-white/5 cursor-pointer"
            >
              {audioOverview.waveformPeaks.length > 0 ? (
                audioOverview.waveformPeaks.map((peak, idx) => {
                  const progressRatio = audioOverview.durationMs > 0 ? playbackPosMs / audioOverview.durationMs : 0;
                  const barRatio = idx / audioOverview.waveformPeaks.length;
                  const isPassed = barRatio <= progressRatio;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full transition-all ${
                        isPassed ? 'bg-[#d4af37]' : 'bg-indigo-600/40'
                      }`}
                      style={{ height: `${Math.max(12, peak * 100)}%` }}
                    />
                  );
                })
              ) : (
                <div className="text-center w-full text-gray-500 text-xs">
                  Upload audio or trigger AI TTS to generate 64-peak waveform
                </div>
              )}
            </div>
          </div>

          {/* Subtitles Cues */}
          <div className="p-4 rounded-xl border border-white/5 bg-[#08080c] space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Transcript Cues ({audioOverview.cues.length}) [{activeLang.toUpperCase()}]
              </span>
              <button
                type="button"
                onClick={addCue}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Cue
              </button>
            </div>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {audioOverview.cues.map((cue, idx) => (
                <div key={cue.id} className="p-2.5 rounded-lg border border-white/5 bg-black/40 flex items-center gap-2.5">
                  <span className="text-[10px] font-mono text-gray-500 font-bold">#{idx + 1}</span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-indigo-300">
                    <input
                      type="number"
                      value={cue.startMs}
                      onChange={(e) => {
                        const updated = audioOverview.cues.map((c, i) => i === idx ? { ...c, startMs: Number(e.target.value) } : c);
                        onChange({ ...audioOverview, cues: updated });
                      }}
                      className="w-14 px-1 py-0.5 bg-black/60 border border-white/10 rounded text-center text-white"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={cue.endMs}
                      onChange={(e) => {
                        const updated = audioOverview.cues.map((c, i) => i === idx ? { ...c, endMs: Number(e.target.value) } : c);
                        onChange({ ...audioOverview, cues: updated });
                      }}
                      className="w-14 px-1 py-0.5 bg-black/60 border border-white/10 rounded text-center text-white"
                    />
                    <span>ms</span>
                  </div>
                  <input
                    type="text"
                    value={activeLang === 'hi' ? cue.textHi || '' : activeLang === 'hng' ? cue.textHng || '' : cue.textEn}
                    onChange={(e) => {
                      const updated = audioOverview.cues.map((c, i) => {
                        if (i !== idx) return c;
                        if (activeLang === 'hi') return { ...c, textHi: e.target.value };
                        if (activeLang === 'hng') return { ...c, textHng: e.target.value };
                        return { ...c, textEn: e.target.value };
                      });
                      onChange({ ...audioOverview, cues: updated });
                    }}
                    placeholder={`Transcript text in ${activeLang.toUpperCase()}...`}
                    className="flex-1 px-2.5 py-1 bg-black/60 border border-white/10 rounded text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => seekToMs(cue.startMs)}
                    className="px-2 py-0.5 text-[9px] bg-white/5 hover:bg-white/10 text-gray-300 rounded cursor-pointer"
                  >
                    Play
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...audioOverview, cues: audioOverview.cues.filter((_, i) => i !== idx) })}
                    className="p-1 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
