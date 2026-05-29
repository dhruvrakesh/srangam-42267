
## Translation coverage truth (Phase AA, 2026-05-29)

Cards must report **body** translation coverage, not title coverage.

- DB rows: `bodyLanguages` is derived from `srangam_articles.content`'s non-empty locale keys at fetch time (`useArticles.ts → computeBodyLanguages`). As of 2026-05-29 every published DB row has only `en` content, so the badge correctly reads **1/9** until real translations land.
- JSON rows: `mergeArticleSources` attaches `bodyLanguages` from `getArticleCoverageMap(article.id)`; rows without a coverage record default to `['en']`. This stops the historical "9/9" lie that arose because JSON titles ship multilingual but bodies do not.
- The badge falls back to title-key counting only when no `bodyContent` / `availableLanguagesOverride` prop is provided, preserving behaviour for `MultilingualSearchResults` and any future ad-hoc callers.
