'use client';

import React, { useMemo } from 'react';
import { 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  RotateCcw, 
  Database, 
  Cloud, 
  Package, 
  RefreshCw, 
  Sliders, 
  AlertCircle 
} from 'lucide-react';
import { getDisciplineRegistry } from '@/lib/disciplinesRegistry';
import { CurriculumFilterState, isCurriculumFiltered } from '../utils/curriculumFilterUtils';
import { CurriculumDataSource } from './CurriculumSourceModal';

interface CurriculumUnifiedHeaderProps {
  currentSource: CurriculumDataSource;
  isLoading: boolean;
  hasUnsavedDraft: boolean;
  chaptersCount: number;
  modulesCount: number;
  stepsCount: number;
  filteredChaptersCount: number;
  filteredModulesCount: number;
  filters: CurriculumFilterState;
  onFilterChange: (filters: CurriculumFilterState) => void;
  onResetFilters: () => void;
  onOpenSourceModal: () => void;
  onRefresh: () => void;
}

export function CurriculumUnifiedHeader({
  currentSource,
  isLoading,
  hasUnsavedDraft,
  chaptersCount,
  modulesCount,
  stepsCount,
  filteredChaptersCount,
  filteredModulesCount,
  filters,
  onFilterChange,
  onResetFilters,
  onOpenSourceModal,
  onRefresh
}: CurriculumUnifiedHeaderProps) {
  const disciplines = useMemo(() => getDisciplineRegistry(), []);
  const isFiltered = isCurriculumFiltered(filters);

  return (
    <div className="glass-panel border border-white/10 bg-[#080C14]/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs">
      {/* Left: Streamlined Single-Row Taxonomy Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[#d4af37] font-mono font-bold text-[10px] tracking-wider uppercase mr-1">
          <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Taxonomy:</span>
        </div>

        {/* Board Selector */}
        <div className="relative flex items-center bg-[#0d111a] border border-white/10 hover:border-[#d4af37]/40 rounded-xl px-2.5 py-1.5 min-h-[38px] focus-within:border-[#d4af37] transition-all">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-1.5 font-mono">
            Board
          </span>
          <select
            value={filters.board}
            onChange={(e) => onFilterChange({ ...filters, board: e.target.value })}
            className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-5 appearance-none"
          >
            <option value="all" className="bg-[#080C14] text-white">All Boards</option>
            <option value="cbse" className="bg-[#080C14] text-white">CBSE</option>
            <option value="icse" className="bg-[#080C14] text-white">ICSE</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 pointer-events-none absolute right-1.5" />
        </div>

        <ChevronRight className="w-3 h-3 text-[#d4af37]/50 hidden sm:block shrink-0" />

        {/* Grade Selector */}
        <div className="relative flex items-center bg-[#0d111a] border border-white/10 hover:border-[#d4af37]/40 rounded-xl px-2.5 py-1.5 min-h-[38px] focus-within:border-[#d4af37] transition-all">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-1.5 font-mono">
            Grade
          </span>
          <select
            value={filters.grade}
            onChange={(e) => onFilterChange({ ...filters, grade: e.target.value })}
            className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-5 appearance-none"
          >
            <option value="all" className="bg-[#080C14] text-white">All Grades</option>
            <option value="8" className="bg-[#080C14] text-white">Class 8</option>
            <option value="9" className="bg-[#080C14] text-white">Class 9</option>
            <option value="10" className="bg-[#080C14] text-white">Class 10</option>
            <option value="11" className="bg-[#080C14] text-white">Class 11</option>
            <option value="12" className="bg-[#080C14] text-white">Class 12</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 pointer-events-none absolute right-1.5" />
        </div>

        <ChevronRight className="w-3 h-3 text-[#d4af37]/50 hidden sm:block shrink-0" />

        {/* Discipline Selector */}
        <div className="relative flex items-center bg-[#0d111a] border border-white/10 hover:border-[#d4af37]/40 rounded-xl px-2.5 py-1.5 min-h-[38px] focus-within:border-[#d4af37] transition-all max-w-[210px]">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-1.5 font-mono shrink-0">
            Discipline
          </span>
          <select
            value={filters.discipline}
            onChange={(e) => onFilterChange({ ...filters, discipline: e.target.value })}
            className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-5 truncate appearance-none w-full"
          >
            <option value="all" className="bg-[#080C14] text-white">All Disciplines</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#080C14] text-white">
                {d.icon} {d.nameEn}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 pointer-events-none absolute right-1.5" />
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-3 py-1.5 min-h-[38px] text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
            title="Reset taxonomy filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        {/* Match Count Badge */}
        <div className="text-gray-400 text-[11px] px-2.5 py-1.5 min-h-[38px] bg-white/[0.02] border border-white/5 rounded-xl font-mono hidden md:inline-flex items-center gap-1">
          <span>{filteredChaptersCount}/{chaptersCount} ch</span>
          <span className="text-gray-600">•</span>
          <span className="text-emerald-400 font-semibold">{filteredModulesCount} mod</span>
        </div>
      </div>

      {/* Right: Telemetry, Source Badge, Draft Pill & Settings Modal Trigger */}
      <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-start xl:justify-end">
        {/* Unsaved Local Draft Warning Pill */}
        {hasUnsavedDraft && (
          <button
            type="button"
            onClick={onOpenSourceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold transition-all cursor-pointer animate-pulse"
            title="Unsaved draft detected - click to manage"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Unsaved Draft</span>
          </button>
        )}

        {/* Active Storage Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] bg-white/[0.04] border border-white/10 rounded-xl text-xs font-medium">
          {currentSource === 'pb' && (
            <>
              <Database className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="text-[#d4af37] font-semibold">PocketBase DB</span>
            </>
          )}
          {currentSource === 'cdn' && (
            <>
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-semibold">R2 CDN</span>
            </>
          )}
          {currentSource === 'canonical' && (
            <>
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Canonical Core</span>
            </>
          )}
        </div>

        {/* Reload Quick Action */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-30"
          title="Reload source data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#d4af37] ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        {/* Consolidated Data & Source Modal Button */}
        <button
          type="button"
          onClick={onOpenSourceModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/35 text-[#d4af37] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          title="Open Data & Source configuration modal"
        >
          <Sliders className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Data &amp; Source</span>
        </button>
      </div>
    </div>
  );
}
