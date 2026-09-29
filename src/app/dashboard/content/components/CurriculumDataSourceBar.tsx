'use client';

import React, { useRef } from 'react';
import { 
  Database, 
  Cloud, 
  Package, 
  RefreshCw, 
  Sparkles, 
  Download, 
  Upload, 
  Check, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Chapter } from '@/types/curriculum';

export type CurriculumDataSource = 'pb' | 'cdn' | 'canonical' | 'local';

interface CurriculumDataSourceBarProps {
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

export function CurriculumDataSourceBar({
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
}: CurriculumDataSourceBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          onImportJson(parsed);
        } else {
          alert('Invalid curriculum JSON structure. Expected an array of chapters.');
        }
      } catch (err: any) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="glass-panel border border-white/10 bg-[#08080c]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl space-y-3">
      {/* Top row: Source Switcher & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Source Selector Segmented Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0d0d15] border border-white/5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-gray-400 px-2 tracking-wider flex items-center gap-1">
            Data Source:
          </span>

          <button
            type="button"
            onClick={() => onSourceChange('pb')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentSource === 'pb'
                ? 'bg-[#d4af37] text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Fetch from PocketBase Database (Drafts)"
          >
            <Database className="w-3.5 h-3.5" />
            <span>PocketBase (Draft DB)</span>
          </button>

          <button
            type="button"
            onClick={() => onSourceChange('cdn')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentSource === 'cdn'
                ? 'bg-amber-400 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Fetch from Cloudflare R2 Production CDN"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloudflare R2 (Live CDN)</span>
          </button>

          <button
            type="button"
            onClick={() => onSourceChange('canonical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentSource === 'canonical'
                ? 'bg-emerald-400 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Load Bundled Canonical Curriculum (Complete 42 Modules + Modern Steps)"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Canonical Core (Bundled)</span>
          </button>
        </div>

        {/* Live Counts & Metrics */}
        <div className="flex items-center gap-3 text-xs text-gray-400 self-end lg:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg">
            <span className="text-gray-400">Chapters:</span>
            <span className="font-bold text-white font-mono">{chaptersCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg">
            <span className="text-gray-400">Modules:</span>
            <span className="font-bold text-[#d4af37] font-mono">{modulesCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg">
            <span className="text-gray-400">Steps:</span>
            <span className="font-bold text-emerald-400 font-mono">{stepsCount}</span>
          </div>
          {lastSyncTime && (
            <span className="text-[10px] text-gray-400 hidden xl:inline">
              Loaded: {lastSyncTime}
            </span>
          )}
        </div>
      </div>

      {/* Bottom row: Quick Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload Source</span>
          </button>

          {/* Seed Canonical Modern 42-Module Curriculum */}
          <button
            type="button"
            onClick={onSeedCanonical}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Import the full modern 42-module Light chapter with VideoSimulation, Saraswati, and Anveshana steps"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Seed Canonical Modern Curriculum</span>
          </button>

          {/* Export Active JSON */}
          <button
            type="button"
            onClick={onExportJson}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export currently loaded chapters as chapters_data.json"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          {/* Import JSON File */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            title="Import an external chapters_data.json file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Local Unsaved Draft Notification Badge */}
        {hasUnsavedDraft && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Local draft detected</span>
            <button
              type="button"
              onClick={onRestoreDraft}
              className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 rounded font-semibold text-[11px] transition-all cursor-pointer"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={onDiscardDraft}
              className="px-2 py-0.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 rounded text-[11px] transition-all cursor-pointer"
            >
              Discard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
