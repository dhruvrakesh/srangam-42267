# Phase T — Mobile Article Readability, Honestly Diagnosed

This plan is surgical and presentation-layer. No DB / RLS / edge-function / narration / resolver / import-pipeline changes.

## What the diagnostic actually showed

A live DOM inspection at 360×640 on the sandbox for the Satīsar article (rendered by `OceanicArticlePage`, **not** `ArticlePage`) returned clean numbers: `documentElement.scrollWidth === clientWidth === 360`, h1 fits, paragraphs fit, list items fit. So the previous "horizontal page overflow" fix (Phase P / MV-02) is intact — but **only on `ArticlePage.tsx`**. The screenshots the user sent are from `OceanicArticlePage.tsx`, which renders every published DB article (Satīsar, Gopādri, …) and was **never wired into Phase P**.

That is the root cause of the user's frustration: the invariants exist on the wrong component.

A careful re-read of the screenshots + code confirms five distinct mobile defects on `OceanicArticlePage`:

1. **H1 is bare** — `text-4xl font-bold leading-tight`, no responsive ramp, no `break-words`, no `[overflow-wrap:break-word]`, no `[hyphens:auto]`, no `min-w-0`. On a 384 px Chrome viewport the title visually dominates 7–8 lines and looks broken next to the hero card.
2. **No article overflow guard** — `OceanicArticlePage` has no `<article data-testid="article-body">` wrapper, no `overflow-x-clip`, no `min-w-0` on the `Card`/`CardContent` that hosts `ProfessionalTextFormatter`. MV-02 doesn't apply.
3. **`overflow-wrap: anywhere` is over-applied** — Phase P scoped `anywhere` to all `.article-content p|li|h1|h2|h3` at ≤640 px. Per CSS spec, `anywhere` breaks at *any* grapheme, including mid-word in English (e.g. "climbing" → "climb-/ing", "wherever" → "where-/ver"). This is exactly the mid-word clipping the user noticed. The correct policy for prose is `overflow-wrap: break-word` (only breaks otherwise-unbreakable tokens), and reserve `anywhere` for `.cultural-term-highlight`, `code`, and long URLs.
4. **Cultural-term chip behaves like a block** — `.cultural-term-highlight` in `index.css` declares `white-space: nowrap` + `px-1.5 py-0.5` + bordered pill + an inline Info icon. In a flowing paragraph it visually detaches from neighbouring words (the user's "Satisaras   (काश्यप…)" gap), and on a 320 px screen a long term forces page widening even though MV-02 tries to clip it.
5. **Import-artefact tokens leak into the body** — `fileturn0file0`, `fileturn0file1` appear in the live HTML (`srangam_articles.content`). These are ChatGPT export markers; `sanitizeSnippet` already strips them from the abstract for `<meta>`, but the in-body renderer doesn't, so readers see them. This is a curation problem, not a render bug — but it is the most visible "readability" complaint and a one-line additive fix.

Database status checked: backend healthy, no error logs implicated. Edge-function inventory unchanged. So this stays 100% frontend.

## Phase T.1 — Apply MV-02 invariants to `OceanicArticlePage` (the actual production article view)

- Wrap the article content region in `<article data-testid="article-body" className="… overflow-x-clip [overflow-x:clip] min-w-0 w-full">` so the same Phase P regression test covers both renderers.
- Add `min-w-0` to the grid column, the content `Card`, and the inner `CardContent` so a long token cannot inflate the row.
- Change the bare H1 to a responsive, wrap-safe ramp matching the existing `ArticlePage` H1: `text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight break-words [overflow-wrap:break-word] [hyphens:auto] min-w-0`.
- Keep the back-button row above the H1 — no behavioural change.

## Phase T.2 — Correct the prose wrap policy (replace `anywhere` with `break-word` for English prose)

In `src/index.css`, replace the `@media (max-width: 640px)` block from Phase P so that:

- `.article-content p|li|h2|h3` use `overflow-wrap: break-word` (preserves natural word boundaries; only breaks unbreakable runs).
- `.article-content h1` keeps `break-word` + `hyphens: auto` (already in component-level classes).
- `.article-content :is(.cultural-term-highlight, a[href], code)` use `overflow-wrap: anywhere` + `max-width: 100%` (these are the actual mid-token offenders that need to break anywhere to avoid pushing the viewport).
- Keep `hyphens: auto` on prose elements.

This eliminates the "water is climb-/…" / "where would-/…" mid-word breaks the user reported, while still protecting against a long Sanskrit transliteration token blowing out the viewport.

Update the MV-02 invariant note in `docs/RELIABILITY_AUDIT.md` to record the policy change and why.

## Phase T.3 — Tame the cultural-term chip inline

In `src/index.css` `.cultural-term-highlight`:

- Drop `white-space: nowrap` (allow the chip text to wrap at natural break points if the term is multi-word).
- Replace `word-break: keep-all` with `word-break: normal` + `overflow-wrap: anywhere` so a single long term still cannot force overflow.
- Tighten padding on `<640 px`: `px-1 py-0` instead of `px-1.5 py-0.5`, drop the border to `border-saffron/10`. Reduce visual disconnection between the chip and the surrounding sentence.
- Hide the inline Info icon on coarse pointers (`@media(pointer:coarse) .cultural-term-highlight svg { display: none }`); the dotted underline + saffron tint is enough affordance, and the icon adds width pressure.
- Keep the `inline` display (MV-02 invariant), keep Phase R tap-target pseudo, keep tooltip behaviour.

## Phase T.4 — Strip ChatGPT export artefacts from rendered article HTML

- Centralise the artefact sweep in `src/lib/textSanitizer.ts`: add a new exported `sanitizeArticleHtml(html)` that strips:
  - `\bfileturn\d+file\d+\b`
  - `\bturn\d+file\d+\b`
  - `\bcite\u200bturn\d+\w+\d+\b` and the zero-width-joined variants
  - leading/trailing whitespace lines created by the strip
- Call it in two places only:
  1. `ProfessionalTextFormatter.getText()` once per render, after the multilingual pick and before cultural-term injection.
  2. The existing `sanitizeSnippet` keeps its current behaviour (defence-in-depth for meta tags).
- This is **render-time only**. Source rows in `srangam_articles.content` are not mutated — additive, reversible, observability-friendly per the user's standing memory.

## Phase T.5 — Diagnostic guardrails

Extend `src/__tests__/responsive/article-prose-overflow.test.ts` (and add minimal source-scan assertions) so this cannot regress:

- MV-02b: `src/components/oceanic/OceanicArticlePage.tsx` must contain `data-testid="article-body"` with `overflow-x-clip` + `min-w-0`.
- MV-02c: `src/index.css` mobile media block must use `overflow-wrap: break-word` on `.article-content p|li|h2|h3`, and `overflow-wrap: anywhere` only inside an `:is(.cultural-term-highlight, a, code)` selector.
- MV-02d: `.cultural-term-highlight` must not declare `white-space: nowrap`.
- AR-01: `src/lib/textSanitizer.ts` exports `sanitizeArticleHtml` and `ProfessionalTextFormatter.tsx` calls it.

## Manual verification matrix

- Viewports: 320×568, 360×800, 384×676 (current preview), 390×844, 414×896.
- Routes: `/articles/satisar-springs-sacred-flow`, `/articles/gopadri-kasyapa-varahamula`, one long-title DB article, one article with a 6-col evidence table.
- Pass criteria:
  - `document.documentElement.scrollWidth === clientWidth` at every viewport above.
  - H1 wraps without mid-word breaks; no horizontal page scroll.
  - No `fileturn…` / `turn…` tokens visible in the rendered body.
  - Cultural-term chip flows inline with surrounding text; tap opens tooltip; keyboard still works.
  - Tables remain horizontally scrollable inside their `overflow-x-auto` wrapper (MV-01 unchanged).

## Files touched (presentation only)

| File | Phase | Change |
|------|-------|--------|
| `src/components/oceanic/OceanicArticlePage.tsx` | T.1 | `<article data-testid="article-body" overflow-x-clip min-w-0 w-full>` wrapper; responsive H1 ramp with `break-words [overflow-wrap:break-word] [hyphens:auto]`; `min-w-0` on grid column / `Card` / `CardContent` |
| `src/index.css` | T.2, T.3 | Mobile media block uses `break-word` on prose, `anywhere` only on chip/anchor/code; `.cultural-term-highlight` loses `white-space: nowrap`, tightens mobile padding, hides icon on coarse pointers |
| `src/lib/textSanitizer.ts` | T.4 | New `sanitizeArticleHtml()` (additive; existing `sanitizeSnippet` untouched) |
| `src/components/articles/enhanced/ProfessionalTextFormatter.tsx` | T.4 | One-line call to `sanitizeArticleHtml(text)` inside `getText()` |
| `src/__tests__/responsive/article-prose-overflow.test.ts` | T.5 | Add MV-02b/c/d + AR-01 source-scan assertions |
| `docs/RELIABILITY_AUDIT.md` | docs | Phase T section: corrected wrap policy, OceanicArticlePage now under MV-02, render-time artefact sweep recorded |
| `.lovable/plan.md` | docs | Append Phase T plan + diagnostic notes (incl. live 360 px DOM measurements) |

## Explicit non-scope

- No router / data-flow / hook changes.
- No edge-function, schema, RLS, migration, storage, sanitizer-allow-list, or article-content-model edits.
- No narration provider, OG image, sitemap, or search architecture changes.
- No new dependency, no design token additions, no font swap.
- Source rows in `srangam_articles.content` are not modified (user memory: production data immutable).
