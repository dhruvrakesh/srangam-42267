# Enterprise Path Forward — Mobile Article View, Tap Targets, Scroll Restoration

This stays surgical: frontend presentation + router-scroll behaviour only. No database, schema, RLS, storage, narration provider, sanitizer, resolver, import, or edge-function changes.

## Verified Context

- **Docs baseline:** `.lovable/plan.md` currently records Phase P and `docs/RELIABILITY_AUDIT.md` records MV-01/MV-02. Phase P fixed prose overflow, but does not yet cover app chrome, fixed overlays, tooltip touch interaction, or browser back/forward scroll restoration.
- **Current mobile evidence:** 390px screenshot still shows horizontal page chrome/scrollbar at the bottom and cramped article header chrome. The dev-only TTS debug overlay is visible over mobile bottom tabs, which degrades reading QA in preview even if production removes it.
- **Code findings:**
  - `src/components/ScrollToTop.tsx` always scrolls to top on `pathname` changes, so back/forward restoration is currently broken by design.
  - `src/components/language/CulturalTermTooltip.tsx` uses Radix Tooltip with a non-focusable inline `<span>` trigger; this is not reliable for touch.
  - `src/components/navigation/HeaderNav.tsx` mobile top chrome keeps full language switcher (`min-w-[120px]`) and fixed bottom tabs; this can create pressure at 320–390px and needs an invariant, not a one-off guess.
  - `src/components/dev/NarrationDebugPanel.tsx` is fixed bottom-left with `minWidth: 220`, `zIndex: 99999`; it overlaps mobile reading chrome in dev preview.
- **Runtime signals:** Article data requests returned 200. Available console warnings are preview/manifest/router-future noise, not article-render failures. Edge-function inventory was reviewed; no backend path is implicated in this request.

## Phase Q — Mobile Chrome & Reading Surface Stabilization

**Goal:** eliminate horizontal page scroll in article view at 320/360/390/414px and stop fixed dev chrome from covering mobile reading controls.

1. **Document first**
   - Add `MC-01` to `docs/RELIABILITY_AUDIT.md`: article routes must satisfy `documentElement.scrollWidth <= clientWidth` at mobile widths, including header, bottom tabs, dev overlays, hero image, tags, and article prose.
   - Append Phase Q to `.lovable/plan.md` with the measured screenshot symptom and exact file scope.
   - Update project memory after implementation with the new mobile chrome invariant.

2. **Header chrome pressure relief**
   - In `HeaderNav.tsx`, use the compact language switcher on mobile (`<EnhancedLanguageSwitcher compact />`) while preserving the full switcher on `sm`/desktop.
   - Add `min-w-0` to mobile header flex containers where shrink behaviour matters.
   - Keep tap targets ≥44px for menu/theme/language controls.

3. **Bottom chrome safe area**
   - Keep bottom tabs, but add safe-area padding (`pb-[env(safe-area-inset-bottom)]`) and ensure the main content bottom padding accounts for the fixed nav height.
   - Add source regression coverage so future fixed mobile chrome cannot reintroduce horizontal overflow (`w-screen`, fixed left/right offsets, large min-widths without mobile guards).

4. **Dev overlay containment**
   - Make `NarrationDebugPanel` mobile-safe in dev only: position above bottom tabs, cap width with `maxWidth: calc(100vw - 24px)`, and avoid covering the bottom nav.
   - Do not change narration service logic or telemetry payloads.

## Phase R — Cultural-Term Tap Targets & Reliable Touch Tooltips

**Goal:** cultural-term highlights remain inline (MV-02 preserved) but become accessible, focusable, and touch reliable.

1. Convert `CulturalTermTooltip.tsx` to a controlled tooltip with internal `open` state.
2. Make the trigger accessible:
   - `role="button"`, `tabIndex={0}`, `aria-expanded`, descriptive `aria-label`.
   - `Enter`/`Space` toggles, `Escape` closes.
   - Tap toggles; tap outside closes through Radix controlled state.
3. Increase coarse-pointer hit area without changing inline layout:
   - Keep `inline`, never `inline-block`.
   - Add `touch-manipulation`, `focus-visible` ring, and an absolutely positioned `::before` expansion under `@media(pointer:coarse)`.
4. Keep visual design unchanged: same dotted underline, saffron hover/focus treatment, same tooltip content.

## Phase S — Back/Forward Scroll Restoration + Progress Bar Fidelity

**Goal:** new article links open at top, but browser back/forward restores the reader’s previous position and updates the progress bar immediately.

1. Replace the current `ScrollToTop` behaviour with router-aware restoration while keeping the same component name/import.
2. Use `useNavigationType()`:
   - `PUSH`/`REPLACE`: scroll to top.
   - `POP`: restore saved scroll position for that history entry.
3. Save scroll positions in `sessionStorage` keyed by `location.key`, throttled with `requestAnimationFrame`.
4. Set `history.scrollRestoration = 'manual'` to prevent browser/app conflict.
5. On restore, wait briefly for article content height to hydrate, then scroll and dispatch a synthetic `scroll` event so `useReadingProgress()` updates immediately.
6. Do not modify the `ArticleContext` reducer or article data-loading logic.

## Regression Net

Add one focused responsive test file, plus extend existing MV tests if needed:

- **MC-01:** source-scan mobile chrome for width-safe classes and dev overlay max-width/safe positioning.
- **TA-01:** cultural-term trigger must be focusable, tap-toggleable, coarse-pointer expanded, `touch-manipulation`, `focus-visible`, and still not `inline-block`.
- **SR-01:** scroll restoration must use `useNavigationType`, `location.key`, `sessionStorage`, `history.scrollRestoration = 'manual'`, and dispatch a synthetic `scroll` event.
- **Mount invariant:** `<ScrollToTop />` remains mounted exactly once inside `<BrowserRouter>`.

## Manual Verification Matrix

- Viewports: 320×568, 360×800, 390×844, 414×896, and 1024×768.
- Routes: `/articles`, Satīsar article, one DB article with long title/tags, one article with tables/evidence.
- Checks:
  - No horizontal page scrollbar: `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
  - Header controls fit without clipping.
  - Bottom tabs do not cover article content or dev overlay.
  - Cultural-term tooltip opens on tap, closes on second tap/outside, works with keyboard.
  - Article A → scroll halfway → Article B → Back restores Article A position and progress bar.

## Explicit Non-Scope

- No schema/RLS/migration changes.
- No edge-function edits.
- No narration provider/fallback edits.
- No sanitizer, slug resolver, import pipeline, search architecture, or article content model changes.
- No redesign, font swap, new dependency, or route-system migration.
---

# Phase Q / R / S — Mobile Chrome, Tap Targets, Scroll Restoration (2026-05-28)

Surgical, presentation-layer only. Zero backend / edge / DB / RLS / narration / sanitizer / resolver impact. MV-01 and MV-02 invariants preserved.

## Files changed

| File | Phase | Change |
|------|-------|--------|
| `src/components/ScrollToTop.tsx` | S / SR-01 | Router-type-aware restoration: POP restores per-`location.key` from `sessionStorage`, PUSH/REPLACE scroll-to-top; `history.scrollRestoration = 'manual'`; rAF-throttled save; synthetic `scroll` dispatch after restore for progress-bar fidelity |
| `src/components/language/CulturalTermTooltip.tsx` | R / TA-01 | Controlled Radix Tooltip; focusable `role="button"` + `tabIndex={0}` + Enter/Space/Escape; `::before` pseudo expands hit area to ≥44×44 on coarse pointers; `touch-manipulation` + `focus-visible` ring; inline preserved (MV-02 holds) |
| `src/components/navigation/HeaderNav.tsx` | Q / MC-01 | Mobile header switches to compact language switcher (`variant="compact"`); mobile bottom tabs add `pb-[env(safe-area-inset-bottom)]` + per-cell `min-w-0 truncate` |
| `src/components/dev/NarrationDebugPanel.tsx` | Q / MC-01 | Dev panel positioned above mobile bottom tabs (`bottom: calc(env(safe-area-inset-bottom) + 76px)`), `maxWidth: calc(100vw - 24px)`, removed forced 220 px min-width |
| `src/__tests__/responsive/tap-target-and-scroll-restore.test.ts` | new | Source-scan regression net for TA-01, SR-01, MC-01, and the single-mount invariant for `<ScrollToTop />` |
| `docs/RELIABILITY_AUDIT.md` | docs | Appended Phase Q/R/S section with MC-01 / TA-01 / SR-01 invariants and manual sweep matrix |

## Out of scope

- No schema / RLS / migration changes.
- No edge-function edits (TTS, OG, import, sitemap, search, etc. untouched).
- No narration provider fallback / sanitizer / slug resolver / import pipeline changes.
- No router migration; `BrowserRouter` + `Routes`/`Route` retained.
- No design-system tokens added; no new dependency.

