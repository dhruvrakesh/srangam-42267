// Phase N — Centralized JWT + admin gate for cost-bearing edge functions.
//
// Usage inside a Deno.serve handler:
//
//   if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
//   const gate = await requireAdmin(req); if (gate.error) return gate.error;
//   // or: const gate = await requireUser(req); if (gate.error) return gate.error;
//
// On success, gate.user / gate.userClient are populated and the handler proceeds.
// On failure, gate.error is a fully-formed Response (401/403) with CORS headers
// that the caller returns immediately.
//
// Notes:
// - Builds a per-request Supabase client using the caller's JWT for getUser().
// - Admin check goes through the SECURITY DEFINER has_role() RPC, which is
//   the same path used by AuthContext on the client.
// - Service-role client construction is unchanged — handlers continue to use
//   SUPABASE_SERVICE_ROLE_KEY for downstream writes that bypass RLS.

import { createClient, type SupabaseClient, type User } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export interface GateResult {
  user?: User;
  userClient?: SupabaseClient;
  isAdmin?: boolean;
  fromCron?: boolean;
  error?: Response;
}


/**
 * Require a valid Supabase JWT on the incoming request.
 * Returns { user, userClient } on success, or { error: Response } on failure.
 */
export async function requireUser(req: Request): Promise<GateResult> {
  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return { error: jsonError(401, 'Missing or invalid Authorization header') };
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { error: jsonError(500, 'Server is missing Supabase configuration') };
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) {
    return { error: jsonError(401, 'Invalid or expired token') };
  }

  return { user: data.user, userClient };
}

/**
 * Require a valid JWT AND admin role (via the has_role RPC).
 * Returns { user, userClient, isAdmin: true } on success, else { error: Response }.
 */
export async function requireAdmin(req: Request): Promise<GateResult> {
  const base = await requireUser(req);
  if (base.error || !base.user || !base.userClient) return base;

  const { data: isAdmin, error: rpcErr } = await base.userClient.rpc('has_role', {
    _user_id: base.user.id,
    _role: 'admin',
  });

  if (rpcErr) {
    return { error: jsonError(500, 'Failed to verify role') };
  }
  if (!isAdmin) {
    return { error: jsonError(403, 'Admin role required') };
  }

  return { ...base, isAdmin: true };
}

/**
 * Phase Z2 — Cron-or-admin gate.
 *
 * Cron path (pg_cron-originated):
 *   - Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *   - x-cron-secret: <CRON_SECRET>   (project env var)
 *   - body MUST contain `_cron: true`
 *
 * All three conditions must match; otherwise fall back to the user-JWT
 * admin path so the admin UI is unchanged.
 *
 * The body flag means a leaked service-role key + secret from a network
 * log can't accidentally drive a cron-only function with a non-cron body
 * shape.
 */
export async function requireAdminOrCron(
  req: Request,
  body: Record<string, unknown> | null | undefined,
): Promise<GateResult> {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const cronSecret = Deno.env.get('CRON_SECRET') ?? '';
  const auth = req.headers.get('Authorization') ?? req.headers.get('authorization') ?? '';
  const headerSecret = req.headers.get('x-cron-secret') ?? '';
  const bodyFlag = !!(body && (body as { _cron?: boolean })._cron === true);

  if (
    serviceKey &&
    cronSecret &&
    auth === `Bearer ${serviceKey}` &&
    headerSecret === cronSecret &&
    bodyFlag
  ) {
    return { isAdmin: true, fromCron: true };
  }

  return requireAdmin(req);
}
