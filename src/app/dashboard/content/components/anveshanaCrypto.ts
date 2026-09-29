/**
 * Cryptographic helper for Anveshana question answer verification.
 * Matches Android AnveshanaEngine.computeAnswerHash:
 * SHA-256("$optText|$questionEn|amritam_anveshana_salt")
 */
export async function computeAnveshanaHash(optionText: string, questionEn: string): Promise<string> {
  const salt = 'amritam_anveshana_salt';
  const message = `${optionText}|${questionEn}|${salt}`;
  const subtle = typeof crypto !== 'undefined' && crypto.subtle
    ? crypto.subtle
    : (typeof window !== 'undefined' ? window.crypto?.subtle : undefined);

  if (subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return '';
    }
  }
  return '';
}
