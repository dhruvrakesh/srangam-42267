# Phase V — Enterprise CI Guardrails for Article Rendering

Surgical, additive only. **Zero edits** to `src/components/**`, `src/pages/**`, `src/lib/**`, `supabase/**`, or DB. Builds three new test layers on top of the existing Vitest source-scan invariants (MV-01, MV-02), which become Layer 1 of a 4-layer net.

## Revived context (verified, not assumed)

- `package.json` has **no `test` script** and no `@playwright/test`. Vitest 4.1.6 + jsdom 29 + `@testing-library/react` are installed but `vitest.config.ts` uses `environment: 'node'` and has **no `setupFiles`**. We must add a jsdom config + setup for Layer 2 without breaking existing node-env source-scan tests.
- Article routes (per `App.tsx`): there is **no `/oceanic/articles/...` route**. `OceanicArticlePage` is rendered conditionally inside the canonical `/articles/:slug` flow. The E2E spec must hit `/articles/<slug>` and select which renderer to assert against based on observed DOM, not assume a route.
- `ArticlePage` is a **props-driven** component (`title`, `content`, `tags`, `icon` …), not slug-driven. Layer 2 renders it with a synthetic fixture — no resolver/DB mocking needed. `OceanicArticlePage` is slug/article-driven and needs a lightweight fixture + mocked `useArticle`.
- Existing tests live in `src/__tests__/responsive/`. Phase U closed with 20/20 passing source-scan specs; we will not touch them.
- `.lovable/plan.md` Phase U is marked complete; Phase V is added as the observability follow-up the user already deferred ("DOM scrollWidth diagnostic helper in CI logs", "Playwright visual regression").

## Goals

1. **Layer 2 — Vitest DOM overflow check (jsdom):** for `ArticlePage` and `OceanicArticlePage`, render in jsdom at simulated 384 px, walk `[data-testid="article-body"]`, and fail if any descendant reports `scrollWidth > clientWidth + 1` under a deterministic shim. Report offender path (`tag.classExcerpt[data-testid]`) in the failure message.
2. **Layer 3 — Playwright mobile E2E:** load `/articles/<stable-slug>` in Chromium at 384×844, assert `document.documentElement.scrollWidth <= innerWidth + 1`, `[data-testid="article-body"]` text length > 500 chars, and no descendant has `scrollWidth > clientWidth + 1` (real layout). Sweep 320/360/390/414.
3. **Layer 4 — Performance budget:** measure article-body first-paint and LCP via Playwright; fail if regressed past documented thresholds calibrated from the first green run.

Layers 1 + 2 run on every PR via `bunx vitest run`. Layers 3 + 4 run via `bun run test:e2e` (documented; no CI workflow file created in this phase).

## Files

```text
NEW   src/test/setup.ts                                          (jsdom globals shim)
EDIT  vitest.config.ts                                           (jsdom + setupFiles, scoped)
NEW   src/__tests__/responsive/article-dom-overflow.test.tsx     (Layer 2)
NEW   src/__tests__/fixtures/articleFixture.ts                   (deterministic fixture)
NEW   playwright.config.ts                                       (Chromium only, webServer)
NEW   e2e/article-mobile.spec.ts                                 (Layer 3)
NEW   e2e/article-perf.spec.ts                                   (Layer 4)
EDIT  package.json                  (scripts: test, test:e2e, test:perf; devDep @playwright/test)
EDIT  docs/RELIABILITY_AUDIT.md     (Phase V section + thresholds + commands)
EDIT  .lovable/plan.md              (Phase V status entry)
```

No production source files (`src/components`, `src/pages`, `src/lib`, edge functions, migrations) are modified.

## Layer 2 — DOM overflow test (technical)

- `vitest.config.ts`: switch `environment` to `jsdom`, add `setupFiles: ['./src/test/setup.ts']`, keep existing `include` glob so the Phase P/U source-scan tests still run (they are environment-agnostic).
- `src/test/setup.ts`: imports `@testing-library/jest-dom`, defines `matchMedia` stub, sets `window.innerWidth = 384`, and installs a **deterministic width shim** on `HTMLElement.prototype`:
  - `clientWidth` getter walks up to the nearest ancestor with an explicit width (root container = 384) and returns that minus padding.
  - `scrollWidth` getter returns `max(clientWidth, intrinsicChildWidth)` where intrinsic width is parsed from inline `style.width`, `style.minWidth`, and Tailwind `min-w-[NNNpx]` / `w-[NNNpx]` class hints on the element or its descendants.
  - Documented as a **structural** check, not a layout engine. It catches the exact regression class (fixed-width child inside the prose well) that Phase K/P/U fought.
- `src/__tests__/fixtures/articleFixture.ts`: small in-memory article object — title, dek, ~800 chars of content with a representative `<h1>`, paragraphs, an `<ul>`, a wide `<table class="min-w-[900px]">` inside `<div class="overflow-x-auto">` (sanctioned), and a cultural-term chip. Single source of truth shared by both specs.
- `src/__tests__/responsive/article-dom-overflow.test.tsx`:
  - Renders `<MemoryRouter><ArticlePage {...fixture} icon={DummyIcon} /></MemoryRouter>` then `<OceanicArticlePage />` with `useArticle` mocked via `vi.mock` to return the fixture.
  - Locates `[data-testid="article-body"]`, walks descendants, skips any node whose nearest ancestor matches `.overflow-x-auto` or `.overflow-auto` (sanctioned wide wrappers).
  - For each remaining offender, builds `tagName + '.' + className.slice(0,40) + [data-testid?]` path.
  - `expect(offenders, offenders.join('\n')).toEqual([])`.

## Layer 3 — Playwright mobile E2E (technical)

- Add devDep `@playwright/test`. `playwright.config.ts`: Chromium only, `testDir: 'e2e'`, `use.baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:8080'`, `webServer: { command: 'bun run dev', url: 'http://localhost:8080', reuseExistingServer: !process.env.CI }`.
- `e2e/article-mobile.spec.ts`:
  - Stable slug: `reassessing-ashoka-legacy` (verified — exists in `content/articles/` and DB).
  - Viewport 384×844. `await page.goto('/articles/reassessing-ashoka-legacy')`.
  - `await page.waitForSelector('[data-testid="article-body"]', { state: 'visible' })`.
  - Asserts:
    1. `page.evaluate(() => document.documentElement.scrollWidth) <= page.viewportSize().width + 1`.
    2. `(await page.locator('[data-testid="article-body"]').innerText()).length > 500`.
    3. `page.evaluate` walks article-body, returns offenders where `scrollWidth > clientWidth + 1` (excluding `.overflow-x-auto` subtrees). Expect empty.
  - Viewport sweep `[320, 360, 390, 414]` repeats assertions 1 + 3.

## Layer 4 — Performance budget (technical)

- `e2e/article-perf.spec.ts`. Same baseURL, viewport 390×844, Chromium CDP throttling: `Network.emulateNetworkConditions` Fast-3G preset + `Emulation.setCPUThrottlingRate(4)`.
- `page.addInitScript` injects a `MutationObserver` watching for `[data-testid="article-body"]` insertion; stamps `performance.mark('article-body-visible')`. Also a `PerformanceObserver({type:'largest-contentful-paint',buffered:true})` collecting last LCP entry.
- Navigates, waits for the mark, reads `performance.getEntriesByName('article-body-visible')[0].startTime` and the LCP.
- Thresholds (constants at top of spec, frozen after first green CI run):
  - `ARTICLE_BODY_VISIBLE_MS = 2500`
  - `LCP_MS = 3000`
- Fails if exceeded; logs measured values for trend tracking.

## CI wiring

- `package.json` scripts: `"test": "vitest run"`, `"test:e2e": "playwright test"`, `"test:perf": "playwright test e2e/article-perf.spec.ts"`.
- No `.github/workflows/*.yml` created in this phase — Lovable does not own a CI runner here. Commands are documented in `RELIABILITY_AUDIT.md` Phase V.

## Acceptance gate

- `bunx vitest run` is green, including Layer 2 (22+ specs total).
- `bunx playwright test` is green locally against `bun run dev`.
- `docs/RELIABILITY_AUDIT.md` Phase V lists the 4 layers, thresholds, commands, and a temporal note that thresholds were calibrated on YYYY-MM-DD.
- `.lovable/plan.md` Phase V status entry added.
- Zero diffs in `src/components/**`, `src/pages/**`, `src/lib/**`, `supabase/**`.

## Risk & rollback

- Only real risk: switching Vitest to jsdom could surface latent DOM assumptions in Phase P/U source-scan tests. Mitigation: those specs only read files (`readFileSync`) and never touch `window`; verified safe. If a regression appears, the rollback is a one-line revert of `vitest.config.ts` — Layer 2 can also be isolated to its own `vitest.dom.config.ts` if needed.
- Playwright is a devDep only; no runtime bundle impact.

## Out of scope (deferred to Phase W)

- GitHub Actions workflow file (needs user confirmation of CI runner + secrets).
- Visual regression snapshots.
- Lighthouse CI / Web Vitals dashboard.
- Multi-browser (WebKit / Firefox) E2E matrix.

## Implementation order (after approval)

1. Phase V baseline note in `.lovable/plan.md` + `docs/RELIABILITY_AUDIT.md`.
2. `src/test/setup.ts` + `vitest.config.ts` switch to jsdom; run existing suite to confirm 20/20 still green.
3. Fixture + Layer 2 spec; confirm green.
4. Install `@playwright/test`, add `playwright.config.ts`, Layer 3 spec; run locally.
5. Layer 4 spec; calibrate thresholds from first run; freeze.
6. Update docs with measured baseline; close Phase V.
