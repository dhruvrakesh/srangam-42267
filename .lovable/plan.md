# PR-Srangam-Side: Finalize Imaging Handoff Bridge (v1.0)

The imaging team (`maps.sankyo.in`) has approved our handoff design and shipped their counterpart spec (PR-8 / v0.10.77). The shared `IMAGING_HANDOFF_SECRET` is already set on **both** projects.

This plan covers the **small alignment tweaks** needed on the Srangam side so our token is byte-perfect against their verifier, plus an optional UX polish so the bridge feels production-ready end-to-end.

## What's already in place (no changes needed)

- Edge function `imaging-handoff-token` — issues HMAC-SHA-256 tokens with the exact field set their verifier expects (`iss`, `aud`, `sub`, `email`, `srangam_role`, `iat`, `exp`, `nonce`, `target`).
- 5-minute TTL, UUID nonce, structured `evt: "imaging.handoff.issue"` log line.
- Client helpers: `useImagingDeepLink`, `buildImagingHandoffUrl`, `buildImagingPublicUrl`.
- UI surfaces: `ImagingLabLauncher` on article pages, `ImagingHubCallout` on Maps & Data, "Open in Imaging Lab" buttons in Article Atlas popups.
- Documentation: `docs/integrations/IMAGING_HANDOFF.md`.

## Alignment tweaks (small, surgical)

### 1. Add `name` to the token payload

Their welcome card says: _"Welcome from Srangam, signing you in as `<email>`…"_ and they pull `name` from the claims. Our function currently omits it. We'll fetch the display name (best-effort) from the Supabase user metadata and include it.

- **File**: `supabase/functions/imaging-handoff-token/index.ts`
- Add: `const name = claimsData.claims.name ?? claimsData.claims.user_metadata?.full_name ?? null;`
- Include `name` in the signed payload.
- Falls back to `null` cleanly — their verifier already treats it as optional.

### 2. Document their `srangam_handoff_nonces` table & approval gate

Update `docs/integrations/IMAGING_HANDOFF.md` to reflect what they actually built:

- Replace our speculative "magic link or admin-issued session" wording with their **Google OAuth-anchored** flow — the handoff is a hint + audit trail, the real session comes from Google.
- Note the imaging-side **approval gate**: new users land in `profiles.status='pending'` until the imaging super-admin approves. We should warn first-time Srangam visitors so they don't think the link is broken.

### 3. Add a "first-time visit" hint to `ImagingLabLauncher`

When a user clicks "Open in Imaging Lab" we already open in a new tab. Add a one-line subtitle under the button:

> _First visit? Imaging will ask for Google sign-in and may queue your account for admin approval._

This sets correct expectations and matches what the imaging side actually does. Quiet, non-blocking.

### 4. Sanitise `target.params` before signing

Their security note: _"`next` URL sanitised — must start with `/`, rejects `//evil.com` and `javascript:`"._ Our side already builds `next` from a typed `kind` enum, but if we ever pass an arbitrary `ref` param we should drop control characters. One-liner guard in `buildImagingPath`.

## Files

### Edited
- `supabase/functions/imaging-handoff-token/index.ts` — add `name` to payload.
- `src/lib/imaging/handoff.ts` — sanitise `ref` (strip non-printable + leading `/` `\` `:`).
- `src/components/imaging/ImagingLabLauncher.tsx` — add first-visit hint copy.
- `docs/integrations/IMAGING_HANDOFF.md` — sync with their actual verifier (Google OAuth anchor, pending-approval gate, nonce table name `srangam_handoff_nonces`).

### Unchanged (deliberately)
- All map / atlas / article rendering code.
- RLS policies and database schema.
- Edge function CORS, JWT validation, signing crypto.
- All other handoff helpers and routes.

## Why this is enterprise-grade

- **No DB migrations** on our side — the imaging side owns the nonce table.
- **Fully reversible** — every change is additive copy or one optional field.
- **Token shape stays byte-compatible** with their verifier even if `name` is null.
- **Zero risk to current production traffic** — handoff flow is opt-in via UI buttons that already exist.

## Out of scope

- Returning users to Srangam after they finish in the imaging app (would need a reverse handoff — defer to v2 once we see real usage).
- Pushing Srangam roles into imaging RBAC automatically (they explicitly chose manual approval for v1; we honour that).
- Cron cleanup of nonces (their side, deferred to their v0.10.78).

After approval I'll ship all four edits in one pass — no migrations, no secrets, just code.
