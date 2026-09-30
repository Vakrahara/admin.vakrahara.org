'use client';

import React, { useState } from 'react';
import { 
  Compass, Plus, Trash2, MapPin, 
  ArrowLeft, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { TimelineReel, TimelineEpoch, TimelineEvent } from '@/types/curriculum';

interface HistoryTimelineBuilderProps {
  timelineReel?: TimelineReel;
  currentModuleId: string;
  currentModuleTitle: string;
  onChange: (updated: TimelineReel) => void;
}

export function calculateQuadCalendar(astroYear: number) {
  const bceCe = astroYear <= 0 ? `${1 - astroYear} BCE` : `${astroYear} CE`;
  const kyVal = astroYear + 3101;
  const ky = kyVal >= 0 ? `${kyVal} Kali` : `${-kyVal} Pre-Kali`;
  const vs = astroYear >= -56 ? `${astroYear + 57} VS` : `${-(astroYear + 56)} Pre-VS`;
  const ss = astroYear >= 78 ? `${astroYear - 78} Śaka` : `${78 - astroYear} Pre-Śaka`;
  return { bceCe, vs, ss, ky };
}

export function HistoryTimelineBuilder({
  timelineReel = {
    enabled: false,
    reelId: `reel_${Date.now()}`,
    titleEn: 'Chronological Horizon',
    titleHi: 'कालचक्र परिदृश्य',
    titleHng: 'Kalachakra Horizon',
    activeEpochId: '',
    epochs: []
  },
  currentModuleId,
  currentModuleTitle,
  onChange
}: HistoryTimelineBuilderProps) {
  const [selectedEpochId, setSelectedEpochId] = useState<string | null>(
    timelineReel.epochs.length > 0 ? timelineReel.epochs[0].id : null
  );
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const handleToggleEnabled = () => {
    onChange({ ...timelineReel, enabled: !timelineReel.enabled });
  };

  const handleAddEpoch = () => {
    const dates = calculateQuadCalendar(-1000);
    const endDates = calculateQuadCalendar(-500);
    const newEpoch: TimelineEpoch = {
      id: `ep_${Date.now()}`,
      nameEn: 'New Historical Epoch',
      nameHi: 'नवीन कालखण्ड',
      nameHng: 'Naya Kaalkhand',
      startYearAstro: -999, // 1000 BCE
      endYearAstro: -499,   // 500 BCE
      displayRangeBceCe: `${dates.bceCe} – ${endDates.bceCe}`,
      colorHex: '#D4AF37',
      events: []
    };
    const updated = [...timelineReel.epochs, newEpoch];
    onChange({ ...timelineReel, epochs: updated, activeEpochId: timelineReel.activeEpochId || newEpoch.id });
    setSelectedEpochId(newEpoch.id);
  };

  const handleDeleteEpoch = (epochId: string) => {
    const updated = timelineReel.epochs.filter(ep => ep.id !== epochId);
    onChange({ ...timelineReel, epochs: updated });
    if (selectedEpochId === epochId) {
      setSelectedEpochId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleMoveEpoch = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= timelineReel.epochs.length) return;
    const reordered = [...timelineReel.epochs];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    onChange({ ...timelineReel, epochs: reordered });
  };

  const handleAddEvent = (epochId: string) => {
    const dating = calculateQuadCalendar(-799); // 800 BCE
    const newEvent: TimelineEvent = {
      id: `ev_${Date.now()}`,
      yearAstro: -799,
      displayYearBceCe: dating.bceCe,
      displayVikramSamvat: dating.vs,
      displaySakaSamvat: dating.ss,
      displayKaliYuga: dating.ky,
      titleEn: 'Historical Event / Discovery',
      titleHi: 'ऐतिहासिक घटना / आविष्कार',
      titleHng: 'Aitihasik Ghatna',
      summaryEn: 'Summary of the historical development...',
      targetModuleId: currentModuleId,
      isCurrentModuleAnchor: true
    };
    const updatedEpochs = timelineReel.epochs.map(ep => 
      ep.id === epochId ? { ...ep, events: [...ep.events, newEvent] } : ep
    );
    onChange({ ...timelineReel, epochs: updatedEpochs });
    setEditingEventId(newEvent.id);
  };

  const handleUpdateEvent = (epochId: string, eventId: string, patch: Partial<TimelineEvent>) => {
    const updatedEpochs = timelineReel.epochs.map(ep => {
      if (ep.id !== epochId) return ep;
      const updatedEvents = ep.events.map(ev => {
        if (ev.id !== eventId) return ev;
        const merged = { ...ev, ...patch };
        if (patch.yearAstro !== undefined) {
          const quad = calculateQuadCalendar(patch.yearAstro);
          merged.displayYearBceCe = quad.bceCe;
          merged.displayVikramSamvat = quad.vs;
          merged.displaySakaSamvat = quad.ss;
          merged.displayKaliYuga = quad.ky;
        }
        return merged;
      });
      return { ...ep, events: updatedEvents };
    });
    onChange({ ...timelineReel, epochs: updatedEpochs });
  };

  const handleDeleteEvent = (epochId: string, eventId: string) => {
    const updatedEpochs = timelineReel.epochs.map(ep => 
      ep.id === epochId ? { ...ep, events: ep.events.filter(e => e.id !== eventId) } : ep
    );
    onChange({ ...timelineReel, epochs: updatedEpochs });
  };

  const activeEpoch = timelineReel.epochs.find(ep => ep.id === selectedEpochId);
  const activeEpochIndex = timelineReel.epochs.findIndex(ep => ep.id === selectedEpochId);

  return (
    <div className="space-y-4 p-5 rounded-2xl border border-white/5 bg-black/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Kālachakra Chronological Timeline HUD (कालचक्र)
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                timelineReel.enabled ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30' : 'bg-white/5 text-gray-400'
              }`}>
                {timelineReel.enabled ? 'History Active' : 'Hidden'}
              </span>
            </h4>
            <p className="text-xs text-gray-400">Horizontal chronological reel with dual BCE/CE and Vikrama Samvat dating</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleEnabled}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            timelineReel.enabled ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30' : 'bg-white/5 text-gray-400 border-white/10'
          }`}
        >
          {timelineReel.enabled ? 'Disable Timeline' : 'Enable Kālachakra HUD'}
        </button>
      </div>

      {timelineReel.enabled && (
        <div className="space-y-4 pt-2">
          {/* Epoch Selector Bar with Reordering */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
            {timelineReel.epochs.map((epoch, idx) => {
              const isSelected = epoch.id === selectedEpochId;
              const isCurrentAnchor = epoch.id === timelineReel.activeEpochId;
              return (
                <div key={epoch.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedEpochId(epoch.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#d4af37]/10 border-[#d4af37]/50 text-white shadow-md'
                        : 'bg-[#08080c] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: epoch.colorHex }} />
                    <span>{epoch.nameEn}</span>
                    {isCurrentAnchor && (
                      <span className="text-[9px] bg-[#d4af37] text-black font-bold px-1.5 py-0.2 rounded-full">
                        CURRENT
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveEpoch(idx, 'left')}
                    disabled={idx === 0}
                    className="p-1 text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveEpoch(idx, 'right')}
                    disabled={idx === timelineReel.epochs.length - 1}
                    className="p-1 text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleAddEpoch}
              className="px-3 py-1.5 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Epoch</span>
            </button>
          </div>

          {/* Active Epoch Details */}
          {activeEpoch && (
            <div className="p-4 rounded-xl border border-white/5 bg-[#08080c] space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-gray-300">Epoch Configuration</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ ...timelineReel, activeEpochId: activeEpoch.id })}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      timelineReel.activeEpochId === activeEpoch.id ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    {timelineReel.activeEpochId === activeEpoch.id ? 'Active Module Epoch' : 'Set as Module Epoch'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEpoch(activeEpoch.id)}
                    className="p-1 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Epoch (English)</label>
                  <input
                    type="text"
                    value={activeEpoch.nameEn}
                    onChange={(e) => {
                      const updated = timelineReel.epochs.map(ep => ep.id === activeEpoch.id ? { ...ep, nameEn: e.target.value } : ep);
                      onChange({ ...timelineReel, epochs: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Epoch (हिन्दी)</label>
                  <input
                    type="text"
                    value={activeEpoch.nameHi}
                    onChange={(e) => {
                      const updated = timelineReel.epochs.map(ep => ep.id === activeEpoch.id ? { ...ep, nameHi: e.target.value } : ep);
                      onChange({ ...timelineReel, epochs: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Display Range</label>
                  <input
                    type="text"
                    value={activeEpoch.displayRangeBceCe}
                    onChange={(e) => {
                      const updated = timelineReel.epochs.map(ep => ep.id === activeEpoch.id ? { ...ep, displayRangeBceCe: e.target.value } : ep);
                      onChange({ ...timelineReel, epochs: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Pinned Events */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    Pinned Events & Module Anchors ({activeEpoch.events.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddEvent(activeEpoch.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#d4af37] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Pin Event
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activeEpoch.events.map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-xl border flex flex-col gap-2.5 ${
                        ev.isCurrentModuleAnchor ? 'border-[#d4af37]/60 bg-[#d4af37]/5 shadow-md' : 'border-white/5 bg-black/40'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[#d4af37] text-[10px] font-mono font-bold">
                            {ev.displayYearBceCe}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            ({ev.displayVikramSamvat} | {ev.displayKaliYuga})
                          </span>
                          {ev.isCurrentModuleAnchor && (
                            <span className="px-2 py-0.5 rounded-full bg-[#d4af37] text-black text-[9px] font-black uppercase">
                              YOU ARE HERE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = activeEpoch.events.map(e => ({ ...e, isCurrentModuleAnchor: e.id === ev.id }));
                              const updatedEpochs = timelineReel.epochs.map(ep => ep.id === activeEpoch.id ? { ...ep, events: updated } : ep);
                              onChange({ ...timelineReel, epochs: updatedEpochs, activeEpochId: activeEpoch.id, activeEventId: ev.id });
                            }}
                            className={`px-2 py-0.5 text-[9px] font-bold rounded border cursor-pointer ${
                              ev.isCurrentModuleAnchor ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                            }`}
                          >
                            Set Reticle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(activeEpoch.id, ev.id)}
                            className="p-1 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-400 font-bold block mb-0.5">Astro Year (e.g. -799)</label>
                          <input
                            type="number"
                            value={ev.yearAstro}
                            onChange={(e) => handleUpdateEvent(activeEpoch.id, ev.id, { yearAstro: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-black/60 border border-white/10 rounded text-xs text-white font-mono"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-[9px] text-gray-400 font-bold block mb-0.5">Event Title (English)</label>
                          <input
                            type="text"
                            value={ev.titleEn}
                            onChange={(e) => handleUpdateEvent(activeEpoch.id, ev.id, { titleEn: e.target.value })}
                            className="w-full px-2 py-1 bg-black/60 border border-white/10 rounded text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] text-gray-400 font-bold block mb-0.5">Historical Summary</label>
                        <input
                          type="text"
                          value={ev.summaryEn}
                          onChange={(e) => handleUpdateEvent(activeEpoch.id, ev.id, { summaryEn: e.target.value })}
                          className="w-full px-2 py-1 bg-black/60 border border-white/10 rounded text-xs text-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
