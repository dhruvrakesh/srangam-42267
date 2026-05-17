## Phase L — TTS Observability & Mobile Overflow Smoke Test

Surgical, additive, doc-first. Three independent, reversible commits that **heal and instrument** without touching the production TTS pipeline, schema, RLS, auth, routing, or edge functions. Builds directly on Phase K (`.lovable/plan.md`) and the MV-01 invariant in `docs/RELIABILITY_AUDIT.md`.

### Verified context (codebase as of 2026-05-17)

- TTS state lives in `src/services/narration/NarrationService.ts` + `src/hooks/useNarration.ts`. Cache lookup is `getCachedAudio()`; stream path is `streamAudio()` → `processStreamResponse()` with `decodeBase64InSlices()` (Phase K.1).
- Article route for Bhṛgu/Aṅgiras is backed by `src/data/articles/rishi-genealogies-vedic-tradition.ts` and rendered through `src/components/articles/ArticlePage.tsx` (no existing `data-testid`).
- **No Vitest config, no `src/test/setup.ts`, no `src/__tests__` directory exists today.** Adding tests requires bootstrapping the testing harness as a one-time, additive step.
- MV-01 (mobile viewport, no horizontal overflow at 360 px) is already documented in `docs/RELIABILITY_AUDIT.md`; offenders were wrapped in Phase K.3 (`DeepTimeTimeline`, `GatedLanguageSwitcher`).

---

### Phase L.0 — Documentation first (no code)

Update before any source change, per the documentation-first rule:

- `.lovable/plan.md` — append a **Phase L** section mirroring this plan with dated entries.
- `docs/TTS_ARCHITECTURE.md` — add an **Observability** section: telemetry record shape, log format, dev-only panel, the 3-second mobile first-play budget, and the four measured phases (`generate`, `decode`, `stream`, `playbackStartGap`).
- `docs/RELIABILITY_AUDIT.md` — under MV-01, add a **Verification** subsection: jsdom structural regression test + manual cross-browser sweep (iOS Safari 17, Android Chrome 124, Samsung Internet 24) at 360 px.

---

### Phase L.1 — Dev-only TTS Cache/Origin Debug Panel

**Goal.** During development, surface whether the most recent play was served from the GDrive cache or freshly streamed, plus provider, voice, content-hash prefix, and slug — focused on validating Bhṛgu/Aṅgiras cache hits on the second play.

**Files**
- `src/services/narration/telemetry.ts` *(new)* — isolated module so the production bundle can dead-code-eliminate cleanly. Exports `TtsTelemetry` type, `recordTelemetry(record)`, `getLastTelemetry()`, `subscribe(cb): () => void`. Pure in-memory, no storage, no network.
- `src/services/narration/NarrationService.ts` — emit a telemetry record from `streamAudio()` (origin `stream`) and from `getCachedAudio()` callers (origin `cache`). Telemetry write is best-effort, wrapped in try/catch so it cannot break playback.
- `src/hooks/useNarration.ts` — at cache-hit branch, finalize a `cache` record before `audio.play()`; at stream success, finalize a `stream` record after first `audio.play()` resolves.
- `src/components/dev/NarrationDebugPanel.tsx` *(new)* — fixed bottom-left card. Renders only when `import.meta.env.DEV`. Shows origin badge (cache=emerald / stream=amber), provider, voice, `hash.slice(0,8)`, slug, last 4 timings. Subscribes via `telemetry.subscribe`.
- `src/App.tsx` — mount `{import.meta.env.DEV && <NarrationDebugPanel />}` once at the root. Vite tree-shakes this branch in `build`.

**Type addition (additive to `src/types/narration.ts`)**
```
export interface TtsTelemetry {
  origin: 'cache' | 'stream';
  provider: NarrationProvider;
  voice: string;
  language: string;
  articleSlug?: string;
  contentHashPrefix: string; // first 8 chars
  timings: { generate?: number; decode?: number; stream?: number; playbackStartGap?: number; firstPlayMs?: number };
  slowest?: 'generate' | 'decode' | 'stream' | 'playbackStartGap';
  timestamp: number;
}
```

---

### Phase L.2 — TTS streaming timing instrumentation

**Goal.** Make the 3-second mobile first-play budget observable; log the slowest of the four phases per play.

**Files**
- `src/services/narration/NarrationService.ts` — record `performance.now()` checkpoints inside `streamAudio()` / `processStreamResponse()`:
  - `t_request` (POST sent), `t_first_byte` (first NDJSON line parsed), `t_first_audio_chunk` (first decoded slice yielded), `t_stream_done` (last line consumed).
  - Compute `generate = first_byte - request`, `decode = first_audio_chunk - first_byte`, `stream = stream_done - first_byte`.
- `src/hooks/useNarration.ts` — capture `t_play_resolved` after the first `audio.play()` promise resolves; compute `playbackStartGap = t_play_resolved - t_first_audio_chunk` and `firstPlayMs = t_play_resolved - t_request_initial`.
- Single structured log line per play (cap noise to one log):
  `[TTS perf] origin=stream provider=elevenlabs slug=rishi-genealogies-vedic-tradition hash=ab12cd34 generate=842 decode=118 stream=1840 firstPlay=2104 slowest=stream`
- `slowest` = `argmax({generate, decode, stream, playbackStartGap})`, persisted in the same telemetry record consumed by L.1.

No new dependencies. All timing fields are optional in the type; missing values (e.g. on cache hit) simply do not log.

---

### Phase L.3 — Responsive overflow smoke test @ 360 px

**Goal.** Lock in the MV-01 invariant so a future component with `min-w-[NNNNpx]` cannot silently re-break mobile.

**Honest framing.** jsdom does not perform real layout, so a runtime `scrollWidth` assertion is unreliable. The enterprise approach is **two complementary nets**:

1. **Structural (automated, jsdom).** Walk the rendered article tree (Bhṛgu/Aṅgiras fixture). For every element whose `className` matches `/min-w-\[\d{3,}px\]/`, assert it has an ancestor with `overflow-x-auto` or `overflow-auto`. This catches the exact regression class that produced the Phase K bug.
2. **Manual cross-browser sweep (documented, not automated).** iOS Safari 17, Android Chrome 124, Samsung Internet 24 at 360×640. Checklist lives under MV-01 in `docs/RELIABILITY_AUDIT.md`. To be run pre-release.

**Test harness bootstrap (one-time, additive, dev-only)**
- Add to `package.json` devDependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`. No runtime deps touched.
- New files (all isolated to test surface):
  - `vitest.config.ts`
  - `src/test/setup.ts` (matchMedia + jest-dom)
  - `src/__tests__/responsive/article-overflow-360.test.tsx`
- `tsconfig.app.json` — add `"vitest/globals"` to `compilerOptions.types` (additive only).

**Production code change (single, trivial)**
- `src/components/articles/ArticlePage.tsx` — add `data-testid="article-body"` to the existing `<article …>` wrapper. Zero visual impact.

---

### Out of scope (explicitly)

- No edge-function code or redeploy.
- No DB migration, no RLS, no auth, no routing.
- No new runtime dependencies (test deps are dev-only).
- No change to TTS streaming logic, fallback chain, cache lookup, or hash function.
- No change to article markdown source.

### Verification

1. `bunx vitest run src/__tests__/responsive/article-overflow-360.test.tsx` is green.
2. Bhṛgu/Aṅgiras article in dev preview → first play shows panel `origin=stream`; second play (within session) shows `origin=cache`.
3. One `[TTS perf] …` line per play in console, with `slowest=…`.
4. `npm run build` then `rg NarrationDebugPanel dist/assets` returns nothing (DEV-gated panel tree-shaken).
5. Manual 360 px sweep on Bhṛgu article in iOS Safari + Android Chrome: no horizontal page scroll; `DeepTimeTimeline` scrolls internally only.

### Rollout

Three independent commits, each reversible by reverting a single feature:

```
L.0  docs only           (4 files)
L.1  telemetry + panel   (5 files, 1 new module, 1 new component)
L.2  timing instrument   (2 files, extends L.1 record)
L.3  test harness + test (4 new files + 1 testid + tsconfig types)
```

**Estimated diff:** ~220 LOC across 7 source files, 4 new test-harness files, 3 doc updates. Zero schema or edge-function changes. Each phase deployable independently.

---

# Phase L — TTS Observability & Mobile Overflow Smoke Test (2026-05-17)

## L.0 Documentation (shipped)
- `docs/TTS_ARCHITECTURE.md` — Observability section: telemetry record, phases, log format, 3s mobile budget.
- `docs/RELIABILITY_AUDIT.md` — MV-01 verification (source-scan test + manual cross-browser checklist).

## L.1 Dev-only TTS Cache/Origin Debug Panel (shipped)
- `src/services/narration/telemetry.ts` (new) — in-memory pub/sub, history of last 4, single structured log per play.
- `src/components/dev/NarrationDebugPanel.tsx` (new) — fixed bottom-left badge (cache=emerald / stream=amber), tree-shaken in prod.
- `src/App.tsx` — DEV-gated lazy mount.

## L.2 TTS streaming timing instrumentation (shipped)
- `src/services/narration/NarrationService.ts` — `lastPerf` checkpoints (`tRequest`, `tFirstByte`, `tFirstAudioChunk`, `tStreamDone`).
- `src/hooks/useNarration.ts` — finalize telemetry on first `audio.play()` resolve; compute `firstPlayMs`, `playbackStartGap`, slowest phase.

## L.3 Responsive overflow smoke test @ 360 px (shipped)
- `vitest.config.ts` (new) — minimal node-env config.
- `src/__tests__/responsive/article-overflow-360.test.ts` (new) — source-scan regression net for `min-w-[≥360px]` without `overflow-x-auto`.
- `src/components/articles/ArticlePage.tsx` — `data-testid="article-body"` anchor (additive only).
- DevDeps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@vitejs/plugin-react-swc`.

## Out of scope
No edge-function redeploy, schema migration, RLS/auth/routing change, runtime-dependency addition, or TTS pipeline logic change.
