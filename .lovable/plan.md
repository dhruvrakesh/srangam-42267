
# Phase H.1 (Revised): Tests, Render-Time Sanitiser, Observability

Three additions, but **corrected** for what actually exists in the codebase. Verified by direct inspection — every wire-in point below was confirmed.

## Corrections to the prior plan

| Prior plan said | Reality | Corrected target |
|---|---|---|
| Wire sanitiser into `useDynamicSEO.ts` | That hook just calls an edge function; never touches `<meta>` tags. | Wire into `OceanicArticlePage.tsx` (`<Helmet>` block at lines 136–153) and the edge functions `generate-article-og` and `generate-article-seo`. |
| Only patch `markdown-to-article-import` | A second importer exists: `batch-import-from-github`. Same defect surface. | Run `runImportPipeline` in **both** importers — same one-line addition. |
| `process.env.NODE_ENV` flag in MermaidBlock | Vite uses `import.meta.env.DEV`. | Use `import.meta.env.DEV`. |
| Frontend sanitiser is untested | Pure regex, easy to test, but no vitest harness exists yet. | Co-locate frontend sanitiser tests in the **Deno** test file (the regexes are identical strings; we test them once against both importer-side and frontend-side fixtures). Avoids spinning up vitest for one file. |

These are not nits — each one was a hole that would have let artefacts through.

---

## Enterprise Patterns We're Modelling On

| Reference | Pattern adopted | Where it applies |
|---|---|---|
| **OpenTelemetry semantic conventions** for log records (`event.name`, `duration_ms`) | Single stable JSON log shape; never log free-form strings for events that may be queried. | `{ evt, stage, ms, ts, ... }` line per stage. Future swap to OTLP / `srangam_event_log` is a one-line change. |
| **Pandoc / Quarto filter pipelines** | Same pure stages, same logging shape, regardless of which importer invokes them. | Both `markdown-to-article-import` AND `batch-import-from-github` call the same `runImportPipeline` and emit the same `import_stage` lines. |
| **Defence-in-depth (NIST SP 800-160)** | Sanitise both at *ingest* and *render*. Either layer can regress without users seeing artefacts. | Importer (`stripExportArtifacts`) + frontend (`textSanitizer`) + edge SEO functions. |
| **Web Vitals + `PerformanceObserver`** (Chrome team docs) | Use `performance.measure()` so DevTools / Lighthouse / RUM tools see the timing natively. | `MermaidBlock` emits `mermaid:<id>` measures; no custom observer needed. |

---

## 1. Deno Tests for the Pipeline (and Frontend Mirror)

**New file:** `supabase/functions/markdown-to-article-import/pipeline_test.ts`

Pure-function tests against `_shared/markdown-pipeline.ts`. No network, no DB, no Supabase imports. Run via `supabase--test_edge_functions`.

Coverage matrix (15 tests):

| # | Behaviour |
|---|---|
| 1 | Already-fenced ```mermaid passes through unchanged (idempotent on fences) |
| 2 | Unfenced `flowchart TD` block → wrapped in ```mermaid fence |
| 3 | Unfenced `graph LR` block → wrapped |
| 4 | Unfenced `sequenceDiagram` block → wrapped |
| 5 | Block ends correctly at next markdown heading (`^#`) |
| 6 | Block ends correctly at next prose paragraph after blank line |
| 7 | Literal `\n` inside node label → `<br/>` |
| 8 | PUA-wrapped `\uE200cite\uE201turn17view0\uE202` runs removed |
| 9 | Bare `citeturn26view0` token removed |
| 10 | Stray PUA chars removed |
| 11 | `Suggested caption: **X.**` → `*Caption:* **X.**` |
| 12 | Trailing `  1\n` footnote-anchor digit removed |
| 13 | `runImportPipeline(runImportPipeline(x)) === runImportPipeline(x)` (full idempotency) |
| 14 | Real Jakhbar excerpt (inline string from screenshot) cleans correctly |
| 15 | Pipeline never strips legitimate code fences (` ```ts`, ` ```bash`) |

Tests use `Deno.test` + `https://deno.land/std/assert/mod.ts`.

## 2. Render-Time Sanitiser — `src/lib/textSanitizer.ts`

```ts
export function stripExportArtifacts(input: string): string;
export function sanitizeSnippet(html: string, maxLen?: number): string;
```

Identical regex set to the importer's `stripExportArtifacts`. Comment in the file explicitly references the canonical source so the two stay in lockstep.

**Wire-in points (corrected, all verified):**

| Surface | File | Change |
|---|---|---|
| Article `<meta name="description">`, OG description, JSON-LD | `src/components/oceanic/OceanicArticlePage.tsx` line 444–446 (where `description` is computed from `article.abstract`) | Wrap with `sanitizeSnippet(...)` |
| Search-result excerpts | `src/hooks/useSearchArticles.ts` lines 88, 111 (`extractText(result.article.dek)`) | Wrap `extractText` output with `stripExportArtifacts(...)` |
| Server-generated OG images | `supabase/functions/generate-article-og/index.ts` — wherever the title/description string is composed | Apply `stripExportArtifacts` (duplicate the regexes inline; edge fns can't import from `src/`) |
| Server-generated SEO meta | `supabase/functions/generate-article-seo/index.ts` — same | Same |
| Sitemap meta (if any text leaks through) | `supabase/functions/generate-sitemap/index.ts` | Same |

For the edge functions, factor the four regexes into `supabase/functions/_shared/text-sanitizer.ts` so they share the **same source of truth** as the importer pipeline (re-exported from `markdown-pipeline.ts`'s `stripExportArtifacts`). Frontend mirrors them once in `src/lib/textSanitizer.ts` (with a comment pointing back to the canonical edge file).

## 3. Importer Observability — Both Importers

**Edits:**
- `supabase/functions/markdown-to-article-import/index.ts`
- `supabase/functions/batch-import-from-github/index.ts`

Add a tiny shared helper in `supabase/functions/_shared/observability.ts`:

```ts
export async function stage<T>(
  name: string,
  meta: Record<string, unknown>,
  fn: () => T | Promise<T>,
): Promise<T> {
  const t0 = performance.now();
  try {
    const v = await fn();
    console.log(JSON.stringify({
      evt: 'import_stage', stage: name, ms: Math.round(performance.now() - t0),
      ok: true, ts: new Date().toISOString(), ...meta,
    }));
    return v;
  } catch (e) {
    console.log(JSON.stringify({
      evt: 'import_stage', stage: name, ms: Math.round(performance.now() - t0),
      ok: false, error: String(e), ts: new Date().toISOString(), ...meta,
    }));
    throw e;
  }
}
```

Wrap six stages in `markdown-to-article-import`:

| Stage | Logged as |
|---|---|
| `runImportPipeline(markdownContent)` | `pipeline_clean` |
| `extractFrontmatter(cleaned)` | `frontmatter` |
| `marked.parse(content)` | `marked_parse` |
| `extractCitations + extractCulturalTerms` | `metadata_extract` |
| Article upsert | `db_upsert` |
| Cross-references + bibliography | `xref_bib` |

**Final summary line:** `{ evt: 'import_complete', slug, total_ms, word_count, citations, terms, mermaid_blocks, lang }`. `mermaid_blocks` is computed cheaply by counting ```mermaid fences in the cleaned markdown — directly answers "did diagram repair fire on this article?"

**Log-shape contract** documented in `docs/RELIABILITY_AUDIT.md` so future tooling (a dashboard, an alerting rule, the queued `srangam_event_log` table) can rely on the field names.

`batch-import-from-github` reuses the same `stage()` helper and gets a per-file `import_stage` + per-batch `batch_complete` summary for free.

**Verification:** I'll fetch logs via `supabase--edge_function_logs` after deploy to confirm the structured lines appear.

## 4. MermaidBlock Render-Latency Instrumentation

**Edit:** `src/components/articles/enhanced/MermaidBlock.tsx`

```ts
const t0 = performance.now();
performance.mark(`mermaid:${id}:start`);

import('mermaid').then(({ default: mermaid }) => {
  const importMs = performance.now() - t0;
  performance.mark(`mermaid:${id}:imported`);
  mermaid.initialize({ /* ... */ });
  return mermaid.render(`mermaid-${id}`, chart).then(({ svg }) => {
    const totalMs = performance.now() - t0;
    performance.mark(`mermaid:${id}:rendered`);
    performance.measure(`mermaid:${id}`, `mermaid:${id}:start`, `mermaid:${id}:rendered`);
    performance.measure(`mermaid:${id}:import`, `mermaid:${id}:start`, `mermaid:${id}:imported`);
    performance.measure(`mermaid:${id}:render`, `mermaid:${id}:imported`, `mermaid:${id}:rendered`);

    if (import.meta.env.DEV || (window as any).__SRANGAM_PERF__) {
      console.info('[mermaid]', {
        id,
        importMs: Math.round(importMs),
        renderMs: Math.round(totalMs - importMs),
        totalMs: Math.round(totalMs),
        chartChars: chart.length,
      });
    }
    setSvg(svg);
  });
});
```

Why three marks instead of one: it cleanly separates "the mermaid bundle took N ms to download" (network/cache) from "this specific diagram took M ms to lay out" (chart complexity). RUM tools (Datadog, New Relic, Sentry Performance) all read `performance.measure` natively — no custom integration needed.

`window.__SRANGAM_PERF__` toggle lets ops enable verbose logs in production from DevTools without a redeploy.

## 5. Bundle-Impact Verification (documented, not enforced)

**Edit:** `docs/RELIABILITY_AUDIT.md` — add a "Bundle budget — Phase H" section:

- `mermaid` MUST appear in a code-split chunk (verify with `grep -l mermaid dist/assets/*.js` after `vite build`).
- The main entry chunk MUST NOT contain `mermaid` (verify with `grep -L mermaid dist/assets/index-*.js`).
- Articles without diagrams MUST NOT trigger a network request matching `/mermaid/` (verify in DevTools Network panel; documented as a manual review step).

No CI gate added in this phase — the value of the documentation is to make a future regression visible in code review.

---

## Files Changed

| File | Change | Risk |
|---|---|---|
| `supabase/functions/_shared/observability.ts` | NEW — shared `stage()` helper with structured log shape | None |
| `supabase/functions/_shared/text-sanitizer.ts` | NEW — re-exports `stripExportArtifacts` from `markdown-pipeline.ts` for use by other edge fns | None |
| `supabase/functions/markdown-to-article-import/pipeline_test.ts` | NEW — 15 Deno tests | None (test-only) |
| `supabase/functions/markdown-to-article-import/index.ts` | Wrap 6 stages in `stage()`; emit `import_complete` summary; count `mermaid_blocks` | Low |
| `supabase/functions/batch-import-from-github/index.ts` | Call `runImportPipeline` per file; reuse `stage()` helper | Low |
| `supabase/functions/generate-article-og/index.ts` | Sanitise title/description before render | Low |
| `supabase/functions/generate-article-seo/index.ts` | Sanitise generated meta-description | Low |
| `supabase/functions/generate-sitemap/index.ts` | Sanitise any free-text lifted into the sitemap | Low |
| `src/lib/textSanitizer.ts` | NEW — `stripExportArtifacts`, `sanitizeSnippet` | Low |
| `src/components/oceanic/OceanicArticlePage.tsx` | Sanitise `description` used in `<Helmet>` (line 444 area) | Low |
| `src/hooks/useSearchArticles.ts` | Sanitise excerpt at lines 88, 111 | Low |
| `src/components/articles/enhanced/MermaidBlock.tsx` | Three `performance.mark`s + two `measure`s + opt-in `[mermaid]` console line; fix `import.meta.env.DEV` | Low |
| `docs/RELIABILITY_AUDIT.md` | Log-shape contract + bundle-budget invariants | Zero |
| `.lovable/plan.md` | Phase H.1 status | Zero |

## What This Does NOT Do

- No DB schema changes (no `srangam_event_log` table created — logs to stdout only; field names match what that table will eventually use).
- No new dependencies.
- No vitest setup (frontend sanitiser shares Deno tests by virtue of being pure regex; isolating React testing is deferred).
- No SSR / mermaid prerender (Phase H.2).
- No CI gate — bundle budget is documented, not enforced.

## Verification Plan (executed in build mode)

1. `supabase--test_edge_functions { functions: ["markdown-to-article-import"] }` → 15/15 pass.
2. Re-import the Jakhbar `.md` with `overwrite=true`.
3. `supabase--edge_function_logs { function_name: "markdown-to-article-import", search: "import_stage" }` → see 6 stage lines + 1 `import_complete` with `mermaid_blocks ≥ 1`.
4. Open the article in preview:
   - Diagram renders via `<MermaidBlock>`, no box-glyphs.
   - Console (dev) shows `[mermaid]` line.
   - DevTools Performance panel shows `mermaid:<id>` measure on the timeline.
5. Search for the article — snippet contains no `cite`/`turn`/PUA residue.
6. View page source → `<meta name="description">` is clean.

## Why I'm Now Confident This Is the Enterprise Path

- **Single source of truth** for the artefact regexes (`_shared/markdown-pipeline.ts` → re-exported to other edge fns; mirrored once on the frontend with a back-reference comment).
- **Both importers patched** — no hidden sidecar that bypasses cleanup.
- **Both ingestion AND render layers sanitise** — defence-in-depth, not single-line-of-defence.
- **Standard observability primitives** (`performance.measure`, OTel-shaped JSON log lines) — interoperable with any future RUM/APM/log-aggregator without rework.
- **Tests live in the runtime that runs the code** (Deno) — no parallel JS test stack to maintain for one regex file.
- **Documentation** (log-shape contract, bundle budget, defence-in-depth invariant) so a future engineer cannot accidentally regress without a code-review challenge.
