/**
 * Render-time text & HTML sanitiser — Phase H.1
 *
 * Frontend mirror of `supabase/functions/_shared/markdown-pipeline.ts`'s
 * `stripExportArtifacts`. Provides defence-in-depth against ChatGPT /
 * Deep-Research export artefacts (PUA box-glyphs, `citeturn…` placeholder
 * tokens, dangling footnote-anchor digits) that may still be present in
 * legacy DB rows imported before Phase H.
 *
 * INVARIANT (docs/RELIABILITY_AUDIT.md): the regex set here MUST match
 * the canonical edge-side definitions byte-for-byte. The Deno test
 * `pipeline_test.ts` exercises both sides against the same fixtures.
 */

const PUA_CITE_RUN =
  /[\uE000-\uF8FF]*cite(?:[\uE000-\uF8FF]|turn\d+(?:view|search|news|image)\d+)+[\uE000-\uF8FF]*/g;
const BARE_CITE_TOKEN = /\bcite(?:turn\d+(?:view|search|news|image)\d+)+\b/g;
const STRAY_PUA = /[\uE000-\uF8FF]/g;
const TRAILING_FOOTNOTE_DIGITS = /[ \t]{2,}\d{1,2}(?=\s*$)/gm;
// Phase T.4 — ChatGPT file-citation export tokens (e.g. `fileturn0file1`,
// `turn0file2`). These appear inline in legacy DB content and must be
// stripped at render time. Source rows are NOT mutated (production data
// immutable per user memory).
const FILE_TURN_TOKEN = /\b(?:file)?turn\d+file\d+\b/g;

/**
 * Strip ChatGPT/Deep-Research export artefacts from arbitrary text.
 * Idempotent. O(n).
 */
export function stripExportArtifacts(input: string): string {
  if (!input) return input;
  return input
    .replace(PUA_CITE_RUN, '')
    .replace(BARE_CITE_TOKEN, '')
    .replace(FILE_TURN_TOKEN, '')
    .replace(STRAY_PUA, '')
    .replace(TRAILING_FOOTNOTE_DIGITS, '');
}

/**
 * Sanitise an HTML/text fragment for inline display in snippets,
 * meta descriptions, OG tags, JSON-LD descriptions, and search excerpts.
 * Strips tags, collapses whitespace, then runs `stripExportArtifacts`.
 */
export function sanitizeSnippet(input: string, maxLen = 200): string {
  if (!input) return '';
  const stripped = stripExportArtifacts(
    input
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' '),
  ).trim();
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…';
}

/**
 * Phase T.4 — Sanitise full article HTML/markdown body for in-page rendering.
 * Unlike `sanitizeSnippet`, this preserves tags, whitespace, and structure;
 * it only removes export artefacts and the stray empty lines they leave
 * behind. Additive and idempotent. Source DB rows are not mutated.
 */
export function sanitizeArticleHtml(input: string): string {
  if (!input) return '';
  return stripExportArtifacts(input)
    // Collapse runs of >2 blank lines created by artefact removal.
    .replace(/\n{3,}/g, '\n\n')
    // Trim trailing whitespace on each line (also created by removal).
    .replace(/[ \t]+\n/g, '\n');
}

/**
 * Phase U.2 — Render-time duplicate leading-title suppression.
 *
 * Many DB / Markdown-imported articles begin with their own <h1> or `# `
 * title that visually duplicates (and on mobile collides with) the page
 * shell title. This helper removes ONLY the first leading title if it is
 * semantically equivalent to the supplied `pageTitle`.
 *
 * Conservative normalization: strip tags, lowercase, collapse whitespace,
 * remove punctuation. Diacritics preserved. If the first heading does not
 * match the page title, the body is returned untouched.
 *
 * Source DB rows are NOT mutated. Additive and idempotent.
 */
export function stripLeadingTitle(body: string, pageTitle?: string): string {
  if (!body || !pageTitle) return body;

  const normalize = (s: string): string =>
    s
      .replace(/<[^>]+>/g, ' ')
      .replace(/[\p{P}\p{S}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const target = normalize(pageTitle);
  if (!target) return body;

  // Skip leading whitespace.
  const trimmed = body.replace(/^\s+/, '');

  // Case 1: HTML <h1>…</h1>
  const htmlMatch = trimmed.match(/^<h1\b[^>]*>([\s\S]*?)<\/h1>\s*/i);
  if (htmlMatch && normalize(htmlMatch[1]) === target) {
    return trimmed.slice(htmlMatch[0].length);
  }

  // Case 2: Markdown `# Title` on the first non-empty line.
  const mdMatch = trimmed.match(/^#[ \t]+([^\n]+)\n?/);
  if (mdMatch && normalize(mdMatch[1]) === target) {
    return trimmed.slice(mdMatch[0].length);
  }

  return body;
}
