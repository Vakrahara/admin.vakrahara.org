// ─── TRIAD EXTENSION: SHABDAKOSHA LEXICON RECAP ───────────────────────────
export interface KeyTerm {
  id: string;                      // e.g. "kt_iron_revolution_01"
  termEn: string;                  // Standard academic English
  termHi: string;                  // Formal Devanagari Hindi
  termHng: string;                 // Conversational phonetic Hinglish
  definitionEn: string;            // Standard academic explanation
  definitionHi: string;            // Formal yet accessible Hindi explanation
  definitionHng: string;           // Conversational natural Hinglish explanation
  insightNoteEn?: string;          // Optional 1-line conceptual insight
  insightNoteHi?: string;
  insightNoteHng?: string;
  pronunciationAudioUrl?: string;  // Optional audio hook (.mp3)
  tags?: string[];                 // e.g. ["Vedic Metallurgy", "Technology"]
}

export interface KeyTermsRecap {
  enabled: boolean;
  titleEn: string;                 // e.g. "Key Concepts Mastered"
  titleHi: string;                 // e.g. "सीखी गई प्रमुख शब्दावली"
  titleHng: string;                // e.g. "Shabdakosha Recap"
  terms: KeyTerm[];
}

// ─── TRIAD EXTENSION: REVISIT AUDIO OVERVIEW ──────────────────────────────
export interface SubtitleCue {
  id: string;                      // e.g. "cue_01"
  startMs: number;                 // Millisecond timestamp start (e.g. 0)
  endMs: number;                   // Millisecond timestamp end (e.g. 4200)
  textEn: string;
  textHi?: string;
  textHng?: string;
}

export type TranscriptCue = SubtitleCue;

export interface AudioWaveformVector {
  peaks: number[];                 // Exactly 64 normalized RMS floats [0.0 - 1.0]
}

export interface AudioOverview {
  enabled: boolean;
  durationMs: number;              // Probed via Web Audio API (e.g. 75000)
  bitrateKbps?: number;            // Computed bitrate in kbps (e.g. 64)
  audioUrlEn: string;              // Canonical R2 URL
  audioUrlHi?: string;
  audioUrlHng?: string;
  vttUrlEn?: string;
  vttUrlHi?: string;
  vttUrlHng?: string;
  waveformPeaks: number[];         // Exactly 64 normalized RMS floats [0.0 - 1.0]
  cues: SubtitleCue[];             // Inlined cues for instant offline render
  sourceType?: 'notebooklm' | 'google_vids' | 'custom_server' | 'studio' | 'external';
}

// ─── TRIAD EXTENSION: KĀLACHAKRA TIMELINE REEL ────────────────────────────
export interface TimelineEvent {
  id: string;                      // e.g. "ev_iron_atranjikhera"
  yearAstro: number;               // Continuous astronomical year (-1199 for 1200 BCE)
  displayYearBceCe: string;        // "c. 1200 BCE"
  displayVikramSamvat?: string;    // "1143 Pre-VS"
  displaySakaSamvat?: string;      // "1277 Pre-Śaka"
  displayKaliYuga?: string;        // "1902 Kali"
  titleEn: string;
  titleHi?: string;
  titleHng?: string;
  summaryEn: string;
  summaryHi?: string;
  summaryHng?: string;
  targetModuleId?: string;         // Module link for instant jump navigation
  isCurrentModuleAnchor?: boolean; // Pinned "YOU ARE HERE" anchor
  applicableGrades?: number[];     // e.g. [8, 10]
  syllabusGradeTags?: string[];    // e.g. ["class_10", "class_11"]
  clusterId?: string;              // Optional collision cluster ID
  locationName?: string;           // e.g. "Atranjikhera, UP"
  evidenceTag?: string;            // e.g. "Archaeological Carbon Dating"
  estimatedMinutes?: number;       // e.g. 10
  isLocked?: boolean;              // Curriculum prerequisite lock status
  prerequisiteModuleId?: string;   // e.g. "mod_vedic_pastoral"
  prerequisiteModuleTitle?: string;// e.g. "Early Vedic Pastoral Economy"
}

export interface TimelineCluster {
  id: string;                      // e.g. "cluster_1857_revolt"
  yearAstro: number;
  displayYearBceCe: string;
  titleEn: string;
  titleHi: string;
  titleHng: string;
  eventIds: string[];              // IDs of clustered events
}

export interface TimelineEpoch {
  id: string;                      // e.g. "ep_iron_age"
  nameEn: string;                  // "Vedic Iron Age & Janapadas"
  nameHi: string;                  // "वैदिक लौह युग एवं जनपद"
  nameHng: string;
  startYearAstro: number;          // -1500
  endYearAstro: number;            // -500
  displayRangeBceCe: string;       // "1500 BCE – 500 BCE"
  colorHex: string;                // e.g. "#D4AF37"
  events: TimelineEvent[];
  clusters?: TimelineCluster[];
}

export interface TimelineReel {
  enabled: boolean;
  reelId: string;                  // e.g. "reel_ancient_india"
  titleEn: string;
  titleHi: string;
  titleHng: string;
  activeEpochId: string;
  activeEventId?: string;
  epochs: TimelineEpoch[];
}

export interface ModuleTimelineMetadata {
  eraLabelEn: string;              // "Vedic Period"
  eraLabelHi: string;              // "वैदिक काल"
  eraLabelHng: string;             // "Vedic Kaal"
  yearAstro?: number | null;       // Continuous astronomical year (-1199, 0 for 1 BCE, null for unset)
  oneLineHookEn?: string;          // High-yield pedagogical hook
  oneLineHookHi?: string;
  oneLineHookHng?: string;
  applicableGrades: number[];      // [10]
  clusterSortOrder?: number;       // Sort order in collision cluster deck
}

// ─── TRIAD EXTENSION: MULTI-DISCIPLINE & DUAL-ENGINE REGISTRY ─────────────
export interface DisciplineRegistryEntry {
  id: string;                      // e.g. "disc_rasayan"
  nameEn: string;                  // Standard academic English name
  nameHi: string;                  // Formal Devanagari Hindi name
  icon: string;                    // Discipline icon emoji or symbol
  colorHex: string;                // Hex chromatic identifier
  order: number;                   // Display sequence order
}

export interface ModuleDisciplineMetadata {
  disciplineIds?: string[];        // Multi-discipline tagging (e.g. ["disc_rasayan", "disc_itihasa"])
  primaryDisciplineId?: string;    // Default chromatic styling
  applicableGrades?: number[];     // e.g. [9, 10, 11]
}

export type { Module, InteractiveModule } from './curriculum';

