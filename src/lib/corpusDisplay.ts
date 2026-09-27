/**
 * Corpus display helpers - TEXTS_READER_2026_09_27.
 *
 * Pure functions, so the reader's presentation rules are testable without a
 * browser or a database. Nothing here changes stored text: the Sanskrit and the
 * translation are shown exactly as published, apart from the verse-end mark.
 */

/**
 * The automaton's English prompt ends every verse with "//" (the house stand-in
 * for the danda). In a reader that mark is noise at the end of a passage and a
 * line break inside one. Nothing else in the translation is touched.
 */
export function displayTranslation(t: string | null | undefined): string {
  if (!t) return '';
  return t
    .replace(/\s*\/\/\s*$/, '')
    .replace(/\s+\/\/(?:\s+|$)/g, '\n')   // only a spaced mark; 'http://' is not one
    .trim();
}

/** "p12.3", with the edition's own verse reference when the source has one. */
export function passageLabel(p: { page_no: number; idx: number; verse_ref?: string | null }): string {
  const base = `p${p.page_no}.${p.idx}`;
  return p.verse_ref ? `${base} · ${p.verse_ref}` : base;
}

/**
 * OCR confidence below this is shown to the reader. The automaton refuses to
 * translate below 0.35, so anything published sits at or above that; 0.5 marks
 * the band where a reader should know the scan was hard to read.
 */
export const LOW_OCR_QUALITY = 0.5;

export function isLowQuality(q: number | null | undefined): boolean {
  return typeof q === 'number' && q > 0 && q < LOW_OCR_QUALITY;
}

export const PASSAGES_PER_PAGE = 50;

/** 1-based page from a query-string value; anything invalid is page 1. */
export function pageFromQuery(v: string | null, totalPassages: number): number {
  const n = Number.parseInt(v ?? '', 10);
  const last = Math.max(1, Math.ceil(totalPassages / PASSAGES_PER_PAGE));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, last);
}
