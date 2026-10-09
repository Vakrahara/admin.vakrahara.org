import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateCurriculum } from '@/app/dashboard/content/utils/curriculumValidation';
import { normalizeCurriculumData } from '@/app/dashboard/content/utils/curriculumNormalize';
import canonicalCurriculumData from '@/data/canonical_curriculum.json';
import { Chapter } from '@/types/curriculum';

describe('Curriculum Validation & Canonical Integrity', () => {
  it('validates canonical curriculum dataset with 0 errors', () => {
    const rawErrors = validateCurriculum(canonicalCurriculumData as unknown as Chapter[]);
    assert.deepEqual(rawErrors, [], `Expected 0 validation errors, got: ${JSON.stringify(rawErrors, null, 2)}`);
  });

  it('validates normalized canonical curriculum dataset with 0 errors', () => {
    const normalized = normalizeCurriculumData(canonicalCurriculumData as any);
    const normalizedErrors = validateCurriculum(normalized);
    assert.deepEqual(normalizedErrors, [], `Expected 0 normalized errors, got: ${JSON.stringify(normalizedErrors, null, 2)}`);
  });

  it('rejects an empty curriculum dataset', () => {
    const errors = validateCurriculum([]);
    assert.ok(errors.length > 0);
    assert.ok(errors.includes('At least one chapter is required.'));
  });

  it('safely handles null, undefined, or non-array inputs without throwing', () => {
    const nullErrors = validateCurriculum(null as any);
    assert.ok(nullErrors.includes('At least one chapter is required.'));

    const undefErrors = validateCurriculum(undefined as any);
    assert.ok(undefErrors.includes('At least one chapter is required.'));
  });

  it('detects duplicate chapter IDs and missing chapter titles', () => {
    const badCurriculum: Chapter[] = [
      {
        id: 'ch_duplicate',
        title: '',
        branchId: 'physics',
        modules: [],
        pyqs: [],
      },
      {
        id: 'ch_duplicate',
        title: 'Valid Chapter',
        branchId: 'physics',
        modules: [],
        pyqs: [],
      },
    ];

    const errors = validateCurriculum(badCurriculum);
    assert.ok(errors.some(e => e.includes('Duplicate Chapter ID: "ch_duplicate"')));
    assert.ok(errors.some(e => e.includes('Chapter ID "ch_duplicate" has no Title')));
  });

  it('handles chapters with undefined modules and modules with undefined steps gracefully', () => {
    const malformed = [
      {
        id: 'ch_missing_mods',
        title: 'Missing Modules Chapter',
        branchId: 'physics',
      },
      {
        id: 'ch_valid_with_bad_mod',
        title: 'Bad Mod Chapter',
        branchId: 'physics',
        modules: [
          {
            id: 'mod_no_steps',
            title: 'No Steps Mod',
          },
        ],
      },
    ] as any;

    const errors = validateCurriculum(malformed);
    assert.ok(errors.some(e => e.includes('has no valid modules list')));
    assert.ok(errors.some(e => e.includes('has no valid steps list')));
  });

  it('detects duplicate step IDs and missing step IDs in modules', () => {
    const badCurriculum: Chapter[] = [
      {
        id: 'ch_test',
        title: 'Test Chapter',
        branchId: 'physics',
        pyqs: [],
        modules: [
          {
            id: 'mod_test',
            title: 'Test Module',
            steps: [
              {
                id: 'stp_test_1',
                type: 'video_simulation',
                mediaMode: 'simulation_only',
                simulationId: 'sim_test',
              },
              {
                id: 'stp_test_1',
                type: 'video_simulation',
                mediaMode: 'simulation_only',
                simulationId: 'sim_test_2',
              },
              {
                id: '',
                type: 'video_simulation',
                mediaMode: 'simulation_only',
                simulationId: 'sim_test_3',
              },
            ],
          },
        ],
      },
    ];

    const errors = validateCurriculum(badCurriculum);
    assert.ok(errors.some(e => e.includes('Duplicate Step ID: "stp_test_1"')));
    assert.ok(errors.some(e => e.includes('has no ID')));
  });

  it('enforces Saraswati step definition and mini-steps requirements', () => {
    const invalidSaraswati: Chapter[] = [
      {
        id: 'ch_saraswati_test',
        title: 'Saraswati Test Chapter',
        branchId: 'physics',
        pyqs: [],
        modules: [
          {
            id: 'mod_saraswati_test',
            title: 'Saraswati Test Module',
            steps: [
              {
                id: 'stp_saraswati_stub',
                type: 'saraswati',
                definitionEn: '',
                miniSteps: [],
              },
            ],
          },
        ],
      },
    ];

    const errors = validateCurriculum(invalidSaraswati);
    assert.ok(errors.some(e => e.includes('Saraswati step "stp_saraswati_stub" has no assembled definition.')));
    assert.ok(errors.some(e => e.includes('Saraswati step "stp_saraswati_stub" must have at least 1 mini-step.')));
  });

  it('validates Saraswati mini-step prompt, options length, and correctIndex bounds', () => {
    const invalidMiniSteps: Chapter[] = [
      {
        id: 'ch_mini_test',
        title: 'Mini Test Chapter',
        branchId: 'physics',
        pyqs: [],
        modules: [
          {
            id: 'mod_mini_test',
            title: 'Mini Test Module',
            steps: [
              {
                id: 'stp_mini_test',
                type: 'saraswati',
                definitionEn: 'Valid definition',
                miniSteps: [
                  {
                    questionEn: '',
                    options: ['Only one'],
                    correctIndex: 5,
                    answerEn: '',
                    answerHi: '',
                    answerHng: '',
                    definitionFragmentEn: '',
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const errors = validateCurriculum(invalidMiniSteps);
    assert.ok(errors.some(e => e.includes('has no English question')));
    assert.ok(errors.some(e => e.includes('must have at least 2 options')));
    assert.ok(errors.some(e => e.includes('has an invalid correctIndex')));
  });

  it('accepts valid Saraswati steps with definition and mini-steps', () => {
    const validSaraswati: Chapter[] = [
      {
        id: 'ch_saraswati_valid',
        title: 'Saraswati Valid Chapter',
        branchId: 'physics',
        pyqs: [],
        modules: [
          {
            id: 'mod_saraswati_valid',
            title: 'Saraswati Valid Module',
            steps: [
              {
                id: 'stp_saraswati_valid',
                type: 'saraswati',
                definitionEn: 'A wave is a periodic disturbance.',
                miniSteps: [
                  {
                    questionEn: 'What is created at the surface?',
                    options: ['Displacement', 'Periodic disturbance'],
                    correctIndex: 1,
                    answerEn: 'Periodic disturbance',
                    answerHi: '',
                    answerHng: '',
                    definitionFragmentEn: 'A wave is a periodic disturbance.',
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const errors = validateCurriculum(validSaraswati);
    assert.equal(errors.length, 0);
  });

  it('reproduces exactly 10 validation errors if the 5 empty stubs are reintroduced', () => {
    const cloned: Chapter[] = JSON.parse(JSON.stringify(canonicalCurriculumData));
    const chOptics = cloned.find(c => c.id === 'ch_cbse_c10_phys_light_reflection_and_refraction');
    const modWaves = chOptics?.modules.find(m => m.id === 'mod_phys_optics_types_of_waves');
    if (modWaves) {
      modWaves.steps = [
        { ...modWaves.steps[0] },
        { id: 'mod_phys_optics_types_of_waves_stp_02', type: 'saraswati', title: 'Concept Discovery', definitionEn: '' },
        { ...modWaves.steps[1], id: 'mod_phys_optics_types_of_waves_stp_03' },
        { id: 'mod_phys_optics_types_of_waves_stp_04', type: 'saraswati', title: 'Concept Discovery', definitionEn: '' },
        { ...modWaves.steps[2], id: 'mod_phys_optics_types_of_waves_stp_05' },
        { id: 'mod_phys_optics_types_of_waves_stp_06', type: 'saraswati', title: 'Concept Discovery', definitionEn: '' },
        { ...modWaves.steps[3], id: 'mod_phys_optics_types_of_waves_stp_07' },
        { id: 'mod_phys_optics_types_of_waves_stp_08', type: 'saraswati', title: 'Concept Discovery', definitionEn: '' },
      ] as any;
    }

    const chSound = cloned.find(c => c.id === 'ch_cbse_c9_phys_sound');
    const modSound = chSound?.modules.find(m => m.id === 'mod_phys_sound_what_is_a_wave');
    if (modSound) {
      modSound.steps.push({
        id: 'mod_phys_sound_what_is_a_wave_stp_02',
        type: 'saraswati',
        title: 'Concept Discovery',
        definitionEn: '',
      } as any);
    }

    const errors = validateCurriculum(cloned);
    assert.equal(errors.length, 10, `Expected exactly 10 validation errors, got ${errors.length}: ${JSON.stringify(errors, null, 2)}`);
    assert.ok(errors.every(e => e.includes('Saraswati step')));
  });
});
