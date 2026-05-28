# Enterprise Surgical Recovery Plan: Mobile Article Readability

## Baseline diagnosis

The project is running and functional. The failure is a presentation-layer regression, not a backend outage.

### What the live/mobile evidence shows

On the mobile article route `/articles/satisar-springs-sacred-flow`, the page-level overflow is now clipped/contained:

```text
documentElement.clientWidth = 360
documentElement.scrollWidth = 360
body.clientWidth = 360
body.scrollWidth = 360
```

But the article is still not readable because a descendant inside the article body card is wider than its visual container. The observed offender is the in-body duplicate heading:

```text
/html/body/div/div[3]/main/div/div/article/div[3]/div/div/div/div/h1
```

Visible text:

```text
Satīsar, Springs and the Sacred Flow: Reading Kashmir Beyond the Mughal Garden
```

This is not the page shell title. It is a duplicate `<h1>` coming from the article content itself.

### Database facts, read-only

For the Satīsar article, `srangam_articles.content.en` begins with:

```html
<h1>Satīsar, Springs and the Sacred Flow: Reading Kashmir Beyond the Mughal Garden</h1>
<h2>Executive summary</h2>
<p>...</p>
```

Platform-wide read-only counts:

```text
published_articles = 44
starts_with_html_h1 = 37
starts_with_md_h1 = 2
has_export_tokens = 2
```

So the issue is systemic for DB/Markdown-imported articles, not a single bad row.

### Backend / logs / edge functions

Checked signals:

- Lovable Cloud backend is healthy.
- Database connection/disk/memory status is acceptable.
- Article route network calls returned 200.
- No relevant recent edge-function errors were found for article import, OG generation, image proxy, or TTS.

Conclusion: no migration, data rewrite, RLS change, or edge-function deployment is warranted for this recovery.

## Root cause

The previous Phase T patch added clipping and some wrapping, but it did not fully heal the descendant layout contract.

Three things are colliding:

1. `OceanicArticlePage` renders a canonical page-level article title.
2. Most DB article bodies also start with their own `<h1>` or Markdown `#` title.
3. `ProfessionalTextFormatter` renders that in-body title as a large desktop-style heading inside a padded mobile card.

`overflow-x-clip` then prevents right-scroll, so the user cannot even pan to read the clipped content. The enterprise fix is not to restore page-wide horizontal scrolling. It is to make normal article descendants fit their containers, while preserving horizontal scroll only for sanctioned wide elements like evidence tables.

## Non-negotiable constraints

- No production data mutation.
- No database schema change.
- No edge-function change.
- No router/data-flow rewrite.
- No mass renderer rebuild.
- Keep existing `ArticlePage`, `OceanicArticlePage`, resolver hierarchy, RLS/security model, and import architecture intact.
- Improve observability with tests/diagnostics before calling the issue fixed.
- Documentation gets temporal notes: Phase T was incomplete; Phase U is the surgical correction.

## Phase U.0 — Documentation-first reset

Update:

- `.lovable/plan.md`
- `docs/RELIABILITY_AUDIT.md`

Record:

- Phase T added a safety clip but did not fix all overflowing descendants.
- The exact observed offender is the in-body duplicate `<h1>` inside `ProfessionalTextFormatter`.
- The correct invariant is: article prose descendants must fit their content box; `overflow-x-clip` is a final safety guard, not the primary fix.
- Only table/wide-data wrappers may scroll horizontally.

## Phase U.1 — Surgical layout repair

Update `src/components/oceanic/OceanicArticlePage.tsx`:

- Add `min-w-0 w-full max-w-full` to:
  - main content grid
  - primary content column
  - article content `Card`
  - article content `CardContent`
- Change mobile card padding from default broad `p-6` behavior to a mobile-safe rhythm:

```text
px-4 py-5 sm:px-6 sm:py-6
```

Update `src/components/articles/enhanced/ProfessionalTextFormatter.tsx`:

- Make the formatter root explicitly shrink-safe:

```text
prose prose-lg sm:prose-xl max-w-none article-content min-w-0 max-w-full
```

- Make custom headings mobile-safe:

```text
h1: text-2xl sm:text-3xl md:text-4xl, leading-snug, max-w-full, min-w-0, break-words, [overflow-wrap:break-word], [hyphens:auto]
h2: text-xl sm:text-2xl, min-w-0, max-w-full, break-words
h3: text-lg sm:text-xl, min-w-0, max-w-full, break-words
```

- For `h2`/`h3`, prevent icon+text flex rows from forming an unshrinkable row:
  - icon span: `shrink-0`
  - text span: `min-w-0 break-words [overflow-wrap:break-word]`

- Make list rows shrink-safe:

```text
li: min-w-0 max-w-full
bullet span: shrink-0
content span: min-w-0 flex-1 break-words [overflow-wrap:break-word]
```

Keep MV-01 intact:

- `min-w-[900px]` tables remain inside `overflow-x-auto` wrappers.
- Do not globally hide overflow on table wrappers.

## Phase U.2 — Render-time duplicate leading title suppression

Update `ProfessionalTextFormatter` with an optional prop:

```ts
suppressLeadingTitle?: string
```

Behavior:

- Before Markdown/HTML rendering, remove only a leading title that matches the page title.
- Supported first-line forms:

```html
<h1>Matching page title</h1>
```

```md
# Matching page title
```

- Use conservative normalization:
  - strip tags
  - collapse whitespace
  - trim
  - case-insensitive compare
  - tolerate harmless punctuation/spacing differences

Update `OceanicArticlePage`:

```tsx
<ProfessionalTextFormatter
  content={article.content}
  suppressLeadingTitle={articleTitle}
  ...
/>
```

Why this is safe:

- No article rows are changed.
- Only redundant first titles are hidden at render time.
- If a body H1 is not equivalent to the page title, it remains visible.
- This helps old DB articles and newly imported Markdown-route articles.

## Phase U.3 — Automated DOM diagnostic for CI logs

Add a Playwright diagnostic helper that runs in the browser and prints actionable offender details.

New helper, for example:

```text
tests/e2e/helpers/articleOverflowDiagnostics.ts
```

Diagnostic responsibilities:

- Scope to `article[data-testid="article-body"]`.
- Compare each descendant against its nearest meaningful wrapper/container.
- Flag:
  - `element.scrollWidth > element.clientWidth + 1`
  - `element.getBoundingClientRect().right > containerRect.right + 1`
  - `element.getBoundingClientRect().width > containerRect.width + 1`
- Ignore sanctioned wrappers:
  - elements inside `overflow-x-auto` table/data wrappers
  - map/canvas/media containers explicitly marked as wide-scroll-safe
- For each offender, print CI log details:

```text
route
viewport
tagName
className
text prefix
CSS-like path
bounding rect
clientWidth / scrollWidth
computed display / white-space / overflow-wrap / word-break / min-width / max-width
offending wrapper tag/class/path
```

This directly addresses the requirement to print the offending element and wrapper element in CI logs.

## Phase U.4 — Playwright visual regression coverage

Current repo has Vitest but no Playwright dependency/config. Add Playwright deliberately and minimally.

Add dev dependency:

```text
@playwright/test
```

Add config:

```text
playwright.config.ts
```

Use Vite dev server via `webServer`, without changing app runtime code.

Add tests:

```text
tests/e2e/mobile-article-visual.spec.ts
```

Viewports required by user:

```text
390 × 844
360 × 640
```

Core route set:

1. `/articles/satisar-springs-sacred-flow`
2. one DB article with long body/title content
3. one Markdown-imported route from `srangam_markdown_sources`
4. one article with evidence tables/wide table content
5. one legacy/static `ArticlePage` route

Because Playwright tests cannot query Lovable Cloud directly unless credentials/env are available in CI, keep the first version deterministic:

- encode a curated route list in the spec
- include a separate read-only local script/doc note for refreshing the route list from the database when backend access is enabled
- do not block the test suite on live DB introspection

Assertions:

- page loads article body
- `documentElement.scrollWidth <= documentElement.clientWidth + 1`
- DOM diagnostic returns zero unsanctioned overflow offenders
- body card screenshots match snapshots at both viewports

Snapshots:

- capture the article content area, not the whole browser chrome
- mask/avoid unstable regions where possible:
  - dev TTS debug panel
  - transient loading/skeletons
  - external image load timing if necessary
- keep snapshots small and targeted so they are useful in review.

## Phase U.5 — Run Phase T/U overflow checks across all renderers

Existing known renderers:

- `src/components/articles/ArticlePage.tsx`
- `src/components/oceanic/OceanicArticlePage.tsx`
- `src/components/articles/enhanced/ProfessionalTextFormatter.tsx`

Add/extend source-scan tests in:

```text
src/__tests__/responsive/article-prose-overflow.test.ts
```

Checks:

- `ArticlePage` article wrapper has `data-testid="article-body"`, `overflow-x-clip`, `min-w-0`, `w-full`.
- `OceanicArticlePage` article wrapper has the same.
- `OceanicArticlePage` content grid/column/card/content include `min-w-0`/`max-w-full` as appropriate.
- `ProfessionalTextFormatter` h1/h2/h3/p/li renderers include wrap-safe classes.
- `ProfessionalTextFormatter` supports `suppressLeadingTitle`.
- `index.css` keeps the corrected policy:
  - prose uses `break-word`
  - chips/anchors/code use `anywhere`
  - cultural-term trigger remains inline, never `inline-block`
- wide tables with `min-w-[900px]` remain inside `overflow-x-auto`.

Also add a source search guard for other article-like renderers:

- scan `src/components/articles/**`
- scan `src/pages/articles/**`
- flag new article renderers that use `ProfessionalTextFormatter` without an article-body wrapper or wrap-safe parent.

## Phase U.6 — Narration/dev overlay containment

No backend/TTS logic change.

Confirm/adjust only if tests show overlap:

- `UniversalNarrator` remains admin-only.
- sticky-bottom narrator uses max-width/min-width-safe controls.
- `NarrationDebugPanel` does not obscure mobile visual snapshots; in test mode it can be hidden through CSS or masked in snapshots.
- `Layout` bottom padding remains enough for mobile bottom tabs.

## Verification gate before saying fixed

Do not call the article mobile view fixed until all of these pass:

1. Source-scan responsive tests pass.
2. Playwright DOM diagnostic passes for both:
   - 390 × 844
   - 360 × 640
3. Playwright screenshots are generated and reviewed.
4. Manual preview confirms:
   - no clipped in-body heading
   - no duplicate title if it matches page title
   - paragraphs/lists wrap inside the card
   - cultural-term chips remain inline/tappable
   - tables scroll only inside their own wrappers
   - bottom nav/narrator do not cover reading content
5. Network calls remain 200 and no new article-render console errors appear.

## Explicit non-scope

- No database writes.
- No migrations.
- No RLS/auth changes.
- No edge-function edits/deployments.
- No production content rewrites.
- No route architecture rewrite.
- No visual redesign beyond mobile readability repair.

## Implementation order after approval

1. Documentation Phase U baseline.
2. Source-scan regression guard updates.
3. `ProfessionalTextFormatter` shrink-safe headings/lists/root and duplicate-title suppression.
4. `OceanicArticlePage` shrink-safe content card/wrapper and `suppressLeadingTitle` prop.
5. Add Playwright config/helper/spec/snapshots for 390×844 and 360×640.
6. Run targeted tests.
7. Verify live preview and report exact pass/fail findings.