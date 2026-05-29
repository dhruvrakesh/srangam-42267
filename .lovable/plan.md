
# Verified context (database + logs, not assumed)

- **Published articles:** 44. **Articles with ≥1 pin:** 11. **Zero-pin published:** 33. **Total pins:** 27. The Geography & Media table is correct — the backlog is real.
- **Edge logs `backfill-article-pins` (last hour):** the `pin_ai` stage repeatedly hits `timeout 15000ms` (e.g. articles `46c2177c…`, `03a92e0f…`); when AI does complete it often returns `inserted: 0` (e.g. `69071b66…`, `9e8d420f…`). One pump reinvoke died with `504 IDLE_TIMEOUT (150s)`. Net effect: bulk runs stall and most articles never get pins inserted.
- **Scheduled jobs (cron.job):** only one — `srangam-admin-jobs-watchdog` every 5 min. **No cron pumps pin enrichment.** You are correct: the correlation pipeline has no heartbeat.
- **Phase Y findings still valid:** `/admin/data-health` route is unregistered in `src/App.tsx` (DataHealth imported line 81, no `<Route>` in `/admin` block lines 219–233); `geography-media` route duplicated lines 230 & 232; `PuranaReferences.tsx` table (lines 357–445) overflows on laptop widths; `ArticleMiniMap.tsx` is imported nowhere — resolver attaches `pins` to every article but the sidebar never renders them.

---

# Phase Y — UI healing (presentation-only, no logic change)

### Y.1 — Register missing admin route
`src/App.tsx`: add `<Route path="data-health" element={<DataHealth />} />` inside the `/admin` block; delete duplicate `geography-media` route on line 232. **Blast radius:** one file, one line added + one line removed.

### Y.2 — Heal `/admin/purana-refs` table
`src/pages/admin/PuranaReferences.tsx` lines 357–445 only:
- `<Table>` gets `min-w-[1100px]` so the existing `overflow-x-auto` wrapper actually scrolls.
- Per-column widths: Article 220, Purana 140, Category 120, Citation 140, Confidence 110, Claim `min-w-[280px]`, Status 110, Actions 120.
- Claim cell: replace `max-w-xs truncate` with `block line-clamp-2 break-words` (tooltip preserved).
- Actions cell: add `whitespace-nowrap`.
- Article cell: `truncate` + `title={…}` for hover-free a11y.
- Honours mobile invariant **MV-01** (wrapper `overflow-x-auto`, `min-w` ≥ 360).

### Y.3 — Surface pins on every article (the map gap you flagged)
- `src/components/articles/enhanced/ContextualSidebar.tsx`: add collapsible **"Places referenced"** section gated on `pins.length > 0`, renders `<ArticleMiniMap slug={slug} pins={pins} />` via `React.lazy` + Suspense (keeps Leaflet off the article critical path).
- `src/components/articles/ArticlePage.tsx`: pass already-resolved `article.pins` and `article.slug` down. **No new fetch.**
- `pins.length === 0` → render nothing (no empty-state noise).
- Marker popup gets **"Open in Atlas →"** linking to `/atlas?id=<gazetteer_id>` (Atlas already accepts `?id=`).
- One-line `console.info({ evt: 'article_map_rendered', slug, pin_count })` on mount.
- Feature flag `SHOW_INLINE_ARTICLE_MAP = false` reserved for a future below-fold body map; not enabled in this phase.

### Y.4 — Documentation
- Append Phase Y block to `.lovable/plan.md` and `docs/SCALABILITY_ROADMAP.md`.
- New Core memory rule: *"Pins are user-facing (Phase Y, 2026-05-29): every published article with `pins.length > 0` MUST render `ArticleMiniMap` in its sidebar. Resolver attaches pins; sidebar consumes them; never re-fetch."*

---

# Phase Z — Automated pin enrichment (answers your cron question)

This is the missing heartbeat. The correlation/gazetteer/pin scaffolding only pays off when zero-pin published articles are continuously revisited.

### Z.1 — Lift the `pin_ai` timeout (root cause of empty results)
`supabase/functions/backfill-article-pins/index.ts`: raise the AI call timeout from **15 000 ms → 60 000 ms** and add one retry on timeout with a smaller article chunk (truncate to 30 000 chars on retry). Logs prove 15s is too tight for ~45–80 KB articles; AI either times out or returns 0. This single change should unlock most of the 33-article backlog without any other plumbing.

### Z.2 — `pg_cron` nightly enrichment loop
New migration:
- Enable `pg_cron` + `pg_net` (already present per `pg_extension` check).
- New SECURITY DEFINER RPC `public.enqueue_pin_backfill_sweep()`: counts zero-pin published articles, inserts one `srangam_admin_jobs` row (`kind='pin_backfill'`, `params={ all_published:false, only_zero_pin:true, limit:20, chunk_size:3 }`), and `net.http_post`s `backfill-article-pins` with `{ job_id, only_zero_pin:true, limit:20, offset:0, chunk_size:3 }` exactly the same way the admin button does.
- Cron schedule: `0 3 * * *` (03:00 UTC nightly), capped at 20 articles/night to keep AI cost predictable (~$0.04/night at observed gpt-4o-mini rates).
- Re-entrancy guard: if a `pin_backfill` job with `status='running'` and `started_at > now() - interval '30 min'` exists, skip this tick.
- Hook into the existing `srangam-admin-jobs-watchdog` (already runs every 5 min) — no change needed; it'll auto-reconcile any stuck nightly job.

### Z.3 — `backfill-article-pins` edge function: add `only_zero_pin` filter
Single LEFT JOIN change in the article-selection query: `WHERE status='published' AND NOT EXISTS (SELECT 1 FROM srangam_article_pins p WHERE p.article_id = a.id)`. Existing admin "bulk" button keeps working unchanged when `only_zero_pin` is absent or false.

### Z.4 — Surface the heartbeat on `/admin/geography-media`
`src/pages/admin/GeographyMedia.tsx`: add two stat cards near the existing ones — **"Last nightly sweep"** (max `finished_at` where `kind='pin_backfill'` and `params->>'only_zero_pin'='true'`) and **"Next sweep"** (next 03:00 UTC). No new fetch path: extend the existing admin-jobs read.

### Z.5 — Observability
- Edge function emits `{ evt: 'pin_sweep_complete', scheduled:true, processed, inserted, zero_pin_remaining, cost_usd }` to existing `srangam_event_log`.
- Watchdog already covers stuck jobs.

### Z.6 — Documentation + memory
- Append Phase Z to `.lovable/plan.md` and `docs/SCALABILITY_ROADMAP.md` (note the $0.04/night ceiling and the 20-article cap as the explicit scalability trigger to revisit).
- New Core memory rule: *"Pin enrichment is automated (Phase Z, 2026-05-29): nightly pg_cron sweep at 03:00 UTC processes ≤20 zero-pin published articles via `enqueue_pin_backfill_sweep()`. Never re-add manual-only flows; never raise the cap without a corresponding cost note."*

---

# What is explicitly NOT in this plan

- No rebuild of the resolver, gazetteer, RLS, narration, OG pipeline, or `useAllArticles`.
- No change to admin write policies or `has_role`.
- No new tables. `srangam_admin_jobs`, `srangam_article_pins`, `srangam_event_log` already exist.
- No inline below-fold article-body map (feature flag stays false).
- No mobile-collapsed Purana table (current overflow-x-auto satisfies MV-01).
- Lighthouse, GSC OAuth, theme-chip i18n leakage, React Query global defaults — still queued, untouched.

---

# Validation after build mode

1. `/admin/data-health` returns the dashboard (no 404).
2. `/admin/purana-refs` at 859×638: no header clipping, claim wraps to 2 lines, status badge isolated, actions never wrap; horizontal scroll only below ~1100 px.
3. An article with pins (e.g. `scripts-that-sailed-ii…` has 8 B-tier pins) shows the sidebar map; Leaflet loads on-demand; "Open in Atlas →" navigates correctly. An article with zero pins shows no section.
4. Trigger `select public.enqueue_pin_backfill_sweep();` manually once — within 5 min `articles_with_pins` rises and `zero_pin_articles` drops; `srangam_event_log` shows `pin_sweep_complete`.
5. `select * from cron.job;` shows the new nightly entry alongside the watchdog.

---

# Rollback story

Each sub-phase reverts independently. Y.1/Y.2/Y.3 are file edits. Z.1 is a constant change. Z.2 is a one-line `cron.unschedule('pin-enrichment-nightly')`. Z.3/Z.4 are additive feature flags / extra columns in a query. No destructive DDL.
