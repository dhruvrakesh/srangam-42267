/**
 * ArticleMiniMap — Phase H.2c
 *
 * Lazy, dynamically-imported Leaflet preview that only loads when the user
 * actually opens the interactive map for an article. Keeps Leaflet (~150 kB
 * gz) out of the article-page critical path so first-render budgets are
 * preserved.
 *
 * Reads the same `ResolvedArticle.pins` shape that the resolver now returns
 * from `srangam_article_pins`. Confidence (A / B / C) drives marker colour.
 *
 * Observability: emits a `performance.measure('article-map:<slug>', …)` so
 * the same DevTools Performance panel that Phase H.1 already used for
 * `mermaid:<id>` shows map render cost.
 */
import React, { useEffect, useRef, useState } from 'react';
import type { ArticlePin, PinConfidence } from '@/lib/articlePins';

interface Props {
  slug: string;
  pins: ArticlePin[];
}

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>';

const CONFIDENCE_COLOR: Record<PinConfidence, string> = {
  A: 'hsl(142 71% 45%)', // green   — direct evidence
  B: 'hsl(217 91% 60%)', // blue    — content scan
  C: 'hsl(38 92% 50%)',  // amber   — AI suggestion
};

function fitBoundsFromPins(pins: ArticlePin[]) {
  if (pins.length === 0) return null;
  const lats = pins.map((p) => p.lat);
  const lons = pins.map((p) => p.lon);
  return {
    sw: [Math.min(...lats), Math.min(...lons)] as [number, number],
    ne: [Math.max(...lats), Math.max(...lons)] as [number, number],
  };
}

export const ArticleMiniMap: React.FC<Props> = ({ slug, pins }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || pins.length === 0) return;

    let map: any;
    let cancelled = false;
    const startMark = `article-map:${slug}:start`;
    const endMark = `article-map:${slug}:end`;
    performance.mark(startMark);

    (async () => {
      try {
        // Dynamic imports — Leaflet stays out of the main chunk.
        const [{ default: L }] = await Promise.all([
          import('leaflet'),
          import('leaflet/dist/leaflet.css'),
        ]);
        const { ensureLeafletIcons } = await import('@/lib/leafletIcons');
        ensureLeafletIcons();

        if (cancelled || !containerRef.current) return;

        map = L.map(containerRef.current, {
          scrollWheelZoom: false,
          attributionControl: true,
        });
        L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 18 }).addTo(map);

        for (const p of pins) {
          const colour = p.confidence ? CONFIDENCE_COLOR[p.confidence] : 'hsl(217 91% 60%)';
          L.circleMarker([p.lat, p.lon], {
            radius: p.approximate ? 6 : 8,
            color: colour,
            weight: 2,
            fillColor: colour,
            fillOpacity: 0.65,
          })
            .bindPopup(
              `<strong>${escapeHtml(p.name)}</strong><br/>` +
                `${p.lat.toFixed(3)}°, ${p.lon.toFixed(3)}°` +
                (p.approximate ? '<br/><em>approximate</em>' : '') +
                (p.confidence ? `<br/><small>confidence ${p.confidence}</small>` : ''),
            )
            .addTo(map);
        }

        const bounds = fitBoundsFromPins(pins);
        if (bounds) {
          map.fitBounds([bounds.sw, bounds.ne], { padding: [24, 24], maxZoom: 7 });
        } else {
          map.setView([20, 78], 4);
        }

        performance.mark(endMark);
        try {
          performance.measure(`article-map:${slug}`, startMark, endMark);
        } catch {
          /* noop */
        }
      } catch (e) {
        console.warn('[ArticleMiniMap] failed:', e);
        if (!cancelled) setError('Map failed to load');
      }
    })();

    return () => {
      cancelled = true;
      try {
        if (map) map.remove();
      } catch {
        /* noop */
      }
    };
  }, [slug, pins]);

  if (pins.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No geo-located references for this article.
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="w-full h-[360px] rounded-md border border-border overflow-hidden bg-muted/20"
        aria-label={`Map of ${pins.length} places referenced in this article`}
      />
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <LegendDot color={CONFIDENCE_COLOR.A} label="Direct evidence" />
        <LegendDot color={CONFIDENCE_COLOR.B} label="Content match" />
        <LegendDot color={CONFIDENCE_COLOR.C} label="AI suggestion" />
      </div>
    </div>
  );
};

const LegendDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span className="inline-flex items-center gap-1.5">
    <span
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
    {label}
  </span>
);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default ArticleMiniMap;
