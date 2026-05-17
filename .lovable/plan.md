# Active Plan — Phase K (2026-05-17)

## Phase K.1 — TTS client robustness (shipped)
- `src/services/narration/NarrationService.ts`: chunked base64 decoder (`decodeBase64InSlices`, 64 KB windows); SHA-256 async `generateContentHash`.
- `src/hooks/useNarration.ts`: `await` async hash; `narrationService.cancel()` before OpenAI fallback; preserve true error cause on toast.

## Phase K.2 — Link-safe cultural-term highlighter (shipped)
- `src/lib/culturalTermEnhancer.ts`: protect HTML anchors, markdown links, bare URLs in addition to tables; LIFO restore.

## Phase K.3 — Mobile viewport hardening (shipped)
- `src/components/geology/DeepTimeTimeline.tsx`: belt-and-braces `overflow-x-auto` wrapper around 1200px timeline.
- `src/components/i18n/GatedLanguageSwitcher.tsx`: `max-w-full` so 200 px trigger shrinks on <360 px viewports.
- `src/components/oceanic/CorrelationTable.tsx`: verified already wrapped at line 111.

## Phase K.0 — Documentation (shipped)
- `docs/TTS_ARCHITECTURE.md`: per-line decode budget, hash round-trip contract, fallback abort ordering.
- `docs/CULTURAL_TERMS_AUTO_HIGHLIGHTING.md`: Anchor/URL safety invariant + restore order.
- `docs/RELIABILITY_AUDIT.md`: MV-01 mobile-viewport invariant + audited offenders table.

## Out of scope
No edge-function redeploy, schema migration, RLS/auth/routing change, or markdown source edit.
