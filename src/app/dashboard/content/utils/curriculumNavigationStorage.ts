import { Chapter } from '@/types/curriculum';

/**
 * Persistent Curriculum Navigation Storage (§R1–§R3).
 * Preserves active { chapterId, moduleId } selection across browser refreshes and tab reloads.
 */

const SELECTION_STORAGE_KEY = 'vakrahara_curriculum_active_cursor';

export interface ActiveSelectionCursor {
  chapterId: string | null;
  moduleId: string | null;
}

export function saveActiveSelection(chapterId: string | null, moduleId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({ chapterId, moduleId });
    sessionStorage.setItem(SELECTION_STORAGE_KEY, payload);
    localStorage.setItem(SELECTION_STORAGE_KEY, payload);
  } catch (e) {
    console.warn('Failed to save active curriculum selection cursor:', e);
  }
}

export function readActiveSelection(): ActiveSelectionCursor {
  if (typeof window === 'undefined') return { chapterId: null, moduleId: null };
  try {
    const raw = sessionStorage.getItem(SELECTION_STORAGE_KEY) || localStorage.getItem(SELECTION_STORAGE_KEY);
    if (!raw) return { chapterId: null, moduleId: null };
    const parsed = JSON.parse(raw);
    return {
      chapterId: typeof parsed.chapterId === 'string' ? parsed.chapterId : null,
      moduleId: typeof parsed.moduleId === 'string' ? parsed.moduleId : null,
    };
  } catch {
    return { chapterId: null, moduleId: null };
  }
}

export function resolveSelectionCursor(data: Chapter[]): ActiveSelectionCursor {
  if (!data || data.length === 0) return { chapterId: null, moduleId: null };
  const cursor = readActiveSelection();
  const ch = cursor.chapterId ? data.find(c => c.id === cursor.chapterId) : null;
  if (ch) {
    if (cursor.moduleId) {
      const mod = ch.modules?.find(m => m.id === cursor.moduleId);
      return {
        chapterId: ch.id,
        moduleId: mod ? mod.id : (ch.modules?.[0]?.id || null),
      };
    }
    return {
      chapterId: ch.id,
      moduleId: null,
    };
  }
  return {
    chapterId: data[0].id,
    moduleId: data[0].modules?.[0]?.id || null,
  };
}


export function clearActiveSelection(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SELECTION_STORAGE_KEY);
    localStorage.removeItem(SELECTION_STORAGE_KEY);
  } catch {}
}
