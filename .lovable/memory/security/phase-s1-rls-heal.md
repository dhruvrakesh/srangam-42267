---
name: Phase S.1 RLS Heal
description: Surgical RLS tightening 2026-06-07; admin-only media assets, strict narration_analytics INSERT with NULL guard, published-only article_chapters
type: constraint
---

# Phase S.1 RLS Heal (2026-06-07)

Four surgical RLS edits applied in one migration after Phase T.1 scanner re-run. Zero FE/edge wiring change.

## Locked invariants (DO NOT REVERT)

1. **`srangam_media_assets` is admin-only SELECT.** Public OG image rendering MUST go through `srangam_articles.og_image_url` → `gdrive-image-proxy`. Never re-add a public SELECT on this table — leaks `cost_usd`, `gdrive_file_id`, `gdrive_share_url`, `prompt_hash`.
2. **`narration_analytics` INSERT requires `user_id IS NOT NULL AND auth.uid() = user_id`** (TO authenticated). Never widen back to `auth.uid() = user_id` alone — NULL=NULL satisfies it and lets authenticated users pollute analytics with orphan rows.
3. **`srangam_article_chapters` public SELECT** is gated to `EXISTS (SELECT 1 FROM srangam_articles WHERE id = article_id AND status='published')`. Mirrors `srangam_article_metadata`. Never relax to `true`.
4. **`srangam_markdown_sources`** has `COMMENT ON TABLE` locking admin-only intent — informational guard; do not add a public SELECT.

## Phase S.2 — proposed, NOT deployed

Same published-status gate pattern needs to be applied to: `srangam_article_bibliography`, `srangam_article_evidence`, `srangam_cross_references` (both source AND target), `srangam_purana_references`. Pre-flight: grep FE for `.from('srangam_article_bibliography')` etc. and confirm no admin/draft path reads via the public role.

## Rollback

Each policy is one inverse `CREATE POLICY` away. Migrations: `20260607042423_*.sql` (S.1.1, S.1.3, S.1.4) and the 2026-06-07 narration_analytics NULL-guard tightening (S.1.2).
