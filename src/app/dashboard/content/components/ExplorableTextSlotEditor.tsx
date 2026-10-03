'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { Step } from '@/types/curriculum';
import { TextHotspotsEditor } from './TextHotspotsEditor';

interface ExplorableTextSlotEditorProps {
  step: Step;
  onChange: (patch: Partial<Step>) => void;
}

export function ExplorableTextSlotEditor({ step, onChange }: ExplorableTextSlotEditorProps) {
  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-[#080C14]">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Explorable Text Slot</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              THEORY
            </span>
          </h4>
          <p className="text-[11px] text-slate-400">Trilingual concept description, subtitle cards, and visual illustrations</p>
        </div>
      </div>

      <div className="space-y-3 p-3 rounded-lg border border-slate-800/60 bg-[#0B0F19]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Devanagari Heading / Subtitle (Deva)
            </label>
            <input
              type="text"
              value={step.textDeva || ''}
              onChange={(e) => onChange({ textDeva: e.target.value })}
              placeholder="e.g. प्रकाश का परावर्तन और अपवर्तन"
              className="w-full px-3 py-2 bg-[#03050B] border border-slate-800 rounded-lg text-white text-xs focus:border-blue-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Optional Image Illustration URL
            </label>
            <input
              type="text"
              value={step.imageUrl || ''}
              onChange={(e) => onChange({ imageUrl: e.target.value })}
              placeholder="https://cdn.vakrahara.org/diagrams/reflection.png"
              className="w-full px-3 py-2 bg-[#03050B] border border-slate-800 rounded-lg text-white text-xs font-mono focus:border-blue-400 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              English Concept Text & Explanations (Eng)
            </label>
            <textarea
              value={step.textEng || ''}
              rows={4}
              onChange={(e) => onChange({ textEng: e.target.value })}
              placeholder="Detailed canonical theory text explaining this pedagogical step..."
              className="w-full px-3 py-2 bg-[#03050B] border border-slate-800 rounded-lg text-white text-xs font-mono focus:border-blue-400 outline-none leading-relaxed"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Hinglish Concept Text & Explanations (Hng)
            </label>
            <textarea
              value={step.textHng || ''}
              rows={4}
              onChange={(e) => onChange({ textHng: e.target.value })}
              placeholder="Conversational Hinglish explanation (e.g. Jab light kisi opaque surface se takrati hai...)"
              className="w-full px-3 py-2 bg-[#03050B] border border-slate-800 rounded-lg text-white text-xs font-mono focus:border-blue-400 outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Interactive Text Hotspots Engine (§TICKET-05) */}
      <TextHotspotsEditor
        step={step}
        onChange={onChange}
      />
    </div>
  );
}
