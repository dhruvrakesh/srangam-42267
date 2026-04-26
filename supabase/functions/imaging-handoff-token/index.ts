/**
 * imaging-handoff-token — issue a short-lived HMAC-signed token that the
 * imaging app at maps.sankyo.in (project: ima-imaging) can verify to mint
 * a session for the same user.
 *
 * Why: the two apps run on different Supabase backends, so we cannot share
 * a session cookie. Instead we sign the user's identity + the deep-link
 * target with a shared secret, and the imaging side's /auth route verifies
 * it before redirecting to ?next=.
 *
 * Token (compact JSON, base64url, dot-separated payload.signature):
 *   payload = { sub, email, name?, srangam_role, iat, exp, nonce, target }
 *   sig     = HMAC-SHA-256(payload_b64, IMAGING_HANDOFF_SECRET)
 *
 * Lifetime: 5 minutes. Single-use enforcement is the receiver's job (the
 * imaging app keeps a small nonce-replay cache).
 */
// @ts-ignore Deno runtime types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

declare const Deno: { env: { get(name: string): string | undefined } };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TOKEN_TTL_SECONDS = 300; // 5 minutes

type TargetKind = 'viewer' | 'planetarium' | 'astronomy-lab' | 'dating-lab';

interface TargetPayload {
  kind: TargetKind;
  params?: Record<string, string | number>;
}

function b64urlEncode(bytes: Uint8Array): string {
  let s = btoa(String.fromCharCode(...bytes));
  s = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return s;
}

function b64urlEncodeString(str: string): string {
  return b64urlEncode(new TextEncoder().encode(str));
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message),
  );
  return b64urlEncode(new Uint8Array(sig));
}

function isValidTarget(t: unknown): t is TargetPayload {
  if (!t || typeof t !== 'object') return false;
  const k = (t as TargetPayload).kind;
  return (
    k === 'viewer' ||
    k === 'planetarium' ||
    k === 'astronomy-lab' ||
    k === 'dating-lab'
  );
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY');
  const handoffSecret = Deno.env.get('IMAGING_HANDOFF_SECRET');

  if (!supabaseUrl || !supabaseAnon) {
    return new Response(
      JSON.stringify({ error: 'Server misconfigured: Supabase env missing' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
  if (!handoffSecret) {
    return new Response(
      JSON.stringify({ error: 'Server misconfigured: IMAGING_HANDOFF_SECRET missing' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const userId = claimsData.claims.sub as string;
  const email = (claimsData.claims.email as string | undefined) ?? null;

  let body: { target?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // tolerate empty body — fall back to dating-lab landing
  }

  const target: TargetPayload = isValidTarget(body.target)
    ? body.target
    : { kind: 'dating-lab' };

  // Best-effort role lookup (non-blocking on failure).
  let srangamRole: 'admin' | 'user' = 'user';
  try {
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    if (roleRow) srangamRole = 'admin';
  } catch {
    // swallow — default to 'user'
  }

  const now = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomUUID();

  const payload = {
    iss: 'srangam.nartiang.org',
    aud: 'maps.sankyo.in',
    sub: userId,
    email,
    srangam_role: srangamRole,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
    nonce,
    target,
  };

  const payloadB64 = b64urlEncodeString(JSON.stringify(payload));
  const signature = await hmacSha256(handoffSecret, payloadB64);
  const handoff = `${payloadB64}.${signature}`;

  // Structured log — same shape convention as the import pipeline so future
  // srangam_event_log ingestion picks it up automatically.
  console.log(JSON.stringify({
    evt: 'imaging.handoff.issue',
    sub: userId,
    target_kind: target.kind,
    role: srangamRole,
    nonce,
    ts: new Date().toISOString(),
  }));

  return new Response(
    JSON.stringify({
      handoff,
      expires_at: payload.exp,
      target,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
