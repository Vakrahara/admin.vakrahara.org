'use client';

import React from 'react';
import { MapPin, Search } from 'lucide-react';
import { TimelineEvent } from '@/types/curriculumTriad';

interface TimelineEventDetailsProps {
  event: TimelineEvent;
  epochId: string;
  onUpdateEvent: (epochId: string, eventId: string, patch: Partial<TimelineEvent>) => void;
  onGradeToggle: (grade: number) => void;
}

export function TimelineEventDetails({
  event,
  epochId,
  onUpdateEvent,
  onGradeToggle
}: TimelineEventDetailsProps) {
  return (
    <div className="pt-2 border-t border-white/5 space-y-2.5 text-xs">
      {/* Mandatory Summary EN */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
            Summary (EN) <span className="text-amber-400">*</span>
          </label>
          <span className="text-[9px] text-gray-500">Required for publication</span>
        </div>
        <textarea
          value={event.summaryEn || ''}
          onChange={(e) => onUpdateEvent(epochId, event.id, { summaryEn: e.target.value })}
          placeholder="Core historical insight or discovery summary..."
          rows={2}
          className="w-full px-2 py-1 bg-[#08080c] border border-white/10 rounded text-white text-xs focus:border-[#d4af37]/40 outline-none resize-y"
        />
      </div>

      {/* Multilingual Titles (HI & HNG) */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Event Title (HI)
          </label>
          <input
            type="text"
            value={event.titleHi || ''}
            onChange={(e) => onUpdateEvent(epochId, event.id, { titleHi: e.target.value })}
            placeholder="घटना का शीर्षक..."
            className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded text-white text-xs focus:border-[#d4af37]/40 outline-none"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Event Title (HNG)
          </label>
          <input
            type="text"
            value={event.titleHng || ''}
            onChange={(e) => onUpdateEvent(epochId, event.id, { titleHng: e.target.value })}
            placeholder="Ghatna Title..."
            className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded text-white text-xs focus:border-[#d4af37]/40 outline-none"
          />
        </div>
      </div>

      {/* Multilingual Summaries (HI & HNG) */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Summary (HI)
          </label>
          <textarea
            value={event.summaryHi || ''}
            onChange={(e) => onUpdateEvent(epochId, event.id, { summaryHi: e.target.value })}
            placeholder="ऐतिहासिक सारांश (हिन्दी)..."
            rows={2}
            className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded text-white text-xs focus:border-[#d4af37]/40 outline-none resize-y"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Summary (HNG)
          </label>
          <textarea
            value={event.summaryHng || ''}
            onChange={(e) => onUpdateEvent(epochId, event.id, { summaryHng: e.target.value })}
            placeholder="Aitihasik summary (Hinglish)..."
            rows={2}
            className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded text-white text-xs focus:border-[#d4af37]/40 outline-none resize-y"
          />
        </div>
      </div>

      {/* Location & Evidence Tag */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5 flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-amber-400" /> Location Name
          </label>
          <input
            type="text"
            value={event.locationName || ''}
            onChange={(e) => onUpdateEvent(epochId, event.id, { locationName: e.target.value })}
            placeholder="Hastinapura / Taxila"
            className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded text-white text-xs focus:border-[#d4af37]/40 outline-none"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5 flex items-center gap-1">
            <Search className="w-2.5 h-2.5 text-sky-400" /> Evidence Tag
          </label>
          <input
            type="text"
            value={event.evidenceTag || ''}
            onChange={(e) => onUpdateEvent(epochId, event.id, { evidenceTag: e.target.value })}
            placeholder="Archaeological / Inscriptional"
            className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded text-white text-xs focus:border-[#d4af37]/40 outline-none"
          />
        </div>
      </div>

      {/* Applicable Grades Multi-Select */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
          Applicable Grades:
        </span>
        <div className="flex items-center gap-1.5">
          {[8, 9, 10, 11, 12].map((grade) => {
            const isSelected = (event.applicableGrades || []).includes(grade);
            return (
              <button
                key={grade}
                type="button"
                onClick={() => onGradeToggle(grade)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  isSelected
                    ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40'
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
