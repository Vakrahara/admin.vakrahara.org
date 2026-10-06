'use client';

import React, { useState } from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { Module, Step, StepType, MediaMode, Chapter } from '@/types/curriculum';
import { DigitalTwinPreview } from './DigitalTwinPreview';
import { ModuleTriadDeck } from './ModuleTriadDeck';
import { CbseStudioStepCard } from './CbseStudioStepCard';
import { ModuleIdGeneratorModal } from './ModuleIdGeneratorModal';

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
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

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
      <div className="glass-panel border border-white/5 bg-black/40 p-6 rounded-2xl space-y-6">
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Module Editor
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">
                  Module ID
                </label>
                <button
                  type="button"
                  onClick={() => setIsIdModalOpen(true)}
                  className="text-[9px] text-[#d4af37] hover:text-[#facc15] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Auto-Generate Semantic ID"
                >
                  <Sparkles className="w-3 h-3 text-[#d4af37]" />
                  <span>✨ Auto-Generate / Edit ID</span>
                </button>
              </div>
              <input
                type="text"
                value={activeModule.id}
                onChange={(e) => onUpdateModule({ id: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
                Module Title
              </label>
              <input
                type="text"
                value={activeModule.title}
                onChange={(e) => onUpdateModule({ title: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
          </div>
        </div>

        {/* Step Cards List */}
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

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {activeModule.steps.map((step, sIndex) => {
              const isEditingStep = step.id === activeEditStepId;
              return (
                <CbseStudioStepCard
                  key={step.id}
                  step={step}
                  sIndex={sIndex}
                  totalSteps={activeModule.steps.length}
                  isEditingStep={isEditingStep}
                  onMoveStep={(dir) => onMoveStep(sIndex, dir)}
                  onOpenFocusedEditor={() => {
                    onSetActiveEditStepId(step.id);
                    onOpenFocusedEditor(step.id);
                  }}
                  onToggleEditing={() => onSetActiveEditStepId(isEditingStep ? null : step.id)}
                  onDeleteStep={() => {
                    if (confirm('Delete this step?')) {
                      onUpdateModuleSteps(activeModule.steps.filter(s => s.id !== step.id));
                    }
                  }}
                  onUpdateStepId={(newId) => {
                    const updated = activeModule.steps.map(s => s.id === step.id ? { ...s, id: newId } : s);
                    onUpdateModuleSteps(updated);
                    if (isEditingStep) onSetActiveEditStepId(newId);
                  }}
                  onPatchStep={(patch) => handlePatchStep(step.id, patch)}
                  onTypeChange={(newType) => handleTypeChange(step.id, newType)}
                  onOpenBulkImport={onOpenBulkImport}
                />
              );
            })}

            {activeModule.steps.length === 0 && (
              <div className="p-8 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
                No steps inside this module. Select from the dropdown to add.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vidyāpīṭha Pedagogical Triad (Shabdakosha, Audio Revisit, Kālachakra Timeline) */}
      <ModuleTriadDeck
        module={activeModule}
        onUpdateModule={onUpdateModule}
      />

      {/* Digital Twin Live Preview Panel */}
      <div className="h-[480px]">
        <DigitalTwinPreview
          step={previewStep}
          moduleTitle={activeModule?.title}
        />
      </div>

      {/* Semantic Module ID Auto-Generator Modal */}
      {isIdModalOpen && (
        <ModuleIdGeneratorModal
          isOpen={isIdModalOpen}
          onClose={() => setIsIdModalOpen(false)}
          activeChapter={activeChapter}
          activeModule={activeModule}
          onApplyId={(newId) => onUpdateModule({ id: newId })}
        />
      )}
    </div>
  );
}
