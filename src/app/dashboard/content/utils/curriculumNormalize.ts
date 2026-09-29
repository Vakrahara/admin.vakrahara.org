import { Chapter } from '@/types/curriculum';

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
      return {
        ...mod,
        steps: normalizedSteps,
        learningSteps: mod.learningSteps || undefined
      };
    })
  }));
}
