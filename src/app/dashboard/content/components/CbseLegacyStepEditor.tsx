'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Step } from '@/types/curriculum';

interface CbseLegacyStepEditorProps {
  step: Step;
  onUpdateStep: (patch: Partial<Step>) => void;
}

export function CbseLegacyStepEditor({ step, onUpdateStep }: CbseLegacyStepEditorProps) {
  if (step.type === 'concept') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Devanagari Title (Deva)
          </label>
          <input
            type="text"
            value={step.textDeva || ''}
            onChange={(e) => onUpdateStep({ textDeva: e.target.value })}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            English Explanation (Eng - supports markdown)
          </label>
          <textarea
            value={step.textEng || ''}
            rows={5}
            onChange={(e) => onUpdateStep({ textEng: e.target.value })}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
      </div>
    );
  }

  if (step.type === 'simulation') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Simulation ID
          </label>
          <select
            value={step.simulationId || ''}
            onChange={(e) => onUpdateStep({ simulationId: e.target.value })}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          >
            <option value="what_is_a_wave">Wave Motion Simulation</option>
            <option value="wave_intro">Wave Oscillation Lab</option>
            <option value="ray_optics">Ray Optics Reflection Lab</option>
            <option value="refraction_slab">Refraction Prism Lab</option>
            <option value="total_internal_reflection">TIR Reflection Lab</option>
            <option value="prism_dispersion">Prism Dispersion Lab</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Params Configuration (JSON)
          </label>
          <textarea
            value={JSON.stringify(step.params || {}, null, 2)}
            rows={3}
            onChange={(e) => {
              try {
                const obj = JSON.parse(e.target.value);
                onUpdateStep({ params: obj });
              } catch (err) {
                // Allow typing broken JSON temporarily
              }
            }}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Guided Lab Instructions (English)
          </label>
          <textarea
            value={step.questionText || ''}
            rows={2}
            onChange={(e) => onUpdateStep({ questionText: e.target.value })}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
      </div>
    );
  }

  if (step.type === 'predict_quiz') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Quiz Question
          </label>
          <textarea
            value={step.question || ''}
            rows={2}
            onChange={(e) => onUpdateStep({ question: e.target.value })}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Options</label>
          {(step.options || []).map((opt, oIdx) => (
            <div key={oIdx} className="flex gap-2 items-center">
              <span className="text-[10px] text-gray-500 font-mono w-4">{oIdx}.</span>
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const opts = [...(step.options || [])];
                  opts[oIdx] = e.target.value;
                  onUpdateStep({ options: opts });
                }}
                className="flex-1 px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
              />
              <button
                type="button"
                onClick={() => {
                  const opts = (step.options || []).filter((_, idx) => idx !== oIdx);
                  onUpdateStep({ options: opts });
                }}
                className="text-gray-500 hover:text-red-400 p-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const opts = [...(step.options || []), ''];
              onUpdateStep({ options: opts });
            }}
            className="text-xs text-[#d4af37] flex items-center gap-1 font-semibold hover:underline cursor-pointer"
          >
            + Add Option
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
              Correct Option Index
            </label>
            <select
              value={step.correctOptionIndex || 0}
              onChange={(e) => onUpdateStep({ correctOptionIndex: parseInt(e.target.value) })}
              className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
            >
              {(step.options || []).map((_, idx) => (
                <option key={idx} value={idx}>{idx}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
              Target Module ID
            </label>
            <input
              type="text"
              value={step.targetModuleId || ''}
              onChange={(e) => onUpdateStep({ targetModuleId: e.target.value })}
              placeholder="e.g. c10_physics_light_m2"
              className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>
        </div>

        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Quiz Explanation
          </label>
          <textarea
            value={step.explanation || ''}
            rows={2}
            onChange={(e) => onUpdateStep({ explanation: e.target.value })}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Hints</label>
          {(step.hints || []).map((hint, hIdx) => (
            <div key={hIdx} className="flex gap-2 items-center">
              <input
                type="text"
                value={hint}
                onChange={(e) => {
                  const hints = [...(step.hints || [])];
                  hints[hIdx] = e.target.value;
                  onUpdateStep({ hints });
                }}
                className="flex-1 px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
              />
              <button
                type="button"
                onClick={() => {
                  const hints = (step.hints || []).filter((_, idx) => idx !== hIdx);
                  onUpdateStep({ hints });
                }}
                className="text-gray-500 hover:text-red-400 p-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const hints = [...(step.hints || []), ''];
              onUpdateStep({ hints });
            }}
            className="text-xs text-[#d4af37] flex items-center gap-1 font-semibold hover:underline cursor-pointer"
          >
            + Add Hint
          </button>
        </div>
      </div>
    );
  }

  if (step.type === 'heritage_connection') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Heritage Card Title
          </label>
          <input
            type="text"
            value={step.title || ''}
            onChange={(e) => onUpdateStep({ title: e.target.value })}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Sanskrit Sutra / Verse
          </label>
          <input
            type="text"
            value={step.sutra || ''}
            onChange={(e) => onUpdateStep({ sutra: e.target.value })}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Sutra Translation
          </label>
          <input
            type="text"
            value={step.translation || ''}
            onChange={(e) => onUpdateStep({ translation: e.target.value })}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Scientific Heritage Significance
          </label>
          <textarea
            value={step.significance || ''}
            rows={4}
            onChange={(e) => onUpdateStep({ significance: e.target.value })}
            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
      </div>
    );
  }

  return null;
}
