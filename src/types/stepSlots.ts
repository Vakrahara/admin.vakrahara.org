/**
 * Composable Step Slots & Orchestration Switchboard Types & Utilities (§6, TICKET-03).
 * Supports polymorphic slot composition and orchestration onto any learning step in Amrtam Vidyāpīṭha.
 */

export type StepSlotKey = 'video' | 'simulation' | 'saraswati' | 'gurutatva' | 'anveshana' | 'explorableText';
export type StepTriggerMode = 'immediate' | 'on_completion' | 'timed_cue' | 'drawer';

export interface StepSlotsConfig {
  video?: boolean;
  simulation?: boolean;
  saraswati?: boolean;
  gurutatva?: boolean;
  anveshana?: boolean;
  explorableText?: boolean;
}

export const ALL_STEP_SLOTS: StepSlotKey[] = [
  'video',
  'simulation',
  'saraswati',
  'gurutatva',
  'anveshana',
  'explorableText'
];

export interface StepSlotMeta {
  key: StepSlotKey;
  label: string;
  tagline: string;
  badge: string;
  accentColor: string;
}

export const STEP_SLOT_METAS: Record<StepSlotKey, StepSlotMeta> = {
  video: {
    key: 'video',
    label: 'Attach Video',
    tagline: 'R2 stream / MP4 player & synchronized transcript',
    badge: 'MEDIA',
    accentColor: '#f59e0b'
  },
  simulation: {
    key: 'simulation',
    label: 'Attach Simulation',
    tagline: 'ACE interactive canvas & dynamic parameters',
    badge: 'INTERACTIVE',
    accentColor: '#10b981'
  },
  saraswati: {
    key: 'saraswati',
    label: 'Attach Saraswati',
    tagline: 'सयुक्तिक guided definition assembler & socratic clues',
    badge: 'BUILDER',
    accentColor: '#eab308'
  },
  gurutatva: {
    key: 'gurutatva',
    label: 'Attach Gurutatva',
    tagline: 'Vedic heritage, classical sutra & scientific significance',
    badge: 'HERITAGE',
    accentColor: '#f97316'
  },
  anveshana: {
    key: 'anveshana',
    label: 'Attach Anveshana',
    tagline: '30-question assessment pool & randomized validation',
    badge: 'ASSESSMENT',
    accentColor: '#06b6d4'
  },
  explorableText: {
    key: 'explorableText',
    label: 'Attach Explorable Text',
    tagline: 'Trilingual subtitles, concept theory & key observations',
    badge: 'TEXT',
    accentColor: '#3b82f6'
  }
};

export const TRIGGER_MODES: Array<{
  mode: StepTriggerMode;
  label: string;
  icon: string;
  description: string;
}> = [
  { mode: 'immediate', label: 'Immediate', icon: '⚡', description: 'Active upon step activation' },
  { mode: 'on_completion', label: 'On Completion', icon: '🏁', description: 'Revealed after preceding slot completion' },
  { mode: 'timed_cue', label: 'Timed Cue', icon: '⏱️', description: 'Revealed on video cue timestamp' },
  { mode: 'drawer', label: 'Side Drawer', icon: '📂', description: 'Slides in from side HUD on demand' }
];

export function getEffectiveStepSlots(step?: {
  type?: string;
  slots?: StepSlotsConfig;
  mediaMode?: string;
  videoUrl?: string;
  simulationId?: string;
  gurutatva?: unknown;
  textEng?: string;
  textDeva?: string;
  textHng?: string;
} | null): StepSlotsConfig {
  if (!step) {
    return {
      video: false,
      simulation: false,
      saraswati: false,
      gurutatva: false,
      anveshana: false,
      explorableText: true
    };
  }

  if (step.slots) {
    return {
      video: Boolean(step.slots.video),
      simulation: Boolean(step.slots.simulation),
      saraswati: Boolean(step.slots.saraswati),
      gurutatva: Boolean(step.slots.gurutatva),
      anveshana: Boolean(step.slots.anveshana),
      explorableText: Boolean(step.slots.explorableText)
    };
  }

  // Safe backward-compatible defaults based on step type
  switch (step.type) {
    case 'video_simulation': {
      const mode = step.mediaMode || (
        step.videoUrl && step.simulationId ? 'both' :
        step.videoUrl ? 'video_only' :
        step.simulationId ? 'simulation_only' : 'none'
      );
      return {
        video: mode === 'video_only' || mode === 'both' || Boolean(step.videoUrl),
        simulation: mode === 'simulation_only' || mode === 'both' || Boolean(step.simulationId),
        saraswati: false,
        gurutatva: Boolean(step.gurutatva),
        anveshana: false,
        explorableText: Boolean(step.textEng || step.textDeva || step.textHng)
      };
    }
    case 'saraswati':
      return { video: false, simulation: false, saraswati: true, gurutatva: false, anveshana: false, explorableText: false };
    case 'anveshana':
      return { video: false, simulation: false, saraswati: false, gurutatva: false, anveshana: true, explorableText: false };
    case 'concept':
      return { video: false, simulation: false, saraswati: false, gurutatva: false, anveshana: false, explorableText: true };
    case 'simulation':
      return { video: false, simulation: true, saraswati: false, gurutatva: false, anveshana: false, explorableText: false };
    case 'predict_quiz':
      return { video: false, simulation: false, saraswati: false, gurutatva: false, anveshana: true, explorableText: false };
    case 'heritage_connection':
      return { video: false, simulation: false, saraswati: false, gurutatva: true, anveshana: false, explorableText: true };
    default:
      return { video: false, simulation: false, saraswati: false, gurutatva: false, anveshana: false, explorableText: true };
  }
}

export function getEffectiveSlotOrder(step?: { slotOrder?: StepSlotKey[] } | null): StepSlotKey[] {
  if (step?.slotOrder && step.slotOrder.length > 0) {
    const seen = new Set<StepSlotKey>();
    const order: StepSlotKey[] = [];
    for (const key of step.slotOrder) {
      if (ALL_STEP_SLOTS.includes(key) && !seen.has(key)) {
        seen.add(key);
        order.push(key);
      }
    }
    for (const key of ALL_STEP_SLOTS) {
      if (!seen.has(key)) {
        order.push(key);
      }
    }
    return order;
  }
  return [...ALL_STEP_SLOTS];
}
