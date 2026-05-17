# Phase N — Full Security Remediation (Post-Phase-M Re-scan)

## What actually happened

Phase M did **not** introduce new errors. The scanner re-ran with refreshed rules after the M.2 RLS tightening and surfaced findings that were always present but had been masked. Phase N resolves every open finding (5 errors, 8 warnings, 1 info) in one coordinated, surgical, reversible sweep aligned with the Surgical Healing principle and the project's documentation-first development philosophy (`mem://development/documentation-first-planning`).

**Pre-flight verification done** (so this plan does not hallucinate):
- `ProtectedRoute.tsx` confirmed to gate on `user` only — no `isAdmin` check.
- `useAdminJob.ts` confirmed to use Realtime `postgres_changes` on `srangam_admin_jobs` → **N.2 must not drop the publication**; instead we add restrictive `realtime.messages` RLS.
- `pg_publication_tables` confirms only `srangam_admin_jobs` is in `supabase_realtime`.
- 27 edge functions enumerated; the auth-gate inventory in N.3 is exhaustive.
- 13 `SECURITY DEFINER` functions inventoried; N.7 lists each one with its keep/revoke decision.
- Storage policies on `storage.objects` enumerated — the broad bucket-wide SELECTs that enable listing are identified.
- `backfill-article-pins/index.ts` line 291 confirmed as the existing JWT-validation pattern we will codify in `_shared/auth-gate.ts`.

---

## Open Findings Inventory (14 total)

| # | Sev | Finding | Phase |
|---|-----|---------|-------|
| 1 | Error | `srangam_articles` has dual SELECT policies; `USING(true)` exposes drafts | **N.1** |
| 2 | Error | `srangam_admin_jobs` Realtime broadcast leaks cost / params / errors | **N.2** |
| 3 | Error | 9 cost-bearing edge functions accept unauthenticated calls | **N.3** |
| 4 | Error | 6 write/import edge functions accept unauthenticated calls (service-role) | **N.3** |
| 5 | Error | `jspdf ^3.0.4` still flagged for critical + high CVEs | **N.4** |
| 6 | Warn  | `ProtectedRoute` lets any signed-in user reach `/admin/*` | **N.5** |
| 7 | Warn  | `narration_analytics` anonymous rows readable by all visitors | **N.6** |
| 8 | Warn  | `srangam_audio_narrations` writable by any signed-in user | **N.6** |
| 9 | Warn  | 6 editorial content tables writable by any signed-in user | **N.6** |
| 10 | Warn | `SECURITY DEFINER` functions executable by `public`/`anon` | **N.7** |
| 11 | Warn | `SECURITY DEFINER` functions executable by `authenticated` (non-admin) | **N.7** |
| 12 | Warn | Public storage buckets allow listing all file paths | **N.8** |
| 13 | Info | `jspdf` medium advisories | rolls into **N.4** |

PostGIS `spatial_ref_sys` remains the single accepted-risk warning from Phase M.

---

## N.0 — Documentation First (zero runtime impact)

- `.lovable/plan.md` — append **Phase N** with full task list, owners, verification, rollback.
- `docs/RELIABILITY_AUDIT.md` — new **§ Phase N — Hardening Pass**, expand **§ Accepted Risks**, document invariants 11–15.
- `docs/TTS_ARCHITECTURE.md` — new **§ Server-Side Auth Gate (Phase N)** explaining JWT + admin enforcement; note this back-stops the existing client-side admin-only narration (`mem://features/narration/admin-only-access`).
- `docs/IMPORT_WORKFLOW.md` — note that import functions now require admin JWT.
- `docs/ADMIN_DASHBOARD.md` and `docs/ADMIN_DASHBOARD_ARCHITECTURE.md` — note the `isAdmin` route gate and the new `realtime.messages` policy.
- `docs/DATABASE_SCHEMA.md` / `docs/DATABASE_SCHEMA_ADMIN.md` — refresh RLS section with the Phase N policies and EXECUTE-grant matrix.
- `docs/CURRENT_STATUS.md` — flip Phase M → "complete + post-scan addressed in Phase N".
- `mem://index.md` — replace the **Security Baseline** line with Phase N values.

---

## N.1 — Close the draft-articles read hole (Error #1)

```sql
-- The overlapping permissive policy below was OR'd with the
-- status-filtered one, so drafts were public.
DROP POLICY IF EXISTS "Anyone can view articles" ON public.srangam_articles;

-- Admins keep visibility of every status for editorial work.
CREATE POLICY "Admins can view all articles"
  ON public.srangam_articles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

`"Public read published articles"` (`status = 'published'`) remains the only anon path. No client code change required: public listings (`ArticleListPage`, search, sitemap, cards) already filter to `status='published'`. Admin Dashboard reads under the new admin policy.

**Verification**: anon REST `?slug=eq.<draft>` → `[]`; admin same query → 1 row; published articles continue to render anonymously.

**Rollback**: re-create `"Anyone can view articles"` USING `(true)` (one statement).

---

## N.2 — Restrict Realtime broadcast for admin jobs (Error #2) — *corrected from initial draft*

`useAdminJob.ts` actively subscribes to `postgres_changes` on `srangam_admin_jobs`. Dropping the publication would break the Admin Job Progress card. The correct surgical fix is to add a restrictive policy on `realtime.messages` that scopes the channel to admins:

```sql
-- Keep the publication so admins keep live job progress UI.
-- Restrict the Realtime channel itself to admin subscribers only.
-- Realtime evaluates this on subscribe + on every broadcast.
CREATE POLICY "Only admins can subscribe to admin-job channels"
  ON realtime.messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- (If a permissive default policy on realtime.messages exists, drop it first;
--  to be discovered and named in the migration file.)
```

The existing table-level RLS on `srangam_admin_jobs` (`"Admins manage admin jobs"`) already prevents non-admins from SELECTing rows, so `postgres_changes` events were never actually delivered to non-admins. This explicit `realtime.messages` policy satisfies the scanner's defense-in-depth check while preserving UX.

**Verification**: admin Job Progress card still updates live; non-admin authenticated client `supabase.channel('admin-job:<id>').subscribe()` receives no payloads.

**Rollback**: drop the new `realtime.messages` policy.

---

## N.3 — Server-side auth gate on every cost-bearing edge function (Errors #3 + #4)

New shared module `supabase/functions/_shared/auth-gate.ts` (~50 LOC) — codifies the JWT-validation pattern already proven in `backfill-article-pins/index.ts:291`:

```ts
// throws Response(401) on missing/invalid JWT, Response(403) on non-admin
export async function requireUser(req: Request): Promise<{ user, userClient }>
export async function requireAdmin(req: Request): Promise<{ user, userClient }>
```

Internally: builds a per-request `createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization } } })`, calls `auth.getUser()`, and for admin gating calls `userClient.rpc('has_role', { _user_id: user.id, _role: 'admin' })`. Service-role clients (where downstream writes happen) are unchanged.

**Apply `requireUser`** (admin-only TTS is enforced client-side per `mem://features/narration/admin-only-access`; the server must back-stop with at least a valid JWT — admin check would also be valid but `requireUser` is the minimum that closes the cost-abuse hole without over-constraining future read-only callers):
- `tts-stream-openai`
- `tts-stream-elevenlabs`
- `tts-stream-google`

**Apply `requireAdmin`** to every function that writes, generates AI content, or runs paid APIs:
- `tts-save-drive`
- `generate-article-og`
- `generate-article-seo`
- `generate-article-tags`
- `enrich-cultural-term`
- `batch-enrich-terms`
- `analyze-tag-relationships`
- `suggest-tag-categories`
- `extract-purana-references`
- `context-bundle-generator`
- `context-save-drive`
- `context-diff-generator`
- `markdown-to-article-import`
- `batch-import-from-github`
- `scan-github-markdown`
- `detect-duplicate-articles`
- `retire-og-image`
- `backfill-bibliography`
- `backfill-word-counts`
- (`backfill-article-pins` already has the pattern — refactor to use the shared helper for consistency)

**Documented exceptions (intentionally open)**:
- `generate-sitemap` — public SEO infrastructure; no AI cost.
- `gdrive-image-proxy` — read-only CORS proxy for already-public OG images.
- `get-public-config` — by design.
- `imaging-handoff-token` — has its own short-lived token validation.

CORS headers, response shapes, NDJSON streaming, and all business logic stay byte-for-byte identical. Each handler gains 3 lines at the top (`await requireUser(req)` / `requireAdmin(req)` inside the existing try/catch).

**Verification per function**: `curl` without `Authorization` → 401; non-admin token to `requireAdmin` set → 403; admin token → 200. End-to-end smoke: admin Bhṛgu/Aṅgiras play → streams normally; admin OG regeneration succeeds; markdown import succeeds.

**Rollback**: revert one file per function; the shared helper has no side effects.

---

## N.4 — `jspdf` hard upgrade (Error #5)

`^3.0.4` still carries all listed critical + high + medium advisories (Path Traversal, AcroForm injection, BMP DoS, GIF DoS, XMP injection, addJS race, FreeText injection, HTML injection). Bump to `^4.2.1`. Only consumer is `src/lib/pdfGenerator.ts`; calls (`new jsPDF`, `text`, `addImage`, `save`) are stable across the v3→v4 boundary. No `AcroForm`, no `addJS`, no BMP/GIF, no XMP, no `FreeText` in our call path — so even pre-upgrade exploitation requires attacker-controlled PDF content we never accept.

Manual smoke test: Reading Room → "Export to PDF" → file downloads and opens cleanly.

**Rollback**: revert the dep bump.

---

## N.5 — `ProtectedRoute` admin gate (Warn #6)

`src/components/admin/ProtectedRoute.tsx`, ~4 LOC:

```tsx
const { user, isAdmin, isLoading } = useAuth();
// ... loading state unchanged ...
if (!user || !isAdmin) return <Navigate to="/auth" replace />;
```

`isAdmin` is already derived in `AuthContext` via the Phase M `has_role` RPC, so the gate is server-backed. RLS already blocks all destructive writes for non-admins, but this prevents non-admins from even *loading* admin pages (which would otherwise reveal draft titles, dashboard stats, and admin chrome). This complements N.3 (server-side) and N.1 (DB-level).

**Verification**: non-admin signs in → visits `/admin` → instantly redirected to `/auth`. Admin still gets full dashboard.

**Rollback**: revert the file.

---

## N.6 — RLS tightening (Warns #7, #8, #9)

Single migration aligned with `mem://security/rls-write-policy-standardization`:

```sql
-- N.6.a — narration_analytics: close the anon-readable hole
DROP POLICY IF EXISTS "Users can view their own narration analytics" ON public.narration_analytics;
CREATE POLICY "Owners and admins view narration analytics"
  ON public.narration_analytics FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
-- Service-role SELECT policy is preserved as-is.

-- N.6.b — srangam_audio_narrations: writes only admin / service-role
DROP POLICY IF EXISTS "Authenticated users can create audio narrations" ON public.srangam_audio_narrations;
DROP POLICY IF EXISTS "Authenticated users can update audio narrations" ON public.srangam_audio_narrations;
CREATE POLICY "Admins or service role insert narrations"
  ON public.srangam_audio_narrations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.role() = 'service_role');
CREATE POLICY "Admins or service role update narrations"
  ON public.srangam_audio_narrations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR auth.role() = 'service_role')
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.role() = 'service_role');
-- Public SELECT preserved (narrations are intentionally public).

-- N.6.c — Editorial content tables: blanket authenticated → admin-only
-- Tables: srangam_book_chapters, srangam_article_chapters,
--         srangam_bibliography_entries, srangam_article_bibliography,
--         srangam_markdown_sources, srangam_cross_references.
-- For each: DROP "Authenticated manage X"; CREATE "Admin manage X" with
-- USING + WITH CHECK = has_role(auth.uid(),'admin'). Public-read policies preserved.
```

`tts-save-drive`, `markdown-to-article-import`, and other importers continue to write via `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS), so no edge-function changes are needed for N.6.

**Verification**: non-admin authenticated INSERT into any tightened table → 42501; admin INSERT → success; edge-function service-role write → success; public still reads bibliography / chapters.

**Rollback**: re-create the old `auth.role() = 'authenticated'` policies (per-table revert).

---

## N.7 — Lock down `SECURITY DEFINER` EXECUTE grants (Warns #10, #11)

Full inventory of `public` `SECURITY DEFINER` functions (excluding extension-owned `st_estimatedextent`):

| Function | Keep callable by | Action |
|---|---|---|
| `has_role(uuid, app_role)` | `authenticated` | Keep — used by every RLS policy and AuthContext |
| `srangam_search_articles_fulltext(text, int)` | `public, anon, authenticated` | Keep — public site search |
| `srangam_search_articles_semantic(vector, float, int)` | `public, anon, authenticated` | Keep — public semantic search |
| `srangam_increment_term_usage(text)` | service_role only | Revoke from public/anon/authenticated |
| `increment_term_usage_counts(text[])` | service_role only | Revoke from public/anon/authenticated |
| `srangam_increment_bibliography_usage()` | service_role only | Revoke from public/anon/authenticated |
| `update_tag_stats()` | trigger-only | Revoke from public/anon/authenticated |
| `srangam_update_updated_at()` | trigger-only | Revoke from public/anon/authenticated |
| `analyze_tag_cooccurrence()` | admin only | Revoke from public/anon/authenticated; grant to a future admin-runner if needed |
| `get_purana_statistics()` | admin only | Revoke from public/anon/authenticated |

```sql
REVOKE EXECUTE ON FUNCTION public.update_tag_stats()                       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.srangam_update_updated_at()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.srangam_increment_bibliography_usage()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.srangam_increment_term_usage(text)       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_term_usage_counts(text[])      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.analyze_tag_cooccurrence()               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_purana_statistics()                  FROM PUBLIC, anon, authenticated;
-- Trigger functions keep firing because triggers execute under table-owner privileges, not client EXECUTE.
```

If a client code path still calls any of the revoked RPCs (grep before deploy), refactor it through an edge function that uses the service-role key.

**Verification**: anon hits `srangam_search_articles_fulltext` → 200; non-admin hits `analyze_tag_cooccurrence` → 42501; tag-update triggers still fire on INSERT/UPDATE.

**Rollback**: `GRANT EXECUTE ... TO authenticated, anon` to restore previous grants.

---

## N.8 — Storage bucket listing (Warn #12)

Confirmed existing policies on `storage.objects`:
- `"Public read srangam articles"` → SELECT `bucket_id = 'srangam-articles'` to public
- `"Public can view OG images"` → SELECT `bucket_id = 'og-images'` to public

These let unauthenticated clients call `storage.from(...).list()` and enumerate every file path. Public buckets serve files via CDN URLs **without** RLS, so we can safely restrict the SELECT policy to admins while keeping direct-URL fetches working (this is the documented Supabase pattern for `public_bucket_allows_listing`).

```sql
DROP POLICY "Public read srangam articles" ON storage.objects;
DROP POLICY "Public can view OG images"    ON storage.objects;

CREATE POLICY "Admins list srangam articles bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'srangam-articles' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins list og-images bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'og-images' AND public.has_role(auth.uid(), 'admin'));
```

**Verification**: anonymous `<bucket>/<path>` direct GET → 200 (CDN); anonymous `storage.from('og-images').list()` → `[]`; admin `list()` → enumerated.

**Rollback**: re-create the two prior public SELECT policies.

---

## Sequencing — 5 reversible commits

```text
Commit 1  N.0           docs + memory updates           (zero runtime impact)
Commit 2  N.1 + N.2     migration: drafts policy + realtime.messages policy
Commit 3  N.6 + N.7 + N.8  migration: RLS + execute grants + storage policies
Commit 4  N.3           _shared/auth-gate.ts + per-function gates (single batch deploy)
Commit 5  N.4 + N.5     jspdf v4 bump + ProtectedRoute admin gate
```

Each commit is independently revertible. No commit touches article rendering, slug resolution, TTS playback path, narration UI, or the mobile-viewport work.

---

## Diff Estimate

- 3 migrations (~70 SQL LOC total)
- 1 new shared module (`supabase/functions/_shared/auth-gate.ts`, ~50 LOC)
- ~3 LOC added per gated function × ~19 functions ≈ 60 LOC
- ~4 LOC in `ProtectedRoute.tsx`
- 1 dependency bump (`jspdf` → `^4.2.1`)
- 7 docs updated + `mem://index.md` refreshed

Total ≈ 200 source LOC + 3 migrations + 1 dep bump + 8 doc updates.

---

## Verification Checklist (post-deploy, runs end-to-end)

- [ ] Security scan: 0 errors, ≤1 accepted-risk warning (PostGIS `spatial_ref_sys`).
- [ ] Anonymous REST query for any draft slug → `[]`; published slug → 1 row.
- [ ] `useAdminJob` Realtime: admin sees live job progress; non-admin subscribe yields nothing.
- [ ] `curl` to every gated function: no token → 401; non-admin token to `requireAdmin` → 403; admin token → 200.
- [ ] Bhṛgu/Aṅgiras admin play: TTS streams cleanly under new gate; cache hit on replay.
- [ ] Non-admin auth user → `/admin` redirects to `/auth`.
- [ ] Non-admin authenticated INSERT into `srangam_bibliography_entries` → 42501.
- [ ] `storage.from('og-images').list()` as anon → empty; direct OG URL → 200.
- [ ] Reading Room "Export PDF" → file downloads and opens.
- [ ] Admin markdown import end-to-end succeeds.
- [ ] Public site search and semantic search continue to work anonymously.
- [ ] MV-01 responsive Vitest suite green.
- [ ] Cultural-term highlighting, article evidence tables, sidebar (pins/sources) render unchanged.

---

## Out of Scope (preserve Phase A–M invariants)

- No edge-function business-logic changes.
- No schema additions, no new tables, no column changes.
- No new auth providers; HIBP and existing email/Google auth preserved.
- No changes to TTS provider fallback chain, narration UI, article rendering, slug resolver, hero image fallback, or mobile-viewport work.
- No changes to the `has_role` RPC or `user_roles` table.
