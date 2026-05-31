// Phase H1 (2026-05-31) — Cron self-test / diagnostics.
//
// Admin-or-cron gated. Returns JSON only. Side-effects (writes) ONLY when
// explicitly asked via { write: true } in the body — defaults are read-only.
//
// Use cases:
//   1. From admin UI: GET-ish POST with {} → reports gate result, env presence,
//      and latest srangam_admin_jobs row per kind.
//   2. From pg_cron canary: body always includes _cron:true (merged by
//      _cron_invoke_edge). Reports same JSON; pg_net logs the 200/4xx.
//
// No new public surface: gated by requireAdminOrCron.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { requireAdminOrCron } from '../_shared/auth-gate.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let body: Record<string, unknown> = {};
  try {
    const raw = await req.text();
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = {};
  }

  const gate = await requireAdminOrCron(req, body);
  if (gate.error) return gate.error;

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const env_presence = {
    SUPABASE_URL: !!SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!SERVICE_KEY,
    SUPABASE_ANON_KEY: !!Deno.env.get('SUPABASE_ANON_KEY'),
    CRON_SECRET: !!Deno.env.get('CRON_SECRET'),
  };

  if (!SERVICE_KEY) {
    return json(200, {
      ok: false,
      reason: 'SUPABASE_SERVICE_ROLE_KEY missing in edge env',
      from_cron: !!gate.fromCron,
      env_presence,
    });
  }

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Latest admin job per kind.
  const { data: jobs, error: jobsErr } = await sb
    .from('srangam_admin_jobs')
    .select('kind, status, processed, total, failed, cost_usd, last_error, started_at, finished_at, heartbeat_at, created_at')
    .order('created_at', { ascending: false })
    .limit(15);

  const now = Date.now();
  const latestByKind: Record<string, unknown> = {};
  if (jobs) {
    for (const row of jobs as Array<Record<string, unknown>>) {
      const k = String(row.kind);
      if (latestByKind[k]) continue;
      const hb = row.heartbeat_at ? Date.parse(String(row.heartbeat_at)) : null;
      const created = row.created_at ? Date.parse(String(row.created_at)) : null;
      latestByKind[k] = {
        ...row,
        age_seconds: created ? Math.round((now - created) / 1000) : null,
        heartbeat_age_seconds: hb ? Math.round((now - hb) / 1000) : null,
      };
    }
  }

  // Optional write probe: insert a "cron_probe" row + immediately mark succeeded.
  // Only on explicit { write: true } so canary cron stays read-only by default.
  let probe: Record<string, unknown> | null = null;
  if (body.write === true) {
    const probeParams = { _cron: !!gate.fromCron, source: 'cron-self-test' };
    const { data: ins, error: insErr } = await sb
      .from('srangam_admin_jobs')
      .insert({
        kind: 'cron_probe',
        status: 'succeeded',
        total: 1,
        processed: 1,
        params: probeParams,
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        heartbeat_at: new Date().toISOString(),
      })
      .select('id, created_at')
      .single();
    probe = { ok: !insErr, id: ins?.id ?? null, error: insErr?.message ?? null };
  }

  return json(200, {
    ok: true,
    from_cron: !!gate.fromCron,
    is_admin: !!gate.isAdmin,
    env_presence,
    jobs_error: jobsErr?.message ?? null,
    latest_by_kind: latestByKind,
    probe,
    server_time: new Date().toISOString(),
  });
});
