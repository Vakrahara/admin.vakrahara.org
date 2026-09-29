import { Chapter } from '@/types/curriculum';
import { pb } from '@/lib/pocketbase';
import { uploadToR2, R2Config } from '@/lib/r2-upload';
import { preparePublishPayload } from './curriculumCompiler';

/**
 * Executes curriculum publish:
 * 1. Prepares dual-compatible payload.
 * 2. Attempts server-side proxy upload.
 * 3. Falls back to direct browser R2 upload.
 * Returns the final published chapters.
 */
export async function executePublishCurriculum(chapters: Chapter[], r2Config: R2Config): Promise<Chapter[]> {
  const payloadChapters = await preparePublishPayload(chapters);
  let published = false;
  let lastError = '';

  try {
    const token = pb.authStore.token;
    const authHeader = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
    const res = await fetch('https://pb.vakrahara.org/api/amritam/admin/curriculum/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify({ r2_key: 'v1/cbse/chapters_data.json', payload: payloadChapters })
    });

    if (res.ok) {
      published = true;
      // Also publish to cbse/chapters_data.json for root path compatibility
      fetch('https://pb.vakrahara.org/api/amritam/admin/curriculum/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
        body: JSON.stringify({ r2_key: 'cbse/chapters_data.json', payload: payloadChapters })
      }).catch(e => console.warn('[R2 Dual-Publish] root path update warning:', e));
    } else {
      const errData = await res.json().catch(() => ({}));
      lastError = errData.error || `Server proxy returned status ${res.status}`;
    }
  } catch (proxyErr: any) {
    lastError = proxyErr.message || 'Server proxy unreachable';
  }

  if (!published) {
    if (r2Config.accountId && r2Config.bucketName && r2Config.accessKeyId && r2Config.secretAccessKey) {
      const payload = JSON.stringify(payloadChapters, null, 4);
      await uploadToR2('v1/cbse/chapters_data.json', payload, 'application/json', r2Config);
      published = true;
    } else {
      throw new Error(lastError || 'Publishing failed. Cloudflare R2 credentials not configured.');
    }
  }

  return payloadChapters;
}
