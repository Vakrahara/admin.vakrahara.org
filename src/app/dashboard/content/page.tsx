'use client';

import { useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { R2Config } from '@/lib/r2-upload';
import { Chapter, Step, Pyq } from '@/types/curriculum';
import { useCurriculumManager } from './hooks/useCurriculumManager';
import { patchModuleSteps, createChildModule } from './utils/curriculumMutations';
import { CbseCurriculumTab } from './components/CbseCurriculumTab';
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

  const manager = useCurriculumManager(r2Config);
  const {
    chapters, setChapters, setSelectedChapterId,
    setSelectedModuleId,
    activeEditStepId, setActiveEditStepId, isLoadingCbse,
    activeChapter, activeModule,
    loadCbseData, updateActiveChapter,
    updateActiveModuleSteps, handleUpdateStep
  } = manager;

  const handleSaveR2Config = (cfg: R2Config) => {
    setR2Config(cfg);
    if (typeof window !== 'undefined') localStorage.setItem('vakrahara_r2_config', JSON.stringify(cfg));
    setIsSettingsOpen(false);
    loadCbseData('cdn');
  };

  const handleAddChapter = () => {
    const newId = `chapter_${Date.now()}`;
    const newCh: Chapter = {
      id: newId,
      title: 'New Chapter Title',
      branchId: 'physics',
      board: 'cbse',
      grade: 10,
      applicableGrades: [10],
      disciplineIds: ['disc_bhautik'],
      modules: [],
      pyqs: []
    };
    setChapters([...(chapters || []), newCh]);
    setSelectedChapterId(newId);
  };

  const handleAddModule = () => {
    if (!activeChapter) return;
    const newMod = createChildModule(activeChapter, {
      discipline: activeChapter.disciplineIds?.[0] || 'disc_bhautik',
      grade: String(activeChapter.grade || 10)
    });
    updateActiveChapter({
      modules: [...(activeChapter.modules || []), newMod]
    });
    setSelectedModuleId(newMod.id);
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
    if (!chapters) return;
    let targetChapter = activeChapter;
    if (!targetChapter && chapters.length > 0) {
      targetChapter = chapters[0];
      setSelectedChapterId(targetChapter.id);
    }
    if (!targetChapter) return;

    let targetModule = activeModule;
    if (!targetModule && targetChapter.modules && targetChapter.modules.length > 0) {
      targetModule = targetChapter.modules[0];
    }

    if (!targetModule) {
      const newMod = createChildModule(targetChapter, { discipline: 'all', grade: 'all' });
      const newStep: Step = { id: `anveshana_${Date.now()}`, type: 'anveshana', pool: importedQuestions, questionPool: importedQuestions, questionsPerAttempt: 5, passingScore: 4 };
      newMod.steps = [newStep];
      setChapters(chapters.map(c => c.id === targetChapter!.id ? {
        ...c,
        modules: [...(c.modules || []), newMod]
      } : c));
      setSelectedModuleId(newMod.id);
      setIsBulkImportOpen(false);
      return;
    }

    const anveshanaStep = (targetModule.steps || []).find(s => s.type === 'anveshana');
    let nextSteps: Step[];
    if (anveshanaStep) {
      const combined = [...(anveshanaStep.pool || []), ...importedQuestions];
      nextSteps = (targetModule.steps || []).map(s => s.id === anveshanaStep.id ? { ...s, pool: combined, questionPool: combined } : s);
    } else {
      const newStep: Step = { id: `anveshana_${Date.now()}`, type: 'anveshana', pool: importedQuestions, questionPool: importedQuestions, questionsPerAttempt: 5, passingScore: 4 };
      nextSteps = [...(targetModule.steps || []), newStep];
    }

    setChapters(patchModuleSteps(chapters, targetChapter.id, targetModule.id, nextSteps));
    setSelectedModuleId(targetModule.id);
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
          <CbseCurriculumTab
            manager={manager}
            showReadinessMatrix={showReadinessMatrix}
            setShowReadinessMatrix={setShowReadinessMatrix}
            handleAddChapter={handleAddChapter}
            handleAddModule={handleAddModule}
            handleAddPyq={handleAddPyq}
            onOpenBulkImport={() => setIsBulkImportOpen(true)}
            onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
            onOpenFocusedEditor={(stepId) => { setActiveEditStepId(stepId); setIsFocusedEditorOpen(true); }}
            onRequestDelete={setPendingDelete}
          />
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
        activeStep={activeModule?.steps?.find(s => s.id === activeEditStepId) || null}
        activeModuleTitle={activeModule?.title} activeChapterTitle={activeChapter?.title}
        allSteps={activeModule?.steps || []} onUpdateStep={handleUpdateStep}
        onSelectStepId={setActiveEditStepId} onOpenBulkImport={() => setIsBulkImportOpen(true)}
      />
    </>
  );
}
