/**
 * Text sanitiser — Phase H.1 (defence-in-depth pair to markdown-pipeline).
 *
 * Re-exports the same artefact-stripping logic as
 * `_shared/markdown-pipeline.ts` so other edge functions
 * (generate-article-og, generate-article-seo, generate-sitemap) can
 * sanitise free text without depending on the full pipeline module.
 *
 * If you change a regex here, update markdown-pipeline.ts AND
 * src/lib/textSanitizer.ts in the same change. The Deno tests in
 * markdown-to-article-import/pipeline_test.ts cover all three.
 */
export { stripExportArtifacts } from './markdown-pipeline.ts';

import { stripExportArtifacts } from './markdown-pipeline.ts';

/**
 * Sanitise an HTML/text fragment for use in <meta>, OG, or sitemap fields.
 * Strips tags, collapses whitespace, removes export artefacts, and
 * truncates on a word boundary at `maxLen`.
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
