import { Chapter, Module, Step, AnveshanaQuestion, MediaMode } from '@/types/curriculum';
import { computeAnveshanaHash } from '../components/anveshanaCrypto';

/**
 * Prepares the sanitized and dual-compatible curriculum payload:
 * Computes hashes for Anveshana questions, aligns Saraswati answers,
 * and generates both modern learningSteps and backward-compatible steps.
 */
export async function preparePublishPayload(rawChapters: Chapter[]): Promise<Chapter[]> {
  const sanitizedChapters = rawChapters.map(ch => ({
    ...ch,
    modules: ch.modules.map(mod => {
      const { ...sanitizedMod } = mod as any;
      delete sanitizedMod.prerequisites;
      return sanitizedMod as Module;
    })
  }));

  for (const ch of sanitizedChapters) {
    for (const mod of ch.modules) {
      for (const step of mod.steps) {
        if (step.type === 'anveshana') {
          const pool = step.pool || step.questionPool || [];
          for (const q of pool) {
            if (!q.correctOptionHash) {
              const cIdx = q.correctOptionIndex ?? 0;
              const optText = q.options[cIdx] || '';
              if (optText && q.questionEn) {
                q.correctOptionHash = await computeAnveshanaHash(optText, q.questionEn);
              }
            }
          }
          step.pool = pool;
          step.questionPool = pool;
        } else if (step.type === 'saraswati') {
          if (step.miniSteps) {
            step.miniSteps = step.miniSteps.map((ms) => {
              const cIdx = Math.max(0, Math.min(ms.correctIndex ?? 0, (ms.options?.length || 1) - 1));
              return {
                ...ms,
                answerEn: ms.answerEn || ms.options?.[cIdx] || '',
                answerHi: ms.answerHi || ms.optionsHi?.[cIdx] || '',
                answerHng: ms.answerHng || ms.optionsHng?.[cIdx] || ''
              };
            });
          }
        } else if (step.type === 'video_simulation' && !step.mediaMode) {
          step.mediaMode = (step.videoUrl && step.simulationId) ? 'both' :
            step.videoUrl ? 'video_only' :
            step.simulationId ? 'simulation_only' : 'none';
        }
      }
    }
  }

  return sanitizedChapters.map(ch => ({
    ...ch,
    modules: ch.modules.map(mod => {
      const learningSteps: Step[] = [];
      const legacySteps: Step[] = [];

      mod.steps.forEach((step) => {
        if (step.type === 'video_simulation') {
          const resolvedMediaMode = step.mediaMode || (
            step.videoUrl && step.simulationId ? 'both' :
            step.videoUrl ? 'video_only' :
            step.simulationId ? 'simulation_only' : 'none'
          );
          learningSteps.push({ ...step, mediaMode: resolvedMediaMode });
          if (step.simulationId) {
            legacySteps.push({
              id: step.id,
              type: 'simulation',
              simulationId: step.simulationId,
              params: step.params || { mode: 0.0 },
              questionText: step.textEng || step.title || '',
              questionTextHng: step.textHng || ''
            });
          } else if (step.gurutatva && step.gurutatva.titleEn) {
            legacySteps.push({
              id: step.id,
              type: 'heritage_connection',
              title: step.gurutatva.titleEn,
              sutra: step.gurutatva.sutra || '',
              translation: step.gurutatva.sutraTranslation || '',
              significance: step.gurutatva.bodyEn || step.textEng || '',
              textHng: step.gurutatva.bodyHng || step.textHng || ''
            });
          } else {
            legacySteps.push({
              id: step.id,
              type: 'concept',
              textDeva: step.textDeva || '',
              textEng: step.textEng || step.title || '',
              textHng: step.textHng || '',
              imageUrl: step.imageUrl || ''
            });
          }
        } else if (step.type === 'saraswati') {
          learningSteps.push({ ...step });
          legacySteps.push({
            id: step.id,
            type: 'simulation',
            simulationId: 'what_is_a_wave',
            params: { mode: 1.0 },
            questionText: step.title || step.miniSteps?.[0]?.questionEn || 'Concept Discovery',
            questionTextHng: step.titleHng || ''
          });
        } else if (step.type === 'anveshana') {
          const pool = step.pool || step.questionPool || [];
          learningSteps.push({ ...step, pool, questionPool: pool });
          const firstQ = pool[0];
          legacySteps.push({
            id: step.id,
            type: 'predict_quiz',
            question: firstQ?.questionEn || step.title || 'Check Your Understanding',
            options: firstQ?.options && firstQ.options.length >= 2 ? firstQ.options : ['Option A', 'Option B'],
            correctOptionIndex: firstQ?.correctOptionIndex ?? 0,
            explanation: firstQ?.explanationEn || '',
            hints: firstQ?.hints || [],
            targetModuleId: step.targetModuleId || mod.id,
            questionHng: firstQ?.questionHng,
            optionsHng: firstQ?.optionsHng,
            explanationHng: firstQ?.explanationHng,
            hintsHng: firstQ?.hintsHng
          });
        } else if (step.type === 'concept') {
          legacySteps.push({ ...step });
          learningSteps.push({
            id: step.id,
            type: 'video_simulation',
            mediaMode: 'none',
            textDeva: step.textDeva || '',
            textEng: step.textEng || step.title || '',
            textHng: step.textHng || '',
            imageUrl: step.imageUrl || ''
          });
        } else if (step.type === 'simulation') {
          legacySteps.push({ ...step });
          const isSaraswati = step.params?.mode === 1.0 || step.params?.mode === 1;
          if (isSaraswati) {
            learningSteps.push({
              id: step.id,
              type: 'saraswati',
              title: step.questionText || 'Concept Discovery',
              titleHng: step.questionTextHng || '',
              definitionEn: step.textEng || ''
            });
          } else {
            learningSteps.push({
              id: step.id,
              type: 'video_simulation',
              mediaMode: 'simulation_only',
              simulationId: step.simulationId,
              params: step.params || {},
              subStepCount: step.subStepCount || 1,
              textEng: step.questionText || ''
            });
          }
        } else if (step.type === 'predict_quiz') {
          legacySteps.push({ ...step });
          const q: AnveshanaQuestion = {
            id: `${step.id}_q0`,
            questionType: 'mcq',
            bloomsLevel: 'understand',
            questionEn: step.question || step.questionText || '',
            options: step.options || ['Option A', 'Option B'],
            correctOptionIndex: step.correctOptionIndex ?? 0,
            explanationEn: step.explanation || '',
            hints: step.hints || []
          };
          learningSteps.push({
            id: step.id,
            type: 'anveshana',
            title: 'Check Your Understanding',
            targetModuleId: step.targetModuleId || mod.id,
            pool: [q],
            questionPool: [q],
            questionsPerAttempt: 1,
            passingScore: 1
          });
        } else if (step.type === 'heritage_connection') {
          legacySteps.push({ ...step });
          learningSteps.push({
            id: step.id,
            type: 'video_simulation',
            mediaMode: 'none',
            title: step.title,
            textEng: step.significance || '',
            textHng: step.textHng || '',
            gurutatva: {
              titleEn: step.title || '',
              bodyEn: step.significance || '',
              bodyHng: step.textHng || '',
              sutra: step.sutra || '',
              sutraTranslation: step.translation || ''
            }
          });
        } else {
          legacySteps.push({ ...step });
          learningSteps.push({ ...step });
        }
      });

      return {
        ...mod,
        steps: legacySteps,
        learningSteps: learningSteps
      };
    })
  }));
}
