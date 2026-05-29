-- Phase CX.3: identity-set diffing.
-- Additive, nullable column + GIN index. Never UPDATE existing rows
-- (frozen baseline policy). Old snapshots without identity_sets fall back
-- to mode:'count_only' in context-diff-generator.
ALTER TABLE public.srangam_context_snapshots
  ADD COLUMN IF NOT EXISTS identity_sets jsonb;

CREATE INDEX IF NOT EXISTS srangam_context_snapshots_identity_sets_gin
  ON public.srangam_context_snapshots
  USING GIN (identity_sets);

COMMENT ON COLUMN public.srangam_context_snapshots.identity_sets IS
  'CX.3 identity sets used for diffing: { article_slugs:[], term_keys:[], tag_names:[], theme_names:[], module_names:[] }. NULL for pre-CX.3 snapshots.';