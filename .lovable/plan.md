# Fix `/maps-data` crash + how to test the project

## Root cause

The runtime error `TypeError: n is not a function` thrown inside `ArticleAtlasMap` (visible in the ErrorBoundary on `/maps-data`) is **not** caused by the imaging-handoff bridge. It is a **library version mismatch**:

- `package.json` pins `react: ^18.3.1` and `react-dom: ^18.3.1`.
- `package.json` also pins `react-leaflet: ^5.0.0`.
- **`react-leaflet@5` requires React 19.** When run on React 18 its internals call APIs that resolve to `undefined` after minification → the classic `n is not a function` crash inside `MapContainer` / `TileLayer` (the `ot` / `lt` symbols in the stack trace).

This is why every page that mounts a react-leaflet map (Article Atlas, Mitanni map, Sarasvati map, Jyotirlinga map, Epigraphic atlas, etc.) is at risk — the Atlas just happens to be the most visible one because it's on the landing route.

## The fix (one line in `package.json` + reinstall)

Downgrade to the latest React 18-compatible release:

```
"react-leaflet": "^4.2.1"
```

The API we use (`MapContainer`, `TileLayer`, `CircleMarker`, `Popup`, `Marker`, `useMap`) is identical between v4.2 and v5.0, so **no source files need to change**. We will:

1. Run `bun remove react-leaflet`
2. Run `bun add react-leaflet@^4.2.1`
3. Verify the dev server boots and `/maps-data` renders the Article Atlas without the ErrorBoundary.

## How to test the project end-to-end after the fix

A short, reproducible smoke test you can run yourself in the preview:

### 1. Map rendering (visual)

- Open `/maps-data` — the **Article Atlas** card should show a Leaflet map with circle markers (no "Sacred Knowledge Loading Error").
- Open `/articles/mitanni-…`, `/articles/jyotirlinga-…`, `/articles/sarasvati-…`, and the **Epigraphic Atlas** page — each map should mount without an error boundary.

### 2. Imaging handoff bridge (the work from the previous PRs)

- **Anonymous** (logged out): on `/maps-data`, click **Open Map Explorer** in the *Imaging & Astronomy Lab* callout → opens `https://maps.sankyo.in/viewer?ref=srangam:maps-data` in a new tab. Expected: imaging app prompts for sign-in.
- **Authenticated**: sign in on Srangam, then click the same button → opens `https://maps.sankyo.in/auth?handoff=…&next=/viewer…`. Expected: imaging app verifies the HMAC, mints a session, lands on the viewer.
- **From a marker popup**: click any cluster on the Article Atlas → "Open in Imaging Lab" passes `lat`, `lon`, `zoom=12`, `ref=srangam:atlas:<place_id>`.
- **From an article**: open any article that has geo-pins or matches an astronomical-dating tag (Eclipse, Mahabharata, Precession). The `ImagingLabLauncher` should appear with the first-visit hint.

### 3. Edge function health

In the Lovable Cloud "Edge Function Logs" panel, watch `imaging-handoff-token` while you click the buttons. You should see one INFO log per click with `target.kind` and no errors. If a 500 appears, check that `IMAGING_HANDOFF_SECRET` is set on this project (it should be — you confirmed earlier).

### 4. Console check

Open DevTools → Console on `/maps-data`. After the fix, expect:
- No `TypeError: n is not a function`.
- A few benign INFO logs from `slugResolver` / `articleResolver`.

## Out of scope for this PR

- No changes to the imaging-handoff edge function, hooks, or UI components — those are working as designed; they were just being unmounted by the crashing map.
- No changes to other maps' source — the v4 ↔ v5 API is compatible for our usage.
- No React 19 upgrade — that's a much larger project (RSC behaviour, types regeneration, third-party library audit) and not needed to unblock this.

## Files touched

- `package.json` (one dependency version).
- `bun.lockb` (regenerated automatically by `bun add`).

That's it — no code changes.
