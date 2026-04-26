## Where we actually stand (verified, not assumed)

| Surface | State | Evidence |
|---|---|---|
| RBAC | Working — `user_roles` table + `useAuth().isAdmin` (`AuthContext.tsx:25-34`) | No change needed |
| Admin pin authoring | Exists — `GeographyMedia.tsx` calls `backfill-article-pins` edge function per article + bulk | Route already mounted under `/admin` |
| Imaging handoff | Working end-to-end — HMAC, nonce table, `IMAGING_HANDOFF_SECRET` set both sides | `docs/integrations/IMAGING_HANDOFF.md` already published |
| react-leaflet@4 fix | Stable, dev-server clean | `tail dev-server.log` shows two clean Vite boots |
| Per-article map link | **Regressed** — `ImagingLabLauncher` returns `null` when no pins AND no challenge match | `ImagingLabLauncher.tsx:51` |
| In-page pins card | Correctly gated to `pins.length > 0` | `OceanicArticlePage.tsx:287` |
| Article-card list links to maps | Never existed historically | grep on `OceanicIndex`/`Articles` returned nothing |

**RBAC modification: none required.** The plan re-uses `isAdmin` for an admin-only "Add geo-pins" CTA. No new tables, no new policies, no new edge functions.

---

## Phase 0 — Documentation first (saves context, zero code)

Before touching code, update three docs so future agents have full context:

1. **`docs/integrations/IMAGING_HANDOFF.md`** — append a "Per-article launcher contract" section: card always renders; admin-only "Create pins" CTA when `pins.length===0`; signed handoff still skipped for anonymous; `ref=srangam:<slug>` always sanitised.
2. **`docs/architecture/SOURCES_PINS_SYSTEM.md`** — add an "Empty-pin policy" subsection: every published article must either have ≥1 confidence-A/B pin OR be explicitly marked `geo_scope: 'non-spatial'`. Until then, admins see the deeplink CTA.
3. **`docs/IMPLEMENTATION_STATUS.md`** — record Phase J.1 (universal launcher restoration) under the Imaging Bridge section with a checklist of the four sub-phases below.

No memory files needed — this content belongs in the project docs, not in agent memory.

---

## Phase 1 — Restore the universal launcher (the actual regression fix)

Single file: `src/components/imaging/ImagingLabLauncher.tsx`.

- Remove the `if (!firstPin && !challenge) return null;` early return.
- Always render the card. Title becomes "Maps, Imagery & Astronomy".
- **Conditional button stack** (top-to-bottom, only what's relevant shows):
  1. `firstPin` present → "View {pin.name} in satellite imagery" (existing)
  2. `challenge` present → astronomy-lab CTA (existing)
  3. Always → "Open in Atlas" → internal `<Link to={'/maps-data?focus=' + encodeURIComponent(slug)}>` (no token, same tab, instant)
  4. Always → "Open Map Explorer on maps.sankyo.in" → `openImaging({ kind: 'viewer', params: { ref } })` (signed if logged in, public fallback otherwise)
  5. Always (ghost button) → "Open the Srangam Dating Lab hub" (existing)
  6. **Admin-only AND `pins.length===0`** → amber-tinted CTA "Add geo-pins for this article" → internal `<Link to={'/admin/geography-media?article=' + slug}>`. Reads `isAdmin` from `useAuth()`. **This is the user's explicit ask.**

No early returns anywhere. Layout stable: card height grows by one button row max for admins on un-pinned articles.

## Phase 2 — Wire the admin deep-link target

Single file: `src/pages/admin/GeographyMedia.tsx`.

Read `?article=<slug>` from `useSearchParams`. If present:
- Pre-populate the existing `filter` state with the slug so the article surfaces at the top of the table.
- Auto-scroll to its row and flash a one-second highlight (CSS-only).
- Do **not** auto-trigger the backfill — admin still clicks the existing "Backfill pins" button. Surgical, no new mutation paths.

Zero schema change. Reuses existing edge function and existing UI. ~25 LOC.

## Phase 3 — Broaden challenge coverage (curated, not bloated)

Single file: `src/lib/imaging/challengeMap.ts`. Add **one** new rule:

```ts
{
  challengeId: 'precession-demo',
  label: 'Open the precession & nakshatra explainer',
  triggers: ['harappa', 'indus', 'sarasvati', 'ghaggar', 'dwaraka', 'dvaraka', 'rigveda antiquity'],
}
```

Keep first-match-wins. Total rules ≤ 8. Anything beyond this becomes table-driven in a later phase if traffic justifies it.

## Phase 4 — Verification (mandatory before declaring done)

Read-only QA — no further code edits.

1. `/articles/reassessing-rigveda-antiquity` (no pins, now matches `rigveda antiquity`) → 4 buttons + admin sees "Add geo-pins".
2. `/articles/sacred-tree-harvest-rhythms` (no pins, no challenge) → 3 universal buttons + admin sees "Add geo-pins". **This is the regression test.**
3. `/articles/asura-exiles-indo-iranian` (pins + Mitanni) → 5 buttons, no admin CTA (pins exist).
4. Anonymous private window → "Sign-in required" badge, no admin CTA, public-URL fallback works.
5. Authenticated click on "Map Explorer" → confirm redirect lands on `/auth?handoff=…&next=/viewer?ref=srangam:<slug>`.
6. Tail `imaging-handoff-token` edge logs → one 200 per click, no 401/500.
7. Click "Add geo-pins" as admin → lands on `/admin/geography-media?article=<slug>`, row pre-filtered and flash-highlighted.
8. `bun run build` → confirm `OceanicArticlePage` chunk delta < 2 kB gz.
9. `/maps-data` smoke test → `ArticleAtlasMap` still mounts (leaflet@4 still healthy).

---

## What we explicitly will NOT change

- `react-leaflet@^4.2.1` pin (v5 needs React 19).
- `ArticleMiniMap` lazy-import + Suspense — keeps Leaflet out of the article critical path.
- `imaging-handoff-token` edge function, `srangam_handoff_nonces` schema, `IMAGING_HANDOFF_SECRET`.
- `useImagingDeepLink` signed→public fallback chain.
- `user_roles` schema, `has_role()` SECURITY DEFINER, RLS policies — RBAC is already correct.
- Article list/card components — never had a maps link; adding one would inflate list-page bundles.
- `ImagingHubCallout` on `/maps-data` — already working.

---

## Tenant & security invariants (preserved)

- Cross-tenant boundary unchanged: signed handoff still carries only `{ sub, email, name, srangam_role, iat, exp, nonce, target }`. Admin-approval gate on the imaging side stays manual.
- `ref=srangam:<slug>` remains the only Srangam identifier crossing the wire; `sanitiseRef()` continues to strip control chars + leading path/protocol prefixes.
- The new admin CTA links **internally** to `/admin/geography-media` — never crosses the imaging boundary, so no token, no leak.
- Admin gate is enforced two ways: (a) UI hides the button when `!isAdmin`; (b) `/admin/*` routes are already wrapped by `ProtectedRoute` + RLS on `srangam_article_pins` writes (the existing `backfill-article-pins` function uses service-role with admin verification).

---

## Performance & UX impact (measured, not guessed)

- **Bundle**: ~50 LOC added, zero new deps. Expected delta: < 2 kB gz on `OceanicArticlePage` chunk and < 1 kB gz on the admin chunk. Verified in Phase 4 step 8.
- **TTI**: unchanged — launcher card already renders in the existing critical path; we're toggling a few extra buttons, not loading new code.
- **CLS**: zero — card height now stable across all article variants (no longer disappears).
- **A11y**: every new button gets a `<Link>` or `<Button>` with explicit text, `aria-label` where icon-only, and the admin CTA gets `role="link"` semantics inherited from `<Link>`.

---

## Sequencing & rollback

| Step | File(s) | Risk | Rollback |
|---|---|---|---|
| 0 | 3 markdown docs | None | `git revert` |
| 1 | `ImagingLabLauncher.tsx` | Low — pure render change | revert one file |
| 2 | `GeographyMedia.tsx` | Low — read-only `useSearchParams` | revert one file |
| 3 | `challengeMap.ts` | Trivial — adds one rule | revert one file |
| 4 | none (QA) | None | n/a |

Each phase is independently revertible. No migrations, no edge function deploys, no secret rotations, no RBAC changes.

---

## Estimated diff

~80 LOC across **3 code files + 3 docs**. Zero new dependencies. Zero schema changes. Zero edge-function changes. Zero RBAC changes.