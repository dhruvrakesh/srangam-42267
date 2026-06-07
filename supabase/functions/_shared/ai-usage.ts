/**
 * Phase T.1 (2026-06-07) — AI usage ledger writer
 *
 * Append-only telemetry helper for every Gemini / OpenAI call routed
 * through `_shared/ai-provider.ts`. Writes one row to `srangam_ai_usage`
 * per attempt (success or failure) so we can answer:
 *
 *   - "How much did Gemini cost us this week, split by function and model?"
 *   - "Which edge function has the highest p95 AI latency?"
 *   - "Which `purpose` is failing most often (timeout / rate_limit / parse_fail)?"
 *
 * Contract: fire-and-forget. Never throws — telemetry failures must not
 * cascade into AI call failures. Uses the service-role client (no RLS),
 * so caller is responsible for passing an admin/service-role-backed
 * Supabase client. If the client cannot write, the error is swallowed
 * with a single `console.warn`.
 *
 * Source of truth for the row shape is the SQL migration that creates
 * `public.srangam_ai_usage`; if you add a column there, add it here too.
 */

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export interface AIUsageTelemetry {
  /** Name of the calling edge function, e.g. 'backfill-article-pins'. */
  function_name: string;
  /** Optional admin job UUID for trace correlation. */
  job_id?: string | null;
  /** Optional article UUID this AI call relates to. */
  article_id?: string | null;
  /** Free-form purpose tag, e.g. 'pin_extract', 'bibliography_extract'. */
  purpose?: string | null;
}

export interface AIUsageRow extends AIUsageTelemetry {
  provider: 'gemini' | 'openai';
  model: string;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  cost_usd_estimate?: number | null;
  latency_ms?: number | null;
  ok: boolean;
  error_code?: string | null;
  meta?: Record<string, unknown>;
}

let cachedAdmin: SupabaseClient | null = null;

/** Lazy service-role client — created once per cold start. */
function getAdminClient(): SupabaseClient | null {
  if (cachedAdmin) return cachedAdmin;
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  cachedAdmin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAdmin;
}

/**
 * Insert one AI usage row. Fire-and-forget — never throws.
 *
 * Awaiting is optional; callers in hot paths should NOT await this so
 * the AI response can return to the user without an extra DB round-trip.
 */
export async function logAIUsage(row: AIUsageRow): Promise<void> {
  try {
    const admin = getAdminClient();
    if (!admin) return; // env not present (e.g. local test) — silently skip
    const { error } = await admin.from('srangam_ai_usage').insert({
      function_name: row.function_name,
      job_id: row.job_id ?? null,
      article_id: row.article_id ?? null,
      provider: row.provider,
      model: row.model,
      purpose: row.purpose ?? null,
      prompt_tokens: row.prompt_tokens ?? null,
      completion_tokens: row.completion_tokens ?? null,
      cost_usd_estimate: row.cost_usd_estimate ?? null,
      latency_ms: row.latency_ms ?? null,
      ok: row.ok,
      error_code: row.error_code ?? null,
      meta: row.meta ?? {},
    });
    if (error) {
      console.warn('[ai-usage] insert failed:', error.message);
    }
  } catch (e) {
    // Telemetry must never break the calling edge function.
    console.warn('[ai-usage] swallowed:', e instanceof Error ? e.message : String(e));
  }
}

/**
 * Classify a thrown AI error into a coarse `error_code` for the ledger.
 * Keeps cardinality low so we can GROUP BY in the future cost rollup MV.
 */
export function classifyAIError(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err);
  if (/timeout/i.test(m)) return 'timeout';
  if (/\b429\b/.test(m)) return 'rate_limit';
  if (/\b5\d{2}\b/.test(m)) return 'server_error';
  if (/\b4\d{2}\b/.test(m)) return 'client_error';
  if (/parse|JSON/i.test(m)) return 'parse_fail';
  if (/abort/i.test(m)) return 'aborted';
  return 'unknown';
}
