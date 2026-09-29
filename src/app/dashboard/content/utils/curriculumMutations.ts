import { Chapter, Module, Step } from '@/types/curriculum';

export function reorderChapterList(chapters: Chapter[], index: number, direction: 'up' | 'down'): Chapter[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= chapters.length) return chapters;
  const next = [...chapters];
  const temp = next[index];
  next[index] = next[targetIndex];
  next[targetIndex] = temp;
  return next;
}

export function reorderModuleList(chapters: Chapter[], chapterId: string, index: number, direction: 'up' | 'down'): Chapter[] {
  const chIndex = chapters.findIndex(c => c.id === chapterId);
  if (chIndex === -1) return chapters;
  const modules = chapters[chIndex].modules;
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= modules.length) return chapters;
  const nextMods = [...modules];
  const temp = nextMods[index];
  nextMods[index] = nextMods[targetIndex];
  nextMods[targetIndex] = temp;
  return chapters.map(c => c.id === chapterId ? { ...c, modules: nextMods } : c);
}

export function reorderStepList(chapters: Chapter[], chapterId: string, moduleId: string, index: number, direction: 'up' | 'down'): Chapter[] {
  const ch = chapters.find(c => c.id === chapterId);
  const mod = ch?.modules.find(m => m.id === moduleId);
  if (!ch || !mod) return chapters;
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= mod.steps.length) return chapters;
  const nextSteps = [...mod.steps];
  const temp = nextSteps[index];
  nextSteps[index] = nextSteps[targetIndex];
  nextSteps[targetIndex] = temp;
  return chapters.map(c => c.id === chapterId ? {
    ...c,
    modules: c.modules.map(m => m.id === moduleId ? { ...m, steps: nextSteps } : m)
  } : c);
}

export function patchChapter(chapters: Chapter[], chapterId: string, fields: Partial<Chapter>): Chapter[] {
  return chapters.map(ch => ch.id === chapterId ? { ...ch, ...fields } : ch);
}

export function patchModule(chapters: Chapter[], chapterId: string, moduleId: string, fields: Partial<Module>): Chapter[] {
  return chapters.map(ch => ch.id === chapterId ? {
    ...ch,
    modules: ch.modules.map(m => m.id === moduleId ? { ...m, ...fields } : m)
  } : ch);
}

export function patchModuleSteps(chapters: Chapter[], chapterId: string, moduleId: string, steps: Step[]): Chapter[] {
  return chapters.map(ch => ch.id === chapterId ? {
    ...ch,
    modules: ch.modules.map(m => m.id === moduleId ? { ...m, steps } : m)
  } : ch);
}
