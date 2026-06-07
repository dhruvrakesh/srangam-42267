---
name: AI Usage Ledger (Phase T.1)
description: Append-only per-call telemetry for every Gemini/OpenAI invocation routed through _shared/ai-provider.ts
type: feature
---

**Table:** `public.srangam_ai_usage` (created 2026-06-07).

**Access:** admin SELECT only; service_role INSERT only. **No UPDATE or DELETE policies** — append-only, immutable historical cost data (matches user "production data immutable" preference).

**Schema:** `function_name`, `job_id?`, `article_id?`, `provider` (`gemini`|`openai`), `model`, `purpose`, `prompt_tokens?`, `completion_tokens?`, `cost_usd_estimate numeric(10,6)`, `latency_ms?`, `ok bool`, `error_code?` (classified: `timeout`|`rate_limit`|`server_error`|`client_error`|`parse_fail`|`aborted`|`unknown`), `meta jsonb`.

**Indexes:** `(created_at desc)`, `(function_name, created_at desc)`, `(provider, model)`, partial `(job_id) WHERE job_id IS NOT NULL`.

**Writer:** `supabase/functions/_shared/ai-usage.ts` → `logAIUsage(row)`. Fire-and-forget, never throws (telemetry failures must NOT break the calling edge function). Uses a cached service-role client.

**Call-site contract:** every public entry point in `_shared/ai-provider.ts` accepts `opts.telemetry: { function_name, job_id?, article_id?, purpose? }`. One ledger row per **attempt** — including retries and provider fallback hops — so cost is accurate.

**Adopters at T.1 cut:** `backfill-article-pins` (`pin_extract`), `extract-purana-references` (`purana_extract`), `backfill-bibliography` (`bibliography_extract`). New AI callers MUST pass a telemetry object.

**Never:** UPDATE or DELETE rows; log secrets to `meta`; await `logAIUsage()` in user-blocking hot paths (it's fire-and-forget by design).

**Phase T.2 (deferred):** hourly rollup MV `srangam_ai_usage_hourly_mv`. Greenlight required before implementing.
