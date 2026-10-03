'use client';

import React, { useState } from 'react';
import { Calendar, Trash2, ChevronDown, ChevronUp, MapPin, Search } from 'lucide-react';
import { TimelineEvent } from '@/types/curriculumTriad';
import { parseYearToAstro } from '../utils/quadCalendarUtils';

interface TimelineEventItemProps {
  event: TimelineEvent;
  epochId: string;
  onUpdateEvent: (epochId: string, eventId: string, patch: Partial<TimelineEvent>) => void;
  onDeleteEvent: (epochId: string, eventId: string) => void;
}

export function TimelineEventItem({
  event,
  epochId,
  onUpdateEvent,
  onDeleteEvent
}: TimelineEventItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMissingSummary = !event.summaryEn?.trim();
  const [localYear, setLocalYear] = useState<string>(String(event.yearAstro ?? ''));

  React.useEffect(() => {
    setLocalYear(String(event.yearAstro ?? ''));
  }, [event.yearAstro]);

  const handleYearChange = (val: string) => {
    setLocalYear(val);
    const parsed = parseYearToAstro(val);
    if (parsed !== null) {
      onUpdateEvent(epochId, event.id, { yearAstro: parsed });
    }
  };

  const handleYearBlur = () => {
    const parsed = parseYearToAstro(localYear);
    if (parsed !== null) {
      onUpdateEvent(epochId, event.id, { yearAstro: parsed });
      setLocalYear(String(parsed));
    } else {
      setLocalYear(String(event.yearAstro ?? ''));
    }
  };

  const handleGradeToggle = (grade: number) => {
    const current = event.applicableGrades || [];
    const updated = current.includes(grade)
      ? current.filter(g => g !== grade)
      : [...current, grade].sort((a, b) => a - b);
    onUpdateEvent(epochId, event.id, { applicableGrades: updated });
  };

  return (
    <div className={`p-2.5 bg-black/60 border ${isMissingSummary ? 'border-amber-500/30' : 'border-white/5'} rounded-lg space-y-2`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
          <input
            type="text"
            value={event.titleEn}
            onChange={(e) => onUpdateEvent(epochId, event.id, { titleEn: e.target.value })}
            placeholder="Event Title (EN)..."
            className="flex-1 px-2 py-1 bg-[#0d0d15] border border-white/5 rounded text-white text-xs focus:border-[#d4af37]/40 outline-none"
          />
          <input
            type="text"
            value={localYear}
            onChange={(e) => handleYearChange(e.target.value)}
            onBlur={handleYearBlur}
            placeholder="AstroYear"
            className="w-20 px-1 py-1 bg-[#0d0d15] border border-white/5 rounded text-white text-[10px] font-mono text-center focus:border-[#d4af37]/40 outline-none"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
            title={isExpanded ? 'Collapse Details' : 'Expand Details'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onDeleteEvent(epochId, event.id)}
            className="p-1 text-gray-500 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
            title="Delete Event"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono px-0.5">
        <div className="flex items-center gap-2">
          <span>Greg: {event.displayYearBceCe}</span>
          {event.displayVikramSamvat && <span>• {event.displayVikramSamvat}</span>}
          {event.isCurrentModuleAnchor && (
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-bold font-sans">
              ANCHOR
            </span>
          )}
        </div>
        {isMissingSummary && (
          <span className="text-amber-400 font-sans text-[9px] bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
            Summary Required *
          </span>
        )}
      </div>

      {isExpanded && (
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
                    onClick={() => handleGradeToggle(grade)}
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
      )}
    </div>
  );
}
