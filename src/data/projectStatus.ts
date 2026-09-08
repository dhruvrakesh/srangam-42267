/**
 * Public project status. Every figure here was MEASURED on the date given.
 *
 * Rule: no number enters this file without a command that produced it. If a
 * figure cannot be re-measured, it does not belong on a research site.
 *
 * 2026-09-08 correction. An earlier version of this file carried
 * `needsReview: 852`, described as passages at contamination >= 0.15. That
 * number was wrong, and the cause is worth recording. The threshold table in
 * scripts/diag_ocr_contamination.py summed pre-aggregated bands whose
 * boundaries are 0.00/0.02/0.05/0.10/0.20/0.35, selecting bands with
 * `lo >= thresh`. For thresh 0.15 the lowest qualifying band starts at 0.20,
 * so the row printed as "reject contamination >= 0.15" actually reported the
 * population at >= 0.20. Measured directly from per-passage values, the real
 * figure at >= 0.15 is 1,013.
 */
export const MEASURED_ON = '2026-09-08';

export const TRANSLATION_STATUS = {
  works: 59,
  passages: 32949,
  translated: 15235,
  completeWorks: [{ name: 'Mahābhārata, Book I', passages: 6957, coverage: '100%' }],
  entities: 6096,
  entityMentions: 25749,
  embeddings: 15012,
  /**
   * Share of Devanagari-dominant passages (30,309 of 31,650) scoring below
   * 0.02 on the Latin/scanner-intrusion measure. Whole corpus, not only the
   * translated part.
   */
  cleanFraction: '58.6% below 0.02 contamination',
  /** Translated passages at >= 0.15 contamination. Measured per passage. */
  damagedTranslated: 1013,
  /** Of those, the share concentrated in a single work. */
  damagedConcentration: {
    work: 'Bodhicaryāvatāra',
    passages: 703,
    share: '69%',
  },
} as const;

/**
 * Things the numbers above do not establish, stated because a research site
 * that reports only its wins is reporting half a result.
 */
export const CAVEATS = [
  {
    heading: 'Not one translation was refused',
    body:
      'Across all 15,235 translated passages, zero came back empty or as a ' +
      'refusal — including the 1,013 drawn from badly damaged scans. An ' +
      'automated check for empty output therefore cannot tell us anything ' +
      'about those 1,013. Whether the model never declines, or declines are ' +
      'discarded before storage, has not yet been established.',
  },
] as const;

export const PANCHANG_STATUS = {
  engine: 'pyswisseph 2.10.03',
  zodiac: 'sidereal',
  tests: 154,
  /** The point of the provenance work: the PDF reports the engine that ANSWERED. */
  provenance: 'measured at export time, not asserted',
  currentEphemeris: 'Moshier analytic (Swiss .se1 files not installed)',
} as const;

export const NOT_YET = [
  'The Sanskrit corpus is not yet published to this site. Tables exist; nothing is loaded.',
  'Translation fidelity has been sampled but not yet read. A blinded 86-passage draw from the most damaged work is waiting on a human reader.',
] as const;
