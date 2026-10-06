'use client';

import React, { useState } from 'react';
import { Layers, Plus, Sparkles } from 'lucide-react';
import { Module, Step, StepType, MediaMode, Chapter } from '@/types/curriculum';
import { 
  formatStepId, 
  deriveSimulationIdFromModuleId, 
  realignModuleStepIds 
} from '@/lib/semanticId';
import { DigitalTwinPreview } from './DigitalTwinPreview';
import { ModuleTriadDeck } from './ModuleTriadDeck';
import { AddStepTemplateModal } from './AddStepTemplateModal';
import { CbseStudioStepCard } from './CbseStudioStepCard';
import { ModuleIdGeneratorModal } from './ModuleIdGeneratorModal';
import { CbseStudioWorkspaceHeader } from './CbseStudioWorkspaceHeader';

interface CbseModuleStudioWorkspaceProps {
  activeChapter: Chapter;
  activeModule: Module;
  activeEditStepId: string | null;
  isDirty?: boolean;
  isSaving?: boolean;
  onSave?: () => Promise<void> | void;
  onDiscard?: () => void;
  onUpdateModule: (fields: Partial<Module>) => void;
  onUpdateModuleSteps: (steps: Step[]) => void;
  onSetActiveEditStepId: (stepId: string | null) => void;
  onOpenFocusedEditor: (stepId: string) => void;
  onOpenBulkImport: () => void;
  onMoveStep: (index: number, direction: 'up' | 'down') => void;
  onBackToChapter: () => void;
  onRequestDeleteStep?: (step: Step) => void;
}

export function CbseModuleStudioWorkspace({
  activeChapter,
  activeModule,
  activeEditStepId,
  isDirty = false,
  isSaving = false,
  onSave,
  onDiscard,
  onUpdateModule,
  onUpdateModuleSteps,
  onSetActiveEditStepId,
  onOpenFocusedEditor,
  onOpenBulkImport,
  onMoveStep,
  onBackToChapter,
  onRequestDeleteStep
}: CbseModuleStudioWorkspaceProps) {
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const steps = activeModule.steps || [];

  const handleAddStep = (type: StepType) => {
    const derivedSimId = deriveSimulationIdFromModuleId(activeModule.id);
    const stepId = formatStepId(activeModule.id, steps.length + 1);
    const newStep: Step = {
      type,
      id: stepId,
      ...(type === 'video_simulation' ? { mediaMode: 'both' as MediaMode, subStepCount: 3, videoUrl: '', simulationId: derivedSimId, transcript: [] } : {}),
      ...(type === 'saraswati' ? { miniSteps: [], definitionEn: '' } : {}),
      ...(type === 'anveshana' ? { pool: [], questionPool: [], questionsPerAttempt: 5, passingScore: 4 } : {}),
      ...(type === 'concept' ? { textDeva: '', textEng: '' } : {}),
      ...(type === 'simulation' ? { simulationId: derivedSimId, questionText: '' } : {}),
      ...(type === 'predict_quiz' ? { question: '', options: ['', ''], correctOptionIndex: 0, explanation: '', hints: [''] } : {}),
      ...(type === 'heritage_connection' ? { title: '', sutra: '', translation: '', significance: '' } : {})
    };
    onUpdateModuleSteps([...steps, newStep]);
    onSetActiveEditStepId(newStep.id);
  };

  const handleRealignAllStepIds = () => {
    const { updatedModule, changedCount } = realignModuleStepIds(activeModule);
    if (changedCount > 0) {
      onUpdateModule(updatedModule);
    }
  };

  const handleApplyModuleId = (newId: string, cascadeSteps?: boolean) => {
    if (cascadeSteps) {
      const { updatedModule } = realignModuleStepIds({ ...activeModule, id: newId });
      onUpdateModule(updatedModule);
    } else {
      onUpdateModule({ id: newId });
    }
  };


  const handlePatchStep = (stepId: string, patch: Partial<Step>) => {
    onUpdateModuleSteps(steps.map(s => s.id === stepId ? { ...s, ...patch } : s));
  };

  const handleTypeChange = (stepId: string, newType: StepType) => {
    onUpdateModuleSteps(steps.map(s => s.id === stepId ? {
      ...s,
      type: newType,
      ...(newType === 'video_simulation' && !s.mediaMode ? { mediaMode: 'both' as MediaMode, subStepCount: 3 } : {}),
      ...(newType === 'saraswati' && !s.miniSteps ? { miniSteps: [], definitionEn: '' } : {}),
      ...(newType === 'anveshana' && !s.questionPool ? { pool: [], questionPool: [], questionsPerAttempt: 5, passingScore: 4 } : {})
    } : s));
  };

  const previewStep = steps.length > 0 ? (steps.find(s => s.id === activeEditStepId) || steps[0]) : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Contextual Navigation Bar & Persistence Actions (§R1–§R3) */}
      <CbseStudioWorkspaceHeader
        activeChapter={activeChapter}
        activeModule={activeModule}
        stepsCount={steps.length}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={onSave}
        onDiscard={onDiscard}
        onBackToChapter={onBackToChapter}
      />

      {/* Main Studio Card */}
      <div className="glass-panel border border-white/5 bg-black/40 p-6 rounded-2xl space-y-6">
        {/* Module Identity Form */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-[#d4af37] uppercase tracking-wider flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4" />
            Module &amp; Steps Studio
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">
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
                className="w-full px-3 py-2 bg-[#08080c] border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1 font-mono">
                Module Title
              </label>
              <input
                type="text"
                value={activeModule.title}
                onChange={(e) => onUpdateModule({ title: e.target.value, titleEn: e.target.value })}
                className="w-full px-3 py-2 bg-[#08080c] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
          </div>
        </div>

        {/* Steps List Manifest */}
        <div className="space-y-4 border-t border-white/5 pt-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-sm text-gray-300 uppercase tracking-wider font-mono">
              Pedagogical Steps ({steps.length})
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRealignAllStepIds}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#d4af37]/40 text-[#d4af37] rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Re-align all step IDs to canonical format (<module_id>_stp_NN)"
              >
                <Sparkles className="w-3 h-3" />
                <span>✨ Re-align Step IDs</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddStepModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#d4af37] to-amber-500 hover:brightness-110 text-black rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {steps.map((step, sIndex) => (
              <CbseStudioStepCard
                key={step.id}
                step={step}
                sIndex={sIndex}
                totalSteps={steps.length}
                isEditingStep={step.id === activeEditStepId}
                activeModuleId={activeModule.id}
                onMoveStep={(dir) => onMoveStep(sIndex, dir)}
                onOpenFocusedEditor={() => {
                  onSetActiveEditStepId(step.id);
                  onOpenFocusedEditor(step.id);
                }}
                onToggleEditing={() => onSetActiveEditStepId(step.id === activeEditStepId ? null : step.id)}
                onDeleteStep={() => {
                  if (onRequestDeleteStep) {
                    onRequestDeleteStep(step);
                  } else if (confirm('Delete this step?')) {
                    onUpdateModuleSteps(steps.filter(s => s.id !== step.id));
                  }
                }}
                onUpdateStepId={(newId) => {
                  onUpdateModuleSteps(steps.map(s => s.id === step.id ? { ...s, id: newId } : s));
                  if (step.id === activeEditStepId) onSetActiveEditStepId(newId);
                }}
                onPatchStep={(patch) => handlePatchStep(step.id, patch)}
                onTypeChange={(newType) => handleTypeChange(step.id, newType)}
                onOpenBulkImport={onOpenBulkImport}
              />
            ))}

            {steps.length === 0 && (
              <div className="p-8 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
                No steps in this module. Click &apos;Add Step&apos; to create one.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vidyāpīṭha Pedagogical Triad */}
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

      {/* Accessible Step Template Picker Modal */}
      <AddStepTemplateModal
        isOpen={isAddStepModalOpen}
        onClose={() => setIsAddStepModalOpen(false)}
        onSelectType={handleAddStep}
      />

      {/* Semantic Module ID Auto-Generator Modal */}
      {isIdModalOpen && (
        <ModuleIdGeneratorModal
          isOpen={isIdModalOpen}
          onClose={() => setIsIdModalOpen(false)}
          activeChapter={activeChapter}
          activeModule={activeModule}
          onApplyId={handleApplyModuleId}
        />
      )}
    </div>
  );
}
