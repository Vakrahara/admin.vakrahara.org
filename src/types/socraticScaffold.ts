/**
 * Socratic Scaffold & Misconception Models for Sayuktik AI (सयुक्तिक AI).
 * Defines pedagogical scaffolding, common student misconception traps,
 * capability-aware analogies, and symbolic ground truth (§AMRTAM-SPEC-SAYUKTIK-01).
 */

export interface SocraticMisconceptionTrap {
  id?: string;
  trapEn: string;
  trapHi?: string;
  trapHng?: string;
  counterProbeEn: string;
  counterProbeHi?: string;
  counterProbeHng?: string;
  targetMisconceptionConcept?: string;
}

export interface SocraticAnalogyScenario {
  id?: string;
  domain: 'everyday_sensory' | 'mechanical' | 'fluid' | 'spatial' | 'abstract';
  scenarioEn: string;
  scenarioHi?: string;
  scenarioHng?: string;
  mappingExplanationEn: string;
  mappingExplanationHi?: string;
  mappingExplanationHng?: string;
}

export interface SocraticScaffold {
  targetIntuitionEn: string;
  targetIntuitionHi?: string;
  targetIntuitionHng?: string;
  forbiddenDirectAnswers?: string[];
  commonMisconceptions?: SocraticMisconceptionTrap[];
  analogies?: SocraticAnalogyScenario[];
  symbolicGroundTruth?: {
    equation?: string;
    variables?: Record<string, string>;
    units?: Record<string, string>;
  };
}
