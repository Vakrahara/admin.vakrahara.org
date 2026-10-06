import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  formatModuleId, 
  formatSimulationId, 
  isValidSemanticId, 
  validateSemanticId,
  SEMANTIC_ID_REGEX 
} from '@/lib/semanticId';
import { getShortCode, getDisciplineRegistry } from '@/lib/disciplinesRegistry';
import { createChildModule, patchModule } from '@/app/dashboard/content/utils/curriculumMutations';
import { Chapter } from '@/types/curriculum';

describe('TICKET-03: Semantic ID Generator (§R1 & R4)', () => {
  it('formats canonical module ID (§R4 requirement)', () => {
    const result = formatModuleId('phys', 'optics', 'snells_law');
    assert.equal(result, 'mod_phys_optics_snells_law');
    assert.equal(isValidSemanticId(result, 'mod'), true);
    assert.equal(SEMANTIC_ID_REGEX.test(result), true);
  });

  it('formats canonical simulation ID (§R4 requirement)', () => {
    const result = formatSimulationId('chem', 'reactions', 'electrolysis');
    assert.equal(result, 'sim_chem_reactions_electrolysis');
    assert.equal(isValidSemanticId(result, 'sim'), true);
    assert.equal(SEMANTIC_ID_REGEX.test(result), true);
  });

  it('normalizes uppercase and trims whitespace in module IDs', () => {
    const result = formatModuleId('  PHYS  ', '  Optics  ', '  Snells_Law  ');
    assert.equal(result, 'mod_phys_optics_snells_law');
  });

  it('sanitizes special characters and spaces into underscores', () => {
    const result = formatModuleId('phys', 'wave-optics', "young's double slit");
    assert.equal(result, 'mod_phys_wave_optics_young_s_double_slit');
    assert.equal(isValidSemanticId(result, 'mod'), true);
  });

  it('handles numbers and hyphens in domain and concept slugs', () => {
    const result = formatModuleId('math', '3d-geometry', 'section-formula-1');
    assert.equal(result, 'mod_math_3d_geometry_section_formula_1');
    assert.equal(isValidSemanticId(result, 'mod'), true);
  });

  it('validates semantic ID matching expected prefix', () => {
    const modId = 'mod_math_geometry_pythagoras';
    assert.equal(isValidSemanticId(modId, 'mod'), true);
    assert.equal(isValidSemanticId(modId, 'ch'), false);
    assert.equal(isValidSemanticId('invalid-mod-id', 'mod'), false);

    const validation = validateSemanticId(modId, 'mod');
    assert.equal(validation.valid, true);

    const wrongPrefixValidation = validateSemanticId(modId, 'sim');
    assert.equal(wrongPrefixValidation.valid, false);
  });
});

describe('TICKET-03: Disciplines Registry Short Codes', () => {
  it('correctly maps 14 canonical disciplines to short codes', () => {
    const registry = getDisciplineRegistry();
    assert.equal(registry.length, 14);

    assert.equal(getShortCode('disc_bhautik'), 'phys');
    assert.equal(getShortCode('disc_rasayan'), 'chem');
    assert.equal(getShortCode('disc_jiva_vigyan'), 'bio');
    assert.equal(getShortCode('disc_ganita'), 'math');
    assert.equal(getShortCode('disc_sanganak'), 'cs');
    assert.equal(getShortCode('disc_data_science'), 'ds');
    assert.equal(getShortCode('disc_kritrim_buddhi'), 'ai');
    assert.equal(getShortCode('disc_darshana'), 'darsh');
    assert.equal(getShortCode('disc_sanskrit'), 'skt');
    assert.equal(getShortCode('disc_khagol'), 'astro');
    assert.equal(getShortCode('disc_itihasa'), 'hist');
    assert.equal(getShortCode('disc_samajik'), 'soc');
    assert.equal(getShortCode('disc_rajniti'), 'pol');
    assert.equal(getShortCode('disc_yoga'), 'yoga');
  });

  it('falls back gracefully on unknown discipline IDs', () => {
    const code = getShortCode('disc_quantum_computing');
    assert.equal(code, 'quan');
  });

  it('safely handles undefined, null, empty, or non-alphanumeric discipline IDs without crashing', () => {
    assert.equal(getShortCode(undefined as any), 'gen');
    assert.equal(getShortCode(null as any), 'gen');
    assert.equal(getShortCode(''), 'gen');
    assert.equal(getShortCode('disc_'), 'gen');
    assert.equal(getShortCode('---'), 'gen');
    assert.equal(getShortCode('   '), 'gen');
  });
});

describe('TICKET-03: Curriculum Mutations createChildModule (§R2)', () => {
  const baseChapter: Chapter = {
    id: 'chapter_cbse_10_light',
    title: 'Light - Reflection and Refraction',
    branchId: 'physics',
    board: 'cbse',
    grade: 10,
    applicableGrades: [10],
    disciplineIds: ['disc_bhautik'],
    modules: [],
    pyqs: []
  };

  it('generates canonical initial ID for first module', () => {
    const module = createChildModule(baseChapter, { discipline: 'disc_bhautik', grade: '10' });
    assert.equal(module.id, 'mod_phys_core_m1');
    assert.equal(module.primaryDisciplineId, 'disc_bhautik');
    assert.deepEqual(module.applicableGrades, [10]);
  });

  it('increments module index based on existing modules count', () => {
    const chapterWithModules: Chapter = {
      ...baseChapter,
      modules: [
        { id: 'mod_phys_core_m1', title: 'M1', steps: [] },
        { id: 'mod_phys_core_m2', title: 'M2', steps: [] },
        { id: 'mod_phys_core_m3', title: 'M3', steps: [] }
      ]
    };
    const module = createChildModule(chapterWithModules, { discipline: 'disc_bhautik', grade: '10' });
    assert.equal(module.id, 'mod_phys_core_m4');
  });

  it('inherits discipline from chapter when available', () => {
    const chemChapter: Chapter = {
      ...baseChapter,
      disciplineIds: ['disc_rasayan'],
      modules: []
    };
    const module = createChildModule(chemChapter, { discipline: 'all', grade: 'all' });
    assert.equal(module.id, 'mod_chem_core_m1');
  });

  it('avoids ID collisions when module indices have gaps or deletions', () => {
    const chapterWithGaps: Chapter = {
      ...baseChapter,
      modules: [
        { id: 'mod_phys_core_m2', title: 'M2', steps: [] }
      ]
    };
    const module = createChildModule(chapterWithGaps, { discipline: 'disc_bhautik', grade: '10' });
    assert.equal(module.id, 'mod_phys_core_m3');
  });

  it('patchModule updates module ID correctly without mutating original array', () => {
    const original: Chapter[] = [
      {
        ...baseChapter,
        modules: [{ id: 'mod_phys_core_m1', title: 'Original', steps: [] }]
      }
    ];
    const patched = patchModule(original, baseChapter.id, 'mod_phys_core_m1', { id: 'mod_phys_optics_reflection' });
    assert.equal(patched[0].modules[0].id, 'mod_phys_optics_reflection');
    assert.equal(original[0].modules[0].id, 'mod_phys_core_m1');
  });
});
