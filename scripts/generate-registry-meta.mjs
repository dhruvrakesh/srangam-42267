/**
 * Phase 1.1 (Enterprise Roadmap 2026-07-12) — regenerates
 * src/data/articles/meta.ts from the per-article content modules.
 *
 * Run from repo root after adding/editing any static registry article:
 *   node scripts/generate-registry-meta.mjs
 *
 * Requires devDependency esbuild (already present via vite).
 */
import { build } from 'esbuild';
import { writeFileSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';

const ROOT = process.cwd();

const indexSrc = readFileSync('src/data/articles/index.ts', 'utf8');
const importRe = /import \{ (\w+) \} from '(\.\/[\w-]+)';/g;
const mods = [...indexSrc.matchAll(importRe)].map(m => ({ exportName: m[1], path: m[2] }));

await build({ entryPoints: ['src/data/articles/index.ts'], bundle: true, format: 'esm', platform: 'node', outfile: '/tmp/registry-bundle.mjs', alias: { '@': ROOT + '/src' }, logLevel: 'error' });
const full = await import(pathToFileURL('/tmp/registry-bundle.mjs'));

const loaders = [];
for (const m of mods) {
  const out = `/tmp/mod-${m.exportName}.mjs`;
  await build({ entryPoints: [`src/data/articles/${m.path.slice(2)}.ts`], bundle: true, format: 'esm', platform: 'node', outfile: out, alias: { '@': ROOT + '/src' }, logLevel: 'error' });
  const mod = await import(pathToFileURL(out));
  const art = mod[m.exportName];
  if (!art?.id) { console.error('WARN: no id export for', m.exportName); continue; }
  loaders.push({ id: art.id, exportName: m.exportName, path: m.path });
}

const cards = full.MULTILINGUAL_ARTICLES.map(a => ({
  id: a.id, title: a.title, dek: a.dek, tags: a.tags,
  contentLanguages: Object.entries(a.content || {}).filter(([, v]) => typeof v === 'string' && v.trim().length > 0).map(([k]) => k),
}));

const header = `/**
 * GENERATED FILE — do not hand-edit article card data here.
 * Regenerate with: node scripts/generate-registry-meta.mjs
 * (source of truth: the per-article modules in src/data/articles/)
 *
 * Phase 1.1 (2026-07-12, Enterprise Roadmap): lightweight registry metadata.
 * Card/list/search-suggestion paths import THIS module (≈80 KB) instead of
 * the full registry (≈1.4 MB of multilingual body content), which removed
 * the static article corpus from the entry bundle. Full content is loaded
 * on demand via ARTICLE_CONTENT_LOADERS (dynamic import per article) in
 * articleResolver step 2.
 */
import type { LocalizedArticle, SupportedLanguage } from '@/types/multilingual';

export interface ArticleCardMeta {
  id: string;
  title: LocalizedArticle['title'];
  dek: LocalizedArticle['dek'];
  tags: LocalizedArticle['tags'];
  /** Languages whose body content is non-empty in the static registry. */
  contentLanguages: SupportedLanguage[];
}
`;

const loaderLines = loaders.map(l => `  '${l.id}': () => import('${l.path}').then(m => m.${l.exportName}),`).join('\n');

const body = `
export const ARTICLE_CARDS: ArticleCardMeta[] = ${JSON.stringify(cards, null, 2)} as ArticleCardMeta[];

/**
 * Lazy loaders for full article content (one chunk per article).
 * Used by articleResolver's static-registry fallback; never imported eagerly.
 */
export const ARTICLE_CONTENT_LOADERS: Record<string, () => Promise<LocalizedArticle>> = {
${loaderLines}
};

// Mapping from legacy slugs to multilingual article IDs
export const SLUG_TO_ID_MAP: Record<string, string> = ${JSON.stringify(full.SLUG_TO_ID_MAP, null, 2)};

// Article metadata for display (readTime, author, date)
export const ARTICLE_METADATA: Record<string, {
  readTime: number;
  author: string;
  date: string;
  theme: string;
}> = ${JSON.stringify(full.ARTICLE_METADATA, null, 2)};
`;

writeFileSync('src/data/articles/meta.ts', header + body);
console.log('Wrote src/data/articles/meta.ts —', loaders.length, 'loaders,', cards.length, 'cards');
