import { pb } from '@/lib/pocketbase';
import { uploadFileToR2, uploadToR2, R2Config } from '@/lib/r2-upload';

export interface SimulationFileItem {
  path: string; // relative path within sim folder, e.g. "index.html", "assets/diagram.png"
  file: File;
  size: number;
}

export interface UploadSimulationResult {
  success: boolean;
  simId: string;
  cdnUrl: string;
  totalSize: number;
  filesUploaded: number;
  error?: string;
}

const MIME_MAP: Record<string, string> = {
  html: 'text/html; charset=utf-8', htm: 'text/html; charset=utf-8',
  js: 'application/javascript; charset=utf-8', mjs: 'application/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8', json: 'application/json; charset=utf-8',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  svg: 'image/svg+xml', webp: 'image/webp', gif: 'image/gif', wasm: 'application/wasm'
};

function getMimeType(filePath: string): string {
  return MIME_MAP[filePath.split('.').pop()?.toLowerCase() || ''] || 'application/octet-stream';
}

/**
 * Uploads an interactive simulation package to Cloudflare R2 / Amrtam CDN (§R1).
 * Verifies entrypoint, generates manifest.json, tries server proxy then direct R2.
 */
export async function uploadSimulationPackage(
  simId: string,
  files: SimulationFileItem[],
  r2Config?: R2Config
): Promise<UploadSimulationResult> {
  if (!files || files.length === 0) {
    return { success: false, simId, cdnUrl: '', totalSize: 0, filesUploaded: 0, error: 'No files provided for simulation package.' };
  }

  // 1. Verify entrypoint & normalize paths
  const processedFiles: SimulationFileItem[] = files.map((f) => ({ ...f, path: f.path.replace(/^\/+/, '') }));
  if (processedFiles.length === 1) {
    processedFiles[0].path = 'index.html';
  } else if (!processedFiles.some((f) => f.path.toLowerCase() === 'index.html')) {
    const rootHtml = processedFiles.findIndex((f) => !f.path.includes('/') && f.path.toLowerCase().endsWith('.html'));
    const anyHtml = rootHtml !== -1 ? rootHtml : processedFiles.findIndex((f) => f.path.toLowerCase().endsWith('.html'));
    if (anyHtml !== -1) {
      processedFiles[anyHtml].path = 'index.html';
    } else {
      return { success: false, simId, cdnUrl: '', totalSize: 0, filesUploaded: 0, error: 'No index.html or HTML entrypoint found.' };
    }
  }

  const totalSize = processedFiles.reduce((acc, f) => acc + f.size, 0);
  const manifest = {
    simId,
    timestamp: new Date().toISOString(),
    entrypoint: 'index.html',
    totalSize,
    filesCount: processedFiles.length,
    files: processedFiles.map((f) => ({ name: f.file.name, path: f.path, size: f.size }))
  };

  let uploaded = false;
  let lastError = '';

  // 2. Attempt PocketBase server proxy
  try {
    const token = pb.authStore.token;
    const authHeader = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
    const formData = new FormData();
    formData.append('simId', simId);
    formData.append('manifest', JSON.stringify(manifest));
    processedFiles.forEach((f) => formData.append('files', f.file, f.path));

    const res = await fetch('https://pb.vakrahara.org/api/amritam/admin/curriculum/upload-simulation', {
      method: 'POST',
      headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
      body: formData
    });
    if (res.ok) {
      uploaded = true;
    } else {
      const errJson = await res.json().catch(() => ({}));
      lastError = errJson.error || `Proxy returned ${res.status}`;
    }
  } catch (err: any) {
    lastError = err?.message || 'PocketBase proxy unreachable';
  }

  // 3. Fallback: Direct R2 upload if proxy failed
  if (!uploaded) {
    const activeConfig = r2Config || (typeof window !== 'undefined' ? (() => {
      try {
        const stored = localStorage.getItem('vakrahara_r2_config');
        return stored ? JSON.parse(stored) : null;
      } catch { return null; }
    })() : null);

    if (activeConfig?.accountId && activeConfig?.bucketName && activeConfig?.accessKeyId && activeConfig?.secretAccessKey) {
      try {
        for (const item of processedFiles) {
          const buffer = await item.file.arrayBuffer();
          await uploadFileToR2(`v2/simulations/${simId}/${item.path}`, buffer, getMimeType(item.path), activeConfig);
        }
        await uploadToR2(`v2/simulations/${simId}/manifest.json`, JSON.stringify(manifest, null, 2), 'application/json; charset=utf-8', activeConfig);
        uploaded = true;
      } catch (r2Err: any) {
        lastError = r2Err?.message || 'Direct Cloudflare R2 upload failed';
      }
    } else {
      lastError = lastError || 'Cloudflare R2 credentials not configured.';
    }
  }

  if (!uploaded) {
    return { success: false, simId, cdnUrl: '', totalSize, filesUploaded: 0, error: lastError };
  }

  return {
    success: true,
    simId,
    cdnUrl: `https://cdn.vakrahara.org/v2/simulations/${simId}/index.html`,
    totalSize,
    filesUploaded: processedFiles.length
  };
}
