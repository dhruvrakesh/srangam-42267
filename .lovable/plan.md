
# Phase H (Revised): Diagram Pipeline Repair — Enterprise-Grade

## Enterprise Patterns We're Modeling On

Before prescribing changes, three production systems solving the same shape of problem — markdown in, scholarly diagram-rich HTML out:

| Reference system | Pattern we adopt | Where it applies here |
|---|---|---|
| **Docusaurus `@docusaurus/theme-mermaid`** ([docs](https://docusaurus.io/docs/markdown-features/diagrams/)) | Remark plugin recognises ` ```mermaid ` fences at parse-time → lazy-loaded React `<Mermaid>` theme component renders client-side. PR #9305 hardened async-render & theme switching. | Our `ProfessionalTextFormatter` already uses `react-markdown` + `rehype-raw`. We add a single `code` component override + a lazy `<MermaidBlock>`. Same shape, smaller surface. |
| **Quarto / Pandoc filter chain** ([Quarto docs](https://quarto.org/)) | Document processing is an **ordered, named filter pipeline** (pre-render → render → post-render), each step pure & individually testable. Lua filters carry the contract. | Our importer today is a 979-line procedural script. We refactor (in place, no new files) into a named pipeline: `sanitizeEscapes → stripExportArtifacts → normalizeDiagrams → extractFrontmatter → marked.parse → extractMetadata`. Each step a pure function, exported for unit reuse. |
| **Manubot** (scholarly markdown→HTML/PDF/JATS) | Citation placeholders use a **stable token grammar** (`@doi:…`, `@pmid:…`) resolved at build time, never leaked to readers; export artifacts are *errors*, not features. | Justifies aggressively stripping ChatGPT's `citeturn…` PUA placeholders and re-inserting clean MLA references through our existing bibliography parser, rather than trying to render them. |
| **GitBook Mermaid integration** | Mermaid block ships **with caption + alt text**, container reserves height to avoid CLS. | Our `<MermaidBlock>` ships with the same affordances (caption slot, `min-h`, ARIA description). |
| **`docusaurus-prerender-mermaid`** (community) | Pre-render diagrams to SVG at build/import time to fix CLS, SEO, a11y. | Phase H.2 (deferred): cache rendered SVG in `srangam_articles.diagram_cache` JSONB so re-visits skip the mermaid bundle entirely. Not in this phase. |

These are real, in-production OSS patterns — not speculation.

---

## Verified Root Causes (unchanged from prior plan, recap)

Confirmed by direct inspection of `markdown-to-article-import/index.ts`, `ProfessionalTextFormatter.tsx`, `package.json`, and the uploaded sample:

1. **No mermaid renderer exists** anywhere in the codebase. `react-markdown@10` + `rehype-raw` + `html-react-parser` are wired, but no `code` override for `language-mermaid`. Default fallthrough → `<pre><code>` plaintext.
2. **ChatGPT/Deep-Research export drops the ` ``` ` fences** around `flowchart`/`graph` blocks. The screenshot's bare `flowchart TD\n  Local["..."] --> ...` confirms it. The importer therefore never even sees a code block.
3. **OpenAI PUA citation placeholders** (`U+E000…U+F8FF` runs around `citeturnNviewN`) leak through and render as box-glyphs (□). `sanitizeEscapedMarkdown` only handles `\#`, `\*`, etc.

A 4th smaller defect surfaced on inspection: ChatGPT also leaks **`Suggested caption:` instructional lines** and **lone-digit superscripts** (residual footnote anchors after the citation gets stripped).

---

## Architectural Strategy

Two surfaces, both additive, both tenant-neutral:

```text
   ┌──────────────────────────── Importer (edge fn) ──────────────────────────┐
   │                                                                          │
   │   raw .md ──▶  sanitizeEscapes                                           │
   │            ──▶  stripExportArtifacts   (NEW: PUA, citeturn, captions)    │
   │            ──▶  normalizeDiagrams      (NEW: auto-fence mermaid)         │
   │            ──▶  extractFrontmatter                                       │
   │            ──▶  marked.parse  ──▶ HTML  (mermaid stays as <pre><code>)   │
   │            ──▶  extractMetadata (citations, terms, evidence)             │
   │            ──▶  UPSERT srangam_articles                                  │
   │                                                                          │
   │   Each step exported as a pure function from a new                       │
   │   supabase/functions/_shared/markdown-pipeline.ts                        │
   └──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
   ┌──────────────────────────── Renderer (frontend) ─────────────────────────┐
   │                                                                          │
   │   ProfessionalTextFormatter (oceanic)                                    │
   │      └─ customRenderers.code → if lang==='mermaid' → <MermaidBlock/>     │
   │                                                                          │
   │   <MermaidBlock>: lazy-import 'mermaid', theme-aware, CLS-safe,          │
   │                   error-boundary fallback to <pre><code>, ARIA label.    │
   └──────────────────────────────────────────────────────────────────────────┘
```

**Tenant awareness:** `OceanicArticlePage` (oceanic), `ArticlePage` (generic), and any future tenant route all flow through `srangam_articles.content`. The fix lives at the two narrowest points (one importer fn, one renderer override). No tenant-specific branching, no business-logic relocation.

---

## Implementation Plan

### Step 1 — Extract importer pipeline into named, pure stages
**Files:** `supabase/functions/_shared/markdown-pipeline.ts` (NEW), `supabase/functions/markdown-to-article-import/index.ts` (refactor in place).

Create `_shared/markdown-pipeline.ts` exporting:

```ts
export const sanitizeEscapes      = (s: string) => string;     // existing logic, moved
export const stripExportArtifacts = (s: string) => string;     // NEW
export const normalizeDiagrams    = (s: string) => string;     // NEW (auto-fence mermaid)
export const runImportPipeline    = (s: string) => string;     // composes the above in order
```

Pure functions, no side effects, no Supabase imports — so they can be reused by future importers (`batch-import-from-github`, a hypothetical DOCX bridge) and unit-tested in isolation.

**Risk:** low. Same logic, named differently. Pandoc-style filter contract.

### Step 2 — `stripExportArtifacts` (ChatGPT/Deep-Research cleanup)
- Drop PUA citation runs: `/[\uE000-\uF8FF]+(?:cite[\uE000-\uF8FF]*turn\d+\w+\d+[\uE000-\uF8FF]*)?/g` → `''`
- Drop bare `citeturn\d+(view|search|news)\d+` tokens.
- Convert ChatGPT's `Suggested caption: **X.**` lines under diagrams to `*Caption:* X.` (preserve the meaning, drop the meta-instruction tone).
- Strip residual lone-digit superscripts that survive citation removal: `/(\s)\d{1,2}\s*$/gm` only when the line was previously adjacent to a removed cite token (track via a sentinel during the same pass).
- Idempotent — safe to re-run on already-clean text.

### Step 3 — `normalizeDiagrams` (auto-fence + dialect normalisation)
Detect blocks beginning with one of:
`flowchart\s+(TD|LR|TB|RL|BT)`, `graph\s+(TD|LR|TB|RL|BT)`, `sequenceDiagram`, `classDiagram`, `stateDiagram(-v2)?`, `erDiagram`, `journey`, `gantt`, `pie`, `mindmap`, `timeline`, `quadrantChart`, `xychart-beta`.

A **block** = trigger line + subsequent lines until any of: blank line followed by a markdown heading (`^#`), end of document, or a new fenced code block opener.

If the block is **not already inside ` ``` ` fences**, wrap it in ` ```mermaid … ``` `. Track previously-seen fence state to keep this idempotent. Also normalise ChatGPT's literal `\n` inside node labels (e.g. `Local["Local node\nJakhbar"]`) — mermaid accepts `<br/>` but not `\n` literals; replace with `<br/>`.

### Step 4 — `<MermaidBlock>` component (frontend)
**New file:** `src/components/articles/enhanced/MermaidBlock.tsx`

```tsx
// pseudocode
const MermaidBlock = ({ chart, caption }) => {
  const [svg, setSvg] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);
  const isDark = useDarkMode();             // listens via MutationObserver on <html>
  const id = useId();

  useEffect(() => {
    let cancelled = false;
    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'neutral',
        securityLevel: 'strict',     // sanitises foreignObject / scripts
        fontFamily: 'inherit',
      });
      mermaid.render(`m-${id}`, chart)
        .then(({ svg }) => !cancelled && setSvg(svg))
        .catch(e => !cancelled && setError(e.message));
    });
    return () => { cancelled = true; };
  }, [chart, isDark, id]);

  if (error) return <FallbackPre code={chart} note="Diagram preview unavailable" />;
  return (
    <figure className="my-6 overflow-x-auto rounded-lg border bg-card p-4 min-h-[180px]"
            role="img" aria-label={caption || 'Diagram'}>
      {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} />
           : <div className="h-[180px] animate-pulse bg-muted/40 rounded" />}
      {caption && <figcaption className="mt-3 text-sm text-muted-foreground italic">{caption}</figcaption>}
    </figure>
  );
};
```

Notes derived from Docusaurus PR #9305:
- `mermaid.render` is async — never call sync `mermaid.init`.
- `securityLevel: 'strict'` is mandatory for user-derived content.
- Theme switch via re-render keyed on `isDark`.
- `min-h-[180px]` reserves space → eliminates the CLS issue called out by `docusaurus-prerender-mermaid`.

### Step 5 — Wire into `ProfessionalTextFormatter`
Single addition to `customRenderers`:

```ts
code({ inline, className, children, ...props }) {
  const lang = /language-(\w+)/.exec(className || '')?.[1];
  if (!inline && lang === 'mermaid') {
    return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
  }
  return <code className={className} {...props}>{children}</code>;
},
```

`SimplifiedMarkdownRenderer` is left untouched — it serves only legacy non-oceanic routes and uses regex-based markdown (no fenced-code support today). Parity flagged as Phase H.2 if usage warrants.

### Step 6 — Re-import, don't migrate
Existing rows containing unfenced flowchart text won't auto-heal — and a DB-side regex migration is risky on multilingual JSONB. Operator action:

1. Open the affected article in admin.
2. Re-upload the same `.md` source through the importer with `overwrite=true`.
3. Pipeline re-runs cleanly; diagram appears.

Document this in `docs/IMPORT_WORKFLOW.md`. The sample Jakhbar article is the first candidate.

### Step 7 — Documentation (load-bearing, per house philosophy)
- `docs/architecture/IMPORT_PIPELINE.md` — replace the procedural step-list with the named-filter diagram; add Steps 14–15 for `stripExportArtifacts` & `normalizeDiagrams`; record the Pandoc/Quarto modelling reference.
- `docs/RELIABILITY_AUDIT.md` — new invariant: *"Markdown importer MUST run the pure-function pipeline; PUA chars and unfenced mermaid MUST NOT reach `marked.parse`."*
- `docs/IMPORT_WORKFLOW.md` — re-import recipe + ChatGPT/Deep-Research source caveats.
- `docs/ARTICLE_DISPLAY_GUIDE.md` — document mermaid block authoring + caption convention.
- `.lovable/plan.md` — Phase H complete, H.2 (SVG pre-render cache) queued.

---

## Why Not DOCX (revisited, with references)

| Vector | Markdown (current, fix in place) | DOCX alternative |
|---|---|---|
| Diagram fidelity | Mermaid source = text → diff-able, multilingual, theme-aware (Manubot/Quarto model). | Diagrams arrive as embedded PNG/EMF — opaque, locale-bound, not theme-aware. |
| Pipeline maintenance | One filter chain, pure functions, reusable across importers (Pandoc model). | Adds a second binary parser (mammoth/officegen) with its own escape rules. |
| Citation extraction | MLA9 regex on text already works. | OOXML walker required; styles vary by source app. |
| Storage | Diagram source stored as text inside content. | Binary blobs in storage bucket → bandwidth + RLS overhead. |

**Verdict:** Stay markdown-first. Re-evaluate DOCX only if a partner cannot export markdown — and even then, prefer a DOCX→Markdown pre-stage (Pandoc) so the same pipeline applies.

---

## Files Changed Summary

| File | Change | Risk |
|---|---|---|
| `supabase/functions/_shared/markdown-pipeline.ts` | NEW — pure-function pipeline (Pandoc-style filters) | Low |
| `supabase/functions/markdown-to-article-import/index.ts` | Refactor in place to call `runImportPipeline`; delete inline regex blocks | Low |
| `src/components/articles/enhanced/MermaidBlock.tsx` | NEW — lazy, theme-aware, CLS-safe (Docusaurus model) | Low |
| `src/components/articles/enhanced/ProfessionalTextFormatter.tsx` | Add `code` override → delegate `language-mermaid` to `MermaidBlock` | Low |
| `package.json` | Add `mermaid` (~600 KB, dynamic-imported, code-split) | Low |
| `docs/architecture/IMPORT_PIPELINE.md` | Re-document as named filter chain | Zero |
| `docs/RELIABILITY_AUDIT.md` | New importer invariant | Zero |
| `docs/IMPORT_WORKFLOW.md` | Re-import recipe + ChatGPT-export caveats | Zero |
| `docs/ARTICLE_DISPLAY_GUIDE.md` | Mermaid authoring guide | Zero |
| `.lovable/plan.md` | Phase H status | Zero |

## What This Does NOT Do
- Does not change `srangam_articles` schema, RLS, or any DB row.
- Does not modify routing, auth, or `OceanicRouter` / `ArticlesRouter`.
- Does not touch `SimplifiedMarkdownRenderer` (legacy non-oceanic; Phase H.2).
- Does not introduce DOCX parsing or any new binary dependency.
- Does not bulk-rewrite existing articles — operator re-imports with `overwrite=true`.

## Performance & UX Notes
- `mermaid` is dynamic-imported inside `MermaidBlock` only — articles without diagrams pay **zero** bundle cost.
- Importer pipeline is O(n) on text length, runs once per import; negligible vs. existing `marked.parse`.
- `min-h-[180px]` on the figure container eliminates layout shift while mermaid bootstraps (the CLS issue Docusaurus' prerender plugin exists to solve).
- `securityLevel: 'strict'` blocks the documented mermaid `foreignObject`/script vector.

## Phase H.2 (Queued, Not in This Phase)
- Server-side SVG pre-render cached in `srangam_articles.diagram_cache` JSONB (Docusaurus prerender model). Eliminates the mermaid bundle for repeat readers and fixes a11y/SEO at the source.
- Bring `SimplifiedMarkdownRenderer` to parity (one-line code-renderer override) once we confirm the legacy tenant still has live traffic.
