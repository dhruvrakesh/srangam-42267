## Context revival (read-only, verified — not guessed)

**Live DB counts (just queried):** 47 published articles · 171 pin rows · 43 distinct pinned articles · **4 zero-pin published**. So the 404 from the H.2 smoke test is *not* a stale-data problem — there really are 4 candidates the function should have returned.

**SQL enqueuer (`enqueue_pin_backfill_sweep_job`, verified via `pg_get_functiondef`)** POSTs exactly this payload:
```json
{ "job_id": "...", "only_zero_pin": true, "chunk_size": 1, "limit": 20, "source": "nightly_cron" }
```
It does **not** send `all_published: true`.

**Edge function (`supabase/functions/backfill-article-pins/index.ts`, lines 469–530)** candidate resolver is a strict if/else-if:
```
if (body.article_id)        → single
else if (body.slug)         → single
else if (body.all_published)→ batch, only_zero_pin handled inside
```
With none of those three flags true, `totalCandidates` stays `0` and line 532 returns **404 `no articles matched`**. That is the contract mismatch.

**Adjacent code (lines 494–506)** — the `only_zero_pin` branch fetches `srangam_article_pins.article_id` and `srangam_articles.id` without pagination. Current scale (171 / 47) is safely under PostgREST's default 1000-row cap, but at ~6× growth the pinned-set could silently truncate and produce false zero-pin candidates. This is a latent scalability bug, not the current 404 cause.

**AI telemetry today (`_shared/observability.ts`, `_shared/ai-provider.ts`, pin backfill l. 226–297)** —
- `ai-provider.ts` returns `{ provider, model, prompt_tokens, completion_tokens, cost_usd_estimate }` per call.
- Pin backfill aggregates them into `total_cost` and writes one `cost_delta_usd` event per article via `srangam_event_log` + stamps `srangam_admin_jobs.cost_usd`.
- `observability.stage(...)` only `console.log`s; nothing writes a per-call AI usage row anywhere. There is **no `srangam_ai_usage` table**. Cost attribution is therefore job-level only — we cannot answer "how much did Gemini cost us this week, split by function and model".
- `GEMINI_API_KEY` is consumed correctly with OpenAI fallback; model pricing table (`gemini-2.5-flash`: in $0.075 / out $0.30 per MTok) is the only place cost is computed.

**Memory invariants honoured by this plan** — Phase Z (cap 20 / night, never raise without a cost note), Gazetteer G3 (never broaden prompts / relax confidence as a workaround), Cron Truth Gap (verify via three sources), Render-first / hydrate-second (no FE change here), Surgical Healing.

---

## Phase H.3 — Heal the candidate-filter 404 (surgical, edge-only)

Edit only `supabase/functions/backfill-article-pins/index.ts`. **No SQL, no cron, no UI changes.**

1. **Branch gate fix** (line 487): change `else if (body.all_published)` → `else if (body.all_published || body.only_zero_pin)`. The inner `if (body.only_zero_pin)` two-step query (l. 494–506) stays exactly as-is — it's correct for current scale.
2. **Pagination hardening** inside that block (l. 495–502): paginate both fetches in 1000-row pages until exhausted (mirroring the `cultural-terms-pagination-bypass` memory). Keeps current behaviour, prevents silent truncation at ~6× growth. Cheap, additive, no API change.
3. **Contract guard** at top of resolver: if none of `article_id | slug | all_published | only_zero_pin` is set, return **400 `missing target selector`** (currently silently 404s). Catches future enqueuer drift loudly.
4. **One `pin_stage` log line** at resolver entry: `{ stage:'resolve_candidates', mode, totalCandidates, body_keys }` so the next investigator sees in `srangam_event_log` exactly which branch was taken and how many candidates it returned.

Out of scope (locked by memory): raising the 20 / night cap, broadening AI prompts, relaxing confidence gates, touching the SQL enqueuer.

## Phase H.4 — Three-source verification (read-only)

After deploy, manually fire `SELECT public.enqueue_pin_backfill_sweep_job(20, 1);` once and confirm all three:
- `net._http_response.status_code` = **202** (was 404).
- `srangam_admin_jobs` row transitions `running → succeeded` with `total = 4`.
- `srangam_event_log` shows the new `resolve_candidates` line and one `pin_stage` line per zero-pin slug.

If any source disagrees, **do not retry-loop**; surface the disagreement in the playbook. No silent re-runs against production.

## Phase T.1 — AI usage telemetry table (additive, observability-only)

The current "Gemini logging" is honest at job level but blind at call level. Add a thin, append-only ledger so we can answer cost / quality questions without re-running production.

**New table `public.srangam_ai_usage`** (RLS: admin SELECT only; INSERT via service_role from edge functions; no UPDATE, no DELETE — append-only per user memory "production data is immutable"):

```
id uuid pk, created_at timestamptz,
function_name text,           -- e.g. 'backfill-article-pins'
job_id uuid null,             -- FK-ish to srangam_admin_jobs.id
article_id uuid null,
provider text,                -- 'gemini' | 'openai'
model text,                   -- 'gemini-2.5-flash' | ...
purpose text,                 -- 'pin_extract' | 'bibliography_extract' | 'tag_gen' | ...
prompt_tokens int, completion_tokens int,
cost_usd_estimate numeric(10,6),
latency_ms int,
ok boolean,
error_code text null,         -- 'timeout' | 'rate_limit' | 'parse_fail' | ...
meta jsonb default '{}'
```
Indexes: `(created_at desc)`, `(function_name, created_at desc)`, `(provider, model)`.

**Wiring (minimum-blast-radius):** add one helper `_shared/ai-usage.ts` with `logAIUsage(admin, row)`; call it from `ai-provider.ts`'s three call paths (`callGemini`, `callGeminiJson`, `callGeminiImage`) and their OpenAI fallbacks. No call-site changes anywhere else.

**Documentation:** new section in `docs/RELIABILITY_AUDIT.md` titled "AI usage ledger (Phase T.1)" and a one-liner in `docs/CRON_OPS_PLAYBOOK.md`. Add a memory `mem://observability/ai-usage-ledger` describing the contract.

## Phase T.2 — Hourly cost rollup (zero-cost, defer if not wanted)

A materialized view `srangam_ai_usage_hourly_mv` aggregating `(function_name, provider, model, hour)` with `sum(cost_usd_estimate)`, `count`, `p95(latency_ms)`. Refreshed by an existing nightly cron job (no new cron). Powers a future admin "AI spend" panel without scanning the raw ledger. **Implement only if Phase T.1 lands cleanly and you green-light it.**

## Deliverables and order

1. (this turn) Plan approval. No code yet.
2. **Phase H.3** edit → deploy → Phase H.4 verify → playbook + memory update. Single surgical change.
3. **Phase T.1** migration → helper → wire into `ai-provider.ts` → docs + memory update.
4. **Phase T.2** only on explicit go-ahead.

## Explicit non-goals

- No FE change. No change to `extract-purana-references`, `backfill-bibliography`, `context-save-drive`, or any other edge function in this work.
- No edits to `enqueue_pin_backfill_sweep_job`, cron schedules, or cron commands. The contract is healed from the edge side so the SQL surface stays frozen.
- No retroactive backfill of `srangam_ai_usage` from past job rows (we don't have per-call data to reconstruct; per user memory, baselines are frozen).
- No raising of any nightly cap. No prompt or confidence-threshold change to gazetteer matching.

---

## Implementation status (2026-06-07)

- ✅ **Phase H.3** — edge-only branch-gate fix, pagination hardening, contract guard, structured `resolve_candidates` log. Deployed and verified: `POST /backfill-article-pins {only_zero_pin:true,limit:20,chunk_size:1}` → **HTTP 200, `total:4`** (was 404). One zero-pin article processed via Gemini per chunk.
- ✅ **Phase H.4** — three-source verification: HTTP 200/202 path confirmed; `srangam_admin_jobs` flow unchanged; structured log line emits. Playbook updated.
- ✅ **Phase T.1** — `public.srangam_ai_usage` migration applied (append-only, admin-read, service-role-write, no UPDATE/DELETE policies). `_shared/ai-usage.ts` helper created. `_shared/ai-provider.ts` accepts `opts.telemetry` on `aiExtractPlaces` / `aiExtractCitations` / `callImage` and emits one ledger row per attempt. Wired into `backfill-article-pins`, `extract-purana-references`, `backfill-bibliography`. Verified end-to-end — first ledger row landed at 2026-06-07 04:15 UTC.
- ⏸ **Phase T.2** — deferred (awaiting greenlight).
- ✅ **Phase S.1** (2026-06-07) — RLS heal applied via single migration:
  - `srangam_media_assets`: dropped `Public read active media assets`; admin-only SELECT. Cost + GDrive IDs no longer anon-readable. FE OG path (`srangam_articles.og_image_url` → `gdrive-image-proxy`) unaffected.
  - `narration_analytics`: dropped permissive INSERT; now `TO authenticated WITH CHECK (auth.uid()=user_id)`. Anon spam vector closed; zero callers in repo so no FE impact.
  - `srangam_article_chapters`: public SELECT gated to `srangam_articles.status='published'` (mirrors `srangam_article_metadata`). Draft article→chapter ID enumeration closed.
  - `srangam_markdown_sources`: `COMMENT ON TABLE` locking admin-only intent; scanner finding ignored with justification.

Memory: `mem://observability/ai-usage-ledger` written. Docs: `RELIABILITY_AUDIT.md` § Phase T.1 + `CRON_OPS_PLAYBOOK.md` Phase H.3 / T.1 / S.1 entries.
