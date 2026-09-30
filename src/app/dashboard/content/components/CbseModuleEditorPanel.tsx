'use client';

import React from 'react';
import { 
  Layers, 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { Module, Step, StepType, MediaMode, Chapter } from '@/types/curriculum';
import { CbseInlineStepEditor } from './CbseInlineStepEditor';
import { DigitalTwinPreview } from './DigitalTwinPreview';

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
                <div key={step.id} className="p-4 bg-[#08080c] border border-white/5 rounded-xl space-y-4 relative group">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#d4af37]/5 border border-[#d4af37]/20 text-[9px] font-bold text-[#d4af37] rounded-md uppercase tracking-wider">
                      {step.type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onMoveStep(sIndex, 'up')}
                        disabled={sIndex === 0}
                        className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveStep(sIndex, 'down')}
                        disabled={sIndex === activeModule.steps.length - 1}
                        className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSetActiveEditStepId(step.id);
                          onOpenFocusedEditor(step.id);
                        }}
                        className="p-1 text-gray-400 hover:text-[#d4af37] transition-colors cursor-pointer"
                        title="Open Full-Screen Focused Step Editor"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetActiveEditStepId(isEditingStep ? null : step.id)}
                        className={`p-1 transition-colors cursor-pointer ${isEditingStep ? 'text-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37]'}`}
                        title={isEditingStep ? "Collapse Step Details" : "Expand Inline Step Details"}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this step?')) {
                            onUpdateModuleSteps(activeModule.steps.filter(s => s.id !== step.id));
                          }
                        }}
                        className="p-0.5 text-gray-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Step ID</label>
                    <input
                      type="text"
                      value={step.id}
                      onChange={(e) => {
                        const newId = e.target.value;
                        const updated = activeModule.steps.map(s => s.id === step.id ? { ...s, id: newId } : s);
                        onUpdateModuleSteps(updated);
                        if (isEditingStep) onSetActiveEditStepId(newId);
                      }}
                      className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        onSetActiveEditStepId(step.id);
                        onOpenFocusedEditor(step.id);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-[#d4af37] text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
                      title="Open full-screen focused pedagogical editor"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Edit Step (Focus Editor)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetActiveEditStepId(isEditingStep ? null : step.id)}
                      className="text-[10px] text-gray-500 hover:text-gray-300 text-center transition-colors cursor-pointer"
                    >
                      {isEditingStep ? '▲ Collapse Quick View' : '▼ Expand Quick Inline View'}
                    </button>
                  </div>

                  {isEditingStep && (
                    <CbseInlineStepEditor
                      step={step}
                      onUpdateStep={(patch) => handlePatchStep(step.id, patch)}
                      onTypeChange={(newType) => handleTypeChange(step.id, newType)}
                      onOpenBulkImport={onOpenBulkImport}
                    />
                  )}
                </div>
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

      {/* Digital Twin Live Preview Panel */}
      <div className="h-[480px]">
        <DigitalTwinPreview
          step={previewStep}
          moduleTitle={activeModule?.title}
        />
      </div>
    </div>
  );
}
