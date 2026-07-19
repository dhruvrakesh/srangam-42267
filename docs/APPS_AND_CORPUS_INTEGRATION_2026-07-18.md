# Srangam — Apps & Sanskrit Corpus Integration Plan

**Date:** 2026-07-18 · **Status:** authoritative for the apps/corpus tracks; companion to

> **Decision 2026-07-18 (maintainer):** the wisdomlib → automaton → English pipeline is a
> **local affair first** — Tracks C1–C3 plus the local review loop are the current scope,
> honed via the local consoles (automaton dashboard + pipeline console phases 0–4).
> Tracks A (public app windows) and B (Supabase corpus publishing, reader page) are
> **deferred, not cancelled**: the B1 migration file and `publish_srangam.py` are delivered
> and tested but sit inert on disk until the corpus and apps are honed and running.
> Nothing in the local scope depends on them.
`ENTERPRISE_MASTER_PLAN_2026-07-12.md` (which remains authoritative for site Phases 1–6).
Nothing here conflicts with, reorders, or blocks the master plan; every track below is
**additive** and honours the same working agreement (one concern per commit; verification
gate before commit; no live-DB write without review; telemetry before deletion; preserve
Part-1 strengths).

**Provenance.** Written after reading, on 2026-07-18: the srangam repo docs
(`CURRENT_STATUS.md`, `ENTERPRISE_MASTER_PLAN_2026-07-12.md`, `ENTERPRISE_PATH_FORWARD…`,
`SANSKRIT_AUTOMATON.md`, `DATA_SOURCES.md`, README), `src/App.tsx`,
`src/pages/SanskritTranslator.tsx`, `src/pages/JyotishHoroscope.tsx`, the
`supabase/functions/` tree (30 functions enumerated); the automaton v2 repo
(`ARCHITECTURE.md`, `README.md`, `scripts/ingest_jsonl_fast.py`, `scripts/ocr_pdf.py`);
the panchang app (`app.py`, requirements); and the wisdomlib archive
(`scraper.py`, `crawl_state.json`, sample `pages/*/page.html|page.txt|meta.json`).
Claims needing the live Supabase DB or a running local service are marked **[LIVE-VERIFY]**.

---

## 0. Verified baseline (measured, not assumed)

### The three systems as they exist today

| System | Form | Key facts (verified 2026-07-18) |
|---|---|---|
| **Srangam site** | React/Vite + Supabase (Lovable), live at srangam.nartiang.org | Tools pages `/sanskrit-translator` and `/jyotish-horoscope` exist and are linked in nav, but are **static showcases**: CTAs are `mailto:research@srangam.app` "Request Access" links + GitHub links. No live tool behind either page. |
| **Sanskrit Automaton v2** | Local-first Flask (127.0.0.1:5057) + SQLite `context.db` + Tesseract + Gemini/OpenAI | Pipeline: OCR → Ingest → Translate → Export(HTML). Ingest contract: page-JSONL files `Doc_NNNN.jsonl`, records need only `"text"`; translations never overwritten on re-ingest. Cost ~$0.05/1K passages (Flash). Budget-capped. |
| **Panchang (Jyotish)** | Local Streamlit v11 + Swiss Ephemeris + OpenAI | Runs from `run.bat` in a venv. Not deployed anywhere. |
| **Wisdomlib archive** | `scraper.py` (requests+bs4, robots-respecting, resumable) + `wisdomlib_archive/` | **973 pages visited / 158,536 queued** (crawl_state.json). Queue is 67% `/definition/` dictionary entries (106,915); only 13,803 book-chapter pages queued, of which 5,895 look like Sanskrit source texts. 284 chapter pages already crawled. Content lives in `<div class="pageContent">` of `page.html`; `page.txt` includes nav boilerplate; `meta.json` has url/title/slug. |

### Documentation drift found (feeds master-plan Phase 6)

- `docs/SANSKRIT_AUTOMATON.md` (Phase 21, 2026-02-01) describes a **v1** repo layout
  (`sa.py`, `api.py` FastAPI, Railway/Render/Fly deployment) and a `sanskrit-analyze`
  edge function with Lovable-AI fallback. **No `sanskrit-analyze` function exists** in
  `supabase/functions/` (30 functions enumerated; none match), and automaton **v2** has no
  `api.py` — it is a deliberately local-first Flask dashboard. The doc describes an
  aspiration, not the current system. This plan supersedes its integration sections;
  the API contract it defines is reused in Track A2.
- `srangam_translation_queue` exists in the DB but has **0 rows** (per `CURRENT_STATUS.md`
  "scaffolded but unused") — Track B deliberately does *not* repurpose it (its shape
  targets article-translation workflow, not passage corpora).

### The core insight

The three systems already form a natural supply chain; none needs to change form:

```
wisdomlib_archive (crawler, resumable)        ← already running
      ↓  adapter (NEW, additive)
automaton v2  Ingest → Translate → Export     ← already running, unchanged
      ↓  publisher (NEW, additive)
Supabase (new srangam_text tables)            ← additive migration
      ↓  reader page (NEW, lazy route)
srangam users                                  ← site unchanged elsewhere
```

Local machine = factory · Supabase = warehouse · srangam = storefront · panchang = linked tool.

---

## Track A — Give srangam users access to the apps (present forms)

### A1 · Panchang app goes live behind the existing showcase page

The `/jyotish-horoscope` page already sells the tool; it just has nowhere to send people.

- **A1-a Deploy the Streamlit app as-is.** Streamlit Community Cloud or Hugging Face
  Spaces (both run `pyswisseph`). Move `.env` keys (OpenAI) into the host's secrets
  manager. Zero code changes to the app. *Gate:* app loads, computes a chart for a known
  birth-data test case, matches local output.
- **A1-b Surgical CTA swap.** In `JyotishHoroscope.tsx`, change the two "Request Access /
  Request Your Chart" mailto CTAs to the deployed app URL (`target="_blank"`). One
  component, no route/layout changes. *Gate:* `npm run build` + 35 tests green (Windows);
  visual spot-check of the page.
- **A1-c (optional, later) Embed.** Streamlit supports `?embed=true` for a chromeless
  iframe view inside a srangam page. Do this only after A1-a proves stable; it adds a
  CSP/frame-ancestors consideration. Not required for launch.

**Non-goal:** rewriting the jyotish engine as an edge function or React code. The
Streamlit app *is* the product; the site links to it.

### A2 · Sanskrit Translator page gets a live path (staged)

Today the page's schema.org markup calls it a WebApplication, but there is no application.
Two stages, both reversible:

- **A2-a Publish translations first (Track B).** The fastest honest win: the page gains a
  "Browse translated texts" CTA pointing at the new reader (B3) — real output from the
  real automaton, no new server surface. *Gate:* B3 shipped.
- **A2-b Live analyze endpoint (deferred until wanted).** The already-specified
  `sanskrit-analyze` edge function (`SANSKRIT_AUTOMATON.md` defines request/response,
  error codes SANSKRIT-E001–E006, admin-only gate, Lovable-AI fallback) can be built
  exactly to that spec, **admin-gated first** via the existing `_shared/auth-gate`
  pattern. The local automaton stays local; the edge function's fallback path (Gemini)
  serves approximate analysis without any Python deployment. Open to public only after
  cost telemetry. *Gate:* function unit test + admin-only access verified **[LIVE-VERIFY]**.

---

## Track B — Publish the automaton's corpus to srangam

### B1 · Additive schema (one migration, review before running)

Two new tables, `srangam_` prefix per convention, mirroring the automaton's own shape
(`docs` → `passages`), so the publisher is a dumb mirror, not a transformer:

```sql
-- srangam_texts: one row per translated document (book/section)
id uuid PK default gen_random_uuid()
doc_code      text UNIQUE NOT NULL        -- automaton docs.code, e.g. 'wl_buddha_carita_sanskrit'
title         text NOT NULL
category      text                        -- automaton docs.category, e.g. 'wisdomlib', 'mahabharata'
source_note   text                        -- provenance, e.g. 'Sanskrit source via wisdomlib.org archive'
passage_count int NOT NULL DEFAULT 0
published     boolean NOT NULL DEFAULT false
created_at / updated_at timestamptz

-- srangam_text_passages: one row per translated passage
id uuid PK
text_id       uuid NOT NULL REFERENCES srangam_texts(id) ON DELETE CASCADE
page_no       int NOT NULL
idx           int NOT NULL
sanskrit      text NOT NULL               -- passages.text (Devanagari)
iast          text                        -- passages.iast
translation   text NOT NULL               -- passages.translation
verse_ref     text
quality_score real
UNIQUE(text_id, page_no, idx)             -- publisher upsert key
```

RLS: public `SELECT` only where the parent text is `published`; writes require the
service role (publisher) or admin. **No existing table is altered.**
*Gate:* migration reviewed by you, applied via the normal migration path; RLS verified
with an anon query **[LIVE-VERIFY]**.

### B2 · Publisher script (new file in the automaton, nothing else touched)

`scripts/publish_srangam.py` in sanskrit-automatonv2: reads `context.db`
(`docs` ⋈ `passages` on `doc_id`, only rows with non-empty `translation` — the
column names and join verified against `ARCHITECTURE.md`'s gotchas), upserts to
Supabase REST (`on_conflict=text_id,page_no,idx`) using `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY` from the automaton's `.env`. `--doc`, `--dry-run`,
`--publish/--unpublish` flags; batches of 500; respects `SA_SAFE_MODE` (refuses
destructive flags when set, consistent with house rules). Texts land **unpublished**;
you flip `published` after review — this is the "no unreviewed live-DB write" agreement
applied to content.
*Gate:* `--dry-run` row counts match a local SQL count; one doc published end-to-end and
spot-checked in the reader **[LIVE-VERIFY]**.

### B3 · Reader page (additive lazy route)

`/texts` (list of published texts, grouped by category) and `/texts/:docCode`
(passage reader: Devanagari + IAST + English, verse refs, page anchors). Lazy-loaded
route exactly like the existing 30+ (`React.lazy` in `App.tsx`), shadcn components,
no new dependencies — so Phase-1 bundle work is untouched. Add a "Texts" link beside the
existing Tools entries and the A2-a CTA on `/sanskrit-translator`.
*Gate:* `npm run build` + tests green; route loads with JS disabled-cache cold-load
under the Phase-4 size budget; SEO: canonical + ScholarlyArticle-adjacent schema later,
not blocking.

**Why not `srangam_articles`?** Articles are curated scholarly essays with multilingual
bodies, tags, cross-references, TTS. A 10,000-passage Mahābhārata dump does not belong in
that pipeline, would distort research stats (the Q1 count fix), search, and tag taxonomy.
Separate tables keep both clean; individual *essays about* the corpus can still be
articles.

---

## Track C — Wisdomlib corpus → automaton (the ultimate goal)

### C0 · Copyright stance (bright line, non-negotiable)

The **Sanskrit source texts** on wisdomlib are public domain; wisdomlib's **English
translations, summaries and commentary are their curated, copyrighted work**. Therefore:
the pipeline extracts and translates only Devanagari/dense-IAST source text; wisdomlib's
English renderings stay in the local archive as private reference/QA material and are
never published on srangam. The adapter enforces this by construction (its default mode
cannot emit English prose), and `srangam_texts.source_note` credits the archive origin.

### C1 · Point the crawler at the right pages first — `reprioritize_crawl.py` (DELIVERED)

Measured problem: the breadth-first queue is 67% dictionary `/definition/` entries; at the
crawler's polite 1.5 s delay that is ~44 hours of glossary pages before meaningful source
text. The delivered script (`D:\wisdomlib\reprioritize_crawl.py`) rewrites **only the
queue order** inside `crawl_state.json` (timestamped backup, `--dry-run` supported,
`--focus <slug>` to front-load one book); `scraper.py` itself is untouched and resumes
normally. Verified against the real state file: 5,895 source-text chapter pages and
7,908 other chapter pages move ahead of 106,915 definitions.

Operating cadence: run `scraper.py` in bursts (500 pages/run as configured); optionally
schedule nightly. Re-run the reprioritizer occasionally as new links are discovered.

### C2 · Archive → ingest JSONL — `wisdomlib_to_jsonl.py` (DELIVERED)

The delivered adapter (`sanskrit-automatonv2\scripts\wisdomlib_to_jsonl.py`) makes the
wisdomlib corpus a first-class automaton source **without OCR** and without touching any
existing script:

- Walks `pages/*/meta.json`, keeps only book URLs (`/{section}/book/{slug}[/d/docID.html]`),
  groups chapters by book, orders by wisdomlib doc id.
- Extracts `<div class="pageContent">` from `page.html` (bs4; falls back to boilerplate-
  stripped `page.txt`).
- Default `--mode sanskrit`: keeps only Devanagari-dominant / danda-marked / dense-IAST
  lines, grouped into verse blocks; skips book index pages (ToC noise) unless
  `--include-index`. English chapters (e.g. the Gyurme Dorje Guhyagarbha translation)
  yield zero records — verified.
- Emits `data/raw/wl_<book>_NNNN.jsonl` with records `{engine, page_no, text, meta{source_url,
  source_title, wisdomlib_doc_id, book_slug}, src_pdf:null}` — exactly the contract
  `ingest_jsonl_fast.py` parses (filename `_NNNN` page numbers; only `text` required).
  Doc codes are sanitized and digit-guarded so the page-number regex can't misfire.
- `--list-books`, `--dry-run`, `--book <substring>` for scoped runs.

Verified on the real archive samples + a synthetic Devanagari chapter: contract checks
(filename parse, non-empty text, UTF-8 JSONL) all pass; English-only pages excluded.

### C3 · Then the existing pipeline runs unchanged

```bat
python scripts\wisdomlib_to_jsonl.py --archive D:\wisdomlib\wisdomlib_archive
python scripts\ingest_jsonl_fast.py --doc wl_<book> --glob "data/raw/wl_<book>_*.jsonl" --category wisdomlib
REM translate + export via the dashboard as usual (Flash bulk / Pro priority)
python scripts\publish_srangam.py --doc wl_<book>          (Track B2, once built)
```

Ingest's verse segmentation, IAST, and quality scoring apply as with OCR input — but with
no OCR errors, so quality scores should run higher and the skip-list smaller. Costing at
the documented rates: even 100K wisdomlib passages ≈ **$5 on Gemini Flash**; the existing
budget-cap machinery covers it. Re-runs are safe: re-ingest never clobbers translations.

---

## Sequencing (respects the master plan)

| Order | Step | Depends on | Risk to live site |
|---|---|---|---|
| 1 | C1 reprioritize crawl + resume crawling | nothing | none (local) |
| 2 | C2 adapter → ingest → translate first books | C1 partially (works on 284 chapters today) | none (local) |
| 3 | A1-a deploy panchang | nothing | none (external host) |
| 4 | A1-b CTA swap | A1-a | trivial, gated |
| 5 | B1 migration (reviewed) | nothing | low (additive, RLS'd) |
| 6 | B2 publisher, first doc unpublished → reviewed → published | B1, step 2 | low (new tables only) |
| 7 | B3 reader + A2-a CTA | B1/B2 | low (lazy route), gated |
| 8 | A2-b analyze endpoint | demand signal | medium — deferred |

Master-plan Phase 2 (search unification etc.) proceeds independently; the only shared
surface is `App.tsx` route additions (B3, one commit) and two CTA edits (A1-b/A2-a, one
commit each). All site commits run the standard Windows gate: `npm run build` + unit tests
before commit; nothing lands on agent claims alone.

## Risk register

- **Bridge/desktop edits to live repo** — all site changes are small named commits with
  stated rollback; no schema change outside a migration; no static source removed (the
  telemetry-before-deletion rule is untouched).
- **Corpus quality** — AI translation of śāstric text is fallible; that is why B2 lands
  everything `published=false` and the reader displays source + IAST alongside the
  translation with a visible "AI-assisted translation, under review" note (add to B3).
- **wisdomlib load** — keep the crawler's 1.5 s delay and robots.txt respect; bursts of
  ≤500 pages; the reprioritizer reduces *total* pages needed, it does not speed requests.
- **Duplicate ingestion** — adapter doc codes are deterministic (`wl_<book>`); re-runs
  upsert. If a book is later re-crawled with more chapters, re-run adapter + ingest; new
  pages append, existing translations survive.
- **Panchang hosting limits** — Streamlit free tiers sleep on idle; acceptable for launch.
  If usage grows, move to a small always-on host; the site only holds a URL either way.

## Deliverables in this drop (2026-07-18)

1. `sanskrit-automatonv2\scripts\wisdomlib_to_jsonl.py` — adapter (tested).
2. `D:\wisdomlib\reprioritize_crawl.py` — crawl queue reprioritizer (tested, dry-run).
3. This document (`docs/APPS_AND_CORPUS_INTEGRATION_2026-07-18.md`).

Next builds, in order: B1 migration draft for your review → B2 `publish_srangam.py` →
B3 reader page + the two CTA commits.
