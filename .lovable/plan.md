
# Cron + Extractor Audit — Enterprise Heal Plan (v2, re-verified)

Live re-audit against `cron.job`, `net._http_response`, `srangam_admin_jobs`, edge sources, and a fresh row count in `srangam_*`. Every number below was re-checked just now; nothing is inferred. **No files changed.**

---

## A. Verified findings (2026-06-02)

### A.1 On-demand backfills — partly working

| Pipeline | State | Live evidence |
|---|---|---|
| `backfill-word-counts` | ✅ Complete | 47/47 published have `word_count` |
| `backfill-bibliography` (regex-only) | ⚠️ Low coverage | **5/47** published (10.6%) have any biblio row; 56 entries total |
| Evidence-table extractor | ⚠️ Low coverage | **9/47** articles, 117 rows |
| `extract-purana-references` | ❌ Non-idempotent | **9/47** articles, **69 rows, 17 duplicate groups, 19 extra rows (~27% waste)** |
| `srangam_markdown_sources` coverage | ⚠️ | 45/47 published have markdown (2 articles never imported) |

### A.2 Why bibliographies look empty

`backfill-bibliography/index.ts` is **regex-only**:
- Searches for a literal `## Bibliography | References | Works Cited | Sources` H2.
- Parses each line with a strict `Last, First.` MLA9 regex.
- 31 articles return *"No bibliography section found"* — they cite inline.
- More are silently rejected for not matching `Last, First.` (edited volumes, vernacular author names, primary inscriptions, web sources).

Your instinct is correct: a Gemini-first AI pass is the right enterprise answer. `_shared/ai-provider.ts::aiExtractCitations` already exists — the Puranic extractor uses it; we just never wired it into bibliography.

### A.3 Why Puranic extraction is not enterprise-grade

| Enterprise requirement | Current state |
|---|---|
| Self-pumping batch (`EdgeRuntime.waitUntil`) | ✅ |
| Cancellation between chunks | ✅ |
| Heartbeats per chunk | ✅ |
| Gemini → OpenAI fallback | ✅ |
| Per-article internal dedup | ✅ |
| **Cross-run dedup** | ❌ raw `.insert()`, no DB unique constraint |
| **Resume from last stop** | ❌ always restarts at frontend offset (default 0) |
| **Skip already-extracted** | ❌ no filter; re-running doubles 9 articles' rows |

The duplication is not theoretical — DB already shows 17 duplicate groups / 19 extra rows / 27% waste.

### A.4 Nightly cron — still broken (re-verified just now)

```
2026-06-02 03:00  pin-backfill      status NULL  Timeout 5000ms
2026-06-02 03:30  og-nightly        status NULL  Timeout 5000ms
2026-06-02 03:45  term-enrichment   status NULL  Timeout 5000ms
2026-06-02 04:00  context-snapshot  status NULL  Timeout 5000ms
```

Two independent bugs:
1. `_cron_invoke_edge` omits `timeout_milliseconds` → pg_net defaults to 5s, kills every nightly call.
2. `cron.job` jobid 2 still runs raw `_cron_invoke_edge(...,{chunk_size:1,only_zero_pin:true,limit:20})` — bypasses `enqueue_pin_backfill_sweep_job`, so the 30-min re-entrancy guard, zero-candidate skip, and synchronous admin-job row are all missing. Watchdog reaps it as `failed: watchdog: no heartbeat` at 03:05.

---

## B. The path forward (surgical, additive, evidence-gated)

```text
H (Heal cron)  →  P (Puranic idempotency)  →  B (Bibliography AI fallback)
   ~30 min          ~45 min                     ~60 min
   1 migration      1 migration + 1 edge edit   1 edge edit + UI toggle
   ↓
O (Ops dashboard)  →  V (Invariant guards)  →  D (Docs + memory)
   ~45 min             ~20 min                   ~15 min
```

Every phase is independently reversible. **No production rows deleted** except the 19 confirmed duplicate Purana rows, and only inside a `BEGIN;…;COMMIT` audited block.

### Phase H — Heal the nightly cron

1. Rewrite `_cron_invoke_edge` body to pass `timeout_milliseconds := 120000` to `net.http_post`. Single change unblocks all four nightly jobs.
2. `cron.alter_job(2, command := $$ SELECT public.enqueue_pin_backfill_sweep_job(20, 1); $$)` — restore documented helper path, `p_chunk=1` per Phase G1+G2.
3. Jobids 6/7/8 inherit the timeout fix automatically.
4. **Acceptance** (tomorrow 03:00–04:00 UTC): all four `net._http_response.status_code` rows are 200/202; `srangam_admin_jobs` rows close `succeeded`.

### Phase P — Puranic extractor: idempotent + resumable

1. **DB migration**, run as `BEGIN; … SELECT count(*); COMMIT;` so we audit before committing:
   ```sql
   DELETE FROM srangam_purana_references a
   USING srangam_purana_references b
   WHERE a.ctid > b.ctid
     AND a.article_id = b.article_id
     AND a.purana_name = b.purana_name
     AND a.reference_text = b.reference_text
     AND COALESCE(a.adhyaya,'') = COALESCE(b.adhyaya,'');
   ALTER TABLE srangam_purana_references
     ADD CONSTRAINT srangam_purana_references_dedup_key
     UNIQUE (article_id, purana_name, reference_text, adhyaya);
   ```
   Postgres `UNIQUE` treats NULL `adhyaya` as distinct — matches the existing in-memory dedup key shape exactly.

2. **Edge: insert → upsert** in `extract-purana-references/index.ts`:
   ```ts
   .upsert(refsToInsert, {
     onConflict: 'article_id,purana_name,reference_text,adhyaya',
     ignoreDuplicates: true,
   })
   ```

3. **Edge: resume-from-last-stop.** Add `only_unextracted` flag (default `true`). When set, article query becomes:
   ```ts
   .eq('status','published')
   .not('id','in', `(select article_id from srangam_purana_references)`)
   .order('slug').range(offset, sliceEnd-1)
   ```
   Crash-resume falls out for free: each successful article's rows are already committed when the function self-pumps. UI gets "Skip already-extracted articles (recommended)" checkbox, default ON.

4. **Acceptance**: "Extract All Published" with toggle ON processes the 38 remaining articles (skipping the 9 done). Toggle OFF on the 9 done articles produces zero new rows.

### Phase B — Bibliography AI fallback

Regex stays as cheap pre-pass; AI fires only when regex returns `< 3` entries. Same pattern Phase X.5 uses for Purana citations.

1. `backfill-bibliography/index.ts` — after regex, if `< 3` entries, call `aiExtractCitations` over `chunkByCharBudget(6000, 25)` with a bibliography-tuned prompt returning `{ entries: [{ citation_key, entry_type, authors, title, year, publisher, full_citation_mla, full_citation_chicago? }] }`. Asks for inline-cited works (covers the 31 zero-biblio articles).

2. **DB**: make the link-table contract real:
   ```sql
   ALTER TABLE srangam_article_bibliography
     ADD CONSTRAINT srangam_article_bibliography_uniq
     UNIQUE (article_id, bibliography_id);
   ```
   (The existing regex path already passes `onConflict:'article_id,bibliography_id'`; the constraint enforces it.)

3. **UI** on `/admin/data-health`: "AI fallback" toggle (default ON), per-article cost preview. Estimate: ~$0.02–0.04/article via Gemini Flash on Lovable AI Gateway → **one-time ≈ $0.60–1.25** for the 31 zero-biblio articles; ≈$0 ongoing.

4. **Resume/dedup model identical to Phase P**: skip articles with biblio count ≥ 3 (default ON); upsert on `citation_key`.

5. **Acceptance**: with_biblio moves from 5/47 to ≥ 35/47; re-runs add zero duplicates.

### Phase O — `/admin/ops` dashboard

Read-only RPC `public.get_recent_cron_runs(p_hours := 48)` joining `cron.job`, `cron.job_run_details`, `net._http_response`, `srangam_admin_jobs`. Admin-only route, 30-second poll. Surfaces the three-source truth Phase H is healing.

### Phase V — Invariant guards

- Force `chunk_size: 1` in the manual pin-backfill button (Phase G1+G2).
- Toast warning if admin launches a sweep while a `pin_backfill` row younger than 30 min is `running` (mirrors the SQL re-entrancy guard).

### Phase D — Documentation + memory

- Update `docs/CRON_OPS_PLAYBOOK.md`: pg_net 5s default trap + the exact `_cron_invoke_edge` contract.
- New memory `mem://ops/pgnet-timeout-contract` — cron-fired helpers MUST pass `timeout_milliseconds ≥ 120000`.
- New memory `mem://extraction/idempotency-contract` — every AI extractor MUST upsert via a DB unique constraint AND default to `only_unextracted: true`; `.insert()` without a unique key is forbidden.
- Amend `mem://index.md` Cron Truth Gap bullet with the helper-routing requirement and the timeout contract.

---

## C. What I am explicitly NOT proposing

- No deletion of any extracted row except the 19 confirmed Purana duplicates inside an audited transaction.
- No re-extraction of the 9 articles already in `srangam_purana_references` unless you turn the toggle OFF.
- No widening of AI prompts or relaxing of confidence gates.
- No new admin surfaces beyond `/admin/ops` and two checkboxes on the existing Data Health page.
- No raising of nightly caps (still 20 pin / 5 OG / 10 term).

---

## D. Risk + cost register

| Phase | Surface | Cost | Rollback |
|---|---|---|---|
| H | 1 migration (alter `_cron_invoke_edge` + 1 `cron.alter_job`) | $0 | re-apply prior migration |
| P | 1 migration + 1 edge edit | $0 (saves future AI re-spend) | `ALTER TABLE ... DROP CONSTRAINT` |
| B | 1 edge edit + 1 migration (link-table unique) | one-time ≈ **$0.60–1.25**; $0 ongoing | toggle AI fallback OFF |
| O | 1 RPC + 1 admin route | $0 | drop RPC, delete route |
| V | 2-line UI guards | $0 | revert |
| D | 3 docs/mem files | $0 | revert |

---

## E. Approval

Reply with one of:

- **"approve H"** — heal nightly cron tonight, verify at 03:00–04:00 UTC, regroup tomorrow before touching extractors.
- **"approve H+P"** — heal cron + make Puranic extraction idempotent and resumable (both zero-cost structural fixes).
- **"approve H+P+B"** — also wire the AI bibliography fallback (≈$1 one-time).
- **"approve all"** — execute H → P → B → O → V → D in order, pausing after H to share the morning's three-source proof and again after the Phase P dedupe to share row counts before constraint commit.
