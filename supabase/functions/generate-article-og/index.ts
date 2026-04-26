import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { sanitizeSnippet } from '../_shared/text-sanitizer.ts';
import { callImage, NoAIProviderError } from '../_shared/ai-provider.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// ===== HTTP entry ============================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { articleId, title: rawTitle, theme, slug, force } = await req.json();
    const title = sanitizeSnippet(rawTitle ?? '', 200);
    const forceRegen = force === true;

    if (!articleId) {
      return new Response(JSON.stringify({ error: 'articleId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');
    const serviceAccount = JSON.parse(serviceAccountJson);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const colors = themeColors[theme] || themeColors['Ancient India'];

    const prompt = `Create a professional academic Open Graph image (1792x1024 landscape) for a scholarly article about Indian civilization research:

TITLE: "${title}"
THEME: ${theme}

DESIGN REQUIREMENTS:
- Clean, minimalist academic aesthetic with dignified scholarly appearance
- Sacred geometry patterns as subtle background (faded mandala, yantra, or ${colors.motif})
- The article title "${title}" MUST appear clearly readable in large elegant serif font (center or left-aligned)
- Primary color: ${colors.primary}
- Accent color: ${colors.accent}
- Background: warm cream (#F8F5F0) with subtle texture
- NO photographs, NO human faces, NO AI-looking effects
- Professional typography suitable for academic journals
- Subtle dharmic/Indic design elements as decorative borders or corners
- Clear visual hierarchy: title prominent, decorative elements subtle

STYLE: Scholarly, dignified, suitable for sharing on LinkedIn, Twitter, and academic platforms. Think academic journal cover or museum exhibition poster.`;

    const promptHash = await sha256Hex(prompt);

    // Idempotency: same prompt_hash already produced an active asset → no-op
    if (!forceRegen) {
      const { data: existing } = await supabase
        .from('srangam_media_assets')
        .select('id, version, gdrive_share_url, prompt_hash')
        .eq('article_id', articleId)
        .eq('kind', 'og_image')
        .eq('status', 'active')
        .maybeSingle();
      if (existing && existing.prompt_hash === promptHash) {
        console.log(JSON.stringify({
          evt: 'og_image_skip', reason: 'identical_prompt_hash',
          article_id: articleId, version: existing.version,
        }));
        return new Response(JSON.stringify({
          success: true,
          url: existing.gdrive_share_url,
          version: existing.version,
          skipped: true,
          reason: 'identical_prompt_hash',
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Compute next version
    const { data: prevRow } = await supabase
      .from('srangam_media_assets')
      .select('version')
      .eq('article_id', articleId)
      .eq('kind', 'og_image')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextVersion = (prevRow?.version ?? 0) + 1;

    // Generate image (Gemini → OpenAI fallback, both via customer keys)
    let img;
    try {
      img = await callImage(prompt, { shape: 'landscape' });
    } catch (e) {
      if (e instanceof NoAIProviderError) {
        return new Response(JSON.stringify({
          error: 'No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.',
        }), { status: 412, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw e;
    }

    const fileName = `og-${slug || articleId}-v${nextVersion}-${todayYmd()}.png`;
    const { fileId, shareUrl } = await uploadToGoogleDrive(img.bytes, fileName, img.mime, serviceAccount);

    // Flip previous active → superseded
    await supabase
      .from('srangam_media_assets')
      .update({ status: 'superseded' })
      .eq('article_id', articleId)
      .eq('kind', 'og_image')
      .eq('status', 'active');

    // Insert new active asset
    const { error: insErr } = await supabase
      .from('srangam_media_assets')
      .insert({
        article_id: articleId,
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

    // Denormalised pointers on the article
    await supabase
      .from('srangam_articles')
      .update({
        og_image_url: shareUrl,
        og_image_version: nextVersion,
        og_image_status: 'active',
      })
      .eq('id', articleId);

    console.log(JSON.stringify({
      evt: 'og_image_generated',
      article_id: articleId,
      slug,
      provider: img.provider,
      model: img.model,
      version: nextVersion,
      latency_ms: img.latency_ms,
      cost_usd: img.cost_usd_estimate,
      gdrive_file_id: fileId,
      ts: new Date().toISOString(),
    }));

    return new Response(JSON.stringify({
      success: true,
      url: shareUrl,
      gdrive_file_id: fileId,
      version: nextVersion,
      provider: img.provider,
      model: img.model,
      cost_usd: img.cost_usd_estimate,
      latency_ms: img.latency_ms,
      revised_prompt: img.revised_prompt,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('OG generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
