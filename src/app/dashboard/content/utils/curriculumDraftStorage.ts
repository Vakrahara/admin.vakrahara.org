import { Chapter } from '@/types/curriculum';
import { normalizeCurriculumData } from './curriculumNormalize';

export const DRAFT_STORAGE_KEY = 'vakrahara_cbse_draft_v2';

export function readLocalDraft(): Chapter[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return normalizeCurriculumData(parsed);
  } catch (e) {
    console.error('Failed to parse draft from localStorage', e);
    return null;
  }
}

export function writeLocalDraft(chapters: Chapter[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(chapters));
  } catch (e) {
    console.error('Failed to write draft to localStorage', e);
  }
}

export function removeLocalDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to remove draft from localStorage', e);
  }
}

export function exportChaptersJson(chapters: Chapter[]): void {
  const blob = new Blob([JSON.stringify(chapters, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `amrtam_cbse_chapters_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function saveDraftRemote(chapters: Chapter[], token?: string): Promise<void> {
  const authHeader = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
  const res = await fetch('https://pb.vakrahara.org/api/amritam/admin/curriculum/save-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {})
    },
    body: JSON.stringify({ payload: chapters })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `Server returned HTTP ${res.status}`);
  }
}
