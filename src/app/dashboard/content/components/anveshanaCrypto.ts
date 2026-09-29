/**
 * Cryptographic helper for Anveshana question answer verification.
 * Matches Android AnveshanaEngine.computeAnswerHash:
 * SHA-256("$optText|$questionEn|amritam_anveshana_salt")
 */
export async function computeAnveshanaHash(optionText: string, questionEn: string): Promise<string> {
  const salt = 'amritam_anveshana_salt';
  const message = `${optionText}|${questionEn}|${salt}`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return '';
    }
  }
  return '';
}
