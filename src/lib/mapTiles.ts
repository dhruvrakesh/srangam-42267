/**
 * mapTiles — single source of truth for Leaflet `TileLayer` configuration.
 *
 * Returns Mapbox raster tiles when a public token is available, falling back
 * to OpenStreetMap when not. Lets every existing Leaflet map upgrade to
 * Mapbox cartography without a library swap.
 *
 * The token is sourced (in priority order):
 *   1. Runtime cache from `getPublicConfig()` (preferred — rotates without rebuild)
 *   2. `import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN` (build-time fallback)
 *   3. `import.meta.env.VITE_MAPBOX_TOKEN`        (legacy, kept for OceanMap etc.)
 */
import { getCachedMapboxToken } from "@/lib/publicConfig";

export type MapStyle =
  | "streets-v12"
  | "outdoors-v12"
  | "light-v11"
  | "dark-v11"
  | "satellite-streets-v12";

export interface TileLayerConfig {
  provider: "mapbox" | "osm";
  url: string;
  attribution: string;
  maxZoom: number;
  tileSize: number;
}

function resolveToken(): string {
  const runtime = getCachedMapboxToken();
  if (runtime) return runtime;
  const env =
    (import.meta as any).env?.VITE_MAPBOX_PUBLIC_TOKEN ??
    (import.meta as any).env?.VITE_MAPBOX_TOKEN ??
    "";
  return typeof env === "string" ? env : "";
}

export function getTileLayer(style: MapStyle = "outdoors-v12"): TileLayerConfig {
  const token = resolveToken();
  if (token) {
    return {
      provider: "mapbox",
      url: `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`,
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
      tileSize: 256,
    };
  }
  return {
    provider: "osm",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://osm.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 18,
    tileSize: 256,
  };
}

/** Friendly labels for the style switcher. */
export const MAP_STYLE_OPTIONS: { value: MapStyle; label: string }[] = [
  { value: "outdoors-v12", label: "Outdoors" },
  { value: "streets-v12", label: "Streets" },
  { value: "light-v11", label: "Light" },
  { value: "satellite-streets-v12", label: "Satellite" },
];
