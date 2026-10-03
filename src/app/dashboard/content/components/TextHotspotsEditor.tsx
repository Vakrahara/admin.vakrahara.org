'use client';

import React, { useState } from 'react';
import { Target, Plus, Trash2, Edit2 } from 'lucide-react';
import { Step, TextHotspot, TextHotspotAction, formatSemanticId } from '@/types/curriculum';
import { HotspotActionForm, HotspotFormState } from './HotspotActionForm';

interface TextHotspotsEditorProps {
  step: Step;
  onChange: (patch: Partial<Step>) => void;
}

const INITIAL_FORM: HotspotFormState = {
  phrase: '',
  action: 'inline_card',
  cardTitleEn: '',
  cardTitleHi: '',
  cardTitleHng: '',
  cardBodyEn: '',
  cardBodyHi: '',
  cardBodyHng: '',
  cardImageUrl: '',
  simId: '',
  simParamsJson: '{}',
  gurutatvaTitleEn: '',
  gurutatvaSutra: '',
  gurutatvaBodyEn: '',
  termId: '',
  moduleId: ''
};

export function TextHotspotsEditor({ step, onChange }: TextHotspotsEditorProps) {
  const hotspots: TextHotspot[] = step.hotspots || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<HotspotFormState>(INITIAL_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const resetForm = () => {
    setEditingIndex(null);
    setForm(INITIAL_FORM);
    setIsFormOpen(false);
  };

  const startEdit = (idx: number) => {
    const h = hotspots[idx];
    setEditingIndex(idx);
    setForm({
      phrase: h.targetWordOrPhrase,
      action: h.action,
      cardTitleEn: h.inlineCardPayload?.titleEn || '',
      cardTitleHi: h.inlineCardPayload?.titleHi || '',
      cardTitleHng: h.inlineCardPayload?.titleHng || '',
      cardBodyEn: h.inlineCardPayload?.bodyEn || '',
      cardBodyHi: h.inlineCardPayload?.bodyHi || '',
      cardBodyHng: h.inlineCardPayload?.bodyHng || '',
      cardImageUrl: h.inlineCardPayload?.imageUrl || '',
      simId: h.targetSimulationId || '',
      simParamsJson: JSON.stringify(h.targetSimulationParams || {}, null, 2),
      gurutatvaTitleEn: h.targetGurutatva?.titleEn || '',
      gurutatvaSutra: h.targetGurutatva?.sutra || '',
      gurutatvaBodyEn: h.targetGurutatva?.bodyEn || '',
      termId: h.targetTermId || '',
      moduleId: h.targetModuleId || ''
    });
    setIsFormOpen(true);
  };

  const handleCaptureSelection = () => {
    const sel = typeof window !== 'undefined' ? window.getSelection()?.toString().trim() : '';
    if (sel) {
      setForm((prev) => ({
        ...prev,
        phrase: sel,
        cardTitleEn: prev.cardTitleEn || sel
      }));
    }
  };

  const handleSaveHotspot = () => {
    if (!form.phrase.trim()) return;
    let parsedParams: Record<string, any> | undefined;
    if (form.action === 'launch_simulation') {
      try {
        const parsed = JSON.parse(form.simParamsJson);
        parsedParams = (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
      } catch {
        parsedParams = {};
      }
    }
    const latinized = form.phrase.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const cleanSlug = latinized.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 16) || `phrase_${Date.now().toString(36).slice(-4)}`;
    const id = editingIndex !== null && hotspots[editingIndex]?.id 
      ? hotspots[editingIndex].id 
      : formatSemanticId('hot', step.id || 'step', cleanSlug);

    const newHotspot: TextHotspot = {
      id,
      targetWordOrPhrase: form.phrase.trim(),
      action: form.action,
      inlineCardPayload: form.action === 'inline_card' ? {
        titleEn: form.cardTitleEn.trim() || form.phrase.trim(),
        titleHi: form.cardTitleHi.trim() || undefined,
        titleHng: form.cardTitleHng.trim() || undefined,
        bodyEn: form.cardBodyEn.trim(),
        bodyHi: form.cardBodyHi.trim() || undefined,
        bodyHng: form.cardBodyHng.trim() || undefined,
        imageUrl: form.cardImageUrl.trim() || undefined
      } : undefined,
      targetSimulationId: form.action === 'launch_simulation' ? form.simId.trim() || undefined : undefined,
      targetSimulationParams: form.action === 'launch_simulation' ? parsedParams : undefined,
      targetGurutatva: form.action === 'open_gurutatva' ? {
        titleEn: form.gurutatvaTitleEn.trim() || form.phrase.trim(),
        bodyEn: form.gurutatvaBodyEn.trim(),
        sutra: form.gurutatvaSutra.trim() || undefined
      } : undefined,
      targetTermId: form.action === 'open_lexicon_term' ? form.termId.trim() || undefined : undefined,
      targetModuleId: form.action === 'link_module' ? form.moduleId.trim() || undefined : undefined
    };

    const next = [...hotspots];
    if (editingIndex !== null) next[editingIndex] = newHotspot;
    else next.push(newHotspot);
    onChange({ hotspots: next });
    resetForm();
  };

  const handleDeleteHotspot = (idx: number) => {
    const next = hotspots.filter((_, i) => i !== idx);
    onChange({ hotspots: next });
    if (editingIndex === idx) resetForm();
  };

  const allStepText = `${step.textEng || ''} ${step.textDeva || ''} ${step.textHng || ''} ${step.definitionEn || ''} ${step.questionText || ''} ${step.question || ''}`;
  const phraseFoundInText = form.phrase.trim() ? allStepText.toLowerCase().includes(form.phrase.trim().toLowerCase()) : true;

  return (
    <div className="space-y-3 p-3.5 rounded-xl border border-amber-500/20 bg-[#060911]">
      <div className="flex items-center justify-between border-b border-amber-500/15 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Interactive Text Hotspots</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {hotspots.length} ACTIVE
              </span>
            </h5>
            <p className="text-[10px] text-slate-400">Tactile golden dotted links executing inline cards, simulations, or lexicon entries</p>
          </div>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Hotspot</span>
          </button>
        )}
      </div>

      {hotspots.length > 0 && !isFormOpen && (
        <div className="space-y-2">
          {hotspots.map((h, i) => (
            <div key={h.id || i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0F19] border border-slate-800 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-amber-400 font-mono font-bold underline decoration-dotted decoration-amber-400/80 truncate">
                  &ldquo;{h.targetWordOrPhrase}&rdquo;
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 uppercase">
                  {h.action.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                  {h.action === 'inline_card' && (h.inlineCardPayload?.titleEn || 'Card')}
                  {h.action === 'launch_simulation' && (h.targetSimulationId || 'Sim')}
                  {h.action === 'open_gurutatva' && (h.targetGurutatva?.titleEn || 'Gurutatva')}
                  {h.action === 'open_lexicon_term' && (h.targetTermId || 'Term')}
                  {h.action === 'link_module' && (h.targetModuleId || 'Module')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => startEdit(i)} className="p-1 rounded text-slate-400 hover:text-amber-300">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleDeleteHotspot(i)} className="p-1 rounded text-slate-400 hover:text-rose-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <HotspotActionForm
          form={form}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSave={handleSaveHotspot}
          onCancel={resetForm}
          isEditing={editingIndex !== null}
          phraseFoundInText={phraseFoundInText}
          onCaptureSelection={handleCaptureSelection}
        />
      )}
    </div>
  );
}
