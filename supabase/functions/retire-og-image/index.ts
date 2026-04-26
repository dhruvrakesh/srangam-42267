/**
 * Phase H.3 — Retire an OG image (soft delete).
 *
 * Admin-only. Marks the active media_asset row as 'retired' (with retired_at)
 * and updates the article so the frontend stops serving the URL. The GDrive
 * file is NOT deleted — operators can sweep retired files on a separate
 * cadence. This matches Cloudinary's "soft retire" semantics.
 *
 * Body: { articleId: string }  // marks the currently active OG image retired
 *     | { assetId: string }    // marks a specific media_asset row retired
 *
 * Response: { ok: true, retired_asset_id, version }
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Admin gate
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'missing bearer token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: 'invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userRes.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'admin role required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { articleId, assetId } = body as { articleId?: string; assetId?: string };
    if (!articleId && !assetId) {
      return new Response(JSON.stringify({ error: 'articleId or assetId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let target: { id: string; article_id: string; version: number } | null = null;

    if (assetId) {
      const { data } = await admin
        .from('srangam_media_assets')
        .select('id, article_id, version')
        .eq('id', assetId)
        .maybeSingle();
      target = data as any;
    } else if (articleId) {
      const { data } = await admin
        .from('srangam_media_assets')
        .select('id, article_id, version')
        .eq('article_id', articleId)
        .eq('kind', 'og_image')
        .eq('status', 'active')
        .maybeSingle();
      target = data as any;
    }

    if (!target) {
      return new Response(JSON.stringify({ error: 'no matching active asset found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: updErr } = await admin
      .from('srangam_media_assets')
      .update({ status: 'retired', retired_at: new Date().toISOString() })
      .eq('id', target.id);
    if (updErr) throw updErr;

    // Clear the article-side pointer so the frontend falls back to the brand image
    await admin
      .from('srangam_articles')
      .update({ og_image_url: null, og_image_status: 'retired' })
      .eq('id', target.article_id);

    console.log(JSON.stringify({
      evt: 'og_image_retired',
      asset_id: target.id,
      article_id: target.article_id,
      version: target.version,
      ts: new Date().toISOString(),
    }));

    return new Response(JSON.stringify({
      ok: true,
      retired_asset_id: target.id,
      article_id: target.article_id,
      version: target.version,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[retire-og-image] fatal:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
