# Phase P Dry-Run + Three-Source Cron Truth + Enterprise Heal Path
_Audit timestamp 2026-06-06. All findings are read-only DB + source verified, no guesses._

## 1. Phase P dry-run (before unique constraint)

`srangam_purana_references` baseline: **69 rows** across **9 articles**.

| Metric | Value |
|---|---|
| Duplicate groups on `(article_id, purana_name, reference_text, adhyaya)` | **17** |
| Rows that would be removed (sum of `c-1`) | **19 (27.5%)** |
| Articles affected | **3** |
| Articles untouched | **6** |

### Duplicate groups by article

**`chapter-6-ar-ra-and-tman-preserving-the-body-and-soul-of-the-vedas`** — 5 groups, 7 rows to remove
| purana_name | reference_text | adhyaya | occ | rem |
|---|---|---|---:|---:|
| Nirukta | Nirukta of Yāska | '' | 3 | 2 |
| Viṣṇu Purāṇa | Viṣṇu Purāṇa | '' | 3 | 2 |
| Rigveda | Ṛgveda 10.9 | '' | 2 | 1 |
| Śatapatha Brāhmaṇa | Śatapatha Brāhmaṇa 1.8.1 | '' | 2 | 1 |
| Yajurveda | Vājasaneyi Saṃhitā 36.24 | '' | 2 | 1 |

**`from-dev-s-kta-to-dev-m-h-tmya`** — 9 groups, 9 rows to remove
| purana_name | reference_text | adhyaya | occ | rem |
|---|---|---|---:|---:|
| Atharva Veda | Atharva Veda 12.1.12 | '' | 2 | 1 |
| Devī Bhāgavata Purāṇa | Devī Bhāgavata Purāṇa | '' | 2 | 1 |
| Devī Māhātmya | Devī Māhātmya | 81-93 | 2 | 1 |
| Devī Upaniṣad | Devī Upaniṣad 1–3 | '' | 2 | 1 |
| Mahābhārata | Mahābhārata 3.81 | 3 | 2 | 1 |
| Mīnākṣī Māhātmya | Mīnākṣī Māhātmya | '' | 2 | 1 |
| Ṛgveda | Ṛgveda 1.3.10 | '' | 2 | 1 |
| Ṛgveda | Ṛgveda 2.41.16 | '' | 2 | 1 |
| Ṛgveda | Ṛgveda 6.61.7–11 | '' | 2 | 1 |

**`ancient-tribal-traditions-and-the-animistic-roots-of-sanatan-dharma`** — 3 groups, 3 rows to remove
| purana_name | reference_text | adhyaya | occ | rem |
|---|---|---|---:|---:|
| Mahabharata | Mahabharata | Not mentioned | 2 | 1 |
| Mahabharata | Mausala Parva | Not mentioned | 2 | 1 |
| Satapatha Brahmana | Satapatha Brahmana | Not mentioned | 2 | 1 |

### Constraint safety notes
- All collisions are byte-exact on the proposed unique key. **No semantic collisions** would be folded.
- `adhyaya` has three NULL-equivalent forms in this set: `NULL`, `''`, `"Not mentioned"`. The proposed `UNIQUE(article_id, purana_name, reference_text, adhyaya)` would treat them as distinct → future re-extractions producing the same row with a different NULL-form would slip past the constraint.
- **Mitigation**: normalize `adhyaya` (empty string and literal "Not mentioned" → `NULL`) before adding the constraint, and harden the edge function to write `NULL` consistently.

## 2. Three-source cron truth check (2026-06-06 03:00–04:00 UTC)

| jobid | name | A: cron status | B: pg_net status_code | C: srangam_admin_jobs | Verdict |
|---|---|---|---|---|---|
| **2** | pin-enrichment-nightly | succeeded | **no response row** | row `681679b9…` — `failed`, `processed=0`, `heartbeat_at=NULL`, `last_error="watchdog: no heartbeat"`, total=4 | ❌ **BROKEN — root cause identified below** |
| **6** | og-nightly | succeeded | no response row | no row in window | ⚠️ Unverified (likely no candidates → enqueuer short-circuited; needs OG-status check) |
| **7** | term-enrichment-nightly | succeeded | **200** `{successful:0, failed:2}` (`the-n-ga-compact`, `ganderbal-m-s-spr…`) | n/a (function does not use admin_jobs) | ⚠️ Function ran but both downstream calls 5xx |
| **8** | context-snapshot-nightly | succeeded | **200** — wrote `srangam_context_2026-06-06.md` to Drive (fileId `14B4vVrQh2x…`) | n/a | ✅ Healthy |

### Root cause for job 2 — Phase H restored a helper that NEVER POSTS

Reading `enqueue_pin_backfill_sweep_job(p_limit, p_chunk)` directly from the catalog:

```sql
-- (verbatim, lines 99-143 of pg_proc def)
…
INSERT INTO srangam_admin_jobs (kind, status, total, started_at, params)
VALUES ('pin_backfill', 'running', LEAST(v_zero_count, p_limit), now(), jsonb_build_object(...))
RETURNING id INTO v_job_id;

RETURN v_job_id;   -- 🚨 returns and exits
END;
```

There is **no `_cron_invoke_edge(...)` call**. The helper inserts an admin_jobs row, then returns. The edge function `backfill-article-pins` is never POSTed. The 5-min watchdog reaps the orphan row at 03:05 every night.

This is a regression vs. its siblings: `enqueue_og_nightly_job` (line 83) and `enqueue_term_enrichment_nightly` (line 175) both call `_cron_invoke_edge` after inserting the row. The pin helper was authored when invocation happened from the edge function itself (manual trigger from admin UI) and was never adapted for cron firing.

### Phase H was correct but incomplete
- ✅ `_cron_invoke_edge` now passes `timeout_milliseconds := 120000` (verified line 32 of pg_proc def).
- ✅ jobid 6 / 7 are now wired to enqueuers (line-verified above).
- ❌ jobid 2's enqueuer never POSTs, so the 120 s timeout is moot for pin enrichment.

## 3. Bibliography state

| Metric | Value |
|---|---|
| Published articles | **47** |
| Articles with ≥1 `srangam_article_bibliography` row | **5 (10.6%)** |
| Total citation links | 69 |
| `srangam_bibliography_entries` master rows | 56 |
| AI fallback in `backfill-bibliography/index.ts` | **none** (grep for `aiExtract|gemini|openai` returns 0) |

The function is regex-only over markdown footnote syntax. Most published articles cite inline (`(Sharma 2003, p. 14)`) which the regex never sees.

## 4. Enterprise heal path — three approvable phases

All phases follow the user's principles: **production data is immutable** (archive before delete), **additive** (new constraints / new flags rather than rewriting), **surgical** (≤1 helper or ≤1 edge file per phase).

### Phase H.2 — finish the cron heal (zero cost, ~10 lines SQL)
1. `CREATE OR REPLACE FUNCTION public.enqueue_pin_backfill_sweep_job(...)` — keep current re-entrancy guard and zero-candidate skip, but **add the missing `_cron_invoke_edge('backfill-article-pins', jsonb_build_object('job_id', v_job_id::text, 'only_zero_pin', true, 'chunk_size', p_chunk, 'limit', p_limit))` call** before `RETURN v_job_id;`. Mirrors the OG helper exactly.
2. Smoke-test by calling the helper once from SQL editor; expect `srangam_admin_jobs.heartbeat_at` to start ticking within 30 s and `srangam_article_pins` rows to appear.
3. Add a one-line note to `docs/CRON_OPS_PLAYBOOK.md` "Phase H change log" recording the regression and fix.

### Phase P — Puranic idempotency (zero cost, fully reversible)
1. **Archive first**: `CREATE TABLE srangam_purana_references_dedup_archive_20260606 AS SELECT * FROM srangam_purana_references;` (preserves all 69 rows untouched).
2. **Normalize**: `UPDATE srangam_purana_references SET adhyaya = NULL WHERE adhyaya IN ('','Not mentioned');`
3. **Soft-dedupe**: delete rows whose `id` is not the `MIN(id)` per `(article_id, purana_name, reference_text, COALESCE(adhyaya,''))` group. Expected delta: 69 → 50 rows; confirm with a SELECT before commit.
4. **Constraint**: `ALTER TABLE srangam_purana_references ADD CONSTRAINT srangam_purana_references_dedup_key UNIQUE (article_id, purana_name, reference_text, adhyaya);`
5. **Edge function**: change `supabase/functions/extract-purana-references/index.ts` line ~242 from `.insert(refsToInsert)` to `.upsert(refsToInsert, { onConflict: 'article_id,purana_name,reference_text,adhyaya', ignoreDuplicates: true })`. Add an optional `only_unextracted` request flag that filters the article list to `id NOT IN (SELECT article_id FROM srangam_purana_references)` for resumable batch runs.

### Phase B — Bibliography AI fallback (≈$1 one-time spend, opt-in toggle)
1. In `supabase/functions/backfill-bibliography/index.ts`, after the regex pre-pass: if `parsedEntries.length < 3` and request body has `ai_fallback: true`, call `aiExtractCitations` from `_shared/ai-provider.ts` (same provider chain as Puranic extractor: Gemini → OpenAI). Use the same 25 k char cap and 60 s timeout invariants from Phase G1+G2.
2. Cost ceiling: ~$0.02/article × 42 remaining articles ≈ $0.84. Hard-cap at 50 articles/run.
3. No automation — admin manually triggers from `/admin/article-management` with the new "Try AI fallback" checkbox. Curation, not expansion.

## 5. Out of scope (deliberately deferred)

- `/admin/ops` dashboard (Phase O) — useful but not surgical; this audit can be re-run manually with the playbook query until P+H.2 land.
- Watchdog tuning — current 5-min window is fine once helper actually POSTs.
- Term enrichment 5xx investigation — separate ticket; jobid 7 is delivering work, just downstream-failing on 2 specific slugs.
- OG nightly verification — needs a separate query of `og_image_status` history before claiming healthy/sick.

## 6. Approval menu

- **`approve H.2`** — finish the pin-enrichment heal tonight; share 03:00–04:00 UTC three-source proof tomorrow before touching Puranic data.
- **`approve H.2 + P`** — heal cron + Puranic idempotency in one window. P is zero-cost and archived; pauseable after step 3 (archive + normalize) for you to inspect row counts before constraint commit.
- **`approve all`** — H.2 → P → B in order, with two checkpoints: (a) after H.2 deploys, await morning verification; (b) after P step 3, share `SELECT COUNT(*) FROM srangam_purana_references` (expect 50) before adding constraint.
- **`hold on P`** — discuss the `adhyaya` normalization rule (treat `"Not mentioned"` as NULL vs. preserve verbatim) before any data write.

No tool calls beyond plan and read-only SQL have been run for this audit.
