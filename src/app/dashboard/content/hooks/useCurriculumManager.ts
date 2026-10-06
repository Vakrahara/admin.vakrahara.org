'use client';

import { useState, useEffect, useRef } from 'react';
import { Chapter, Module, Step } from '@/types/curriculum';
import { pb } from '@/lib/pocketbase';
import { R2Config } from '@/lib/r2-upload';
import canonicalCurriculumData from '@/data/canonical_curriculum.json';
import { CurriculumDataSource } from '../components/CurriculumDataSourceBar';
import { validateCurriculum } from '../utils/curriculumValidation';
import { executePublishCurriculum } from '../utils/curriculumPublisher';
import { normalizeCurriculumData } from '../utils/curriculumNormalize';
import { fetchRemoteCurriculum } from '../utils/curriculumDataLoader';
import { 
  readLocalDraft, 
  writeLocalDraft, 
  removeLocalDraft, 
  exportChaptersJson, 
  saveDraftRemote 
} from '../utils/curriculumDraftStorage';
import { 
  saveActiveSelection, 
  resolveSelectionCursor 
} from '../utils/curriculumNavigationStorage';
import { 
  reorderChapterList, 
  reorderModuleList, 
  reorderStepList, 
  patchChapter, 
  patchModule, 
  patchModuleSteps 
} from '../utils/curriculumMutations';

export function useCurriculumManager(r2Config: R2Config) {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingPyqId, setEditingPyqId] = useState<string | null>(null);
  const [activeEditStepId, setActiveEditStepId] = useState<string | null>(null);
  const [isLoadingCbse, setIsLoadingCbse] = useState(false);
  const [cbseLoadError, setCbseLoadError] = useState<string | null>(null);
  const [curriculumSource, setCurriculumSource] = useState<CurriculumDataSource>('canonical');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [publishSuccessMessage, setPublishSuccessMessage] = useState('');
  const [publishErrorMessage, setPublishErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [publishCooldown, setPublishCooldown] = useState(0);
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const lastCommittedChapters = useRef<Chapter[] | null>(null);

  const setChaptersAndCursor = (data: Chapter[], markCommitted = true) => {
    setChapters(data);
    if (markCommitted) lastCommittedChapters.current = data;
    const { chapterId, moduleId } = resolveSelectionCursor(data);
    setSelectedChapterId(chapterId);
    setSelectedModuleId(moduleId);
  };

  useEffect(() => {
    const saved = readLocalDraft();
    if (saved) {
      setChaptersAndCursor(saved, true);
      setHasUnsavedDraft(true);
      setLastSyncTime(new Date().toLocaleTimeString());
      return;
    }
    const normalized = normalizeCurriculumData(canonicalCurriculumData as any);
    setChaptersAndCursor(normalized, true);
    setLastSyncTime(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    if (selectedChapterId) {
      saveActiveSelection(selectedChapterId, selectedModuleId);
    }
  }, [selectedChapterId, selectedModuleId]);

  useEffect(() => {
    if (!isDirty || !chapters) return;
    const timer = setTimeout(() => writeLocalDraft(chapters), 500);
    return () => clearTimeout(timer);
  }, [chapters, isDirty]);

  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [isDirty]);

  useEffect(() => {
    if (publishCooldown <= 0) return;
    const timer = setInterval(() => setPublishCooldown(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [publishCooldown]);

  const loadCbseData = async (source: CurriculumDataSource = 'canonical') => {
    setIsLoadingCbse(true);
    setCbseLoadError(null);
    setCurriculumSource(source);
    if (source === 'canonical' || source === 'local') {
      const normalized = normalizeCurriculumData(canonicalCurriculumData as any);
      setChaptersAndCursor(normalized, true);
      setIsDirty(false);
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsLoadingCbse(false);
      return;
    }
    try {
      const data = await fetchRemoteCurriculum(source === 'pb' ? 'pb' : 'cdn', r2Config.customDomain);
      setChaptersAndCursor(data, true);
      setIsDirty(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e: any) {
      if (source === 'pb') return loadCbseData('cdn');
      setCbseLoadError(e.message || 'Failed to load curriculum data.');
    } finally {
      setIsLoadingCbse(false);
    }
  };

  const handleSeedCanonical = () => {
    const normalized = normalizeCurriculumData(canonicalCurriculumData as any);
    setChaptersAndCursor(normalized, true);
    setCurriculumSource('canonical');
    setLastSyncTime(new Date().toLocaleTimeString());
    setPublishStatus('success');
    writeLocalDraft(normalized);
    setIsDirty(false);
    setHasUnsavedDraft(false);
    setTimeout(() => setPublishStatus('idle'), 4000);
  };

  const handleRestoreDraft = () => {
    const saved = readLocalDraft();
    if (saved) {
      setChaptersAndCursor(saved, true);
      setIsDirty(false);
      setHasUnsavedDraft(false);
      setPublishStatus('success');
      setTimeout(() => setPublishStatus('idle'), 3000);
    }
  };

  const handleDiscardDraft = () => {
    removeLocalDraft();
    setIsDirty(false);
    setHasUnsavedDraft(false);
  };

  const handleDiscardChanges = () => {
    const target = lastCommittedChapters.current || normalizeCurriculumData(canonicalCurriculumData as any);
    setChaptersAndCursor(target, true);
    writeLocalDraft(target);
    setIsDirty(false);
    setPublishStatus('idle');
    setPublishErrorMessage('');
  };

  const handleExportJson = () => { if (chapters) exportChaptersJson(chapters); };

  const handleImportJson = (imported: Chapter[]) => {
    const normalized = normalizeCurriculumData(imported);
    setChaptersAndCursor(normalized, true);
    setLastSyncTime(new Date().toLocaleTimeString());
    writeLocalDraft(normalized);
    setIsDirty(false);
    setHasUnsavedDraft(false);
  };

  const handleExplicitSave = async () => {
    if (!chapters) return;
    setIsSavingDraft(true);
    setPublishStatus('idle');
    setPublishErrorMessage('');
    try {
      writeLocalDraft(chapters);
      lastCommittedChapters.current = chapters;
      await saveDraftRemote(chapters, pb.authStore.token);
      setIsDirty(false);
      setHasUnsavedDraft(false);
      setPublishSuccessMessage('Draft changes successfully saved to PocketBase database!');
      setPublishStatus('success');
      setTimeout(() => setPublishStatus('idle'), 4000);
    } catch (e: any) {
      console.error('Failed to save draft:', e);
      setPublishStatus('error');
      setPublishErrorMessage(e.message || 'Failed to save draft to PocketBase.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublishCbse = async () => {
    if (!chapters) return;
    if (publishCooldown > 0) {
      setPublishStatus('error');
      setPublishErrorMessage(`Publish cooldown active. Please wait ${publishCooldown}s.`);
      return;
    }
    setIsPublishing(true);
    setPublishStatus('idle');
    setPublishErrorMessage('');
    const errors = validateCurriculum(chapters);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setPublishStatus('error');
      setPublishErrorMessage('Validation failed. Please correct the curriculum errors before publishing.');
      setIsPublishing(false);
      return;
    }
    setValidationErrors([]);
    try {
      const payloadChapters = await executePublishCurriculum(chapters, r2Config);
      setPublishSuccessMessage('Curriculum successfully published to Cloudflare R2 and synced to PocketBase database!');
      setPublishStatus('success');
      setPublishCooldown(30);
      setChaptersAndCursor(payloadChapters, true);
      setIsDirty(false);
      setTimeout(() => setPublishStatus('idle'), 5000);
    } catch (e: any) {
      setPublishStatus('error');
      setPublishErrorMessage(e.message || 'Failed to publish to Cloudflare R2.');
    } finally {
      setIsPublishing(false);
    }
  };

  const mutate = (updater: (prev: Chapter[]) => Chapter[]) => {
    if (!chapters) return;
    setChapters(prev => prev ? updater(prev) : prev);
    setIsDirty(true);
  };

  const setChaptersWithDirty: React.Dispatch<React.SetStateAction<Chapter[] | null>> = (action) => {
    setChapters(action);
    setIsDirty(true);
  };

  const moveChapter = (index: number, dir: 'up' | 'down') => mutate(ch => reorderChapterList(ch, index, dir));
  const moveModule = (chId: string, index: number, dir: 'up' | 'down') => mutate(ch => reorderModuleList(ch, chId, index, dir));
  const moveStep = (chId: string, modId: string, idx: number, dir: 'up' | 'down') => mutate(ch => reorderStepList(ch, chId, modId, idx, dir));

  const activeChapter = chapters?.find(c => c.id === selectedChapterId) || null;
  const activeModule = activeChapter?.modules.find(m => m.id === selectedModuleId) || null;

  const updateActiveChapter = (fields: Partial<Chapter>) => {
    if (chapters && activeChapter) {
      if (fields.id && fields.id !== activeChapter.id) setSelectedChapterId(fields.id);
      mutate(ch => patchChapter(ch, activeChapter.id, fields));
    }
  };
  const updateActiveModule = (fields: Partial<Module>) => {
    if (chapters && activeChapter && activeModule) {
      if (fields.id && fields.id !== activeModule.id) setSelectedModuleId(fields.id);
      mutate(ch => patchModule(ch, activeChapter.id, activeModule.id, fields));
    }
  };
  const updateActiveModuleSteps = (steps: Step[]) => {
    if (chapters && activeChapter && activeModule) mutate(ch => patchModuleSteps(ch, activeChapter.id, activeModule.id, steps));
  };
  const handleUpdateStep = (updatedStep: Step) => {
    if (!activeModule) return;
    updateActiveModuleSteps(activeModule.steps.map(s => s.id === updatedStep.id ? updatedStep : s));
  };

  return {
    chapters, setChapters: setChaptersWithDirty, selectedChapterId, setSelectedChapterId,
    selectedModuleId, setSelectedModuleId, editingPyqId, setEditingPyqId,
    activeEditStepId, setActiveEditStepId, isLoadingCbse, cbseLoadError,
    curriculumSource, setCurriculumSource, isPublishing, isSavingDraft,
    publishStatus, publishSuccessMessage, publishErrorMessage, validationErrors, publishCooldown,
    hasUnsavedDraft, lastSyncTime, activeChapter, activeModule, isDirty,
    loadCbseData, handleSeedCanonical, handleRestoreDraft, handleDiscardDraft,
    handleDiscardChanges, handleExportJson, handleImportJson,
    handleSaveDraft: handleExplicitSave, handleExplicitSave, handlePublishCbse,
    moveChapter, moveModule, moveStep, updateActiveChapter,
    updateActiveModule, updateActiveModuleSteps, handleUpdateStep
  };
}
