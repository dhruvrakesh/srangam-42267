# Phase M — Security Findings Remediation (Enterprise, Documentation-First)

Surgical resolution of all six Security panel findings. Aligns with existing memory entries:
- `mem://security/rls-write-policy-standardization` (admin-write standard)
- `mem://security/database-function-hardening` (`SET search_path = public` on SECURITY DEFINER)
- `mem://development/documentation-first-planning` (docs before logic)

Per the Surgical Healing principle, nothing in this phase touches TTS, article rendering, slug resolution, mobile viewport work, or any Phase A–L invariant.

---

## Inventory & Mapping

| # | Severity | Finding | Phase | Surface Touched |
|---|----------|---------|-------|-----------------|
| 1 | Error | `jspdf ^3.0.2` — 9 advisories (critical/high/medium) | M.1 | `package.json`, `bun.lock` |
| 2 | Warn  | `user_roles` SELECT policy enables role enumeration | M.2 | 1 migration + `AuthContext.tsx` |
| 3 | Warn  | Leaked Password Protection (HIBP) disabled | M.3 | Auth config (no code) |
| 4 | Info  | `spatial_ref_sys` (PostGIS) has no RLS | M.4 | Ignore + memory + docs |
| 5 | Info  | `jspdf` medium advisories | folds into M.1 | — |

---

## M.0 — Documentation First (no code)

Before any code/migration, update tracking docs so the baseline is recorded:
- `.lovable/plan.md` — append Phase M with the four sub-phases and verification matrix.
- `docs/RELIABILITY_AUDIT.md` — new **§ Phase M — Security Hardening** block + **§ Accepted Risks** for PostGIS.
- `docs/SOFT_LAUNCH_CHECKLIST.md` — tick "HIBP enabled" once M.3 lands; add "jspdf clean" line.
- `mem://index.md` — Core: add one-liner "Phase M baseline: jspdf ≥3.0.4, user_roles via has_role RPC, HIBP on, PostGIS accepted."

Per project convention, docs are committed in this commit before any executable change.

---

## M.1 — Upgrade `jspdf` (resolves findings 1 & 5)

**Surface**: `src/lib/pdfGenerator.ts` is the **only** consumer. Three call sites, all on the stable surface: `new jsPDF('p','mm','a4')`, `pdf.text(...)`, `pdf.addImage(...)`, `pdf.save(...)`. None of the vulnerable APIs (`AcroForm`, `addJS`, `FreeText`, BMP/GIF decoder, XMP) are used. So the advisories are not exploitable in our call path — but the scanner flags by version string, and we want a clean scan.

**Action (two-step, conservative)**:
1. Bump `jspdf` to `^3.0.4` (patch line, same v3 API — zero source diff). Re-scan.
2. **If** any advisory still flags, bump to `^4.2.1`. The four APIs we use are unchanged across the v3→v4 boundary; `pdfGenerator.ts` requires no edits. Re-scan.

**Verification**:
- `bun run build` clean.
- Manual PDF export from Reading Room → file opens, text + image render correctly.
- Security scan → jspdf rows disappear.

**Rollback**: revert `package.json` + `bun.lock` in one commit.

---

## M.2 — Harden `user_roles` RLS (resolves finding 2)

**Root cause**: the `"Users can view their own roles"` policy (migration `20251110042316`) lets any authenticated user `SELECT` their own row. Combined with Supabase's user-id UUIDs (which leak through any join surface), it allows a logged-in attacker who has obtained another user_id to probe role status. The enterprise fix is to route **all** client role checks through the existing `public.has_role(_user_id uuid, _role app_role)` SECURITY DEFINER function (verified hardened with `SET search_path = public` per `mem://security/database-function-hardening`) and remove the direct-select policy.

**Migration** (single, narrow):
```sql
-- Phase M.2: remove direct self-select; force all reads through has_role() RPC.
-- Admin policy "Admins can view all roles" is preserved for Admin Dashboard UX.
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
```

**Client change** (`src/contexts/AuthContext.tsx`, ~6 LOC inside `checkAdminRole`):
```ts
const { data, error } = await supabase.rpc('has_role', {
  _user_id: userId,
  _role: 'admin',
});
if (error) console.warn('has_role RPC failed', error);
setIsAdmin(data === true);
```
Returns only a boolean. No row leak, no enumeration surface, no recursion (SECURITY DEFINER).

**Pre-flight check (must hold before merging)**:
- `rg "from\\(['\"]user_roles" src/` returns **only** `AuthContext.tsx`. Confirmed during exploration.
- Admin Dashboard reads come from the preserved `"Admins can view all roles"` policy (unchanged).

**Verification matrix**:
| Persona | Expected |
|---------|----------|
| Anonymous | Unchanged (no access — already true) |
| Authenticated non-admin | `has_role` → `false`; no admin nav; no console error |
| Authenticated admin | `has_role` → `true`; full admin sidebar; Admin Dashboard lists all roles |

**Rollback**: re-add the dropped policy via reverse migration; revert AuthContext.

---

## M.3 — Enable Leaked Password Protection (resolves finding 3)

One call to `supabase--configure_auth` with `password_hibp_enabled: true`. Preserve the established posture (per project convention):
- `disable_signup: false`
- `external_anonymous_users_enabled: false`
- `auto_confirm_email: false` (users still verify email before sign-in)

No source code change. The signup form surfaces the new HIBP rejection error from the API automatically.

**Verification**: attempt signup with `password123` → API rejects with weak/leaked-password message.

**Rollback**: re-run `configure_auth` with `password_hibp_enabled: false`.

---

## M.4 — Acknowledge `spatial_ref_sys` (resolves finding 4)

`spatial_ref_sys` is the **PostGIS extension-owned reference table** containing only standard EPSG entries. We never write to it. Enabling RLS on extension tables is fragile, blocks the extension's own internal use, and is contraindicated by Supabase's own guidance.

**Action** (no migration):
1. `security--manage_security_finding` → `ignore` with reason: *"PostGIS extension-owned reference table containing only standard EPSG rows; application never writes to it; enabling RLS on extension tables is contraindicated."*
2. `security--update_memory` → record this as an accepted risk so future scans do not re-flag.
3. Add to `docs/RELIABILITY_AUDIT.md` § Accepted Risks.

---

## Sequencing (3 reversible commits)

```text
Commit 1 (M.0 + M.4 docs)  →  docs only, zero runtime impact
Commit 2 (M.1)             →  jspdf bump
Commit 3 (M.2)             →  migration + AuthContext RPC switch
Commit 4 (M.3)             →  configure_auth + ignore PostGIS finding + memory
```

## Diff Estimate

- ~10 source LOC (`AuthContext.tsx`)
- 1 migration file (one `DROP POLICY`)
- 1 dependency bump (`jspdf`)
- 1 auth-config call (HIBP)
- 1 ignored finding + 1 memory update
- 3 doc files updated

## Verification Checklist (run after Commit 4)

- [ ] Security panel: 0 errors, 0 warnings; PostGIS shown as ignored with reason.
- [ ] `supabase--linter` clean for the touched objects.
- [ ] Admin sign-in → admin nav visible; admin dashboard lists roles.
- [ ] Non-admin sign-in → no admin nav, no console errors.
- [ ] Signup with weak password → rejected by HIBP.
- [ ] PDF export from Reading Room → renders correctly.
- [ ] `bun run build` clean; existing Vitest MV-01 suite still green.

## Out of Scope

No edge-function changes, no schema additions, no new tables, no new auth providers, no package additions beyond the jspdf bump, no UI redesign, no changes to TTS, narration, slug resolver, article rendering, or mobile overflow work (Phases A–L preserved).
