/**
 * substance.mjs — the ONE definition of "is this language body real?"
 *
 * WHY THIS FILE EXISTS
 * The rule `v.trim().length > 0` was written independently in five places:
 *
 *   scripts/registry-parity-check.mjs        nonEmptyLangs()
 *   scripts/generate-registry-meta.mjs:35    contentLanguages
 *   src/hooks/useArticles.ts:63              computeBodyLanguages()
 *   src/components/language/LanguageAvailabilityBadge.tsx:30
 *   src/lib/i18n/coverage.ts                 calculateCoverage()
 *
 * Every one measures PRESENCE, never SUBSTANCE, so a placeholder counts as a
 * translation. Measured 2026-09-06 over the 28 registered articles:
 *
 *   src/data/articles/stone-purana.ts:523
 *     hi: '…[Professional Hindi translation required - 6,500 words]'
 *   janajati-oral-traditions: 71,299 English chars, eight 32-char "translations"
 *   scripts-that-sailed-ii:   26,484 English chars, hi and ta are 69 chars each
 *                             -> the card badge reads 3/9; the truth is 1/9
 *
 * THE RULE
 * A ratio test alone would wrongly condemn genuinely short articles:
 * kutai-yupa-borneo has a 235-character English body and ~110-character
 * translations that are real. So the absolute floor applies only where the
 * ratio is not meaningful — to short sources.
 *
 *   English body >= SHORT_SOURCE : placeholder if under STUB_RATIO of it
 *   English body <  SHORT_SOURCE : placeholder if under STUB_ABS characters
 *
 * Checked against the corpus:
 *   jambudvipa-connected  en 27,477 -> floor 2,748 : all 8 placeholders
 *   scripts-that-sailed-ii en 26,484 -> floor 2,648 : hi/ta placeholders -> 1/9
 *   ashoka-kandahar-edicts en  6,086 -> floor   609 : as/bn/kn/pa/pn placeholders,
 *                                                     hi/ta/te REAL
 *   kutai-yupa-borneo     en    235 -> floor   100 : all 8 REAL
 *   maritime-memories     en  1,674 -> floor   100 : all 8 REAL
 *
 * Import this. Do not re-implement it.
 */
export const STUB_RATIO   = 0.10;
export const SHORT_SOURCE = 2000;
export const STUB_ABS     = 100;

/** True when `content[lang]` is a placeholder rather than a real translation. */
export function isStub(content, lang) {
  if (lang === 'en') return false;
  const v = String(content?.[lang] ?? '').trim();
  if (!v.length) return true;
  const en = String(content?.en ?? '').trim().length;
  if (en >= SHORT_SOURCE) return v.length < en * STUB_RATIO;
  return v.length < STUB_ABS;
}

/** Languages with a real body. English is always counted when non-empty. */
export function substantiveLangs(content) {
  return Object.entries(content || {})
    .filter(([k, v]) => typeof v === 'string' && v.trim().length > 0 && !isStub(content, k))
    .map(([k]) => k)
    .sort();
}

/** Languages present but placeholder-only — report these, never count them. */
export function placeholderLangs(content) {
  return Object.entries(content || {})
    .filter(([k, v]) => typeof v === 'string' && v.trim().length > 0 && isStub(content, k))
    .map(([k]) => k)
    .sort();
}

export const RULE_TEXT =
  `body >= ${SHORT_SOURCE} chars: placeholder if under ${Math.round(STUB_RATIO * 100)}% of English; `
  + `shorter source: placeholder if under ${STUB_ABS} chars`;
