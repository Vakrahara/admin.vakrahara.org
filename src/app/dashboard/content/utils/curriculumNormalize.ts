import { Chapter } from '@/types/curriculum';
import { resolveBranchDisciplineId } from './curriculumFilterUtils';

/**
 * Normalizes raw curriculum data into fully-typed Chapter array with resilient steps.
 */
export function normalizeCurriculumData(data: any[]): Chapter[] {
  return (Array.isArray(data) ? data : []).map((ch: any) => ({
    ...ch,
    modules: (ch.modules || []).map((mod: any) => {
      const rawSteps = (mod.learningSteps && mod.learningSteps.length > 0)
        ? mod.learningSteps
        : (mod.steps || []);
      const normalizedSteps = rawSteps.map((st: any) => {
        if (st.type === 'anveshana') {
          const qp = st.pool || st.questionPool || [];
          return { ...st, pool: qp, questionPool: qp };
        }
        return st;
      });
      const resolvedTitle = mod.title?.trim() || mod.titleEn?.trim() || mod.id || '';
      const resolvedSubtitle = mod.subtitle?.trim() || mod.subtitleEn?.trim() || undefined;
      const fallbackBranch = mod.branchId || ch.branchId;
      const fallbackDisc = resolveBranchDisciplineId(fallbackBranch);
      return {
        ...mod,
        title: resolvedTitle,
        titleEn: resolvedTitle,
        subtitle: resolvedSubtitle,
        subtitleEn: resolvedSubtitle,
        disciplineIds: mod.disciplineIds || (fallbackDisc ? [fallbackDisc] : undefined),
        primaryDisciplineId: mod.primaryDisciplineId || fallbackDisc,
        applicableGrades: mod.applicableGrades || undefined,
        steps: normalizedSteps,
        learningSteps: mod.learningSteps || undefined
      };
    })
  }));
}
