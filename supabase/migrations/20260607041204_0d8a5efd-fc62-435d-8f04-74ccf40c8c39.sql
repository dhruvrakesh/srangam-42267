-- Phase T.1 (2026-06-07): AI usage ledger
-- Append-only per-call telemetry for every Gemini/OpenAI invocation
-- routed through _shared/ai-provider.ts. Enables cost / latency / error
-- attribution by function, provider, model, and purpose without scanning
-- edge function console logs.

CREATE TABLE IF NOT EXISTS public.srangam_ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  function_name text NOT NULL,
  job_id uuid NULL,
  article_id uuid NULL,
  provider text NOT NULL,
  model text NOT NULL,
  purpose text NULL,
  prompt_tokens integer NULL,
  completion_tokens integer NULL,
  cost_usd_estimate numeric(10,6) NULL,
  latency_ms integer NULL,
  ok boolean NOT NULL DEFAULT true,
  error_code text NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Grants: admin SELECT (via RLS), service_role full (for edge function INSERTs).
-- No anon access. No authenticated INSERT/UPDATE/DELETE (append-only via service_role only).
GRANT SELECT ON public.srangam_ai_usage TO authenticated;
GRANT ALL ON public.srangam_ai_usage TO service_role;

ALTER TABLE public.srangam_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read AI usage ledger"
  ON public.srangam_ai_usage
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- No INSERT/UPDATE/DELETE policies for authenticated → only service_role can write.
-- This makes the ledger append-only from edge functions (matches user memory:
-- "Treat production data as immutable; prefer additive changes").

-- Indexes for the queries we actually expect:
-- 1. recent calls (admin dashboard timeline)
CREATE INDEX IF NOT EXISTS idx_srangam_ai_usage_created_at
  ON public.srangam_ai_usage (created_at DESC);
-- 2. per-function spend / volume
CREATE INDEX IF NOT EXISTS idx_srangam_ai_usage_function_created
  ON public.srangam_ai_usage (function_name, created_at DESC);
-- 3. provider/model split
CREATE INDEX IF NOT EXISTS idx_srangam_ai_usage_provider_model
  ON public.srangam_ai_usage (provider, model);
-- 4. trace by job
CREATE INDEX IF NOT EXISTS idx_srangam_ai_usage_job_id
  ON public.srangam_ai_usage (job_id) WHERE job_id IS NOT NULL;

COMMENT ON TABLE public.srangam_ai_usage IS
  'Phase T.1 (2026-06-07): append-only ledger of every Gemini/OpenAI call routed through _shared/ai-provider.ts. Written by edge functions via service_role; read by admins only. Never UPDATE or DELETE — historical cost data is immutable.';