## Phase CX.1 — Accurate context metrics (both edge functions, no schema change)

**Single goal:** the context system stops lying. Every count rendered or persisted reflects the live database. Touches two edge functions plus documentation. No migration. No client change. No RLS change. No GDrive auth change. CX.2 (pipeline unification) and CX.3 (identity diffs + migration) stay deferred until CX.1 is verified in production.

### Pre-flight findings (verified against live DB + code, 2026-05-29)

| Bug | Location | Evidence |
|---|---|---|
| `terms_count` capped at 100 forever | `context-save-drive` line ~41 `.limit(100)` + line ~303 `terms?.length` | Last 4 snapshots all report `terms_count=100` |
| `tags_count` capped at 50 forever | `context-save-drive` line ~57 `.limit(50)` + line ~304 `tags?.length` | Last 4 snapshots all report `tags_count=50` |
| `cross_refs_count` capped at 100 forever | `context-save-drive` line ~49 `.limit(100)` + line ~305 `crossRefs?.length` | Last 4 snapshots all report `cross_refs_count=100` |
| `modules_count` capped at modules-in-top-100-terms | `context-save-drive` line ~306 `new Set(terms.map(...))` | Always ≤6 |
| `avg_cross_ref_strength` biased to latest 100 | `context-save-drive` line ~290 | Sample-only |
| Every count renders "N/A" in bundle | `context-bundle-generator` lines ~112-126 — destructures `data` from `head:true` query (always `null`) | Bundle markdown ships with "N/A records" placeholders |
| Wrong language list in bundle | `context-bundle-generator` line ~156 — claims "Pali"; omits "Pnar" | Diverges from `src/lib/i18n.ts` (`pn = Pnar`) |
| Hardcoded "12 modules" in bundle | `context-bundle-generator` line ~157 | Should derive |
| Correlation model invisible | both functions | `srangam_corpus_correlations_snapshot` is never read |

### Code changes

**File 1: `supabase/functions/context-save-drive/index.ts`**

Add a clean "authoritative counts" block before any content fetches:
```ts
// Authoritative counts — head:true, count:'exact' is cheap and not row-bounded.
const [
  { count: articlesCount },
  { count: termsCount },
  { count: tagsCount },
  { count: crossRefsCount },
] = await Promise.all([
  supabase.from('srangam_articles').select('id', { head: true, count: 'exact' }).eq('status', 'published'),
  supabase.from('srangam_cultural_terms').select('id', { head: true, count: 'exact' }),
  supabase.from('srangam_tags').select('id', { head: true, count: 'exact' }),
  supabase.from('srangam_cross_references').select('id', { head: true, count: 'exact' }),
]);

// Distinct modules — paginate `module` (no schema helper allowed in CX.1).
const modulesCount = await countDistinctModules(supabase); // 1000-row pages until exhausted

// Latest correlation snapshot — small, single row + 5-row companion query.
const { data: latestCorrelation } = await supabase
  .from('srangam_corpus_correlations_snapshot')
  .select('job_id, computed_at')
  .order('computed_at', { ascending: false })
  .limit(1)
  .maybeSingle();

let topCorrelationPairs: any[] = [];
let correlationPairCount = 0;
if (latestCorrelation?.job_id) {
  const { count } = await supabase
    .from('srangam_corpus_correlations_snapshot')
    .select('article_a', { head: true, count: 'exact' })
    .eq('job_id', latestCorrelation.job_id);
  correlationPairCount = count ?? 0;
  const { data: top } = await supabase
    .from('srangam_corpus_correlations_snapshot')
    .select('article_a, article_b, jaccard, shared_total')
    .eq('job_id', latestCorrelation.job_id)
    .order('jaccard', { ascending: false })
    .limit(5);
  topCorrelationPairs = top ?? [];
}
```

Keep the existing limited fetches (`articles` for top-5 list, `terms .limit(100)`, `tags .limit(50)`, `crossRefs .limit(100)`) — but **only** to render the human-readable top-N sections of the markdown. They no longer feed any persisted count.

Rebuild `stats_detail` as a structured object:
```ts
const themesObject: Record<string, number> = {};
for (const a of (allPublishedArticlesForThemes ?? [])) {
  themesObject[a.theme] = (themesObject[a.theme] ?? 0) + 1;
}
// allPublishedArticlesForThemes = a separate slim fetch of just `theme` for ALL published
// articles (no .limit) — already cheap because we only select one column.

const statsDetail = {
  generated_with: 'CX.1',
  sample_sizes: { terms: 100, tags: 50, cross_refs: 100 },
  themes: themesObject,                                  // { theme: count }
  top_tags: (tags ?? []).map(t => ({ name: t.tag_name, usage_count: t.usage_count })),
  top_terms: (terms ?? []).map(t => ({ term: t.term, module: t.module, usage_count: t.usage_count })),
  avg_cross_ref_strength_sampled:
    crossRefs && crossRefs.length > 0
      ? crossRefs.reduce((acc, r) => acc + (r.strength ?? 0), 0) / crossRefs.length
      : null,
  correlation: {
    pair_count: correlationPairCount,
    computed_at: latestCorrelation?.computed_at ?? null,
    top_pairs: topCorrelationPairs,                      // [{article_a, article_b, jaccard, shared_total}]
  },
  // CX.1-only compat shim. context-diff-generator currently reads these as flat arrays.
  // CX.2 retires both fields when it rewires the diff to read the structured shape above.
  _compat: {
    themes: Object.keys(themesObject),
    top_tags: (tags ?? []).map(t => t.tag_name),
  },
};
```

Use the authoritative counts in **both** the markdown body and the `.insert(...)` payload:
```ts
.insert({
  ...existingFields,
  articles_count: articlesCount ?? 0,
  terms_count:    termsCount    ?? 0,
  tags_count:     tagsCount     ?? 0,
  cross_refs_count: crossRefsCount ?? 0,
  modules_count:  modulesCount,
  stats_detail:   statsDetail,
  triggered_by:   'manual',
  status:         'success',
})
```

Add a "## Corpus Correlations" section to the markdown body (pair count, `computed_at`, top-5 pairs by jaccard with the two slug placeholders — resolved by a small `id → slug` lookup over the 10 distinct article ids in the top-5; one extra cheap `.in('id', [...])` query). Section is **omitted** cleanly if `latestCorrelation` is null.

**File 2: `supabase/functions/context-bundle-generator/index.ts`**

Three surgical fixes, nothing else:
1. Destructure `count` (not `data`) from every `head:true` count query:
   ```ts
   const { count: articleCount } = await supabase.from('srangam_articles')…
   ```
   Apply to all four counts. Stale `data` variable goes.
2. Replace the languages line:
   ```
   - **Languages Supported**: 9 (English, Tamil, Telugu, Kannada, Bengali, Assamese, Pnar, Hindi, Punjabi)
   ```
   (Order matches `supportedLanguages` declaration in `src/lib/i18n.ts`.)
3. Replace the hardcoded `"12 specialized cultural term modules"` with a derived value from the same `countDistinctModules()` helper used in CX.1 (the helper goes into CX.1; bundle-generator imports the duplicated logic inline for now — CX.2 lifts it to `_shared/`).
4. Append the same "## Corpus Correlations" markdown block as CX.1 (read-only — bundle-generator continues to write nothing to DB).

**No edits** to GDrive auth/upload code in either function. **No edits** to `context-diff-generator` (the `_compat` shim keeps it running unchanged; CX.2 rewires it). **No edits** to `src/pages/admin/ContextManagement.tsx`. **No edits** to `supabase/config.toml`.

### Out of scope for CX.1 (carried forward)

- Extracting `_shared/google-drive.ts` and `_shared/context-markdown.ts` → **CX.2**.
- Auto-invoking diff after snapshot insert + updating `changes_from_previous` → **CX.2**.
- Recording `status:'failed'` rows on error → **CX.2**.
- Demoting bundle-generator to export-only + relabelling admin button → **CX.2**.
- `article_slugs`/`tag_names`/`term_keys jsonb` migration + identity-based set diffs → **CX.3**.
- AI executive summary populating `context_summary` → **CX.4** (user-flagged).
- Cron wiring for daily snapshots → **CX.5** (user-flagged).
- Backfilling historic rows → out of scope permanently. RLS has no UPDATE policy on `srangam_context_snapshots` (admin INSERT + SELECT only). Per the standing "treat production data as immutable" rule, pre-CX.1 rows stay as a frozen baseline.

### Documentation deliverables (documentation-first, written before code ships)

- `.lovable/plan.md` — append "CX.1 (2026-05-29)" entry: scope, frozen-baseline note, rollback recipe (`git revert` of the two edge functions).
- `docs/CONTEXT_MANAGEMENT_GUIDE.md` — new "Phase CX.1 (2026-05-29) — accurate metrics" section documenting: the two count-cap bugs, the bundle destructuring bug, the language/modules constants bug, the missing correlation surface, the new `stats_detail` shape, the `_compat` shim and its planned CX.2 retirement, and a temporal note that snapshots dated ≤ 2026-05-29 are the frozen pre-CX.1 baseline whose `terms_count/tags_count/cross_refs_count` are capped sample limits, not true totals.
- `mem://index.md` Core invariant to add after CX.1 ships:
  > "Context snapshot `*_count` columns and bundle counts are populated by `head:true, count:'exact'` queries; never by `.length` on a `.limit()`-bounded fetch and never by destructuring `data` from a `head:true` query. `stats_detail` carries `generated_with`, `sample_sizes`, structured `themes`/`top_tags`/`top_terms` with counts, and a `correlation` block (pair_count, computed_at, top 5 by jaccard) from `srangam_corpus_correlations_snapshot`. `_compat` flat arrays exist solely to keep `context-diff-generator` running until CX.2 retires them. The bundle markdown's language list mirrors `src/lib/i18n.ts` exactly — never hardcode 'Pali' or omit 'Pnar'. Historic snapshots before 2026-05-29 are a frozen baseline with capped counts — do not retro-fix."

### Verification gate (must pass before CX.2 is planned)

1. Deploy. Trigger one snapshot via `/admin/context` → "Sync Now".
2. Run `SELECT articles_count, terms_count, tags_count, cross_refs_count, modules_count, stats_detail->'correlation'->'pair_count' FROM srangam_context_snapshots ORDER BY snapshot_date DESC LIMIT 1` — confirm every value matches a freshly-executed `SELECT count(*)` against the source tables.
3. Open the GDrive markdown the snapshot uploaded — confirm headline counts match the row; top-N sections labelled "sampled"; "## Corpus Correlations" present with non-null `computed_at`.
4. Click "Generate Bundle" — confirm bundle markdown shows real numbers (no "N/A"), language list reads `… Bengali, Assamese, Pnar, Hindi, Punjabi`, modules line shows the derived count, and "## Corpus Correlations" section is present.
5. Invoke `context-diff-generator` between the new row and the previous one — must not throw, thanks to the `_compat` shim. Diff numbers will look enormous (real total vs old capped sample); this is **expected** and explicitly noted in the docs ("first CX.1 vs last pre-CX.1 diff is a category jump, not real corpus surge").
6. `/admin/context` snapshot history card for the new row renders the new honest badges; older rows continue to render their historic (capped) values without UI breakage.

### Risk + rollback

Two edge function file edits. Zero DB writes outside the normal `.insert(...)` path. `_compat` shim guarantees existing diff calls keep working. Rollback = redeploy previous versions of the two `index.ts` files. Zero schema risk, zero migration, zero client risk.

---

### Forward sketch (NOT part of this plan — for context only)

**CX.2 — Unify the pipeline (no schema change).** Extract `_shared/google-drive.ts` (uploadMarkdownToDrive) and `_shared/context-markdown.ts` (the rich markdown builder + the count/correlation gatherers from CX.1). `context-save-drive` becomes the single source of truth: builds the rich markdown, uploads, inserts the snapshot, fetches the immediately-previous snapshot, invokes `context-diff-generator`, and **UPDATEs** the new row's `changes_from_previous` (uses `SERVICE_ROLE_KEY` — bypasses the missing UPDATE policy; documented as an intentional service-role-only write path). On any failure, inserts a `status:'failed'` row with `error_message`. `context-bundle-generator` demoted to export-only — calls the same shared builder, never writes to `srangam_context_snapshots`. `context-diff-generator` rewired to read structured `stats_detail` (themes object, top_tags with counts); `_compat` shim retired. Admin UI: "Sync Now" stays primary; "Generate Bundle" relabelled "Download Context Bundle".

**CX.3 — Identity-based diffs (one additive migration).** Migration adds three nullable jsonb columns to `srangam_context_snapshots`: `article_slugs`, `tag_names`, `term_keys`. CX.2 pipeline populates them from full (unsliced) fetches at snapshot time. Diff generator rewritten as set operations (added = current \ previous; removed = previous \ current) per identifier. Reports real `added`/`removed` slug arrays; drops the bogus `updated` field; new themes go under correctly-named `addedThemes` (not `addedArticles`). Falls back to count-only with `{ mode: 'count_only' }` when either snapshot pre-dates the migration. Persists the full diff to `changes_from_previous` so it's durable, not just returned.

Both forward phases will get their own plan + verification gate at the appropriate time.