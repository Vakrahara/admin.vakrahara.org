'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { Step, Chapter } from '@/types/curriculum';
import { deriveSimulationIdFromModuleId } from '@/lib/semanticId';
import { getDisciplineRegistry } from '@/lib/disciplinesRegistry';
import { SimulationUploadModal } from './SimulationUploadModal';
import { SimulationLibrary } from './SimulationLibrary';

interface SimulationSlotEditorProps {
  step: Step;
  onChange: (patch: Partial<Step>) => void;
  initialDisciplineId?: string;
  chapters?: Chapter[];
  moduleId?: string;
}

export function SimulationSlotEditor({
  step,
  onChange,
  initialDisciplineId,
  chapters,
  moduleId
}: SimulationSlotEditorProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [rawParams, setRawParams] = useState<string>(
    step.params ? JSON.stringify(step.params) : '{}'
  );
  const [paramsError, setParamsError] = useState<string | null>(null);

  const parsedFromModule = useMemo(() => {
    if (!moduleId || !moduleId.startsWith('mod_')) return null;
    const parts = moduleId.slice(4).split('_');
    if (parts.length >= 2) {
      const short = parts[0];
      const matched = getDisciplineRegistry().find(
        d => d.shortCode.toLowerCase() === short.toLowerCase() || d.id === `disc_${short}` || d.id === short
      );
      return {
        disciplineId: matched?.id,
        domain: parts[1],
        concept: parts.slice(2).join('_')
      };
    }
    return null;
  }, [moduleId]);

  useEffect(() => {
    setRawParams(step.params ? JSON.stringify(step.params) : '{}');
    setParamsError(null);
  }, [step.id]);

  const handleParamsChange = (val: string) => {
    setRawParams(val);
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setParamsError('Params must be a JSON object, e.g. {"type": 1}');
        return;
      }
      const normalizedParams: Record<string, number> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'number' && !isNaN(v) && isFinite(v)) {
          normalizedParams[k] = v;
        } else if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)) && isFinite(Number(v))) {
          normalizedParams[k] = Number(v);
        } else {
          setParamsError(`Param "${k}" must have a numeric value`);
          return;
        }
      }
      setParamsError(null);
      onChange({ params: normalizedParams });
    } catch {
      setParamsError('Invalid JSON format');
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-[#080C14]">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>ACE Simulation Slot</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              INTERACTIVE
            </span>
          </h4>
          <p className="text-[11px] text-slate-400">Interactive WebGL / HTML5 simulation canvas & reactive parameter matrix</p>
        </div>
      </div>

      <div className="space-y-3 p-3 rounded-lg border border-slate-800/60 bg-[#0B0F19]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-slate-400 block">Simulation ID</label>
              <div className="flex items-center gap-2">
                {moduleId && (
                  <button
                    type="button"
                    onClick={() => onChange({ simulationId: deriveSimulationIdFromModuleId(moduleId) })}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer transition-colors"
                    title="Derive canonical simulation ID from parent module"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>✨ Derive</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="text-[10px] text-[#d4af37] hover:text-[#f3d069] flex items-center gap-1 font-medium cursor-pointer transition-colors"
                  title="Browse registered simulation library"
                >
                  <span>📚 Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer transition-colors"
                  title="Upload package to Amrtam CDN"
                >
                  <span>📤 Upload Simulation</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={step.simulationId || ''}
              onChange={(e) => onChange({ simulationId: e.target.value })}
              placeholder="e.g. sim_phys_optics_ray_optics"
              className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-400 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sub-Step Count (Dynamic Progress)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={step.subStepCount || 1}
              onChange={(e) => onChange({ subStepCount: parseInt(e.target.value, 10) || 1 })}
              className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-400 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Params (JSON Format)
              {paramsError && <span className="text-red-400 ml-1">({paramsError})</span>}
            </label>
            <input
              type="text"
              value={rawParams}
              onChange={(e) => handleParamsChange(e.target.value)}
              placeholder='{"type": 1.0, "mode": 0.0}'
              className={`w-full text-xs font-mono bg-[#03050B] border ${paramsError ? 'border-red-500/50' : 'border-slate-800'} rounded-lg px-3 py-2 text-white focus:border-emerald-400 outline-none`}
            />
          </div>
        </div>
      </div>

      <SimulationLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        chapters={chapters}
        onSelectSimulation={(simId) => {
          onChange({ simulationId: simId });
          setIsLibraryOpen(false);
        }}
        onOpenUpload={() => {
          setIsLibraryOpen(false);
          setIsUploadModalOpen(true);
        }}
      />

      <SimulationUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialDisciplineId={initialDisciplineId || parsedFromModule?.disciplineId}
        initialDomain={parsedFromModule?.domain}
        initialConcept={parsedFromModule?.concept}
        chapters={chapters}
        onSimulationUploaded={(simId) => {
          onChange({ simulationId: simId });
          setIsUploadModalOpen(false);
        }}
      />
    </div>
  );
}
