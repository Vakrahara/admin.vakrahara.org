'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getDisciplineRegistry, getShortCode } from '@/lib/disciplinesRegistry';
import { formatSimulationId, isValidSemanticId } from '@/lib/semanticId';
import { Chapter } from '@/types/curriculum';
import { uploadSimulationPackage, SimulationFileItem } from '../utils/simulationUploader';
import { validateSimulationHTML, SimulationValidationResult } from '../utils/simulationValidator';
import { extractAllSimulationIds } from '../utils/simulationLibraryData';
import { SimulationPreviewFrame } from './SimulationPreviewFrame';
import { SimulationDropzone } from './SimulationDropzone';
import { SimulationValidationCard } from './SimulationValidationCard';

export interface SimulationUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulationUploaded: (simId: string) => void;
  initialDisciplineId?: string;
  chapters?: Chapter[];
  knownSimIds?: string[];
}

export function SimulationUploadModal({
  isOpen,
  onClose,
  onSimulationUploaded,
  initialDisciplineId,
  chapters,
  knownSimIds
}: SimulationUploadModalProps) {
  const disciplines = getDisciplineRegistry();
  const defaultDisc = initialDisciplineId || disciplines[0]?.id || 'disc_bhautik';

  const [disciplineId, setDisciplineId] = useState(defaultDisc);
  const [domain, setDomain] = useState('optics');
  const [concept, setConcept] = useState('');
  const [files, setFiles] = useState<SimulationFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validation, setValidation] = useState<SimulationValidationResult | null>(null);
  const [allowBypass, setAllowBypass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisciplineId(initialDisciplineId || defaultDisc);
      setDomain((prev) => prev || 'optics');
      setConcept('');
      setFiles([]);
      setUploadError(null);
      setIsUploading(false);
      setValidation(null);
      setAllowBypass(false);
    }
  }, [isOpen, initialDisciplineId, defaultDisc]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUploading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isUploading]);

  const shortCode = getShortCode(disciplineId);
  const previewId = formatSimulationId(shortCode, domain, concept);
  const isIdValid = Boolean(domain.trim()) && Boolean(concept.trim()) && isValidSemanticId(previewId, 'sim');

  const knownIds = useMemo(() => {
    const set = extractAllSimulationIds(chapters);
    if (knownSimIds) knownSimIds.forEach((id) => set.add(id.trim()));
    return set;
  }, [chapters, knownSimIds]);

  const isIdInUse = useMemo(() => {
    if (!previewId || !isIdValid) return false;
    return knownIds.has(previewId.trim());
  }, [previewId, isIdValid, knownIds]);

  const entryFile = useMemo(() => {
    if (files.length === 0) return undefined;
    return (
      files.find((f) => f.path.toLowerCase() === 'index.html')?.file ||
      files.find((f) => f.file.name.toLowerCase() === 'index.html')?.file ||
      files.find((f) => f.path.toLowerCase().endsWith('.html'))?.file
    );
  }, [files]);

  useEffect(() => {
    if (!entryFile) {
      setValidation(null);
      setAllowBypass(false);
      return;
    }
    let cancelled = false;
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    entryFile.text().then((text) => {
      if (cancelled) return;
      const res = validateSimulationHTML(text, totalSize);
      setValidation(res);
      setAllowBypass(false);
    }).catch(() => {
      if (!cancelled) setValidation(null);
    });
    return () => { cancelled = true; };
  }, [entryFile, files]);

  const hasBlockingErrors = Boolean(validation && !validation.valid && !allowBypass);

  const handleUpload = async () => {
    if (!isIdValid || files.length === 0 || isUploading || hasBlockingErrors) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadSimulationPackage(previewId, files);
      if (res.success) {
        onSimulationUploaded(res.simId);
        onClose();
      } else {
        setUploadError(res.error || 'Failed uploading simulation package.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Unexpected upload error.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget && !isUploading) onClose(); }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="glass-panel bg-[#090B12] border border-[#d4af37]/30 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#05070D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                ACE Simulation Package Uploader (Amrtam अमृतम्)
              </h3>
              <p className="text-[11px] text-gray-400">Deploy interactive WebGL / HTML5 simulations to Amrtam CDN (§R1–R3)</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isUploading} className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer disabled:opacity-30">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Discipline</label>
              <select
                value={disciplineId}
                onChange={(e) => setDisciplineId(e.target.value)}
                className="w-full px-3 py-2 bg-[#08080c] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.icon || '📚'} {d.nameEn} ({d.shortCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. optics, geometry, reactions"
                className="w-full px-3 py-2 bg-[#08080c] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Concept</label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. snells_law, converses, electrolysis"
                className="w-full px-3 py-2 bg-[#08080c] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="p-3 bg-[#05070d] border border-white/10 rounded-xl flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Live Semantic ID Preview</span>
              <div className="text-sm font-mono font-bold text-emerald-400">{previewId}</div>
            </div>
            <div className="flex items-center gap-1.5">
              {isIdValid ? (
                <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid ID
                </span>
              ) : (
                <span className="text-amber-400 text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Enter domain & concept
                </span>
              )}
            </div>
          </div>

          <SimulationValidationCard
            validation={validation}
            isIdInUse={isIdInUse}
            allowBypass={allowBypass}
            onToggleBypass={setAllowBypass}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SimulationDropzone
              files={files}
              onFilesChange={setFiles}
              entryFile={entryFile}
            />
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Interactive Sandbox & AndroidBridge</span>
              <SimulationPreviewFrame entryFile={entryFile} />
            </div>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-[#05070D]">
          <button type="button" onClick={onClose} disabled={isUploading} className="px-4 py-2 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer disabled:opacity-30">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!isIdValid || files.length === 0 || isUploading || hasBlockingErrors}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 min-h-[38px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading to CDN...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload to CDN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
