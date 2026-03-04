

# Phase G: Broken Article Links -- Verified Fix Plan

## Verified Diagnosis

After exhaustive review of all source files and the live database, here is the exact state:

### Data Source Inventory

| Source | Count | Articles |
|--------|-------|----------|
| `oceanic_cards_8.json` | 8 | maritime-memories-south-india, bharats-ancient-heritage, pepper-and-bullion, indian-ocean-power-networks, chola-naval-raid, riders-on-monsoon, dharmic-heritage-maritime-trade, samudra-manthan |
| `MULTILINGUAL_ARTICLES` (JSON) | 28 | All 28 listed in `src/data/articles/index.ts` |
| DB `status=published` | ~30 | jambudvipa-connected, ringing-rocks-rhythmic-cosmology, reassessing-ashoka, rishi-genealogies, etc. |
| DB `status=draft` | 9 | chola-naval-raid, earth-sea-sangam, geomythology-land-reclamation, indian-ocean-power-networks, kutai-yupa-borneo, monsoon-trade-clock, riders-on-monsoon, scripts-that-sailed, stone-purana |

### Bug 1: Resolver Gap (CRITICAL)

`resolveOceanicArticle(slug)` checks only:
1. `oceanic_cards_8.json` (8 articles)
2. DB with `status=published`

The following MULTILINGUAL_ARTICLES have NO path to resolution because they are NOT in oceanic_cards_8 AND are either absent from DB or in draft status:

**Confirmed broken:** gondwana-to-himalaya, ashoka-kandahar-edicts, scripts-that-sailed-ii, cosmic-island-sacred-land, janajati-oral-traditions, sacred-tree-harvest-rhythms, stone-song-and-sea, asura-exiles-indo-iranian, sarira-and-atman-vedic-preservation, reassessing-rigveda-antiquity, dashanami-ascetics-sacred-geography, continuous-habitation-uttarapatha, somnatha-prabhasa-itihasa

**Broken (in DB as draft):** monsoon-trade-clock, scripts-that-sailed, earth-sea-sangam, geomythology-land-reclamation, kutai-yupa-borneo, stone-purana, chola-naval-raid, riders-on-monsoon, indian-ocean-power-networks

**Note:** Some articles like `jambudvipa-connected` exist in BOTH MULTILINGUAL_ARTICLES and DB (published), causing **duplicates** on listing pages.

### Bug 2: Slug Prefix Missing

`multilingualArticleUtils.ts` lines 29, 42, 146: generates `slug: /${article.id}`. ArticleCard uses `<Link to={article.slug}>` directly. This sends users to root path which redirects to `/articles/:slug`, adding an unnecessary hop. If the redirect exists, it works -- but adds latency and confuses analytics.

### Bug 3: Canonical URL Wrong

`OceanicArticlePage.tsx` line 83: `const canonicalUrl = ${BASE_URL}/${articleSlug}` produces `https://srangam.nartiang.org/monsoon-trade-clock` instead of `https://srangam.nartiang.org/articles/monsoon-trade-clock`. Violates Phase F invariant.

### Bug 4: DB Article Slugs Use Raw Slug

`useArticles.ts` line 60: `slug: /articles/${article.slug}` uses the raw database slug (often very long like `jambudvipa-connected-weaving-the-threads-of-civilization-from-the-vaigai-to-the-ganga`) instead of the short `slug_alias`. The query on line 39 does `select('*')` which includes `slug_alias`, but it is not used.

### Bug 5: No Deduplication in Merge

`unifiedArticleUtils.ts` `mergeArticleSources` blindly appends DB articles to JSON articles. Articles existing in both (e.g., jambudvipa-connected) appear twice.

### Bug 6: OceanicBharat Links Use Raw Slug

`OceanicBharat.tsx` line 119/139: links to `/oceanic/${article.slug}` using the raw DB slug. Should use `slug_alias || slug`.

---

## Implementation Plan

### Fix 1: Add MULTILINGUAL_ARTICLES Fallback to Resolver

**File:** `src/lib/articleResolver.ts`

Between the oceanic_cards check (line 65-71) and the database query (line 74), add a lookup into `MULTILINGUAL_ARTICLES` and `ARTICLE_METADATA`:

```
import { MULTILINGUAL_ARTICLES, ARTICLE_METADATA } from '@/data/articles';

// After oceanic cards check, before DB query:
const multilingualArticle = MULTILINGUAL_ARTICLES.find(a => a.id === slug);
if (multilingualArticle) {
  const metadata = ARTICLE_METADATA[slug];
  return {
    source: 'json',
    slug: slug,
    title: getLocalizedTitle(multilingualArticle.title, 'en'),
    title_hi: getLocalizedTitle(multilingualArticle.title, 'hi'),
    title_pa: getLocalizedTitle(multilingualArticle.title, 'pa'),
    title_ta: getLocalizedTitle(multilingualArticle.title, 'ta'),
    abstract: getLocalizedTitle(multilingualArticle.dek, 'en'),
    dek: multilingualArticle.dek,
    content: multilingualArticle.content,
    read_time_min: metadata?.readTime || 10,
    tags: /* extract EN tags from multilingual tags */,
    pins: [],
    mla_refs: [],
    theme: metadata?.theme,
    published_date: metadata?.date,
  };
}
```

This immediately unbreaks all ~22 broken articles.

### Fix 2: Fix Slug Prefix in multilingualArticleUtils

**File:** `src/lib/multilingualArticleUtils.ts`

Lines 29, 42, 146: change `/${article.id}` to `/articles/${article.id}`.

### Fix 3: Fix Canonical URL

**File:** `src/components/oceanic/OceanicArticlePage.tsx`

Line 83: change `${BASE_URL}/${articleSlug}` to `${BASE_URL}/articles/${articleSlug}`.

### Fix 4: Use slug_alias in useArticles

**File:** `src/hooks/useArticles.ts`

Line 60: change to `slug: /articles/${(article as any).slug_alias || article.slug}`.

### Fix 5: Deduplicate in mergeArticleSources

**File:** `src/lib/unifiedArticleUtils.ts`

Add slug-based deduplication, preferring DB version over JSON when both exist:

```typescript
const seen = new Set<string>();
// Add DB articles first (preferred)
dbArticles?.forEach(article => {
  const key = article.slug.replace('/articles/', '');
  if (!seen.has(key)) {
    seen.add(key);
    unified.push(article);
  }
});
// Add JSON articles only if not already present
jsonArticles.forEach(article => {
  const key = article.id || article.slug.replace('/', '').replace('/articles/', '');
  if (!seen.has(key)) {
    seen.add(key);
    unified.push({ ...article, source: 'json' } as DisplayArticle);
  }
});
```

### Fix 6: Fix OceanicBharat Links

**File:** `src/pages/oceanic/OceanicBharat.tsx`

Lines 119, 139: change `/oceanic/${article.slug}` to `/oceanic/${article.slug_alias || article.slug}`.

### Fix 7: Update Documentation

**File:** `docs/RELIABILITY_AUDIT.md` -- Add resolver invariant: "resolveOceanicArticle MUST check oceanic_cards_8.json, MULTILINGUAL_ARTICLES, and database in that order."

**File:** `.lovable/plan.md` -- Update Phase G status.

---

## Files Changed Summary

| File | Change | Risk |
|------|--------|------|
| `src/lib/articleResolver.ts` | Add MULTILINGUAL_ARTICLES as 2nd fallback source | Low |
| `src/lib/multilingualArticleUtils.ts` | Fix slug prefix `/${id}` → `/articles/${id}` | Low |
| `src/components/oceanic/OceanicArticlePage.tsx` | Fix canonical URL to include `/articles/` | Low |
| `src/hooks/useArticles.ts` | Use `slug_alias` for DB article URLs | Low |
| `src/lib/unifiedArticleUtils.ts` | Deduplicate merged articles | Low |
| `src/pages/oceanic/OceanicBharat.tsx` | Use `slug_alias` in links | Low |
| `docs/RELIABILITY_AUDIT.md` | Document resolver invariant | Zero |
| `.lovable/plan.md` | Phase G status | Zero |

## What This Does NOT Do

- Does not change any database content, status, or schema
- Does not modify App.tsx routes or ArticlesRouter
- Does not delete any component files
- Does not touch authentication, RLS, or edge functions

