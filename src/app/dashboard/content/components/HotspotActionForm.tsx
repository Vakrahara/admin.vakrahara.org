'use client';

import React from 'react';
import { Sparkles, X, Check } from 'lucide-react';
import { TextHotspotAction } from '@/types/curriculum';

export interface HotspotFormState {
  phrase: string;
  action: TextHotspotAction;
  cardTitleEn: string;
  cardTitleHi: string;
  cardTitleHng: string;
  cardBodyEn: string;
  cardBodyHi: string;
  cardBodyHng: string;
  cardImageUrl: string;
  simId: string;
  simParamsJson: string;
  gurutatvaTitleEn: string;
  gurutatvaSutra: string;
  gurutatvaBodyEn: string;
  termId: string;
  moduleId: string;
}

interface HotspotActionFormProps {
  form: HotspotFormState;
  onChange: (patch: Partial<HotspotFormState>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
  phraseFoundInText: boolean;
  onCaptureSelection: () => void;
}

const ACTION_OPTIONS: Array<{ key: TextHotspotAction; label: string; badge: string }> = [
  { key: 'inline_card', label: 'Inline Card', badge: 'CARD' },
  { key: 'launch_simulation', label: 'Simulation', badge: 'SIM' },
  { key: 'open_gurutatva', label: 'Gurutatva', badge: 'IKS' },
  { key: 'open_lexicon_term', label: 'Lexicon Term', badge: 'LEX' },
  { key: 'link_module', label: 'Module Link', badge: 'NAV' }
];

export function HotspotActionForm({
  form,
  onChange,
  onSave,
  onCancel,
  isEditing,
  phraseFoundInText,
  onCaptureSelection
}: HotspotActionFormProps) {
  const { action } = form;

  return (
    <div className="space-y-3 p-3 rounded-lg bg-[#0B0F19] border border-amber-500/30">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="text-xs font-bold text-amber-300">
          {isEditing ? 'Edit Hotspot' : 'Configure New Hotspot'}
        </span>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-slate-400 font-bold uppercase">Target Word or Phrase</label>
          <button
            type="button"
            onClick={onCaptureSelection}
            className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-mono"
          >
            <Sparkles className="w-3 h-3" /> Capture Selected Text
          </button>
        </div>
        <input
          type="text"
          value={form.phrase}
          onChange={(e) => onChange({ phrase: e.target.value })}
          placeholder="e.g. angle of incidence, Kaṇāda atomism..."
          className="w-full px-2.5 py-1.5 bg-[#03050B] border border-slate-800 rounded text-xs text-white outline-none focus:border-amber-400"
        />
        {!phraseFoundInText && form.phrase.trim() && (
          <p className="text-[10px] text-amber-400/80">⚠️ Phrase not detected in step texts; verify exact spelling.</p>
        )}
      </div>

      <div>
        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Trigger Action</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {ACTION_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange({ action: opt.key })}
              className={`px-2 py-1.5 rounded text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                action === opt.key
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-[#03050B] text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{opt.label}</span>
              <span className="text-[8px] font-mono opacity-60">{opt.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {action === 'inline_card' && (
        <div className="space-y-2 p-2.5 rounded bg-[#03050B] border border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={form.cardTitleEn}
              onChange={(e) => onChange({ cardTitleEn: e.target.value })}
              placeholder="Title (English)"
              className="px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white"
            />
            <input
              type="text"
              value={form.cardTitleHi}
              onChange={(e) => onChange({ cardTitleHi: e.target.value })}
              placeholder="Title (Hindi)"
              className="px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white"
            />
            <input
              type="text"
              value={form.cardTitleHng}
              onChange={(e) => onChange({ cardTitleHng: e.target.value })}
              placeholder="Title (Hinglish)"
              className="px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white"
            />
          </div>
          <textarea
            value={form.cardBodyEn}
            onChange={(e) => onChange({ cardBodyEn: e.target.value })}
            rows={2}
            placeholder="Tactile explanation body (English)..."
            className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white font-mono"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <textarea
              value={form.cardBodyHi}
              onChange={(e) => onChange({ cardBodyHi: e.target.value })}
              rows={2}
              placeholder="स्पष्टीकरण (Hindi - optional)..."
              className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white"
            />
            <textarea
              value={form.cardBodyHng}
              onChange={(e) => onChange({ cardBodyHng: e.target.value })}
              rows={2}
              placeholder="Explanation (Hinglish - optional)..."
              className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white"
            />
          </div>
          <input
            type="text"
            value={form.cardImageUrl}
            onChange={(e) => onChange({ cardImageUrl: e.target.value })}
            placeholder="Optional Illustration URL"
            className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white font-mono"
          />
        </div>
      )}

      {action === 'launch_simulation' && (
        <div className="space-y-2 p-2.5 rounded bg-[#03050B] border border-slate-800">
          <input
            type="text"
            value={form.simId}
            onChange={(e) => onChange({ simId: e.target.value })}
            placeholder="Target Simulation ID (e.g. ray_optics, what_is_a_wave)"
            className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white font-mono"
          />
          <textarea
            value={form.simParamsJson}
            onChange={(e) => onChange({ simParamsJson: e.target.value })}
            rows={2}
            placeholder='JSON Params e.g. {"focalLength": 20}'
            className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white font-mono"
          />
        </div>
      )}

      {action === 'open_gurutatva' && (
        <div className="space-y-2 p-2.5 rounded bg-[#03050B] border border-slate-800">
          <input
            type="text"
            value={form.gurutatvaTitleEn}
            onChange={(e) => onChange({ gurutatvaTitleEn: e.target.value })}
            placeholder="Heritage Concept Title (English)"
            className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white"
          />
          <input
            type="text"
            value={form.gurutatvaSutra}
            onChange={(e) => onChange({ gurutatvaSutra: e.target.value })}
            placeholder="Classical Sanskrit Sutra / Verse"
            className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white"
          />
          <textarea
            value={form.gurutatvaBodyEn}
            onChange={(e) => onChange({ gurutatvaBodyEn: e.target.value })}
            rows={2}
            placeholder="Scientific heritage significance..."
            className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white"
          />
        </div>
      )}

      {action === 'open_lexicon_term' && (
        <div className="p-2.5 rounded bg-[#03050B] border border-slate-800">
          <input
            type="text"
            value={form.termId}
            onChange={(e) => onChange({ termId: e.target.value })}
            placeholder="Target Semantic Term ID (e.g. kt_optics_refraction)"
            className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white font-mono"
          />
        </div>
      )}

      {action === 'link_module' && (
        <div className="p-2.5 rounded bg-[#03050B] border border-slate-800">
          <input
            type="text"
            value={form.moduleId}
            onChange={(e) => onChange({ moduleId: e.target.value })}
            placeholder="Target Module ID (e.g. mod_wave_motion)"
            className="w-full px-2 py-1 bg-[#080C14] border border-slate-800 rounded text-xs text-white font-mono"
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!form.phrase.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Update Hotspot' : 'Attach Hotspot'}</span>
        </button>
      </div>
    </div>
  );
}
