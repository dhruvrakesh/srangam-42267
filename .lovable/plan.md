## Revived, evidence-based assessment (idempotency-first)

This is a running, functional project. Every phase below is **additive, reversible, and idempotent**: re-running it must converge to the same state without duplicating data, double-billing AI calls, or stomping prior work. No rebuilds. No production data deletion.

---

## Live ground truth (verified against the DB just now)

```text
published articles        45
gazetteer rows            112  (Phase G3 baseline; UNIQUE(canonical_name))
total article pins        135
articles with pins        34 / 45
total evidence rows       79
articles with evidence     6 / 45
articles with OG images   44 / 45
duplicate (article_id, gazetteer_id) pin pairs   0
```

Pin source/confidence distribution:

```text
all 135 pins are confidence=B, source=content_scan
A (evidence-derived) pins: 0
C (AI NER) pins:           0
```

Last two `pin_backfill` jobs:

```text
latest:   running, 38/45 processed, 32 succeeded, 6 failed, last_error="[object Object]"
previous: succeeded, 45/45 processed, 36 succeeded, 9 failed, last_error="[object Object]"
```

So the row-level constraints already give us idempotency, but the **workflow** around them is not idempotent yet:
- the admin bulk button re-scans all 45 articles every time;
- AI/content scans get re-billed on articles that already have pins;
- A/C pins silently fail because the function writes `source` values the table CHECK constraint rejects;
- the operator sees `[object Object]` and cannot diagnose.

---

## Root causes (confirmed in code + DB)

### RC-1 — Bulk pin backfill is not idempotent at the workflow level
`src/pages/admin/GeographyMedia.tsx:215` calls `backfill-article-pins` with `all_published:true` but **omits** `only_zero_pin:true`. The function therefore re-scans the full 45 every run. Row-level upsert prevents duplicate rows, but AI calls and CPU are repeated.

### RC-2 — `source` enum mismatch silently truncates pin tiers
DB constraint (`srangam_article_pins_source_check`) allows:

```text
evidence_table | content_scan | ai_extract | manual
```

`supabase/functions/backfill-article-pins/index.ts:262` writes:

```text
evidence  |  content_scan  |  ai_ner
```

→ Only `content_scan` survives. Evidence-tier (A) and AI-tier (C) inserts fail the constraint and are reported as `[object Object]`. This explains both **zero A/C pins** and the recurring failures.

### RC-3 — Error serialization loses all signal
`backfill-article-pins/index.ts:495` does `e instanceof Error ? e.message : String(e)`. Supabase PostgrestError objects are not `Error` instances, so they stringify to `[object Object]`. Same pattern in `_shared/jobs.ts` last_error handoff.

### RC-4 — Evidence sidebar conflates "no DB rows" with "broken"
- Live evidence coverage is genuinely 6/45 articles.
- `OceanicArticlePage.tsx:388` passes `pageOrCard={article.title}` (full multilingual title object) into the legacy correlation engine, which keys by page/theme labels → near-zero match rate.
- `correlationEngine` loads CSV asynchronously in its constructor but exposes no readiness signal; first render returns empty `claims[]`.
- Result: yellow "Using cached sources" banner + empty `KEY CLAIMS` block, which reads as a bug.

### RC-5 — Generated image is unreadable, not unusable
`OceanicArticlePage.tsx:251` force-crops the 1200×630 hero to `h-48/md:h-64/lg:h-72 object-cover` with no click target. Admin `GeographyMedia.tsx` shows only a `vN` badge, no thumbnail, no preview.

### RC-6 — CX.2 is half-shipped
- `context-save-drive` and `tts-save-drive` use shared `_shared/google-drive.ts` ✅
- `context-bundle-generator/index.ts:231-389` still re-inlines the full JWT + multipart upload (violates the Phase CX.2 invariant in `mem://index.md`).
- Latest snapshot row is still `generated_with='CX.1'` (2026-05-29 12:32) — no CX.2 snapshot has actually been written.
- `srangam_context_snapshots` has no `identity_sets` column yet (confirmed via `information_schema.columns`).

CX.3 must not start until CX.2 is real.

---

## Idempotency contract (binding for every phase)

| Surface | Idempotency mechanism | Verification |
|---|---|---|
| `srangam_article_pins` | PK `(article_id, gazetteer_id)` + `.upsert({onConflict})` | duplicate-pair count = 0 |
| `srangam_gazetteer` | `UNIQUE(canonical_name)` + `ON CONFLICT DO NOTHING` | row count stable on re-run |
| Pin bulk workflow | `only_zero_pin:true` skips already-pinned articles | second consecutive bulk run = 0 articles processed |
| `backfill-article-pins` single-article path | upsert + deterministic `display_order` recompute | re-run leaves row count unchanged |
| `srangam_admin_jobs` | per-job UUID; cancel/re-attach by id; heartbeat | no orphan "running" rows after watchdog |
| `srangam_media_assets` (OG) | `prompt_hash` short-circuit in `generate-article-og` | re-run with same prompt returns `skipped` |
| `srangam_context_snapshots` | append-only (no UPDATE/DELETE policy) | history grows; old rows never mutated |
| CX.3 `identity_sets` | additive JSONB column, default `'{}'::jsonb` | legacy rows continue to read; diff falls back to count_only |

Whenever a phase below changes a write path, the test of correctness is: **run it twice in a row; the second run must be a near-noop with zero new cost.**

---

## Phase plan (one shippable change per phase)

### Phase 0 — Stabilize and document (no code change)
- Confirm whether the currently-running `pin_backfill` job is still heart-beating; if stalled, cancel from the admin UI.
- Append the ground-truth table above to `.lovable/plan.md` with timestamp so future loops have a frozen baseline.
- **Idempotency:** observational only.

### Phase 1 — Pin pipeline surgical healing
1. `GeographyMedia.tsx`: bulk button passes `only_zero_pin:true`; persist in `srangam_admin_jobs.params`.
2. `backfill-article-pins/index.ts:262`: emit `source ∈ {evidence_table, content_scan, ai_extract}` to satisfy the existing CHECK constraint. **No DB migration.**
3. `_shared/jobs.ts` + `backfill-article-pins`: introduce `serializeErr(e)` that returns `message | code | details | hint` (Postgrest-aware). Replace every `[object Object]` site.
4. `finishJob()` in `_shared/jobs.ts`: when `failed > 0 && succeeded > 0`, mark `succeeded` but stash `last_error` and a `params.partial=true` flag (constraint already allows `succeeded|failed|cancelled`).
5. No write to existing pins; nothing deleted.

**Verification (idempotency gate):**
```sql
-- before
select count(*), count(distinct article_id) from srangam_article_pins;
-- run bulk backfill once -> some new A/C pins on zero-pin articles
-- run bulk backfill again immediately
-- after second run
select count(*), count(distinct article_id) from srangam_article_pins;
-- => second run reports processed=0 (only_zero_pin filter), no new rows, no AI cost
select article_id, gazetteer_id, count(*) from srangam_article_pins
group by 1,2 having count(*)>1;  -- still []
```

### Phase 2 — Evidence honesty + admin visibility
1. `SourcesAndPins` (oceanic): when `bibliography.length===0 && evidence.length===0`, render a single explicit empty state ("No structured evidence imported for this article. 6/45 published articles currently have structured evidence rows.") instead of the yellow legacy banner + empty claims block.
2. Admin-only inline action (gated by `useAuth().isAdmin`): "Re-import via Markdown" deep link.
3. `correlationEngine.getSourcesAndPins(pageOrCard)`: stop matching against full multilingual `article.title`; key on `article.theme` + tags instead (single-line change in `OceanicArticlePage:388`).
4. Add a new admin column in `GeographyMedia.tsx` per-article table: `Evidence`, `Bib`, alongside existing `Pins` / `OG` (read-only counts).
5. **Idempotency:** pure read/UI; no new writes.

### Phase 3 — Generated image inspection UX
1. Article hero: wrap `<img>` in a button → shadcn `Dialog` lightbox; inside lightbox use `object-contain` on a `max-h-[85vh]` container, plus "Open original" link to the proxied URL.
2. Aspect-safe outer container (`aspect-[1200/630]`) replaces `h-48/md:h-64/lg:h-72`; image still `loading="lazy"`, still goes through `getProxiedImageUrl`.
3. `GeographyMedia.tsx` row OG cell: tiny 64×34 thumbnail + "View" button that opens the same Dialog component.
4. **Idempotency:** no generation, no storage migration. Existing `srangam_media_assets` versioning untouched.

### Phase 4 — Finish CX.2 for real
1. Refactor `context-bundle-generator/index.ts` to import from `_shared/google-drive.ts` and `_shared/context-metrics.ts`; delete the inline `uploadToGoogleDrive` block (lines 231–389).
2. Trigger one snapshot from `/admin/context`; verify the new row has `stats_detail->>'generated_with'='CX.2'`.
3. Doc updates with temporal honesty:
   - `docs/CONTEXT_MANAGEMENT_GUIDE.md`: mark snapshots ≤ 2026-05-29 12:32 as CX.1 frozen baseline.
   - `.lovable/plan.md`: append "CX.2 verified" with snapshot id.
4. **Idempotency:** snapshots are append-only by RLS; re-running save just creates a fresh row, never mutates history.

**Verification:**
```sql
select id, snapshot_date, stats_detail->>'generated_with'
from srangam_context_snapshots
order by created_at desc limit 3;
-- top row generated_with='CX.2'
```

### Phase 5 — CX.3 identity-set diffs (additive)
Single additive migration:
```sql
alter table public.srangam_context_snapshots
  add column if not exists identity_sets jsonb not null default '{}'::jsonb;
create index if not exists idx_srangam_context_snapshots_identity_sets
  on public.srangam_context_snapshots using gin (identity_sets jsonb_path_ops);
```
No new RLS, no GRANT change (column inherits table policies; admin-read/admin-insert already in place; still no UPDATE/DELETE policy → snapshots stay immutable).

Shape:
```json
{
  "article_slugs":   ["…"],
  "tag_names":       ["…"],
  "term_slugs":      ["…"],
  "module_names":    ["…"],
  "published_article_ids": ["…"]
}
```

Code:
1. New helpers in `_shared/context-metrics.ts`: `identityArticleSlugs()`, `identityTagNames()`, `identityTermSlugs()`, `identityModules()` — all paginated, never `.limit()`-bounded.
2. `context-save-drive` populates `identity_sets`, bumps `generated_with` to `'CX.3'`.
3. `context-diff-generator`:
   - CX.3 ↔ CX.3 → `mode:'identity'` with `{added,removed,unchanged_count}` per dimension.
   - CX.3 ↔ CX.2/CX.1 → `mode:'count_only'` with explicit `reason`.
   - Never throws on missing/empty `identity_sets`.

**Idempotency:** column has default `'{}'`; backfill is only forward (new snapshots only). Old rows untouched (immutable-data principle). Re-running snapshot generation just writes another append row.

**Verification:**
```sql
select pg_column_size(identity_sets),
       jsonb_array_length(identity_sets->'article_slugs')
from srangam_context_snapshots
where stats_detail->>'generated_with' = 'CX.3'
order by created_at desc limit 3;
-- expect a few KB per row; article_slugs count ≈ 45 today
```

---

## What I will explicitly NOT do

- Delete or update existing pins / evidence / snapshots / media_assets.
- Loosen any CHECK / UNIQUE / RLS / GRANT.
- Widen AI prompts or relax confidence gates to inflate pin coverage.
- Mutate the CX.1 frozen snapshots.
- Bundle multiple phases into one deploy.
- Start CX.3 before CX.2 produces a verified live snapshot.

---

## Suggested execution order

1. Phase 0 (observational, ~2 min, zero risk)
2. Phase 1 (pin idempotency + tier-A/C unlock + readable errors)
3. Phase 2 (evidence empty state + admin counts)
4. Phase 3 (image lightbox + admin thumbnail)
5. Phase 4 (CX.2 actually shipped + verified snapshot)
6. Phase 5 (CX.3 additive migration + identity diff)

Each phase is independently shippable, independently revertible, and each has an idempotency gate that must pass before the next phase starts.