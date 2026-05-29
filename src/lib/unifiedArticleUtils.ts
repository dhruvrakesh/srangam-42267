import { getDisplayArticles } from './multilingualArticleUtils';
import type { DisplayArticle } from '@/hooks/useArticles';
import type { SupportedLanguage } from '@/types/multilingual';
import { SLUG_TO_ID_MAP } from '@/data/articles';
import { getArticleCoverageMap } from '@/lib/i18n/coverageData';

/**
 * Extracts a normalized key from a slug for deduplication.
 * Strips `/articles/` and `/` prefixes, lowercases, and strips trailing
 * punctuation — matches the policy in `src/lib/slugResolver.ts`.
 */
const normalizeSlugKey = (slug: string): string => {
  return slug
    .replace(/^\/articles\//, '')
    .replace(/^\//, '')
    .toLowerCase()
    .trim()
    .replace(/[.,;:!?]+$/, '');
};

/**
 * Phase AB.2 (2026-05-29) — Cross-source alias dedup.
 *
 * DB rows expose three identifiers (`id`, `slug`, `slug_alias`); JSON rows
 * expose `id` and a `/slug` path. The legacy merge keyed DB by `slug_alias`
 * and JSON by `id`, so the same article could leak through twice with
 * different keys and the older JSON dupe would push the newer DB version
 * below the fold on `limit:6` grids.
 *
 * The merge below builds a single `Set` containing every DB identifier
 * (normalised), then drops any JSON row whose own candidate keys match.
 */
export const mergeArticleSources = (
  jsonArticles: ReturnType<typeof getDisplayArticles>,
  dbArticles?: DisplayArticle[],
): DisplayArticle[] => {
  const unified: DisplayArticle[] = [];
  const dbIdentifiers = new Set<string>();
  let dedupDrops = 0;

  if (dbArticles) {
    for (const article of dbArticles) {
      const candidates = [
        normalizeSlugKey(article.slug),
        article.slugAlias ? normalizeSlugKey(article.slugAlias) : '',
        article.rawSlug ? normalizeSlugKey(article.rawSlug) : '',
        article.id ? article.id.toLowerCase() : '',
      ].filter(Boolean);

      // Skip if this DB row collides with one already added (very rare;
      // belt-and-braces in case the same article id appears twice).
      if (candidates.some((c) => dbIdentifiers.has(c))) continue;
      candidates.forEach((c) => dbIdentifiers.add(c));
      unified.push(article);
    }
  }

  for (const article of jsonArticles) {
    const jsonCandidates = [
      article.id ? article.id.toLowerCase() : '',
      normalizeSlugKey(article.slug),
      // SLUG_TO_ID_MAP keys are prefixed with '/'
      (SLUG_TO_ID_MAP as Record<string, string>)[
        article.slug.startsWith('/') ? article.slug : `/${article.id}`
      ]?.toLowerCase() || '',
    ].filter(Boolean);

    if (jsonCandidates.some((c) => dbIdentifiers.has(c))) {
      dedupDrops += 1;
      continue;
    }

    // Phase AA.4 — body coverage parity for JSON rows. Use the i18n
    // coverage map if present, otherwise assume English-only.
    const coverageMap = getArticleCoverageMap(article.id) || {};
    const coverageLangs = Object.keys(coverageMap) as SupportedLanguage[];
    const bodyLanguages: SupportedLanguage[] = coverageLangs.length > 0
      ? coverageLangs
      : (['en'] as SupportedLanguage[]);

    unified.push({
      ...article,
      source: 'json' as const,
      bodyLanguages,
    } as DisplayArticle);

    // Remember the JSON keys too so a downstream duplicate JSON row
    // (shouldn't happen, but defensive) won't repeat.
    jsonCandidates.forEach((c) => dbIdentifiers.add(c));
  }

  if (dedupDrops > 0 && typeof console !== 'undefined') {
    // Phase AB.5 — verifiable signal that the alias dedup is doing work.
    console.info(
      JSON.stringify({
        evt: 'articles_merge_dedup',
        db_count: dbArticles?.length ?? 0,
        json_count: jsonArticles.length,
        merged_count: unified.length,
        dedup_drops: dedupDrops,
        ts: new Date().toISOString(),
      }),
    );
  }

  return unified;
};

export const filterUnifiedArticles = (
  articles: DisplayArticle[],
  options: {
    themes?: string[];
    searchQuery?: string;
    sortBy?: 'recent' | 'oldest' | 'longest' | 'shortest' | 'title';
    limit?: number;
  },
): DisplayArticle[] => {
  let filtered = [...articles];

  if (options.themes && options.themes.length > 0) {
    filtered = filtered.filter((a) => options.themes!.includes(a.theme));
  }

  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter((a) => {
      const title = typeof a.title === 'string' ? a.title : (a.title as any).en || '';
      const excerpt = typeof a.excerpt === 'string' ? a.excerpt : (a.excerpt as any).en || '';
      return title.toLowerCase().includes(query) || excerpt.toLowerCase().includes(query);
    });
  }

  // Phase AB.2 — when two rows tie on the primary sort, prefer DB (fresher
  // metadata). Implemented as a post-pass over the chosen comparator.
  const sourceTieBreak = (a: DisplayArticle, b: DisplayArticle) => {
    if (a.source === b.source) return 0;
    return a.source === 'database' ? -1 : 1;
  };

  const byDateDesc = (a: DisplayArticle, b: DisplayArticle) => {
    const delta = new Date(b.date).getTime() - new Date(a.date).getTime();
    return delta !== 0 ? delta : sourceTieBreak(a, b);
  };
  const byDateAsc = (a: DisplayArticle, b: DisplayArticle) => {
    const delta = new Date(a.date).getTime() - new Date(b.date).getTime();
    return delta !== 0 ? delta : sourceTieBreak(a, b);
  };

  switch (options.sortBy) {
    case 'recent':
      filtered.sort(byDateDesc);
      break;
    case 'oldest':
      filtered.sort(byDateAsc);
      break;
    case 'longest':
      filtered.sort((a, b) => (b.readTime - a.readTime) || sourceTieBreak(a, b));
      break;
    case 'shortest':
      filtered.sort((a, b) => (a.readTime - b.readTime) || sourceTieBreak(a, b));
      break;
    case 'title':
      filtered.sort((a, b) => {
        const titleA = typeof a.title === 'string' ? a.title : (a.title as any).en || '';
        const titleB = typeof b.title === 'string' ? b.title : (b.title as any).en || '';
        return titleA.localeCompare(titleB) || sourceTieBreak(a, b);
      });
      break;
    default:
      filtered.sort(byDateDesc);
  }

  if (options.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
};
