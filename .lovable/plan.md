
# Phase F: SEO Remediation — ✅ COMPLETE (2026-02-23)


## Diagnosis from Google Search Console Screenshot

The screenshot shows 5 active indexing problems for `nartiang.org`:

| GSC Issue | Count | Root Cause in Codebase |
|-----------|-------|----------------------|
| Page with redirect | 2 | Duplicate `/oceanic/*` route registered twice (App.tsx lines 212 and 232). Likely also `/articles/somnatha-prabhasa-itihasa` duplicating `/somnatha-prabhasa-itihasa` |
| Duplicate without user-selected canonical | 1 | ~27 legacy root-level article routes (e.g. `/monsoon-trade-clock`) serve the same content as `/articles/monsoon-trade-clock` via ArticlesRouter. The root-level pages have hardcoded canonical to the root path, while the `/articles/` version has no explicit canonical or a different one |
| Alternate page with proper canonical tag | 1 | Related to above -- one of the duplicate pair has canonical, the other is the "alternate" |
| Discovered - currently not indexed | 16 | Combination of: thin pages without unique content signals, duplicate content confusion, and SPA rendering delays |
| Crawled - currently not indexed | 6 | Google crawled but declined to index -- likely pages with duplicate content or weak signals |

## Root Cause Analysis

### Problem 1: Massive Route Duplication in App.tsx

There are ~27 legacy article routes at root level (`/monsoon-trade-clock`, `/scripts-that-sailed`, etc.) AND the same articles are accessible via `/articles/:slug` through ArticlesRouter. This means every article has at least 2 URLs, and some have 3 (root + `/articles/` + `/oceanic/`).

Additionally:
- `/oceanic/*` route is registered TWICE (lines 212 and 232)
- `/articles/somnatha-prabhasa-itihasa` is hardcoded (line 205) AND handled by ArticlesRouter wildcard (line 209)
- `/articles/ringing-rocks-rhythmic-cosmology` same issue (line 206)

### Problem 2: Canonical Tags on Legacy Pages Point to Wrong Path

`SariraAtmanVedicPreservation.tsx` has canonical `https://srangam.nartiang.org/sarira-atman-vedic-preservation` (root-level), but the same article is also served at `/articles/sarira-atman-vedic-preservation` via ArticlesRouter. Google sees two pages with different canonicals.

### Problem 3: robots.txt Exposes Internal Infrastructure URL

The sitemap URL in `robots.txt` is the raw backend function URL. While functional, it exposes internal infrastructure and is not the canonical domain.

### Problem 4: NotFound Page Returns HTTP 200

The `NotFound.tsx` component renders a 404 page but the SPA always returns HTTP 200 (since all routes are handled client-side). This causes "Soft 404" signals for Google.

## Implementation Plan

### Phase F1: Route Deduplication (High Impact, Low Risk)

**Goal**: Eliminate duplicate URLs so Google sees exactly one URL per page.

**Step 1: Remove duplicate route registrations in App.tsx**
- Remove the second `/oceanic/*` route (line 232 -- exact duplicate of line 212)
- Remove hardcoded `/articles/somnatha-prabhasa-itihasa` (line 205) and `/articles/ringing-rocks-rhythmic-cosmology` (line 206) -- already handled by `ArticlesRouter` wildcard

**Step 2: Convert ~27 root-level article routes to redirects**

Replace each root-level article route with a `Navigate` redirect to the canonical `/articles/:slug` path. This is the surgical approach -- no component deletion, just route changes.

For example:
- `<Route path="/monsoon-trade-clock" element={<MonsoonTradeClock />} />` becomes
- `<Route path="/monsoon-trade-clock" element={<Navigate to="/articles/monsoon-trade-clock" replace />} />` 

This ensures:
- Old bookmarks and external links still work (redirect, not 404)
- Google follows the redirect to the canonical URL
- Only one URL serves each article's content

The full list of routes to redirect (~27):
`/monsoon-trade-clock`, `/scripts-that-sailed`, `/scripts-that-sailed-ii`, `/gondwana-to-himalaya`, `/indian-ocean-power-networks`, `/ashoka-kandahar-edicts`, `/reassessing-ashoka-legacy`, `/kutai-yupa-borneo`, `/maritime-memories-south-india`, `/riders-on-monsoon`, `/pepper-and-bullion`, `/earth-sea-sangam`, `/jambudvipa-connected`, `/cosmic-island-sacred-land`, `/stone-purana`, `/janajati-oral-traditions`, `/sacred-tree-harvest-rhythms`, `/stone-song-and-sea`, `/chola-naval-raid`, `/asura-exiles-indo-iranian`, `/sarira-and-atman-vedic-preservation`, `/rishi-genealogies-vedic-tradition`, `/reassessing-rigveda-antiquity`, `/geomythology-land-reclamation`, `/dashanami-ascetics-sacred-geography`, `/continuous-habitation-uttarapatha`, `/somnatha-prabhasa-itihasa`, `/ringing-rocks-rhythmic-cosmology`

Also redirect `/themes/geology-deep-time/stone-purana` and `/themes/ancient-india/pepper-routes` to their canonical `/articles/` paths.

**Step 3: Remove unused lazy imports**

After converting to `Navigate` redirects, the ~27 lazy article page imports (lines 48-77) are no longer needed. Remove them to reduce bundle size. The articles are rendered by `OceanicArticlePage` via `ArticlesRouter`.

### Phase F2: Canonical Tag Consistency

**Step 1: Ensure OceanicArticlePage always emits canonical**

Verify `OceanicArticlePage.tsx` line 137 generates canonical as `https://srangam.nartiang.org/articles/{slug}`. This is already the case (line 21 + line 137). Confirmed correct.

**Step 2: Remove canonical tags from legacy article page files**

Since legacy pages will now redirect (Phase F1), their Helmet canonical tags become irrelevant. But if we keep the files for any reason, their canonical should match `/articles/:slug`.

### Phase F3: Sitemap Alignment

**Step 1: Update generate-sitemap edge function**

- Remove any root-level article paths from static routes (they are now redirects)
- Ensure only `/articles/:slug` paths appear for articles
- Add missing routes that ARE in App.tsx but NOT in the sitemap: `/search`, `/sources`, `/sources/trade-docs`, `/oceanic`, `/brand`, `/research-submission`, `/partnership`, `/support-research`

**Step 2: Update robots.txt**

The sitemap URL should remain the edge function URL (this is correct -- Google needs direct XML access, not a React-rendered page). No change needed here.

### Phase F4: Documentation Updates

Update the following files to preserve institutional context:

1. **`docs/SEO_CONFIGURATION.md`**: Add "Route Deduplication" section documenting the redirect strategy and canonical URL policy for articles
2. **`docs/IMPLEMENTATION_STATUS.md`**: Add Phase F section, update Known Issues to reflect GSC findings
3. **`.lovable/plan.md`**: Update with Phase F status
4. **`docs/RELIABILITY_AUDIT.md`**: Add routing invariant: "Every article MUST have exactly one canonical URL at `/articles/:slug`"

## Technical Details

### Files Changed Summary

| # | File | Change Type | Risk |
|---|------|------------|------|
| 1 | `src/App.tsx` | EDIT: Remove duplicate routes, convert ~27 root routes to Navigate redirects, remove unused imports | Medium -- core routing file, but changes are mechanical |
| 2 | `supabase/functions/generate-sitemap/index.ts` | EDIT: Add missing routes, ensure article URLs use `/articles/` prefix | Low |
| 3 | `docs/SEO_CONFIGURATION.md` | EDIT: Add route deduplication section | Zero |
| 4 | `docs/IMPLEMENTATION_STATUS.md` | EDIT: Add Phase F, update known issues | Zero |
| 5 | `.lovable/plan.md` | EDIT: Update with Phase F | Zero |
| 6 | `docs/RELIABILITY_AUDIT.md` | EDIT: Add routing invariant | Zero |

### What This Does NOT Do

- Does not delete any article page component files (they remain for potential future direct use)
- Does not change ArticlesRouter, OceanicRouter, or OceanicArticlePage
- Does not modify any article content or database
- Does not add SSR or pre-rendering (platform limitation)
- Does not touch authentication, RLS, or edge functions (except sitemap)

### Risk Assessment

- **Risk**: Medium-Low. The redirects are standard `<Navigate replace />` components. If an article slug doesn't match in ArticlesRouter, OceanicArticlePage will show its error state.
- **Rollback**: Revert App.tsx to restore root-level routes.
- **Testing**: After deployment, verify:
  1. Visiting `/monsoon-trade-clock` redirects to `/articles/monsoon-trade-clock`
  2. `/articles/monsoon-trade-clock` renders the article correctly
  3. No 404s for any legacy bookmarked URL
  4. Sitemap XML includes all published articles under `/articles/` prefix
  5. Google Search Console re-crawl shows reduced duplication warnings

### Expected GSC Impact

| Issue | Before | After |
|-------|--------|-------|
| Page with redirect | 2 (confusing redirects) | ~30 (intentional, clean 301-equivalent redirects -- GSC will show these temporarily then consolidate) |
| Duplicate without canonical | 1 | 0 (only one URL per article exists) |
| Alternate page with canonical | 1 | 0 |
| Discovered not indexed | 16 | Should decrease as duplicate signals are eliminated |
| Crawled not indexed | 6 | Should decrease over 2-4 weeks |
