

# Canonical URL Migration: `srangam-db.lovable.app` → `srangam.nartiang.org`

**Context**: Your custom domain `srangam.nartiang.org` is confirmed live and serving the site. Google Search Console is registered and processing data for this domain. All canonical URLs in the codebase still point to `srangam-db.lovable.app`, creating a mismatch that prevents proper indexing.

---

## What This Migration Does

A single-pass string replacement across all files that reference `srangam-db.lovable.app`, changing them to `srangam.nartiang.org`. Zero logic changes.

---

## Files to Update (14 files)

### Code Files (10 files — string replacements only)

| # | File | Lines | Change |
|---|------|-------|--------|
| 1 | `index.html` | 11, 38, 39, 49 | Canonical, OG URL, OG image URL, Twitter image URL |
| 2 | `src/components/seo/SiteSchema.tsx` | 4 | `BASE_URL` constant |
| 3 | `src/components/i18n/ArticleHead.tsx` | 12 | `BASE_URL` constant |
| 4 | `src/components/oceanic/OceanicArticlePage.tsx` | 21 | `BASE_URL` constant |
| 5 | `src/pages/Home.tsx` | 115, 119, 120 | Canonical, OG URL, OG image |
| 6 | `src/pages/Articles.tsx` | 103 | Canonical URL |
| 7 | `src/pages/JyotishHoroscope.tsx` | 44, 50 | Canonical, OG URL |
| 8 | `src/pages/SanskritTranslator.tsx` | 45, 51 | Canonical, OG URL |
| 9 | `src/pages/articles/ReasessingRigvedaAntiquity.tsx` | 33 | Canonical URL |
| 10 | `src/pages/articles/AsuraExilesIndoIranian.tsx` | 41 | Canonical URL |
| 11 | `src/pages/articles/RishiGenealogiesVedicTradition.tsx` | 39 | Canonical URL |

### Edge Functions (2 files)

| # | File | Line | Change |
|---|------|------|--------|
| 12 | `supabase/functions/generate-sitemap/index.ts` | 28 | `baseUrl` constant |
| 13 | `supabase/functions/generate-article-seo/index.ts` | 146 | Article URL template |

### Infrastructure (1 file)

| # | File | Change |
|---|------|--------|
| 14 | `public/robots.txt` | No change needed — sitemap already points to edge function URL (domain-independent) |

### Documentation (3 files)

| # | File | Change |
|---|------|--------|
| 15 | `docs/SEO_CONFIGURATION.md` | Update current production URL, mark migration as complete |
| 16 | `docs/IMPLEMENTATION_STATUS.md` | Mark Steps 5-7 as done |
| 17 | `docs/CURRENT_STATUS.md` | Update canonical URL reference |

---

## Risk Assessment

- **Risk level**: Zero — all changes are literal string replacements
- **No logic changes**: No conditionals, functions, or components are modified
- **Rollback**: Simple reversal of the same string replacement
- **Testing**: After migration, sharing any URL on social media should show correct previews

---

## What This Plan Does NOT Do

- Does not add the GSC verification meta tag (still need the verification code from you)
- Does not change routing, auth, database, or business logic
- Does not create new files or components
- Does not expand the codebase

---

## After Migration — Remaining User Actions

1. **GSC verification**: Share the HTML tag verification code so I can uncomment line 14 of `index.html`
2. **Submit sitemap in GSC**: Enter `https://xjaizfjcpkjcqbyobcsh.supabase.co/functions/v1/generate-sitemap`
3. **Request indexing**: Use URL Inspection for `/`, `/articles`, `/about`, `/begin-journey`

