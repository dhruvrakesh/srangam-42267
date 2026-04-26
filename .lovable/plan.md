## Goal

Add Mapbox as the **primary** tile/style provider for the two new public atlas surfaces (Maps & Data page + per-article mini-map) while keeping OpenStreetMap/Leaflet as a zero-cost fallback. Stay inside Mapbox's free tier (50k map loads/month) and change nothing about article content, RLS, edge functions, or the admin job system.

This is surgical: no library swap, no route changes, no schema changes. We add a tiny token-aware "tiles provider" layer and let the existing Leaflet components consume Mapbox raster tiles when a token is present. Existing dedicated `MapboxPortMap` / `MapboxBujangNetwork` components already work with `VITE_MAPBOX_TOKEN` — we standardize on the same secret name so everything lights up at once.

## Why not rip out Leaflet?

- `react-leaflet` is already wired into ~12 article components and the new `ArticleAtlasMap` / `ArticleMiniMap`. Replacing them with `mapbox-gl` would be invasive and risk regressions on live article maps.
- Mapbox sells **raster tile endpoints** (`styles/v1/.../tiles/{z}/{x}/{y}`) that drop straight into Leaflet's `TileLayer`. We get Mapbox cartography (Streets, Outdoors, Satellite Streets, Light, Dark) without changing the rendering engine.
- Free tier covers raster tile requests generously and the token is restricted to the publishable scope.

## Token strategy (free-tier safe)

1. Use Mapbox **public token** (`pk.…`) — safe to ship in the bundle, scope-limited to `styles:tiles`, `styles:read`, `fonts:read`, `datasets:read`, `vision:read`.
2. Store it as `VITE_MAPBOX_PUBLIC_TOKEN` (Lovable secret, exposed to the client because of the `VITE_` prefix). Keep the existing `VITE_MAPBOX_TOKEN` as an alias so `MapboxPortMap` / `MapboxBujangNetwork` keep working.
3. Add a Mapbox URL-restriction (preview + custom domain + `*.lovable.app`) — documented in the README, not enforced in code.
4. If the token is missing, every map silently falls back to OSM tiles. No broken UI.

## Files to add / change

### New
- `src/lib/mapTiles.ts` — single source of truth that returns `{ url, attribution, maxZoom, provider: 'mapbox' | 'osm' }` based on token availability and a `style` argument (`streets-v12`, `outdoors-v12`, `light-v11`, `satellite-streets-v12`).
- `src/components/maps/MapStyleSwitcher.tsx` — small segmented control (Streets / Outdoors / Satellite / Light) used on the Maps & Data page only. Persists choice in `localStorage`.

### Edited (surgical, single-line `TileLayer.url` swap + props)
- `src/components/maps/ArticleAtlasMap.tsx` — read tiles from `mapTiles.ts`, accept a `style` prop, default to `outdoors-v12` (best for historical/geographic context).
- `src/components/articles/ArticleMiniMap.tsx` — same swap; default to `light-v11` (clean backdrop for pin clusters on article pages).
- `src/pages/MapsAndData.tsx` (or wherever `ArticleAtlasMap` is mounted) — mount `MapStyleSwitcher` above the map.
- `README.md` (or `docs/architecture/SOURCES_PINS_SYSTEM.md`) — note the env var + URL restriction step.

### Untouched (intentionally)
- All `src/components/articles/maps/*` and `src/components/interactive/*` — they already render correctly. We can migrate them in a later phase if the user wants.
- Edge functions, RLS, admin jobs, OG image pipeline, narration — none of it touches tile providers.

## Technical detail (for the curious)

```ts
// src/lib/mapTiles.ts
const TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN
           ?? import.meta.env.VITE_MAPBOX_TOKEN;

export type MapStyle = 'streets-v12' | 'outdoors-v12' | 'light-v11'
                     | 'dark-v11' | 'satellite-streets-v12';

export function getTileLayer(style: MapStyle = 'outdoors-v12') {
  if (TOKEN) {
    return {
      provider: 'mapbox' as const,
      url: `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/256/{z}/{x}/{y}@2x?access_token=${TOKEN}`,
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
      tileSize: 256,
    };
  }
  return {
    provider: 'osm' as const,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://osm.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
    tileSize: 256,
  };
}
```

`ArticleAtlasMap` and `ArticleMiniMap` both replace their hard-coded OSM URL with `getTileLayer(style)` — about 4 changed lines per file. Performance is unchanged (still 1 tile request per pan/zoom step). Bundle size is unchanged (no new imports — `mapbox-gl` stays untouched, we use Mapbox's raster tiles via Leaflet).

## Free-tier guard rails

- `@2x` retina tiles double cost per load on HiDPI; documented but kept on because cartography is the whole point.
- No autoplay / no animated style changes — every map load is user-initiated.
- `MapStyleSwitcher` debounces style changes via `localStorage` so refreshes don't re-request the previous style.
- Telemetry stays inside the existing `srangam_event_log` if we later want to count `map.tile.fetch` events (out of scope for this PR).

## Rollout

1. You add the secret `VITE_MAPBOX_PUBLIC_TOKEN` (Lovable will prompt).
2. Code changes ship behind the token check, so even if the secret is empty the site keeps working on OSM.
3. Verify on `/maps-and-data` and one article page that tiles look like Mapbox.
4. Later (separate task): migrate the legacy `src/components/articles/maps/*` family to `getTileLayer()` for consistent cartography.

## What this does NOT do

- Does not switch Leaflet → mapbox-gl GL JS (vector tiles). That's a bigger refactor; not needed for free-tier basemap upgrade.
- Does not change pin data, confidence colours, popups, or admin job flow.
- Does not add Mapbox Geocoding / Directions / Isochrone APIs (those eat free-tier quota fast).
