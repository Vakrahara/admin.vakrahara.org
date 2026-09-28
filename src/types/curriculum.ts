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

export interface AnveshanaQuestion {
  id?: string;
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
  textDeva?: string;
  textEng?: string;
  textHng?: string;
  imageUrl?: string;
  // Video Simulation fields (§7, §8)
  mediaMode?: MediaMode;
  videoUrl?: string;
  videoDurationMs?: number;
  transcript?: TranscriptSegment[];
  simulationId?: string;
  params?: Record<string, any>;
  subStepCount?: number;
  gurutatva?: Gurutatva;
  // Legacy quiz / Anveshana fields (§16)
  question?: string;
  questionText?: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  hints?: string[];
  targetModuleId?: string;
  questionPool?: AnveshanaQuestion[];
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

export interface Module {
  id: string;
  title: string;
  steps: Step[];
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
