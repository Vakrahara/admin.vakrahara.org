import { Chapter } from '@/types/curriculum';
import { readLocalDraft } from './curriculumDraftStorage';

export interface BaselineSimItem {
  id: string;
  disciplineId: string;
  title: string;
}

export const BASELINE_SIMULATIONS: BaselineSimItem[] = [
  { id: 'sim_phys_optics_ray_optics', disciplineId: 'disc_bhautik', title: 'Ray Optics & Reflection' },
  { id: 'sim_phys_optics_refraction_slab', disciplineId: 'disc_bhautik', title: 'Refraction Through Slab' },
  { id: 'sim_phys_waves_what_is_a_wave', disciplineId: 'disc_bhautik', title: 'Wave Propagation Fundamentals' },
  { id: 'sim_phys_optics_prism_dispersion', disciplineId: 'disc_bhautik', title: 'Prism Dispersion & Spectrum' },
  { id: 'sim_ganita_geom_baudhayana_theorem', disciplineId: 'disc_ganita', title: 'Baudhāyana Theorem Sulbasūtra' },
  { id: 'sim_ganita_algebra_scale_balancing', disciplineId: 'disc_ganita', title: 'Equation Scale Balancing' },
  { id: 'ray_optics', disciplineId: 'disc_bhautik', title: 'Ray Optics (Classic)' },
  { id: 'refraction_slab', disciplineId: 'disc_bhautik', title: 'Refraction Slab (Classic)' },
  { id: 'what_is_a_wave', disciplineId: 'disc_bhautik', title: 'What is a Wave (Classic)' },
  { id: 'prism_dispersion', disciplineId: 'disc_bhautik', title: 'Prism Dispersion (Classic)' },
  { id: 'baudhayana_theorem', disciplineId: 'disc_ganita', title: 'Baudhāyana Sulbasūtra (Classic)' },
  { id: 'scale_balancing', disciplineId: 'disc_ganita', title: 'Scale Balancing (Classic)' }
];

export function inferSimulationDiscipline(simId: string, discMap: Map<string, string>): { id: string; name: string } {
  const lower = simId.toLowerCase();
  if (lower.includes('phys') || lower.includes('optics') || lower.includes('wave') || lower.includes('ray')) {
    return { id: 'disc_bhautik', name: discMap.get('disc_bhautik') || 'Bhautika (Physics)' };
  }
  if (lower.includes('chem') || lower.includes('rasayan') || lower.includes('reaction') || lower.includes('acid')) {
    return { id: 'disc_rasayan', name: discMap.get('disc_rasayan') || 'Rasāyana (Chemistry)' };
  }
  if (lower.includes('ganit') || lower.includes('geom') || lower.includes('algebra') || lower.includes('theorem')) {
    return { id: 'disc_ganita', name: discMap.get('disc_ganita') || 'Gaṇita (Maths)' };
  }
  if (lower.includes('bio') || lower.includes('jeeva') || lower.includes('cell')) {
    return { id: 'disc_jeeva', name: discMap.get('disc_jeeva') || 'Jīva (Biology)' };
  }
  return { id: 'disc_bhautik', name: 'General STEM' };
}

export function extractAllSimulationIds(chapters?: Chapter[] | null): Set<string> {
  const ids = new Set<string>(BASELINE_SIMULATIONS.map((s) => s.id));
  const active = chapters || (typeof window !== 'undefined' ? readLocalDraft() : null);
  if (!active) return ids;

  for (const ch of active) {
    for (const mod of ch.modules || []) {
      for (const step of [...(mod.steps || []), ...(mod.learningSteps || [])]) {
        if (step.simulationId) ids.add(step.simulationId.trim());
        if (step.checkpoints) {
          for (const cp of step.checkpoints) {
            if (cp.simulationId) ids.add(cp.simulationId.trim());
          }
        }
        if (step.hotspots) {
          for (const hs of step.hotspots) {
            if (hs.targetSimulationId) ids.add(hs.targetSimulationId.trim());
          }
        }
      }
    }
  }
  return ids;
}
