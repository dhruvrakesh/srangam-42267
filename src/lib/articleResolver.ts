import { supabase } from '@/integrations/supabase/client';
import { getOceanicCardBySlug, type OceanicCard } from './oceanicCardsLoader';

export interface ResolvedArticle {
  source: 'json' | 'database';
  slug: string;
  slug_alias?: string;
  id?: string;
  title: string;
  title_hi?: string;
  title_pa?: string;
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
 * Gets the appropriate title for the current language
 * Falls back: currentLang -> English -> first available
 */
export function getArticleTitle(article: ResolvedArticle, lang: string): string {
  if (lang === 'hi' && article.title_hi) return article.title_hi;
  if (lang === 'pa' && article.title_pa) return article.title_pa;
  if (lang === 'ta' && article.title_ta) return article.title_ta;
  return article.title; // English fallback
}

/**
 * Resolves an article from either JSON or database sources
 * Tries JSON first (for backwards compatibility), then queries database
 */
export async function resolveOceanicArticle(slug: string): Promise<ResolvedArticle | null> {
  // First, try to get from JSON (fast, local)
  const jsonArticle = getOceanicCardBySlug(slug);
  if (jsonArticle) {
    return {
      source: 'json',
      ...jsonArticle,
    };
  }

  // If not in JSON, query the database
  try {
    // First try slug_alias (short slug), then fall back to slug (long slug)
    let { data, error } = await supabase
      .from('srangam_articles')
      .select('*')
      .eq('slug_alias', slug)
      .eq('status', 'published')
      .maybeSingle();

    // If not found by alias, try the full slug
    if (!data) {
      const result = await supabase
        .from('srangam_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      
      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      return null;
    }

    // Transform database article to match oceanic format
    const title = typeof data.title === 'object' ? (data.title as any).en : String(data.title);
    const title_hi = typeof data.title === 'object' ? (data.title as any).hi : undefined;
    const title_pa = typeof data.title === 'object' ? (data.title as any).pa : undefined;
    const title_ta = typeof data.title === 'object' ? (data.title as any).ta : undefined;
    const abstract = typeof data.content === 'object' ? (data.content as any).en : String(data.content);

    return {
      source: 'database',
      slug: data.slug,
      slug_alias: data.slug_alias || undefined,
      id: data.id,
      title,
      title_hi,
      title_pa,
      title_ta,
      abstract: abstract.substring(0, 500) + '...', // Extract first 500 chars as abstract
      dek: data.dek,
      content: data.content, // Full multilingual content for proper rendering
      read_time_min: data.read_time_minutes || 10,
      word_count: data.word_count || undefined,
      tags: data.tags || [],
      pins: [], // Database articles don't have pins by default
      mla_refs: [], // Would need to join with bibliography table
      theme: data.theme,
      published_date: data.published_date,
      og_image_url: data.og_image_url,
    };
  } catch (err) {
    console.error('Error resolving article from database:', err);
    return null;
  }
}

/**
 * Checks if a slug exists in either JSON or database
 */
export async function articleExists(slug: string): Promise<boolean> {
  const article = await resolveOceanicArticle(slug);
  return article !== null;
}
