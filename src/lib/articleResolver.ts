import { supabase } from '@/integrations/supabase/client';
import { getOceanicCardBySlug, type OceanicCard } from './oceanicCardsLoader';

export interface ResolvedArticle {
  source: 'json' | 'database';
  slug: string;
  title: string;
  title_hi?: string;
  abstract: string;
  read_time_min: number;
  tags: string[];
  pins: Array<{
    name: string;
    lat: number;
    lon: number;
    approximate?: boolean;
  }>;
  mla_refs: string[];
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
    const { data, error } = await supabase
      .from('srangam_articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) {
      return null;
    }

    // Transform database article to match oceanic format
    const title = typeof data.title === 'object' ? (data.title as any).en : String(data.title);
    const title_hi = typeof data.title === 'object' ? (data.title as any).hi : undefined;
    const abstract = typeof data.content === 'object' ? (data.content as any).en : String(data.content);

    return {
      source: 'database',
      slug: data.slug,
      title,
      title_hi,
      abstract: abstract.substring(0, 500) + '...', // Extract first 500 chars as abstract
      read_time_min: data.read_time_minutes || 10,
      tags: data.tags || [],
      pins: [], // Database articles don't have pins by default
      mla_refs: [], // Would need to join with bibliography table
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
