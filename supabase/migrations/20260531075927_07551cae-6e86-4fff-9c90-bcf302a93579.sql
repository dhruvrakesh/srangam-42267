
-- Phase 7 — Gazetteer candidate funnel
-- Captures AI-extracted place names that did NOT resolve to any existing
-- srangam_gazetteer row, so admins can review and promote them.

CREATE TABLE IF NOT EXISTS public.srangam_gazetteer_candidates (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_name     text NOT NULL UNIQUE,           -- lowercased / trimmed key
  raw_name            text NOT NULL,                  -- first-seen original casing
  first_seen_article_id uuid,
  first_seen_at       timestamptz NOT NULL DEFAULT now(),
  last_seen_at        timestamptz NOT NULL DEFAULT now(),
  occurrences         integer NOT NULL DEFAULT 1,
  source_articles     uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  ai_provider         text,
  ai_model            text,
  status              text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','merged')),
  promoted_gazetteer_id uuid,
  reviewed_by         uuid,
  reviewed_at         timestamptz,
  review_notes        text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS srangam_gazetteer_candidates_status_occurrences_idx
  ON public.srangam_gazetteer_candidates (status, occurrences DESC);

CREATE INDEX IF NOT EXISTS srangam_gazetteer_candidates_source_articles_gin
  ON public.srangam_gazetteer_candidates USING gin (source_articles);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.srangam_gazetteer_candidates TO authenticated;
GRANT ALL ON public.srangam_gazetteer_candidates TO service_role;

ALTER TABLE public.srangam_gazetteer_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage gazetteer candidates"
  ON public.srangam_gazetteer_candidates
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public._touch_gazetteer_candidate_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gazetteer_candidates_touch_updated
  BEFORE UPDATE ON public.srangam_gazetteer_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public._touch_gazetteer_candidate_updated_at();
