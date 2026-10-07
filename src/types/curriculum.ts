/**
 * Canonical Curriculum Types for Amrtam Vidyāpīṭha CMS (§3, §6, §16).
 * Supports both legacy 4-step structure and modern 3-type polymorphic hierarchy.
 */

import type { StepSlotsConfig, StepTriggerMode, StepSlotKey } from './stepSlots';

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

export type TextHotspotAction =
  | 'inline_card'
  | 'launch_simulation'
  | 'open_gurutatva'
  | 'open_lexicon_term'
  | 'link_module';

export interface HotspotInlineCardPayload {
  titleEn: string;
  titleHi?: string;
  titleHng?: string;
  bodyEn: string;
  bodyHi?: string;
  bodyHng?: string;
  imageUrl?: string;
}

export interface TextHotspot {
  id: string; // prefixed with hot_ per semantic ID rules
  targetWordOrPhrase: string;
  action: TextHotspotAction;
  inlineCardPayload?: HotspotInlineCardPayload;
  targetSimulationId?: string;
  targetSimulationParams?: Record<string, any>;
  targetGurutatva?: Gurutatva;
  targetTermId?: string;
  targetModuleId?: string;
}

export type VideoCheckpointType = 'question' | 'simulation_prompt' | 'gurutatva_pause' | 'explorable_note';
export type VideoCheckpointResumeAction = 'on_answer' | 'manual_continue' | 'auto_after_sec';

export interface VideoCheckpoint {
  id: string; // prefixed with chk_ per semantic ID rules
  timestampMs: number;
  type: VideoCheckpointType;
  title?: string;
  questionEn?: string;
  questionHi?: string;
  questionHng?: string;
  options?: string[];
  optionsHi?: string[];
  optionsHng?: string[];
  correctOptionIndex?: number;
  explanationEn?: string;
  explanationHi?: string;
  explanationHng?: string;
  simulationId?: string;
  simulationParams?: Record<string, any>;
  gurutatva?: Gurutatva;
  resumeAction?: VideoCheckpointResumeAction;
  autoResumeSeconds?: number;
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
  checkpoints?: VideoCheckpoint[];
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
  // Composable Step Slots & Orchestration (§R1, TICKET-03)
  slots?: StepSlotsConfig;
  triggerMode?: StepTriggerMode;
  slotOrder?: StepSlotKey[];
  // Interactive Explorable Text & Hotspots (§TICKET-05)
  hotspots?: TextHotspot[];
  // Socratic Scaffold & Misconception Map for Sayuktik AI (§AMRTAM-SPEC-SAYUKTIK-01)
  socraticScaffold?: SocraticScaffold;
}

export * from './stepSlots';
export * from './socraticScaffold';
import type { SocraticScaffold } from './socraticScaffold';

// ─── TRIAD EXTENSION: SHABDAKOSHA, AUDIO & KALACHAKRA (curriculumTriad.ts) ──
export type {
  KeyTerm,
  KeyTermsRecap,
  SubtitleCue,
  TranscriptCue,
  AudioWaveformVector,
  AudioOverview,
  TimelineEvent,
  TimelineCluster,
  TimelineEpoch,
  TimelineReel,
  ModuleTimelineMetadata,
  DisciplineRegistryEntry,
  ModuleDisciplineMetadata
} from './curriculumTriad';

export * from '@/lib/semanticId';
export * from '@/lib/disciplinesRegistry';

import type {
  KeyTermsRecap,
  AudioOverview,
  TimelineReel,
  ModuleTimelineMetadata,
  ModuleDisciplineMetadata
} from './curriculumTriad';

export interface Module extends ModuleDisciplineMetadata {
  id: string;
  // Trilingual Title fields (§R3)
  title: string;                    // Backward-compatible accessor
  titleEn?: string;
  titleHi?: string;
  titleHng?: string;
  shortTitleEn?: string;            // Strictly <= 24 chars
  shortTitleHi?: string;            // Strictly <= 24 chars
  shortTitleHng?: string;           // Strictly <= 24 chars
  subtitle?: string;
  subtitleEn?: string;
  subtitleHi?: string;
  subtitleHng?: string;
  // Multi-discipline tagging & grade targeting (§R2)
  disciplineIds?: string[];         // e.g. ["disc_rasayan", "disc_itihasa"]
  primaryDisciplineId?: string;     // Default chromatic styling (e.g. "disc_rasayan")
  applicableGrades?: number[];      // e.g. [9, 10, 11]
  steps: Step[];
  learningSteps?: Step[];
  // Vidyāpīṭha Pedagogical Triad Extensions (§3, Step 0.1)
  keyTermsRecap?: KeyTermsRecap;
  audioOverview?: AudioOverview;
  timelineMetadata?: ModuleTimelineMetadata;
  timelineReel?: TimelineReel;
  // Socratic Scaffold & Misconception Map for Sayuktik AI (§AMRTAM-SPEC-SAYUKTIK-01)
  socraticScaffold?: SocraticScaffold;
}

export type InteractiveModule = Module;

/** Backward-compatible accessor: resolves titleEn or falls back to legacy title (or id) */
export function getModuleTitle(mod: { id?: string; title?: string; titleEn?: string }): string {
  return mod.titleEn?.trim() || mod.title?.trim() || mod.id?.trim() || '';
}

/** Backward-compatible accessor: resolves subtitleEn or falls back to legacy subtitle */
export function getModuleSubtitle(mod: { subtitle?: string; subtitleEn?: string }): string | undefined {
  return mod.subtitleEn?.trim() || mod.subtitle?.trim() || undefined;
}


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
  board?: string;
  grade?: number;
  applicableGrades?: number[];
  disciplineIds?: string[];
  [key: string]: any;
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
