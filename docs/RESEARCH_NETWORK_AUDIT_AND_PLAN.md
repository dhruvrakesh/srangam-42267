# Cross-Reference & Research Network — Audit & Phased Plan (v2, live-verified)

**Date:** 2026-07-12 · **Status:** regenerated after running the §6 verification SQL against the
live database. Supersedes the first draft, which made two inferences that the live data disproved
(recorded honestly in §2 so the reasoning trail is auditable).

---

## 1. Verified baseline (live DB, 2026-07-12)

| Metric | Value | Source |
|---|---|---|
| Published articles | **47** | 5.1 |
| Articles with ≥1 cross-reference (in-network) | **46** | 5.1 |
| Isolated published articles | **1** | 5.1 |
| Total edges in `srangam_cross_references` | **1,429** | 5.2 |
| — `same_theme` edges | **1,135 (79%)**, strength fixed **7** | 5.2 |
| — `thematic` edges | **294 (21%)**, strength **4–10**, avg 5.47 | 5.2 |
| — geographical / temporal / methodological / contradictory / supporting / prerequisite | **0** | 5.2 |
| `srangam_purana_references` rows | **47** | 5.3 |
| `srangam_article_pins` rows | **171** | 5.3 |
| `srangam_article_bibliography` rows | **69** | 5.3 |
| Published articles with `{{cultural:term}}` markers in content | **0** | 5.3 |
| `srangam_corpus_correlations_snapshot` rows | **0 (empty)** | 5.4 |

---

## 2. Corrections to the first draft (owned)

- **"~half the corpus isolated" → WRONG.** 46 of 47 are connected; coverage is essentially complete.
  The homepage widget's "22 articles / 474 connections" does **not** match the DB truth
  (46 / 1,429), so the *widget* is sampling or filtering — a small, separate item (§5, item W).
- **"`purana_references` is a 0-row scaffold" → WRONG.** It holds 47 rows; that claim came from a
  stale `CURRENT_STATUS`. The genuinely dead axis is **cultural terms** (0 marker-bearing articles).

The first draft's *direction* held (promote the existing multi-axis engine rather than rebuild);
only the emphasis shifts — from "coverage + purana backfill" to "**precision + activation**."

---

## 3. The real diagnosis

**The network is not sparse — it is noisy, and the good engine has never been switched on.**

1. **`same_theme` is the noise (79% of edges).** It links every pair sharing the broad `theme`
   field at a constant strength 7. With most articles under "Ancient India," this manufactures a
   near-complete subgraph — the hairball — and inflates the 6.5 average strength. It encodes almost
   no information ("both are Ancient India").
2. **The informative edges are a minority.** Only 294 `thematic` (shared-tag) edges carry variable,
   meaningful strength (4–10), and they are visually drowned by the 1,135 same_theme edges.
3. **The "7 reference types" is fiction.** Geographical, temporal, methodological, etc. are never
   generated — the graph is `same_theme` + `thematic` only. The schema promises richness the
   generator never delivers.
4. **The better engine (`get_corpus_correlations_v2`) is dormant, not missing.** Four of its five
   axes are fed (places 171, purāṇa 47, bibliography 69, tags); only the cultural-terms axis is dead
   (0 markers). But `correlate-corpus` has never materialised a snapshot, so none of this weighted,
   Jaccard-normalised, multi-signal correlation reaches anyone — not even the admin page.
5. **One dead axis, one surgical cause.** The terms axis reads inline `{{cultural:term}}` markers
   from content; no article has them. The fix is to match the 1,699 curated DB terms against article
   body text instead of relying on markers — a view change, not a content rewrite.

---

## 4. Regenerated enterprise path (activate → measure → heal → promote → harden)

Principle: **switch on what already exists and measure it before changing any public behaviour.**
No public output changes until Phase C. The tag graph stays live as a fallback throughout.

### Phase A — Activate & measure (near-zero code, one admin action)
- **A.1** Run `correlate-corpus` once (admin "Recompute now", or trigger the function) to populate
  `srangam_corpus_correlations_snapshot` from the 4 live axes. This is the highest-leverage,
  lowest-risk step — it produces a real multi-signal correlation set with **zero code**.
- **A.2** Compare the snapshot's top pairs against the current `same_theme`/`thematic` edges on a
  fixed sample of 10 articles. Does the weighted engine surface the cross-disciplinary links
  (shared place / shared purāṇa / shared source) that tag-overlap misses? Record the answer.
- **A.3** Confirm the nightly `correlate-corpus` cron is actually scheduled (snapshot was empty, so
  it likely is not). Wire it if absent.
- *Gate:* a non-empty snapshot exists; the A.2 comparison is written down and reviewed.

### Phase B — Heal the signals (surgical, source-side)
- **B.1 Cultural-terms axis (the one dead axis).** Rewrite `srangam_corpus_article_term_pairs` to
  match the 1,699 `srangam_cultural_terms` against article body text, instead of `{{cultural:term}}`
  markers that don't exist. No article content is mutated. *Gate:* the term axis returns non-zero
  shared-term pairs; re-run `correlate-corpus`.
- **B.2 (optional) Rarity weighting.** Add an IDF factor over tags/terms so a shared rare token
  ("Mitanni") outweighs a shared generic one ("Ancient India"). Ship as `get_corpus_correlations_v3`
  with v2 kept as the back-compat wrapper.
- *Gate:* known cross-disciplinary pairs now outrank generic same-theme pairs by score.

### Phase C — Promote the engine to the public graph (the payoff)
- **C.1** Expose a **published-only, read-safe** correlation set: a `SECURITY DEFINER` RPC (or an
  RLS-gated public snapshot) that filters both endpoints to `status='published'`. Never expose draft
  pairs.
- **C.2** Point `ResearchNetwork.tsx` and the home widget at that set, edge thickness = weighted
  score, with `srangam_cross_references` as automatic fallback if the snapshot is empty.
- **C.3 Kill the hairball:** stop rendering (or generating) `same_theme` as an edge — replace it with
  the multi-axis score. Keep `thematic` and add the real typed edges from Phase D.
- *Gate:* `/research-network` shows fewer, more-meaningful edges; a DB tag/place edit is reflected
  after the next snapshot; RLS test proves no draft leakage.

### Phase D — Real edge semantics
- **D.1** Type each edge from its dominant axis: `geographical` (shared places), `textual` (shared
  purāṇas/terms), `bibliographic` (shared sources), `thematic` (shared tags) — finally populating the
  schema's rich types with meaning instead of a constant `same_theme`.
- **D.2** Detect explicit `(see: slug)` citations as authoritative strength-10 edges, distinct from
  computed similarity.
- *Gate:* type distribution is no longer ~79% same_theme; every typed edge is explainable from its axis.

### Phase E — Hardening & documentation truth
- **E.1** Reconcile `srangam_cross_references` CHECK constraints (schema says strength 1–5 + 7 types;
  reality is 4–10 + 2 types) via migration.
- **E.2** `NETWORK_VISUALIZATION_GUIDE.md` still claims "5 nodes / 11 edges" — update to 46 / 1,429
  and describe the real generation rule and the v2 engine.
- **E.3** Client-side cap the force-graph (top-N by score) so it stays performant as the corpus grows
  (ties into the perf budgets); index the public correlation read path; version each snapshot.

---

## 5. Open items surfaced by the data

- **W — Homepage widget mismatch.** Widget shows 22 articles / 474 connections; DB truth is
  46 / 1,429. The widget is filtering or `.limit()`-ing (or is a stale/incorrect metric). Locate its
  query and either fix the number or document what subset it intends. Small, isolated.
- **The 1 isolated article** (47 published − 46 in-network): identify it; it will connect once the
  v2 engine (place/purāṇa/biblio axes) replaces tag-overlap.

---

## 6. Verification SQL (read-only — re-run any time)

```sql
-- 5.1 coverage
SELECT (SELECT count(*) FROM srangam_articles WHERE status='published') AS published,
       count(DISTINCT a.id) AS in_network
FROM srangam_articles a
JOIN (SELECT source_article_id aid FROM srangam_cross_references
      UNION SELECT target_article_id FROM srangam_cross_references) x ON x.aid=a.id
WHERE a.status='published';

-- 5.2 edge types + strength
SELECT reference_type, count(*) edges, round(avg(strength),2) avg_strength,
       min(strength) min_s, max(strength) max_s
FROM srangam_cross_references GROUP BY reference_type ORDER BY edges DESC;

-- 5.3 v2 axis data-fill
SELECT (SELECT count(*) FROM srangam_purana_references) purana_refs,
       (SELECT count(*) FROM srangam_article_pins) place_pins,
       (SELECT count(*) FROM srangam_article_bibliography) biblio_links,
       (SELECT count(*) FROM srangam_articles
          WHERE status='published' AND content::text ~ '\{\{cultural:') articles_with_term_markers;

-- 5.4 snapshot freshness (empty today = engine never run)
SELECT job_id, computed_at, count(*) pairs
FROM srangam_corpus_correlations_snapshot
GROUP BY job_id, computed_at ORDER BY computed_at DESC LIMIT 3;
```

**Baseline recorded 2026-07-12:** 47 published · 46 in-network · 1,429 edges (1,135 same_theme /
294 thematic) · purāṇa 47 · pins 171 · biblio 69 · term-markers 0 · snapshot empty.
