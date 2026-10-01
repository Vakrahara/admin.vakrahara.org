'use client';

import React, { useState } from 'react';
import { BookOpen, Headphones, Compass } from 'lucide-react';
import { Module } from '@/types/curriculum';
import { KeyTermsEditor } from './KeyTermsEditor';
import { AudioOverviewManager } from './AudioOverviewManager';
import { ModuleTimelineMetadataCard } from './ModuleTimelineMetadataCard';
import { HistoryTimelineBuilder } from './HistoryTimelineBuilder';

interface ModuleTriadDeckProps {
  module: Module;
  onUpdateModule: (patch: Partial<Module>) => void;
}

export function ModuleTriadDeck({ module, onUpdateModule }: ModuleTriadDeckProps) {
  const [activeTab, setActiveTab] = useState<'shabdakosha' | 'audio' | 'timeline'>('shabdakosha');

  const hasTerms = module.keyTermsRecap?.enabled;
  const hasAudio = module.audioOverview?.enabled;
  const hasTimeline = module.timelineReel?.enabled || module.timelineMetadata?.eraLabelEn;

  return (
    <div className="space-y-4">
      {/* Triad Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('shabdakosha')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'shabdakosha'
              ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-sm'
              : 'text-gray-400 hover:text-white border border-transparent'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>शब्दकोश (Shabdakosha)</span>
          {hasTerms && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audio'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-gray-400 hover:text-white border border-transparent'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>स्मृति-श्रुति (Audio Revisit)</span>
          {hasAudio && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'text-gray-400 hover:text-white border border-transparent'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>कालचक्र (Kālachakra Timeline)</span>
          {hasTimeline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>
      </div>

      {/* Triad Content Sections */}
      {activeTab === 'shabdakosha' && (
        <KeyTermsEditor
          keyTermsRecap={module.keyTermsRecap}
          onChange={(keyTermsRecap) => onUpdateModule({ keyTermsRecap })}
        />
      )}

      {activeTab === 'audio' && (
        <AudioOverviewManager
          audioOverview={module.audioOverview}
          onChange={(audioOverview) => onUpdateModule({ audioOverview })}
        />
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <ModuleTimelineMetadataCard
            metadata={module.timelineMetadata}
            onChange={(timelineMetadata) => onUpdateModule({ timelineMetadata })}
          />
          <HistoryTimelineBuilder
            timelineReel={module.timelineReel}
            onChange={(timelineReel) => onUpdateModule({ timelineReel })}
            activeModuleId={module.id}
          />
        </div>
      )}
    </div>
  );
}
