# Markdown Import Pipeline — Code-Level Audit
**Date:** 2026-07-20
**Sources read (exact deployed source, staged from D:\srangam-42267):**
- `supabase/functions/markdown-to-article-import/index.ts` (37,807 bytes)
- `src/pages/admin/MarkdownImport.tsx` (35,591 bytes)

**Not yet read (referenced, flagged where relevant):** `_shared/markdown-pipeline.ts`, `_shared/observability.ts`, `_shared/error-response.ts`, `_shared/auth-gate.ts`.

This audit re-verifies the five weakness claims made earlier from documentation alone, now against the actual source. Two claims needed correction — the code is better than the docs in those places. Five new defects were found that the docs do not mention, two of them data-loss class.

---

## Part 1 — The five original claims, verified line-by-line

### Claim 1: "No atomicity — a failed import leaves partial state" — PARTLY CORRECTED, PARTLY CONFIRMED

**Corrected:** the article write itself IS atomic now. Phase C landed:
- `index.ts:687-695` — overwrite path uses `upsert(articleData, { onConflict: 'slug' })`, no SELECT-then-UPDATE race.
- `index.ts:704-713` — non-overwrite path catches Postgres `23505` and returns a structured `E_DUPLICATE` 409 with a hint.

**Confirmed:** everything after the article row is best-effort sequential writes whose failures are swallowed:
- `index.ts:736-743` — markdown-source upsert failure is only `console.error`'d; import proceeds.
- `index.ts:754-760` — chapter link insert result is **not checked at all**.
- `index.ts:793-796` — term lookup errors `continue` silently.
- `index.ts:956-958` — cross-reference insert failure is only logged.
- `index.ts:969-983` — response is `success: true` regardless; the only honest partial-failure signal is `markdownSourceSaved`.
- `index.ts:980` — `crossReferencesCreated: crossRefsToCreate.length` reports the **pre-dedup, pre-insert** count. If dedup removed rows (944-950) or the insert failed (952-957), the stat overstates reality.

Verdict: the pipeline is "article-atomic, satellite-lossy". A failed satellite step produces a green UI and an article missing its source/terms/links, with no record anywhere the admin can see.

### Claim 2: "Client-side progress is cosmetic" — CONFIRMED, worse than claimed

- `MarkdownImport.tsx:256-265` — six steps are created, step 1 set `in_progress`.
- `MarkdownImport.tsx:269-278` — a **single** `supabase.functions.invoke(...)` does all the work.
- `MarkdownImport.tsx:283` — on success every step flips to `complete` in one `setImportSteps(map)`. No polling, no per-step truth.
- `MarkdownImport.tsx:313-315` — on error, **step 1 is always marked as the failure** (`i === 0`), even if the real failure was the database insert (step 5). The progress card actively misleads during failures.

Additionally (new): two Import Options checkboxes are pure decoration —
- `autoDetectTerms` (tsx:97) and `createMarkdownSource` (tsx:98) are rendered as controls (tsx:683-702) but **never sent** in the request body (tsx:269-278). The server always extracts terms and always saves markdown regardless of what the admin unticks.

### Claim 3: "N+1 term upserts" — CONFIRMED, plus a race

- `index.ts:771-835` — sequential `for` loop over every cultural term: one `SELECT ... ilike ... maybeSingle()` (787-791) then either an `UPDATE` (800-803) or an `INSERT` (814-825). That is 2 round-trips per term, serialized. Thirty terms ≈ 60 awaited network calls inside one edge-function invocation.
- `index.ts:802` — `usage_count: existingTerm.usage_count + 1` is a read-modify-write; two concurrent imports lose increments.
- `index.ts:790` — `ilike(normalizedTerm)` does not escape `%`/`_`, so a term containing either becomes a wildcard match (low likelihood from italics, but unguarded).

### Claim 4: "O(N) cross-reference scan" — CONFIRMED, plus duplicate accumulation

- `index.ts:852-856` — fetches **every published article** (`id, slug, tags, theme, title` — title is the full multilingual JSONB) on every import; JS loop at 863. Cost grows linearly with the corpus forever.
- `index.ts:952-954` — cross-refs are a plain `insert`. Re-importing with "Overwrite existing" **re-creates all cross-refs without deleting the previous set**: either duplicates accumulate on every re-import, or (if a unique constraint exists) the whole batch insert fails and is silently swallowed per Claim 1. Old refs are never cleaned when tags/theme change.

### Claim 5: "Italics extraction captures plain English like 'Buddhist'" — CORRECTED

The deployed extractor is much better than IMPORT_WORKFLOW.md describes. `index.ts:223-304`:
- Length gates (255-264), section-header exclusions (234-243), stop-word prefix filter (246), punctuation filter (279),
- and crucially a **positive Sanskrit-marker requirement** (288-292): a term must carry IAST diacritics, Devanagari, or a whitelisted Sanskrit word before it is accepted.

Plain italic *Buddhist* is skipped ("no Sanskrit markers"). My earlier claim was wrong at code level; the workflow doc lags the code and should be updated.

**Residual noise, real but smaller:**
- The whitelist (290) contains generic English-adjacent words (`temple`, `yoga`, `ganga`…), so italic phrases like *Modern yoga practice* pass as one "term".
- The regex `[*_]([^*_\n]+)[*_]` (229) accepts mismatched delimiters (`*term_`) and fires on underscore-wrapped code identifiers.

---

## Part 2 — New findings (not in the original five)

### N1 — CRLF frontmatter bypass (needs one verification)
`index.ts:147` — `extractFrontmatter` regex is `/^---\n([\s\S]*?)\n---\n/`: it requires bare LF. A Windows-authored file with CRLF (`---\r\n`) will not match → the YAML is treated as body text → fallback frontmatter is generated from filename/H1 (308-376) → wrong title, wrong slug, YAML rendered into the article. Meanwhile the client preview (`tsx:124`) uses `/^---\s*\n/` which tolerates `\r` — so **the preview shows the metadata that the server will then ignore**. Verification needed: whether `runImportPipeline` (`_shared/markdown-pipeline.ts`, unread) normalizes line endings before this point. If it doesn't, this is the likeliest silent-misimport bug for a Windows workflow like yours.

### N2 — sequenceNumber is silently ignored
Client sends `sequenceNumber` (tsx:274). The server's `ImportRequest` (index.ts:118-126) doesn't include it, and the chapter link hardcodes `sequence_number: 1` (index.ts:759). The admin UI's "Sequence Number in Chapter" input (tsx:660-673) has no effect.

### N3 — Merge mode clobbers the original markdown source (data loss)
`index.ts:610-621` — merge path upserts `srangam_markdown_sources` with `onConflict: 'article_id'`. One row per article. Importing a Hindi translation for an existing English article **replaces the English markdown source with the Hindi markdown**. The original source of truth is gone after the first merge.

### N4 — Overwrite wipes existing translations (data loss)
`index.ts:667` — `content: { [targetLang]: htmlContent }` builds a **single-language** JSONB; `index.ts:688` upserts it, replacing the whole `content` column (same for `title`, `dek`). Re-importing the English article with "Overwrite existing" after Hindi/Punjabi translations were merged **deletes those translations**. Overwrite and merge are mutually destructive.

### N5 — Chapter links duplicate on re-import
`index.ts:754-760` — plain insert into `srangam_article_chapters` with no upsert/uniqueness handling; every overwrite re-import adds another link row.

---

## Part 3 — Revised enterprise plan (I-series)

Ordered by harm: data-loss guards first, honesty second, performance third, UX fourth. One concern per commit, build+gates on Windows before each, live-DB reads only until a migration is reviewed.

**I1 — Data-safety (fixes N3, N4; highest priority)**
- Overwrite path: fetch existing `title/dek/content` and deep-merge `{...existing, [targetLang]: new}` before upsert (or a small SQL RPC doing `content || excluded.content` JSONB merge). Never write a single-language JSONB over a multilingual row.
- `srangam_markdown_sources`: key on `(article_id, lang)` (migration: drop unique on article_id, add composite) so each language keeps its own source. Until the migration is reviewed, minimum surgical fix: in merge mode, upsert with a language-suffixed `file_path` and skip if it would replace a different language's content.

**I2 — Honest results and progress (fixes Claim 2 + the swallowed-failure half of Claim 1)**
- Server: collect per-step outcomes into `response.steps[]` (frontmatter, parse, article, markdown_source, chapter, terms, crossrefs — each `ok|failed` + error code). Stats report **actual inserted counts**, not attempted counts (fix index.ts:980).
- Client: render the progress card from `response.steps` instead of blanket-complete; drop the fake step-1-always-fails mapping. This is cheap (no polling infra needed) and truthful.
- Later (optional): journal each import into `srangam_admin_jobs` for cross-session history, consistent with the Phase H control plane.

**I3 — Batch the term writes (fixes Claim 3)**
- One `SELECT ... in (normalizedTerms)`, partition into existing/new, one bulk `insert` for new, and one RPC `increment_term_usage(term_ids uuid[])` doing `usage_count = usage_count + 1` atomically in SQL. ~60 round-trips → 3. Escape `%`/`_` or switch to `eq` on the normalized column.

**I4 — Error codes and partial-failure surface (formalizes Claim 1)**
- IMPORT-E001…E00x codes on every satellite step; `success: true, warnings: [...]` when satellites fail; UI shows amber "imported with warnings" instead of green.

**I5 — Input hygiene and doc sync (fixes N1, N2, N5, Claim 5 residue)**
- Normalize `\r\n` → `\n` at the very top of the pipeline (verify markdown-pipeline.ts first; add if absent). One line, kills the CRLF class.
- Honor `sequenceNumber` (add to ImportRequest, use at index.ts:759) — or remove the dead input.
- Chapter link: `upsert` on `(article_id, chapter_id)`.
- Cross-refs on overwrite: delete-then-insert for `source_article_id = articleId` (idempotent re-import).
- Wire or remove the two decorative checkboxes (autoDetectTerms, createMarkdownSource).
- Tighten italics regex to matched delimiters: `/\*([^*\n]+)\*|_([^_\n]+)_/g`; reconsider generic whitelist words.
- Update IMPORT_WORKFLOW.md to describe the deployed extractor (it is better than documented).

**Gate for every step:** `npm run build` + tests on Windows, [LIVE-VERIFY] against a scratch article slug (e.g. `import-selftest-2026`), never against real published articles until I1 ships.
