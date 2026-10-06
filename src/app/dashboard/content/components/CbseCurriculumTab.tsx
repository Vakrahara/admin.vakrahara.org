'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCurriculumManager } from '../hooks/useCurriculumManager';
import { CurriculumUnifiedHeader } from './CurriculumUnifiedHeader';
import { CurriculumSourceModal } from './CurriculumSourceModal';
import { CbseCurriculumExplorer } from './CbseCurriculumExplorer';
import { CbseChapterOverviewWorkspace } from './CbseChapterOverviewWorkspace';
import { CbseModuleStudioWorkspace } from './CbseModuleStudioWorkspace';
import { CurriculumPublishFooter } from './CurriculumPublishFooter';
import {
  CurriculumFilterState,
  DEFAULT_CURRICULUM_FILTERS,
  filterChapters
} from '../utils/curriculumFilterUtils';
import { createFilteredChapter, createChildModule } from '../utils/curriculumMutations';
import { Chapter } from '@/types/curriculum';

interface CbseCurriculumTabProps {
  manager: ReturnType<typeof useCurriculumManager>;
  showReadinessMatrix: boolean;
  setShowReadinessMatrix: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddChapter: () => void;
  handleAddModule: () => void;
  handleAddPyq: () => void;
  onOpenBulkImport: () => void;
  onOpenVersionHistory: () => void;
  onOpenFocusedEditor: (stepId: string) => void;
  onRequestDelete: (item: { type: 'chapter' | 'module' | 'step'; name: string; onConfirm: () => void }) => void;
}

export function CbseCurriculumTab({
  manager,
  showReadinessMatrix,
  setShowReadinessMatrix,
  handleAddChapter,
  handleAddModule,
  handleAddPyq,
  onOpenBulkImport,
  onOpenVersionHistory,
  onOpenFocusedEditor,
  onRequestDelete
}: CbseCurriculumTabProps) {
  const [filters, setFilters] = useState<CurriculumFilterState>(DEFAULT_CURRICULUM_FILTERS);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false);

  const {
    chapters, setChapters, selectedChapterId, setSelectedChapterId,
    selectedModuleId, setSelectedModuleId, editingPyqId, setEditingPyqId,
    activeEditStepId, setActiveEditStepId, isLoadingCbse, cbseLoadError,
    curriculumSource, isPublishing, isSavingDraft,
    publishStatus, publishSuccessMessage, publishErrorMessage, validationErrors, publishCooldown,
    hasUnsavedDraft, lastSyncTime, activeChapter, activeModule, isDirty,
    loadCbseData, handleSeedCanonical, handleRestoreDraft, handleDiscardDraft,
    handleDiscardChanges, handleExportJson, handleImportJson, handleSaveDraft,
    handleExplicitSave, handlePublishCbse,
    moveChapter, moveModule, moveStep, updateActiveChapter,
    updateActiveModule, updateActiveModuleSteps
  } = manager;

  // Filter chapters according to 3-level Board > Grade > Discipline taxonomy
  const filteredChapters = useMemo(() => {
    if (!chapters) return [];
    return filterChapters(chapters, filters);
  }, [chapters, filters]);

  const filteredModulesCount = useMemo(() => {
    return filteredChapters.reduce((acc, ch) => acc + (ch.modules?.length || 0), 0);
  }, [filteredChapters]);

  const isSelectedVisible = useMemo(() => {
    return filteredChapters.some(c => c.id === selectedChapterId);
  }, [filteredChapters, selectedChapterId]);

  // Synchronize selection if filtered chapters empty or currently selected is hidden
  useEffect(() => {
    if (filteredChapters.length === 0) {
      if (selectedChapterId !== null) {
        setSelectedChapterId(null);
        setSelectedModuleId(null);
      }
    } else if (!filteredChapters.some(c => c.id === selectedChapterId)) {
      setSelectedChapterId(filteredChapters[0].id);
      setSelectedModuleId(null);
    }
  }, [filteredChapters, selectedChapterId, setSelectedChapterId, setSelectedModuleId]);

  // Filter-aware chapter addition ensuring created chapter matches active view
  const handleAddFilteredChapter = () => {
    const newCh = createFilteredChapter(filters);
    setChapters([...(chapters || []), newCh]);
    setSelectedChapterId(newCh.id);
    setSelectedModuleId(null);
    setActiveEditStepId(null);
  };

  // Add module directly to any specific chapter without stale activeChapter race conditions
  const handleAddModuleToChapter = (chId: string) => {
    if (!chapters) return;
    const targetChapter = chapters.find(c => c.id === chId);
    if (!targetChapter) return;

    const newMod = createChildModule(targetChapter, filters);
    setChapters(chapters.map(c => c.id === chId ? {
      ...c,
      modules: [...(c.modules || []), newMod]
    } : c));
    setSelectedChapterId(chId);
    setSelectedModuleId(newMod.id);
    setEditingPyqId(null);
    setActiveEditStepId(null);
  };

  const totalStepsCount = useMemo(() => {
    return chapters?.reduce((acc, ch) => 
      acc + (ch.modules || []).reduce((mAcc, m) => mAcc + (m.steps?.length || 0), 0), 0) || 0;
  }, [chapters]);

  return (
    <div className="space-y-6">
      {/* Consolidated Top Utility Header (§R1) */}
      <CurriculumUnifiedHeader
        currentSource={curriculumSource}
        isLoading={isLoadingCbse}
        hasUnsavedDraft={hasUnsavedDraft}
        chaptersCount={chapters?.length || 0}
        modulesCount={chapters?.reduce((acc, ch) => acc + (ch.modules?.length || 0), 0) || 0}
        stepsCount={totalStepsCount}
        filteredChaptersCount={filteredChapters.length}
        filteredModulesCount={filteredModulesCount}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(DEFAULT_CURRICULUM_FILTERS)}
        onOpenSourceModal={() => setIsSourceModalOpen(true)}
        onRefresh={() => loadCbseData(curriculumSource)}
      />

      {cbseLoadError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center justify-between">
          <span>Failed to load curriculum: {cbseLoadError}</span>
          <button type="button" onClick={() => loadCbseData('canonical')} className="underline font-bold ml-2">Load Bundled Canonical</button>
        </div>
      )}

      {/* Master-Detail 2-Panel Studio Layout (§R2) */}
      {chapters && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Panel: Unified Collapsible Curriculum Explorer Tree (~30%) */}
          <div className={`transition-all duration-300 w-full ${isExplorerCollapsed ? 'lg:w-[56px] shrink-0' : 'lg:w-[320px] xl:w-[350px] shrink-0'}`}>
            <CbseCurriculumExplorer
              chapters={filteredChapters}
              allChapters={chapters}
              selectedChapterId={selectedChapterId}
              selectedModuleId={selectedModuleId}
              onSelectChapter={(id) => { setSelectedChapterId(id); setSelectedModuleId(null); setEditingPyqId(null); setActiveEditStepId(null); }}
              onSelectModule={(chId, modId) => { setSelectedChapterId(chId); setSelectedModuleId(modId); setEditingPyqId(null); setActiveEditStepId(null); }}
              onAddChapter={handleAddFilteredChapter}
              onAddModuleToChapter={handleAddModuleToChapter}
              onMoveChapter={moveChapter}
              onMoveModule={(chId, idx, dir) => moveModule(chId, idx, dir)}
              onRequestDeleteChapter={(ch) => onRequestDelete({
                type: 'chapter', name: ch.title,
                onConfirm: () => {
                  if (!chapters) return;
                  setChapters(chapters.filter(c => c.id !== ch.id));
                  if (selectedChapterId === ch.id) {
                    setSelectedChapterId(null);
                    setSelectedModuleId(null);
                  }
                }
              })}
              onRequestDeleteModule={(chId, mod) => onRequestDelete({
                type: 'module', name: mod.title,
                onConfirm: () => {
                  if (!chapters) return;
                  setChapters(chapters.map(c => c.id === chId ? {
                    ...c,
                    modules: (c.modules || []).filter(m => m.id !== mod.id)
                  } : c));
                  if (selectedModuleId === mod.id) setSelectedModuleId(null);
                }
              })}
              isCollapsed={isExplorerCollapsed}
              onToggleCollapse={() => setIsExplorerCollapsed(prev => !prev)}
            />
          </div>

          {/* Right Panel: Dedicated Spacious Workspace (~70%) */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {activeChapter && isSelectedVisible ? (
              selectedModuleId && activeModule ? (
                /* Module & Steps Studio (§R3) */
                <CbseModuleStudioWorkspace
                  activeChapter={activeChapter}
                  activeModule={activeModule}
                  activeEditStepId={activeEditStepId}
                  isDirty={isDirty}
                  isSaving={isSavingDraft}
                  onSave={handleExplicitSave}
                  onDiscard={handleDiscardChanges}
                  onUpdateModule={updateActiveModule}
                  onUpdateModuleSteps={updateActiveModuleSteps}
                  onSetActiveEditStepId={setActiveEditStepId}
                  onOpenFocusedEditor={onOpenFocusedEditor}
                  onOpenBulkImport={onOpenBulkImport}
                  onMoveStep={(idx, dir) => moveStep(activeChapter.id, activeModule.id, idx, dir)}
                  onBackToChapter={() => { setSelectedModuleId(null); setActiveEditStepId(null); }}
                  onRequestDeleteStep={(st) => onRequestDelete({
                    type: 'step', name: st.id,
                    onConfirm: () => {
                      updateActiveModuleSteps((activeModule.steps || []).filter(s => s.id !== st.id));
                      if (activeEditStepId === st.id) setActiveEditStepId(null);
                    }
                  })}
                />
              ) : (
                /* Chapter Overview & Management Workspace (§R3) */
                <CbseChapterOverviewWorkspace
                  activeChapter={activeChapter}
                  chapters={chapters}
                  selectedModuleId={selectedModuleId}
                  editingPyqId={editingPyqId}
                  showReadinessMatrix={showReadinessMatrix}
                  onToggleReadinessMatrix={() => setShowReadinessMatrix(prev => !prev)}
                  onTogglePyqMode={() => setEditingPyqId(prev => prev === 'pyq_list' ? null : 'pyq_list')}
                  onOpenBulkImport={onOpenBulkImport}
                  onOpenVersionHistory={onOpenVersionHistory}
                  onUpdateChapter={updateActiveChapter}
                  onSelectModule={(id) => { setSelectedModuleId(id); setEditingPyqId(null); setActiveEditStepId(null); }}
                  onAddModule={() => handleAddModuleToChapter(activeChapter.id)}
                  onMoveModule={(idx, dir) => moveModule(activeChapter.id, idx, dir)}
                  onRequestDeleteModule={(mod) => onRequestDelete({
                    type: 'module', name: mod.title,
                    onConfirm: () => {
                      if (!chapters) return;
                      setChapters(chapters.map(c => c.id === activeChapter.id ? {
                        ...c,
                        modules: (c.modules || []).filter(m => m.id !== mod.id)
                      } : c));
                      if (selectedModuleId === mod.id) setSelectedModuleId(null);
                    }
                  })}
                  onAddPyq={handleAddPyq}
                  onDeletePyq={(pyqId) => updateActiveChapter({ pyqs: (activeChapter.pyqs || []).filter(p => p.id !== pyqId) })}
                  onUpdatePyq={(pyqId, patch) => updateActiveChapter({
                    pyqs: (activeChapter.pyqs || []).map(p => p.id === pyqId ? { ...p, ...patch } : p)
                  })}
                />
              )
            ) : (
              <div className="glass-panel border border-white/5 bg-black/40 p-12 rounded-2xl text-center text-gray-400 text-xs">
                {filteredChapters.length === 0
                  ? 'No chapters match current filter criteria. Adjust filters or reset to view chapters.'
                  : 'Select a chapter or module from the Curriculum Explorer on the left.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Curriculum Publish & Save Footer */}
      {chapters && (
        <CurriculumPublishFooter
          isPublishing={isPublishing} isSavingDraft={isSavingDraft}
          publishCooldown={publishCooldown} publishStatus={publishStatus}
          publishSuccessMessage={publishSuccessMessage} publishErrorMessage={publishErrorMessage}
          validationErrors={validationErrors} onSaveDraft={handleSaveDraft}
          onPublish={handlePublishCbse} currentSource={curriculumSource}
        />
      )}

      {/* Consolidated Data & Source Modal (§R1) */}
      <CurriculumSourceModal
        isOpen={isSourceModalOpen} onClose={() => setIsSourceModalOpen(false)}
        currentSource={curriculumSource} onSourceChange={(src) => loadCbseData(src)}
        isLoading={isLoadingCbse} onRefresh={() => loadCbseData(curriculumSource)}
        onSeedCanonical={handleSeedCanonical} onExportJson={handleExportJson}
        onImportJson={handleImportJson} hasUnsavedDraft={hasUnsavedDraft}
        onRestoreDraft={handleRestoreDraft} onDiscardDraft={handleDiscardDraft}
        chaptersCount={chapters?.length || 0}
        modulesCount={chapters?.reduce((acc, ch) => acc + (ch.modules?.length || 0), 0) || 0}
        stepsCount={totalStepsCount} lastSyncTime={lastSyncTime}
      />
    </div>
  );
}
