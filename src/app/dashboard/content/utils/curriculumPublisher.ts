import { Chapter } from '@/types/curriculum';
import { pb } from '@/lib/pocketbase';
import { R2Config } from '@/lib/r2-upload';
import { preparePublishPayload } from './curriculumCompiler';

/**
 * Executes curriculum publish via the authoritative PocketBase server proxy:
 * 1. Prepares dual-compatible payload.
 * 2. Uploads via PocketBase backend endpoint POST /api/amritam/admin/curriculum/publish.
 * 3. Backend signs AWS SigV4 using server-side env vars and dual-publishes to:
 *    - cbse/chapters_data.json (for Amrtam Android app)
 *    - v1/cbse/chapters_data.json (for web & versioned endpoints)
 * Returns the final published chapters. Zero secrets required in browser.
 */
export async function executePublishCurriculum(
  chapters: Chapter[],
  _r2Config?: R2Config
): Promise<Chapter[]> {
  const payloadChapters = await preparePublishPayload(chapters);

  const token = pb.authStore.token;
  const authHeader = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
  const baseUrl = (pb.baseUrl || 'https://pb.vakrahara.org').replace(/\/+$/, '');

  const res = await fetch(`${baseUrl}/api/amritam/admin/curriculum/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {})
    },
    body: JSON.stringify({
      r2_key: 'v1/cbse/chapters_data.json',
      payload: payloadChapters
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `Server proxy returned status ${res.status}`);
  }

  return payloadChapters;
}
