import { Chapter, Module, Step } from '@/types/curriculum';
import { formatModuleId } from '@/lib/semanticId';
import { getShortCode } from '@/lib/disciplinesRegistry';

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
  const modules = chapters[chIndex].modules || [];
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
  const mod = ch?.modules?.find(m => m.id === moduleId);
  if (!ch || !mod) return chapters;
  const steps = mod.steps || [];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= steps.length) return chapters;
  const nextSteps = [...steps];
  const temp = nextSteps[index];
  nextSteps[index] = nextSteps[targetIndex];
  nextSteps[targetIndex] = temp;
  return chapters.map(c => c.id === chapterId ? {
    ...c,
    modules: (c.modules || []).map(m => m.id === moduleId ? { ...m, steps: nextSteps } : m)
  } : c);
}

export function patchChapter(chapters: Chapter[], chapterId: string, fields: Partial<Chapter>): Chapter[] {
  return chapters.map(ch => ch.id === chapterId ? { ...ch, ...fields } : ch);
}

export function patchModule(chapters: Chapter[], chapterId: string, moduleId: string, fields: Partial<Module>): Chapter[] {
  return chapters.map(ch => ch.id === chapterId ? {
    ...ch,
    modules: (ch.modules || []).map(m => m.id === moduleId ? { ...m, ...fields } : m)
  } : ch);
}

export function patchModuleSteps(chapters: Chapter[], chapterId: string, moduleId: string, steps: Step[]): Chapter[] {
  return chapters.map(ch => ch.id === chapterId ? {
    ...ch,
    modules: (ch.modules || []).map(m => m.id === moduleId ? { ...m, steps } : m)
  } : ch);
}

export function createFilteredChapter(filters: { board: string; grade: string; discipline: string }): Chapter {
  const newId = `chapter_${Date.now()}`;
  const inheritedBoard = filters.board !== 'all' ? filters.board : 'cbse';
  const inheritedGrade = filters.grade !== 'all' ? Number(filters.grade) : undefined;
  const inheritedBranch = filters.discipline !== 'all'
    ? (filters.discipline.replace('disc_', '') || 'physics')
    : 'physics';
  const inheritedDisc = filters.discipline !== 'all' ? [filters.discipline] : undefined;

  return {
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
}

export function createChildModule(targetChapter: Chapter, filters: { discipline: string; grade: string }): Module {
  const inheritedDisc = targetChapter.disciplineIds?.[0]
    || (filters.discipline !== 'all' ? filters.discipline : 'disc_bhautik');
  const inheritedGrades = targetChapter.applicableGrades
    || (targetChapter.grade ? [targetChapter.grade] : (filters.grade !== 'all' ? [Number(filters.grade)] : [10]));
  const existingIds = new Set((targetChapter.modules || []).map(m => m.id));
  let modIndex = (targetChapter.modules?.length || 0) + 1;
  const shortCode = getShortCode(inheritedDisc);
  let newModId = formatModuleId(shortCode, 'core', `m${modIndex}`);
  while (existingIds.has(newModId)) {
    modIndex += 1;
    newModId = formatModuleId(shortCode, 'core', `m${modIndex}`);
  }

  return {
    id: newModId,
    title: 'New Module Title',
    primaryDisciplineId: inheritedDisc,
    disciplineIds: [inheritedDisc],
    applicableGrades: inheritedGrades,
    steps: []
  };
}
