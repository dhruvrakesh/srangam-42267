
# Phase H.2 — Wire Geographical Context (Surgical, Enterprise, Tenant-Aware)

## What's actually broken (unchanged from prior plan)

The "Geographical Context" card on `/articles/:slug` renders `article.pins.map(...)`. Today **`pins` is hard-coded to `[]` for every database article** (`src/lib/articleResolver.ts` lines 103, 162) and "View Interactive Map" has **no `onClick`**. That is why the screenshot shows an empty box and a dead button.

## Tenant-aware AI posture (the only material change vs. prior plan)

Verified secrets in this project: **`OPENAI_API_KEY`**, **`GEMINI_API_KEY`**, `GOOGLE_CLOUD_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `ELEVENLABS_API_KEY`, plus the auto-managed `LOVABLE_API_KEY`.

Verified existing pattern across `generate-article-tags`, `generate-article-seo`, `enrich-cultural-term`, `extract-purana-references`: **direct `fetch('https://api.openai.com/v1/chat/completions')` with your `OPENAI_API_KEY`, model `gpt-4o-mini`.** No edge function in this repo currently calls the Lovable AI Gateway. `GEMINI_API_KEY` is provisioned but unused — we will wire it as the **primary** for this NER task because Gemini Flash is materially better and cheaper for short-context, structured place-name extraction in multilingual scholarly prose, and your usage is metered on your own GCP billing rather than Lovable credits.

**Decision matrix for H.2's AI step (place-name extraction)**:

| Provider / model | Cost per 1M in/out tok (approx, public list) | Multilingual + diacritics | Structured JSON | Verdict |
|---|---|---|---|---|
| **Gemini 2.5 Flash** (`gemini-2.5-flash`) | **$0.075 / $0.30** | Strong for Devanāgarī, Tamil, transliteration | Native `responseSchema` | **Primary** |
| Gemini 2.5 Flash-Lite | $0.04 / $0.15 | Adequate but weaker on diacritics | `responseSchema` | Not used — diacritic recall matters here |
| OpenAI `gpt-4o-mini` | $0.15 / $0.60 | Strong | `response_format: json_schema` | **Fallback** |
| OpenAI `gpt-4o` | $2.50 / $10 | Strongest | `json_schema` | Not justified for this task |
| Lovable AI Gateway | n/a here | n/a | n/a | **Not used** — your own keys exist, your own usage logging exists |

Provider selection is centralised behind one shared helper (see H.2d below) so the choice can be flipped per-task by config without re-touching edge function bodies.

---

## Reference enterprise systems we model on (unchanged)

| System | What we borrow |
|---|---|
| **Pelagios Recogito** | Place-annotation pipeline: extract → resolve to gazetteer URI → confidence tier → human override |
| **World Historical Gazetteer** | Authority-record model: stable internal ID, multiple name variants, era tags, lat/lon |
| **Pleiades** | Confidence + precision metadata on every coordinate (`approximate`, `centroid`, `point`) |
| **Leaflet + MarkerCluster** | Lazy, lightweight per-article map embed (no heavy GIS stack on article pages) |

We do **not** import any of these as dependencies. We mirror their data model in our own tables.

## The surgical path (4 micro-phases, additive only)

```text
H.2a Gazetteer ──► H.2b Resolver+backfill ──► H.2c Render+map ──► H.2d AI provider helper
(canonical place table)  (edge fn, idempotent)  (ArticleMiniMap, lazy)  (Gemini-first, OpenAI fallback)
```

Each phase is independently shippable and reversible. No existing query, route, or component is removed.

---

### H.2a — Canonical gazetteer (one new table, seeded from existing data)

New table `srangam_gazetteer` (additive, RLS read-public/write-admin, mirrors existing `_user-roles_` pattern):

| col | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `canonical_name` | text | "Muziris (Kodungallur)" |
| `name_variants` | text[] | ["Muziris","Muciri","Kodungallur","Cranganore"] — used for matching |
| `latitude` / `longitude` | numeric | WGS84 |
| `precision` | text | `point` \| `centroid` \| `approximate` (Pleiades model) |
| `country` | text | |
| `era_tags` | text[] | ["Sangam","Roman trade"] |
| `feature_type` | text | `port`, `inscription_site`, `monastery`, … |
| `notes` | text | |
| `external_refs` | jsonb | `{pleiades, whg, geonames}` for future linking |

Plus join table `srangam_article_pins`:

| col | type | notes |
|---|---|---|
| `article_id` | uuid FK CASCADE → `srangam_articles.id` | |
| `gazetteer_id` | uuid FK → `srangam_gazetteer.id` | |
| `confidence` | text | `A` (gazetteer hit) \| `B` (AI NER + fuzzy match) \| `C` (manual) |
| `source` | text | `evidence_table` \| `content_scan` \| `ai_extract` \| `manual` |
| `display_order` | int | |
| PK (`article_id`, `gazetteer_id`) | | idempotent re-runs |

Indexes: `idx_pins_article_id` (on `article_id`), GIN on `srangam_gazetteer.name_variants` for fast variant lookup.

**Seed migration** populates `srangam_gazetteer` from three local sources we already ship:
1. `oceanGisData.features` (21 rows, precision=`point`)
2. `inscriptionRegistry.inscriptions` (4 rows, precision=`point`)
3. `atlas_nodes.json` (precision=`centroid` where coords are city-level)

Total seed: **~50 rows**, deduped on `lower(canonical_name)` + 0.05° lat/lon bucket. Single migration, runs once, idempotent (`ON CONFLICT DO NOTHING`).

---

### H.2b — `backfill-article-pins` edge function (mirrors `backfill-bibliography`)

New edge fn `supabase/functions/backfill-article-pins/index.ts`:

```text
For each article (or one slug):
  1. evidence_lift  — Read srangam_article_evidence WHERE article_id = ?
       → for any row with (place, latitude, longitude) all set:
            upsert into srangam_article_pins via gazetteer match-or-create
            confidence = A, source = 'evidence_table'
  2. content_scan   — Strip HTML via _shared/text-sanitizer.
                      For every srangam_gazetteer row, regex-test each
                      name_variant (word-boundary, diacritic-fold) on content.
       → hit ⇒ upsert article_pin, confidence = A, source = 'content_scan'
  3. ai_extract (opt-in via ?use_ai=true):
       Call shared aiExtractPlaces() helper (see H.2d). Returns
         [{ name, context_phrase }]
       For each name not already matched, fuzzy gazetteer lookup
       (lowercase + NFD diacritic-fold + Levenshtein ≤ 2). Hits ⇒
       confidence = B, source = 'ai_extract'.
       Misses are logged (evt: 'pin_ai_miss') for human curator promotion.
       NEVER auto-creates gazetteer rows from AI output (Recogito model).
  4. Observability via _shared/observability.ts:
       stage('evidence_lift'|'content_scan'|'ai_extract'|'upsert', {...})
       logComplete({ evt: 'pin_complete', article_id, evidence_pins,
                     scan_pins, ai_pins, ai_misses, total, provider, model,
                     prompt_tokens, completion_tokens, cost_usd_estimate })
```

Properties:
- **Idempotent** — composite PK; safe to re-run.
- **Surgical** — does not touch `srangam_articles`, `srangam_article_evidence`, or import pipeline body.
- **Tenant-keyed** — uses your `GEMINI_API_KEY` (primary) / `OPENAI_API_KEY` (fallback). No Lovable AI Gateway. No new secrets.
- **Cheap** — gazetteer scan is O(articles × ~50 variants), runs in seconds; AI call is opt-in and ~$0.0001 per article at Gemini Flash rates.

Triggered three ways:
- Admin UI button "Backfill pins" on `ArticleHealthDashboard` (single article or all).
- Auto-invoked at the end of `markdown-to-article-import` (logged inside the same `import_complete` event — same observability contract as Phase H.1).
- Manual `curl` for ops.

---

### H.2c — Surgical UI wire-up + lazy map embed (unchanged from prior plan)

**Resolver (`src/lib/articleResolver.ts`)** — replace the hard-coded `pins: []` (lines 103, 162) with `pins: await loadArticlePins(slug, articleId)`.

`loadArticlePins` (new `src/lib/articlePins.ts`) does **one** Supabase call joining `srangam_article_pins` → `srangam_gazetteer`, returns the existing `{name, lat, lon, approximate}` shape so **no consumer changes**. Wrapped in `Promise.race` with the existing 10 s timeout so it cannot regress load time. Falls back to `[]` on any failure.

**`OceanicArticlePage.tsx`** — three small edits, no structural rewrite:
1. Hide the entire "Geographical Context" `<Card>` when `article.pins.length === 0` (today it renders an empty box — the visible bug in the screenshot).
2. Wire `onClick` on "View Interactive Map" → toggles `<ArticleMiniMap pins={article.pins} />` rendered inline below the pin grid (collapsed by default — no bundle cost on first paint).
3. Pass `onPinClick` to scroll/highlight the pin in the map (existing `handlePinClick` stub).

**`ArticleMiniMap` (new, `src/components/articles/ArticleMiniMap.tsx`)**:
- Dynamic-import Leaflet exactly like `MermaidBlock` dynamic-imports mermaid (Phase H invariant). Zero bundle cost when the map stays collapsed.
- Reuses Leaflet config from `EpigraphicAtlasMap` — extract icon-fix into `src/lib/leafletIcons.ts` so both files share one copy.
- `performance.measure('article-map:<slug>')` — same observability contract as `MermaidBlock`.
- Confidence badge per marker (A/B/C) with the same colour scheme as `EpigraphicAtlasMap`.

**Bibliography card empty-state** (also visible in screenshot): same one-line treatment — render only when `article.mla_refs.length > 0`.

---

### H.2d — `_shared/ai-provider.ts`: tenant-aware Gemini-first helper (NEW, the only AI plumbing)

New shared module `supabase/functions/_shared/ai-provider.ts`:

```text
export async function aiExtractPlaces(text, { signal }):
    Promise<{ provider, model, places: {name, context}[],
              prompt_tokens, completion_tokens, latency_ms,
              cost_usd_estimate }>

  Strategy (in order, first non-error wins):
    1. If GEMINI_API_KEY set → POST
       https://generativelanguage.googleapis.com/v1beta/models/
         gemini-2.5-flash:generateContent?key=GEMINI_API_KEY
       with responseSchema = { type: ARRAY, items:
         { type: OBJECT, properties: { name: STRING, context: STRING },
           required: ['name','context'] } }
       Tracks usageMetadata.{promptTokenCount, candidatesTokenCount}.
    2. Else if OPENAI_API_KEY set → POST
       https://api.openai.com/v1/chat/completions, model 'gpt-4o-mini',
       response_format = { type: 'json_schema', json_schema: {...same shape...} }
       Tracks usage.{prompt_tokens, completion_tokens}.
    3. Else throw NoAIProviderError (callers degrade gracefully — H.2b
       just skips step 3, the rest of the pipeline still works).

  Cost estimate uses a rate table embedded in the helper
  (gemini-2.5-flash: 0.075/0.30; gpt-4o-mini: 0.15/0.60 per 1M tok).

  Hard timeout 15 s (AbortController). On 429/5xx from primary,
  one retry with exponential backoff, then transparent fallback to
  the secondary provider.
```

This helper is the **only** code path in the repo that needs to know about provider selection. Existing edge functions (`generate-article-tags`, `generate-article-seo`, `enrich-cultural-term`, `extract-purana-references`) are **not** refactored in H.2 — they keep their current direct OpenAI calls. A follow-up phase (H.3) can migrate them onto this helper to flip the same articles onto Gemini Flash and cut cost ~50% with no behavioural change. Out of scope for H.2.

Why this helper, not the Lovable AI Gateway:
- You already pay for and meter Gemini + OpenAI directly. Routing through Lovable's gateway would double-bill (Lovable credits + your own usage if you stayed on direct keys for other functions) and lose your existing per-key billing visibility in Google Cloud / OpenAI dashboards.
- The structured-log line `pin_complete{ provider, model, prompt_tokens, completion_tokens, cost_usd_estimate }` plugs into the existing `_shared/observability.ts` contract, which is designed to flush into the planned `srangam_event_log` table without any caller changes.

---

## Documentation (concurrent, mandatory)

- `docs/architecture/SOURCES_PINS_SYSTEM.md` → add gazetteer + article_pins schema, resolver tier order, backfill contract, AI provider matrix and rationale (this section).
- `docs/RELIABILITY_AUDIT.md` → add invariants:
  - Leaflet must be dynamic-imported on article pages (bundle budget unchanged).
  - `srangam_article_pins` PK guarantees idempotent backfill.
  - Resolver must never block first paint on pins (>10 s timeout falls back to `[]`).
  - **Tenant-AI invariant**: any new AI call site MUST go through `_shared/ai-provider.ts`. No direct `fetch('…openai…')` or `fetch('…gemini…')` outside that file from H.2 forward. Existing callers grandfathered, slated for H.3 migration.
- `.lovable/plan.md` → mark H.2a–d as the active phase.

## What we explicitly do NOT do (anti-scope)

- No new map library, no MapLibre/Mapbox, no tile-server change.
- No edits to `markdown-to-article-import` core pipeline beyond appending one `await invokeBackfillPins()` after the existing `import_complete` log.
- No change to JSON-source articles' shape — they keep their inline `pins`.
- No automatic creation of gazetteer rows from AI output — humans curate (Recogito model). Prevents hallucinated coordinates from polluting the atlas.
- No removal of any existing map component.
- **No Lovable AI Gateway usage.** Your tenant keys are the source of truth.
- No refactor of the four legacy OpenAI callers in this phase — separately tracked as H.3.

## Verification (after default-mode execution)

1. `bunx tsc --noEmit` clean.
2. Deno tests in `backfill-article-pins/pipeline_test.ts`: gazetteer dedupe, evidence-row lift, content scan with diacritic-fold, idempotent re-run, AI-miss logged-not-inserted, **provider fallback** (mock GEMINI 429 → falls back to OpenAI cleanly).
3. Manual: open the article in the screenshot (`srangam-project-research-report`), run "Backfill pins" from admin → confirm one `pin_complete` log line with `provider: "gemini"`, `model: "gemini-2.5-flash"`, non-zero token counts. Refresh — pin chips appear, "View Interactive Map" expands an inline Leaflet map with markers, no box-glyphs in popups (Phase H.1 sanitiser already covers this), `performance.measure('article-map:…')` visible in DevTools.
4. Articles with zero matches: card is hidden (no more empty boxes).
5. Smoke: revoke `GEMINI_API_KEY` temporarily → backfill still succeeds via OpenAI fallback, logs `provider: "openai"`.

## Bundle / load-time impact (measured intent)

- Article page initial JS: **unchanged** (Leaflet behind dynamic import, map collapsed by default).
- One extra `select` per article load (`srangam_article_pins join gazetteer`) — indexed on `article_id`, single round-trip.
- Backfill is offline/admin — never on the request path.

## Tools available in default mode for this work

`supabase` migrations (gazetteer + article_pins tables, seed), edge-function deploy + Deno tests, `code--write` / `code--line_replace` for the three frontend edits + the new shared `ai-provider.ts`, `bunx tsc`. No new secrets requested — `GEMINI_API_KEY` and `OPENAI_API_KEY` are already present.
