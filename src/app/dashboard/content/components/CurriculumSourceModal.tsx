'use client';

import React, { useRef, useEffect } from 'react';
import { 
  RefreshCw, 
  Sparkles, 
  Download, 
  Upload, 
  Check, 
  AlertCircle,
  X,
  Sliders
} from 'lucide-react';
import { Chapter } from '@/types/curriculum';
import { CurriculumSourceOriginSelector } from './CurriculumSourceOriginSelector';

export type CurriculumDataSource = 'pb' | 'cdn' | 'canonical' | 'local';

export interface CurriculumSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSource: CurriculumDataSource;
  onSourceChange: (source: CurriculumDataSource) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onSeedCanonical: () => void;
  onExportJson: () => void;
  onImportJson: (data: Chapter[]) => void;
  hasUnsavedDraft: boolean;
  onRestoreDraft: () => void;
  onDiscardDraft: () => void;
  chaptersCount: number;
  modulesCount: number;
  stepsCount: number;
  lastSyncTime: string | null;
}

export function CurriculumSourceModal({
  isOpen,
  onClose,
  currentSource,
  onSourceChange,
  isLoading,
  onRefresh,
  onSeedCanonical,
  onExportJson,
  onImportJson,
  hasUnsavedDraft,
  onRestoreDraft,
  onDiscardDraft,
  chaptersCount,
  modulesCount,
  stepsCount,
  lastSyncTime
}: CurriculumSourceModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        const chaptersArray = Array.isArray(parsed)
          ? parsed
          : (parsed?.chapters && Array.isArray(parsed.chapters)
            ? parsed.chapters
            : (parsed?.data && Array.isArray(parsed.data) ? parsed.data : null));

        if (chaptersArray && Array.isArray(chaptersArray) && (chaptersArray.length === 0 || chaptersArray[0]?.id)) {
          onImportJson(chaptersArray);
          onClose();
        } else {
          alert('Invalid curriculum JSON structure. Expected an array of chapters or { chapters: [...] }.');
        }
      } catch (err: any) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="curriculum-source-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="glass-panel bg-[#090B12] border border-[#d4af37]/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#05070D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h3 id="curriculum-source-modal-title" className="text-base font-bold text-white tracking-wide">
                Curriculum Data &amp; Source Settings
              </h3>
              <p className="text-xs text-gray-400">
                Manage storage origin, local drafts, and JSON synchronizations for Amrtam (अमृतम्).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-gray-300">
          {/* Active Data Source Selection */}
          <CurriculumSourceOriginSelector
            currentSource={currentSource}
            onSourceChange={onSourceChange}
          />

          {/* Local Draft Management */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block font-mono">
              Local Browser Working Draft
            </label>
            {hasUnsavedDraft ? (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-200">Unsaved Local Draft Detected</div>
                    <div className="text-[10px] text-amber-400/80">You have changes cached locally that have not yet been published.</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { onRestoreDraft(); onClose(); }}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => { onDiscardDraft(); onClose(); }}
                    className="px-2.5 py-1 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-300 rounded-lg text-[11px] transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-2 text-gray-400 text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Working memory is synchronized with loaded storage. No unsaved draft collision.</span>
              </div>
            )}
          </div>

          {/* Data Utilities & Migrations */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block font-mono">
              Curriculum Data Operations
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { onRefresh(); onClose(); }}
                disabled={isLoading}
                className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-200 hover:text-white flex items-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-[#d4af37] ${isLoading ? 'animate-spin' : ''}`} />
                <span>Reload Selected Source</span>
              </button>

              <button
                type="button"
                onClick={() => { onSeedCanonical(); onClose(); }}
                disabled={isLoading}
                className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Seed Canonical Modern Curriculum</span>
              </button>

              <button
                type="button"
                onClick={onExportJson}
                className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Export Active Curriculum JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Import JSON Backup File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Storage Telemetry Stats */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-gray-400 text-xs">
            <div className="flex items-center gap-3">
              <span>Chapters: <strong className="text-white font-mono">{chaptersCount}</strong></span>
              <span>Modules: <strong className="text-[#d4af37] font-mono">{modulesCount}</strong></span>
              <span>Steps: <strong className="text-emerald-400 font-mono">{stepsCount}</strong></span>
            </div>
            {lastSyncTime && (
              <span className="text-[10px] text-gray-500 font-mono">
                Last sync: {lastSyncTime}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 flex items-center justify-end bg-[#05070D]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-amber-500 hover:brightness-110 text-black font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
