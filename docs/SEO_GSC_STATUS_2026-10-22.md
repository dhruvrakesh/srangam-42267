# Srangam — Search Console status and fixes (2026-10-22)

> **Authority:** the current SEO state of https://srangam.nartiang.org/, read on 2026-10-22 in the signed-in
> Search Console. Srangam has no property of its own: it is inside the **`nartiang.org` domain property**
> (export `nartiang.org-Coverage-2026-10-22`, last update 2026-10-16). Companion records, same date and method:
> nartiang-legacy-web `docs/SEO.md` section 6 and remix-of-dkegl-website `docs/SEO_GSC_STATUS_2026-10-22.md`.
> Change record: `docs/RELIABILITY_AUDIT.md` Phase AN (SEO_GSC_2026_10_22). Supersedes the status lines of
> `SEO_DISCOVERY_AUDIT_AND_PLAN_2026-07-19.md` and `SEO_CONFIGURATION.md`; their history stands.

## 1. What Search Console shows for srangam (2026-10-22)

| Reason | srangam URLs | Notes |
|---|---|---|
| Discovered - currently not indexed | **62**: `/about`, `/articles`, 39 articles, `/brand`, `/data-viz`, `/jyotish-horoscope`, `/maps-data`, `/oceanic`, `/partnership`, `/reading-room`, `/research-network`, `/research-submission`, `/sanskrit-translator`, `/sitemap`, `/sources` + 4 sources pages, `/support-research`, 4 `/themes/*` | all "last crawled: N/A" - known, never fetched |
| Crawled - currently not indexed | 4: `/articles/rishi-genealogies-vedic` (Sep 7), `/articles/dashanami-jyotirlinga-geography` (Jul 20), `/sources-method` (Jul 15), `/riders-on-monsoon` (Jul 14) | `/riders-on-monsoon` is a legacy root path (`<Navigate>` to `/articles/riders-on-monsoon`, a static-registry article not in the sitemap) |
| Soft 404 | 1: `/articles/shiva-bunjil-altair-connections` (crawled Sep 9) | retired 2026-09-06 as a duplicate (consolidate_03) |

**Sitemaps report** (property `nartiang.org`): `https://srangam.nartiang.org/sitemap.xml` - Success, 76 pages,
**last read 2026-07-22**; and `https://srangam.nartiang.org/robots.txt` submitted **as a sitemap** - "1 error"
(a robots file is not a sitemap).

## 2. Causes found in this repo, and what Phase AN changed

1. **Two canonicals on every page.** `index.html` carried `<link rel="canonical" href="https://srangam.nartiang.org">`
   since 2026-02-12 (and a static `og:url`). Each page's Helmet adds its own canonical (`Home.tsx`, `ArticleHead.tsx`),
   but react-helmet-async never removes a tag it did not write (only tags marked `data-rh`), so the rendered page
   held both - the homepage's first. With conflicting canonicals Google ignores both or folds the page into the
   homepage, which is the shape of "62 discovered, never crawled" on a site whose homepage is indexed.
   **Removed**; the fallback description / og / twitter text tags now carry `data-rh="true"`.
2. **Retired duplicates answered "not found" at 200.** `shiva-bunjil-altair-connections`, `vishnu-shiva-hari-hara`
   and `deep-dive-indoiranian-origins` are drafts since 2026-09-06 but stayed in `public/sitemap.xml`.
   **Now** each redirects to the article it duplicated (`ArticlesRouter.tsx`) and is out of the sitemap (77 → 74).
3. **No noindex on "not found".** `NotFound.tsx` and the article's not-found state now say `noindex, follow`, so an
   unknown URL is excluded rather than reported as a soft 404. A timeout or other error does **not** add noindex.

**Why these tags matter now:** Lovable pre-renders published React + Vite pages for verified crawlers (Google, Bing,
social bots, AI crawlers) - Lovable docs, *Optimize your app for SEO and AI search* and *How Lovable hosts your app*,
read 2026-10-22. Google therefore reads the rendered head, both canonicals included. The July plan's Phase S4
(pre-render article HTML) is **not needed**.

Checked in the sandbox: on a Linux copy of the tree, `vitest` link-integrity + load-w8 5 of 5 and `vite build` passed
(the built `index.html` has no canonical tag and 5 `data-rh` fallbacks); `scripts/link-integrity-check.mjs` - every internal link resolves; ESLint clean on the three
changed components; `tsc -p tsconfig.app.json` reports one error that predates this change
(`src/pages/Editions.tsx(111,78)`); `src/__tests__/load-w8.test.ts` reads `index.html`'s first `<script>` (the hero
preload), which is untouched.

## 3. Not done, named

- `/editions` is in `public/sitemap.xml` (added by hand 2026-10-18) but **not** in the `generate-sitemap` edge
  function's static list, so `node scripts/refresh-sitemap.mjs` would drop it. Add `/editions` (and any edition
  pages meant for search) to the function, deploy it, then refresh. Until then use `--check` only.
- The `generate-sitemap` edge function did not answer within 180 s from the sandbox on 2026-10-22; the owner's machine
  should read it with `node scripts/refresh-sitemap.mjs --check`.
- Content depth is editorial: Google may still decline thin pages (e.g. `/sources-method`) after it crawls them.

## 4. Owner actions in Search Console (after this commit is pushed and Lovable **Publish** is clicked)

1. `nartiang.org` property → Sitemaps → the `https://srangam.nartiang.org/robots.txt` row → ⋮ → **Remove sitemap**.
2. Resubmit `https://srangam.nartiang.org/sitemap.xml` (last read by Google 2026-07-22).
3. URL inspection → **Request indexing** (10 a day): `https://srangam.nartiang.org/`, `/articles`, `/editions`, then
   the flagship articles.
4. Soft 404 → **Validate Fix** only once the publish is live.
5. Re-read on or after 2026-11-05 and record the numbers below.

## 5. Checks after publish (PowerShell, read-only)

```powershell
$h = (Invoke-WebRequest https://srangam.nartiang.org/ -UseBasicParsing).Content
"static canonical gone: " + (-not $h.Contains('<link rel="canonical" href="https://srangam.nartiang.org"')) + "   data-rh tags: " + ([regex]::Matches($h, '<meta[^>]*data-rh="true"')).Count
$s = (Invoke-WebRequest https://srangam.nartiang.org/sitemap.xml -UseBasicParsing).Content
"sitemap urls: " + ([regex]::Matches($s, '<url>')).Count + "   retired slugs left: " + ([regex]::Matches($s, 'shiva-bunjil-altair|vishnu-shiva-hari-hara|deep-dive-indoiranian')).Count
```

Expected: `static canonical gone: True`, data-rh tags 5, sitemap urls 74, retired slugs left 0.
