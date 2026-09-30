'use client';

import React, { useState } from 'react';
import { 
  Layers, BookOpen, Headphones, Compass 
} from 'lucide-react';
import { Module, Step, StepType, MediaMode, Chapter, KeyTermsRecap, AudioOverview, TimelineReel } from '@/types/curriculum';
import { DigitalTwinPreview } from './DigitalTwinPreview';
import { ModuleStepsList } from './ModuleStepsList';
import { KeyTermsEditor } from './KeyTermsEditor';
import { AudioOverviewManager } from './AudioOverviewManager';
import { HistoryTimelineBuilder } from './HistoryTimelineBuilder';

interface CbseModuleEditorPanelProps {
  activeChapter: Chapter;
  activeModule: Module;
  activeEditStepId: string | null;
  onUpdateModule: (fields: Partial<Module>) => void;
  onUpdateModuleSteps: (steps: Step[]) => void;
  onSetActiveEditStepId: (stepId: string | null) => void;
  onOpenFocusedEditor: (stepId: string) => void;
  onOpenBulkImport: () => void;
  onMoveStep: (index: number, direction: 'up' | 'down') => void;
}

export function CbseModuleEditorPanel({
  activeChapter,
  activeModule,
  activeEditStepId,
  onUpdateModule,
  onUpdateModuleSteps,
  onSetActiveEditStepId,
  onOpenFocusedEditor,
  onOpenBulkImport,
  onMoveStep
}: CbseModuleEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<'steps' | 'shabdakosha' | 'audio' | 'timeline'>('steps');

  const isHistoryChapter = activeChapter?.branchId === 'history' || activeChapter?.branchId === 'itihasa' || Boolean(activeModule.timelineReel?.enabled);

  const handleAddStep = (type: StepType) => {
    const newStep: Step = {
      type,
      id: `${activeModule.id}_step_${activeModule.steps.length + 1}`,
      ...(type === 'video_simulation' ? { mediaMode: 'both' as MediaMode, subStepCount: 3, videoUrl: '', simulationId: 'what_is_a_wave', transcript: [] } : {}),
      ...(type === 'saraswati' ? { miniSteps: [], definitionEn: '' } : {}),
      ...(type === 'anveshana' ? { pool: [], questionPool: [], questionsPerAttempt: 5, passingScore: 4 } : {}),
      ...(type === 'concept' ? { textDeva: '', textEng: '' } : {}),
      ...(type === 'simulation' ? { simulationId: 'what_is_a_wave', questionText: '' } : {}),
      ...(type === 'predict_quiz' ? { question: '', options: ['', ''], correctOptionIndex: 0, explanation: '', hints: [''] } : {}),
      ...(type === 'heritage_connection' ? { title: '', sutra: '', translation: '', significance: '' } : {})
    };
    onUpdateModuleSteps([...activeModule.steps, newStep]);
    onSetActiveEditStepId(newStep.id);
  };

  const handlePatchStep = (stepId: string, patch: Partial<Step>) => {
    const updated = activeModule.steps.map(s => s.id === stepId ? { ...s, ...patch } : s);
    onUpdateModuleSteps(updated);
  };

  const handleTypeChange = (stepId: string, newType: StepType) => {
    const updated = activeModule.steps.map(s => 
      s.id === stepId ? {
        ...s,
        type: newType,
        ...(newType === 'video_simulation' && !s.mediaMode ? { mediaMode: 'both' as MediaMode, subStepCount: 3 } : {}),
        ...(newType === 'saraswati' && !s.miniSteps ? { miniSteps: [], definitionEn: '' } : {}),
        ...(newType === 'anveshana' && !s.questionPool ? { pool: [], questionPool: [], questionsPerAttempt: 5, passingScore: 4 } : {})
      } : s
    );
    onUpdateModuleSteps(updated);
  };

  const previewStep = activeModule.steps.length > 0
    ? (activeModule.steps.find(s => s.id === activeEditStepId) || activeModule.steps[0])
    : null;

  return (
    <div className="space-y-6">
      {/* Top Tab Selector */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('steps')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            activeTab === 'steps' ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30' : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Steps ({activeModule.steps.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shabdakosha')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            activeTab === 'shabdakosha' ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30' : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Shabdakosha {activeModule.keyTermsRecap?.enabled ? `(${activeModule.keyTermsRecap.terms.length})` : ''}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            activeTab === 'audio' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>Audio Podcast {activeModule.audioOverview?.enabled ? '●' : ''}</span>
        </button>

        {isHistoryChapter && (
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeTab === 'timeline' ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30' : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Kālachakra Timeline {activeModule.timelineReel?.enabled ? '●' : ''}</span>
          </button>
        )}
      </div>

      {activeTab === 'steps' && (
        <div className="glass-panel border border-white/5 bg-black/40 p-6 rounded-2xl space-y-6">
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Module Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Module ID</label>
                <input
                  type="text"
                  value={activeModule.id}
                  onChange={(e) => onUpdateModule({ id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Module Title</label>
                <input
                  type="text"
                  value={activeModule.title}
                  onChange={(e) => onUpdateModule({ title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Module Steps</h4>
              <select
                onChange={(e) => {
                  if (e.target.value === '') return;
                  handleAddStep(e.target.value as StepType);
                  e.target.value = '';
                }}
                className="px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-xs font-semibold text-[#d4af37] focus:outline-none focus:border-[#d4af37]/60 cursor-pointer"
              >
                <option value="">+ Add Step...</option>
                <optgroup label="Modern Pedagogical Steps">
                  <option value="video_simulation">Video & Simulation (Media Area)</option>
                  <option value="saraswati">Saraswati सयुक्तिक Builder</option>
                  <option value="anveshana">Anveshana Assessment (30-Q Pool)</option>
                </optgroup>
                <optgroup label="Legacy Steps">
                  <option value="concept">Concept Description</option>
                  <option value="simulation">Interactive Lab</option>
                  <option value="predict_quiz">Predictive Quiz</option>
                  <option value="heritage_connection">Vedic Heritage</option>
                </optgroup>
              </select>
            </div>

            <ModuleStepsList
              steps={activeModule.steps}
              activeEditStepId={activeEditStepId}
              onMoveStep={onMoveStep}
              onSetActiveEditStepId={onSetActiveEditStepId}
              onOpenFocusedEditor={onOpenFocusedEditor}
              onUpdateModuleSteps={onUpdateModuleSteps}
              onPatchStep={handlePatchStep}
              onTypeChange={handleTypeChange}
              onOpenBulkImport={onOpenBulkImport}
            />
          </div>
        </div>
      )}

      {activeTab === 'shabdakosha' && (
        <KeyTermsEditor
          keyTermsRecap={activeModule.keyTermsRecap}
          moduleTitle={activeModule.title}
          onChange={(updated: KeyTermsRecap) => onUpdateModule({ keyTermsRecap: updated })}
        />
      )}

      {activeTab === 'audio' && (
        <AudioOverviewManager
          audioOverview={activeModule.audioOverview}
          moduleTitle={activeModule.title}
          onChange={(updated: AudioOverview) => onUpdateModule({ audioOverview: updated })}
        />
      )}

      {activeTab === 'timeline' && isHistoryChapter && (
        <HistoryTimelineBuilder
          timelineReel={activeModule.timelineReel}
          currentModuleId={activeModule.id}
          currentModuleTitle={activeModule.title}
          onChange={(updated: TimelineReel) => onUpdateModule({ timelineReel: updated })}
        />
      )}

      <div className="h-[480px]">
        <DigitalTwinPreview
          step={previewStep}
          moduleTitle={activeModule?.title}
        />
      </div>
    </div>
  );
}
