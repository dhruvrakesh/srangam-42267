/**
 * Article-pin loader — Phase H.2c
 *
 * One Supabase round-trip joining `srangam_article_pins` →
 * `srangam_gazetteer`, returning the same `{name, lat, lon, approximate}`
 * shape that `OceanicArticlePage.tsx` already consumes via
 * `ResolvedArticle.pins`. Adds optional `confidence` so the
 * `<ArticleMiniMap>` can colour markers A / B / C without a second query.
 *
 * Always returns an array — never throws — so the article resolver can
 * splice it in without changing its existing timeout / fallback contract.
 */
import { supabase } from '@/integrations/supabase/client';

export type PinConfidence = 'A' | 'B' | 'C';

export interface ArticlePin {
  name: string;
  lat: number;
  lon: number;
  approximate?: boolean;
  confidence?: PinConfidence;
  /** Phase Y.3 — used to deep-link from popup to /atlas?id=… */
  gazetteer_id?: string;
}

const PIN_TIMEOUT_MS = 4000;

interface PinJoinRow {
  confidence: PinConfidence | null;
  display_order: number | null;
  gazetteer_id: string | null;
  srangam_gazetteer: {
    canonical_name: string;
    latitude: number | string;
    longitude: number | string;
    precision: 'point' | 'centroid' | 'approximate' | null;
  } | null;
}

export async function loadArticlePins(articleId: string | undefined): Promise<ArticlePin[]> {
  if (!articleId) return [];

  const queryPromise = supabase
    .from('srangam_article_pins')
    .select(
      `confidence,
       display_order,
       gazetteer_id,
       srangam_gazetteer:gazetteer_id (
         canonical_name,
         latitude,
         longitude,
         precision
       )`,
    )
    .eq('article_id', articleId)
    .order('display_order', { ascending: true });

  const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
    setTimeout(
      () => resolve({ data: null, error: new Error(`pin query timeout ${PIN_TIMEOUT_MS}ms`) }),
      PIN_TIMEOUT_MS,
    ),
  );

  try {
    const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as {
      data: PinJoinRow[] | null;
      error: any;
    };

    if (error || !data) {
      if (error) console.warn('[articlePins] load failed:', error.message ?? error);
      return [];
    }

    return data
      .map((row): ArticlePin | null => {
        const g = row.srangam_gazetteer;
        if (!g) return null;
        const lat = Number(g.latitude);
        const lon = Number(g.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        return {
          name: g.canonical_name,
          lat,
          lon,
          approximate: g.precision !== 'point',
          confidence: row.confidence ?? undefined,
          gazetteer_id: row.gazetteer_id ?? undefined,
        };
      })
      .filter((p): p is ArticlePin => p !== null);
  } catch (e) {
    console.warn('[articlePins] unexpected:', e);
    return [];
  }
}
