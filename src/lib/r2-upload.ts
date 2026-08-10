export interface R2Config {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  customDomain?: string; // e.g. cdn.vakrahara.org
}

// Convert string to Uint8Array buffer
function strToBuf(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer to hex string
function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// SHA256 hex hash of a string
async function sha256Hex(str: string): Promise<string> {
  const hashBuf = await window.crypto.subtle.digest("SHA-256", strToBuf(str).buffer as ArrayBuffer);
  return bufToHex(hashBuf);
}

// SHA256 hex hash of an ArrayBuffer
async function sha256Buf(buf: ArrayBuffer): Promise<string> {
  const hashBuf = await window.crypto.subtle.digest("SHA-256", buf);
  return bufToHex(hashBuf);
}

// Compute HMAC-SHA256
async function hmac(key: any, data: any): Promise<ArrayBuffer> {
  let cryptoKey: CryptoKey;
  if (key instanceof CryptoKey) {
    cryptoKey = key;
  } else {
    cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  }
  return await window.crypto.subtle.sign("HMAC", cryptoKey, data);
}

/**
 * Uploads string data directly to Cloudflare R2
 */
export async function uploadToR2(
  key: string,
  content: string,
  contentType: string,
  config: R2Config
): Promise<void> {
  const payloadHash = await sha256Hex(content);
  return _performAwsSigV4Upload(key, content, contentType, payloadHash, config);
}

/**
 * Uploads a file (ArrayBuffer) directly to Cloudflare R2
 */
export async function uploadFileToR2(
  key: string,
  fileBuffer: ArrayBuffer,
  contentType: string,
  config: R2Config
): Promise<{ url: string; sha256: string }> {
  const payloadHash = await sha256Buf(fileBuffer);
  await _performAwsSigV4Upload(key, fileBuffer, contentType, payloadHash, config);
  
  let url = "";
  if (config.customDomain) {
    // If customDomain is https://cdn.vakrahara.org/v1, and key is v1/apk/..., we don't want /v1/v1/
    try {
      const urlObj = new URL(config.customDomain.startsWith('http') ? config.customDomain : `https://${config.customDomain}`);
      // Find where the key should be appended without duplicating folder names
      // For simplicity, let's just use the hostname if we are uploading absolute paths
      url = `${urlObj.origin}/${key}`;
    } catch (e) {
      const domain = config.customDomain;
      url = domain.startsWith('http') ? `${domain}/${key}` : `https://${domain}/${key}`;
    }
  } else {
    url = `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucketName}/${key}`;
  }
  
  return { url, sha256: payloadHash };
}

async function _performAwsSigV4Upload(
  key: string,
  bodyData: any,
  contentType: string,
  payloadHash: string,
  config: R2Config
): Promise<void> {
  const { accountId, bucketName, accessKeyId, secretAccessKey, region } = config;
  const s3Region = region || "auto";

  // R2 S3-compatible Endpoint
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const url = `https://${host}/${bucketName}/${key}`;

  // Time stamp variables
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, "").split(".")[0] + "Z"; // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.substring(0, 8); // YYYYMMDD

  // HTTP Method & Path
  const method = "PUT";
  const canonicalUri = `/${bucketName}/${key}`;
  const canonicalQuery = "";

  // Headers to sign
  const headersToSign: Record<string, string> = {
    "content-type": contentType,
    host: host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  // Canonical Headers
  const sortedHeaderKeys = Object.keys(headersToSign).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((k) => `${k}:${headersToSign[k].trim()}`)
    .join("\n") + "\n";

  const signedHeaders = sortedHeaderKeys.join(";");

  // Build Canonical Request
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);

  // Build String to Sign
  const credentialScope = `${dateStamp}/${s3Region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashedCanonicalRequest,
  ].join("\n");

  // Generate Signing Key
  const kSecret = strToBuf("AWS4" + secretAccessKey);
  const kDate = await hmac(kSecret, strToBuf(dateStamp));
  const kRegion = await hmac(kDate, strToBuf(s3Region));
  const kService = await hmac(kRegion, strToBuf("s3"));
  const kSigning = await hmac(kService, strToBuf("aws4_request"));

  // Calculate Signature
  const signatureBuf = await hmac(kSigning, strToBuf(stringToSign));
  const signature = bufToHex(signatureBuf);

  // Build Authorization Header
  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  // Execute request
  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: authHeader,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      "content-type": contentType,
    },
    body: bodyData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("R2 Upload failed:", errorText);
    throw new Error(`Cloudflare R2 upload failed with status ${response.status}: ${errorText}`);
  }
}
