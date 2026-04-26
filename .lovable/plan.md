## Goal

Give registered Srangam users a **seamless, deep-linked bridge** into the imaging/astronomy platform at `maps.sankyo.in` (Lovable project `ima-imaging`) so they can move from a scholarly article straight to satellite imagery, the planetarium, or a Srangam Dating Lab challenge — with their identity carried over via a signed handoff token, and with no risk to the running Srangam site.

The imaging app already has an inbound `/srangam` page (Dating Lab) and outbound links back to `srangam.nartiang.org`. It does **not** yet accept signed handoffs from us. The plan builds the Srangam side now and documents the imaging-side counterpart for a follow-up commit there.

## Key context discovered

- Imaging app is fully auth-gated (`ProtectedRoute` everywhere except `/auth`). It uses Supabase email/password auth.
- It already has these target routes we want to deep-link into:
  - `/viewer` and `/viewer/:id` — Map Explorer (satellite imagery viewer)
  - `/sky` — Planetarium (lazy-loaded)
  - `/astronomy-lab?challenge=<id>` — preset astronomical-dating challenges
  - `/srangam` — Srangam Dating Lab hub
  - `/cases` — Field Notes (the natural place to attach an article reference)
- It exposes `SEED_CHALLENGES` like `mahabharata-eclipse-kurukshetra`, `lunar-eclipse-ujjain`, with suggested lat/lng — exactly what some of our articles already pin in `srangam_article_pins` / `srangam_gazetteer`.
- The two projects run on **different Supabase backends**, so we cannot assume a shared session cookie. Identity must be passed explicitly.
- Both apps use the same auth identity convention (email-as-PK), which is what the handoff token will assert.

## What we ship in this PR (Srangam side)

### 1. Configurable Imaging base URL
- Add `IMAGING_BASE_URL` to `src/lib/constants.ts` (default `https://maps.sankyo.in`, overridable via `VITE_IMAGING_BASE_URL` for staging).

### 2. Signed handoff edge function: `imaging-handoff-token`
- Authenticated-only (verifies the Srangam user's JWT in code).
- Returns a short-lived (5 min) **HMAC-signed** JSON token containing:
  ```ts
  { sub: user.id, email, name?, srangam_role: 'admin' | 'user',
    iat, exp, nonce, target: { kind, params } }
  ```
- Signed with a new `IMAGING_HANDOFF_SECRET` shared with the imaging project.
- Logs every issuance to `srangam_event_log` (`imaging.handoff.issue`) for observability.

### 3. Reusable React helper: `useImagingDeepLink()`
- Hook returns an async `openImaging(target)` function.
- Calls the edge function, builds a URL of the form:
  ```
  https://maps.sankyo.in/auth?handoff=<token>&next=/viewer/...
  ```
- Opens in a new tab (`rel="noopener"`), with a graceful fallback to plain link (no token) if the user isn't signed in or the function fails.
- Targets supported in v1:
  - `viewer`            → `/viewer?lat=…&lon=…&zoom=…`
  - `planetarium`       → `/sky?date=…&lat=…&lon=…`
  - `astronomy-lab`     → `/astronomy-lab?challenge=<seedId>`
  - `dating-lab`        → `/srangam`

### 4. Article-level "Open in Imaging Lab" affordance
- New small component `ImagingLabLauncher.tsx` mounted in `OceanicArticlePage.tsx` **next to the existing `ArticleMiniMap`**, only when:
  - the user is authenticated, AND
  - the article has at least one geo-pin OR matches a known seed-challenge tag (e.g. `mahabharata`, `eclipse`, `nakshatra`, `precession`).
- Renders a compact card with up to three contextual actions:
  1. "Open these places in satellite imagery" → `/viewer` deep link with the article's first pin.
  2. "Run the matching dating challenge" → `/astronomy-lab?challenge=<auto-mapped seedId>` when a tag/keyword match exists.
  3. "Open Srangam Dating Lab" → `/srangam` (always shown as a fallback).
- Each button shows the destination domain (`maps.sankyo.in`) and opens in a new tab so the user never loses their reading flow.

### 5. Maps & Data page integration
- Add an "Open in Imaging Lab" button on each Article Atlas popup (only for signed-in users) — same hook, jumping to `/viewer` centred on that place.
- One small "Try the Imaging Lab" callout above the atlas, gated to authenticated users, linking to `/srangam` and explaining the cross-platform workflow.

### 6. Auth-aware UX
- Unauthenticated users see a **Sign in to use** ghost variant of the same buttons that routes them to our `/auth` page first, then deep-links after sign-in (via `?next=` round-trip we already support).

### 7. Article ↔ challenge mapping table (lightweight)
- New `src/lib/imaging/challengeMap.ts` mapping article tags / theme keywords → seed challenge IDs that exist in the imaging project. Curated, ~10 entries to start (Mahabharata, Kurukshetra, Ujjain, Nakshatra, Precession, Venus, etc.). Easy to extend later.

### 8. Documentation
- Append a new section to `docs/architecture/SOURCES_PINS_SYSTEM.md` describing the cross-app handoff (token shape, endpoints, security model).
- Add a short `docs/integrations/IMAGING_HANDOFF.md` covering the imaging-side counterpart we'll ship in the other project (verifier endpoint + sign-in flow).

## What changes (file list)

### New
- `supabase/functions/imaging-handoff-token/index.ts`
- `src/lib/imaging/handoff.ts` (URL builder + types)
- `src/lib/imaging/challengeMap.ts`
- `src/hooks/useImagingDeepLink.ts`
- `src/components/imaging/ImagingLabLauncher.tsx`
- `docs/integrations/IMAGING_HANDOFF.md`

### Edited (surgical)
- `src/lib/constants.ts` — add `IMAGING_BASE_URL`.
- `src/components/oceanic/OceanicArticlePage.tsx` — mount `<ImagingLabLauncher>` next to the existing mini-map block.
- `src/pages/MapsData.tsx` — add the auth-gated callout above the Article Atlas card.
- `src/components/maps/ArticleAtlasMap.tsx` — small "Open in Imaging" link inside each marker popup (one new line of UI per popup).
- `docs/architecture/SOURCES_PINS_SYSTEM.md` — new "Imaging handoff" section.

### Untouched (deliberately)
- All existing edge functions, RLS, `srangam_article_pins`, `srangam_gazetteer`, narration, OG generation, admin jobs.
- The other project's repository — that's a separate PR (documented but not edited here).

## Secrets needed

- `IMAGING_HANDOFF_SECRET` (new) — random 32-byte HMAC key, shared with the imaging project. Will be requested via `add_secret` once the plan is approved. Same value must be set as `IMAGING_HANDOFF_SECRET` in the imaging project for verification.

## Imaging-side counterpart (out of scope for this PR, documented only)

For completeness, the imaging project will need a parallel commit:
1. New `/auth` query handler that reads `?handoff=…&next=…`, verifies the HMAC + expiry against `IMAGING_HANDOFF_SECRET`, looks up or auto-creates the Supabase user by email, signs them in via a one-time magic-link or admin-issued session, and finally redirects to `next`.
2. Optional: a `srangam_handoffs` audit table in the imaging project mirroring our event log.

We will hand the imaging-side spec over to that project as a follow-up message once Srangam is ready.

## Security model (one paragraph)

The handoff token is HMAC-signed with a shared secret stored only in edge-function env on both sides — never in client code. Tokens expire in 5 minutes, carry a single-use nonce, and are bound to a specific `target`. The receiving app **must** verify signature, expiry, and nonce-replay before granting any session. No long-lived cross-domain cookies, no third-party identity provider, no PII beyond email + display name.

## Why this is "surgical and enterprise-grade, not a kill"

- Zero schema changes on Srangam.
- Zero changes to existing routes, RLS, or admin job system.
- New UI is **additive** and **auth-gated**: anonymous visitors see no change, signed-in users see one extra card per article + one popup link + one Maps page callout.
- Token issuance is a new, isolated edge function; if it fails the launcher silently falls back to a plain external link to `/srangam`, so nothing breaks.
- Imaging-side work is documented but not bundled — keeps this PR reviewable and shippable on its own.
