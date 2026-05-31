## Why 4 articles still show 0 pins (verified — NOT a bug)

Edge logs (`backfill-article-pins`, today 08:01 UTC) + DB confirm the 4 zero-pin articles are conceptual / methodology pieces with no real-world place names:

```
expanded-r-si-genealogies-bhrgu-…          completion_tokens: 1        (Vedic ṛṣi lineages — abstract)
i-genealogies-in-vedic-tradition-…         completion_tokens: 73       (same topic, duplicate)
jyotish-methodology                        completion_tokens: 1–28     (mathematical astronomy)
sanskrit-translator-methodology            completion_tokens: 71–194   (NLP pipeline)
```

All four re-invocations returned `inserted:0, pins_a:0, pins_b:0, pins_c:0` with valid AI completions. The Gemini NER correctly produced empty / near-empty sets. Gazetteer resolution is working — there is nothing geographic to resolve. Per Core invariant *"AI for curation, not expansion; never relax confidence gates as a workaround"*, the correct outcome is exactly what we see.

Single surgical UI fix only (Phase 6b below). Zero backend change.

## Verified Phase 1–7 status (corrected from prior turn)

| Phase | Status | Evidence (this session) |
|---|---|---|
| **1 — Cron auth helper** | **Partial.** `requireAdminOrCron` deployed in `_shared/auth-gate.ts`; `public._cron_invoke_edge` exists (`pg_proc` check). **But** `cron.job.srangam-pin-enrichment-nightly.command` still posts with **anon JWT** → today's 03:00 UTC run failed with `watchdog: no heartbeat` (`srangam_admin_jobs` row, `processed:0`). | Direct `SELECT command FROM cron.job`. |
| **2 — Deccan gazetteer +15** | Done. | Admin tile: `WITH PINS 43 / 47`. |
| **2b — Evidence backfill** | Not started. | `srangam_article_evidence` sparse. |
| **3 — OG nightly cron** | Not started. `generate-article-og` still uses `requireAdmin` (line 315). | grep + cron list. |
| **4 — Term enrichment cron** | Not started. `batch-enrich-terms` still uses `requireAdmin` (line 15). | grep + cron list. |
| **5 — CX.3 snapshot cron** | Not started. `context-save-drive` still uses `requireAdmin` (line 28). Last snapshot `2026-05-29 CX.1`. | grep + cron list. |
| **6 — Counter polish** | Done. | `Home.tsx`. |
| **7 — Candidate funnel** | **More complete than I thought.** Table `srangam_gazetteer_candidates` exists with correct RLS. **Harvesting IS wired** — `recordGazetteerCandidates()` lives at `backfill-article-pins/index.ts:165–230` and fires after gazetteer resolve. The table is empty (0 rows) only because every article processed today either (a) resolved all AI hits cleanly to existing gazetteer rows, or (b) returned empty NER (the 4 conceptual pieces). Admin UI **not** built. | grep `srangam_gazetteer_candidates` shows insert path; `SELECT COUNT(*)` = 0. |

## Plan — surgical completions, in this order

Additive, reversible, gated. Touches only admin console + one cosmetic badge.

### Phase 1-FIX — Rewire nightly cron command (the unblock)

Single `cron.alter_job` to replace the anon-bearer POST with `public._cron_invoke_edge('backfill-article-pins', body)`. The helper already reads `SUPABASE_SERVICE_ROLE_KEY` + `CRON_SECRET` from `vault.decrypted_secrets` and sets the triple condition (`Authorization: Bearer <service_role>` + `x-cron-secret` + `_cron:true` in body) that `requireAdminOrCron` checks.

Conceptual new command:

```
DO $$
DECLARE v_job_id uuid;
BEGIN
  v_job_id := public.enqueue_pin_backfill_sweep_job(20, 1);
  IF v_job_id IS NOT NULL THEN
    PERFORM public._cron_invoke_edge(
      'backfill-article-pins',
      jsonb_build_object(
        'job_id',        v_job_id::text,
        'all_published', true,
        'only_zero_pin', true,
        'limit',         20,
        'offset',        0,
        'chunk_size',    1
      )
    );
  END IF;
END $$;
```

`chunk_size` forced to **1** per Phase G1 invariant (AI on).

**Pre-flight check:** confirm `vault` actually has `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` rows; if not, surface that to the user before altering cron — do not silently fail.

**Verification gate:** `cron.schedule('pin-cron-smoke', '* * * * *', …)` for one minute → expect a `srangam_admin_jobs` row with `created_by IS NULL`, `processed > 0`, `status='succeeded'`, no watchdog message. Drop the smoke job immediately after.

**Rollback:** `cron.alter_job` back to the old anon-bearer command (kept verbatim in the migration comment).

### Phase 7-FIX — Admin Candidate Review UI (harvesting already works)

No edge function change. New page only.

1. `/admin/gazetteer/candidates` — sortable list (occurrences DESC, source_articles count DESC, first_seen_at ASC). Columns: normalized_name · raw_name · occurrences · first article · status · actions.
2. Three actions per row:
   - **Promote** → modal pre-filled by a new admin-only edge function `gazetteer-variant-suggest` (Gemini, returns suggested `feature_type`, `era_tags`, IAST/ASCII/Devanagari/historic variants). Admin reviews → `INSERT … ON CONFLICT (canonical_name) DO NOTHING` per Phase G3 → candidate flipped to `approved` with `promoted_gazetteer_id` backlink.
   - **Reject** → status='rejected' + `review_notes`.
   - **Merge** → adds `raw_name` to chosen gazetteer row's `name_variants` (append-only, dedup), candidate marked `merged`.
3. No auto-promote. Honors *"AI for curation, not expansion."*

**Verification gate:** after Phase 1-FIX's first cron run hits any article with unresolved names, ≥1 candidate appears; promoting it produces a new gazetteer row and the next sweep picks it up automatically.

### Phase 3 — OG nightly cron (03:30 UTC, cap 5)

1. Switch `generate-article-og` from `requireAdmin` → `requireAdminOrCron`.
2. Add `only_missing` + `limit` query support if not present (re-read first — do not assume).
3. `cron.schedule('srangam-og-backfill-nightly', '30 3 * * *', _cron_invoke_edge('generate-article-og', {only_missing:true, limit:5}))`.

**Verification gate:** `MISSING OG` trends toward 0; `srangam_admin_jobs` row of `kind='og_generate' AND created_by IS NULL AND status='succeeded'` appears.

### Phase 4 — Term enrichment cron (04:00 UTC, cap 10)

1. Re-read `batch-enrich-terms` + `enrich-cultural-term` for the actual "stale" field set — do not fabricate columns.
2. Switch `batch-enrich-terms` to `requireAdminOrCron`.
3. `cron.schedule('srangam-term-enrichment-nightly', '0 4 * * *', _cron_invoke_edge('batch-enrich-terms', {only_stale:true, limit:10}))`.

**Verification gate:** job succeeds; 3 spot-checked terms show new field values vs. previous (via `srangam_event_log` diff).

### Phase 5 — CX.3 snapshot cron (04:30 UTC)

1. Switch `context-save-drive` to `requireAdminOrCron`.
2. `cron.schedule('srangam-context-snapshot-nightly', '30 4 * * *', _cron_invoke_edge('context-save-drive', {}))`.

**Verification gate:** new row has `stats_detail->>'generated_with'='CX.3'` AND `identity_sets IS NOT NULL`; next `context-diff-generator` upgrades from `count_only` → `identity` per CX.3 precedence. Frozen `≤2026-05-29` snapshots untouched.

### Phase 6b — Honest admin counter (frontend-only)

In `src/pages/admin/GeographyMedia.tsx`, under the `WITH PINS 43 / 47` tile, render a small muted subtitle: `4 conceptual articles · no places to resolve`. Computed inline: zero-pin AND (latest log event of `pin_complete` for that article shows `completion_tokens ≤ N`) — but since we don't query logs from the client, a simpler honest signal: `zero-pin AND content body has no gazetteer-resolvable substring after 2+ runs`. Practical implementation: derive the "4 conceptual" count from `published_count − with_pins_count` and label as `conceptual` only when these articles also appear in a small admin-curated allow-list stored in a tiny new constant (or a JSONB column on `srangam_articles.tags = […, 'conceptual:true']`). Decide between the two during build (likely the tag route — additive, queryable, surfaces in CMS).

**Verification gate:** subtitle renders at desktop + 360px mobile; no console errors; admin tile no longer reads as backlog.

### Phase 2b — Evidence backfill (deferred)

Defer until Phases 1-FIX, 3, 4, 5 are green for 48 h. Unchanged from prior plan.

## Out of scope (Core invariants, will not violate)

- No widening of AI prompts or relaxing of confidence floors to chase the 4 conceptual articles.
- No DELETE on gazetteer (Phase G3).
- No retroactive UPDATE on `≤2026-05-29` CX snapshots (frozen baseline).
- No change to `articleResolver.ts` JSON-source pin path.
- No edits to `src/integrations/supabase/{client,types}.ts` or `.env`.
- No re-introduction of the manual-only pin flow (Phase Z invariant).
- No `chunk_size > 1` when AI is on (Phase G1).

## Documentation updates (shipped with each phase)

- `.lovable/plan.md` — phase status + datestamps.
- `docs/SCALABILITY_ROADMAP.md` — four nightly crons under "Automated intelligence loops" with cost caps ($/night).
- `docs/architecture/SOURCES_PINS_SYSTEM.md` — candidate funnel admin UI + the explicit "conceptual articles" definition with the 4-name allow-list rationale.
- `docs/CONTEXT_MANAGEMENT_GUIDE.md` — CX.3 snapshots now nightly.
- Memory: update `mem://phase-z/pin-enrichment-automation` to record the cron-command fix (vault-secret dependency, helper indirection, smoke-test recipe).

## Execution order

1. Phase 1-FIX — cron command rewrite (unblocks every other cron).
2. Phase 3 — OG cron (zero-risk; smallest function surface).
3. Phase 4 — term enrichment cron.
4. Phase 5 — CX.3 snapshot cron.
5. Phase 7-FIX — candidate review UI.
6. Phase 6b — admin counter clarification.
7. Phase 2b — evidence backfill (only after 48 h of green crons).

Approve to proceed with **Phase 1-FIX** first (single `cron.alter_job` + pre-flight vault check + smoke schedule).
