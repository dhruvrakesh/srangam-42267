

# Phase B: Security Hardening -- Precise Migration Plan

## Verified Findings from Live Linter (February 15, 2026)

### ERROR: RLS Disabled in Public
- **Table**: `spatial_ref_sys` (PostGIS system table)
- **Verdict**: False positive. This is a PostGIS internal catalog table, not user data. No action needed; will be documented as acknowledged.

### WARN: Function Search Path Mutable (3 instances)
- **Functions**: All three are `st_estimatedextent` -- PostGIS C-language system functions
- **Verdict**: False positive. These are compiled library functions shipped with PostGIS; we cannot and should not alter them. Will be documented as acknowledged.

### WARN: Leaked Password Protection Disabled
- **Verdict**: Platform-level setting. Cannot be changed via migration. Noted for documentation.

### WARN: RLS Policy Always True (11 overly permissive write policies)

These are the actionable findings. Each policy grants write access with `USING (true)` and/or `WITH CHECK (true)`, meaning any authenticated user (or in some cases, any request at all) can write to these tables. Since all legitimate writes go through edge functions using the service role key (which bypasses RLS entirely), tightening these to admin-only is safe and purely defensive.

---

## Tables Requiring Policy Changes (11 policies across 10 tables)

| # | Table | Current Policy Name | Current Rule | New Rule |
|---|-------|-------------------|--------------|----------|
| 1 | `srangam_articles` | "Authenticated manage articles" (ALL) | `true` / `true` | DROP (redundant -- admin-only INSERT/UPDATE/DELETE policies already exist) |
| 2 | `srangam_article_analytics` | "Authenticated manage analytics" (ALL) | `true` / `true` | Replace with admin-only |
| 3 | `srangam_article_evidence` | "Service role can manage evidence" (ALL) | `true` / `true` | Replace with admin-only |
| 4 | `srangam_article_metadata` | "Authenticated manage metadata" (ALL) | `true` / `true` | Replace with admin-only |
| 5 | `srangam_article_versions` | "Authenticated manage versions" (ALL) | `true` / `true` | Replace with admin-only |
| 6 | `srangam_correlation_matrix` | "Authenticated manage correlations" (ALL) | `true` / `true` | Replace with admin-only |
| 7 | `srangam_cultural_terms` | "Authenticated manage cultural terms" (ALL) | `true` / `true` | Replace with admin-only |
| 8 | `srangam_inscriptions` | "Authenticated manage inscriptions" (ALL) | `true` / `true` | Replace with admin-only |
| 9 | `srangam_purana_references` | "Authenticated insert purana references" (INSERT) | `WITH CHECK (true)` | Replace with admin-only |
| 10 | `srangam_purana_references` | "Authenticated update purana references" (UPDATE) | `true` / `true` | Replace with admin-only |
| 11 | `srangam_translation_queue` | "Authenticated manage translation queue" (ALL) | `true` / `true` | Replace with admin-only |

### Tables NOT changed (already correct)
- `srangam_tags` -- already uses `has_role(auth.uid(), 'admin')` for all write ops
- `srangam_context_snapshots` -- already admin-only INSERT, no UPDATE/DELETE
- `user_roles` -- already admin-only
- `srangam_audio_narrations` -- uses `auth.role() = 'authenticated'` for INSERT/UPDATE (acceptable: narration creation is a user-facing feature)
- `narration_analytics` -- INSERT scoped to own `user_id` (correct for analytics)

### Tables with `auth.role() = 'authenticated'` (not `true`, but still overly broad)
These were not flagged by the linter (they check for role, not just `true`), but are noted for future tightening if needed:
- `srangam_cross_references`, `srangam_markdown_sources`, `srangam_article_chapters`, `srangam_book_chapters`, `srangam_article_bibliography`, `srangam_bibliography_entries`

These use `auth.role() = 'authenticated'` which is stricter than `true` but still allows any logged-in user to write. Since writes go through service-role edge functions, these could also be tightened to admin-only in a follow-up. However, to keep this migration minimal and focused on the linter ERRORs and WARNs, they are deferred.

---

## Migration SQL

A single migration that:
1. Drops each overly permissive policy
2. Creates a replacement admin-only policy using `has_role(auth.uid(), 'admin')`

All existing SELECT (public read) policies remain untouched. Edge functions using service role key bypass RLS entirely, so no backend functionality is affected.

---

## Risk Assessment

- **Risk**: Low. All legitimate writes already go through edge functions with service role key, which bypasses RLS. These policy changes only affect direct client-side writes (which should not be happening for these internal tables).
- **Rollback**: Re-create the dropped policies with `USING (true)` / `WITH CHECK (true)`.
- **Testing**: After migration, verify that the admin dashboard still functions (it uses service role via edge functions, so unaffected). The public portal is read-only and completely unaffected.

## Documentation Updates

After the migration:
- Update `docs/RELIABILITY_AUDIT.md` Phase B section to mark security hardening as complete
- Note the PostGIS false positives (`spatial_ref_sys` RLS, `st_estimatedextent` search paths) as permanently acknowledged
- Update `.lovable/plan.md` to mark Phase B complete

