import { supabase } from '@/integrations/supabase/client';
import { getOceanicCardBySlug, type OceanicCard } from './oceanicCardsLoader';
// Phase 1.1 (2026-07-12): resolver is on the eager import graph of several
// pages, so it must not statically import the full registry. Metadata comes
// from the lightweight meta module; full article content is loaded on demand
// via ARTICLE_CONTENT_LOADERS (one dynamic-import chunk per article).
import { ARTICLE_METADATA, ARTICLE_CONTENT_LOADERS } from '@/data/articles/meta';
import { loadArticlePins } from './articlePins';
import type { MultilingualContent } from '@/types/multilingual';

export interface ResolvedArticle {
  source: 'json' | 'database';
  slug: string;
  slug_alias?: string;
  id?: string;
  title: string;
  /**
   * Phase 2.7 (2026-07-12): full multilingual title object when available
   * (DB rows and static-registry articles). Preferred by getArticleTitle;
   * covers all 9 supported languages instead of the legacy hi/pa/ta trio.
   */
  title_ml?: MultilingualContent;
  /** @deprecated Phase 2.7 — use title_ml. Kept for back-compat. */
  title_hi?: string;
  /** @deprecated Phase 2.7 — use title_ml. Kept for back-compat. */
  title_pa?: string;
  /** @deprecated Phase 2.7 — use title_ml. Kept for back-compat. */
  title_ta?: string;
  abstract: string;
  dek?: any; // Multilingual dek/description
  content?: any; // Full multilingual content (MultilingualContent or string)
  read_time_min: number;
  word_count?: number; // For ScholarlyArticle schema
  tags: string[];
  pins: Array<{
    name: string;
    lat: number;
    lon: number;
    approximate?: boolean;
    confidence?: 'A' | 'B' | 'C';
  }>;
  mla_refs: string[];
  theme?: string;
  published_date?: string;
  og_image_url?: string | null;
}

/**
 * Extracts localized title from multilingual title object
 * Falls back to English, then any available language
 */
export function getLocalizedTitle(titleObj: any, lang: string): string {
  if (typeof titleObj === 'string') {
    return titleObj;
  }
  if (typeof titleObj === 'object' && titleObj !== null) {
    return titleObj[lang] || titleObj.en || Object.values(titleObj)[0] || '';
  }
  return String(titleObj);
}

/**
 * Gets the appropriate title for the current language.
 * Phase 2.7: generic across all 9 supported languages via title_ml,
 * with legacy flat-field and English fallbacks.
 */
export function getArticleTitle(article: ResolvedArticle, lang: string): string {
  const ml = article.title_ml;
  if (ml && typeof ml === 'object') {
    const localized = (ml as Record<string, string>)[lang];
    if (localized && localized.trim()) return localized;
  }
  // Legacy flat fields (pre-2.7 callers / JSON cards)
  if (lang === 'hi' && article.title_hi) return article.title_hi;
  if (lang === 'pa' && article.title_pa) return article.title_pa;
  if (lang === 'ta' && article.title_ta) return article.title_ta;
  return article.title; // English fallback
}

// Phase 16: Query timeout to prevent indefinite loading state
const QUERY_TIMEOUT_MS = 10000; // 10 second timeout

/**
 * Phase 2.1 (2026-07-12): structured fallback telemetry. Whenever a static
 * source (registry chunk or JSON card) serves an article instead of the
 * database, emit one JSON line — same style as the Phase AB merge-dedup
 * event — so production drift is measurable before the static sources are
 * retired (roadmap step 2.6).
 */
type FallbackReason = 'db_miss' | 'db_error' | 'db_timeout';
function emitStaticFallback(slug: string, servedBy: 'registry' | 'json_card', reason: FallbackReason) {
  if (typeof console !== 'undefined') {
    console.info(JSON.stringify({
      evt: 'static_fallback_serve',
      slug,
      served_by: servedBy,
      reason,
      ts: new Date().toISOString(),
    }));
  }
}

/**
 * Database lookup (previously resolver step 3). Returns the resolved
 * article, or null with a reason so fallbacks can report why they fired.
 */
async function fetchFromDatabase(
  slug: string,
): Promise<{ article: ResolvedArticle | null; reason?: FallbackReason }> {
  try {
    const startTime = Date.now();

    // Optimized: Single query with OR condition for slug_alias or slug
    // Phase 14b: Reduced from 2 sequential queries to 1 for faster page loads
    // Phase 16: Added timeout wrapper to prevent indefinite hangs
    const queryPromise = supabase
      .from('srangam_articles')
      .select('*')
      .or(`slug_alias.eq.${slug},slug.eq.${slug}`)
      .eq('status', 'published')
      .maybeSingle();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Query timeout after ${QUERY_TIMEOUT_MS}ms`)), QUERY_TIMEOUT_MS)
    );

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    const queryTime = Date.now() - startTime;
    console.log(`[articleResolver] Query completed in ${queryTime}ms for slug: ${slug}`);

    if (error) {
      console.log(`[articleResolver] DB error for slug: ${slug}`, error.message);
      return { article: null, reason: 'db_error' };
    }
    if (!data) {
      return { article: null, reason: 'db_miss' };
    }

    console.log(`[articleResolver] Found article: ${data.slug_alias || data.slug}`);

    // Transform database article to match oceanic format
    const title = typeof data.title === 'object' ? (data.title as any).en : String(data.title);
    const title_hi = typeof data.title === 'object' ? (data.title as any).hi : undefined;
    const title_pa = typeof data.title === 'object' ? (data.title as any).pa : undefined;
    const title_ta = typeof data.title === 'object' ? (data.title as any).ta : undefined;
    const abstract = typeof data.content === 'object' ? (data.content as any).en : String(data.content);

    // Phase H.2c: load gazetteer-resolved pins for this article.
    // Always-an-array, internally timeout-bounded (4 s), never throws —
    // safe to await without changing the existing 10 s outer timeout.
    const pins = await loadArticlePins(data.id);

    return {
      article: {
        source: 'database',
        slug: data.slug,
        slug_alias: data.slug_alias || undefined,
        id: data.id,
        title,
        title_ml: typeof data.title === 'object' ? (data.title as MultilingualContent) : undefined,
        title_hi,
        title_pa,
        title_ta,
        abstract: abstract.substring(0, 500) + '...', // Extract first 500 chars as abstract
        dek: data.dek,
        content: data.content, // Full multilingual content for proper rendering
        read_time_min: data.read_time_minutes || 10,
        word_count: data.word_count || undefined,
        tags: data.tags || [],
        pins,
        mla_refs: [], // Enriched below from JSON card when available
        theme: data.theme,
        published_date: data.published_date,
        og_image_url: data.og_image_url,
      },
    };
  } catch (err) {
    const isTimeout = err instanceof Error && err.message.startsWith('Query timeout');
    console.error('Error resolving article from database:', err);
    return { article: null, reason: isTimeout ? 'db_timeout' : 'db_error' };
  }
}

/** Build a ResolvedArticle from a static-registry module (fallback path). */
async function resolveFromRegistry(slug: string): Promise<ResolvedArticle | null> {
  const contentLoader = ARTICLE_CONTENT_LOADERS[slug];
  if (!contentLoader) return null;

  const multilingualArticle = await contentLoader();
  const metadata = ARTICLE_METADATA[slug];
  const titleEn = typeof multilingualArticle.title === 'object' ? (multilingualArticle.title as any).en || '' : String(multilingualArticle.title);
  const titleHi = typeof multilingualArticle.title === 'object' ? (multilingualArticle.title as any).hi : undefined;
  const titlePa = typeof multilingualArticle.title === 'object' ? (multilingualArticle.title as any).pa : undefined;
  const titleTa = typeof multilingualArticle.title === 'object' ? (multilingualArticle.title as any).ta : undefined;
  const dekEn = typeof multilingualArticle.dek === 'object' ? (multilingualArticle.dek as any).en || '' : String(multilingualArticle.dek);

  // Extract English tags from multilingual tag objects
  const tags = (multilingualArticle.tags || []).map(tag => {
    if (typeof tag === 'string') return tag;
    if (typeof tag === 'object' && tag !== null) return (tag as any).en || Object.values(tag)[0] || '';
    return String(tag);
  });

  return {
    source: 'json',
    slug: slug,
    title: titleEn,
    title_ml: typeof multilingualArticle.title === 'object' ? (multilingualArticle.title as MultilingualContent) : undefined,
    title_hi: titleHi,
    title_pa: titlePa,
    title_ta: titleTa,
    abstract: dekEn,
    dek: multilingualArticle.dek,
    content: multilingualArticle.content,
    read_time_min: metadata?.readTime || 10,
    tags,
    pins: [],
    mla_refs: [],
    theme: metadata?.theme,
    published_date: metadata?.date,
  };
}

/** Build a ResolvedArticle from an oceanic JSON card (fallback path). */
function resolveFromJsonCard(card: OceanicCard): ResolvedArticle {
  return {
    source: 'json',
    ...card,
  } as unknown as ResolvedArticle;
}

/**
 * Resolves an article by slug.
 *
 * Phase 2.1 (2026-07-12) — DATABASE-FIRST resolution order. Previously the
 * static sources (JSON cards, then registry) were checked first, which meant:
 *   (a) admin-dashboard edits to any statically-registered article never
 *       rendered (static shadowed the DB), and
 *   (b) the 6 article slugs that overlap the 8 oceanic JSON cards served
 *       the card's abstract-only payload instead of full content.
 *
 * New order:
 *   1. Database (published rows; existing 10 s timeout preserved)
 *   2. Static registry chunk (full content) — emits static_fallback_serve
 *   3. Oceanic JSON card (abstract-only)   — emits static_fallback_serve
 *
 * Enrichment: DB rows still get curated pins/mla_refs from a matching JSON
 * card when the DB has none (the 8 oceanic cards carry hand-curated pins
 * that predate the gazetteer system). This keeps maps and MLA sections
 * intact on those pages until pins parity is confirmed (roadmap 2.0/2.2).
 */
export async function resolveOceanicArticle(slug: string): Promise<ResolvedArticle | null> {
  const jsonCard = getOceanicCardBySlug(slug);

  // 1. Database first
  const { article: dbArticle, reason } = await fetchFromDatabase(slug);
  if (dbArticle) {
    if (jsonCard) {
      if ((!dbArticle.pins || dbArticle.pins.length === 0) && jsonCard.pins?.length) {
        dbArticle.pins = jsonCard.pins;
      }
      if ((!dbArticle.mla_refs || dbArticle.mla_refs.length === 0) && jsonCard.mla_refs?.length) {
        dbArticle.mla_refs = jsonCard.mla_refs;
      }
    }
    return dbArticle;
  }

  const fallbackReason: FallbackReason = reason || 'db_miss';

  // 2. Static registry (full multilingual content) — preferred fallback
  try {
    const registryArticle = await resolveFromRegistry(slug);
    if (registryArticle) {
      emitStaticFallback(slug, 'registry', fallbackReason);
      if (jsonCard) {
        if (registryArticle.pins.length === 0 && jsonCard.pins?.length) {
          registryArticle.pins = jsonCard.pins;
        }
        if (registryArticle.mla_refs.length === 0 && jsonCard.mla_refs?.length) {
          registryArticle.mla_refs = jsonCard.mla_refs;
        }
      }
      return registryArticle;
    }
  } catch (err) {
    console.error(`[articleResolver] Registry fallback failed for slug: ${slug}`, err);
  }

  // 3. Oceanic JSON card (abstract-only) — last resort
  if (jsonCard) {
    emitStaticFallback(slug, 'json_card', fallbackReason);
    return resolveFromJsonCard(jsonCard);
  }

  return null;
}

/**
 * Checks if a slug exists in either JSON or database
 */
export async function articleExists(slug: string): Promise<boolean> {
  const article = await resolveOceanicArticle(slug);
  return article !== null;
}
