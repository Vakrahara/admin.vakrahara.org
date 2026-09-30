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

export interface VyutpattiBreakdown {
  dhatu?: string;
  pratyaya?: string;
  etymologyTextEn: string;
  etymologyTextHi?: string;
  etymologyTextHng?: string;
}

export interface KeyTerm {
  id: string;
  termDeva: string;
  termIast: string;
  termEn: string;
  termHng: string;
  definitionEn: string;
  definitionHi: string;
  definitionHng: string;
  vyutpatti?: VyutpattiBreakdown;
  audioPronunciationUrl?: string;
  sutraReference?: string;
  tags?: string[];
}

export interface KeyTermsRecap {
  enabled: boolean;
  titleEn: string;
  titleHi: string;
  titleHng: string;
  terms: KeyTerm[];
}

export interface TranscriptCue {
  id: string;
  startMs: number;
  endMs: number;
  textEn: string;
  textHi?: string;
  textHng?: string;
}

export interface AudioOverview {
  enabled: boolean;
  durationMs: number;
  audioUrlEn: string;
  audioUrlHi?: string;
  audioUrlHng?: string;
  vttUrlEn?: string;
  vttUrlHi?: string;
  vttUrlHng?: string;
  waveformPeaks: number[];
  cues: TranscriptCue[];
}

export interface TimelineEvent {
  id: string;
  yearAstro: number;
  displayYearBceCe: string;
  displayVikramSamvat?: string;
  displaySakaSamvat?: string;
  displayKaliYuga?: string;
  titleEn: string;
  titleHi?: string;
  titleHng?: string;
  summaryEn: string;
  summaryHi?: string;
  summaryHng?: string;
  targetModuleId?: string;
  isCurrentModuleAnchor?: boolean;
}

export interface TimelineEpoch {
  id: string;
  nameEn: string;
  nameHi: string;
  nameHng: string;
  startYearAstro: number;
  endYearAstro: number;
  displayRangeBceCe: string;
  colorHex: string;
  events: TimelineEvent[];
}

export interface TimelineReel {
  enabled: boolean;
  reelId: string;
  titleEn: string;
  titleHi: string;
  titleHng: string;
  activeEpochId: string;
  activeEventId?: string;
  epochs: TimelineEpoch[];
}

export interface Module {
  id: string;
  title: string;
  subtitle?: string;
  steps: Step[];
  learningSteps?: Step[];
  keyTermsRecap?: KeyTermsRecap;
  audioOverview?: AudioOverview;
  timelineReel?: TimelineReel;
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
