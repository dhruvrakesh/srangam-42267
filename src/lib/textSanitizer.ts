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

/**
 * Strip ChatGPT/Deep-Research export artefacts from arbitrary text.
 * Idempotent. O(n).
 */
export function stripExportArtifacts(input: string): string {
  if (!input) return input;
  return input
    .replace(PUA_CITE_RUN, '')
    .replace(BARE_CITE_TOKEN, '')
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
