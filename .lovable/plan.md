
# Phase O — Residual Security Triage (Post Phase N Re-scan)

Surgical, reversible. One migration + ~6 LOC FE + one dep + doc/triage. Zero impact on TTS, slug resolver, multilingual, article rendering, or any Phase A–N invariant.

## Ground-Truth (verified this loop via `pg_policies`, `pg_proc`, source grep)

```text
srangam_articles            ✅ Drafts already admin-only (Phase N.1). STALE finding.
srangam_book_chapters       ❌ Public SELECT USING ((status='published') OR true).      REAL.
srangam_audio_narrations    ❌ Public SELECT USING true exposes cost_usd / metadata.    REAL.
srangam_markdown_sources    ✅ Admin-only ALL, no public SELECT. INFO only.
srangam_article_versions    ✅ Admin-only ALL. INFO only.
storage srangam-articles    ❌ INSERT/UPDATE/DELETE to authenticated, no admin gate.    REAL.
storage og-images           ✅ Writes service-role; admin list-only SELECT.
SECURITY DEFINER (public)   ❌ analyze_tag_cooccurrence, get_purana_statistics grant EXECUTE to authenticated. REAL (low).
                            ✅ has_role + search RPCs require anon EXECUTE — keep.
                            ⚠️ PostGIS st_estimatedextent — accepted risk.
Edge functions              ✅ requireAdmin/requireUser injected Phase N.3. STALE.
ProtectedRoute              ✅ isAdmin gate present. STALE.
ProfessionalTextFormatter   ❌ rehypeRaw with no sanitizer. REAL (stored-XSS surface, admin-author trust).
```

Narration call sites confirmed: `NarrationService.ts:337` (public cache lookup → must move to view) and `useAdminDashboardStats.ts:41` (admin-only cost aggregation → keeps base table).

## Stale Findings — Triage Only (no code change)

Apply with `security--manage_security_finding`:

| Finding | Action | Rationale |
|---|---|---|
| `unauth_cost_functions` | mark_as_fixed | `requireAdmin`/`requireUser` injected to all listed cost edge fns in Phase N.3. |
| `unauth_write_functions` | mark_as_fixed | `requireAdmin` injected to markdown-import, batch-import, extract-purana, tts-save-drive, batch-enrich, scan-github. |
| `draft_articles_exposed` | mark_as_fixed | "Anyone can view articles" dropped; SELECT is published-only + admin. |
| `admin_route_any_user` | mark_as_fixed | `ProtectedRoute` enforces `!user \|\| !isAdmin`. |
| `srangam_article_versions_no_public_read` | ignore | Scanner itself flags "correctly secured". |
| `srangam_markdown_sources_no_public_read` | ignore | Admin-only ALL locks reads. |
| `SUPA_*_security_definer_function_executable` (PostGIS residual) | ignore | After O.4 only PostGIS `st_estimatedextent` remains; accepted risk. |

## Real Fixes — One Migration + Tiny FE Change

### O.1 — Book chapters `OR true` RLS bug

```sql
DROP POLICY "Public read published book chapters" ON public.srangam_book_chapters;
CREATE POLICY "Public read published book chapters"
  ON public.srangam_book_chapters FOR SELECT TO public
  USING (status = 'published');
CREATE POLICY "Admins read all book chapters"
  ON public.srangam_book_chapters FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));
```

Public bookshelf already filters `status='published'` client-side; admin Book Compilation reads via admin role. No visible regression.

### O.2 — Audio narrations cost/metadata leak (view + restrict base)

```sql
CREATE OR REPLACE VIEW public.srangam_audio_narrations_public
WITH (security_invoker = on) AS
SELECT id, article_slug, language_code, voice_id, provider,
       google_drive_share_url, file_size_bytes, duration_seconds,
       audio_format, sample_rate, created_at, updated_at
FROM public.srangam_audio_narrations;

GRANT SELECT ON public.srangam_audio_narrations_public TO anon, authenticated;

DROP POLICY "Audio narrations are viewable by everyone" ON public.srangam_audio_narrations;
CREATE POLICY "Admins and service role read narrations"
  ON public.srangam_audio_narrations FOR SELECT TO public
  USING (has_role(auth.uid(), 'admin') OR auth.role() = 'service_role');
```

FE swap (3 LOC, single call site): `src/services/narration/NarrationService.ts:337` → `.from('srangam_audio_narrations_public')`. `useAdminDashboardStats.ts:41` keeps base table (admin can read it; needs `cost_usd`). Writes continue via service-role edge functions and are unaffected.

### O.3 — Storage bucket `srangam-articles` write hardening

```sql
DROP POLICY "Authenticated upload srangam articles" ON storage.objects;
DROP POLICY "Authenticated update srangam articles" ON storage.objects;
DROP POLICY "Authenticated delete srangam articles" ON storage.objects;

CREATE POLICY "Admin upload srangam articles" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'srangam-articles' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update srangam articles" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'srangam-articles' AND has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'srangam-articles' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete srangam articles" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'srangam-articles' AND has_role(auth.uid(), 'admin'));
```

Public CDN reads + existing admin list-only SELECT untouched.

### O.4 — SECURITY DEFINER EXECUTE lockdown (public-schema residual)

```sql
REVOKE EXECUTE ON FUNCTION public.analyze_tag_cooccurrence FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_purana_statistics    FROM PUBLIC, anon, authenticated;
-- Keep: has_role, srangam_search_articles_fulltext, srangam_search_articles_semantic (anon-required).
-- PostGIS st_estimatedextent left as accepted risk.
```

Both functions called only from admin tooling / service-role edge fns; unaffected.

### O.5 — Markdown XSS hardening (FE, ~5 LOC + 1 dep)

`src/components/articles/enhanced/ProfessionalTextFormatter.tsx`: add `rehype-sanitize` with extended `defaultSchema` (permit footnote `id`/`href`, `data-cultural-term`, `colSpan/rowSpan`, `dir`, `lang`, `className`). Plugins become `[rehypeRaw, [rehypeSanitize, schema]]`. No typography or layout change.

```bash
bun add rehype-sanitize
```

## Single Migration File

All four DB items ship as `supabase/migrations/<ts>_phase_o_residual_security.sql`.

## Documentation Updates

- `.lovable/plan.md` — append Phase O with SQL, FE patches, and stale-finding triage table.
- `docs/RELIABILITY_AUDIT.md` — bump baseline note to "Phase O (2026-05)": book-chapter RLS corrected, narration cost columns moved behind `srangam_audio_narrations_public`, `srangam-articles` bucket writes admin-only, two SECURITY DEFINER helpers revoked, `rehype-sanitize` enforced on article rendering.
- `mem://index.md` — update Security Baseline Core entry to reference Phase O and the public-view pattern.

## Sequencing (3 reversible commits)

1. **Docs first** — `.lovable/plan.md`, `RELIABILITY_AUDIT.md`, `mem://index.md`. Runtime risk: 0.
2. **Migration + FE swap + sanitizer + dep** — Phase O migration (O.1–O.4) + `NarrationService.ts` view swap + `ProfessionalTextFormatter` rehype-sanitize + `bun add rehype-sanitize`. Shipped together so the view exists before the FE switch.
3. **Triage** — `manage_security_finding` (mark_as_fixed × 4, ignore × 3) + `security--update_memory` documenting accepted PostGIS risk and the public-view pattern for narrations.

## Verification

- `pg_policies`: book_chapters public SELECT = `status='published'`; admin SELECT exists.
- Anon SELECT on `srangam_audio_narrations` → 0 rows; `srangam_audio_narrations_public` returns playback metadata without `cost_usd`.
- Anon and non-admin authenticated INSERT/UPDATE/DELETE on `storage.objects` bucket `srangam-articles` → 403; public CDN GET still 200.
- `pg_proc` ACL: `analyze_tag_cooccurrence` / `get_purana_statistics` no longer show `authenticated=X`.
- Article render: `<script>`/`onerror` payloads stripped; cultural-term spans, footnote anchors, evidence tables render unchanged.
- MV-01 Vitest suite green; admin TTS playback + GDrive caching still works; PDF export still works; admin Reading Room shows in-progress chapters; anon Reading Room does not.

## Out of Scope

No new edge functions, no new auth providers, no schema additions, no changes to TTS provider fallback, slug resolver, multilingual merging, OG generation, or article rendering pipeline beyond the rehype-sanitize plugin.
