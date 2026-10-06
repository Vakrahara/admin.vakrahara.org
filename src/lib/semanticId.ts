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
