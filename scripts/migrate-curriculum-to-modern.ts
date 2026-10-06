import * as fs from 'fs';
import * as path from 'path';

interface MigrationReport {
  chaptersMigrated: number;
  modulesMigrated: number;
  stepsMigrated: number;
  pyqsUpdated: number;
  details: string[];
}

function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/^\d+[\s.)-]+/, '') // remove leading numbers like "1. ", "42. "
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function formatStepId(moduleId: string, stepIndex: number): string {
  const cleanMod = moduleId.trim();
  const num = Math.max(1, stepIndex);
  const pad = String(num).padStart(2, '0');
  return `${cleanMod}_stp_${pad}`;
}

function deriveSimulationIdFromModuleId(moduleId: string, suffix?: string): string {
  const cleanMod = moduleId.trim();
  let baseSim = cleanMod.startsWith('mod_') ? cleanMod.replace(/^mod_/, 'sim_') : `sim_${cleanMod}`;
  if (suffix && suffix.trim()) {
    const cleanSuffix = suffix.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    baseSim = `${baseSim}_${cleanSuffix}`;
  }
  return baseSim;
}

function formatCheckpointId(stepId: string, seq: number): string {
  const cleanStep = stepId.trim();
  const pad = String(Math.max(1, seq)).padStart(2, '0');
  return `chk_${cleanStep}_${pad}`;
}

function runMigration() {
  const curriculumPath = path.resolve(__dirname, '../src/data/canonical_curriculum.json');
  console.log(`[Migration] Reading: ${curriculumPath}`);
  const rawContent = fs.readFileSync(curriculumPath, 'utf8');
  const chapters = JSON.parse(rawContent);

  const moduleIdMap = new Map<string, string>();
  const report: MigrationReport = {
    chaptersMigrated: 0,
    modulesMigrated: 0,
    stepsMigrated: 0,
    pyqsUpdated: 0,
    details: [],
  };

  // Phase 1: Determine new Chapter and Module IDs
  const migratedChapters = chapters.map((ch: any) => {
    report.chaptersMigrated++;
    const board = (ch.board || 'cbse').toLowerCase();
    const grade = ch.grade || (ch.id.includes('c10') ? 10 : ch.id.includes('c9') ? 9 : 10);
    const branch = (ch.branchId || 'physics').toLowerCase();
    const disc = branch === 'physics' ? 'phys' : branch === 'chemistry' ? 'chem' : branch === 'math' ? 'ganita' : branch;
    const chSlug = slugify(ch.title.replace(/^Chapter\s*\d+:\s*/i, ''));
    const newChapterId = `ch_${board}_c${grade}_${disc}_${chSlug || 'general'}`;

    const domain = disc === 'phys' && chSlug.includes('sound') ? 'sound' : 'optics';

    const migratedModules = (ch.modules || []).map((mod: any) => {
      report.modulesMigrated++;
      const conceptSlug = slugify(mod.title || mod.id);
      const newModuleId = `mod_${disc}_${domain}_${conceptSlug}`;
      moduleIdMap.set(mod.id, newModuleId);

      // Determine steps: if learningSteps exists with modern steps, prefer it; else convert legacy steps
      const sourceSteps = (mod.learningSteps && mod.learningSteps.length > 0)
        ? mod.learningSteps
        : (mod.steps || []);

      const modernSteps = sourceSteps.map((step: any) => {
        report.stepsMigrated++;
        const type = step.type;

        if (type === 'concept') {
          return {
            type: 'video_simulation',
            mediaMode: 'none',
            title: step.title || 'Concept Exploration',
            textDeva: step.textDeva || '',
            textEng: step.textEng || step.title || '',
            textHng: step.textHng || '',
            imageUrl: step.imageUrl || undefined,
          };
        }

        if (type === 'simulation') {
          const isSaraswati = step.params?.mode === 1.0 || step.params?.mode === 1;
          if (isSaraswati) {
            return {
              type: 'saraswati',
              title: step.questionText || 'Concept Discovery',
              definitionEn: step.textEng || '',
            };
          }
          return {
            type: 'video_simulation',
            mediaMode: 'simulation_only',
            simulationId: step.simulationId ? (step.simulationId.startsWith('sim_') ? step.simulationId : `sim_${step.simulationId}`) : deriveSimulationIdFromModuleId(newModuleId),
            params: step.params || {},
            subStepCount: step.subStepCount || 1,
            textEng: step.questionText || '',
          };
        }

        if (type === 'predict_quiz') {
          const questionText = step.question || step.questionText || 'Conceptual Checkpoint';
          const seedQ = {
            id: `q_${slugify(questionText).slice(0, 24)}_01`,
            questionType: 'mcq',
            bloomsLevel: 'understand',
            questionEn: questionText,
            questionHng: step.questionHng || step.questionTextHng,
            options: step.options && step.options.length > 0 ? step.options : ['Option A', 'Option B'],
            optionsHng: step.optionsHng,
            correctOptionIndex: step.correctOptionIndex ?? 0,
            explanationEn: step.explanation || '',
            explanationHng: step.explanationHng,
            hints: step.hints || [],
          };
          return {
            type: 'anveshana',
            title: step.title || 'Check Your Understanding',
            targetModuleId: newModuleId,
            pool: [seedQ],
            questionPool: [seedQ],
            questionsPerAttempt: 1,
            passingScore: 1,
          };
        }

        if (type === 'heritage_connection') {
          return {
            type: 'video_simulation',
            mediaMode: 'none',
            title: step.title || 'Vedic Heritage Connection',
            textEng: step.significance || '',
            textHng: step.textHng || '',
            gurutatva: {
              titleEn: step.title || 'Kaṇāda on Natural Philosophy',
              titleHng: step.titleHng,
              bodyEn: step.significance || '',
              bodyHng: step.textHng,
              sutra: step.sutra || '',
              sutraTranslation: step.translation || '',
            },
          };
        }

        // Already modern step (video_simulation, saraswati, anveshana)
        if (type === 'video_simulation' && step.simulationId) {
          return {
            ...step,
            simulationId: step.simulationId.startsWith('sim_') ? step.simulationId : `sim_${step.simulationId}`,
          };
        }

        return { ...step };
      });

      // Align all steps and checkpoints
      const alignedSteps = modernSteps.map((step: any, idx: number) => {
        const targetStepId = formatStepId(newModuleId, idx + 1);
        const alignedCheckpoints = (step.checkpoints || []).map((chk: any, cIdx: number) => ({
          ...chk,
          id: formatCheckpointId(targetStepId, cIdx + 1),
        }));
        return {
          ...step,
          id: targetStepId,
          ...(alignedCheckpoints.length > 0 ? { checkpoints: alignedCheckpoints } : {}),
        };
      });

      const updatedMod: any = {
        ...mod,
        id: newModuleId,
        disciplineIds: mod.disciplineIds || [`disc_${disc}`],
        primaryDisciplineId: mod.primaryDisciplineId || `disc_${disc}`,
        applicableGrades: mod.applicableGrades || [grade],
        steps: alignedSteps,
      };

      delete updatedMod.learningSteps;
      return updatedMod;
    });

    // Phase 2: Update pyqs relatedModuleIds
    const updatedPyqs = (ch.pyqs || []).map((pyq: any) => {
      report.pyqsUpdated++;
      const updatedRelated = (pyq.relatedModuleIds || []).map((oldModId: string) => {
        return moduleIdMap.get(oldModId) || oldModId;
      });
      return {
        ...pyq,
        relatedModuleIds: updatedRelated,
      };
    });

    return {
      ...ch,
      id: newChapterId,
      board,
      grade,
      disciplineIds: [`disc_${disc}`],
      modules: migratedModules,
      pyqs: updatedPyqs,
    };
  });

  // Write out canonical curriculum
  fs.writeFileSync(curriculumPath, JSON.stringify(migratedChapters, null, 2) + '\n', 'utf8');

  console.log(`\n================ MIGRATION REPORT ================`);
  console.log(`Chapters migrated: ${report.chaptersMigrated}`);
  console.log(`Modules migrated:  ${report.modulesMigrated}`);
  console.log(`Steps migrated:    ${report.stepsMigrated}`);
  console.log(`PYQs mapped:       ${report.pyqsUpdated}`);
  console.log(`Output:            ${curriculumPath}`);
  console.log(`==================================================\n`);
}

runMigration();
