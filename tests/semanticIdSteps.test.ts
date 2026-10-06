import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatStepId,
  deriveSimulationIdFromModuleId,
  formatCheckpointId,
  formatHotspotId,
  realignModuleStepIds,
  isValidSemanticId,
} from '@/lib/semanticId';

describe('Canonical Step IDs & Simulation Derivation (§R1–§R4)', () => {
  it('formats canonical step ID with zero-padded sequence numbers', () => {
    assert.equal(
      formatStepId('mod_phys_optics_snells_law', 1),
      'mod_phys_optics_snells_law_stp_01'
    );
    assert.equal(
      formatStepId('mod_phys_optics_snells_law', 9),
      'mod_phys_optics_snells_law_stp_09'
    );
    assert.equal(
      formatStepId('mod_phys_optics_snells_law', 10),
      'mod_phys_optics_snells_law_stp_10'
    );
    assert.equal(
      formatStepId('mod_phys_optics_snells_law', 25),
      'mod_phys_optics_snells_law_stp_25'
    );
  });

  it('safely handles non-positive step indices by clamping to 1', () => {
    assert.equal(
      formatStepId('mod_phys_optics_snells_law', 0),
      'mod_phys_optics_snells_law_stp_01'
    );
    assert.equal(
      formatStepId('mod_phys_optics_snells_law', -5),
      'mod_phys_optics_snells_law_stp_01'
    );
  });

  it('derives canonical simulation ID from module ID with prefix swap', () => {
    assert.equal(
      deriveSimulationIdFromModuleId('mod_phys_optics_snells_law'),
      'sim_phys_optics_snells_law'
    );
    assert.equal(
      isValidSemanticId(deriveSimulationIdFromModuleId('mod_phys_optics_snells_law'), 'sim'),
      true
    );
  });

  it('derives simulation ID with optional sanitized suffix', () => {
    assert.equal(
      deriveSimulationIdFromModuleId('mod_phys_optics_snells_law', 'part2'),
      'sim_phys_optics_snells_law_part2'
    );
    assert.equal(
      deriveSimulationIdFromModuleId('mod_phys_optics_snells_law', 'Part 2 & Lab!'),
      'sim_phys_optics_snells_law_part_2___lab_'
    );
  });

  it('handles non-mod prefixed module IDs gracefully in simulation derivation', () => {
    assert.equal(
      deriveSimulationIdFromModuleId('legacy_wave_module'),
      'sim_legacy_wave_module'
    );
  });

  it('formats canonical video checkpoint IDs', () => {
    const stepId = 'mod_phys_optics_snells_law_stp_01';
    assert.equal(formatCheckpointId(stepId, 1), `chk_${stepId}_01`);
    assert.equal(formatCheckpointId(stepId, 4), `chk_${stepId}_04`);
    assert.equal(formatCheckpointId(stepId, 12), `chk_${stepId}_12`);
    assert.equal(formatCheckpointId(stepId, 0), `chk_${stepId}_01`);
  });

  it('formats canonical text hotspot IDs', () => {
    const stepId = 'mod_phys_optics_snells_law_stp_01';
    assert.equal(formatHotspotId(stepId, 'refraction_index'), `hot_${stepId}_refraction_index`);
    assert.equal(formatHotspotId(stepId, 'Critical Angle!'), `hot_${stepId}_critical_angle`);
  });

  it('re-aligns orphaned legacy step IDs and cascades to checkpoints and hotspots', () => {
    const module = {
      id: 'mod_phys_optics_reflection',
      title: 'Reflection of Light',
      steps: [
        {
          id: 'step_legacy_1',
          type: 'video_simulation',
          checkpoints: [
            { id: 'old_chk_1', timestampMs: 5000, type: 'question' as const },
            { id: 'old_chk_2', timestampMs: 12000, type: 'question' as const },
          ],
          hotspots: [
            { id: 'hot_old_focal_point', targetWordOrPhrase: 'focus', action: 'inline_card' as const },
          ],
        },
        {
          id: 'step_legacy_2',
          type: 'saraswati',
        },
      ],
    };

    const { updatedModule, changedCount } = realignModuleStepIds(module);

    assert.equal(changedCount, 2);
    assert.equal(updatedModule.steps[0].id, 'mod_phys_optics_reflection_stp_01');
    assert.equal(updatedModule.steps[0].checkpoints?.[0].id, 'chk_mod_phys_optics_reflection_stp_01_01');
    assert.equal(updatedModule.steps[0].checkpoints?.[1].id, 'chk_mod_phys_optics_reflection_stp_01_02');
    assert.equal(updatedModule.steps[0].hotspots?.[0].id, 'hot_mod_phys_optics_reflection_stp_01_focal_point');
    assert.equal(updatedModule.steps[1].id, 'mod_phys_optics_reflection_stp_02');

    // Re-running alignment on already aligned module yields 0 changedCount and preserves hotspot ID idempotently
    const secondPass = realignModuleStepIds(updatedModule);
    assert.equal(secondPass.changedCount, 0);
    assert.equal(
      secondPass.updatedModule.steps[0].hotspots?.[0].id,
      'hot_mod_phys_optics_reflection_stp_01_focal_point'
    );
  });

  it('re-aligns module where step IDs are already aligned but checkpoints/hotspots are legacy', () => {
    const partiallyAligned = {
      id: 'mod_phys_optics_reflection',
      steps: [
        {
          id: 'mod_phys_optics_reflection_stp_01',
          type: 'video_simulation',
          checkpoints: [{ id: 'legacy_chk_1', timestampMs: 3000, type: 'question' as const }],
        },
      ],
    };
    const { updatedModule, changedCount } = realignModuleStepIds(partiallyAligned);
    assert.equal(changedCount, 1);
    assert.equal(
      updatedModule.steps[0].checkpoints?.[0].id,
      'chk_mod_phys_optics_reflection_stp_01_01'
    );
  });

  it('safely handles empty/boundary inputs in ID generators', () => {
    assert.equal(formatStepId('', 1), 'stp_01');
    assert.equal(deriveSimulationIdFromModuleId(''), 'sim_interactive');
    assert.equal(deriveSimulationIdFromModuleId('mod_'), 'sim_interactive');
    assert.equal(formatCheckpointId('', 1), 'chk_step_01');
  });

  it('safely handles modules with empty or undefined steps', () => {
    const emptyMod = { id: 'mod_phys_optics_empty', title: 'Empty' };
    const { updatedModule, changedCount } = realignModuleStepIds(emptyMod);
    assert.equal(changedCount, 0);
    assert.deepEqual(updatedModule.steps, []);
  });
});

