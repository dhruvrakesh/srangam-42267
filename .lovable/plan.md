## Revived context (verified against project docs)

Read before planning: `docs/TTS_ARCHITECTURE.md`, `docs/TTS_COST_OPTIMIZATION.md`, `docs/CULTURAL_TERMS_AUTO_HIGHLIGHTING.md`, `docs/RELIABILITY_AUDIT.md`, edge functions `tts-stream-{elevenlabs,openai,google}/index.ts`, and `src/services/narration/NarrationService.ts` + `src/hooks/useNarration.ts` + `src/lib/culturalTermEnhancer.ts`.

Three independent regressions, three independent root causes. All fixes are additive, file-scoped, and reversible per commit. No schema, RLS, edge-function, or routing changes.

---

### Finding 1 — TTS "Text-to-speech generation failed" on mobile

`supabase--edge_function_logs tts-stream-elevenlabs` confirms the server side completes successfully:
```
INFO Generating ElevenLabs TTS for chunk 1/3 → Encoding 11,326,319 bytes
INFO Generating ElevenLabs TTS for chunk 2/3 → Encoding 10,762,493 bytes
INFO Generating ElevenLabs TTS for chunk 3/3 → Encoding  7,701,359 bytes
INFO ElevenLabs TTS stream completed successfully
```

Failure is **client-side** in `NarrationService.processStreamResponse`:
- Each NDJSON line carries a ~10–15 MB base64 string. `JSON.parse` of one line allocates ~15 MB of JS string; then `Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))` materialises the same data again, triggering `RangeError`/GC stalls on Android Chrome. The reader aborts; `useNarration.ts:202` swallows the underlying error as the generic toast.
- Correction to earlier note: edge functions persist whatever `contentHash` the client sends (verified in all three `tts-stream-*` functions at lines that write `content_hash: contentHash`). So the hash *does* round-trip — but the current `generateContentHash` is a 32-bit non-crypto hash with measurable collision risk at scale. It is not the cause of today's failure; it is a latent reliability issue worth fixing in the same surgical sweep.

### Finding 2 — Broken inline links inside articles

Screenshot shows `Veda -english- translation/d/doc839029.html">Wisdom Library)` rendered as body text. Root cause is `src/lib/culturalTermEnhancer.ts`: it protects `<table>` and markdown tables only. Anchor tags, markdown `[text](url)`, and bare URLs are not protected, so `Veda` inside `…/sayana-veda-english-translation/…` gets rewritten to `{{cultural:veda}}`, splitting the URL.

### Finding 3 — Desktop layout on mobile

`index.html` viewport meta is correct. The regression is content-driven. The repeat offender is `src/components/geology/DeepTimeTimeline.tsx:212` `min-w-[1200px]`; when this renders inside an article body that is not wrapped in `overflow-x-auto`, the document grows to 1200 CSS px and the browser zooms out. Secondary offenders: `GatedLanguageSwitcher` / `EnhancedLanguageSwitcher` `min-w-[200px]` on <360 px viewports.

---

## Phase 0 — Documentation refresh (no source changes)

Append a temporally-tagged "2026-05-17 baseline" section to each doc, preserving prior content:

- `docs/TTS_ARCHITECTURE.md` — document: (a) per-line base64 budget for client decode (≤4 MB recommended); (b) chunked `Uint8Array` decoder requirement; (c) `contentHash` round-trip contract (client computes, edge persists verbatim) and the upgrade path to SHA-256.
- `docs/CULTURAL_TERMS_AUTO_HIGHLIGHTING.md` — add "Anchor/URL safety" invariant: enhancer must skip HTML anchors, markdown link syntax, and bare URLs (in addition to tables).
- `docs/RELIABILITY_AUDIT.md` — add Mobile-Viewport Invariant MV-01: "No article-body component may emit a `min-w-[≥640px]` element that is not wrapped in `overflow-x-auto`." List the audited offenders.
- `.lovable/plan.md` — log Phase K (TTS resilience, link-safe enhancer, viewport hardening) with this plan as the source of truth.

## Phase 1 — TTS client robustness (surgical)

File scope: 2 files.

1. `src/services/narration/NarrationService.ts`
   - In `processStreamResponse`, replace `Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))` with a chunked decoder that walks the base64 string in 64 KB slices, emitting `Uint8Array` segments to the consumer immediately. This caps peak heap per audio line at ~64 KB instead of ~15 MB.
   - When `data.audio.length > 4_000_000`, decode and yield in slices without ever holding the full decoded buffer in scope — `useNarration` already concatenates downstream.
   - Upgrade `generateContentHash` to `crypto.subtle.digest('SHA-256', …)` returning a hex string. Make it `async`. Update the single caller in `useNarration.ts`. (This keeps the round-trip contract intact since edge functions persist whatever they receive.)

2. `src/hooks/useNarration.ts`
   - In the catch path, persist the real error name/message in `state.error` and `console.error` it; keep the user-facing toast generic.
   - Before the OpenAI fallback runs, call `narrationService.cancel()` to abort the primary reader and free its buffers on mobile.
   - `await` the new async `generateContentHash`.

3. `src/components/tts/ArticleNarrator.tsx`
   - **No code change**. Confirmed it already uses `VITE_SUPABASE_PUBLISHABLE_KEY` in the Authorization header. Verification only.

No edge-function redeploy. No DB writes. Expected outcome: audio starts on mid-range Android within 3 s; subsequent plays of the same article hit cache.

## Phase 2 — Link-safe cultural-term highlighter

Single file: `src/lib/culturalTermEnhancer.ts`. Mirror the existing table-protection pattern with three new placeholder passes, applied **before** the cultural-term regex and restored **in reverse order** after:

```text
1. HTML anchor tags:   /<a\b[^>]*>[\s\S]*?<\/a>/gi   → __A_PLACEHOLDER_n__
2. Markdown links:     /\[[^\]]+\]\([^)]+\)/g         → __MDLINK_PLACEHOLDER_n__
3. Bare URLs:          /\bhttps?:\/\/[^\s<>"')]+/gi   → __URL_PLACEHOLDER_n__
4. (existing) HTML tables, markdown tables
5. Cultural-term regex pass
6. Restore #4, #3, #2, #1
```

Diff is ~30 LOC; risk contained to one pure function. No downstream renderer change.

## Phase 3 — Mobile viewport hardening

1. `src/components/geology/DeepTimeTimeline.tsx:212` — wrap the `min-w-[1200px]` element in `<div className="overflow-x-auto">…</div>`.
2. `src/components/oceanic/CorrelationTable.tsx` — verify the wrapping element uses `overflow-x-auto`; add only if missing. No table-cell changes.
3. `src/components/i18n/GatedLanguageSwitcher.tsx` and `src/components/i18n/EnhancedLanguageSwitcher.tsx` — add `max-w-full` so the trigger button can shrink below its `min-w-[200px]` on <360 px viewports.
4. `src/components/narration/NarrationControls.tsx:130` `min-w-[120px]` — leave as-is (already inside flex; safe).
5. Record the audited list in `docs/RELIABILITY_AUDIT.md` under MV-01 for future regressions.

No global CSS, no `index.html`, no Tailwind config change.

---

## Out of scope (explicit)

- No edge-function rewrites or redeploys.
- No DB migrations (`srangam_audio_narrations` untouched).
- No RLS, auth, or routing changes.
- No new dependencies (`crypto.subtle` is built-in).
- No edits to article markdown source files.
- No design-token or theme changes.

## Verification checklist

- Mobile Chrome (≤390 px): open the Bhṛgu/Aṅgiras article, tap Play → audio starts within ~3 s, no error toast; replay → console `Cache HIT` for the SHA-256 hash.
- Same article: the `(Wisdom Library)` link renders as one underlined hyperlink; "Veda" and "Agni" still highlight elsewhere in body prose.
- 360 px viewport: no horizontal scroll on article pages; `DeepTimeTimeline` scrolls internally only.
- TypeScript build clean; no lint regressions; existing narration tests still green.

## Rollout

Three independent commits (≈120 LOC across 5 source files plus 3 docs), each reversible by reverting a single file:
1. Phase 0 docs.
2. Phase 1 TTS resilience.
3. Phase 2 + Phase 3 (link-safe enhancer and viewport wrappers — both pure UI/text-pipeline, ship together).

After ship, re-pull `supabase--edge_function_logs tts-stream-elevenlabs` to confirm cache hits replace re-generations on repeat plays.
