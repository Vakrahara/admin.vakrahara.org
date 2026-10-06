/**
 * Industry-Grade Prefixed Semantic IDs for Amrtam Vidyāpīṭha (§R3).
 * Enforces <prefix>_<namespace>_<slug> pattern matching ^[a-z]{2,5}_[a-z0-9_-]+$.
 */

export const SEMANTIC_ID_PREFIXES = {
  DISCIPLINE: 'disc',
  CHAPTER: 'ch',
  MODULE: 'mod',
  STEP: 'stp',
  KEY_TERM: 'kt',
  TIMELINE_EVENT: 'ev',
  TIMELINE_EPOCH: 'ep',
  SIMULATION: 'sim',
  HOTSPOT: 'hot',
  PYQ: 'pyq',
  CHECKPOINT: 'chk',
} as const;

export type SemanticIdPrefix = typeof SEMANTIC_ID_PREFIXES[keyof typeof SEMANTIC_ID_PREFIXES];

export const SEMANTIC_ID_REGEX = /^[a-z]{2,5}_[a-z0-9_-]+$/;

function normalizePrefix(prefix: string): string {
  return prefix.toLowerCase().trim().replace(/^_+|_+$/g, '');
}

export function isValidSemanticId(id: string, expectedPrefix?: SemanticIdPrefix | string): boolean {
  if (!id || typeof id !== 'string') return false;
  if (!SEMANTIC_ID_REGEX.test(id)) return false;
  if (expectedPrefix && expectedPrefix.trim() !== '') {
    const cleanPrefix = normalizePrefix(expectedPrefix);
    if (cleanPrefix) {
      return id.startsWith(`${cleanPrefix}_`);
    }
  }
  return true;
}

export function formatSemanticId(
  prefix: SemanticIdPrefix | string,
  namespace: string,
  slug: string
): string {
  const sanitize = (val: string) =>
    val.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  const cleanPrefix = normalizePrefix(prefix);
  const cleanNamespace = sanitize(namespace);
  const cleanSlug = sanitize(slug);
  if (!cleanPrefix) {
    if (!cleanNamespace) return cleanSlug;
    if (!cleanSlug) return cleanNamespace;
    return `${cleanNamespace}_${cleanSlug}`;
  }
  if (!cleanNamespace) {
    return cleanSlug ? `${cleanPrefix}_${cleanSlug}` : cleanPrefix;
  }
  if (!cleanSlug) {
    return `${cleanPrefix}_${cleanNamespace}`;
  }
  return `${cleanPrefix}_${cleanNamespace}_${cleanSlug}`;
}

export function validateSemanticId(
  id: string,
  expectedPrefix?: SemanticIdPrefix | string
): { valid: boolean; error?: string } {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return { valid: false, error: 'ID must be a non-empty string.' };
  }
  if (!SEMANTIC_ID_REGEX.test(id)) {
    return {
      valid: false,
      error: `ID "${id}" does not conform to semantic pattern ^[a-z]{2,5}_[a-z0-9_-]+$.`,
    };
  }
  if (expectedPrefix && expectedPrefix.trim() !== '') {
    const cleanPrefix = normalizePrefix(expectedPrefix);
    if (cleanPrefix && !id.startsWith(`${cleanPrefix}_`)) {
      return {
        valid: false,
        error: `ID "${id}" must start with designated prefix "${cleanPrefix}_".`,
      };
    }
  }
  return { valid: true };
}

export function formatModuleId(shortCode: string, domain: string, concept: string): string {
  const disc = shortCode.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const cleanDomain = domain.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
  const cleanConcept = concept.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
  return formatSemanticId('mod', `${disc}_${cleanDomain}`, cleanConcept);
}

export function formatSimulationId(shortCode: string, domain: string, concept: string): string {
  const disc = shortCode.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const cleanDomain = domain.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
  const cleanConcept = concept.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
  return formatSemanticId('sim', `${disc}_${cleanDomain}`, cleanConcept);
}

export function formatStepId(moduleId: string, stepIndex: number): string {
  const cleanMod = (moduleId || '').trim().replace(/^_+|_+$/g, '');
  const num = Math.max(1, Math.floor(stepIndex) || 1);
  const pad = String(num).padStart(2, '0');
  return cleanMod ? `${cleanMod}_stp_${pad}` : `stp_${pad}`;
}

export function deriveSimulationIdFromModuleId(moduleId: string, suffix?: string): string {
  const cleanMod = (moduleId || '').trim();
  let baseSim = cleanMod.startsWith('mod_')
    ? cleanMod.replace(/^mod_/, 'sim_')
    : (cleanMod && cleanMod !== 'mod' ? `sim_${cleanMod}` : 'sim_interactive');
  if (baseSim === 'sim_' || baseSim === 'sim') {
    baseSim = 'sim_interactive';
  }
  if (suffix && suffix.trim()) {
    const cleanSuffix = suffix.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    baseSim = `${baseSim}_${cleanSuffix}`;
  }
  return baseSim;
}


export function formatCheckpointId(stepId: string, seq: number): string {
  const cleanStep = (stepId || '').trim().replace(/^_+|_+$/g, '');
  const num = Math.max(1, Math.floor(seq) || 1);
  const pad = String(num).padStart(2, '0');
  return cleanStep ? `chk_${cleanStep}_${pad}` : `chk_step_${pad}`;
}

export function formatHotspotId(stepId: string, termSlug: string): string {
  const cleanStep = (stepId || '').trim().replace(/^_+|_+$/g, '');
  const cleanSlug = (termSlug || 'term').trim().replace(/[^a-z0-9_]/gi, '_').replace(/^_+|_+$/g, '');
  return formatSemanticId('hot', cleanStep || 'step', cleanSlug || 'term');
}

export function realignModuleStepIds<T extends { id: string; steps?: any[]; learningSteps?: any[] }>(
  module: T
): { updatedModule: T & { steps: any[] }; changedCount: number } {
  let changedCount = 0;

  const realignStepList = (stepList: any[] = []) => {
    return stepList.map((step, idx) => {
      const targetStepId = formatStepId(module.id, idx + 1);
      let stepMutated = false;
      if (step.id !== targetStepId) stepMutated = true;

      const updatedCheckpoints = (step.checkpoints || []).map((chk: any, cIdx: number) => {
        const targetChkId = formatCheckpointId(targetStepId, cIdx + 1);
        if (chk.id !== targetChkId) stepMutated = true;
        return {
          ...chk,
          id: targetChkId,
        };
      });

      const updatedHotspots = (step.hotspots || []).map((hot: any) => {
        let termSlug = 'term';
        const rawId = hot.id || '';

        if (rawId.startsWith(`hot_${targetStepId}_`)) {
          termSlug = rawId.slice(`hot_${targetStepId}_`.length);
        } else if (step.id && rawId.startsWith(`hot_${step.id}_`)) {
          termSlug = rawId.slice(`hot_${step.id}_`.length);
        } else if (rawId.includes('_stp_')) {
          const match = rawId.match(/_stp_\d+_(.+)$/);
          if (match && match[1]) termSlug = match[1];
        } else if (rawId.startsWith('hot_')) {
          termSlug = rawId.replace(/^hot_[^_]+_/, '') || 'term';
        } else if (hot.targetWordOrPhrase) {
          termSlug = hot.targetWordOrPhrase
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 16) || 'term';
        }

        const targetHotId = formatHotspotId(targetStepId, termSlug);
        if (hot.id !== targetHotId) stepMutated = true;
        return {
          ...hot,
          id: targetHotId,
        };
      });

      if (stepMutated) changedCount++;

      return {
        ...step,
        id: targetStepId,
        checkpoints: updatedCheckpoints,
        hotspots: updatedHotspots,
      };
    });
  };

  const updatedSteps = module.steps ? realignStepList(module.steps) : [];
  const updatedLearningSteps = module.learningSteps ? realignStepList(module.learningSteps) : undefined;

  return {
    updatedModule: {
      ...module,
      steps: updatedSteps,
      ...(updatedLearningSteps ? { learningSteps: updatedLearningSteps } : {}),
    },
    changedCount,
  };
}


