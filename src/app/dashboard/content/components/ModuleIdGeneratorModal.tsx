'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Module, Chapter } from '@/types/curriculum';
import { getDisciplineRegistry, getShortCode } from '@/lib/disciplinesRegistry';
import { formatModuleId, isValidSemanticId, SEMANTIC_ID_REGEX } from '@/lib/semanticId';

interface ModuleIdGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChapter: Chapter;
  activeModule: Module;
  onApplyId: (newId: string) => void;
}

const DOMAIN_PRESETS: Record<string, string[]> = {
  disc_bhautik: ['core', 'optics', 'mechanics', 'electricity'],
  disc_rasayan: ['core', 'reactions', 'bonding', 'acids_bases'],
  disc_jiva_vigyan: ['core', 'genetics', 'cellular', 'ecology'],
  disc_ganita: ['core', 'algebra', 'geometry', 'calculus'],
  disc_sanganak: ['core', 'algorithms', 'structures', 'networks'],
};
const DEFAULT_DOMAINS = ['core', 'theory', 'applied', 'lab'];

export function ModuleIdGeneratorModal({
  isOpen,
  onClose,
  activeChapter,
  activeModule,
  onApplyId,
}: ModuleIdGeneratorModalProps) {
  const disciplines = getDisciplineRegistry();
  const initialDisc = activeModule.primaryDisciplineId || activeChapter.disciplineIds?.[0] || disciplines[0]?.id || 'disc_bhautik';

  const [disciplineId, setDisciplineId] = useState(initialDisc);
  const [domain, setDomain] = useState('core');
  const [concept, setConcept] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (activeModule.id?.startsWith('mod_')) {
        const parts = activeModule.id.slice(4).split('_');
        if (parts.length >= 2) {
          const short = parts[0];
          const matched = disciplines.find(
            d => d.shortCode.toLowerCase() === short.toLowerCase() || d.id === `disc_${short}` || d.id === short
          );
          if (matched) setDisciplineId(matched.id);
          setDomain(parts[1] || 'core');
          setConcept(parts.slice(2).join('_') || '');
          return;
        }
      }
      setDisciplineId(initialDisc);
      setDomain('core');
      setConcept('');
    }
  }, [isOpen, activeModule.id, initialDisc, disciplines]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortCode = getShortCode(disciplineId);
  const previewId = formatModuleId(shortCode, domain, concept);
  const hasValidDomain = /[a-z0-9]/i.test(domain);
  const hasValidConcept = /[a-z0-9]/i.test(concept);
  const isFormatValid = hasValidDomain && hasValidConcept && isValidSemanticId(previewId, 'mod') && SEMANTIC_ID_REGEX.test(previewId) && previewId.split('_').length >= 4;
  const isDuplicate = (activeChapter.modules || []).some(m => m.id === previewId && m.id !== activeModule.id);
  const canApply = isFormatValid && !isDuplicate;
  const activePresets = DOMAIN_PRESETS[disciplineId] || DEFAULT_DOMAINS;

  const handleApply = () => {
    if (canApply) { onApplyId(previewId); onClose(); }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="glass-panel bg-[#090B12] border border-[#d4af37]/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#05070D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Module ID Auto-Generator (Amrtam अमृतम्)
              </h3>
              <p className="text-[11px] text-gray-400">Generate canonical semantic module identifier (§R1-R3)</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Discipline</label>
            <select
              value={disciplineId}
              onChange={(e) => setDisciplineId(e.target.value)}
              className="w-full px-3 py-2 bg-[#08080c] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#d4af37]/60 cursor-pointer"
            >
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.icon || '📚'} {d.nameEn} ({d.shortCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Domain</label>
              <div className="flex items-center gap-1 flex-wrap">
                {activePresets.map((cd) => (
                  <button
                    key={cd}
                    type="button"
                    onClick={() => setDomain(cd)}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${domain === cd ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {cd}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
              placeholder="e.g. optics, geometry, algebra"
              className="w-full px-3 py-2 bg-[#08080c] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Concept</label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
              placeholder="e.g. snells_law, propositions_converses, pythagoras"
              className="w-full px-3 py-2 bg-[#08080c] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>

          <div className="p-3 bg-[#05070d] border border-white/10 rounded-xl space-y-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Canonical Preview</span>
            <div className="text-sm font-mono font-bold text-[#d4af37] break-all">{previewId}</div>
            {isDuplicate ? (
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>⚠️ Duplicate ID: Already used in this chapter!</span>
              </div>
            ) : isFormatValid ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>✓ Valid semantic module identifier</span>
              </div>
            ) : (
              <div className="text-gray-500 text-[11px]">Enter valid domain and concept slug (letters, numbers, underscores).</div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-[#05070D]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            className="px-4 py-2 bg-[#d4af37] hover:bg-[#e5c158] disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Apply ID
          </button>
        </div>
      </div>
    </div>
  );
}
