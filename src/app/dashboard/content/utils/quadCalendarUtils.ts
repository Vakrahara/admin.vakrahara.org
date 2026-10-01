/**
 * Quad-Calendar Mathematical Conversion Utilities (Timeline Spec §2.1-§2.4)
 * Synchronized with Android QuadCalendarEngine.kt
 */

export interface QuadCalendarResult {
  yearAstro: number;
  bceCe: string;
  vikramSamvat: string;
  sakaSamvat: string;
  kaliYuga: string;
}

/**
 * Converts continuous astronomical year to all 4 calendar systems.
 * Year 0 = 1 BCE, Year -1 = 2 BCE, Year 1 = 1 CE.
 */
export function calculateQuadCalendar(yearAstro: number): QuadCalendarResult {
  // 1. Gregorian / Astronomical BCE/CE
  let bceCe: string;
  if (yearAstro > 0) {
    bceCe = `${yearAstro} CE`;
  } else {
    const bceYear = 1 - yearAstro;
    bceCe = `${bceYear} BCE`;
  }

  // 2. Vikram Samvat (Epoch: 57 BCE -> astroYear = -56)
  const vsYear = yearAstro + 57;
  let vikramSamvat: string;
  if (vsYear > 0) {
    vikramSamvat = `${vsYear} VS`;
  } else {
    const preVs = 1 - vsYear;
    vikramSamvat = `${preVs} Pre-VS`;
  }

  // 3. Śaka Samvat (Epoch: 78 CE -> astroYear = 78)
  const sakaYear = yearAstro - 78;
  let sakaSamvat: string;
  if (sakaYear > 0) {
    sakaSamvat = `${sakaYear} Śaka`;
  } else {
    const preSaka = 1 - sakaYear;
    sakaSamvat = `${preSaka} Pre-Śaka`;
  }

  // 4. Kali Yuga (Epoch: 3102 BCE -> astroYear = -3101)
  const kaliYear = yearAstro + 3101;
  let kaliYuga: string;
  if (kaliYear > 0) {
    kaliYuga = `${kaliYear} Kali`;
  } else {
    const preKali = 1 - kaliYear;
    kaliYuga = `${preKali} Pre-Kali`;
  }

  return {
    yearAstro,
    bceCe,
    vikramSamvat,
    sakaSamvat,
    kaliYuga
  };
}

/**
 * Converts human input string (e.g. "1200 BCE", "530 CE", "-1199", "2026") into yearAstro.
 */
export function parseYearToAstro(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct number
  const directNum = parseInt(trimmed, 10);
  if (!isNaN(directNum) && !trimmed.toLowerCase().includes('bce') && !trimmed.toLowerCase().includes('ce')) {
    return directNum;
  }

  // "1200 BCE" or "1200 BC"
  const bceMatch = trimmed.match(/^(\d+)\s*(?:bce|bc)$/i);
  if (bceMatch) {
    const bceYear = parseInt(bceMatch[1], 10);
    return 1 - bceYear;
  }

  // "530 CE" or "530 AD"
  const ceMatch = trimmed.match(/^(\d+)\s*(?:ce|ad)$/i);
  if (ceMatch) {
    return parseInt(ceMatch[1], 10);
  }

  return null;
}
