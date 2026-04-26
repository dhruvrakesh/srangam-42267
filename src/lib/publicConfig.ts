/**
 * publicConfig — cached fetcher for non-secret runtime config served by the
 * `get-public-config` edge function.
 *
 * - One in-flight promise per page load (no thundering herd from multiple maps).
 * - Persists to sessionStorage so route changes don't re-fetch.
 * - Never throws — failure resolves to `{ mapbox: { hasToken: false } }` so
 *   callers can gracefully fall back (e.g. to OSM tiles).
 */
import { supabase } from "@/integrations/supabase/client";

export interface PublicConfig {
  mapbox: {
    publicToken: string;
    hasToken: boolean;
  };
}

const STORAGE_KEY = "srangam:publicConfig:v1";
const FALLBACK: PublicConfig = {
  mapbox: { publicToken: "", hasToken: false },
};

let inFlight: Promise<PublicConfig> | null = null;

function readCache(): PublicConfig | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PublicConfig;
    if (parsed && parsed.mapbox && typeof parsed.mapbox.publicToken === "string") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(cfg: PublicConfig) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    /* ignore */
  }
}

export async function getPublicConfig(): Promise<PublicConfig> {
  const cached = readCache();
  if (cached) return cached;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-public-config");
      if (error || !data) return FALLBACK;
      const cfg: PublicConfig = {
        mapbox: {
          publicToken: data?.mapbox?.publicToken ?? "",
          hasToken: !!data?.mapbox?.hasToken,
        },
      };
      writeCache(cfg);
      return cfg;
    } catch {
      return FALLBACK;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Synchronous read of the cached token, if any. Useful for non-async callers. */
export function getCachedMapboxToken(): string {
  return readCache()?.mapbox.publicToken ?? "";
}
