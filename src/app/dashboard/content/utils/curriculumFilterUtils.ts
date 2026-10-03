/**
 * Curriculum Filtering Utilities for Amrtam Vidyāpīṭha CMS (§R1, §R2).
 * Supports 3-level Board > Grade > Discipline taxonomic filtering with full backward compatibility.
 */

import { Chapter } from '@/types/curriculum';
import { getDisciplineById } from '@/lib/disciplinesRegistry';

export interface CurriculumFilterState {
  board: string;       // 'all' | 'cbse' | 'icse'
  grade: string;       // 'all' | '8' | '9' | '10' | '11' | '12'
  discipline: string;  // 'all' | disciplineId (e.g. 'disc_rasayan')
}

export const DEFAULT_CURRICULUM_FILTERS: CurriculumFilterState = {
  board: 'all',
  grade: 'all',
  discipline: 'all'
};

export const BRANCH_TO_DISCIPLINE: Record<string, string> = {
  // Physical & Chemical Sciences
  physics: 'disc_bhautik',
  bhautik: 'disc_bhautik',
  physical_science: 'disc_bhautik',
  chemistry: 'disc_rasayan',
  chem: 'disc_rasayan',
  rasayan: 'disc_rasayan',
  rasayana: 'disc_rasayan',

  // Life Sciences
  biology: 'disc_jiva_vigyan',
  bio: 'disc_jiva_vigyan',
  jiva_vigyan: 'disc_jiva_vigyan',
  life_sciences: 'disc_jiva_vigyan',
  botany: 'disc_jiva_vigyan',
  zoology: 'disc_jiva_vigyan',

  // Mathematical & Computing Sciences
  math: 'disc_ganita',
  maths: 'disc_ganita',
  mathematics: 'disc_ganita',
  ganita: 'disc_ganita',
  ganitam: 'disc_ganita',
  algebra: 'disc_ganita',
  geometry: 'disc_ganita',
  calculus: 'disc_ganita',

  cs: 'disc_sanganak',
  sanganak: 'disc_sanganak',
  computer_science: 'disc_sanganak',
  computerscience: 'disc_sanganak',
  it: 'disc_sanganak',
  information_technology: 'disc_sanganak',
  info_tech: 'disc_sanganak',
  coding: 'disc_sanganak',

  data_science: 'disc_data_science',
  datascience: 'disc_data_science',
  sankhyiki: 'disc_data_science',
  statistics: 'disc_data_science',
  stats: 'disc_data_science',

  ai: 'disc_kritrim_buddhi',
  artificial_intelligence: 'disc_kritrim_buddhi',
  kritrim_buddhi: 'disc_kritrim_buddhi',
  ml: 'disc_kritrim_buddhi',
  machine_learning: 'disc_kritrim_buddhi',

  // Indic Humanities, Philosophy & Law
  philosophy: 'disc_darshana',
  logic: 'disc_darshana',
  darshana: 'disc_darshana',
  epistemology: 'disc_darshana',

  sanskrit: 'disc_sanskrit',
  linguistics: 'disc_sanskrit',
  vak_siddhi: 'disc_sanskrit',
  vyakarana: 'disc_sanskrit',

  astronomy: 'disc_khagol',
  astro: 'disc_khagol',
  khagol: 'disc_khagol',

  economics: 'disc_arthashastra',
  econ: 'disc_arthashastra',
  arthashastra: 'disc_arthashastra',
  commerce: 'disc_arthashastra',
  finance: 'disc_arthashastra',

  civics: 'disc_raja_niti',
  law: 'disc_raja_niti',
  political_science: 'disc_raja_niti',
  polsci: 'disc_raja_niti',
  pol_science: 'disc_raja_niti',
  polity: 'disc_raja_niti',
  raja_niti: 'disc_raja_niti',

  geography: 'disc_bhugol',
  geo: 'disc_bhugol',
  bhugol: 'disc_bhugol',

  history: 'disc_itihasa',
  hist: 'disc_itihasa',
  itihasa: 'disc_itihasa',
  archaeology: 'disc_itihasa'
};

/**
 * Resolves a branch string or synonym to its canonical discipline ID.
 */
export function resolveBranchDisciplineId(branch?: string): string | undefined {
  if (!branch) return undefined;
  const clean = branch.toLowerCase().trim();
  const normalized = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (BRANCH_TO_DISCIPLINE[clean]) return BRANCH_TO_DISCIPLINE[clean];
  if (BRANCH_TO_DISCIPLINE[normalized]) return BRANCH_TO_DISCIPLINE[normalized];
  if (clean.startsWith('disc_')) return clean;
  if (normalized.startsWith('disc_')) return normalized;
  const prefixed = `disc_${clean}`;
  if (getDisciplineById(prefixed)) return prefixed;
  const normPrefixed = `disc_${normalized}`;
  if (getDisciplineById(normPrefixed)) return normPrefixed;
  return undefined;
}

/**
 * Checks whether a chapter matches the selected board filter.
 */
export function matchesBoard(chapter: Chapter, board: string): boolean {
  if (!board || board === 'all') return true;
  const bLower = board.toLowerCase().trim();

  if (chapter.board) {
    return chapter.board.toLowerCase().trim() === bLower;
  }

  const cleanId = (chapter.id || '').toLowerCase();
  const cleanTitle = (chapter.title || '').toLowerCase();
  if (cleanId.includes('icse') || cleanTitle.includes('icse')) {
    return bLower === 'icse';
  }
  if (cleanId.includes('cbse') || cleanTitle.includes('cbse')) {
    return bLower === 'cbse';
  }

  return bLower === 'cbse';
}

const GRADE_UNAMBIGUOUS_ID_REGEX = /(?:^|[^0-9a-z])(?:c|class|grade|std)[-_]?0*([0-9]+)(?:[^0-9a-z]|$)/gi;
const GRADE_FALLBACK_CH_REGEX = /(?:^|[^0-9a-z])ch[-_]?0*([0-9]+)(?:[^0-9a-z]|$)/gi;

function extractGradesFromId(idStr?: string): number[] {
  if (!idStr) return [];
  const clean = idStr.toLowerCase();
  const unambiguous = [...clean.matchAll(GRADE_UNAMBIGUOUS_ID_REGEX)].map(m => Number(m[1]));
  if (unambiguous.length > 0) return unambiguous;
  return [...clean.matchAll(GRADE_FALLBACK_CH_REGEX)].map(m => Number(m[1]));
}

const GRADE_TITLE_REGEX = /(?:^|[^0-9a-z])(?:(?:class|grade|std|standard)[-\s_.:]*0*([0-9]+)(?:th|st|nd|rd)?|0*([0-9]+)(?:th|st|nd|rd)?[-\s_.:]*(?:class|grade|std|standard))(?:[^0-9a-z]|$)/gi;
const ROMAN_GRADES: Record<string, number> = {
  'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10, 'xi': 11, 'xii': 12
};
const ROMAN_TITLE_REGEX = /(?:^|[^0-9a-z])(?:class|grade|std|standard)[-\s_.:]*(viii|vii|vi|xii|xi|ix|x)(?:[^0-9a-z]|$)/gi;

/**
 * Checks whether a chapter matches the selected grade filter.
 */
export function matchesGrade(chapter: Chapter, grade: string): boolean {
  if (!grade || grade === 'all') return true;
  const gNum = Number(grade);
  if (Number.isNaN(gNum)) return true;

  // 1. Explicit chapter grade (number or string)
  if (chapter.grade !== undefined && chapter.grade !== null && Number(chapter.grade) === gNum) {
    return true;
  }
  if (Array.isArray(chapter.applicableGrades) && chapter.applicableGrades.some(g => Number(g) === gNum)) {
    return true;
  }

  // 2. ID pattern matching with disambiguation between class and chapter index
  const idGrades = extractGradesFromId(chapter.id);
  if (idGrades.includes(gNum)) {
    return true;
  }

  // 3. Title pattern matching (supports punctuation & Roman numerals)
  const cleanTitle = (chapter.title || '').toLowerCase();
  const titleMatches = [...cleanTitle.matchAll(GRADE_TITLE_REGEX)];
  if (titleMatches.some(m => Number(m[1] || m[2]) === gNum)) {
    return true;
  }

  const romanMatches = [...cleanTitle.matchAll(ROMAN_TITLE_REGEX)];
  if (romanMatches.some(m => ROMAN_GRADES[m[1].toLowerCase()] === gNum)) {
    return true;
  }

  // 4. Child module applicableGrades or timelineMetadata applicableGrades
  if (Array.isArray(chapter.modules)) {
    for (const mod of chapter.modules) {
      if (Array.isArray(mod.applicableGrades) && mod.applicableGrades.some(g => Number(g) === gNum)) {
        return true;
      }
      if (Array.isArray(mod.timelineMetadata?.applicableGrades) && mod.timelineMetadata.applicableGrades.some(g => Number(g) === gNum)) {
        return true;
      }
      const modGrades = extractGradesFromId(mod.id);
      if (modGrades.includes(gNum)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks whether a chapter matches the selected discipline filter.
 * Matches chapter branchId, disciplineIds, or any module's disciplineIds or primaryDisciplineId.
 */
export function matchesDiscipline(chapter: Chapter, disciplineId: string): boolean {
  if (!disciplineId || disciplineId === 'all') return true;
  const cleanId = disciplineId.toLowerCase().trim();

  const isMatch = (candidate?: string): boolean => {
    if (!candidate) return false;
    const cClean = candidate.toLowerCase().trim();
    if (cClean === cleanId || cClean.replace('disc_', '') === cleanId.replace('disc_', '')) {
      return true;
    }
    const resolved = resolveBranchDisciplineId(cClean);
    return Boolean(resolved && resolved.toLowerCase() === cleanId);
  };

  // 1. Explicit chapter disciplineIds
  if (Array.isArray(chapter.disciplineIds) && chapter.disciplineIds.some(isMatch)) {
    return true;
  }

  // 2. Semantic branchId matching
  if (isMatch(chapter.branchId)) {
    return true;
  }

  // 3. Child module disciplineIds or primaryDisciplineId
  if (Array.isArray(chapter.modules)) {
    for (const mod of chapter.modules) {
      if (isMatch(mod.primaryDisciplineId)) {
        return true;
      }
      if (Array.isArray(mod.disciplineIds) && mod.disciplineIds.some(isMatch)) {
        return true;
      }
      const modBranch = (mod as any).branchId;
      if (isMatch(modBranch)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Filters chapters according to the current 3-level filter state.
 */
export function filterChapters(chapters: Chapter[], filters: CurriculumFilterState): Chapter[] {
  if (!chapters) return [];
  return chapters.filter(ch =>
    matchesBoard(ch, filters.board) &&
    matchesGrade(ch, filters.grade) &&
    matchesDiscipline(ch, filters.discipline)
  );
}

/**
 * Checks if any filter is active.
 */
export function isCurriculumFiltered(filters: CurriculumFilterState): boolean {
  return filters.board !== 'all' || filters.grade !== 'all' || filters.discipline !== 'all';
}
