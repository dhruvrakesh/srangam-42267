/**
 * get-public-config
 *
 * Returns public, non-secret config that the browser is allowed to know,
 * sourced from server-side env so it can be rotated without a rebuild.
 *
 * Right now: only the Mapbox PUBLIC token (`pk.…`). It's a publishable
 * scope-restricted token — safe to ship to clients. We expose it via an
 * edge function (rather than VITE_*) so rotation is one secret update,
 * not a redeploy of the SPA.
 *
 * Cached aggressively in the browser (sessionStorage) and on the CDN
 * (Cache-Control: public, max-age=300, stale-while-revalidate=600).
 */
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const mapboxPublicToken = Deno.env.get("MAPBOX_PUBLIC_TOKEN") ?? "";

  const body = {
    mapbox: {
      publicToken: mapboxPublicToken,
      hasToken: mapboxPublicToken.length > 0,
    },
    issuedAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
});
