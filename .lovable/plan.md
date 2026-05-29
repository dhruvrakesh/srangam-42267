## Article Rendering Healing — Phases AR.1 → AR.3 (enterprise-grade, surgical)

Scope is intentionally narrow: three independently shippable, independently revertable phases against `src/components/articles/enhanced/ProfessionalTextFormatter.tsx`, with one companion edit in `StickyTableOfContents.tsx` (AR.3 only) and one CSS rule in `src/index.css` (AR.2 only). **No DB migration, no edge-function change, no route change, no schema change, no Tailwind class churn beyond what each phase strictly requires.**

Pre-flight context (verified, not assumed):
- `ProfessionalTextFormatter` is consumed by `src/components/articles/ArticlePage.tsx` (`enableDropCap={true}`) and `src/components/oceanic/OceanicArticlePage.tsx` (`enableDropCap={false}`). AR.2 fixes a visible bug on the former; the latter is untouched in behaviour.
- `StickyTableOfContents` is only mounted by `src/pages/articles/JambudvipaConnected.tsx` with `items={[]}` today. AR.3's TOC anchor work is **enablement** for future curated TOCs — it does not change current rendered output until a caller supplies real items.
- `src/lib/culturalTermEnhancer.ts` protects HTML and markdown tables but **does not skip fenced code/mermaid blocks**, so stray `{{cultural:…}}` tokens can land in fences. AR.1's exclusion of the `code` renderer from token resolution is the safety net for that case (tokens render as literal text inside `<code>` instead of corrupting the block).
- Memory invariants honoured: MV-02 mobile prose (`prose-lg sm:prose-xl`, `inline` cultural chips, `overflow-x-clip min-w-0`), Phase O `rehype-sanitize` schema, EvidenceTable detection, lazy `ArticleMiniMap`, Phase Z pin automation — all out of scope and untouched.

Documentation-first per user preference: each phase appends a dated entry to `.lovable/plan.md` and `docs/IMPLEMENTATION_STATUS.md` (frozen-baseline note + what changed), and AR.3 closes with a `mem://index.md` Core invariant update.

---

### Phase AR.1 — Single-pass article rendering (P0, structural corruption)

**Problem (verified).** `renderWithCulturalTerms()` splits the body by `\n` and starts a *new* `<ReactMarkdown>` whenever a line contains `{{cultural:…}}`. Any block whose syntax spans multiple lines — GFM tables, fenced ```mermaid / ```code, multi-line blockquotes, nested lists, multi-paragraph list items — is torn across separate parses and mis-rendered. With `autoHighlightTerms=true` (default) this fires on essentially every article. The non-cultural branch already renders through a single `<ReactMarkdown>`, so the cultural branch is the only divergent path.

**Fix — let ReactMarkdown parse blocks once; resolve tokens in leaf renderers.**

1. Replace the body of `renderWithCulturalTerms(text)` with a single render (both branches collapse):
   ```tsx
   return (
     <ReactMarkdown components={customRenderers} rehypePlugins={ARTICLE_REHYPE_PLUGINS}>
       {text}
     </ReactMarkdown>
   );
   ```
   Delete `segments[]`, `currentMarkdown`, the line loop, the `parse(htmlFragment)` calls, and all per-line heading/list/blockquote re-wrapping.

2. Add a leaf-level token resolver in the component body:
   ```tsx
   const CULTURAL_RE = /\{\{cultural:([^}]+)\}\}/g;
   const resolveCulturalTokens = (children: React.ReactNode): React.ReactNode => {
     if (!enableCulturalTerms) return children;
     return React.Children.map(children, (child, i) => {
       if (typeof child !== 'string') return child;        // pre-rendered elements pass through
       if (child.indexOf('{{cultural:') === -1) return child;
       const out: React.ReactNode[] = [];
       let last = 0, m: RegExpExecArray | null;
       const re = new RegExp(CULTURAL_RE.source, 'g');     // fresh per call (no lastIndex state)
       while ((m = re.exec(child)) !== null) {
         if (m.index > last) out.push(child.slice(last, m.index));
         const term = m[1].trim().toLowerCase();
         out.push(
           <CulturalTermTooltip key={`ct-${i}-${m.index}`} term={term}>
             <span className="cultural-term-highlight">{toTitleCase(term)}</span>
           </CulturalTermTooltip>
         );
         last = re.lastIndex;
       }
       if (last < child.length) out.push(child.slice(last));
       return <>{out}</>;
     });
   };
   ```

3. Apply `resolveCulturalTokens(children)` **only** inside these renderers: `p`, `li`, `blockquote`, `strong`, `em`, `h1`, `td`, `th`. For `h2`/`h3` wrap **only** the inner `<span className="min-w-0 flex-1 …">{children}</span>` — never the `§`/`◆` icon span. **Do not** modify the `code` renderer (safety net for the enhancer's fence-unaware behaviour confirmed in context revival).

4. In `extractTextFromNode()`, strip token wrappers so EvidenceTable detection and table cells see clean text:
   ```ts
   if (typeof node === 'string') return node.replace(/\{\{cultural:([^}]+)\}\}/g, '$1');
   ```

5. Remove the now-dead `import parse from 'html-react-parser'` (only the line-split path used it). Leave the dependency in `package.json` untouched — out of scope, and other code may import it elsewhere; verify before deleting in a later cleanup pass.

**Strictly do not change.** `getText()` pipeline, `enhanceTextWithCulturalTerms`, `ARTICLE_REHYPE_PLUGINS` / sanitize schema, `EvidenceTable` / `isEvidenceTable` / `MermaidBlock`, any Tailwind class on any renderer, drop-cap classes (AR.2 territory).

**Acceptance.** Author a private preview article containing all four blocks, each with ≥1 cultural term:
(a) 6-column evidence table, (b) fenced ```mermaid block, (c) 3-line blockquote, (d) nested bulleted list. All four render structurally intact; `EvidenceTable` still triggers; hover tooltips work on prose terms; mermaid/code show literal `{{cultural:…}}` if any token lands inside (no break); console has no new warnings.

**Risk + rollback.** Single-file change, ~120 lines removed and ~25 added. Revert = restore the file. Zero data implications.

---

### Phase AR.2 — Drop cap on the opening paragraph only

**Problem (verified visible bug on `/articles/*` rendered by `ArticlePage.tsx`).** `enableDropCap` attaches `first-letter:*` utilities to the `p` renderer; since `::first-letter` is per-block, every paragraph gets a giant burgundy initial.

**Fix.**
1. Remove the three `enableDropCap && 'first-letter:*'` lines from the `p` renderer (formatter ~lines 343–345).
2. On the outer prose container (formatter line ~624), gate via class:
   ```tsx
   className={cn('prose prose-lg sm:prose-xl max-w-none article-content min-w-0', enableDropCap && 'article-dropcap', className)}
   ```
3. Add to `src/index.css` (single rule, scoped — does not bleed):
   ```css
   .article-content.article-dropcap > p:first-of-type::first-letter {
     font-family: var(--font-serif, ui-serif, Georgia, serif);
     font-size: 3.75rem;
     font-weight: 700;
     color: hsl(var(--burgundy));
     float: left;
     margin-right: 0.75rem;
     margin-top: 0.25rem;
     line-height: 1;
   }
   ```

**Acceptance.** `/articles/*` (ArticlePage) shows the drop cap on the article's first paragraph only; subsequent paragraphs render normally. Oceanic article pages (drop cap disabled) unchanged.

**Risk + rollback.** Two-file change. Revert = restore `p` renderer + delete CSS rule.

---

### Phase AR.3 — Whitespace-safe normalization, TOC anchors (enablement), log cleanup

Three independent micro-fixes; each can be cherry-shipped.

**1. Whitespace (formatter line 85).** `text.trim().replace(/^\s+/gm, '')` strips every line's leading whitespace, flattening nested list indentation and corrupting indented/fenced code on the input side. Replace with a blank-line collapser only:
```ts
text = text.trim().replace(/\n{3,}/g, '\n\n');
```

**2. TOC anchors (enablement).** Today, headings emit no `id`, so `StickyTableOfContents.scrollToSection` silently no-ops. The only mount today passes `items={[]}` (dormant), so this change is risk-free *and* future-enabling. Centralise slugging so formatter ids and TOC ids cannot drift:
- Add `src/lib/headingSlug.ts`:
  ```ts
  export const slugifyHeading = (s: string): string =>
    s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
     .toLowerCase().replace(/[^a-z0-9]+/g, '-')
     .replace(/^-+|-+$/g, '').slice(0, 50);
  ```
- In the formatter add a small `extractHeadingText(children)` mirroring `extractTextFromNode` (string-coercion only; strips `{{cultural:…}}` wrapper to inner text so id matches what readers see).
- In the `h1` renderer, `h2` renderer's outer `<h2>` (not the wrapping `<div>`), and `h3` renderer, set `id={slugifyHeading(extractHeadingText(children))}`.
- In `StickyTableOfContents.extractTableOfContents`, replace the inline slug with `slugifyHeading(title)` so both sides match by construction.
- Document the single-source-of-truth contract in `docs/ARTICLE_DISPLAY_GUIDE.md`.

**3. Log cleanup.** Guard the per-table `console.log('[TableExtraction]', …)` (formatter ~lines 595–599) behind `if (import.meta.env.DEV)`. Keep the `console.error` in the `catch` (observability).

**Acceptance.** Nested lists and fenced code retain indentation in rendered output; if a consumer supplies a non-empty `items` array, clicking entries scrolls to the matching `<h2>` / `<h3>` and the active-section highlight tracks scroll; production console no longer prints `[TableExtraction]`.

**Risk + rollback.** Touches two files + one new tiny lib file. Revert each item independently.

---

### Verification protocol (ship-by-ship)

1. AR.1 → preview the four-block test article (table / mermaid / blockquote / nested list, each with a cultural term). Tick: structural integrity, EvidenceTable detection log gone after AR.3, tooltips working, no console errors. Sanity-check one production article (e.g. *Jambudvīpa Connected*) renders identically minus the structural breaks.
2. AR.2 → `/articles/<any>` shows drop cap on first paragraph only; an Oceanic article page is unchanged.
3. AR.3 → indentation preserved in rendered nested lists/fenced code; manual smoke with a temp `items={[…]}` supplying real heading text confirms TOC navigation; production build console clean of `[TableExtraction]`.

Each phase passes its own acceptance gate before the next merges. No phase blocks Phase Z (pin automation), G3–G5 (geo), or CX.1–CX.3 (context evolution) — those continue on their own thread.

### Documentation deliverables

- `.lovable/plan.md` — append "AR.1/AR.2/AR.3 (2026-05-29)" entry per phase: what shipped, dated baseline, rollback note.
- `docs/IMPLEMENTATION_STATUS.md` — flip article rendering row to "AR.1/2/3 healed (2026-05-29)" with link to plan entry.
- `docs/ARTICLE_DISPLAY_GUIDE.md` — document the single-pass render contract, drop-cap CSS hook, and `slugifyHeading` source-of-truth.
- `mem://index.md` Core invariant (after AR.3):
  > "Article body renders through exactly one `<ReactMarkdown>`; `{{cultural:…}}` tokens resolve inside leaf renderers via `resolveCulturalTokens`. Never re-introduce line-split rendering — it corrupts tables, mermaid, blockquotes, and nested lists. Drop cap lives in `.article-content.article-dropcap > p:first-of-type::first-letter`, not on the `p` renderer. Heading `id`s come from a shared `slugifyHeading()` used by both the formatter and the TOC."

### Out of scope (deferred, deliberately)

- CX.1–CX.3 context-evolution pipeline (queue after AR ships).
- G3 gazetteer expansion, G4 standardising other background jobs, G5 tests.
- Per-paragraph language coverage recompute (Phase Y i18n).
- `culturalTermEnhancer` fence-skipping (orthogonal hardening; AR.1's code-renderer exclusion is already sufficient).
- Removing `html-react-parser` dependency (audit other consumers first).
- Touching merge/dedup contract (`mem://articles/cross-source-alias-dedup`).