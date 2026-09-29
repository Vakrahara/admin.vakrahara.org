'use client';

import { useState, useEffect } from 'react';
import { Chapter, Module, Step } from '@/types/curriculum';
import { pb } from '@/lib/pocketbase';
import { R2Config } from '@/lib/r2-upload';
import canonicalCurriculumData from '@/data/canonical_curriculum.json';
import { CurriculumDataSource } from '../components/CurriculumDataSourceBar';
import { validateCurriculum } from '../utils/curriculumValidation';
import { executePublishCurriculum } from '../utils/curriculumPublisher';
import { normalizeCurriculumData } from '../utils/curriculumNormalize';
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
  const [publishErrorMessage, setPublishErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [publishCooldown, setPublishCooldown] = useState(0);
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vakrahara_cbse_draft_v2');
      if (saved) setHasUnsavedDraft(true);
    }
  }, []);

  useEffect(() => {
    if (publishCooldown <= 0) return;
    const timer = setInterval(() => setPublishCooldown(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [publishCooldown]);

  const selectDefaults = (data: Chapter[]) => {
    if (data.length > 0) {
      setSelectedChapterId(data[0].id);
      if (data[0].modules && data[0].modules.length > 0) {
        setSelectedModuleId(data[0].modules[0].id);
      }
    }
  };

  const loadCbseData = async (source: CurriculumDataSource = 'canonical') => {
    setIsLoadingCbse(true);
    setCbseLoadError(null);
    setCurriculumSource(source);

    if (source === 'canonical' || source === 'local') {
      const normalizedData = normalizeCurriculumData(canonicalCurriculumData as any);
      setChapters(normalizedData);
      selectDefaults(normalizedData);
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsLoadingCbse(false);
      return;
    }

    const pbUrl = 'https://pb.vakrahara.org/api/amritam/curriculum?schema_version=2';
    const cdnUrl = source === 'cdn' && r2Config.customDomain
      ? `${r2Config.customDomain.replace(/\/$/, '')}/cbse/chapters_data.json`
      : 'https://cdn.vakrahara.org/v1/cbse/chapters_data.json';

    try {
      const targetUrl = source === 'pb' ? pbUrl : cdnUrl;
      const response = await fetch(targetUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const normalizedData = normalizeCurriculumData(Array.isArray(data) ? data : []);
      setChapters(normalizedData);
      selectDefaults(normalizedData);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e: any) {
      if (source === 'pb') {
        loadCbseData('cdn');
        return;
      }
      setCbseLoadError(e.message || 'Failed to load curriculum data.');
    } finally {
      setIsLoadingCbse(false);
    }
  };

  const handleSeedCanonical = () => {
    const normalized = normalizeCurriculumData(canonicalCurriculumData as any);
    setChapters(normalized);
    selectDefaults(normalized);
    setCurriculumSource('canonical');
    setLastSyncTime(new Date().toLocaleTimeString());
    setPublishStatus('success');
    if (typeof window !== 'undefined') {
      localStorage.setItem('vakrahara_cbse_draft_v2', JSON.stringify(normalized));
      setHasUnsavedDraft(false);
    }
    setTimeout(() => setPublishStatus('idle'), 4000);
  };

  const handleRestoreDraft = () => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('vakrahara_cbse_draft_v2');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          const normalized = normalizeCurriculumData(parsed);
          setChapters(normalized);
          selectDefaults(normalized);
          setHasUnsavedDraft(false);
          setPublishStatus('success');
          setTimeout(() => setPublishStatus('idle'), 3000);
        } catch (e) {
          console.error('Failed to parse draft:', e);
        }
      }
    }
  };

  const handleDiscardDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vakrahara_cbse_draft_v2');
      setHasUnsavedDraft(false);
    }
  };

  const handleExportJson = () => {
    if (!chapters) return;
    const blob = new Blob([JSON.stringify(chapters, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amrtam_cbse_chapters_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (imported: Chapter[]) => {
    const normalized = normalizeCurriculumData(imported);
    setChapters(normalized);
    selectDefaults(normalized);
    setLastSyncTime(new Date().toLocaleTimeString());
    if (typeof window !== 'undefined') {
      localStorage.setItem('vakrahara_cbse_draft_v2', JSON.stringify(normalized));
      setHasUnsavedDraft(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!chapters) return;
    setIsSavingDraft(true);
    setPublishStatus('idle');
    setPublishErrorMessage('');

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vakrahara_cbse_draft_v2', JSON.stringify(chapters));
      }
      const token = pb.authStore.token;
      const authHeader = token ? (token.startsWith('Admin ') || token.startsWith('Bearer ') ? token : `Admin ${token}`) : '';
      await fetch('https://pb.vakrahara.org/api/amritam/admin/curriculum/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
        body: JSON.stringify({ payload: chapters })
      });
      setHasUnsavedDraft(false);
      setPublishStatus('success');
      setTimeout(() => setPublishStatus('idle'), 4000);
    } catch (e: any) {
      console.warn('Network issue saving draft to PB, saved to local draft:', e);
      setPublishStatus('success');
      setTimeout(() => setPublishStatus('idle'), 4000);
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
      setPublishStatus('success');
      setPublishCooldown(30);
      setChapters(payloadChapters);
      setTimeout(() => setPublishStatus('idle'), 5000);
    } catch (e: any) {
      setPublishStatus('error');
      setPublishErrorMessage(e.message || 'Failed to publish to Cloudflare R2.');
    } finally {
      setIsPublishing(false);
    }
  };

  const moveChapter = (index: number, dir: 'up' | 'down') => {
    if (chapters) setChapters(reorderChapterList(chapters, index, dir));
  };

  const moveModule = (chapterId: string, index: number, dir: 'up' | 'down') => {
    if (chapters) setChapters(reorderModuleList(chapters, chapterId, index, dir));
  };

  const moveStep = (chapterId: string, moduleId: string, index: number, dir: 'up' | 'down') => {
    if (chapters) setChapters(reorderStepList(chapters, chapterId, moduleId, index, dir));
  };

  const activeChapter = chapters?.find(c => c.id === selectedChapterId) || null;
  const activeModule = activeChapter?.modules.find(m => m.id === selectedModuleId) || null;

  const updateActiveChapter = (fields: Partial<Chapter>) => {
    if (chapters && activeChapter) setChapters(patchChapter(chapters, activeChapter.id, fields));
  };

  const updateActiveModule = (fields: Partial<Module>) => {
    if (chapters && activeChapter && activeModule) {
      setChapters(patchModule(chapters, activeChapter.id, activeModule.id, fields));
    }
  };

  const updateActiveModuleSteps = (steps: Step[]) => {
    if (chapters && activeChapter && activeModule) {
      setChapters(patchModuleSteps(chapters, activeChapter.id, activeModule.id, steps));
    }
  };

  const handleUpdateStep = (updatedStep: Step) => {
    if (!activeModule) return;
    updateActiveModuleSteps(activeModule.steps.map(s => s.id === updatedStep.id ? updatedStep : s));
  };

  return {
    chapters, setChapters, selectedChapterId, setSelectedChapterId,
    selectedModuleId, setSelectedModuleId, editingPyqId, setEditingPyqId,
    activeEditStepId, setActiveEditStepId, isLoadingCbse, cbseLoadError,
    curriculumSource, setCurriculumSource, isPublishing, isSavingDraft,
    publishStatus, publishErrorMessage, validationErrors, publishCooldown,
    hasUnsavedDraft, lastSyncTime, activeChapter, activeModule,
    loadCbseData, handleSeedCanonical, handleRestoreDraft, handleDiscardDraft,
    handleExportJson, handleImportJson, handleSaveDraft, handlePublishCbse,
    moveChapter, moveModule, moveStep, updateActiveChapter,
    updateActiveModule, updateActiveModuleSteps, handleUpdateStep
  };
}
