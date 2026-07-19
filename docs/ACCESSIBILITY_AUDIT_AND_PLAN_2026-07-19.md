# Srangam — Accessibility Audit & Phased Plan

**Date:** 2026-07-19 · **Status:** planning deliverable for the accessibility slice of
master-plan **Phase 3 (UI/UX)** — which requires "a dedicated UX audit enumerating
concrete, testable fixes before any component is touched." This is that audit for a11y.
Working agreement applies: one concern per commit, gates before commit, nothing removed,
Radix/shadcn foundations preserved.

**Provenance.** Grounded in greps run 2026-07-19 against the live working tree
(`src/**`, `e2e/`, `package.json`, `index.html`), the PageSpeed "Agentic Browsing"
report (Accessibility tree is not well-formed — details not yet expanded), and prior
repo work (`DARK_MODE_AUDIT.md` Phase 10 WCAG contrast pass). Anything not yet measured
is explicitly listed under "unknowns" — no invented findings.

---

## 0. Measured baseline

**Strengths already in place (preserve, don't rebuild):**

| Fact | Evidence |
|---|---|
| Radix/shadcn primitives everywhere → dialogs, tabs, menus carry correct ARIA for free | component tree; 34 files use `aria-*` (36× aria-label, 11× aria-selected, …) |
| `<main>` landmark exists in the shared layouts | `Layout.tsx:12`, `AdminLayout.tsx` |
| `<html lang>` is dynamic — updates on language switch | `GatedLanguageSwitcher.tsx:42` sets `documentElement.lang` |
| WCAG contrast audited and fixed across 52+ components (dark mode pass, Jan 2026) | `DARK_MODE_AUDIT.md` |
| Keyboard shortcuts exist (`/`, `m`, `gs`) | `CURRENT_STATUS.md` nav section |

**Gaps found (each concrete and testable):**

| # | Gap | Evidence |
|---|---|---|
| G1 | **Zero a11y tooling**: no eslint-plugin-jsx-a11y, no axe, no a11y test — nothing prevents regressions | `package.json` (no matches), `e2e/` = 3 specs, none a11y |
| G2 | **No skip-to-content link** — keyboard users must tab through the whole header+nav on every page | grep across layout/navigation: no match |
| G3 | **Some `<img>` without `alt`** — ~19 img tags, ~15 carry alt within the tag block; the remainder need alt text (or explicit `alt=""` if decorative) | multiline grep sample |
| G4 | **"Accessibility tree is not well-formed"** (PageSpeed/Lighthouse agentic audit) — typical causes: duplicate `id`s, `aria-hidden` on focusable elements, ARIA attributes on wrong roles. **Root cause not yet identified — must be measured, not guessed** | screenshot 2026-07-19 |
| G5 | Landmark completeness unverified: `<main>` exists; whether header/nav/footer use semantic elements (vs styled divs) not yet confirmed | Layout grep showed only `<main>` |

**Unknowns to resolve in A0 (not asserted as defects):** heading-order per page, focus
visibility on the custom palette, form label coverage on Auth/admin forms, Devanagari
screen-reader pronunciation behaviour on mixed-script passages.

---

## Phase A0 — Instrument first (additive; zero UI change)

1. **A0-a** Add `@axe-core/playwright` and one new spec `e2e/a11y.spec.ts` scanning four
   representative pages: home, one DB article, `/articles`, `/search`. Output the full
   violation list as the test artifact — **this is what names G4's real cause.**
   *Gate:* spec runs locally; report saved to `docs/a11y-baseline-<date>.md`. No
   pass/fail threshold yet — measurement only.
2. **A0-b** Add `eslint-plugin-jsx-a11y` in **warn** mode (recommended preset).
   Warn-only = zero build breakage; it annotates every future PR.
   *Gate:* `npm run lint` still exits 0; warning count recorded in the baseline doc.

## Phase A1 — Foundations (small, independent commits)

3. **A1-a** Skip link: first child of `Layout` — visually hidden, visible on focus,
   `href="#main-content"`; add the id to the existing `<main>`. One component, one commit.
   *Gate:* build + tests; keyboard Tab shows it; screenshot before/after.
4. **A1-b** Landmark pass: ensure header→`<header>`, nav→`<nav aria-label>`,
   footer→`<footer>` in the two layouts (class names untouched — element swaps only).
   *Gate:* build + tests + axe landmark rule goes green.
5. **A1-c** Alt-text sweep: the handful of `<img>` without alt get real text (content
   images) or `alt=""` (decorative). Content-only change.
   *Gate:* axe `image-alt` rule green.
6. **A1-d** Focus visibility: verify `:focus-visible` ring on the dharmic palette in
   light+dark; add the token only where missing.
   *Gate:* keyboard walk of header/nav/cards recorded before/after.

## Phase A2 — Fix what A0 measured (findings-driven)

The axe baseline dictates this list — expected classes based on G4's typical causes:
duplicate ids (likely from repeated components), `aria-hidden` on focusable nodes,
heading-order corrections on article pages, form-label gaps on Auth/admin. Each fix =
one commit naming the axe rule it closes. **Nothing enters this phase without appearing
in the measured baseline** — that is the no-hallucination guardrail applied to a11y.

## Phase A3 — Lock it in (fold into master-plan Phases 5–6)

7. **A3-a** Promote the axe spec to a CI gate: `serious`/`critical` violations = 0 on
   the four scanned pages (matches the Phase 4 pattern of CI budgets).
8. **A3-b** Documentation truth: add the a11y baseline + this plan to the docs index;
   record the "agentic browsing" audit as tracked; update `CURRENT_STATUS.md`.

## Sequencing & effort

A0 is one sitting (two additive commits, no UI change). A1 is four small commits, each
independently shippable and revertible. A2 is scoped by evidence, not speculation. This
slots inside master-plan Phase 3 without touching Phase 2 (logic) or Phase 4 (perf) —
and the A1 element swaps double as SEO wins (semantic landmarks help crawlers too,
including the AI-agent crawlers the "Agentic Browsing" category exists for).

## What this plan deliberately does NOT do

No visual redesign; no component-library swap; no blind fixes for G4 before axe names
the offending nodes; no strict lint mode that would break the build; no changes to the
Radix primitives that already carry the site's ARIA correctly.
