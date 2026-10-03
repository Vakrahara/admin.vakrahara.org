'use client';

import React, { useState } from 'react';
import { Layers, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { TimelineReel, TimelineEpoch, TimelineEvent } from '@/types/curriculumTriad';
import { calculateQuadCalendar } from '../utils/quadCalendarUtils';
import { TimelineEventItem } from './TimelineEventItem';

interface HistoryTimelineBuilderProps {
  timelineReel?: TimelineReel;
  onChange: (reel: TimelineReel) => void;
  activeModuleId: string;
}

export function HistoryTimelineBuilder({ timelineReel, onChange, activeModuleId }: HistoryTimelineBuilderProps) {
  const [expandedEpochId, setExpandedEpochId] = useState<string | null>(null);

  const reel: TimelineReel = timelineReel || {
    enabled: false,
    reelId: `reel_${activeModuleId}`,
    titleEn: 'Chronicle of Historical Sciences',
    titleHi: 'ऐतिहासिक विज्ञान कालचक्र',
    titleHng: 'History Kaalchakra',
    activeEpochId: 'epoch_01',
    epochs: []
  };

  const handleToggleEnabled = () => {
    onChange({ ...reel, enabled: !reel.enabled });
  };

  const handleAddEpoch = () => {
    const epochId = `epoch_${Date.now()}`;
    const newEpoch: TimelineEpoch = {
      id: epochId,
      nameEn: 'New Historical Epoch',
      nameHi: 'नया ऐतिहासिक काल',
      nameHng: 'Naya Kaal',
      startYearAstro: -1200,
      endYearAstro: -600,
      displayRangeBceCe: 'c. 1200–600 BCE',
      colorHex: '#D4AF37',
      events: []
    };
    onChange({
      ...reel,
      activeEpochId: reel.activeEpochId || epochId,
      epochs: [...reel.epochs, newEpoch]
    });
    setExpandedEpochId(epochId);
  };

  const handleUpdateEpoch = (epochId: string, patch: Partial<TimelineEpoch>) => {
    const updated = reel.epochs.map(e => e.id === epochId ? { ...e, ...patch } : e);
    onChange({ ...reel, epochs: updated });
  };

  const handleDeleteEpoch = (epochId: string) => {
    onChange({ ...reel, epochs: reel.epochs.filter(e => e.id !== epochId) });
    if (expandedEpochId === epochId) setExpandedEpochId(null);
  };

  const handleAddEvent = (epochId: string) => {
    const epoch = reel.epochs.find(e => e.id === epochId);
    if (!epoch) return;

    const eventId = `ev_${Date.now()}`;
    const newEvent: TimelineEvent = {
      id: eventId,
      yearAstro: epoch.startYearAstro,
      displayYearBceCe: calculateQuadCalendar(epoch.startYearAstro).bceCe,
      titleEn: 'New Chronicle Milestone',
      titleHi: 'नई ऐतिहासिक घटना',
      titleHng: 'Nayi Ghatna',
      summaryEn: '',
      targetModuleId: activeModuleId,
      isCurrentModuleAnchor: epoch.events.length === 0
    };

    handleUpdateEpoch(epochId, { events: [...epoch.events, newEvent] });
  };

  const handleUpdateEvent = (epochId: string, eventId: string, patch: Partial<TimelineEvent>) => {
    const epoch = reel.epochs.find(e => e.id === epochId);
    if (!epoch) return;

    const updatedEvents = epoch.events.map(ev => {
      if (ev.id !== eventId) return ev;
      const merged = { ...ev, ...patch };
      if ('yearAstro' in patch && patch.yearAstro !== undefined) {
        const quad = calculateQuadCalendar(patch.yearAstro);
        merged.displayYearBceCe = quad.bceCe;
        merged.displayVikramSamvat = quad.vikramSamvat;
        merged.displaySakaSamvat = quad.sakaSamvat;
        merged.displayKaliYuga = quad.kaliYuga;
      }
      return merged;
    });

    handleUpdateEpoch(epochId, { events: updatedEvents });
  };

  const handleDeleteEvent = (epochId: string, eventId: string) => {
    const epoch = reel.epochs.find(e => e.id === epochId);
    if (!epoch) return;
    handleUpdateEpoch(epochId, { events: epoch.events.filter(ev => ev.id !== eventId) });
  };

  return (
    <div className="glass-panel border border-white/5 bg-black/40 p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#d4af37]" />
          <div>
            <h4 className="font-bold text-xs text-[#d4af37] uppercase tracking-wider">
              कालचक्र • Complete Timeline Reel Builder
            </h4>
            <p className="text-[10px] text-gray-500">Chronological epoch ribbons & multi-module collision clusters</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reel.enabled}
              onChange={handleToggleEnabled}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d4af37]"></div>
          </label>
          <span className="text-[10px] font-mono uppercase text-gray-400">
            {reel.enabled ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      {reel.enabled && (
        <div className="space-y-4 pt-1 text-xs">
          {/* Reel Header */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Reel Title (EN)</label>
              <input
                type="text"
                value={reel.titleEn}
                onChange={(e) => onChange({ ...reel, titleEn: e.target.value })}
                className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Reel Title (HI)</label>
              <input
                type="text"
                value={reel.titleHi}
                onChange={(e) => onChange({ ...reel, titleHi: e.target.value })}
                className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Reel Title (HNG)</label>
              <input
                type="text"
                value={reel.titleHng}
                onChange={(e) => onChange({ ...reel, titleHng: e.target.value })}
                className="w-full px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          {/* Epochs List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Epoch Ribbons ({reel.epochs.length})
              </span>
              <button
                type="button"
                onClick={handleAddEpoch}
                className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-bold rounded-lg transition-all"
              >
                <Plus className="w-3 h-3" />
                Add Epoch
              </button>
            </div>

            {reel.epochs.map((epoch) => {
              const isExpanded = expandedEpochId === epoch.id;
              return (
                <div key={epoch.id} className="p-3 bg-[#08080c] border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedEpochId(isExpanded ? null : epoch.id)}
                      className="flex items-center gap-2 text-left flex-1"
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: epoch.colorHex || '#D4AF37' }} />
                      <span className="text-xs font-semibold text-white">{epoch.nameEn}</span>
                      <span className="text-[10px] text-gray-500 font-mono">({epoch.displayRangeBceCe})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500 ml-auto mr-2" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-auto mr-2" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEpoch(epoch.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={epoch.nameEn}
                          onChange={(e) => handleUpdateEpoch(epoch.id, { nameEn: e.target.value })}
                          placeholder="Epoch Name (EN)"
                          className="px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                        />
                        <input
                          type="text"
                          value={epoch.displayRangeBceCe}
                          onChange={(e) => handleUpdateEpoch(epoch.id, { displayRangeBceCe: e.target.value })}
                          placeholder="e.g. c. 1300–500 BCE"
                          className="px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs"
                        />
                        <input
                          type="color"
                          value={epoch.colorHex || '#D4AF37'}
                          onChange={(e) => handleUpdateEpoch(epoch.id, { colorHex: e.target.value })}
                          className="w-full h-7 bg-[#0d0d15] border border-white/5 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Events Inside Epoch */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                            Events ({epoch.events.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddEvent(epoch.id)}
                            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:underline"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            Add Event
                          </button>
                        </div>

                        {epoch.events.map((ev) => (
                          <TimelineEventItem
                            key={ev.id}
                            event={ev}
                            epochId={epoch.id}
                            onUpdateEvent={handleUpdateEvent}
                            onDeleteEvent={handleDeleteEvent}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
