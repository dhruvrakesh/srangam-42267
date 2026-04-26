# Imaging Handoff — Cross-app SSO from Srangam to maps.sankyo.in

This doc describes how a registered Srangam user is handed off to the
imaging / astronomy lab project (`ima-imaging`, deployed at
**`https://maps.sankyo.in`**) without re-typing credentials, and what the
imaging side needs to implement to complete the bridge.

## Why this exists

Srangam articles often pin specific places (gazetteer-backed coordinates)
or reference astronomical events (eclipses, nakshatras, precession). The
imaging app already has the right tools — Map Explorer, Planetarium,
Astronomy Lab seed challenges — but lives on a separate Supabase backend.
A signed handoff lets a reader jump from an article straight into those
tools as themselves, in one click.

## Architecture

```text
   ┌────────────────────────────┐                ┌──────────────────────────────┐
   │ srangam.nartiang.org       │                │ maps.sankyo.in (ima-imaging) │
   │                            │                │                              │
   │ ImagingLabLauncher  ──┐    │                │                              │
   │ ImagingHubCallout    ─┼──▶ POST handoff ──▶ │ /auth?handoff=<token>        │
   │ ArticleAtlasMap popup └    │  (HMAC-signed) │       &next=/viewer?...      │
   │           │                │                │           │                  │
   │           ▼                │                │           ▼                  │
   │ supabase.functions.invoke  │                │ verify HMAC + exp + nonce    │
   │  (`imaging-handoff-token`) │                │ → mint Supabase session      │
   │           │                │                │ → redirect to `next`         │
   └───────────┼────────────────┘                └──────────────────────────────┘
               ▼
   IMAGING_HANDOFF_SECRET (shared)
```

## Token shape

```jsonc
{
  "iss": "srangam.nartiang.org",
  "aud": "maps.sankyo.in",
  "sub": "<srangam supabase user id>",
  "email": "user@example.org",
  "srangam_role": "admin" | "user",
  "iat": 1714137600,
  "exp": 1714137900,            // iat + 300s (5 min)
  "nonce": "<uuid>",            // single-use
  "target": {
    "kind": "viewer" | "planetarium" | "astronomy-lab" | "dating-lab",
    "params": { /* per-kind */ }
  }
}
```

Wire format: `base64url(JSON(payload)) + "." + base64url(HMAC_SHA256(payload_b64, IMAGING_HANDOFF_SECRET))`.

## Srangam-side endpoints

| Path | Method | Auth | Description |
|---|---|---|---|
| `/functions/v1/imaging-handoff-token` | POST | JWT (Supabase) | Returns `{ handoff, expires_at, target }`. Body: `{ target }`. |

Caller helper: `useImagingDeepLink()` in `src/hooks/useImagingDeepLink.ts`.

## Imaging-side counterpart (to implement in `ima-imaging`)

1. **New env var**: `IMAGING_HANDOFF_SECRET` — must be byte-identical to
   the one set in this project.
2. **Edge function** `verify-srangam-handoff` (or inline in `/auth`):
   - Re-compute HMAC over the payload, compare in constant time.
   - Reject if `aud !== "maps.sankyo.in"`, `exp < now`, or `nonce` was
     seen in the last 10 minutes (use a tiny `srangam_handoffs(nonce, used_at)`
     table with a 10-minute pruning index).
   - Look up `auth.users` by email; create if missing (admin API).
   - Issue a one-time magic link or admin-generated session for that user
     and redirect to `?next=` (validated against an allow-list of
     internal paths only — never an absolute URL).
3. **Optional UI**: small "Signed in via Srangam" toast on first redirect.

## Security notes

- Secret lives only in edge-function env on both sides — never shipped to
  the browser.
- Tokens expire in 5 minutes and carry a single-use nonce.
- `target.kind` is validated server-side before signing on the Srangam
  side and again before redirecting on the imaging side.
- `next` must be path-only (`/viewer?...`); the imaging-side verifier
  must reject anything that parses as an absolute URL.
- All issuances are logged with `evt: "imaging.handoff.issue"` for
  future ingestion into `srangam_event_log`.

## Targets supported in v1

| `kind` | Imaging route | Useful params |
|---|---|---|
| `viewer` | `/viewer` | `lat`, `lon`, `zoom`, `ref` |
| `planetarium` | `/sky` | `lat`, `lon`, `date`, `ref` |
| `astronomy-lab` | `/astronomy-lab?challenge=…` | `challenge`, `ref` |
| `dating-lab` | `/srangam` | `ref` |

The `ref` param is opaque to the imaging app — used for cross-app
analytics (e.g. `srangam:article-slug`, `srangam:atlas:<place_id>`).
