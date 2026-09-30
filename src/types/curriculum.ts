/**
 * Canonical Curriculum Types for Amrtam Vidyāpīṭha CMS (§3, §6, §16).
 * Supports both legacy 4-step structure and modern 3-type polymorphic hierarchy.
 */

export type LegacyStepType = 'concept' | 'simulation' | 'predict_quiz' | 'heritage_connection';
export type ModernStepType = 'video_simulation' | 'saraswati' | 'anveshana';
export type StepType = LegacyStepType | ModernStepType;
export type MediaMode = 'none' | 'video_only' | 'simulation_only' | 'both';

export interface TranscriptSegment {
  startMs: number;
  endMs: number;
  textEn: string;
  textHi?: string;
  textHng?: string;
}

export interface Gurutatva {
  titleEn: string;
  titleHi?: string;
  titleHng?: string;
  bodyEn: string;
  bodyHi?: string;
  bodyHng?: string;
  sutra?: string;
  sutraTranslation?: string;
}

export interface SaraswatiMiniStep {
  questionEn: string;
  questionHi?: string;
  questionHng?: string;
  answerEn: string;
  answerHi?: string;
  answerHng?: string;
  options: string[];
  optionsHi?: string[];
  optionsHng?: string[];
  correctIndex: number;
  clue?: string;
  feedback?: string;
  definitionFragmentEn: string;
  definitionFragmentHi?: string;
  definitionFragmentHng?: string;
}

export type QuestionType = 'mcq' | 'assertion_reason' | 'statement_1_2';
export type BloomsTaxonomy = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate';

export interface AnveshanaQuestion {
  id?: string;
  questionType?: QuestionType;
  bloomsLevel?: BloomsTaxonomy;
  questionEn: string;
  questionHi?: string;
  questionHng?: string;
  options: string[];
  optionsHi?: string[];
  optionsHng?: string[];
  correctOptionIndex?: number;
  correctOptionHash?: string;
  explanationEn: string;
  explanationHi?: string;
  explanationHng?: string;
  hints?: string[];
  hintsHi?: string[];
  hintsHng?: string[];
}

export interface Step {
  id: string;
  type: StepType;
  // Common / Text content
  title?: string;
  titleHng?: string;
  textDeva?: string;
  textEng?: string;
  textHng?: string;
  imageUrl?: string;
  // Video Simulation fields (§7, §8)
  mediaMode?: MediaMode;
  videoUrl?: string;
  streamUid?: string;
  aspectRatio?: '16:9' | '9:16' | '4:3';
  videoDurationMs?: number;
  transcript?: TranscriptSegment[];
  simulationId?: string;
  params?: Record<string, any>;
  subStepCount?: number;
  gurutatva?: Gurutatva;
  // Legacy quiz / Anveshana fields (§16)
  question?: string;
  questionHng?: string;
  questionText?: string;
  questionTextHng?: string;
  options?: string[];
  optionsHng?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  explanationHng?: string;
  hints?: string[];
  hintsHng?: string[];
  targetModuleId?: string;
  questionPool?: AnveshanaQuestion[];
  pool?: AnveshanaQuestion[];
  questionsPerAttempt?: number;
  passingScore?: number;
  // Saraswati definition builder fields (§13–§15)
  miniSteps?: SaraswatiMiniStep[];
  definitionEn?: string;
  definitionHi?: string;
  definitionHng?: string;
  // Legacy heritage fields
  sutra?: string;
  translation?: string;
  significance?: string;
}

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
  yearAstro: number;               // Continuous astronomical year (-1199)
  oneLineHookEn?: string;          // High-yield pedagogical hook
  oneLineHookHi?: string;
  oneLineHookHng?: string;
  applicableGrades: number[];      // [10]
  clusterSortOrder?: number;       // Sort order in collision cluster deck
}

export interface Module {
  id: string;
  title: string;
  subtitle?: string;
  steps: Step[];
  learningSteps?: Step[];
  // Vidyāpīṭha Pedagogical Triad Extensions (§3, Step 0.1)
  keyTermsRecap?: KeyTermsRecap;
  audioOverview?: AudioOverview;
  timelineMetadata?: ModuleTimelineMetadata;
  timelineReel?: TimelineReel;
}

export type InteractiveModule = Module;

export interface Pyq {
  id: string;
  year: string;
  marks: string;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  sampleAnswer: string;
  markingScheme: string;
  relatedModuleIds: string[];
  questionHng?: string;
  sampleAnswerHng?: string;
}

export interface Chapter {
  id: string;
  title: string;
  branchId: string;
  modules: Module[];
  pyqs: Pyq[];
}

export interface CurriculumIndexSummary {
  schemaVersion: number;
  lastUpdated: string;
  chapters: Array<{
    id: string;
    title: string;
    branchId: string;
    moduleCount: number;
    pyqCount: number;
  }>;
}
