'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chapter, Module, Step, StepType } from '@/types/curriculum';
import { pb } from '@/lib/pocketbase';

export function useCurriculumState() {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [activeEditStepId, setActiveEditStepId] = useState<string | null>(null);
  const [editingPyqId, setEditingPyqId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeChapter = chapters?.find(c => c.id === selectedChapterId) || null;
  const activeModule = activeChapter?.modules.find(m => m.id === selectedModuleId) || null;
  const activeStep = activeModule?.steps.find(s => s.id === activeEditStepId) || null;

  // Load curriculum from PocketBase -> R2 -> Local fallback
  const loadCurriculum = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Primary: PocketBase backend
      const res = await pb.send('/api/amritam/curriculum', { method: 'GET' });
      if (Array.isArray(res) && res.length > 0) {
        setChapters(res);
        if (!selectedChapterId) setSelectedChapterId(res[0].id);
        return;
      }
    } catch {
      // 2. Secondary: R2 CDN
      try {
        const r2Res = await fetch('https://cdn.vakrahara.org/v1/cbse/chapters_data.json');
        if (r2Res.ok) {
          const data = await r2Res.json();
          setChapters(data);
          if (!selectedChapterId && data.length > 0) setSelectedChapterId(data[0].id);
          return;
        }
      } catch {
        // 3. Fallback: local public asset
        try {
          const localRes = await fetch('/cbse/chapters_data.json');
          if (localRes.ok) {
            const data = await localRes.json();
            setChapters(data);
            if (!selectedChapterId && data.length > 0) setSelectedChapterId(data[0].id);
          }
        } catch (e: any) {
          setError(e?.message || 'Failed to load curriculum data');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedChapterId]);

  useEffect(() => {
    loadCurriculum();
  }, [loadCurriculum]);

  // Chapter mutations
  const updateChapter = useCallback((chapterId: string, updater: (prev: Chapter) => Chapter) => {
    setChapters(prev => prev ? prev.map(c => c.id === chapterId ? updater(c) : c) : prev);
  }, []);

  const addChapter = useCallback((newChapter: Chapter) => {
    setChapters(prev => prev ? [...prev, newChapter] : [newChapter]);
    setSelectedChapterId(newChapter.id);
  }, []);

  const deleteChapter = useCallback((chapterId: string) => {
    setChapters(prev => prev ? prev.filter(c => c.id !== chapterId) : prev);
    setSelectedChapterId(prev => prev === chapterId ? null : prev);
    setSelectedModuleId(prev => prev ? null : prev);
  }, []);

  // Module mutations
  const updateModule = useCallback((chapterId: string, moduleId: string, updater: (prev: Module) => Module) => {
    updateChapter(chapterId, ch => ({
      ...ch,
      modules: ch.modules.map(m => m.id === moduleId ? updater(m) : m)
    }));
  }, [updateChapter]);

  const addModule = useCallback((chapterId: string, newModule: Module) => {
    updateChapter(chapterId, ch => ({
      ...ch,
      modules: [...ch.modules, newModule]
    }));
    setSelectedModuleId(newModule.id);
  }, [updateChapter]);

  const deleteModule = useCallback((chapterId: string, moduleId: string) => {
    updateChapter(chapterId, ch => ({
      ...ch,
      modules: ch.modules.filter(m => m.id !== moduleId)
    }));
    setSelectedModuleId(prev => prev === moduleId ? null : prev);
  }, [updateChapter]);

  // Step mutations
  const updateStep = useCallback((chapterId: string, moduleId: string, stepId: string, updater: (prev: Step) => Step) => {
    updateModule(chapterId, moduleId, mod => ({
      ...mod,
      steps: mod.steps.map(s => s.id === stepId ? updater(s) : s)
    }));
  }, [updateModule]);

  const addStep = useCallback((chapterId: string, moduleId: string, newStep: Step) => {
    updateModule(chapterId, moduleId, mod => ({
      ...mod,
      steps: [...mod.steps, newStep]
    }));
    setActiveEditStepId(newStep.id);
  }, [updateModule]);

  const deleteStep = useCallback((chapterId: string, moduleId: string, stepId: string) => {
    updateModule(chapterId, moduleId, mod => ({
      ...mod,
      steps: mod.steps.filter(s => s.id !== stepId)
    }));
    setActiveEditStepId(prev => prev === stepId ? null : prev);
  }, [updateModule]);

  return {
    chapters,
    setChapters,
    selectedChapterId,
    setSelectedChapterId,
    selectedModuleId,
    setSelectedModuleId,
    activeEditStepId,
    setActiveEditStepId,
    editingPyqId,
    setEditingPyqId,
    activeChapter,
    activeModule,
    activeStep,
    isLoading,
    error,
    loadCurriculum,
    addChapter,
    updateChapter,
    deleteChapter,
    addModule,
    updateModule,
    deleteModule,
    addStep,
    updateStep,
    deleteStep
  };
}
