'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Copy, Check, ExternalLink, Eye, CheckCircle2, Upload, Box } from 'lucide-react';
import { Chapter } from '@/types/curriculum';
import { getDisciplineRegistry } from '@/lib/disciplinesRegistry';
import { readLocalDraft } from '../utils/curriculumDraftStorage';
import { BASELINE_SIMULATIONS, inferSimulationDiscipline } from '../utils/simulationLibraryData';

export interface SimulationLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  chapters?: Chapter[];
  onSelectSimulation?: (simId: string) => void;
  onOpenUpload?: () => void;
}

interface SimulationEntry {
  id: string;
  title: string;
  disciplineId: string;
  disciplineName: string;
  usageCount: number;
}

export function SimulationLibrary({
  isOpen,
  onClose,
  chapters,
  onSelectSimulation,
  onOpenUpload
}: SimulationLibraryProps) {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewSimId, setPreviewSimId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (previewSimId) setPreviewSimId(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewSimId, onClose]);

  const disciplines = useMemo(() => getDisciplineRegistry(), []);
  const discMap = useMemo(() => new Map(disciplines.map((d) => [d.id, d.nameEn])), [disciplines]);

  const simulations = useMemo<SimulationEntry[]>(() => {
    const map = new Map<string, SimulationEntry>();

    for (const b of BASELINE_SIMULATIONS) {
      map.set(b.id, {
        id: b.id,
        title: b.title,
        disciplineId: b.disciplineId,
        disciplineName: discMap.get(b.disciplineId) || 'STEM',
        usageCount: 0
      });
    }

    const activeChapters = chapters || (typeof window !== 'undefined' ? readLocalDraft() : null);
    if (activeChapters) {
      for (const ch of activeChapters) {
        for (const mod of ch.modules || []) {
          for (const step of [...(mod.steps || []), ...(mod.learningSteps || [])]) {
            const checkId = (id?: string) => {
              if (!id || !id.trim()) return;
              const clean = id.trim();
              const existing = map.get(clean);
              if (existing) {
                existing.usageCount += 1;
              } else {
                const disc = inferSimulationDiscipline(clean, discMap);
                map.set(clean, {
                  id: clean,
                  title: clean.replace(/^sim_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                  disciplineId: disc.id,
                  disciplineName: disc.name,
                  usageCount: 1
                });
              }
            };
            checkId(step.simulationId);
            step.checkpoints?.forEach((cp) => checkId(cp.simulationId));
            step.hotspots?.forEach((hs) => checkId(hs.targetSimulationId));
          }
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.usageCount - a.usageCount || a.id.localeCompare(b.id));
  }, [chapters, discMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return simulations;
    return simulations.filter(
      (s) => s.id.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || s.disciplineName.toLowerCase().includes(q)
    );
  }, [simulations, search]);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="glass-panel bg-[#090B12] border border-[#d4af37]/30 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#05070D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Box className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                ACE Simulation Library (Amrtam अमृतम्)
              </h3>
              <p className="text-[11px] text-gray-400">Browse registered simulations & link to curriculum steps (§R3)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenUpload && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenUpload(); }}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Upload New Simulation
              </button>
            )}
            <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-white/10 bg-[#080B14] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search simulations by ID, title, or discipline..."
              className="w-full pl-9 pr-4 py-2 bg-[#05070D] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <span className="text-[11px] text-gray-400 font-mono shrink-0">
            {filtered.length} simulation{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 flex-1 min-h-[300px]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              No simulations match &quot;{search}&quot;. Click &apos;Upload New Simulation&apos; to deploy one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((sim) => (
                <div
                  key={sim.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-[#060810] hover:border-emerald-500/40 transition-colors flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{sim.title}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <code className="text-[11px] font-mono text-emerald-400 break-all">{sim.id}</code>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(sim.id, e)}
                            className="p-1 text-gray-500 hover:text-white rounded cursor-pointer shrink-0"
                            title="Copy Simulation ID"
                          >
                            {copiedId === sim.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        {sim.disciplineName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Used in {sim.usageCount} step{sim.usageCount === 1 ? '' : 's'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewSimId(sim.id)}
                        className="px-2.5 py-1 text-slate-300 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3 h-3 text-emerald-400" /> Preview
                      </button>
                      {onSelectSimulation && (
                        <button
                          type="button"
                          onClick={() => { onSelectSimulation(sim.id); onClose(); }}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Select & Insert
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {previewSimId && (
          <div
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-fadeIn"
            onClick={(e) => { if (e.target === e.currentTarget) setPreviewSimId(null); }}
          >
            <div className="bg-[#080B14] border border-[#d4af37]/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
              <div className="px-4 py-3 bg-[#05070D] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">{previewSimId}</span>
                  <a
                    href={`https://cdn.vakrahara.org/v2/simulations/${previewSimId}/index.html`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-white text-[11px] flex items-center gap-1 ml-2"
                  >
                    <ExternalLink className="w-3 h-3" /> Open in New Tab
                  </a>
                </div>
                <button type="button" onClick={() => setPreviewSimId(null)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="h-80 bg-black">
                <iframe
                  src={`https://cdn.vakrahara.org/v2/simulations/${previewSimId}/index.html`}
                  title="Simulation Preview"
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
              <div className="px-4 py-3 bg-[#05070D] border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewSimId(null)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Close
                </button>
                {onSelectSimulation && (
                  <button
                    type="button"
                    onClick={() => { onSelectSimulation(previewSimId); setPreviewSimId(null); onClose(); }}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Select & Insert
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
