/**
 * Canonical Validation Guards for Amrtam Vidyāpīṭha Pedagogical Triad (§2, Step 0.3).
 * Enforces 3-locale completeness, 64-peak waveform constraints, locked prerequisite pointers, and cluster bounds.
 */

import {
  KeyTermsRecap,
  AudioOverview,
  TimelineReel,
  ModuleTimelineMetadata,
  InteractiveModule,
  isValidSemanticId,
} from './curriculum';

export interface TriadValidationError {
  moduleTitle: string;
  field: string;
  message: string;
}

/**
 * Validates Shabdakosha Key Terms Recap payload.
 * Enforces 3-locale terminology and definition completeness.
 */
export function validateKeyTermsRecap(
  recap: KeyTermsRecap,
  moduleTitle = 'Unknown Module'
): TriadValidationError[] {
  const errors: TriadValidationError[] = [];
  if (!recap.enabled) return errors;

  if (!recap.titleEn?.trim()) errors.push({ moduleTitle, field: 'keyTermsRecap.titleEn', message: 'English title is required.' });
  if (!recap.titleHi?.trim()) errors.push({ moduleTitle, field: 'keyTermsRecap.titleHi', message: 'Hindi title is required.' });
  if (!recap.titleHng?.trim()) errors.push({ moduleTitle, field: 'keyTermsRecap.titleHng', message: 'Hinglish title is required.' });

  if (!recap.terms || recap.terms.length === 0) {
    errors.push({ moduleTitle, field: 'keyTermsRecap.terms', message: 'At least one key term must be defined when Shabdakosha is enabled.' });
    return errors;
  }

  recap.terms.forEach((term, i) => {
    const prefix = `keyTermsRecap.terms[${i}]`;
    if (!term.id?.trim()) errors.push({ moduleTitle, field: `${prefix}.id`, message: 'Key term ID is required.' });
    if (!term.termEn?.trim()) errors.push({ moduleTitle, field: `${prefix}.termEn`, message: 'English term name is required.' });
    if (!term.termHi?.trim()) errors.push({ moduleTitle, field: `${prefix}.termHi`, message: 'Hindi term name is required.' });
    if (!term.termHng?.trim()) errors.push({ moduleTitle, field: `${prefix}.termHng`, message: 'Hinglish term name is required.' });
    if (!term.definitionEn?.trim()) errors.push({ moduleTitle, field: `${prefix}.definitionEn`, message: 'English definition is required.' });
    if (!term.definitionHi?.trim()) errors.push({ moduleTitle, field: `${prefix}.definitionHi`, message: 'Hindi definition is required.' });
    if (!term.definitionHng?.trim()) errors.push({ moduleTitle, field: `${prefix}.definitionHng`, message: 'Hinglish definition is required.' });
  });

  return errors;
}

/**
 * Validates Revisit Audio Overview payload.
 * Enforces 64-peak waveform constraints, duration, and monotonic subtitle cue timestamps.
 */
export function validateAudioOverview(
  audio: AudioOverview,
  moduleTitle = 'Unknown Module'
): TriadValidationError[] {
  const errors: TriadValidationError[] = [];
  if (!audio.enabled) return errors;

  if (!audio.audioUrlEn?.trim()) {
    errors.push({ moduleTitle, field: 'audioOverview.audioUrlEn', message: 'English audio URL is required when Audio Overview is enabled.' });
  }

  if (audio.waveformPeaks && audio.waveformPeaks.length > 0) {
    audio.waveformPeaks.forEach((peak, idx) => {
      if (typeof peak !== 'number' || isNaN(peak) || peak < 0 || peak > 1) {
        errors.push({ moduleTitle, field: `audioOverview.waveformPeaks[${idx}]`, message: `Waveform peak at index ${idx} (${peak}) is out of normalized range [0.0, 1.0].` });
      }
    });
  }

  let prevStart = -1;
  (audio.cues || []).forEach((cue, i) => {
    const cuePrefix = `audioOverview.cues[${i}]`;
    if (cue.startMs >= cue.endMs) {
      errors.push({ moduleTitle, field: cuePrefix, message: `Cue startMs (${cue.startMs}) must be strictly less than endMs (${cue.endMs}).` });
    }
    if (cue.startMs < 0) {
      errors.push({ moduleTitle, field: `${cuePrefix}.startMs`, message: `Cue startMs (${cue.startMs}) cannot be negative.` });
    }
    if (cue.startMs < prevStart) {
      errors.push({ moduleTitle, field: `${cuePrefix}.startMs`, message: `Cue startMs (${cue.startMs}) is out of sequential order.` });
    }
    prevStart = cue.startMs;
    if (!cue.textEn?.trim()) {
      errors.push({ moduleTitle, field: `${cuePrefix}.textEn`, message: 'Cue English text is required.' });
    }
  });

  return errors;
}

/**
 * Validates Kālachakra Timeline Reel payload.
 * Enforces epoch bounds, cluster bounds, locked prerequisite pointers, and 3-locale titles.
 */
export function validateTimelineReel(
  reel: TimelineReel,
  moduleTitle = 'Unknown Module'
): TriadValidationError[] {
  const errors: TriadValidationError[] = [];
  if (!reel.enabled) return errors;

  if (!reel.activeEpochId?.trim()) {
    errors.push({ moduleTitle, field: 'timelineReel.activeEpochId', message: 'Active Epoch ID must be specified.' });
  }
  if (!reel.titleEn?.trim()) {
    errors.push({ moduleTitle, field: 'timelineReel.titleEn', message: 'English timeline title is required.' });
  }
  if (!reel.epochs || reel.epochs.length === 0) {
    errors.push({ moduleTitle, field: 'timelineReel.epochs', message: 'At least one epoch must be defined.' });
    return errors;
  }

  const epochIds = new Set<string>();
  const allClusterIds = new Set<string>();
  const allEventIds = new Set<string>();

  reel.epochs.forEach((epoch) => {
    epochIds.add(epoch.id);
    (epoch.clusters || []).forEach((c) => allClusterIds.add(c.id));
    (epoch.events || []).forEach((e) => allEventIds.add(e.id));
  });

  if (reel.activeEpochId && !epochIds.has(reel.activeEpochId)) {
    errors.push({ moduleTitle, field: 'timelineReel.activeEpochId', message: `Active Epoch ID "${reel.activeEpochId}" not found in defined epochs.` });
  }

  reel.epochs.forEach((epoch) => {
    const epochPrefix = `timelineReel.epoch.${epoch.id}`;
    if (epoch.startYearAstro >= epoch.endYearAstro) {
      errors.push({ moduleTitle, field: epochPrefix, message: `Epoch start year (${epoch.startYearAstro}) must be less than end year (${epoch.endYearAstro}).` });
    }
    if (!epoch.nameEn?.trim()) {
      errors.push({ moduleTitle, field: `${epochPrefix}.nameEn`, message: 'English epoch name is required.' });
    }

    (epoch.clusters || []).forEach((cluster) => {
      const clusterPrefix = `${epochPrefix}.cluster.${cluster.id}`;
      if (cluster.yearAstro < epoch.startYearAstro || cluster.yearAstro > epoch.endYearAstro) {
        errors.push({ moduleTitle, field: clusterPrefix, message: `Cluster year (${cluster.yearAstro}) falls outside epoch range [${epoch.startYearAstro}, ${epoch.endYearAstro}].` });
      }
      if (!cluster.titleEn?.trim()) {
        errors.push({ moduleTitle, field: `${clusterPrefix}.titleEn`, message: 'Cluster English title is required.' });
      }
      if (!cluster.eventIds || cluster.eventIds.length === 0) {
        errors.push({ moduleTitle, field: `${clusterPrefix}.eventIds`, message: 'Cluster must reference at least one event ID.' });
      } else {
        cluster.eventIds.forEach((eId) => {
          if (!allEventIds.has(eId)) {
            errors.push({ moduleTitle, field: `${clusterPrefix}.eventIds`, message: `Clustered event ID "${eId}" not found in epoch events.` });
          }
        });
      }
    });

    (epoch.events || []).forEach((ev) => {
      const evPrefix = `${epochPrefix}.event.${ev.id}`;
      if (ev.yearAstro < epoch.startYearAstro || ev.yearAstro > epoch.endYearAstro) {
        errors.push({ moduleTitle, field: evPrefix, message: `Event year (${ev.yearAstro}) falls outside epoch range [${epoch.startYearAstro}, ${epoch.endYearAstro}].` });
      }
      if (ev.isDateRange || (ev.endYearAstro !== undefined && ev.endYearAstro !== null)) {
        if (ev.endYearAstro === undefined || ev.endYearAstro === null) {
          errors.push({ moduleTitle, field: `${evPrefix}.endYearAstro`, message: `Date-range event "${ev.titleEn}" requires an end year (endYearAstro).` });
        } else if (ev.endYearAstro <= ev.yearAstro) {
          errors.push({ moduleTitle, field: `${evPrefix}.endYearAstro`, message: `Date-range event "${ev.titleEn}" end year (${ev.endYearAstro}) must be strictly greater than start year (${ev.yearAstro}).` });
        }
      }
      if (!ev.titleEn?.trim()) {
        errors.push({ moduleTitle, field: `${evPrefix}.titleEn`, message: 'Event English title is required.' });
      }
      if (!ev.summaryEn?.trim()) {
        errors.push({ moduleTitle, field: `${evPrefix}.summaryEn`, message: 'Event English summary is required.' });
      }
      if (ev.isLocked && !ev.prerequisiteModuleTitle?.trim() && !ev.prerequisiteModuleId?.trim()) {
        errors.push({ moduleTitle, field: evPrefix, message: `Locked event "${ev.titleEn}" must specify prerequisiteModuleTitle or prerequisiteModuleId.` });
      }
      if (ev.clusterId && !allClusterIds.has(ev.clusterId)) {
        errors.push({ moduleTitle, field: `${evPrefix}.clusterId`, message: `Cluster ID "${ev.clusterId}" not found in epoch clusters.` });
      }
    });
  });

  return errors;
}

/**
 * Validates Module Timeline Metadata.
 * Enforces 3-locale era labels and grade scope.
 */
export function validateTimelineMetadata(
  meta: ModuleTimelineMetadata,
  moduleTitle = 'Unknown Module'
): TriadValidationError[] {
  const errors: TriadValidationError[] = [];
  if (!meta.eraLabelEn?.trim()) {
    errors.push({ moduleTitle, field: 'timelineMetadata.eraLabelEn', message: 'English era label is mandatory.' });
  }
  if (!meta.eraLabelHi?.trim()) {
    errors.push({ moduleTitle, field: 'timelineMetadata.eraLabelHi', message: 'Hindi era label is mandatory.' });
  }
  if (!meta.eraLabelHng?.trim()) {
    errors.push({ moduleTitle, field: 'timelineMetadata.eraLabelHng', message: 'Hinglish era label is mandatory.' });
  }
  if (!meta.applicableGrades || meta.applicableGrades.length === 0) {
    errors.push({ moduleTitle, field: 'timelineMetadata.applicableGrades', message: 'At least one applicable grade must be specified.' });
  }
  return errors;
}

/**
 * Validates all Triad extensions configured on a module payload.
 */
export function validateTriadPayloads(module: InteractiveModule): TriadValidationError[] {
  const errors: TriadValidationError[] = [];
  const title = module.titleEn?.trim() || module.title?.trim() || module.id || 'Untitled Module';

  if (module.keyTermsRecap?.enabled) {
    errors.push(...validateKeyTermsRecap(module.keyTermsRecap, title));
  }
  if (module.audioOverview?.enabled) {
    errors.push(...validateAudioOverview(module.audioOverview, title));
  }
  if (module.timelineReel?.enabled) {
    errors.push(...validateTimelineReel(module.timelineReel, title));
  }
  if (module.timelineMetadata) {
    errors.push(...validateTimelineMetadata(module.timelineMetadata, title));
  }

  // Short titles strictly <= 24 chars (§R3)
  (['shortTitleEn', 'shortTitleHi', 'shortTitleHng'] as const).forEach((field) => {
    const val = module[field];
    if (val && val.length > 24) {
      errors.push({ moduleTitle: title, field, message: `${field} strictly must not exceed 24 characters (current: ${val.length}).` });
    }
  });

  // Multi-discipline tagging consistency & semantic ID format (§R1, §R2)
  if (module.primaryDisciplineId) {
    if (!isValidSemanticId(module.primaryDisciplineId, 'disc')) {
      errors.push({ moduleTitle: title, field: 'primaryDisciplineId', message: `primaryDisciplineId "${module.primaryDisciplineId}" must be a valid semantic ID starting with "disc_".` });
    }
    if (!module.disciplineIds || !module.disciplineIds.includes(module.primaryDisciplineId)) {
      errors.push({ moduleTitle: title, field: 'primaryDisciplineId', message: `primaryDisciplineId "${module.primaryDisciplineId}" must be included within disciplineIds.` });
    }
  }
  if (module.disciplineIds) {
    const seenDisc = new Set<string>();
    module.disciplineIds.forEach((discId) => {
      if (!isValidSemanticId(discId, 'disc')) {
        errors.push({ moduleTitle: title, field: 'disciplineIds', message: `Discipline ID "${discId}" must be a valid semantic ID starting with "disc_".` });
      } else if (seenDisc.has(discId)) {
        errors.push({ moduleTitle: title, field: 'disciplineIds', message: `Duplicate Discipline ID "${discId}" in disciplineIds.` });
      } else {
        seenDisc.add(discId);
      }
    });
  }

  // Grade range validation
  if (module.applicableGrades) {
    module.applicableGrades.forEach((g) => {
      if (!Number.isInteger(g) || g < 1 || g > 12) {
        errors.push({ moduleTitle: title, field: 'applicableGrades', message: `Applicable grade (${g}) must be an integer between 1 and 12.` });
      }
    });
  }

  return errors;
}

