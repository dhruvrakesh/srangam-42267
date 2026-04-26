/**
 * Leaflet default-icon shim — Phase H.2c
 *
 * Leaflet's default marker icons reference relative paths that don't survive
 * Vite bundling. The fix lived inline inside `EpigraphicAtlasMap.tsx`;
 * extracting it here so `ArticleMiniMap` (and any future map component) can
 * share one copy.
 *
 * Call `ensureLeafletIcons()` once in any file that imports `react-leaflet`.
 * Idempotent — safe to call from multiple components.
 */
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let initialised = false;

export function ensureLeafletIcons(): void {
  if (initialised) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
  });
  initialised = true;
}
