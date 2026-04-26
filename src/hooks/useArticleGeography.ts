/**
 * Phase H.3 — Aggregate article geography for the public Atlas panel.
 *
 * One Supabase round-trip joining srangam_article_pins → srangam_gazetteer →
 * srangam_articles (status='published'). React-Query cached for 5 min so the
 * Maps & Data page never hits the network on tab switches.
 *
 * Returns one row per (place, article) so the UI can build either a
 * place-centric (one marker, multiple articles in popup) or article-centric
 * (one row, multiple places) view from the same payload.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GeographyRow {
  pin_confidence: 'A' | 'B' | 'C';
  place_id: string;
  place_name: string;
  latitude: number;
  longitude: number;
  precision: 'point' | 'centroid' | 'approximate';
  era_tags: string[];
  feature_type: string | null;
  country: string | null;
  article_id: string;
  article_slug: string;
  article_slug_alias: string | null;
  article_title_en: string;
  article_theme: string;
  article_tags: string[];
}

interface RawJoinRow {
  confidence: 'A' | 'B' | 'C';
  srangam_gazetteer: {
    id: string;
    canonical_name: string;
    latitude: number | string;
    longitude: number | string;
    precision: 'point' | 'centroid' | 'approximate' | null;
    era_tags: string[] | null;
    feature_type: string | null;
    country: string | null;
  } | null;
  srangam_articles: {
    id: string;
    slug: string;
    slug_alias: string | null;
    title: Record<string, string> | string;
    theme: string;
    tags: string[] | null;
    status: string;
  } | null;
}

async function fetchGeography(): Promise<GeographyRow[]> {
  const { data, error } = await supabase
    .from('srangam_article_pins')
    .select(`
      confidence,
      srangam_gazetteer:gazetteer_id (
        id, canonical_name, latitude, longitude, precision, era_tags, feature_type, country
      ),
      srangam_articles:article_id (
        id, slug, slug_alias, title, theme, tags, status
      )
    `)
    .limit(2000);

  if (error) {
    console.warn('[useArticleGeography] load failed:', error.message);
    return [];
  }

  const rows: GeographyRow[] = [];
  for (const r of (data ?? []) as RawJoinRow[]) {
    const g = r.srangam_gazetteer;
    const a = r.srangam_articles;
    if (!g || !a || a.status !== 'published') continue;

    const lat = Number(g.latitude);
    const lon = Number(g.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const titleEn =
      typeof a.title === 'object'
        ? (a.title.en ?? Object.values(a.title)[0] ?? a.slug)
        : String(a.title);

    rows.push({
      pin_confidence: r.confidence,
      place_id: g.id,
      place_name: g.canonical_name,
      latitude: lat,
      longitude: lon,
      precision: (g.precision ?? 'point'),
      era_tags: g.era_tags ?? [],
      feature_type: g.feature_type,
      country: g.country,
      article_id: a.id,
      article_slug: a.slug,
      article_slug_alias: a.slug_alias,
      article_title_en: titleEn,
      article_theme: a.theme,
      article_tags: a.tags ?? [],
    });
  }
  return rows;
}

export function useArticleGeography() {
  return useQuery({
    queryKey: ['article-geography'],
    queryFn: fetchGeography,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
