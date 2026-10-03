'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCurriculumManager } from '../hooks/useCurriculumManager';
import { CurriculumDataSourceBar } from './CurriculumDataSourceBar';
import { CurriculumFilterBar } from './CurriculumFilterBar';
import { CbseChaptersSidebar } from './CbseChaptersSidebar';
import { CbseChapterDetailPanel } from './CbseChapterDetailPanel';
import { CbsePyqEditorPanel } from './CbsePyqEditorPanel';
import { CbseModuleEditorPanel } from './CbseModuleEditorPanel';
import { CurriculumPublishFooter } from './CurriculumPublishFooter';
import {
  CurriculumFilterState,
  DEFAULT_CURRICULUM_FILTERS,
  filterChapters
} from '../utils/curriculumFilterUtils';
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

  const {
    chapters, setChapters, selectedChapterId, setSelectedChapterId,
    selectedModuleId, setSelectedModuleId, editingPyqId, setEditingPyqId,
    activeEditStepId, setActiveEditStepId, isLoadingCbse, cbseLoadError,
    curriculumSource, isPublishing, isSavingDraft,
    publishStatus, publishSuccessMessage, publishErrorMessage, validationErrors, publishCooldown,
    hasUnsavedDraft, lastSyncTime, activeChapter, activeModule,
    loadCbseData, handleSeedCanonical, handleRestoreDraft, handleDiscardDraft,
    handleExportJson, handleImportJson, handleSaveDraft, handlePublishCbse,
    moveChapter, moveModule, moveStep, updateActiveChapter,
    updateActiveModule, updateActiveModuleSteps
  } = manager;

  // Filter chapters according to 3-level Board > Grade > Discipline taxonomic filter
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
    } else {
      const isVisible = filteredChapters.some(c => c.id === selectedChapterId);
      if (!isVisible) {
        setSelectedChapterId(filteredChapters[0].id);
        setSelectedModuleId(filteredChapters[0].modules?.[0]?.id || null);
      }
    }
  }, [filteredChapters, selectedChapterId, setSelectedChapterId, setSelectedModuleId]);

  // Filter-aware chapter addition to ensure created chapter matches active view
  const handleAddFilteredChapter = () => {
    const newId = `chapter_${Date.now()}`;
    const inheritedBoard = filters.board !== 'all' ? filters.board : 'cbse';
    const inheritedGrade = filters.grade !== 'all' ? Number(filters.grade) : undefined;
    const inheritedBranch = filters.discipline !== 'all'
      ? (filters.discipline.replace('disc_', '') || 'physics')
      : 'physics';
    const inheritedDisc = filters.discipline !== 'all' ? [filters.discipline] : undefined;

    const newCh: Chapter = {
      id: newId,
      title: 'New Chapter Title',
      branchId: inheritedBranch,
      board: inheritedBoard,
      grade: inheritedGrade,
      applicableGrades: inheritedGrade !== undefined ? [inheritedGrade] : undefined,
      disciplineIds: inheritedDisc,
      modules: [],
      pyqs: []
    };

    setChapters([...(chapters || []), newCh]);
    setSelectedChapterId(newId);
    setSelectedModuleId(null);
  };

  return (
    <div className="space-y-6">
      <CurriculumDataSourceBar
        currentSource={curriculumSource}
        onSourceChange={(source) => loadCbseData(source)}
        isLoading={isLoadingCbse}
        onRefresh={() => loadCbseData(curriculumSource)}
        chaptersCount={chapters?.length || 0}
        modulesCount={chapters?.reduce((acc, ch) => acc + ch.modules.length, 0) || 0}
        stepsCount={chapters?.reduce((acc, ch) => acc + ch.modules.reduce((mAcc, m) => mAcc + m.steps.length, 0), 0) || 0}
        lastSyncTime={lastSyncTime}
        onSeedCanonical={handleSeedCanonical}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        hasUnsavedDraft={hasUnsavedDraft}
        onRestoreDraft={handleRestoreDraft}
        onDiscardDraft={handleDiscardDraft}
      />

      {chapters && (
        <CurriculumFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={() => setFilters(DEFAULT_CURRICULUM_FILTERS)}
          totalChaptersCount={chapters.length}
          filteredChaptersCount={filteredChapters.length}
          filteredModulesCount={filteredModulesCount}
        />
      )}

      {cbseLoadError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center justify-between">
          <span>Failed to load curriculum: {cbseLoadError}</span>
          <button type="button" onClick={() => loadCbseData('canonical')} className="underline font-bold ml-2">Load Bundled Canonical</button>
        </div>
      )}

      {chapters && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <CbseChaptersSidebar
            chapters={filteredChapters}
            allChapters={chapters}
            selectedChapterId={selectedChapterId}
            onSelectChapter={(id) => { setSelectedChapterId(id); setSelectedModuleId(null); setEditingPyqId(null); }}
            onAddChapter={handleAddFilteredChapter}
            onMoveChapter={moveChapter}
            onRequestDeleteChapter={(ch) => onRequestDelete({
              type: 'chapter', name: ch.title,
              onConfirm: () => {
                setChapters(chapters.filter(c => c.id !== ch.id));
                if (selectedChapterId === ch.id) setSelectedChapterId(null);
              }
            })}
          />

          {activeChapter && isSelectedVisible ? (
            <CbseChapterDetailPanel
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
              onSelectModule={(id) => { setSelectedModuleId(id); setEditingPyqId(null); }}
              onAddModule={handleAddModule}
              onMoveModule={(idx, dir) => moveModule(activeChapter.id, idx, dir)}
              onRequestDeleteModule={(mod) => onRequestDelete({
                type: 'module', name: mod.title,
                onConfirm: () => {
                  updateActiveChapter({ modules: activeChapter.modules.filter(m => m.id !== mod.id) });
                  if (selectedModuleId === mod.id) setSelectedModuleId(null);
                }
              })}
            />
          ) : (
            <div className="xl:col-span-4 glass-panel border border-white/5 bg-black/40 p-8 rounded-2xl text-center text-gray-500 text-xs">
              {filteredChapters.length === 0
                ? 'No chapters match current filter criteria. Adjust filters or reset to view chapters.'
                : 'Select a chapter to manage modules.'}
            </div>
          )}

          <div className="xl:col-span-5 space-y-6">
            {activeChapter && isSelectedVisible && editingPyqId === 'pyq_list' ? (
              <CbsePyqEditorPanel
                activeChapter={activeChapter}
                onAddPyq={handleAddPyq}
                onDeletePyq={(pyqId) => updateActiveChapter({ pyqs: (activeChapter.pyqs || []).filter(p => p.id !== pyqId) })}
                onUpdatePyq={(pyqId, patch) => updateActiveChapter({
                  pyqs: (activeChapter.pyqs || []).map(p => p.id === pyqId ? { ...p, ...patch } : p)
                })}
              />
            ) : activeModule && activeChapter && isSelectedVisible ? (
              <CbseModuleEditorPanel
                activeChapter={activeChapter}
                activeModule={activeModule}
                activeEditStepId={activeEditStepId}
                onUpdateModule={updateActiveModule}
                onUpdateModuleSteps={updateActiveModuleSteps}
                onSetActiveEditStepId={setActiveEditStepId}
                onOpenFocusedEditor={onOpenFocusedEditor}
                onOpenBulkImport={onOpenBulkImport}
                onMoveStep={(idx, dir) => moveStep(activeChapter.id, activeModule.id, idx, dir)}
              />
            ) : (
              <div className="glass-panel border border-white/5 bg-black/40 p-8 rounded-2xl text-center text-gray-500 text-xs">
                {filteredChapters.length === 0
                  ? 'No chapter selected.'
                  : 'Select a module from the list to edit its pedagogical steps.'}
              </div>
            )}
          </div>
        </div>
      )}

      {chapters && (
        <CurriculumPublishFooter
          isPublishing={isPublishing}
          isSavingDraft={isSavingDraft}
          publishCooldown={publishCooldown}
          publishStatus={publishStatus}
          publishSuccessMessage={publishSuccessMessage}
          publishErrorMessage={publishErrorMessage}
          validationErrors={validationErrors}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublishCbse}
          currentSource={curriculumSource}
        />
      )}
    </div>
  );
}
