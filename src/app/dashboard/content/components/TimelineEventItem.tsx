'use client';

import React, { useState } from 'react';
import { Calendar, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { TimelineEvent } from '@/types/curriculumTriad';
import { parseYearToAstro, formatDisplayRange } from '../utils/quadCalendarUtils';
import { TimelineEventDetails } from './TimelineEventDetails';

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
  const [localEndYear, setLocalEndYear] = useState<string>(
    event.endYearAstro !== undefined && event.endYearAstro !== null ? String(event.endYearAstro) : ''
  );

  React.useEffect(() => {
    setLocalYear(String(event.yearAstro ?? ''));
  }, [event.yearAstro]);

  React.useEffect(() => {
    setLocalEndYear(
      event.endYearAstro !== undefined && event.endYearAstro !== null ? String(event.endYearAstro) : ''
    );
  }, [event.endYearAstro]);

  const updateRangeFields = (startY: number, endY: number | undefined, rawStart: string, rawEnd: string) => {
    if (endY !== undefined && endY > startY) {
      const isApprox = /c\.|approx/i.test(rawStart) || /c\.|approx/i.test(rawEnd) || !!event.displayYearBceCe?.startsWith('c.');
      const displayRange = formatDisplayRange(startY, endY, isApprox);
      return { endYearAstro: endY, isDateRange: true, displayRange };
    }
    return { endYearAstro: endY, isDateRange: false, displayRange: undefined };
  };

  const handleYearChange = (val: string) => {
    setLocalYear(val);
    const parsed = parseYearToAstro(val);
    if (parsed !== null) {
      const rangePatch = updateRangeFields(parsed, event.endYearAstro, val, localEndYear);
      onUpdateEvent(epochId, event.id, { yearAstro: parsed, ...rangePatch });
    }
  };

  const handleYearBlur = () => {
    const parsed = parseYearToAstro(localYear);
    if (parsed !== null) {
      const rangePatch = updateRangeFields(parsed, event.endYearAstro, localYear, localEndYear);
      onUpdateEvent(epochId, event.id, { yearAstro: parsed, ...rangePatch });
      setLocalYear(String(parsed));
    } else {
      setLocalYear(String(event.yearAstro ?? ''));
    }
  };

  const handleEndYearChange = (val: string) => {
    setLocalEndYear(val);
    if (!val.trim()) {
      onUpdateEvent(epochId, event.id, { endYearAstro: undefined, isDateRange: false, displayRange: undefined });
      return;
    }
    const parsed = parseYearToAstro(val);
    if (parsed !== null) {
      const rangePatch = updateRangeFields(event.yearAstro, parsed, localYear, val);
      onUpdateEvent(epochId, event.id, rangePatch);
    }
  };

  const handleEndYearBlur = () => {
    if (!localEndYear.trim()) {
      onUpdateEvent(epochId, event.id, { endYearAstro: undefined, isDateRange: false, displayRange: undefined });
      return;
    }
    const parsed = parseYearToAstro(localEndYear);
    if (parsed !== null) {
      const rangePatch = updateRangeFields(event.yearAstro, parsed, localYear, localEndYear);
      onUpdateEvent(epochId, event.id, rangePatch);
      setLocalEndYear(String(parsed));
    } else {
      setLocalEndYear(event.endYearAstro !== undefined && event.endYearAstro !== null ? String(event.endYearAstro) : '');
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
            placeholder="Start"
            title="Start Astronomical Year (e.g. -1199 or 1200 BCE)"
            className="w-16 px-1 py-1 bg-[#0d0d15] border border-white/5 rounded text-white text-[10px] font-mono text-center focus:border-[#d4af37]/40 outline-none"
          />
          <span className="text-gray-500 text-[10px]">–</span>
          <input
            type="text"
            value={localEndYear}
            onChange={(e) => handleEndYearChange(e.target.value)}
            onBlur={handleEndYearBlur}
            placeholder="End (Opt)"
            title="End Year / Period Span (e.g. -1900 or 1900 BCE)"
            className="w-16 px-1 py-1 bg-[#0d0d15] border border-white/5 rounded text-white text-[10px] font-mono text-center focus:border-[#d4af37]/40 outline-none"
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
          <span>{event.isDateRange && event.displayRange ? `Range: ${event.displayRange}` : `Greg: ${event.displayYearBceCe}`}</span>
          {event.displayVikramSamvat && <span>• {event.displayVikramSamvat}</span>}
          {event.isDateRange && (
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-bold font-sans">
              RANGE
            </span>
          )}
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
        <TimelineEventDetails
          event={event}
          epochId={epochId}
          onUpdateEvent={onUpdateEvent}
          onGradeToggle={handleGradeToggle}
        />
      )}
    </div>
  );
}
