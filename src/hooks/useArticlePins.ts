import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { loadArticlePins, type ArticlePin } from '@/lib/articlePins';

/**
 * PINS_IN_PANEL_2026_09_07
 *
 * srangam_article_pins was already loaded by articleResolver.ts (via
 * loadArticlePins) and rendered on the map, but NO React-Query hook wrapped it,
 * so the "Sources & Pins" panel could not see it. That panel's own test for
 * whether the database has anything to show was
 *
 *     hasDbData = bibliography.length > 0 || evidence.length > 0
 *
 * with pins absent from the expression entirely. Measured 2026-09-07:
 * 46 of 59 articles have pins, 5 have bibliography and 9 have evidence — so a
 * panel named "Sources & Pins" was showing its empty state for articles that
 * hold pins and nothing else. custodians-unfinished-time has 3 pins and
 * displayed "No structured evidence or bibliography rows are stored for this
 * article in the database yet".
 *
 * This is a thin wrapper only. The loader, its timeout and its gazetteer join
 * are unchanged — duplicating them was the tempting mistake.
 */
export function useArticlePins(articleId: string | undefined) {
  return useQuery({
    queryKey: ['article-pins', articleId],
    queryFn: async (): Promise<ArticlePin[]> => {
      if (!articleId) return [];
      return loadArticlePins(articleId);
    },
    enabled: !!articleId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Resolve slug (or slug_alias) to an id, then load that article's pins.
 *  Alias is tried FIRST, matching useArticleEvidenceBySlug — the corpus has
 *  39 damaged slugs whose clean alias is what the URL actually uses. */
export function useArticlePinsBySlug(slug: string | undefined) {
  const { data: article } = useQuery({
    queryKey: ['article-id-from-slug-pins', slug],
    queryFn: async () => {
      if (!slug) return null;
      let { data } = await supabase
        .from('srangam_articles')
        .select('id')
        .eq('slug_alias', slug)
        .maybeSingle();

      if (!data) {
        const result = await supabase
          .from('srangam_articles')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        data = result.data;
      }
      return data;
    },
    enabled: !!slug,
  });

  return useArticlePins(article?.id);
}
