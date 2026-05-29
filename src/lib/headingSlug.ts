/**
 * Phase AR.3 — Single source of truth for heading anchor ids.
 *
 * Used by `ProfessionalTextFormatter` heading renderers (h1/h2/h3) AND
 * by `StickyTableOfContents.extractTableOfContents`. The two MUST share
 * this helper so anchor ids cannot drift; if you fork the slugger, TOC
 * navigation silently breaks (getElementById returns null).
 *
 * Behaviour:
 * - NFKD-normalise + strip combining marks (so "Śāstra" → "sastra").
 * - Lowercase, collapse non-alphanumeric runs to single hyphens.
 * - Trim leading/trailing hyphens, cap at 50 chars for sane URLs.
 */
export const slugifyHeading = (input: string): string => {
  if (!input) return '';
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
};
