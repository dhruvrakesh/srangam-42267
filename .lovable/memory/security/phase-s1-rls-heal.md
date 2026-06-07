---
name: Phase S.1 + S.2 RLS Heal
description: Surgical RLS tightening 2026-06-07; admin-only media assets, strict narration_analytics INSERT with NULL guard, published-only gates on all per-article child tables (chapters, bibliography, evidence, cross_references, purana_references)
type: constraint
---

# Phase S.1 + S.2 RLS Heal (2026-06-07)

Two surgical migrations applied 2026-06-07. Zero FE / edge wiring change. All scanner findings cleared.

## Locked invariants (DO NOT REVERT)

1. **`srangam_media_assets` is admin-only SELECT.** Public OG image rendering MUST go through `srangam_articles.og_image_url` → `gdrive-image-proxy`. Never re-add a public SELECT — leaks `cost_usd`, `gdrive_file_id`, `gdrive_share_url`, `prompt_hash`.
2. **`narration_analytics` INSERT requires `user_id IS NOT NULL AND auth.uid() = user_id`** (TO authenticated). Never widen back to `auth.uid() = user_id` alone — NULL=NULL satisfies it.
3. **Per-article child tables — public SELECT MUST gate on parent `srangam_articles.status='published'`:**
   - `srangam_article_chapters` (S.1.3)
   - `srangam_article_bibliography` (S.2.1)
   - `srangam_article_evidence` (S.2.2)
   - `srangam_purana_references` (S.2.4 — also has explicit `Admin read purana references` SELECT policy; do not drop)
4. **`srangam_cross_references` public SELECT MUST gate on BOTH `source_article_id` AND `target_article_id` being published** (S.2.3). NULL endpoints are hidden from public by design.
5. **`srangam_markdown_sources`** has `COMMENT ON TABLE` locking admin-only intent — informational guard; do not add a public SELECT.

## Verification (2026-06-07)

Service-role parity at deploy time — every row already qualifies under the new gate:

| Table | Total | Public-visible after gate |
|---|---:|---:|
| bibliography | 69 | 69 |
| evidence | 117 | 117 |
| cross_references | 1429 | 1429 |
| purana_references | 47 | 47 |

Gate is forward-protective: future child rows attached to draft articles are hidden until the parent publishes.

## Rollback

Each policy is one inverse `CREATE POLICY ... USING (true)` away. Migrations: `20260607042423_*.sql` (S.1), `20260607_narration_analytics_*` (S.1.2 tightening), and the 2026-06-07 Phase S.2 migration. Do not roll back without re-opening the corresponding scanner findings.
