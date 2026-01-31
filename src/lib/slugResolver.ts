/**
 * Centralized Slug Resolution Utility
 * 
 * Phase 19c: Single source of truth for resolving article slugs to IDs.
 * All hooks and components should use this utility instead of implementing
 * their own slug resolution logic.
 * 
 * Features:
 * - Single OR query (not sequential queries)
 * - 10-second timeout to prevent indefinite hangs
 * - Consistent error handling
 * - Performance logging
 */

import { supabase } from '@/integrations/supabase/client';

// Query timeout to prevent indefinite loading state
const QUERY_TIMEOUT_MS = 10000;

export interface ResolvedSlug {
  id: string;
  slug: string;
  slugAlias: string | null;
}

/**
 * Resolves a slug (either slug or slug_alias) to an article ID.
 * Uses a single OR query for efficiency.
 * 
 * @param slug - The slug or slug_alias to resolve
 * @returns The article ID, slug, and slug_alias if found, null otherwise
 * 
 * @example
 * const result = await resolveArticleId('vedic-traditions');
 * if (result) {
 *   console.log(result.id); // UUID
 * }
 */
export async function resolveArticleId(slug: string): Promise<ResolvedSlug | null> {
  if (!slug) return null;
  
  const startTime = Date.now();
  
  try {
    // Single OR query - checks both slug_alias and slug in one request
    const queryPromise = supabase
      .from('srangam_articles')
      .select('id, slug, slug_alias')
      .or(`slug_alias.eq.${slug},slug.eq.${slug}`)
      .maybeSingle();

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Query timeout after ${QUERY_TIMEOUT_MS}ms`)), QUERY_TIMEOUT_MS)
    );

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    const queryTime = Date.now() - startTime;
    console.log(`[slugResolver] Query completed in ${queryTime}ms for slug: ${slug}`);

    if (error) {
      console.error('[slugResolver] Query error:', error.message);
      return null;
    }

    if (!data) {
      console.log(`[slugResolver] No article found for slug: ${slug}`);
      return null;
    }
    
    console.log(`[slugResolver] Resolved: ${slug} → ${data.id}`);

    return {
      id: data.id,
      slug: data.slug,
      slugAlias: data.slug_alias,
    };
  } catch (err) {
    console.error('[slugResolver] Error resolving slug:', err);
    return null;
  }
}

/**
 * Checks if an article exists for a given slug.
 * 
 * @param slug - The slug or slug_alias to check
 * @returns true if article exists, false otherwise
 */
export async function articleSlugExists(slug: string): Promise<boolean> {
  const result = await resolveArticleId(slug);
  return result !== null;
}

/**
 * Resolves multiple slugs in a single batch query.
 * More efficient than calling resolveArticleId multiple times.
 * 
 * @param slugs - Array of slugs to resolve
 * @returns Map of slug to resolved data
 */
export async function resolveMultipleSlugs(slugs: string[]): Promise<Map<string, ResolvedSlug>> {
  if (!slugs || slugs.length === 0) return new Map();
  
  const startTime = Date.now();
  const results = new Map<string, ResolvedSlug>();
  
  try {
    // Build OR condition for all slugs
    const conditions = slugs.map(s => `slug_alias.eq.${s},slug.eq.${s}`).join(',');
    
    const { data, error } = await supabase
      .from('srangam_articles')
      .select('id, slug, slug_alias')
      .or(conditions);

    const queryTime = Date.now() - startTime;
    console.log(`[slugResolver] Batch query for ${slugs.length} slugs completed in ${queryTime}ms`);

    if (error || !data) {
      console.error('[slugResolver] Batch query error:', error?.message);
      return results;
    }

    // Map results back to input slugs
    for (const article of data) {
      const resolvedSlug: ResolvedSlug = {
        id: article.id,
        slug: article.slug,
        slugAlias: article.slug_alias,
      };
      
      // Map by both slug and slug_alias for easy lookup
      results.set(article.slug, resolvedSlug);
      if (article.slug_alias) {
        results.set(article.slug_alias, resolvedSlug);
      }
    }

    return results;
  } catch (err) {
    console.error('[slugResolver] Batch resolution error:', err);
    return results;
  }
}
