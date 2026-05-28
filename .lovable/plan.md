## Context (verified, not assumed)

Direct inspection of code + edge logs + migrations shows the current pain has **two specific root causes**, not "Phase X.5 doesn't work":

1. **Purana "Extract all" → `srangam_admin_jobs_kind_check` violation.**
   Migration `20260426141244_…sql` defines the check as
   `kind IN ('pin_backfill','og_generate','og_force')`. Phase X.5 added `'purana_extract'` to the TS `JobKind` union and the client now inserts it, but **no migration ever extended the SQL CHECK**. Insert fails → toast you saw.

2. **Pin Backfill "keeps running" then dies.**
   `backfill-article-pins` edge logs (16:40:33Z):
   ```
   ERROR pump reinvoke failed: 404 {"error":"requested path is invalid"}
   ```
   The self-pump uses `req.url` as the reinvoke target. Inside Supabase Edge Runtime `req.url` is an internal address (host/path don't match the public `/functions/v1/<name>` route), so the second chunk 404s. Only chunk 0 (4 succeeded / 1 errored) runs, no more `reportItem` calls, heartbeat goes stale, and the watchdog reaps it ~5 min later. The UI shows "running" until then because realtime never sees a terminal update.

3. **Progress UX is genuinely thin.** `JobProgressCard` shows %, succeeded/failed/cost/ETA but no per-item stream, no cancel-confirm, no "last error" surfaced inline, no scrollback for finished items, no tier breakdown labels for Purana.

Everything else in Phase X.5 (jobs table, `reportItem`, Realtime hook, rehydration, `aiExtractCitations`) is sound — it's the two bugs above that make it feel broken.

---

## Phase X.5.1 — Surgical bugfix (must land before X.6)

### Migration: extend job-kind check
```sql
ALTER TABLE public.srangam_admin_jobs
  DROP CONSTRAINT srangam_admin_jobs_kind_check;
ALTER TABLE public.srangam_admin_jobs
  ADD CONSTRAINT srangam_admin_jobs_kind_check
  CHECK (kind IN ('pin_backfill','og_generate','og_force','purana_extract'));
```
No data migration; existing rows already satisfy the wider set.

### Self-pump fix (both `backfill-article-pins` and `extract-purana-references`)
Replace `req.url` with a built-from-env URL:
```ts
const PUMP_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/<function-name>`;
schedulePumpReinvoke(PUMP_URL, { ... });
```
Keep the service-role bearer + `_pump: true` gate exactly as today.
Add a one-line log `[pump] target=…` so the next regression is visible in 1 click.

### Defensive: client-side terminal sweep
In `useAdminJob`, when a row's `heartbeat_at` is older than 90 s **and** status is still `running`, surface a yellow "Stalled — watchdog will reap shortly" banner instead of an indefinitely spinning progress bar. Pure presentation; doesn't touch the row.

### Edge-function config sanity
Add `verify_jwt = false` blocks in `supabase/config.toml` **only if missing** for these two functions (pump self-call uses service-role bearer, not the user JWT). Inspect current toml first; do not blindly overwrite.

---

## Phase X.5.2 — Progress UX polish (admin-only, presentational)

Refactor `JobProgressCard` into a small composition; no new business logic:

- **Header row**: kind label + status pill + elapsed wall-clock + ETA.
- **Throughput bar**: existing % bar, but stripe-animate while `running` and freeze on terminal status.
- **Counters**: `Succeeded / Failed / Cost`, plus a fourth slot that's **kind-aware** — `H/M/L` for `purana_extract`, `A/B/C` for `pin_backfill`, OG dims for `og_*`.
- **Last item + last error**: two compact mono rows, error in `text-destructive`, truncated with hover-expand.
- **Activity tail**: last 8 items in a scrolling `<ol>` fed by the same realtime row's `last_item` history (kept client-side in a ring buffer — no DB churn).
- **Cancel**: confirm dialog; button disabled until `created_at + 3 s` to prevent accidental immediate cancel.
- **Stalled banner**: from X.5.1.
- **Done state**: green check, "View N references / N pins" deep-link into the relevant admin page, "Run again" secondary button.

Files: `src/components/admin/JobProgressCard.tsx` only. Hook `useAdminJob.ts` gains a `recentItems: string[]` ring (capped at 8). No other components touched.

---

## Phase X.5.3 — Job history strip (operator memory)

New `src/hooks/useAdminJobHistory.ts` + small `JobHistoryStrip` rendered under each `JobProgressCard`'s parent panel. Shows last 10 jobs of that `kind` from `srangam_admin_jobs` with status pill + duration + cost. Clicking an entry rehydrates the card. Purely additive; no schema change, RLS already allows admin select.

---

## Phase X.6 — Correlation substrate (read-only, additive)

Goal: a single admin surface where a curator can ask "what does our corpus actually connect?" — without ever writing to the substrate. Promotion of a finding into a published cross-reference stays a manual, audited action in the existing admin flows.

### Database (additive, all read-only views + one RPC)

```sql
-- 1. Pins ↔ Purana refs co-occurring on the same article.
CREATE OR REPLACE VIEW public.srangam_corpus_purana_pin_overlap AS
SELECT p.article_id,
       pr.purana_name, pr.kanda, pr.adhyaya,
       g.canonical_name AS place,
       pr.confidence_score AS purana_conf,
       p.confidence       AS pin_conf
FROM public.srangam_purana_references pr
JOIN public.srangam_article_pins p USING (article_id)
JOIN public.srangam_gazetteer g ON g.id = p.gazetteer_id;

-- 2. Cultural terms ↔ Purana co-citation.
CREATE OR REPLACE VIEW public.srangam_corpus_term_purana_cooccurrence AS
SELECT pr.purana_name,
       t.term,
       count(*) AS articles,
       avg(pr.confidence_score) AS avg_conf
FROM public.srangam_purana_references pr
JOIN public.srangam_article_cultural_terms act USING (article_id)
JOIN public.srangam_cultural_terms t ON t.id = act.term_id
GROUP BY pr.purana_name, t.term;

-- 3. Xref evidence aggregation by article cluster.
CREATE OR REPLACE VIEW public.srangam_corpus_xref_evidence AS
SELECT a1.id AS article_a, a2.id AS article_b,
       count(DISTINCT g.id)  AS shared_places,
       count(DISTINCT pr.id) AS shared_purana_refs
FROM public.srangam_article_pins p1
JOIN public.srangam_article_pins p2 ON p1.gazetteer_id = p2.gazetteer_id
                                    AND p1.article_id <> p2.article_id
JOIN public.srangam_articles a1 ON a1.id = p1.article_id
JOIN public.srangam_articles a2 ON a2.id = p2.article_id
LEFT JOIN public.srangam_gazetteer g ON g.id = p1.gazetteer_id
LEFT JOIN public.srangam_purana_references pr
       ON pr.article_id IN (a1.id, a2.id)
GROUP BY a1.id, a2.id;
```
Grants: `SELECT` to `authenticated` only (admin-checked at the application layer; views inherit underlying RLS). No `anon` grant.

RPC for the graph:
```sql
CREATE OR REPLACE FUNCTION public.get_corpus_correlations(
  min_articles int DEFAULT 2,
  limit_rows   int DEFAULT 200
) RETURNS TABLE (
  entity_a text, entity_a_kind text,
  entity_b text, entity_b_kind text,
  shared_articles int, jaccard numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  -- pairwise Jaccard over place/term/purana sets keyed by article
  ...
$$;
REVOKE ALL ON FUNCTION public.get_corpus_correlations(int,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_corpus_correlations(int,int) TO authenticated;
```
The RPC is the **only** new function; it is `STABLE`, read-only, capped by `limit_rows`, and gated by the admin-only route.

### Admin UI

- New route `/admin/corpus-correlations` (registered in admin router only).
- New `src/pages/admin/CorpusCorrelations.tsx`:
  - Header with three preset queries (Place↔Purana, Term↔Purana, Article↔Article).
  - Force-graph (`react-force-graph-2d`, lazy-loaded) sized to viewport.
  - Side table of top-N findings with Jaccard, shared count, "Open article", "Mark for review" (writes to existing `srangam_event_log` only — does not auto-promote).
- New `src/hooks/useCorpusCorrelations.ts` — react-query wrapper over the RPC + the three views, 5-min staleTime.

### Documentation

- `docs/PURANIC_EXTRACTION.md` — current pipeline, job kinds, failure modes, watchdog behavior.
- `docs/CORPUS_CORRELATION.md` — view contracts, RPC signature, what "Mark for review" does and does not do, promotion workflow.
- Append rows to `docs/SCALABILITY_ROADMAP.md` for the new views (when to materialize, when to add indexes).

---

## Blast-radius guarantee

Edits stay inside:
- `src/pages/admin/**`, `src/components/admin/**`
- `src/hooks/useAdmin*`, `src/hooks/usePurana*`, new `useCorpusCorrelations.ts`
- `supabase/functions/backfill-article-pins/**`, `supabase/functions/extract-purana-references/**`
- `supabase/migrations/**` (additive only — extend CHECK, add views, add RPC)
- `docs/**`, `.lovable/plan.md`

Untouched: public routes, public components, public RLS, end-user UI, narration, article rendering, search, i18n, all Phase X.1–X.4 invariants.

## Sequencing

1. X.5.1 migration + edge fixes + stalled banner — **unblocks both broken jobs today**.
2. X.5.2 progress polish + X.5.3 history strip — operator UX.
3. X.6 views + RPC migration, then page + hook, then docs.

Each phase is independently shippable and independently revertable.
