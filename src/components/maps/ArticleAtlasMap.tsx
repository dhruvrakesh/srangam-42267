/**
 * Phase H.3 — Public Article Atlas (Pelagios / Arches pattern).
 *
 * One Leaflet canvas showing every place mentioned by every published
 * article. Click a marker → popup lists every article that pins it, each
 * a clickable link to /articles/{slug}.
 *
 * Markers are coloured by best confidence at that place (A green, B blue,
 * C amber) and scale slightly with article count so dense hubs stand out.
 *
 * Loaded lazily — Leaflet adds ~150kB and we only want it when the user
 * opens the Maps & Data page.
 */
import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { ensureLeafletIcons } from '@/lib/leafletIcons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';
import type { GeographyRow } from '@/hooks/useArticleGeography';
import { getTileLayer, type MapStyle } from '@/lib/mapTiles';

ensureLeafletIcons();

interface PlaceCluster {
  place_id: string;
  place_name: string;
  latitude: number;
  longitude: number;
  precision: GeographyRow['precision'];
  bestConfidence: 'A' | 'B' | 'C';
  articles: {
    article_id: string;
    slug: string;
    title: string;
    theme: string;
    tags: string[];
    confidence: 'A' | 'B' | 'C';
  }[];
}

const CONFIDENCE_RANK: Record<'A' | 'B' | 'C', number> = { A: 0, B: 1, C: 2 };

// HSL semantic-token-friendly fills via Tailwind's CSS variables.
function colorForConfidence(c: 'A' | 'B' | 'C'): string {
  return c === 'A' ? '#15803d' /* green-700 */
       : c === 'B' ? '#1d4ed8' /* blue-700  */
       :            '#b45309' /* amber-700 */;
}

export interface ArticleAtlasMapProps {
  rows: GeographyRow[];
  themeFilter?: string | null;
  confidenceFilter?: ('A' | 'B' | 'C')[];
  onPlaceCount?: (count: number) => void;
  /** Mapbox style id; defaults to outdoors. Falls back to OSM when no token. */
  mapStyle?: MapStyle;
}

export const ArticleAtlasMap: React.FC<ArticleAtlasMapProps> = ({
  rows,
  themeFilter,
  confidenceFilter,
  onPlaceCount,
  mapStyle = 'outdoors-v12',
}) => {
  const tiles = useMemo(() => getTileLayer(mapStyle), [mapStyle]);
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null);

  const clusters = useMemo<PlaceCluster[]>(() => {
    const filtered = rows.filter((r) => {
      if (themeFilter && r.article_theme !== themeFilter) return false;
      if (confidenceFilter && confidenceFilter.length > 0 && !confidenceFilter.includes(r.pin_confidence)) return false;
      return true;
    });

    const map = new Map<string, PlaceCluster>();
    for (const r of filtered) {
      let c = map.get(r.place_id);
      if (!c) {
        c = {
          place_id: r.place_id,
          place_name: r.place_name,
          latitude: r.latitude,
          longitude: r.longitude,
          precision: r.precision,
          bestConfidence: r.pin_confidence,
          articles: [],
        };
        map.set(r.place_id, c);
      }
      if (CONFIDENCE_RANK[r.pin_confidence] < CONFIDENCE_RANK[c.bestConfidence]) {
        c.bestConfidence = r.pin_confidence;
      }
      c.articles.push({
        article_id: r.article_id,
        slug: r.article_slug_alias || r.article_slug,
        title: r.article_title_en,
        theme: r.article_theme,
        tags: r.article_tags,
        confidence: r.pin_confidence,
      });
    }
    const out = [...map.values()].sort((a, b) => b.articles.length - a.articles.length);
    onPlaceCount?.(out.length);
    return out;
  }, [rows, themeFilter, confidenceFilter, onPlaceCount]);

  if (clusters.length === 0) {
    return (
      <div className="w-full h-[480px] rounded-md border border-border bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
        No article geography matches the current filters.
      </div>
    );
  }

  return (
    <div className="w-full h-[520px] rounded-md overflow-hidden border border-border">
      <MapContainer
        center={[15, 80]}
        zoom={4}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={tiles.url}
          attribution={tiles.attribution}
          url={tiles.url}
          maxZoom={tiles.maxZoom}
          tileSize={tiles.tileSize}
        />
        {clusters.map((c) => {
          const radius = Math.min(6 + Math.sqrt(c.articles.length) * 3, 18);
          return (
            <CircleMarker
              key={c.place_id}
              center={[c.latitude, c.longitude]}
              radius={radius}
              pathOptions={{
                color: colorForConfidence(c.bestConfidence),
                fillColor: colorForConfidence(c.bestConfidence),
                fillOpacity: 0.55,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => setOpenPlaceId(c.place_id),
              }}
            >
              <Popup>
                <div className="min-w-[220px] max-w-[280px]">
                  <div className="font-semibold text-base mb-1">{c.place_name}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {c.latitude.toFixed(2)}°, {c.longitude.toFixed(2)}°
                    {c.precision !== 'point' && ' · approximate'}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {c.articles.length} article{c.articles.length === 1 ? '' : 's'}
                  </div>
                  <ul className="space-y-1.5 max-h-44 overflow-y-auto">
                    {c.articles.map((a) => (
                      <li key={a.article_id + a.slug} className="text-sm">
                        <Link
                          to={`/articles/${a.slug}`}
                          className="text-primary hover:underline leading-snug block"
                        >
                          {a.title}
                        </Link>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {a.theme}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0"
                            style={{ color: colorForConfidence(a.confidence) }}
                          >
                            {a.confidence}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

ArticleAtlasMap.displayName = 'ArticleAtlasMap';
