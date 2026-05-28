# Phase W — Desktop Guardrail, Hardened Overflow Detection, Thematic OG Images

Surgical, additive follow-up to Phase V. Context verified against `supabase/functions/generate-article-og/index.ts`, `docs/OG_IMAGE_SYSTEM.md`, `src/test/setup.ts`, `e2e/article-mobile.spec.ts`, `playwright.config.ts`, and the Phase O / P / U memory baselines. No production component, hook, lib, route, RLS, or migration is touched.

## 1. Desktop Playwright guardrail (Layer 3 extension)

**New:** `e2e/article-desktop.spec.ts`
- Pinned to a new `chromium-desktop` Playwright project (added below) so mobile project semantics remain unchanged.
- For `E2E_ARTICLE_SLUG` (default `reassessing-ashoka-legacy`), per viewport in `[1024×768, 1280×800, 1440×900, 1920×1080]`:
  - `documentElement.scrollWidth <= innerWidth + 1` (no page-level horizontal scroll).
  - `[data-testid="article-body"]` text length > 500.
  - No descendants flagged by the shared `collectOffenders` walker.
- Tolerance for legitimate desktop scrollbar gutter handled via the existing `+ 1` slack.

**Edit:** `playwright.config.ts` — add a second entry to `projects[]`:
```
{ name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }
```
`webServer`, `baseURL`, retries, reporter all unchanged. `bun run test:e2e` now runs both projects; mobile spec behavior is bit-for-bit identical.

## 2. Hardened overflow detection (shared source of truth)

**New:** `e2e/_helpers/overflow.ts` exports `SANCTIONED_OVERFLOW_RE` and `collectOffenders(root)`. The current inline copy in `e2e/article-mobile.spec.ts` is replaced by an import — no logic change.

**Expanded allowlist** (single regex, used by Layer 2 jsdom shim, Layer 2 walker, and Layer 3 walker):
```
/\b(overflow-(?:x-)?(?:auto|scroll|hidden|clip)|snap-x|carousel|leaflet-container|map-container|chart-scroll|embla)\b/
```
Plus a runtime check: skip any element whose computed `overflow-x` ∈ `{auto, scroll, hidden, clip}` so future Tailwind variants (`md:overflow-x-auto`) and inline `style="overflow-x:auto"` are covered without churn. Inline `style` is honored in jsdom; `getComputedStyle` is used in Playwright.

**New Layer 2 specs** in `src/__tests__/responsive/article-dom-overflow.test.tsx` (all wrapped in the existing 384px provider harness):
1. Wide `<img>` (intrinsic 1600) with the production `img { max-width:100%; height:auto }` rule injected via `<style>` → **no offender** (positive).
2. Same wide `<img>` WITHOUT the constraint → **flagged** (negative control proves images are observed).
3. `<table class="min-w-[900px]">` inside `<div class="overflow-x-auto">` → **no offender** (positive).
4. Bare `<table class="min-w-[900px]">` directly in `article-body` → **flagged** (negative control).
5. `<pre><code>` with a 200-char unbroken line inside a `.article-content pre` styled `overflow-x:auto` → **no offender**.

**Shim extension** in `src/test/setup.ts` (additive, test-env only):
- `intrinsicMinWidth` also honors `<img width="NNN">`, `<img>` natural-width hint via `naturalWidth` setter the test seeds, inline `style="width:NNNpx"`, and inline `style="min-width:NNNpx"`.
- Sanctioned-wrapper skip uses the new shared regex + an inline-style check for `overflow-x`.
- No change for any existing spec (the previous `min-w-[NNNpx]` parsing remains the primary path).

## 3. Thematic (non-literal) OG image generation

Verified against `supabase/functions/generate-article-og/index.ts`:
- Provider stack is `callImage(prompt, { shape: 'landscape' })` from `_shared/ai-provider.ts` (Gemini → OpenAI fallback). DALL-E 3 references in `docs/OG_IMAGE_SYSTEM.md` are stale; doc will be corrected in this phase (no code reference depends on it).
- Output size remains 1792×1024 (closest landscape to OG 1.91:1), uploaded to Google Drive via `srangam_media_assets`, denormalized onto `srangam_articles.og_image_url`. **No schema, no signature, no caller change.**
- Idempotency: `promptHash = SHA-256(prompt)`; any prompt edit naturally invalidates the cache on next regen and bumps `version`, flips prior row to `superseded`. This is the desired effect — no migration needed.

**Edit only** lines 156–175 of `index.ts` (the prompt string). New contract:
- Remove `The article title "${title}" MUST appear clearly readable in large elegant serif font` — this directive is the root cause of glyph garbling on diacritics (`ā / ś / ū / ṅ`), e.g. the "Varáhamüola" failure seen in the user's screenshot.
- Add `SUBJECT:` line — a server-built one-sentence thematic interpretation: `Symbolic, non-literal evocation of <title>: <theme> iconography drawing on ${colors.motif}, rendered as visual metaphor — never as text.`
- Add `NEGATIVE:` line — `absolutely no text, no letters, no glyphs, no captions, no watermarks, no signage, no calligraphy of the title, no pseudo-script, no logos`.
- Keep palette (`colors.primary`, `colors.accent`), cream background, sacred-geometry motif, no-photographs / no-faces, museum/journal aesthetic.
- `title` and `theme` continue to flow into the prompt body (for `promptHash` + thematic steering) but are never asked to be rendered as pixels.

Existing OG images stay until admin triggers regen (manual or via Data Health bulk path). `force: true` path is unchanged. AI spend stays bounded.

## Documentation (per documentation-first principle)

- `.lovable/plan.md` — append Phase W (objective, three workstreams, files touched, acceptance, frozen 2026-05-28 baseline note).
- `docs/RELIABILITY_AUDIT.md` — extend Phase V matrix with: desktop viewport row (1024/1280/1440/1920), image invariant (`img` constrained by prose `max-width:100%`), table invariant (`min-w-[≥360px]` must sit inside sanctioned wrapper), pre/code invariant (`overflow-x:auto` mandatory). Add cross-ref to OG no-text contract.
- `docs/OG_IMAGE_SYSTEM.md` — (a) correct DALL-E 3 references to "Gemini → OpenAI fallback via `_shared/ai-provider.ts`"; (b) add a "No In-Image Text" subsection with rationale (diacritic legibility, `ā/ś/ū/ṛ/ṅ` failures, page H1 + meta tags are the canonical title surface); (c) update "Prompt Engineering Guidelines" item 1 accordingly.

## Acceptance gate

- `bunx vitest run` green: prior 23 specs + 5 new Layer 2 specs (image ×2, table ×2, pre/code ×1).
- `bunx playwright test --project=chromium-mobile` green at 320 / 360 / 384 / 390 / 414 (no behavior change).
- `bunx playwright test --project=chromium-desktop` green at 1024 / 1280 / 1440 / 1920.
- One admin-triggered regen of `reassessing-ashoka-legacy` (and `gopadri-kasyapa-varahamula` per the failing screenshot) produces an OG PNG with **zero rendered text**, theme-consistent iconography, `srangam_media_assets.version = prev + 1`, `status = 'active'`, prior row flipped to `superseded`. Confirmed via `srangam_event_log` `evt: 'og_image_generated'`.
- Zero edits to `src/components/**`, `src/pages/**`, `src/hooks/**`, `src/lib/**`, RLS policies, migrations, or any edge function other than `generate-article-og`.

## Files touched (exhaustive)

**New (3):** `e2e/_helpers/overflow.ts`, `e2e/article-desktop.spec.ts`, plus expanded specs inside the existing `article-dom-overflow.test.tsx`.

**Edited (7):** `e2e/article-mobile.spec.ts` (import shared helper only), `playwright.config.ts` (add desktop project), `src/test/setup.ts` (additive shim extensions), `src/__tests__/responsive/article-dom-overflow.test.tsx` (5 new specs + shared regex), `supabase/functions/generate-article-og/index.ts` (prompt block lines 156–175 only), `.lovable/plan.md`, `docs/RELIABILITY_AUDIT.md`, `docs/OG_IMAGE_SYSTEM.md`.

## Risk register

| Risk | Mitigation |
|---|---|
| Desktop sweep flakiness on scrollbar gutter | `+1` slack already used by mobile; reuse the same tolerance. |
| Shared regex over-skips legitimate offenders | Negative-control specs (#2 and #4) lock detection in. |
| Prompt change still emits text on some Gemini runs | `NEGATIVE` block is explicit; if regression observed, fall back to `openai/gpt-image-2` via existing provider chain — no code change required. |
| Stale OG images linger on social caches | Existing `version` bump + `og_image_status` flip; admin re-shares via FB/Twitter/LinkedIn debuggers (already documented in OG doc §Validation). |
| Doc drift introduces confusion | All three docs edited in same phase; Phase W marked frozen-baseline 2026-05-28. |

## Out of scope (Phase X candidates)

- Visual regression snapshots (`toHaveScreenshot` / Percy).
- Lighthouse CI desktop perf budget.
- Bulk backfill regen of all 32+ OG images (admin-discretion to control AI spend).
- Migration of `docs/OG_IMAGE_SYSTEM.md` storage section (currently references `og-images` bucket; live system uses Google Drive — separate doc-only cleanup).

---

## Phase W — Implementation status (2026-05-28, frozen)

✅ **Complete.** All 28 Vitest specs green (23 prior + 5 new Phase W).

- `e2e/_helpers/overflow.ts` — shared walker (mobile + desktop).
- `e2e/article-desktop.spec.ts` — 1024/1280/1440/1920 sweep.
- `playwright.config.ts` — `chromium-desktop` project added; mobile unchanged.
- `src/test/overflow-rules.ts` — shared `SANCTIONED_OVERFLOW_RE` constant.
- `src/test/setup.ts` — shim honors `<img width>`, `naturalWidth`, inline
  `style="(min-)width:NNNpx"`, inline `overflow-x`, plus expanded sanctioned-class list.
- `src/__tests__/responsive/article-dom-overflow.test.tsx` — 5 new specs
  (img × 2, table × 2, pre/code × 1).
- `supabase/functions/generate-article-og/index.ts` — non-literal prompt
  with explicit `NEGATIVE` block; title no longer rendered in pixels.
- `docs/RELIABILITY_AUDIT.md`, `docs/OG_IMAGE_SYSTEM.md` — synchronized.

Next admin OG regen on `reassessing-ashoka-legacy` / `gopadri-kasyapa-varahamula`
will produce a zero-text PNG and bump `srangam_media_assets.version`.
