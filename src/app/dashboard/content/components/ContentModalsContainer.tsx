'use client';

import React from 'react';
import { R2Config } from '@/lib/r2-upload';
import { Chapter, Module, Step } from '@/types/curriculum';
import { SudoConfirmModal } from '@/components/ui/SudoConfirmModal';
import { R2SettingsModal } from './R2SettingsModal';
import { BulkImportModal } from './BulkImportModal';
import { CurriculumVersionHistory } from './CurriculumVersionHistory';
import { FocusedStepEditorModal } from './FocusedStepEditorModal';

interface ContentModalsContainerProps {
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  r2Config: R2Config;
  onSaveR2Config: (cfg: R2Config) => void;
  pendingDelete: {
    type: 'chapter' | 'module' | 'step';
    name: string;
    onConfirm: () => void;
  } | null;
  onCloseDeleteModal: () => void;
  isBulkImportOpen: boolean;
  onCloseBulkImport: () => void;
  onImportBulkQuestions: (questions: any[]) => void;
  isVersionHistoryOpen: boolean;
  onCloseVersionHistory: () => void;
  onRollbackVersion: (version: any) => void;
  isFocusedEditorOpen: boolean;
  onCloseFocusedEditor: () => void;
  activeStep: Step | null;
  activeModuleTitle?: string;
  activeChapterTitle?: string;
  allSteps: Step[];
  onUpdateStep: (step: Step) => void;
  onSelectStepId: (stepId: string) => void;
  onOpenBulkImport: () => void;
}

export function ContentModalsContainer({
  isSettingsOpen,
  onCloseSettings,
  r2Config,
  onSaveR2Config,
  pendingDelete,
  onCloseDeleteModal,
  isBulkImportOpen,
  onCloseBulkImport,
  onImportBulkQuestions,
  isVersionHistoryOpen,
  onCloseVersionHistory,
  onRollbackVersion,
  isFocusedEditorOpen,
  onCloseFocusedEditor,
  activeStep,
  activeModuleTitle,
  activeChapterTitle,
  allSteps,
  onUpdateStep,
  onSelectStepId,
  onOpenBulkImport
}: ContentModalsContainerProps) {
  return (
    <>
      <R2SettingsModal
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        r2Config={r2Config}
        onSaveConfig={onSaveR2Config}
      />
      <SudoConfirmModal
        isOpen={!!pendingDelete}
        onClose={onCloseDeleteModal}
        onConfirm={() => pendingDelete?.onConfirm()}
        title={`Delete ${pendingDelete?.type || 'item'}`}
        description={`Permanently delete "${pendingDelete?.name || ''}"?`}
        isDangerous={true}
        requiredText="DELETE"
        confirmText="Delete Permanently"
        actionLabel="Delete Permanently"
      />
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={onCloseBulkImport}
        onImport={onImportBulkQuestions}
      />
      <CurriculumVersionHistory
        isOpen={isVersionHistoryOpen}
        onClose={onCloseVersionHistory}
        onRollback={onRollbackVersion}
      />
      <FocusedStepEditorModal
        isOpen={isFocusedEditorOpen}
        step={activeStep}
        moduleTitle={activeModuleTitle}
        chapterTitle={activeChapterTitle}
        allSteps={allSteps}
        onClose={onCloseFocusedEditor}
        onUpdateStep={onUpdateStep}
        onSelectStep={onSelectStepId}
        onOpenBulkImport={onOpenBulkImport}
      />
    </>
  );
}
