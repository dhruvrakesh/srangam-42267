import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { sanitizeSnippet } from '../_shared/text-sanitizer.ts';
import { callImage, NoAIProviderError } from '../_shared/ai-provider.ts';
import { reportItem, isCancelled, finishJob, touchHeartbeat } from '../_shared/jobs.ts';

import { requireAdmin } from '../_shared/auth-gate.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Phase X.1 — one entry in a bulk OG job's params.targets[]. */
interface OgTarget {
  articleId: string;
  title: string;
  theme: string;
  slug: string;
}


// Theme palette (preserved from previous implementation for visual continuity)
const themeColors: Record<string, { primary: string; accent: string; motif: string }> = {
  'Ancient India':         { primary: 'saffron orange (#FF9933)', accent: 'deep burgundy (#7B2D26)', motif: 'temple silhouette, lotus pattern' },
  'Indian Ocean World':    { primary: 'ocean teal (#2A9D8F)',     accent: 'coral gold (#D4A574)',    motif: 'wave patterns, dhow ship silhouette' },
  'Scripts & Inscriptions':{ primary: 'stone gray (#6B7280)',     accent: 'copper brown (#B87333)',  motif: 'ancient script fragments, pillar silhouette' },
  'Geology & Deep Time':   { primary: 'laterite red (#C84B31)',   accent: 'earth brown (#8B4513)',   motif: 'rock strata, mountain silhouette' },
  'Empires & Exchange':    { primary: 'royal purple (#6B21A8)',   accent: 'gold metallic (#D4AF37)', motif: 'coin motifs, caravan silhouette' },
  'Sacred Ecology':        { primary: 'forest green (#2E5E3F)',   accent: 'bronze (#A0703B)',        motif: 'sacred grove, tree silhouette' },
};

// ===== Google Drive upload (unchanged from prior version) =====================
async function createJWT(serviceAccount: any): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const enc = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsigned = `${enc(header)}.${enc(payload)}`;

  const pem = serviceAccount.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\\n/g, '')
    .replace(/\s/g, '');
  const bin = atob(pem);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  const key = await crypto.subtle.importKey(
    'pkcs8', bytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const sigEnc = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${unsigned}.${sigEnc}`;
}

async function uploadToGoogleDrive(
  imageBytes: Uint8Array,
  fileName: string,
  mime: string,
  serviceAccount: any,
): Promise<{ fileId: string; shareUrl: string }> {
  const jwt = await createJWT(serviceAccount);
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!tokenRes.ok) throw new Error(`Google OAuth: ${await tokenRes.text()}`);
  const { access_token } = await tokenRes.json();

  const metadata = {
    name: fileName,
    mimeType: mime,
    parents: ['0AHOa_eCfO3arUk9PVA'], // Srangam Shared Drive
  };

  // Chunked base64 (avoids stack overflow on 2-3MB images)
  let b64 = '';
  const chunk = 65536;
  for (let i = 0; i < imageBytes.length; i += chunk) {
    b64 += String.fromCharCode(...imageBytes.slice(i, Math.min(i + chunk, imageBytes.length)));
  }
  const base64Image = btoa(b64);

  const boundary = '-------314159265358979323846';
  const body =
    `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\nContent-Type: ${mime}\r\nContent-Transfer-Encoding: base64\r\n\r\n` +
    base64Image +
    `\r\n--${boundary}--`;

  const upRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );
  if (!upRes.ok) throw new Error(`GDrive upload: ${await upRes.text()}`);
  const file = await upRes.json();

  await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions?supportsAllDrives=true`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });

  return { fileId: file.id, shareUrl: `https://drive.google.com/uc?export=view&id=${file.id}` };
}

// ===== prompt hash (idempotency) ============================================
async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function todayYmd(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Per-article OG generation. Extracted so both single-shot calls and the
 * Phase X.1 bulk self-pump branch share one code path.
 */
async function generateOneOg(
  supabase: ReturnType<typeof createClient>,
  serviceAccount: any,
  t: OgTarget,
  forceRegen: boolean,
): Promise<{
  skipped?: true;
  reason?: string;
  url: string;
  version: number;
  cost_usd: number;
  provider?: string;
  model?: string;
  latency_ms?: number;
}> {
  const title = sanitizeSnippet(t.title ?? '', 200);
  const colors = themeColors[t.theme] || themeColors['Ancient India'];
  const subject = `Symbolic, non-literal evocation of "${title}": ${t.theme} iconography drawing on ${colors.motif}, rendered as visual metaphor — never as text.`;

  const prompt = `Create a professional academic Open Graph image (1792x1024 landscape) for a scholarly article about Indian civilization research.

SUBJECT: ${subject}
THEME: ${t.theme}
INTERNAL_TITLE (do not render in the image): "${title}"

DESIGN REQUIREMENTS:
- Clean, minimalist academic aesthetic with dignified scholarly appearance.
- Sacred geometry as subtle background (faded mandala, yantra, or ${colors.motif}).
- Primary color: ${colors.primary}.
- Accent color: ${colors.accent}.
- Background: warm cream (#F8F5F0) with subtle texture.
- Subtle dharmic/Indic decorative borders or corner motifs.
- Composition reads as a museum exhibition poster or academic journal cover.

NEGATIVE (strict, non-negotiable):
- Absolutely NO text, NO letters, NO glyphs, NO captions, NO watermarks, NO signage.
- NO calligraphy of the title, NO pseudo-script, NO Devanagari, NO Latin lettering, NO numerals.
- NO photographs, NO human faces, NO logos, NO AI-looking gradients or chromatic aberration.

STYLE: Scholarly, dignified, suitable for sharing on LinkedIn, Twitter, and academic platforms. Pure iconography — the article title appears only in the page's H1 and meta tags, never inside the image.`;

  const promptHash = await sha256Hex(prompt);

  if (!forceRegen) {
    const { data: existing } = await supabase
      .from('srangam_media_assets')
      .select('id, version, gdrive_share_url, prompt_hash')
      .eq('article_id', t.articleId)
      .eq('kind', 'og_image')
      .eq('status', 'active')
      .maybeSingle();
    if (existing && existing.prompt_hash === promptHash) {
      console.log(JSON.stringify({
        evt: 'og_image_skip', reason: 'identical_prompt_hash',
        article_id: t.articleId, version: existing.version,
      }));
      return {
        skipped: true,
        reason: 'identical_prompt_hash',
        url: existing.gdrive_share_url,
        version: existing.version,
        cost_usd: 0,
      };
    }
  }

  const { data: prevRow } = await supabase
    .from('srangam_media_assets')
    .select('version')
    .eq('article_id', t.articleId)
    .eq('kind', 'og_image')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = (prevRow?.version ?? 0) + 1;

  const img = await callImage(prompt, { shape: 'landscape' });

  const fileName = `og-${t.slug || t.articleId}-v${nextVersion}-${todayYmd()}.png`;
  const { fileId, shareUrl } = await uploadToGoogleDrive(img.bytes, fileName, img.mime, serviceAccount);

  await supabase
    .from('srangam_media_assets')
    .update({ status: 'superseded' })
    .eq('article_id', t.articleId)
    .eq('kind', 'og_image')
    .eq('status', 'active');

  const { error: insErr } = await supabase
    .from('srangam_media_assets')
    .insert({
      article_id: t.articleId,
      kind: 'og_image',
      provider: img.provider,
      model: img.model,
      gdrive_file_id: fileId,
      gdrive_share_url: shareUrl,
      version: nextVersion,
      status: 'active',
      prompt_hash: promptHash,
      cost_usd: img.cost_usd_estimate,
    });
  if (insErr) console.error('media_assets insert:', insErr);

  await supabase
    .from('srangam_articles')
    .update({
      og_image_url: shareUrl,
      og_image_version: nextVersion,
      og_image_status: 'active',
    })
    .eq('id', t.articleId);

  console.log(JSON.stringify({
    evt: 'og_image_generated',
    article_id: t.articleId,
    slug: t.slug,
    provider: img.provider,
    model: img.model,
    version: nextVersion,
    latency_ms: img.latency_ms,
    cost_usd: img.cost_usd_estimate,
    gdrive_file_id: fileId,
    ts: new Date().toISOString(),
  }));

  return {
    url: shareUrl,
    version: nextVersion,
    cost_usd: img.cost_usd_estimate,
    provider: img.provider,
    model: img.model,
    latency_ms: img.latency_ms,
  };
}

/** Phase X.1: schedule the next pump invocation in background. */
function schedulePumpReinvoke(selfUrl: string, body: any) {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey) return;
  // @ts-ignore — EdgeRuntime is provided by Supabase Edge Runtime.
  const waitUntil = (globalThis as any).EdgeRuntime?.waitUntil;
  const fetchP = fetch(selfUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ ...body, _pump: true }),
  }).then(async (r) => {
    if (!r.ok) console.error('[generate-article-og] pump reinvoke failed:', r.status, await r.text());
  }).catch((e) => console.error('[generate-article-og] pump reinvoke error:', e?.message ?? e));
  if (typeof waitUntil === 'function') waitUntil(fetchP);
}

// ===== HTTP entry ============================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const body = await req.clone().json().catch(() => ({} as any));
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // ---- Auth gate: pump uses service-role bearer, else admin JWT ----------
  const isPump = body?._pump === true && !!body?.job_id;
  if (isPump) {
    const auth = req.headers.get('Authorization') ?? '';
    if (auth !== `Bearer ${serviceKey}`) {
      return new Response(JSON.stringify({ error: 'pump auth required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } else {
    const __gate = await requireAdmin(req);
    if (__gate.error) return __gate.error;
  }

  try {
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');
    const serviceAccount = JSON.parse(serviceAccountJson);
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);

    // ---- Branch A: bulk pump mode --------------------------------------
    // body shape: { job_id, cursor, _pump?, force? }. The targets list lives
    // in srangam_admin_jobs.params.targets[] (persisted by the UI when the
    // bulk job is created). Each invocation processes ONE target, reports
    // progress, then self-reinvokes for the next target if work remains.
    if (body?.job_id && (body?._pump === true || Array.isArray(body?.targets))) {
      // First invocation may carry targets[] in the body so the UI can avoid a
      // second round-trip; on subsequent pumps we read them from params.
      let targets: OgTarget[] = Array.isArray(body.targets) ? body.targets : [];
      const cursor: number = Number(body.cursor ?? 0);
      const force: boolean = body.force === true;

      if (targets.length === 0) {
        const { data: jobRow } = await supabase
          .from('srangam_admin_jobs')
          .select('params')
          .eq('id', body.job_id)
          .maybeSingle();
        const params = (jobRow?.params ?? {}) as any;
        targets = Array.isArray(params.targets) ? params.targets : [];
      }

      if (await isCancelled(supabase, body.job_id)) {
        return new Response(JSON.stringify({ ok: true, cancelled: true, done: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (cursor >= targets.length) {
        await finishJob(supabase, body.job_id, 'succeeded');
        return new Response(JSON.stringify({ ok: true, done: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const t = targets[cursor];
      await touchHeartbeat(supabase, body.job_id);
      try {
        const r = await generateOneOg(supabase, serviceAccount, t, force);
        await reportItem(supabase, body.job_id, {
          ok: true, item: t.slug || t.articleId, cost_delta_usd: r.cost_usd ?? 0,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[generate-article-og] ${t.slug} failed:`, msg);
        await reportItem(supabase, body.job_id, {
          ok: false, item: t.slug || t.articleId, error: msg,
        });
      }

      const nextCursor = cursor + 1;
      const done = nextCursor >= targets.length;
      if (done) {
        await finishJob(supabase, body.job_id, 'succeeded');
      } else {
        // Gentle pacing — image API ~10s/call; we add 600ms client-side delay
        // pattern preserved from the previous browser loop.
        await new Promise((r) => setTimeout(r, 600));
        // Pump without targets[] in body (already in params) to keep payload small.
        schedulePumpReinvoke(req.url, { job_id: body.job_id, cursor: nextCursor, force });
      }

      return new Response(JSON.stringify({
        ok: true, cursor: nextCursor, total: targets.length, done, pumped: !done,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ---- Branch B: single-article mode (back-compat, unchanged surface) -
    const { articleId, title: rawTitle, theme, slug, force } = body;
    if (!articleId) {
      return new Response(JSON.stringify({ error: 'articleId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const r = await generateOneOg(
        supabase, serviceAccount,
        { articleId, title: rawTitle ?? '', theme, slug },
        force === true,
      );
      if (r.skipped) {
        return new Response(JSON.stringify({
          success: true, url: r.url, version: r.version, skipped: true, reason: r.reason,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({
        success: true,
        url: r.url,
        version: r.version,
        provider: r.provider,
        model: r.model,
        cost_usd: r.cost_usd,
        latency_ms: r.latency_ms,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e) {
      if (e instanceof NoAIProviderError) {
        return new Response(JSON.stringify({
          error: 'No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.',
        }), { status: 412, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw e;
    }
  } catch (error) {
    console.error('OG generation error:', error);
    try {
      if (body?.job_id) {
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);
        await finishJob(supabase, body.job_id, 'failed', error instanceof Error ? error.message : String(error));
      }
    } catch { /* swallow */ }
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

