'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Sparkles, HelpCircle, BookOpen, Video, Brain, Layers } from 'lucide-react';
import { Step } from '@/types/curriculum';

interface DigitalTwinPreviewProps {
  step: Step | null;
  moduleTitle?: string;
}

export const DigitalTwinPreview: React.FC<DigitalTwinPreviewProps> = ({ step, moduleTitle }) => {
  const [dualModeTab, setDualModeTab] = useState<'video' | 'simulation'>('video');
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    setVideoError(false);
  }, [step?.id, step?.videoUrl]);

  if (!step) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 border border-slate-800 rounded-2xl bg-slate-950/40">
        <Smartphone className="w-12 h-12 mb-3 text-amber-500/40 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-400">Digital Twin Live Preview</h4>
        <p className="text-xs text-slate-600 mt-1 max-w-xs">
          Select a step to see how it renders inside the Amrtam Android App in real-time.
        </p>
      </div>
    );
  }

  const cdnUrl = 'https://cdn.vakrahara.org/v1';
  const pool = step.pool || step.questionPool || [];
  const sampleQ = pool[0];

  return (
    <div className="flex flex-col h-full bg-slate-950/80 border border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Mobile Bar Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-amber-500/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-[11px] font-bold tracking-wide uppercase text-amber-400">Amrtam Live View</span>
        </div>
        <div className="flex items-center gap-1.5">
          {step.type === 'video_simulation' && step.mediaMode === 'both' && (
            <div className="flex items-center bg-black/60 rounded p-0.5 border border-slate-800 text-[9px] font-mono mr-1">
              <button
                type="button"
                onClick={() => setDualModeTab('video')}
                className={`px-1.5 py-0.5 rounded ${dualModeTab === 'video' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400'}`}
              >
                Video
              </button>
              <button
                type="button"
                onClick={() => setDualModeTab('simulation')}
                className={`px-1.5 py-0.5 rounded ${dualModeTab === 'simulation' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}
              >
                Sim
              </button>
            </div>
          )}
          <span className="text-[10px] text-slate-400 font-mono">{step.type}</span>
        </div>
      </div>

      {/* Main Canvas / Content Simulation Screen */}
      <div className="relative flex-1 bg-[#0b0d17] overflow-hidden flex flex-col justify-between p-3.5 space-y-2.5">
        {/* Module Title Overlay */}
        <div className="z-10 flex items-center justify-between bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
          <span className="text-xs font-medium text-slate-300 truncate">{moduleTitle || 'Module Walkthrough'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
            {step.type.replace('_', ' ')}
          </span>
        </div>

        {/* Center Media / Simulation / Canvas */}
        <div className="my-auto relative flex items-center justify-center min-h-[170px]">
          {step.type === 'video_simulation' ? (
            <div className={`w-full rounded-xl overflow-hidden border border-amber-500/30 bg-black ${
              step.aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[260px]' :
              step.aspectRatio === '4:3' ? 'aspect-[4/3] max-h-[220px]' :
              'aspect-video'
            } flex flex-col items-center justify-center p-1 relative`}>
              {(step.mediaMode === 'both' && dualModeTab === 'simulation' && step.simulationId) ? (
                <iframe
                  src={`${cdnUrl}/cbse/simulations/${step.simulationId}.html`}
                  className="w-full h-full border-0 rounded-lg"
                  title="Simulation Preview"
                />
              ) : step.streamUid ? (
                <iframe
                  src={`https://iframe.videodelivery.net/${step.streamUid}`}
                  className="w-full h-full border-0 rounded-lg"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  title="Cloudflare Stream"
                />
              ) : step.videoUrl ? (
                step.videoUrl.includes('videodelivery.net') || step.videoUrl.includes('cloudflarestream.com') ? (
                  <iframe
                    src={step.videoUrl.startsWith('http') ? step.videoUrl : `https://iframe.videodelivery.net/${step.videoUrl}`}
                    className="w-full h-full border-0 rounded-lg"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                    title="Video Stream"
                  />
                ) : videoError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-black/80 rounded-lg border border-amber-500/20 text-xs text-slate-400 space-y-1.5">
                    <Video className="w-7 h-7 text-amber-500/60" />
                    <span className="font-semibold text-amber-400 text-xs">Video Asset Pending</span>
                    <span className="text-[10px] text-slate-500 font-mono break-all line-clamp-1 max-w-[200px]">{step.videoUrl}</span>
                    {step.simulationId && (
                      <button
                        type="button"
                        onClick={() => setDualModeTab('simulation')}
                        className="mt-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer"
                      >
                        Switch to Simulation
                      </button>
                    )}
                  </div>
                ) : (
                  <video
                    controls
                    src={step.videoUrl}
                    poster={step.imageUrl}
                    onError={() => setVideoError(true)}
                    className="w-full h-full object-contain rounded-lg bg-black"
                  >
                    Your browser does not support HTML5 video.
                  </video>
                )
              ) : step.simulationId ? (
                <iframe
                  src={`${cdnUrl}/cbse/simulations/${step.simulationId}.html`}
                  className="w-full h-full border-0 rounded-lg"
                  title="Simulation Preview"
                />
              ) : (
                <div className="text-center text-slate-500 text-xs flex flex-col items-center">
                  <Video className="w-8 h-8 mb-1 text-slate-600" />
                  <span>Media Area (0dp Collapse if unconfigured)</span>
                </div>
              )}
            </div>
          ) : step.type === 'saraswati' ? (
            <div className="w-full p-3.5 rounded-xl border border-yellow-500/30 bg-yellow-500/5 space-y-1.5 text-center">
              <Sparkles className="w-7 h-7 text-yellow-400 mx-auto" />
              <div className="text-xs font-bold text-yellow-300">Progressive Definition Assembly</div>
              <p className="text-[11px] text-slate-300 italic font-serif line-clamp-3">
                {step.definitionEn || 'Definition fragments will assemble here upon solving mini-steps...'}
              </p>
              <div className="text-[10px] text-yellow-400/80 font-mono">
                {(step.miniSteps || []).length} Mini-Steps Configured
              </div>
            </div>
          ) : step.type === 'anveshana' ? (
            <div className="w-full p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5 text-center">
              <Brain className="w-7 h-7 text-emerald-400 mx-auto" />
              <div className="text-xs font-bold text-emerald-300">Anveshana Assessment Engine</div>
              <div className="text-[11px] text-slate-300">
                Pool Size: <span className="font-bold text-emerald-400">{pool.length} Questions</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Attempt: {step.questionsPerAttempt || 5} Random MCQs • Pass: {step.passingScore || 4}/5
              </div>
            </div>
          ) : step.simulationId ? (
            <iframe
              src={`${cdnUrl}/cbse/simulations/${step.simulationId}.html`}
              className="w-full h-44 border-0 rounded-xl bg-black/40 shadow-inner"
              title="Simulation Preview"
            />
          ) : (
            <div className="w-full h-36 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-purple-500/5 flex flex-col items-center justify-center p-3 text-center">
              {step.type === 'predict_quiz' ? (
                <HelpCircle className="w-8 h-8 text-purple-400 mb-1" />
              ) : (
                <BookOpen className="w-8 h-8 text-blue-400 mb-1" />
              )}
              <span className="text-xs text-slate-400 font-medium">Concept Explanation Canvas</span>
            </div>
          )}
        </div>

        {/* Lower Interactive Step Card */}
        {step.type === 'anveshana' && sampleQ ? (
          <div className="z-10 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-2.5 shadow-xl space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="font-bold text-emerald-400">Sample Question (1 of {pool.length})</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                {sampleQ.questionType?.replace('_', ' ') || 'MCQ'}
              </span>
            </div>
            <h5 className="text-[11px] font-semibold text-slate-200 line-clamp-2">{sampleQ.questionEn}</h5>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
              {(sampleQ.options || ['Option A', 'Option B']).map((opt, idx) => (
                <div
                  key={idx}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                    idx === (sampleQ.correctOptionIndex || 0)
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
                  }`}
                >
                  <span className="font-mono text-slate-500 mr-1">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </div>
              ))}
            </div>
          </div>
        ) : (step.type === 'saraswati' && step.miniSteps && step.miniSteps.length > 0) ? (
          (() => {
            const firstMini = step.miniSteps[0];
            return (
              <div className="z-10 bg-slate-900/90 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-2.5 shadow-xl space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold text-yellow-400">Mini-Step 1 of {step.miniSteps.length}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300">Socratic</span>
                </div>
                <h5 className="text-[11px] font-semibold text-slate-200 line-clamp-2">{firstMini.questionEn}</h5>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
                  {(firstMini.options || ['Option A', 'Option B']).map((opt, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                        idx === (firstMini.correctIndex || 0)
                          ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                          : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
                      }`}
                    >
                      <span className="font-mono text-slate-500 mr-1">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()
        ) : step.type === 'predict_quiz' ? (
          <div className="z-10 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-xl p-2.5 shadow-xl">
            <h5 className="text-xs font-bold text-amber-300 mb-1.5">{step.questionText || step.question || 'Quiz Question'}</h5>
            <div className="space-y-1">
              {(step.options || ['Option A', 'Option B']).map((opt, idx) => (
                <div
                  key={idx}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    idx === step.correctOptionIndex
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="z-10 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-xl p-2.5 shadow-xl">
            {step.textDeva && (
              <p className="text-xs font-semibold text-amber-200 font-serif leading-relaxed mb-1">
                {step.textDeva}
              </p>
            )}
            {step.textEng && (
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-3">
                {step.textEng}
              </p>
            )}
            {step.gurutatva && (
              <div className="mt-1.5 pt-1.5 border-t border-amber-500/20 flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
                <Sparkles className="w-3 h-3" />
                <span>Gurutatva: {step.gurutatva.titleEn}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="px-4 py-2 bg-slate-900 border-t border-amber-500/10 flex items-center justify-between text-xs text-slate-400">
        <button disabled className="px-3 py-1 rounded-md bg-slate-800 text-slate-500 opacity-60">Back</button>
        <button disabled className="px-4 py-1 rounded-md bg-amber-500 text-slate-950 font-bold">Next</button>
      </div>
    </div>
  );
};
