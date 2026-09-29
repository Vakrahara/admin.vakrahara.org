'use client';

import { useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { R2Config } from '@/lib/r2-upload';
import { Chapter, Module, Step, Pyq } from '@/types/curriculum';
import { useCurriculumManager } from './hooks/useCurriculumManager';
import { CurriculumDataSourceBar } from './components/CurriculumDataSourceBar';
import { CbseChaptersSidebar } from './components/CbseChaptersSidebar';
import { CbseChapterDetailPanel } from './components/CbseChapterDetailPanel';
import { CbsePyqEditorPanel } from './components/CbsePyqEditorPanel';
import { CbseModuleEditorPanel } from './components/CbseModuleEditorPanel';
import { CurriculumPublishFooter } from './components/CurriculumPublishFooter';
import { PaninianSutraVaultTab } from './components/PaninianSutraVaultTab';
import { ShabdakoshTab } from './components/ShabdakoshTab';
import { VaultDatabaseTab } from './components/VaultDatabaseTab';
import { ContentModalsContainer } from './components/ContentModalsContainer';

export default function ContentCMSPage() {
  const [activeTab, setActiveTab] = useState<'sutras' | 'dict' | 'vault' | 'cbse'>('cbse');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isFocusedEditorOpen, setIsFocusedEditorOpen] = useState(false);
  const [showReadinessMatrix, setShowReadinessMatrix] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ type: 'chapter' | 'module' | 'step'; name: string; onConfirm: () => void } | null>(null);

  const [r2Config, setR2Config] = useState<R2Config>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vakrahara_r2_config');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return {
      accountId: '', bucketName: '', accessKeyId: '',
      secretAccessKey: '', region: 'auto', customDomain: 'https://cdn.vakrahara.org/v1'
    };
  });

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
    updateActiveModule, updateActiveModuleSteps, handleUpdateStep
  } = useCurriculumManager(r2Config);

  const handleSaveR2Config = (cfg: R2Config) => {
    setR2Config(cfg);
    if (typeof window !== 'undefined') localStorage.setItem('vakrahara_r2_config', JSON.stringify(cfg));
    setIsSettingsOpen(false);
    loadCbseData('cdn');
  };

  const handleAddChapter = () => {
    const newId = `chapter_${Date.now()}`;
    const newCh: Chapter = { id: newId, title: 'New Chapter Title', branchId: 'physics', modules: [], pyqs: [] };
    setChapters([...(chapters || []), newCh]);
    setSelectedChapterId(newId);
  };

  const handleAddModule = () => {
    if (!activeChapter) return;
    const newModId = `module_${Date.now()}`;
    updateActiveChapter({ modules: [...activeChapter.modules, { id: newModId, title: 'New Module Title', steps: [] }] });
    setSelectedModuleId(newModId);
  };

  const handleAddPyq = () => {
    if (!activeChapter) return;
    const newPyq: Pyq = {
      id: `pyq_${Date.now()}`, year: 'CBSE 2026', marks: '3 Marks',
      question: 'Write question here...', sampleAnswer: 'Write sample answer here...',
      markingScheme: 'Describe marking points...', relatedModuleIds: []
    };
    updateActiveChapter({ pyqs: [...(activeChapter.pyqs || []), newPyq] });
  };

  const handleBulkImport = (importedQuestions: any[]) => {
    if (!activeModule) return;
    const anveshanaStep = activeModule.steps.find(s => s.type === 'anveshana');
    if (anveshanaStep) {
      const combined = [...(anveshanaStep.pool || []), ...importedQuestions];
      updateActiveModuleSteps(activeModule.steps.map(s => s.id === anveshanaStep.id ? { ...s, pool: combined, questionPool: combined } : s));
    } else {
      const newStep: Step = { id: `anveshana_${Date.now()}`, type: 'anveshana', pool: importedQuestions, questionPool: importedQuestions, questionsPerAttempt: 5, passingScore: 4 };
      updateActiveModuleSteps([...activeModule.steps, newStep]);
    }
    setIsBulkImportOpen(false);
  };

  return (
    <>
      <div className="space-y-8 animate-fadeIn text-white pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold serif-text text-white tracking-wide">Curriculum CMS</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage static academic resources, dictionary FTS databases, and CBSE learning modules.
            </p>
          </div>
          {activeTab === 'cbse' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-300 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                CDN Settings
              </button>
              <button
                type="button"
                onClick={() => loadCbseData('cdn')}
                disabled={isLoadingCbse}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-300 font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
              >
                <Loader2 className={`w-4 h-4 ${isLoadingCbse ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-white/5 space-x-6 text-sm overflow-x-auto whitespace-nowrap">
          {(['cbse', 'sutras', 'dict', 'vault'] as const).map(tabKey => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={`pb-4 font-semibold transition-all relative cursor-pointer ${activeTab === tabKey ? 'text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
            >
              {activeTab === tabKey && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />}
              {tabKey === 'cbse' && 'CBSE Curriculum'}
              {tabKey === 'sutras' && 'Paninian Sutra Vault'}
              {tabKey === 'dict' && 'Shabdakosh (Dictionary)'}
              {tabKey === 'vault' && 'Vault Database (R2 Publish)'}
            </button>
          ))}
        </div>

        {/* CBSE Tab Panel */}
        {activeTab === 'cbse' && (
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

            {cbseLoadError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center justify-between">
                <span>Failed to load curriculum: {cbseLoadError}</span>
                <button type="button" onClick={() => loadCbseData('canonical')} className="underline font-bold ml-2">Load Bundled Canonical</button>
              </div>
            )}

            {chapters && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <CbseChaptersSidebar
                  chapters={chapters}
                  selectedChapterId={selectedChapterId}
                  onSelectChapter={(id) => { setSelectedChapterId(id); setSelectedModuleId(null); setEditingPyqId(null); }}
                  onAddChapter={handleAddChapter}
                  onMoveChapter={moveChapter}
                  onRequestDeleteChapter={(ch) => setPendingDelete({
                    type: 'chapter', name: ch.title,
                    onConfirm: () => {
                      setChapters(chapters.filter(c => c.id !== ch.id));
                      if (selectedChapterId === ch.id) setSelectedChapterId(null);
                      setPendingDelete(null);
                    }
                  })}
                />

                {activeChapter ? (
                  <CbseChapterDetailPanel
                    activeChapter={activeChapter}
                    chapters={chapters}
                    selectedModuleId={selectedModuleId}
                    editingPyqId={editingPyqId}
                    showReadinessMatrix={showReadinessMatrix}
                    onToggleReadinessMatrix={() => setShowReadinessMatrix(prev => !prev)}
                    onTogglePyqMode={() => setEditingPyqId(prev => prev === 'pyq_list' ? null : 'pyq_list')}
                    onOpenBulkImport={() => setIsBulkImportOpen(true)}
                    onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
                    onUpdateChapter={updateActiveChapter}
                    onSelectModule={(id) => { setSelectedModuleId(id); setEditingPyqId(null); }}
                    onAddModule={handleAddModule}
                    onMoveModule={(idx, dir) => moveModule(activeChapter.id, idx, dir)}
                    onRequestDeleteModule={(mod) => setPendingDelete({
                      type: 'module', name: mod.title,
                      onConfirm: () => {
                        updateActiveChapter({ modules: activeChapter.modules.filter(m => m.id !== mod.id) });
                        if (selectedModuleId === mod.id) setSelectedModuleId(null);
                        setPendingDelete(null);
                      }
                    })}
                  />
                ) : (
                  <div className="xl:col-span-4 glass-panel border border-white/5 bg-black/40 p-8 rounded-2xl text-center text-gray-500 text-xs">
                    Select a chapter to manage modules.
                  </div>
                )}

                <div className="xl:col-span-5 space-y-6">
                  {activeChapter && editingPyqId === 'pyq_list' ? (
                    <CbsePyqEditorPanel
                      activeChapter={activeChapter}
                      onAddPyq={handleAddPyq}
                      onDeletePyq={(pyqId) => updateActiveChapter({ pyqs: (activeChapter.pyqs || []).filter(p => p.id !== pyqId) })}
                      onUpdatePyq={(pyqId, patch) => updateActiveChapter({
                        pyqs: (activeChapter.pyqs || []).map(p => p.id === pyqId ? { ...p, ...patch } : p)
                      })}
                    />
                  ) : activeModule && activeChapter ? (
                    <CbseModuleEditorPanel
                      activeChapter={activeChapter}
                      activeModule={activeModule}
                      activeEditStepId={activeEditStepId}
                      onUpdateModule={updateActiveModule}
                      onUpdateModuleSteps={updateActiveModuleSteps}
                      onSetActiveEditStepId={setActiveEditStepId}
                      onOpenFocusedEditor={(stepId) => { setActiveEditStepId(stepId); setIsFocusedEditorOpen(true); }}
                      onOpenBulkImport={() => setIsBulkImportOpen(true)}
                      onMoveStep={(idx, dir) => moveStep(activeChapter.id, activeModule.id, idx, dir)}
                    />
                  ) : (
                    <div className="glass-panel border border-white/5 bg-black/40 p-8 rounded-2xl text-center text-gray-500 text-xs">
                      Select a module from the list to edit its pedagogical steps.
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
        )}

        {activeTab === 'sutras' && <PaninianSutraVaultTab />}
        {activeTab === 'dict' && <ShabdakoshTab />}
        {activeTab === 'vault' && <VaultDatabaseTab />}
      </div>

      <ContentModalsContainer
        isSettingsOpen={isSettingsOpen} onCloseSettings={() => setIsSettingsOpen(false)}
        r2Config={r2Config} onSaveR2Config={handleSaveR2Config}
        pendingDelete={pendingDelete} onCloseDeleteModal={() => setPendingDelete(null)}
        isBulkImportOpen={isBulkImportOpen} onCloseBulkImport={() => setIsBulkImportOpen(false)}
        onImportBulkQuestions={handleBulkImport}
        isVersionHistoryOpen={isVersionHistoryOpen} onCloseVersionHistory={() => setIsVersionHistoryOpen(false)}
        onRollbackVersion={(v) => {
          if (v.beforeData && confirm(`Roll back to ${v.timestamp}?`)) {
            setChapters(v.beforeData as Chapter[]);
            setIsVersionHistoryOpen(false);
          }
        }}
        isFocusedEditorOpen={isFocusedEditorOpen} onCloseFocusedEditor={() => setIsFocusedEditorOpen(false)}
        activeStep={activeModule?.steps.find(s => s.id === activeEditStepId) || null}
        activeModuleTitle={activeModule?.title} activeChapterTitle={activeChapter?.title}
        allSteps={activeModule?.steps || []} onUpdateStep={handleUpdateStep}
        onSelectStepId={setActiveEditStepId} onOpenBulkImport={() => setIsBulkImportOpen(true)}
      />
    </>
  );
}
