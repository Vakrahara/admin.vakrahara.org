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
  if (sakaYear >= 0) {
    sakaSamvat = `${sakaYear} Śaka`;
  } else {
    const preSaka = -sakaYear;
    sakaSamvat = `${preSaka} Pre-Śaka`;
  }

  // 4. Kali Yuga (Epoch: 3102 BCE -> astroYear = -3101)
  const kaliYear = yearAstro + 3101;
  let kaliYuga: string;
  if (kaliYear >= 0) {
    kaliYuga = `${kaliYear} Kali`;
  } else {
    const preKali = -kaliYear;
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
 * Converts human input string (e.g. "1200 BCE", "1200 BC", "1200 B.C.", "1200 B.C.E.", "c. 1200 BCE", "530 CE", "530 AD", "AD 530", "-1199", "2026") into yearAstro.
 */
export function parseYearToAstro(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Strip optional historical approximation prefix (e.g. "c.", "ca.", "approx.")
  const clean = trimmed.replace(/^(?:c\.|ca\.|approx\.?)\s*/i, '').trim();
  if (!clean) return null;

  // 1. BCE / BC formats evaluated BEFORE direct number parsing
  // Handles suffix: "1200 BCE", "1200 BC", "1200 B.C.", "1200 B.C.E."
  const bceSuffixMatch = clean.match(/^(\d+)\s*(?:b\.?c\.?e\.?|b\.?c\.?)$/i);
  // Handles prefix: "BC 1200", "BCE 1200", "B.C. 1200"
  const bcePrefixMatch = clean.match(/^(?:b\.?c\.?e\.?|b\.?c\.?)\s*(\d+)$/i);
  const bceMatch = bceSuffixMatch || bcePrefixMatch;
  if (bceMatch) {
    const bceYear = parseInt(bceMatch[1], 10);
    return bceYear === 0 ? 0 : 1 - bceYear;
  }

  // 2. CE / AD formats
  // Handles suffix: "530 CE", "530 C.E.", "530 AD", "530 A.D."
  const ceSuffixMatch = clean.match(/^(\d+)\s*(?:c\.?e\.?|a\.?d\.?)$/i);
  // Handles prefix: "AD 530", "CE 530", "A.D. 530"
  const cePrefixMatch = clean.match(/^(?:c\.?e\.?|a\.?d\.?)\s*(\d+)$/i);
  const ceMatch = ceSuffixMatch || cePrefixMatch;
  if (ceMatch) {
    return parseInt(ceMatch[1], 10);
  }

  // 3. Direct number (e.g. "-1199", "2026", "0", "+500")
  if (/^[+-]?\s*\d+$/.test(clean)) {
    return parseInt(clean.replace(/\s+/g, ''), 10);
  }

  return null;
}
