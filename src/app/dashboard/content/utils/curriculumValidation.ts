import { Chapter } from '@/types/curriculum';

/**
 * Validates the CBSE curriculum JSON structure before saving or publishing.
 * Returns an array of error messages; empty array indicates valid structure.
 */
export function validateCurriculum(curriculum: Chapter[]): string[] {
  const errors: string[] = [];
  const chapterIds = new Set<string>();
  const moduleIds = new Set<string>();
  const stepIds = new Set<string>();

  if (curriculum.length === 0) {
    errors.push('At least one chapter is required.');
  }

  curriculum.forEach((chapter, cIndex) => {
    const chName = chapter.title || chapter.id || `Chapter ${cIndex + 1}`;
    if (!chapter.id || chapter.id.trim() === '') {
      errors.push(`Chapter ${cIndex + 1} has no ID.`);
    } else if (chapterIds.has(chapter.id)) {
      errors.push(`Duplicate Chapter ID: "${chapter.id}".`);
    } else {
      chapterIds.add(chapter.id);
    }

    if (!chapter.title || chapter.title.trim() === '') {
      errors.push(`Chapter ID "${chapter.id}" has no Title.`);
    }

    if (!chapter.branchId || chapter.branchId.trim() === '') {
      errors.push(`Chapter "${chName}" has no Branch ID (e.g. physics).`);
    }

    chapter.modules.forEach((mod, mIndex) => {
      const modName = mod.title || mod.id || `Module ${mIndex + 1}`;
      if (!mod.id || mod.id.trim() === '') {
        errors.push(`Module ${mIndex + 1} in chapter "${chName}" has no ID.`);
      } else if (moduleIds.has(mod.id)) {
        errors.push(`Duplicate Module ID: "${mod.id}" in chapter "${chName}".`);
      } else {
        moduleIds.add(mod.id);
      }

      if (!mod.title || mod.title.trim() === '') {
        errors.push(`Module ID "${mod.id}" in chapter "${chName}" has no Title.`);
      }

      mod.steps.forEach((step, sIndex) => {
        const stepName = step.id || `Step ${sIndex + 1}`;
        if (!step.id || step.id.trim() === '') {
          errors.push(`Step ${sIndex + 1} in module "${modName}" (Chapter "${chName}") has no ID.`);
        } else if (stepIds.has(step.id)) {
          errors.push(`Duplicate Step ID: "${step.id}" in module "${modName}".`);
        } else {
          stepIds.add(step.id);
        }

        if (step.type === 'saraswati') {
          if (!step.definitionEn || step.definitionEn.trim() === '') {
            errors.push(`Saraswati step "${stepName}" has no assembled definition.`);
          }
          if (!step.miniSteps || step.miniSteps.length === 0) {
            errors.push(`Saraswati step "${stepName}" must have at least 1 mini-step.`);
          }
        } else if (step.type === 'anveshana') {
          const pool = step.pool || step.questionPool || [];
          if (pool.length === 0) {
            errors.push(`Anveshana step "${stepName}" must have at least 1 question in the pool.`);
          } else {
            pool.forEach((q, qIdx) => {
              if (!q.questionEn || q.questionEn.trim() === '') {
                errors.push(`Question #${qIdx + 1} in Anveshana step "${stepName}" has no prompt.`);
              }
              if (!q.options || q.options.length < 2) {
                errors.push(`Question #${qIdx + 1} in Anveshana step "${stepName}" must have at least 2 options.`);
              }
            });
          }
        } else if (step.type === 'predict_quiz') {
          if (!step.question || step.question.trim() === '') {
            errors.push(`Quiz step "${stepName}" has no question.`);
          }
          if (!step.options || step.options.length < 2) {
            errors.push(`Quiz step "${stepName}" must have at least 2 options.`);
          }
          if (step.correctOptionIndex === undefined || step.correctOptionIndex < 0 || (step.options && step.correctOptionIndex >= step.options.length)) {
            errors.push(`Quiz step "${stepName}" has an invalid correctOptionIndex (${step.correctOptionIndex}).`);
          }
        } else if (step.type === 'simulation') {
          if (!step.simulationId || step.simulationId.trim() === '') {
            errors.push(`Simulation step "${stepName}" has no simulationId.`);
          }
        }
      });
    });
  });

  return errors;
}
