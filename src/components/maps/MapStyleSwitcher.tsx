/**
 * MapStyleSwitcher — segmented control for the Maps & Data atlas.
 *
 * Persists the choice in localStorage so the user's preferred basemap
 * survives reloads. When no Mapbox token is available we hide the switcher
 * (OSM only has one style).
 */
import React from "react";
import { Button } from "@/components/ui/button";
import {
  MAP_STYLE_OPTIONS,
  type MapStyle,
  getTileLayer,
} from "@/lib/mapTiles";

const STORAGE_KEY = "srangam:mapStyle:v1";

export function useMapStyle(defaultStyle: MapStyle = "outdoors-v12") {
  const [style, setStyleState] = React.useState<MapStyle>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v && MAP_STYLE_OPTIONS.some((o) => o.value === v)) return v as MapStyle;
    } catch {
      /* ignore */
    }
    return defaultStyle;
  });

  const setStyle = React.useCallback((s: MapStyle) => {
    setStyleState(s);
    try {
      localStorage.setItem(STORAGE_KEY, s);
    } catch {
      /* ignore */
    }
  }, []);

  return [style, setStyle] as const;
}

interface Props {
  value: MapStyle;
  onChange: (s: MapStyle) => void;
  className?: string;
}

export const MapStyleSwitcher: React.FC<Props> = ({ value, onChange, className }) => {
  const provider = getTileLayer(value).provider;
  if (provider !== "mapbox") {
    // OSM-only: no point showing styles we can't render.
    return null;
  }
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 rounded-md border border-border bg-muted/30 p-1 ${className ?? ""}`}
      role="radiogroup"
      aria-label="Map style"
    >
      {MAP_STYLE_OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <Button
            key={opt.value}
            type="button"
            size="sm"
            variant={active ? "default" : "ghost"}
            className="h-7 px-2.5 text-xs"
            aria-checked={active}
            role="radio"
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
};

MapStyleSwitcher.displayName = "MapStyleSwitcher";
