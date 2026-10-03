'use client';

import React, { useMemo } from 'react';
import { ChevronRight, ChevronDown, RotateCcw, X, Layers } from 'lucide-react';
import { getDisciplineRegistry, getDisciplineById } from '@/lib/disciplinesRegistry';
import { CurriculumFilterState, isCurriculumFiltered } from '../utils/curriculumFilterUtils';

interface CurriculumFilterBarProps {
  filters: CurriculumFilterState;
  onFilterChange: (filters: CurriculumFilterState) => void;
  onResetFilters: () => void;
  totalChaptersCount: number;
  filteredChaptersCount: number;
  filteredModulesCount: number;
}

export function CurriculumFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalChaptersCount,
  filteredChaptersCount,
  filteredModulesCount
}: CurriculumFilterBarProps) {
  const disciplines = useMemo(() => getDisciplineRegistry(), []);
  const activeDiscipline = useMemo(() => {
    if (filters.discipline === 'all') return null;
    const found = getDisciplineById(filters.discipline);
    if (found) return found;
    return {
      id: filters.discipline,
      nameEn: filters.discipline.replace('disc_', ''),
      nameHi: '',
      icon: '🏷️',
      colorHex: '#10B981',
      order: 99
    };
  }, [filters.discipline]);
  const isFiltered = isCurriculumFiltered(filters);

  return (
    <div className="glass-panel border border-white/10 bg-[#080C14]/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs">
      {/* 3-Level Yantric HUD Cluster */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[#d4af37] font-mono font-bold text-[10px] tracking-wider uppercase mr-1">
          <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Taxonomy:</span>
        </div>

        {/* Level 1: Board Pill */}
        <div className="relative flex items-center bg-[#0d111a] border border-white/10 hover:border-[#d4af37]/40 rounded-xl px-3 py-1.5 focus-within:border-[#d4af37] transition-all">
          <label htmlFor="filter-board" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-2 font-mono">
            Board
          </label>
          <select
            id="filter-board"
            value={filters.board}
            onChange={(e) => onFilterChange({ ...filters, board: e.target.value })}
            className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-4 appearance-none"
          >
            <option value="all" className="bg-[#080C14] text-white">All Boards</option>
            <option value="cbse" className="bg-[#080C14] text-white">CBSE</option>
            <option value="icse" className="bg-[#080C14] text-white">ICSE</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 pointer-events-none absolute right-2" />
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-[#d4af37]/60 hidden sm:block shrink-0" />

        {/* Level 2: Grade Pill */}
        <div className="relative flex items-center bg-[#0d111a] border border-white/10 hover:border-[#d4af37]/40 rounded-xl px-3 py-1.5 focus-within:border-[#d4af37] transition-all">
          <label htmlFor="filter-grade" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-2 font-mono">
            Grade
          </label>
          <select
            id="filter-grade"
            value={filters.grade}
            onChange={(e) => onFilterChange({ ...filters, grade: e.target.value })}
            className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-4 appearance-none"
          >
            <option value="all" className="bg-[#080C14] text-white">All Grades</option>
            <option value="8" className="bg-[#080C14] text-white">Class 8</option>
            <option value="9" className="bg-[#080C14] text-white">Class 9</option>
            <option value="10" className="bg-[#080C14] text-white">Class 10</option>
            <option value="11" className="bg-[#080C14] text-white">Class 11</option>
            <option value="12" className="bg-[#080C14] text-white">Class 12</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 pointer-events-none absolute right-2" />
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-[#d4af37]/60 hidden sm:block shrink-0" />

        {/* Level 3: Discipline Pill */}
        <div className="relative flex items-center bg-[#0d111a] border border-white/10 hover:border-[#d4af37]/40 rounded-xl px-3 py-1.5 focus-within:border-[#d4af37] transition-all max-w-[260px]">
          <label htmlFor="filter-discipline" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-2 font-mono shrink-0">
            Discipline
          </label>
          <select
            id="filter-discipline"
            value={filters.discipline}
            onChange={(e) => onFilterChange({ ...filters, discipline: e.target.value })}
            className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-4 truncate appearance-none w-full"
          >
            <option value="all" className="bg-[#080C14] text-white">All Disciplines</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#080C14] text-white">
                {d.icon} {d.nameEn}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 pointer-events-none absolute right-2" />
        </div>
      </div>

      {/* Metrics, Active Filter Badges & Reset Button */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Match Metrics Display */}
        <div className="text-gray-400 text-xs px-2 py-1 bg-white/[0.02] border border-white/5 rounded-xl font-mono">
          Showing <span className="text-[#d4af37] font-bold">{filteredChaptersCount}</span> of{' '}
          <span className="text-white font-medium">{totalChaptersCount}</span> chapters •{' '}
          <span className="text-emerald-400 font-bold">{filteredModulesCount}</span> modules
        </div>

        {/* Active Chips */}
        {filters.board !== 'all' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-[11px] font-semibold">
            <span>Board: {filters.board.toUpperCase()}</span>
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, board: 'all' })}
              className="hover:text-white cursor-pointer ml-0.5"
              title="Clear board filter"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {filters.grade !== 'all' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[11px] font-semibold">
            <span>Class {filters.grade}</span>
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, grade: 'all' })}
              className="hover:text-white cursor-pointer ml-0.5"
              title="Clear grade filter"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {activeDiscipline && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold truncate max-w-[180px]">
            <span className="truncate">{activeDiscipline.icon} {activeDiscipline.nameEn}</span>
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, discipline: 'all' })}
              className="hover:text-white cursor-pointer ml-0.5 shrink-0"
              title="Clear discipline filter"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Reset Action */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
            title="Reset all filters to default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
