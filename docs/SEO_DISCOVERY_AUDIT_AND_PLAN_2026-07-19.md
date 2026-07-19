# Srangam — SEO Discovery Audit & Phased Plan

**Date:** 2026-07-19 · **Status:** authoritative for the search-discovery track; companion to
`ENTERPRISE_MASTER_PLAN_2026-07-12.md` (site phases 1–6) and `SEO_CONFIGURATION.md`
(Feb 2026 design). Honours the working agreement: one concern per commit with stated
rollback; verification gate before commit; telemetry before deletion; no change to
Part-1 strengths (routes, auth-gate, RLS, i18n/SEO foundations).

**Provenance.** Grounded in live fetches performed 2026-07-19 (robots.txt, /sitemap.xml,
the `generate-sitemap` edge function output, homepage HTML), the maintainer's GSC
coverage export (`srangam.nartiang.orgCoverage20260719.xlsx`), and the repo:
`public/robots.txt`, `public/sitemap.xml`, `index.html`, `src/pages/SitemapXML.tsx`,
`supabase/functions/generate-sitemap/index.ts`, `supabase/config.toml`,
`docs/SEO_CONFIGURATION.md`, `docs/CURRENT_STATUS.md`. Claims needing Search Console
or a deploy are marked **[LIVE-VERIFY]**.

---

## 0. Verified baseline — every claim measured

| # | Fact | Evidence |
|---|---|---|
| 1 | Google knows **exactly 1 URL** of the property; 1 indexed, 0 not-indexed, every day 2026-04-20 → 07-10; impressions ≈ 0 | GSC coverage export (Chart sheet, 82 rows; both issue sheets empty) |
| 2 | Live `robots.txt` = repo `public/robots.txt`: allows all agents; single `Sitemap:` line → `https://srangam.nartiang.org/sitemap.xml` | live fetch ↔ repo diff (identical) |
| 3 | Live `/sitemap.xml` = repo `public/sitemap.xml`: **static, 28 URLs, zero `/articles/*` entries** | live fetch (28 `<loc>`) ↔ repo file (28 `<loc>`) |
| 4 | The `generate-sitemap` edge function is **healthy and public**: valid XML, **92 URLs including 49 `/articles/<slug>` entries** with lastmod, correct `Content-Type: application/xml`, 1 h cache, `verify_jwt=false` | live fetch of `…supabase.co/functions/v1/generate-sitemap`; `config.toml` |
| 5 | `/sitemap` (React route, `SitemapXML.tsx`) renders the XML **inside an HTML `<pre>` after client JS** — human-readable only, never crawler-consumable | source read |
| 6 | `index.html` body is the bare SPA shell `<div id="root"></div>` — **zero `<a href>` links in raw HTML**; per-page meta arrives only via client-side Helmet | source read; live fetch shows head-only content |
| 7 | GSC verification meta tag in `index.html` is still the **commented placeholder**; the property is nonetheless verified (per `CURRENT_STATUS.md`, via the `nartiang.org` registration) | source read; GSC screenshot shows working property |
| 8 | `SEO_CONFIGURATION.md` (Feb 2026) **documents** robots.txt as pointing at the **edge-function sitemap** and lists "Submit sitemap in GSC" + "Request indexing" as *remaining user actions* | doc read, §"Key Files", §"Remaining User Actions" |
| 9 | No crawl *blockers* exist: robots allows all, no `noindex`, canonicals standardized to `srangam.nartiang.org` (Feb 2026 audit), Schema.org JSON-LD shipped, route dedup done (Phase F) | doc + source reads; GSC shows zero errors |

## 1. Root cause — a drift, not a block

Nothing is *blocking* Googlebot. The site is simply **never telling Google its URLs exist**,
because three discovery channels are each broken in a different, small way:

**D-1 · Deployed robots.txt drifted from the documented design.** `SEO_CONFIGURATION.md`
specifies `Sitemap: https://…supabase.co/functions/v1/generate-sitemap` (the complete,
DB-driven, 92-URL sitemap). The shipped file instead points to `/sitemap.xml` — a static
28-URL snapshot with **no articles**. This is precisely the repo's known **L-1 defect
class — "a static artifact shadows the DB source"** — the same disease Phase 2 is curing
in the resolver and search, here in SEO clothing. The static file also post-dates the
documented design (it isn't mentioned in `SEO_CONFIGURATION.md` at all), so the shadow
was introduced silently.

**D-2 · The GSC manual steps were never completed.** "Submit sitemap" and "Request
indexing" have been open user-action items in `SEO_CONFIGURATION.md` (Feb 2026) and
`CURRENT_STATUS.md` ever since. Coverage data proves the consequence: with zero
"not indexed" pages, Google has not consumed *any* sitemap — it knows only the
homepage it found by external means.

**D-3 · A documentation defect hid the path.** `SEO_CONFIGURATION.md` Step 3 instructs
submitting the supabase.co edge-function URL **directly in Search Console**. A URL-prefix
property only accepts sitemap paths under its own prefix, so that instruction dead-ends —
plausibly *why* the step was never completed. The standards-correct cross-host mechanism
is the **robots.txt `Sitemap:` declaration** (sitemaps.org "cross submits"; Google
documents robots.txt as the way to reference a sitemap hosted elsewhere). D-1's fix is
therefore also D-3's fix.

**Aggravator (not root cause): the SPA shell.** With no links in raw HTML (fact 6),
link-based discovery depends on Google's JS render queue — slow for a new, zero-backlink
domain. `SEO_CONFIGURATION.md` §"SPA Limitations" already documents this honestly; the
mitigation it names is exactly the edge-function sitemap that D-1 disconnected.

## 2. The phased path (surgical; nothing existing removed)

### Phase S1 — Repo truth: reconnect the real sitemap (2 commits)

**S1-a · robots.txt: add the edge sitemap as a second `Sitemap:` line (additive).**
Keep the existing line — both sitemaps are valid; multiple declarations are standard.
Proposed full file (`public/robots.txt`):

```
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: https://srangam.nartiang.org/sitemap.xml
Sitemap: https://xjaizfjcpkjcqbyobcsh.supabase.co/functions/v1/generate-sitemap
```

*Gate:* `npm run build` + tests (content change only, zero code path); after deploy,
`curl https://srangam.nartiang.org/robots.txt` shows both lines **[LIVE-VERIFY]**.
*Rollback:* delete one line.

**S1-b · `scripts/refresh-sitemap.mjs`: stop the static snapshot going stale.**
A ~30-line script (same family as `registry-parity-check.mjs` /
`generate-registry-meta.mjs`): fetch the edge-function XML → validate (parses, ≥ 80
`<url>`, contains `/articles/`) → overwrite `public/sitemap.xml`. Run before deploys and
after publishing articles; add to the maintenance docs alongside the existing "after
content updates" checklist.
*Gate:* run locally; diff shows URL count 28 → ~92; XML validates. *Rollback:* file is
regenerable/revertible; script deletion restores status quo.

### Phase S2 — Search Console actions (manual, no code — the Feb 2026 debt)

1. **Sitemaps → submit `sitemap.xml`** (in-property, accepted immediately). After S1-b
   this is the fresh 92-URL copy.
2. After S1-a deploys, confirm the robots-declared edge sitemap appears in the Sitemaps
   report (robots-discovered sitemaps are listed automatically) **[LIVE-VERIFY]**.
3. **URL Inspection → Request Indexing** for `/`, `/articles`, `/begin-journey`, and 3–4
   flagship articles (daily quota applies) — the exact list Step 4 of
   `SEO_CONFIGURATION.md` has always prescribed.

### Phase S3 — Measure before touching anything else (2–4 weeks)

Weekly, log in GSC: known pages (should move 1 → ~90 as "Discovered/Crawled"), indexed
count, sitemap fetch status. Success gate: **indexed ≥ 30 within 4 weeks** (matches the
doc's own "Expected Timeline"). Only after the edge sitemap shows *Success* fetches for
2+ weeks AND the static copy is confirmed redundant may the static `public/sitemap.xml`
be considered for retirement — the same telemetry-before-deletion gate as registry
retirement 2.6. Keeping it refreshed via S1-b is equally acceptable indefinitely.

### Phase S4 — Structural (deferred; enters the master plan, not this sprint)

If S3 shows pages *discovered but stubbornly not indexed*, the SPA shell is the
remaining constraint. Then — and only then — scope pre-rendering of article HTML
(build-time snapshot into `dist/`, within Lovable constraints) as a master-plan phase
with the standard perf/UX gates. This also unlocks per-article OG tags for social
crawlers (documented limitation, fact 6 / SPA §). Do not start this while the free
90-URL win of S1–S2 is untested.

### Phase S5 — Documentation truth (folds into master-plan Phase 6)

Correct `SEO_CONFIGURATION.md` Step 3 (GSC cannot take the cross-host URL directly;
robots.txt is the mechanism — D-3); document the static-sitemap-plus-refresh-script
decision and the S3 retirement gate; tick the completed user actions in
`CURRENT_STATUS.md` and `SOFT_LAUNCH_CHECKLIST.md` so this debt cannot silently
reappear.

## 3. What this plan deliberately does NOT do

No route, component, or resolver changes; no schema/DB writes of any kind; no deletion
of any deployed artifact (the static sitemap stays until its telemetry gate); no
prerendering adventure ahead of evidence; no new services. The two S1 commits are a
text file line and a standalone script — each independently revertible in one step.

## 4. Expected outcome

Per the repo's own timeline table: discovery within 1–2 weeks of S1+S2, most of the
~90 URLs indexed within 1–2 months. The "1 indexed" flatline is not a quality judgment
by Google — it has simply never been handed the map that the Feb 2026 design already
built. S1 reconnects the map; S2 pays the manual debt; S3 proves it with numbers before
anything heavier is contemplated.
