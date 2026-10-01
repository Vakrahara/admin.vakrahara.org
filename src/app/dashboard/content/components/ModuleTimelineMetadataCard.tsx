'use client';

import React from 'react';
import { Compass, Calendar } from 'lucide-react';
import { ModuleTimelineMetadata } from '@/types/curriculumTriad';
import { calculateQuadCalendar, parseYearToAstro } from '../utils/quadCalendarUtils';

interface ModuleTimelineMetadataCardProps {
  metadata?: ModuleTimelineMetadata;
  onChange: (metadata: ModuleTimelineMetadata) => void;
}

export function ModuleTimelineMetadataCard({ metadata, onChange }: ModuleTimelineMetadataCardProps) {
  const meta: ModuleTimelineMetadata = metadata || {
    eraLabelEn: '',
    eraLabelHi: '',
    eraLabelHng: '',
    yearAstro: null,
    oneLineHookEn: '',
    oneLineHookHi: '',
    oneLineHookHng: '',
    applicableGrades: [10]
  };

  const currentYear = meta.yearAstro ?? -1199;
  const quadCalendar = calculateQuadCalendar(currentYear);

  const handleYearInputChange = (val: string) => {
    const parsed = parseYearToAstro(val);
    onChange({ ...meta, yearAstro: parsed });
  };

  return (
    <div className="glass-panel border border-white/5 bg-black/40 p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          <div>
            <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider">
              कालचक्र • Timeline & Horizon Metadata
            </h4>
            <p className="text-[10px] text-gray-500">Quad-calendar positioning & historical era mapping</p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Era Labels */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Era Label (EN)</label>
            <input
              type="text"
              value={meta.eraLabelEn}
              onChange={(e) => onChange({ ...meta, eraLabelEn: e.target.value })}
              placeholder="Vedic Iron Age & Wootz Steel"
              className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Era Label (HI)</label>
            <input
              type="text"
              value={meta.eraLabelHi}
              onChange={(e) => onChange({ ...meta, eraLabelHi: e.target.value })}
              placeholder="वैदिक लौह युग"
              className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Era Label (HNG)</label>
            <input
              type="text"
              value={meta.eraLabelHng}
              onChange={(e) => onChange({ ...meta, eraLabelHng: e.target.value })}
              placeholder="Vaidik Lauh Yug"
              className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
            />
          </div>
        </div>

        {/* Astronomical Year & Quad Calendar Live Readout */}
        <div className="p-3 bg-[#08080c] border border-emerald-500/20 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Continuous Astronomical Year (AstroYear)</span>
            </div>
            <input
              type="text"
              value={meta.yearAstro !== null && meta.yearAstro !== undefined ? meta.yearAstro : ''}
              onChange={(e) => handleYearInputChange(e.target.value)}
              placeholder="e.g. -1199 (1200 BCE)"
              className="w-44 px-2 py-1 bg-[#0d0d15] border border-white/10 rounded-lg text-white text-xs font-mono text-right"
            />
          </div>

          {/* Quad-Calendar Cards */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-black/50 border border-white/5 rounded-lg">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 block">Gregorian / CE</span>
              <span className="text-xs font-bold text-emerald-300 font-mono">{quadCalendar.bceCe}</span>
            </div>
            <div className="p-2 bg-black/50 border border-white/5 rounded-lg">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 block">Vikram Samvat</span>
              <span className="text-xs font-bold text-[#d4af37] font-mono">{quadCalendar.vikramSamvat}</span>
            </div>
            <div className="p-2 bg-black/50 border border-white/5 rounded-lg">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 block">Śaka Samvat</span>
              <span className="text-xs font-bold text-cyan-300 font-mono">{quadCalendar.sakaSamvat}</span>
            </div>
            <div className="p-2 bg-black/50 border border-white/5 rounded-lg">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 block">Kali Yuga</span>
              <span className="text-xs font-bold text-purple-300 font-mono">{quadCalendar.kaliYuga}</span>
            </div>
          </div>
        </div>

        {/* 1-Line Pedagogical Hook */}
        <div className="space-y-1.5">
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">1-Line Pedagogical Hook</label>
          <input
            type="text"
            value={meta.oneLineHookEn || ''}
            onChange={(e) => onChange({ ...meta, oneLineHookEn: e.target.value })}
            placeholder="Archaeometallurgical excavations prove advanced crucible iron smelting..."
            className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={meta.oneLineHookHi || ''}
              onChange={(e) => onChange({ ...meta, oneLineHookHi: e.target.value })}
              placeholder="अतरंजीखेड़ा में 1200 ई.पू. के उन्नत लौह प्रगलन प्रमाण..."
              className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
            />
            <input
              type="text"
              value={meta.oneLineHookHng || ''}
              onChange={(e) => onChange({ ...meta, oneLineHookHng: e.target.value })}
              placeholder="Atranjikhera me 1200 BCE ke advanced iron smelting evidence..."
              className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
            />
          </div>
        </div>

        {/* Applicable Grades */}
        <div className="flex items-center gap-4">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Applicable Grades:</span>
          {[8, 9, 10, 11, 12].map(grade => {
            const isSelected = meta.applicableGrades?.includes(grade) ?? false;
            return (
              <button
                key={grade}
                type="button"
                onClick={() => {
                  const updated = isSelected
                    ? (meta.applicableGrades || []).filter(g => g !== grade)
                    : [...(meta.applicableGrades || []), grade];
                  onChange({ ...meta, applicableGrades: updated });
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/5 text-gray-500 border border-white/5 hover:text-white'
                }`}
              >
                Class {grade}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
