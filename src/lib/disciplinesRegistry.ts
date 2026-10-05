/**
 * Dynamic Open-Ended Discipline Registry Utility for Amrtam Vidyāpīṭha CMS (§R1).
 * Exposes canonical discipline registry data with dynamic extensibility.
 */

import disciplinesData from '@/data/disciplines_registry.json';
import { DisciplineRegistryEntry } from '@/types/curriculumTriad';

let customDisciplines: DisciplineRegistryEntry[] | null = null;

export const defaultDisciplines: DisciplineRegistryEntry[] = disciplinesData as DisciplineRegistryEntry[];

export function getDisciplineRegistry(): DisciplineRegistryEntry[] {
  return customDisciplines || defaultDisciplines;
}

export function getDisciplineById(id: string): DisciplineRegistryEntry | undefined {
  if (!id) return undefined;
  const cleanId = id.trim().toLowerCase();
  const direct = getDisciplineRegistry().find((d) => d.id.toLowerCase() === cleanId);
  if (direct) return direct;
  // Legacy alias backward compatibility
  if (cleanId === 'disc_raja_niti') {
    return getDisciplineRegistry().find((d) => d.id === 'disc_rajniti');
  }
  return undefined;
}

export function getShortCode(disciplineId: string): string {
  const discipline = getDisciplineById(disciplineId);
  return discipline?.shortCode || disciplineId.replace(/^disc_/, '').slice(0, 4);
}

export function registerDisciplines(entries: DisciplineRegistryEntry[]): void {
  customDisciplines = entries;
}

export function resetDisciplineRegistry(): void {
  customDisciplines = null;
}
