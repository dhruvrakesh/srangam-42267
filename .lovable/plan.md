

# Fix "Duplicate without user-selected canonical" -- GSC Indexing Issue

## Root Cause

Google Search Console reports "Duplicate without user-selected canonical" because:

1. **8 pages have NO canonical tag at all** -- Google sees them at both `srangam-db.lovable.app` and `srangam.nartiang.org` and cannot determine which is authoritative
2. **Atlas page uses `window.location.origin`** instead of the hardcoded production domain, so its canonical varies depending on which domain the crawler hits
3. The GSC property is for `nartiang.org` (parent domain) which encompasses `srangam.nartiang.org` -- this is correct, but the missing canonicals are the actual problem

## Pages Missing Canonical Tags (8 files)

| # | File | Route | Fix |
|---|------|-------|-----|
| 1 | `src/pages/BeginJourney.tsx` | `/begin-journey` | Add `<link rel="canonical">` |
| 2 | `src/pages/sources/Index.tsx` | `/sources-method` | Add `<link rel="canonical">` |
| 3 | `src/pages/sources/Epigraphy.tsx` | `/sources/epigraphy` | Add `<link rel="canonical">` |
| 4 | `src/pages/sources/Edicts.tsx` | `/sources/edicts` | Add `<link rel="canonical">` |
| 5 | `src/pages/sources/TradeDocs.tsx` | `/sources/trade-docs` | Add `<link rel="canonical">` |
| 6 | `src/pages/sources/SanskritTerminology.tsx` | `/sources/sanskrit-terminology` | Add `<link rel="canonical">` |
| 7 | `src/pages/articles/SariraAtmanVedicPreservation.tsx` | (article slug) | Add `<link rel="canonical">` |
| 8 | `src/pages/atlas/index.tsx` | `/atlas` | Replace `window.location.origin` with `https://srangam.nartiang.org` (7 occurrences) |

## Pages Already Correct (no changes needed)

- `index.html`, `Home.tsx`, `Articles.tsx`, `JyotishHoroscope.tsx`, `SanskritTranslator.tsx`
- `ReasessingRigvedaAntiquity.tsx`, `AsuraExilesIndoIranian.tsx`, `RishiGenealogiesVedicTradition.tsx`
- `OceanicArticlePage.tsx`, `ArticleHead.tsx` (dynamic articles via database)

## Changes

All changes are single-line insertions of `<link rel="canonical">` inside existing `<Helmet>` blocks, or replacing `window.location.origin` with the hardcoded production domain. Zero logic changes.

### File 1: `src/pages/BeginJourney.tsx` (line 68)
After the description meta tag, add:
```html
<link rel="canonical" href="https://srangam.nartiang.org/begin-journey" />
```

### File 2: `src/pages/sources/Index.tsx` (line 75)
After OG description, add:
```html
<link rel="canonical" href="https://srangam.nartiang.org/sources-method" />
```

### File 3: `src/pages/sources/Epigraphy.tsx` (line 60)
After OG description, add:
```html
<link rel="canonical" href="https://srangam.nartiang.org/sources/epigraphy" />
```

### File 4: `src/pages/sources/Edicts.tsx` (line 46)
After OG description, add:
```html
<link rel="canonical" href="https://srangam.nartiang.org/sources/edicts" />
```

### File 5: `src/pages/sources/TradeDocs.tsx` (line 74)
After OG description, add:
```html
<link rel="canonical" href="https://srangam.nartiang.org/sources/trade-docs" />
```

### File 6: `src/pages/sources/SanskritTerminology.tsx` (line 95)
After description meta, add:
```html
<link rel="canonical" href="https://srangam.nartiang.org/sources/sanskrit-terminology" />
```

### File 7: `src/pages/articles/SariraAtmanVedicPreservation.tsx` (line 39)
After keywords meta, add:
```html
<link rel="canonical" href="https://srangam.nartiang.org/sarira-atman-vedic-preservation" />
```

### File 8: `src/pages/atlas/index.tsx` (lines 68, 74, 77-79, 88)
Replace all 7 instances of `` `${window.location.origin}/atlas` `` with hardcoded `https://srangam.nartiang.org/atlas` variants. This prevents the canonical from varying by access domain.

### File 9: `docs/SEO_CONFIGURATION.md`
Add a note documenting the fix and update the checklist to mark "All pages have canonical tags" as complete.

## Risk Assessment

- **Risk**: Zero -- inserting declarative HTML meta tags into existing Helmet blocks
- **No logic changes**: No conditionals, functions, or components modified
- **Immediate effect**: Google will re-crawl and see canonical signals on every page, resolving the "Duplicate without user-selected canonical" warning within 1-2 crawl cycles

## What This Does NOT Do

- Does not change routing, auth, database, or business logic
- Does not create new files or components
- Does not expand the codebase

