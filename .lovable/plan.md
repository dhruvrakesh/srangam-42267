# Intelligence-loop stabilization — revised plan (v2)

This plan is additive, surgical, and reversible. Every phase has an explicit verification gate and rollback. Nothing alters the running product surface except by adding data or correcting silent failures.

## What changed since v1 (your three new questions)

1. **"Stray 6 articles" on the landing page.** Confirmed in `src/pages/Home.tsx`: the "Recent Research" section renders both `{totalArticles} Published Articles` (large saffron number) and below it `{filteredArticles.length} {t('filters.articlesShowing')}` — and `filteredArticles` is hard-capped at `limit: 6` until "Show all" is clicked (line 42). So the "6 articles" text is real, not a stray: it's the secondary "showing 6 of 46" counter, just sitting on its own line so the cropped screenshot makes it look orphaned. This is a UI polish item, **not a data bug** — folded into Phase 6 below.

2. **"Should we cron AI enhancement with very-high-confidence-only?"** Yes — **but only because the existing C-tier path is already curation-bounded.** A pin is only ever written when the AI's NER output resolves back into `srangam_gazetteer.name_variants` (a row that *we* curated). The AI is a recall booster, not an ontology source. So adding AI to the nightly cron is safe **if** we (a) keep `chunk_size = 1` (Phase G1 invariant), (b) keep the 20-article/night cost cap (Phase Z), (c) write pins only when gazetteer-resolved, (d) raise the per-pin confidence floor that gets persisted. This is consistent with the Core invariant "AI for curation, not expansion."

3. **"How do we enhance the gazetteer in a sensible, grounded way?"** A two-loop curation funnel, no auto-insert. New phase 7 below.

## Ground truth from this session (unchanged from v1 audit)

- This article (`breached-from-within`, alias `breached-within-internal-fracture`): 1 pin, 0 evidence rows, 0 bibliography rows. Sources & Pins panel is reporting truthfully.
- Gazetteer = 112 rows. Only one canonical_name (`Aden`) matches inside the body; the rest of the missing pins are the Vijayanagara/Tungabhadra/Deccan cluster that simply isn't in the gazetteer.
- Two crons exist: `srangam-admin-jobs-watchdog` (working) and `srangam-pin-enrichment-nightly` (broken since launch — uses anon JWT against an `requireAdmin` gate, every nightly run since 2026-05-29 sits at `processed:0, last_error: 'watchdog: no heartbeat'`).
- No crons exist for OG, term enrichment, or context snapshots. Last context snapshot is `2026-05-29 CX.1` — `CX.2`/`CX.3` columns/code shipped but were never invoked.
- System-wide pins: 144 B-tier + 6 C-tier + 0 A-tier across 39 / 46 published articles.

## Phase 1 — Cron auth fix (unblocks everything)

Add to `supabase/functions/_shared/auth-gate.ts`:

```text
requireAdminOrCron(req): GateResult
  if Authorization == "Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
    AND header "x-cron-secret" == Deno.env("CRON_SECRET")
    AND body._cron === true
    → return { isAdmin: true, fromCron: true }
  else
    → delegate to existing requireAdmin (unchanged for the admin UI)
```

Switch `backfill-article-pins` (and the three new cron targets in Phases 3–5) from `requireAdmin` → `requireAdminOrCron`. Cron command rewritten to:

```text
Authorization: Bearer <service_role>
x-cron-secret: <CRON_SECRET>
body: { ..., _cron: true }
```

Three reasons this is safe:
- Service-role is already accessible to anyone with DB access to `cron.job` (same as today's anon-key leak).
- The triple-condition (bearer + header + body flag) means a leaked anon key from a network log cannot trigger the cron path.
- Admin UI continues to go through the user-JWT branch — no privilege change for end users.

Add `CRON_SECRET` via the secrets tool (single secret, project-wide).

**Verification gate:** manually `pg_cron.schedule` a one-shot copy of the new entry for the next minute; expect a `srangam_admin_jobs` row with `created_by IS NULL`, `processed > 0`, `status = 'succeeded'`. Then remove the one-shot.

**Rollback:** revert the cron command to the old anon-key form; helper change is dormant once nothing calls it.

## Phase 2 — Restore pin coverage on sparse articles (incl. this one)

Curated gazetteer migration for the Vijayanagara / medieval Deccan cluster missing today:
Vijayanagara, Hampi (already in, verify variants), Tungabhadra, Anegundi, Penukonda, Chandragiri, Talikota, Krishna (river), Raichur Doab, Bidar, Bijapur/Vijayapura, Warangal, Devagiri/Daulatabad, Kalyana, Hampi-Vitthala, Kampili. Each row: `canonical_name`, `name_variants` (IAST + ASCII + Devanagari + historic exonym), `feature_type` from the frozen vocabulary, `era_tags = ['medieval']`. Migration uses `ON CONFLICT (canonical_name) DO NOTHING` per Phase G3.

Then a one-shot admin run of `backfill-article-pins` scoped to: this article's id + the 7 currently zero-pin published articles (`only_zero_pin: true`, AI on, chunk_size 1).

**Verification gate:**
- `SELECT count(*) FROM srangam_article_pins WHERE article_id='c00947ce-...'` returns ≥ 5.
- `with_pins` rises from 39/46 toward ≥ 44/46.
- Per-confidence counts show new C-tier (and any latent A-tier from evidence backfill in Phase 2b below).

**Rollback:** the gazetteer migration is additive (no DELETE — Phase G3 forbids). Generated pins are idempotent; a re-run with `skip_ai:true` will not duplicate.

## Phase 2b — Evidence backfill (small, optional, same release)

`srangam_article_evidence` is empty for this article and most others (6/46 have rows). A-tier pins (the highest-confidence layer) can only emerge from evidence rows. Add a single admin-triggered pass of `backfill-bibliography`-style evidence extraction restricted to articles with structured "Evidence" headings in their markdown. Cost-cap to 5 articles for the verification run. This is the only way A-tier ever populates and is the foundation for the "structured evidence rows" badge in Phase 2 we shipped earlier.

**Verification gate:** at least one published article transitions from 0 → ≥1 evidence rows, and the Sources & Pins panel's `Evidence` tab on that article shows real rows instead of the truthful empty state.

## Phase 3 — OG image nightly cron

`srangam-og-backfill-nightly` (03:30 UTC, cap 5/night, `_cron:true`).
Calls `generate-article-og` with `{ only_missing: true, limit: 5 }` (add the filter — additive, no schema change).
Currently only 2 articles are missing OG, so this loop self-empties in a day or two and then sits idle.

**Verification gate:** `published AND og_image_url IS NULL` trends to 0; new `srangam_admin_jobs` row of `kind='og_generate'` succeeds.

## Phase 4 — Cultural-term enrichment nightly cron

`srangam-term-enrichment-nightly` (04:00 UTC, cap 10 terms/night).
Calls `batch-enrich-terms` with `{ only_stale: true, limit: 10 }`. "Stale" = missing canonical fields (`etymology`, `iast`, `scriptural_refs` — exact field list deferred until `enrich-cultural-term`'s schema is re-read at implementation time so we don't fabricate columns).

**Verification gate:** nightly job row succeeds; spot-check 3 enriched terms vs. their previous state via `srangam_event_log`.

## Phase 5 — Context snapshot nightly cron + first CX.3 write

`srangam-context-snapshot-nightly` (04:30 UTC).
Calls `context-save-drive` with `{ _cron: true }`. Code already stamps `generated_with='CX.3'` and populates `identity_sets`.

**Verification gate:** first new row has `stats_detail->>'generated_with' = 'CX.3'` AND `identity_sets IS NOT NULL`. `context-diff-generator` next run upgrades from `count_only` → `identity` per the existing three-tier precedence invariant. Frozen `≤2026-05-29` snapshots are not touched.

## Phase 6 — UI polish for the landing-page counter (small, frontend-only)

In `src/pages/Home.tsx` collapse the two separate count lines into one of two forms depending on filter state:

- No filter active and not expanded: `"Showing 6 of 46 published articles · Last updated May 2026"` (single line).
- Filter active or expanded: `"46 published articles · Last updated May 2026"` above, `"6 articles match Theme X"` below.

This kills the "stray 6 articles" appearance without changing any pagination logic.

**Verification gate:** visual check at desktop + 360px mobile, plus the existing prose-overflow tests must still pass.

## Phase 7 — Continuous, grounded gazetteer growth (the key strategic addition)

Curation funnel, never auto-insert. Two loops:

**Loop A — Candidate harvesting (passive, free).** `backfill-article-pins` already calls AI NER and discards every name that doesn't resolve to a gazetteer row. Instead of discarding, write those unresolved names to a new table:

```text
srangam_gazetteer_candidates (
  id, normalized_name, raw_name,
  first_seen_article_id, first_seen_at,
  occurrences int default 1,
  source_articles uuid[],       -- distinct article_ids
  ai_provider text, ai_model text,
  status text default 'pending', -- pending|approved|rejected|merged
  reviewed_by uuid, reviewed_at, review_notes,
  PRIMARY KEY (id),
  UNIQUE (normalized_name)
)
-- on conflict: occurrences = occurrences + 1, source_articles |= [article_id]
```

RLS: admin-only read + write. service_role full. No anon.

**Loop B — Admin curation panel (active, manual).** New tab in `/admin` showing the candidate queue, sorted by `occurrences DESC, array_length(source_articles) DESC`. Each row offers:

- "Promote to gazetteer" → opens a modal pre-filled by an admin-only edge function `gazetteer-variant-suggest` that proposes `feature_type`, `era_tags`, IAST, ASCII, Devanagari, and historic exonyms via Gemini, **for admin review**. On save, inserts into `srangam_gazetteer` with `ON CONFLICT (canonical_name) DO NOTHING` and marks the candidate `approved` with `gazetteer_id` backlink.
- "Reject" → marks `rejected` with reason (e.g. "personal name", "modern company", "duplicate of …").
- "Merge into existing" → adds the raw_name to that gazetteer row's `name_variants` and marks `merged`.

Cost: zero ambient (Loop A is a side-effect of existing AI calls). Admin time is the only spend.

**Auto-promote threshold? Recommendation: NO.** Honoring the Core invariant "AI for curation, not expansion" and the Phase G3 rule "If 'withPins/N' stays low after a clean backfill, always expand the gazetteer further — never broaden AI prompts or relax confidence gates as a workaround," candidates only enter `srangam_gazetteer` through an admin click. The candidate queue gives us a constantly-replenished, ranked work list so curation has somewhere obvious to start.

**Verification gate:** after the next AI-on cron run completes, `srangam_gazetteer_candidates` has ≥ N new rows. Admin UI lists them with frequency. A test promotion of one candidate produces a new gazetteer row, the candidate flips to `approved`, and the next pin sweep picks the new row up automatically.

## Documentation updates (every phase ships these together)

- `.lovable/plan.md` — phase status with date stamps.
- `docs/SCALABILITY_ROADMAP.md` — add the four nightly crons under "Automated intelligence loops" with cost caps and ownership.
- `docs/architecture/SOURCES_PINS_SYSTEM.md` — document candidate funnel and the gazetteer-only pin invariant.
- `docs/CONTEXT_MANAGEMENT_GUIDE.md` — note that CX.3 snapshots are now nightly.
- Memory: update `Pin Enrichment Automation` to record the cron-auth fix; new memory `mem://gazetteer/candidate-funnel` describing Loop A/B.

## Out of scope (unchanged)

- No edits to `articleResolver.ts` JSON-source pin path.
- No retroactive UPDATE on `≤2026-05-29` CX snapshots (frozen baseline).
- No widening of AI prompts or confidence gates as a coverage shortcut.
- No watchdog window change (5 min is correct; the fix is upstream auth).

## Execution order (each phase has a stop-and-verify gate before next)

1. Phase 1 — cron auth.
2. Phase 2 — gazetteer Deccan expansion + targeted resweep.
3. Phase 2b — evidence backfill (small, optional, can defer).
4. Phase 6 — landing-page counter polish (pure frontend, parallel-safe).
5. Phase 3 — OG cron.
6. Phase 4 — term enrichment cron.
7. Phase 5 — context snapshot cron.
8. Phase 7 — gazetteer candidate funnel (table + admin UI).

Phases 1, 6 are the smallest and most foundational. Phase 7 is the strategic one — it's the answer to "how do we stop being limited by gazetteer coverage forever" and turns a one-shot expansion into a continuous, admin-curated growth loop.
