import { Chapter } from '@/types/curriculum';
import {
  TriadValidationError,
  validateTriadPayloads,
  validateKeyTermsRecap,
  validateAudioOverview,
  validateTimelineReel,
  validateTimelineMetadata,
} from '@/types/curriculumValidation';

export {
  type TriadValidationError,
  validateTriadPayloads,
  validateKeyTermsRecap,
  validateAudioOverview,
  validateTimelineReel,
  validateTimelineMetadata,
};

/**
 * Validates the CBSE curriculum JSON structure before saving or publishing.
 * Returns an array of error messages; empty array indicates valid structure.
 */
export function validateCurriculum(curriculum: Chapter[]): string[] {
  const errors: string[] = [];
  const chapterIds = new Set<string>();
  const moduleIds = new Set<string>();
  const stepIds = new Set<string>();

  if (!Array.isArray(curriculum) || curriculum.length === 0) {
    errors.push('At least one chapter is required.');
    return errors;
  }

  curriculum.forEach((chapter, cIndex) => {
    if (!chapter) {
      errors.push(`Chapter ${cIndex + 1} is invalid.`);
      return;
    }
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

    const modules = Array.isArray(chapter.modules) ? chapter.modules : [];
    if (!Array.isArray(chapter.modules)) {
      errors.push(`Chapter "${chName}" has no valid modules list.`);
    }

    modules.forEach((mod, mIndex) => {
      if (!mod) {
        errors.push(`Module ${mIndex + 1} in chapter "${chName}" is invalid.`);
        return;
      }
      const modName = mod.titleEn?.trim() || mod.title?.trim() || mod.id || `Module ${mIndex + 1}`;
      if (!mod.id || mod.id.trim() === '') {
        errors.push(`Module ${mIndex + 1} in chapter "${chName}" has no ID.`);
      } else if (moduleIds.has(mod.id)) {
        errors.push(`Duplicate Module ID: "${mod.id}" in chapter "${chName}".`);
      } else {
        moduleIds.add(mod.id);
      }

      const modTitle = mod.titleEn?.trim() || mod.title?.trim();
      if (!modTitle) {
        errors.push(`Module ID "${mod.id}" in chapter "${chName}" has no Title.`);
      }

      const steps = Array.isArray(mod.steps) ? mod.steps : [];
      if (!Array.isArray(mod.steps)) {
        errors.push(`Module "${modName}" in chapter "${chName}" has no valid steps list.`);
      }

      steps.forEach((step, sIndex) => {
        if (!step) {
          errors.push(`Step ${sIndex + 1} in module "${modName}" (Chapter "${chName}") is invalid.`);
          return;
        }
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
          } else {
            step.miniSteps.forEach((ms, msIdx) => {
              if (!ms.questionEn || ms.questionEn.trim() === '') {
                errors.push(`Mini-step #${msIdx + 1} in Saraswati step "${stepName}" has no English question.`);
              }
              if (!ms.options || ms.options.length < 2) {
                errors.push(`Mini-step #${msIdx + 1} in Saraswati step "${stepName}" must have at least 2 options.`);
              }
              const cIdx = ms.correctIndex ?? 0;
              if (ms.options && (cIdx < 0 || cIdx >= ms.options.length)) {
                errors.push(`Mini-step #${msIdx + 1} in Saraswati step "${stepName}" has an invalid correctIndex (${cIdx}).`);
              }
            });
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

        if (step.checkpoints && Array.isArray(step.checkpoints)) {
          const seenCheckpointIds = new Set<string>();
          step.checkpoints.forEach((chk, chkIdx) => {
            if (!chk.id || !chk.id.startsWith('chk_')) {
              errors.push(`Checkpoint #${chkIdx + 1} in step "${stepName}" has invalid ID "${chk.id}". Must start with "chk_".`);
            } else if (seenCheckpointIds.has(chk.id)) {
              errors.push(`Duplicate Checkpoint ID: "${chk.id}" in step "${stepName}".`);
            } else {
              seenCheckpointIds.add(chk.id);
            }
            if (chk.timestampMs < 0) {
              errors.push(`Checkpoint "${chk.id}" in step "${stepName}" has negative timestamp.`);
            }
            if (chk.type === 'question') {
              const hasPrompt = Boolean(chk.questionEn?.trim() || chk.questionHi?.trim() || chk.questionHng?.trim());
              if (!hasPrompt) {
                errors.push(`Question checkpoint "${chk.id}" in step "${stepName}" has no prompt in any language.`);
              }
              if (!chk.options || chk.options.length < 2) {
                errors.push(`Question checkpoint "${chk.id}" in step "${stepName}" must have at least 2 options.`);
              }
              if (chk.correctOptionIndex === undefined || chk.correctOptionIndex < 0 || (chk.options && chk.correctOptionIndex >= chk.options.length)) {
                errors.push(`Question checkpoint "${chk.id}" in step "${stepName}" has invalid correctOptionIndex (${chk.correctOptionIndex}).`);
              }
            } else if (chk.type === 'simulation_prompt') {
              if (!chk.simulationId || chk.simulationId.trim() === '') {
                errors.push(`Simulation checkpoint "${chk.id}" in step "${stepName}" has no simulationId.`);
              }
            }
          });
        }
      });

      // Vidyāpīṭha Pedagogical Triad Validation (§2, Step 0.3)
      const triadErrors = validateTriadPayloads(mod);
      triadErrors.forEach((tErr) => {
        errors.push(`[Triad: ${modName}] ${tErr.field}: ${tErr.message}`);
      });
    });
  });

  return errors;
}
