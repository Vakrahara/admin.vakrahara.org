'use server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadApkToR2(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  sha256?: string;
  sizeBytes?: number;
  error?: string;
}> {
  try {
    const file = formData.get('apk') as File;
    if (!file) return { success: false, error: 'No file provided' };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Compute SHA-256 server-side
    const crypto = await import('crypto');
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    
    const fileName = `apk/amritam-${Date.now()}.apk`;
    
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: 'application/vnd.android.package-archive',
    }));
    
    const url = `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
    return { success: true, url, sha256, sizeBytes: file.size };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
