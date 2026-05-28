# Phase P — Mobile Reading Experience Hardening

## Context (revived & verified against current code)

User screenshot (`srangam.nartiang.org`, 384 px CSS, DPR 2.81) shows every line of the Satīsar article clipped at the right edge — H1, dek, paragraphs, and the `Jalodbhava` cultural-term chip. The `<article>` element itself is wider than the viewport: this is horizontal overflow, not font sizing.

**Verified file references:**

| File | Line | Current state | Issue |
|------|------|---------------|-------|
| `src/components/articles/ArticlePage.tsx` | 70 | `<article class="max-w-4xl mx-auto px-4 py-8 relative">` | No `min-w-0` / `overflow-x-clip` guard on the article root |
| `src/components/articles/ArticlePage.tsx` | 92 | Icon halo `p-8 rounded-full` + `size={64}` | Halo dominates mobile fold (≈ 160 px tall on 384 px viewport) |
| `src/components/articles/ArticlePage.tsx` | 97 | `<h1 class="font-serif text-4xl md:text-6xl …">` inside `bg-clip-text` span | Aggressive ramp; no `break-words` on long IAST tokens |
| `src/components/articles/ArticlePage.tsx` | 103 | dek `<p class="text-xl …">` | No mobile word-break |
| `src/components/articles/ArticlePage.tsx` | 145 | Inner `<div class="max-w-4xl mx-auto px-6">` nested inside the L70 `px-4` | **Double gutter** — 40 px of horizontal padding eaten on a 384 px screen |
| `src/components/articles/enhanced/ProfessionalTextFormatter.tsx` | 407 | `min-w-[900px]` table | Correctly wrapped in `overflow-x-auto` (MV-01 covers this — not the regression) |
| `src/components/articles/enhanced/ProfessionalTextFormatter.tsx` | 591 | `prose prose-xl max-w-none article-content` | `prose-xl` (20 px body) on a 344 px content box is too tight |
| `src/components/language/CulturalTermTooltip.tsx` | 58–65 | Chip rendered as `<span class="relative inline-block cursor-help group/term">` | `inline-block` chip + adjacent token forms an unbreakable inline row → expands parent |
| `src/index.css` | 168–175 | `.article-content p, .article-content li { overflow-wrap: break-word; hyphens: auto; }` | `break-word` only breaks when the token *alone* exceeds the line; chip + token together still overflow |
| `src/__tests__/responsive/article-overflow-360.test.ts` | — | Source-scans for `min-w-[≥360px]` paired with `overflow-x-auto` | MV-01 covers tables only; no coverage for prose overflow, double padding, or chip adjacency |

**Real trigger:** the article body contains unbreakable runs (`fileturn0file1`, raw URLs, `Nīlamata Purāṇa` with diacritics) AND the cultural-term chip renders `inline-block`. The combination "chip + space + 22-char token" is treated as one inline row; `overflow-wrap: break-word` does not break it; the row stretches the parent past the viewport. The MV-01 invariant ("min-w children must sit in overflow-x-auto wrappers") is real and intact — this is a different class of overflow that MV-01 explicitly does not cover.

This is a presentation-only fix. No edge functions, DB, slug resolver, sanitizer, narration, RLS, or any Phase A–O invariant is touched.

## Goals

1. Eliminate horizontal page scroll at 320 / 360 / 375 / 390 / 414 px on every article route.
2. Keep desktop (≥ 768 px) reading rhythm pixel-identical except for the H1 size ramp (current `text-4xl → text-6xl` jump is replaced with a smoother `text-3xl sm:text-4xl md:text-5xl lg:text-6xl`).
3. Add **MV-02** regression net covering the prose-overflow class.
4. Document the new invariant in `docs/RELIABILITY_AUDIT.md`, `.lovable/plan.md`, and `mem://index.md` *before* code changes (documentation-first per user memory).

## Non-Goals

- No redesign, no font swap, no new dependency, no new component.
- No edits to `EvidenceTable`, `NarrationService`, `ProtectedRoute`, slug resolver, sanitizer, OG generator, or any Phase O artefact.
- No backend, edge function, RLS, or migration work.
- No changes to the `min-w-[900px]` table or its wrapper (MV-01 still owns that).

## Phased Plan (3 reversible commits)

### Commit 1 — Documentation (zero runtime risk)

- `docs/RELIABILITY_AUDIT.md`: add **MV-02 — Mobile prose overflow invariant** section with the diagnosis table above, the four code changes, and the regression-net description. Re-scope MV-01 as "table-scope only; complemented by MV-02".
- `.lovable/plan.md`: append Phase P entry with link to MV-02.
- `mem://index.md`: extend Core to: *"Mobile invariant: MV-01 (table overflow, source scan for `min-w-[≥360px]` ⊂ `overflow-x-auto`) + MV-02 (prose overflow, source scan for `article-body` declaring `overflow-x-clip min-w-0`, mobile-only `overflow-wrap: anywhere` on `.article-content` text, cultural-term chips render `inline` never `inline-block`)."*

### Commit 2 — Surgical code changes (single visual commit, `sm:` gated)

**P.1 — Article container overflow guard** (`src/components/articles/ArticlePage.tsx`, ~6 LOC)

- L70: `<article data-testid="article-body" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative overflow-x-clip [overflow-x:clip] w-full min-w-0">` — dual `overflow-x-clip` (Tailwind) + bracketed CSS fallback covers Android WebView < 90; `min-w-0` defeats min-content inflation from flex/grid ancestors.
- L92: icon halo `p-5 sm:p-8`; icon `size={48}` on mobile via `useIsMobile()` hook (already present at `src/hooks/use-mobile.tsx`), `size={64}` on desktop.
- L97: H1 → `text-3xl sm:text-4xl md:text-5xl lg:text-6xl break-words [overflow-wrap:anywhere] [hyphens:auto]`.
- L103: dek `<p>` → add `break-words [overflow-wrap:anywhere]`.
- L145: inner wrapper → `<div class="max-w-4xl mx-auto px-0 min-w-0">` (removes the redundant `px-6` that double-padded with L70's `px-4`).

**P.2 — Prose typography overflow rule** (`src/index.css`, ~12 LOC; `ProfessionalTextFormatter.tsx:591`, 1 className)

```css
@media (max-width: 640px) {
  .article-content p,
  .article-content li,
  .article-content h1,
  .article-content h2,
  .article-content h3 {
    overflow-wrap: anywhere;       /* stronger than break-word; breaks mid-token in chip+token rows */
    word-break: normal;            /* keep CJK/Devanagari sensible */
    hyphens: auto;
  }
  .article-content :is(.cultural-term-highlight, a, code) {
    max-width: 100%;
  }
}
```

- `ProfessionalTextFormatter.tsx:591`: `prose prose-lg sm:prose-xl max-w-none article-content` (downshift mobile from 20 px → 18 px body; desktop unchanged).

**P.3 — Cultural-term chip mobile rendering** (`src/components/language/CulturalTermTooltip.tsx:59`, ~3 LOC)

- Change `"relative inline-block cursor-help group/term"` → `"relative inline cursor-help group/term break-words [overflow-wrap:anywhere]"`. The `<TooltipTrigger>` keeps its hit area via the underline; tooltip popover behaviour is unchanged because the trigger is still a `<span>`. No JS / no Radix prop changes.

### Commit 3 — Regression net (MV-02)

`src/__tests__/responsive/article-prose-overflow.test.ts` (new):

1. Read `src/components/articles/ArticlePage.tsx`; assert the line containing `data-testid="article-body"` also contains both `overflow-x-clip` and `min-w-0`.
2. Read `src/index.css`; assert it contains a `@media (max-width: 640px)` block with `overflow-wrap: anywhere` scoped under `.article-content`.
3. Read `src/components/language/CulturalTermTooltip.tsx`; assert the trigger className does NOT contain `inline-block` (chip must be `inline`).
4. Walk `src/components/articles/**/*.tsx`; for each `className` literal that contains both `inline-block` and `px-`, assert it also contains `max-w-full` (allowlist `MagadhaReligiousTimeline` event badge and `ArticleMiniMap` dot — both are non-text-flow decorative blocks).

Authoritative manual browser check (recorded in audit, not automated): iOS Safari 17 + Android Chrome 124 at 320 / 360 / 390 / 414 px on three sampled routes — Satīsar, Reassessing Ashoka Legacy, Rishi Genealogies.

## Acceptance Criteria

- At 360 px CSS width, `/articles/<satisar-slug>` shows `document.documentElement.scrollWidth === window.innerWidth`. Verified on three sampled article routes at 320 / 360 / 390 px.
- H1, dek, body paragraphs, and the `Jalodbhava` chip all wrap inside the viewport — no clipping.
- Desktop (≥ 1024 px) renders pixel-identical to current production for the same three articles (visual diff stored in the audit), except for the smoother H1 ramp which only affects the `md` breakpoint (now `text-5xl` instead of jumping straight to `text-6xl`).
- MV-01 and MV-02 Vitest suites both green.
- TTS playback (admin), PDF export, narration cost gating, slug resolver, multilingual merging, cultural-term tooltips (hover + tap), and Phase A–O invariants unaffected — no files in those paths are touched.

## Risk Register

| Risk | Mitigation |
|------|------------|
| `overflow-x-clip` not supported in old Android WebView | Dual declaration with bracketed `[overflow-x:clip]` + `w-full min-w-0` parent constraint |
| `overflow-wrap: anywhere` over-breaks long Sanskrit compound words on tablets | Scoped behind `@media (max-width: 640px)` only |
| `prose-lg` mobile downshift changes vertical rhythm of articles already QA'd | `sm:prose-xl` restores 20 px at ≥ 640 px; only the < 640 px range changes |
| Chip turning `inline` breaks tooltip positioning | Radix Tooltip anchors to the `<span>` bounding box; `inline` spans still report rects — verified in Radix docs; manual tap test in browser check |
| Removing inner `px-6` shifts cross-references / data components left by 24 px on desktop | Outer container at L70 now uses `px-4 sm:px-6 lg:px-8`, giving 32 px desktop gutter (was 16+24=40 px) — net −8 px on desktop, within visual tolerance; flagged in audit |

## Out of Scope

No font swap, no theme change, no new dependency, no schema/RLS/edge-function edits, no changes to article import, tag generation, narration pipeline, OG generator, or any data-fetching logic.
