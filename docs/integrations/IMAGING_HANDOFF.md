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

## Imaging-side counterpart (shipped in `ima-imaging` v0.10.77)

The imaging team verified and shipped the receiving half. The trust anchor
on their side is **managed Google OAuth** (the same provider Srangam uses),
so the handoff token is treated as a *signed hint + audit record*, not as a
session credential. Concretely:

1. **Shared env**: `IMAGING_HANDOFF_SECRET` set byte-identical on both projects.
2. **Edge function** `verify-srangam-handoff` (public, `verify_jwt = false`):
   - Re-computes HMAC-SHA-256 over the payload, constant-time compare.
   - Rejects on `aud !== "maps.sankyo.in"`, `exp < now`, future `iat`, or
     a replayed `nonce`.
3. **Replay table** `public.srangam_handoff_nonces` (admin-readable,
   service-role insert only):
   ```sql
   create table public.srangam_handoff_nonces (
     nonce text primary key,
     email text not null,
     consumed_at timestamptz not null default now(),
     target jsonb
   );
   ```
4. **`/auth?handoff=…&next=…`** UX:
   - Verifies the token, then shows a "Welcome from Srangam, signing you in
     as `<email>`…" card with a single **Continue with Google as `<email>`**
     button.
   - The actual Supabase session is minted by Google OAuth — never by the
     handoff token directly. Final identity = Google, audit trail = handoff.
   - `next` is sanitised: must start with `/`, rejects `//evil.com` and
     `javascript:` schemes.
5. **Approval gate (preserved)**: new imaging users land in
   `profiles.status = 'pending'` until the imaging super-admin approves —
   even after a valid handoff. The launcher UI in Srangam warns first-time
   visitors so this isn't surprising.
6. **Observability**: every verify attempt (`ok`, `expired`, `bad_signature`,
   `replay`) is written to the imaging-side `provider_request_log` ledger
   under `provider='srangam'`.

## Security notes

- Secret lives only in edge-function env on both sides — never shipped to
  the browser.
- Tokens expire in 5 minutes and carry a single-use nonce.
- `target.kind` is validated server-side before signing on the Srangam
  side and again before redirecting on the imaging side.
- `next` is path-only (`/viewer?...`); both sides reject anything that
  parses as an absolute URL. Pass-through `ref` values are stripped of
  control characters and leading `/`, `\`, `:` on the Srangam side
  (`sanitiseRef` in `src/lib/imaging/handoff.ts`).
- Final identity is always **Google OAuth** — Google's 2FA, account
  recovery, and revocation remain authoritative. The handoff cannot be
  used to bypass the imaging-side admin approval.
- All issuances are logged with `evt: "imaging.handoff.issue"` for
  future ingestion into `srangam_event_log`; the imaging side mirrors
  every verify into its own audit ledger.

## Targets supported in v1

| `kind` | Imaging route | Useful params |
|---|---|---|
| `viewer` | `/viewer` | `lat`, `lon`, `zoom`, `ref` |
| `planetarium` | `/sky` | `lat`, `lon`, `date`, `ref` |
| `astronomy-lab` | `/astronomy-lab?challenge=…` | `challenge`, `ref` |
| `dating-lab` | `/srangam` | `ref` |

The `ref` param is opaque to the imaging app — used for cross-app
analytics (e.g. `srangam:article-slug`, `srangam:atlas:<place_id>`).
