-- =====================================================================
-- Phase X.7.2 — Expand correlation axes (cultural terms + tags + bibliography)
-- =====================================================================

-- View 1: shared cultural terms via {{cultural:term}} markers in content.
-- Uses regexp_matches on the content JSONB cast to text so it covers
-- multilingual storage (en/hi/etc all live under content.*). LATERAL+DISTINCT
-- guarantees one row per (article, term) pair before the self-join, keeping
-- the count semantics consistent with the other axes.
CREATE OR REPLACE VIEW public.srangam_corpus_article_term_pairs AS
WITH article_terms AS (
  SELECT DISTINCT
    a.id AS article_id,
    lower(m[1]) AS term
  FROM public.srangam_articles a
  CROSS JOIN LATERAL regexp_matches(
    a.content::text,
    '\{\{cultural:([^}|]+)',
    'g'
  ) AS m
  WHERE a.status = 'published'
)
SELECT
  LEAST(t1.article_id, t2.article_id)    AS article_a,
  GREATEST(t1.article_id, t2.article_id) AS article_b,
  COUNT(DISTINCT t1.term)::int           AS shared_terms
FROM article_terms t1
JOIN article_terms t2
  ON t1.term = t2.term
 AND t1.article_id <> t2.article_id
GROUP BY 1, 2;

-- View 2: shared tags via the text[] tags column.
CREATE OR REPLACE VIEW public.srangam_corpus_article_tag_pairs AS
WITH article_tags AS (
  SELECT a.id AS article_id, lower(t) AS tag
  FROM public.srangam_articles a, unnest(a.tags) AS t
  WHERE a.status = 'published' AND a.tags IS NOT NULL
)
SELECT
  LEAST(t1.article_id, t2.article_id)    AS article_a,
  GREATEST(t1.article_id, t2.article_id) AS article_b,
  COUNT(DISTINCT t1.tag)::int            AS shared_tags
FROM article_tags t1
JOIN article_tags t2
  ON t1.tag = t2.tag
 AND t1.article_id <> t2.article_id
GROUP BY 1, 2;

-- View 3: shared bibliography entries via srangam_article_bibliography.
CREATE OR REPLACE VIEW public.srangam_corpus_article_biblio_pairs AS
SELECT
  LEAST(b1.article_id, b2.article_id)    AS article_a,
  GREATEST(b1.article_id, b2.article_id) AS article_b,
  COUNT(DISTINCT b1.bibliography_id)::int AS shared_biblio
FROM public.srangam_article_bibliography b1
JOIN public.srangam_article_bibliography b2
  ON b1.bibliography_id = b2.bibliography_id
 AND b1.article_id <> b2.article_id
WHERE b1.article_id IS NOT NULL
  AND b2.article_id IS NOT NULL
  AND b1.bibliography_id IS NOT NULL
GROUP BY 1, 2;

-- security_invoker on all three so they honour the caller's RLS (we still
-- gate exposure with the GRANTs below).
ALTER VIEW public.srangam_corpus_article_term_pairs   SET (security_invoker = true);
ALTER VIEW public.srangam_corpus_article_tag_pairs    SET (security_invoker = true);
ALTER VIEW public.srangam_corpus_article_biblio_pairs SET (security_invoker = true);

REVOKE ALL  ON public.srangam_corpus_article_term_pairs    FROM anon;
REVOKE ALL  ON public.srangam_corpus_article_tag_pairs     FROM anon;
REVOKE ALL  ON public.srangam_corpus_article_biblio_pairs  FROM anon;
GRANT SELECT ON public.srangam_corpus_article_term_pairs   TO authenticated;
GRANT SELECT ON public.srangam_corpus_article_tag_pairs    TO authenticated;
GRANT SELECT ON public.srangam_corpus_article_biblio_pairs TO authenticated;
GRANT ALL    ON public.srangam_corpus_article_term_pairs   TO service_role;
GRANT ALL    ON public.srangam_corpus_article_tag_pairs    TO service_role;
GRANT ALL    ON public.srangam_corpus_article_biblio_pairs TO service_role;

-- ---------------------------------------------------------------------
-- Extended RPC: weighted Jaccard across all five axes. Old 2-arg
-- signature retained as a wrapper for back-compat with X.6 callers.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_corpus_correlations_v2(
  min_shared int     DEFAULT 1,
  limit_rows int     DEFAULT 200,
  w_place    numeric DEFAULT 0.25,
  w_purana   numeric DEFAULT 0.30,
  w_term     numeric DEFAULT 0.20,
  w_tag      numeric DEFAULT 0.10,
  w_biblio   numeric DEFAULT 0.15
)
RETURNS TABLE (
  article_a       uuid,
  article_b       uuid,
  shared_places   int,
  shared_puranas  int,
  shared_terms    int,
  shared_tags     int,
  shared_biblio   int,
  shared_total    int,
  jaccard         numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH pp AS (
    SELECT article_a, article_b,
           shared_places, 0 AS shared_puranas, 0 AS shared_terms,
           0 AS shared_tags, 0 AS shared_biblio
      FROM public.srangam_corpus_article_place_pairs
    UNION ALL
    SELECT article_a, article_b,
           0, shared_puranas, 0, 0, 0
      FROM public.srangam_corpus_article_purana_pairs
    UNION ALL
    SELECT article_a, article_b,
           0, 0, shared_terms, 0, 0
      FROM public.srangam_corpus_article_term_pairs
    UNION ALL
    SELECT article_a, article_b,
           0, 0, 0, shared_tags, 0
      FROM public.srangam_corpus_article_tag_pairs
    UNION ALL
    SELECT article_a, article_b,
           0, 0, 0, 0, shared_biblio
      FROM public.srangam_corpus_article_biblio_pairs
  ),
  agg AS (
    SELECT article_a, article_b,
           SUM(shared_places)::int  AS shared_places,
           SUM(shared_puranas)::int AS shared_puranas,
           SUM(shared_terms)::int   AS shared_terms,
           SUM(shared_tags)::int    AS shared_tags,
           SUM(shared_biblio)::int  AS shared_biblio
      FROM pp
     GROUP BY article_a, article_b
  ),
  weighted AS (
    SELECT a.*,
           (a.shared_places  * w_place
          + a.shared_puranas * w_purana
          + a.shared_terms   * w_term
          + a.shared_tags    * w_tag
          + a.shared_biblio  * w_biblio)::numeric AS weighted_overlap,
           (a.shared_places + a.shared_puranas + a.shared_terms
          + a.shared_tags  + a.shared_biblio)     AS unweighted_total
      FROM agg a
  ),
  sizes AS (
    SELECT w.*,
           -- proxy "size" = total signals an article carries across all axes
           (SELECT COUNT(*) FROM public.srangam_article_pins         WHERE article_id = w.article_a)
         + (SELECT COUNT(*) FROM public.srangam_purana_references    WHERE article_id = w.article_a)
         + (SELECT coalesce(array_length(tags,1),0)
              FROM public.srangam_articles WHERE id = w.article_a)
         + (SELECT COUNT(*) FROM public.srangam_article_bibliography WHERE article_id = w.article_a)
           AS size_a,
           (SELECT COUNT(*) FROM public.srangam_article_pins         WHERE article_id = w.article_b)
         + (SELECT COUNT(*) FROM public.srangam_purana_references    WHERE article_id = w.article_b)
         + (SELECT coalesce(array_length(tags,1),0)
              FROM public.srangam_articles WHERE id = w.article_b)
         + (SELECT COUNT(*) FROM public.srangam_article_bibliography WHERE article_id = w.article_b)
           AS size_b
      FROM weighted w
  )
  SELECT s.article_a, s.article_b,
         s.shared_places, s.shared_puranas, s.shared_terms,
         s.shared_tags, s.shared_biblio,
         s.unweighted_total::int AS shared_total,
         CASE
           WHEN (size_a + size_b - s.unweighted_total) <= 0 THEN 0
           ELSE ROUND(
             s.weighted_overlap
             / GREATEST((size_a + size_b - s.unweighted_total)::numeric, 1),
             4
           )
         END AS jaccard
    FROM sizes s
   WHERE s.unweighted_total >= GREATEST(min_shared, 1)
   ORDER BY jaccard DESC, shared_total DESC
   LIMIT GREATEST(LEAST(limit_rows, 1000), 1);
$$;

REVOKE ALL    ON FUNCTION public.get_corpus_correlations_v2(int,int,numeric,numeric,numeric,numeric,numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_corpus_correlations_v2(int,int,numeric,numeric,numeric,numeric,numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_corpus_correlations_v2(int,int,numeric,numeric,numeric,numeric,numeric) TO service_role;

COMMENT ON FUNCTION public.get_corpus_correlations_v2(int,int,numeric,numeric,numeric,numeric,numeric) IS
  'Phase X.7.2 — weighted-Jaccard correlation across 5 axes: places, puranas, '
  'cultural terms, tags, bibliography. Defaults: 0.25/0.30/0.20/0.10/0.15. '
  'SECURITY DEFINER; EXECUTE restricted to authenticated; admin-only at UI layer.';

-- =====================================================================
-- Phase X.7.4 — Snapshot table + corpus_correlate job kind
-- =====================================================================

-- Allow new job kind.
ALTER TABLE public.srangam_admin_jobs
  DROP CONSTRAINT IF EXISTS srangam_admin_jobs_kind_check;
ALTER TABLE public.srangam_admin_jobs
  ADD CONSTRAINT srangam_admin_jobs_kind_check
  CHECK (kind IN ('pin_backfill','og_generate','og_force','purana_extract','corpus_correlate'));

-- Snapshot table: one row per (job, article-pair). PK guards reruns of the
-- same job from duplicating; one job = one snapshot. Query the latest snapshot
-- by sorting on computed_at DESC.
CREATE TABLE IF NOT EXISTS public.srangam_corpus_correlations_snapshot (
  job_id          uuid        NOT NULL,
  computed_at     timestamptz NOT NULL DEFAULT now(),
  article_a       uuid        NOT NULL,
  article_b       uuid        NOT NULL,
  shared_places   int         NOT NULL DEFAULT 0,
  shared_puranas  int         NOT NULL DEFAULT 0,
  shared_terms    int         NOT NULL DEFAULT 0,
  shared_tags     int         NOT NULL DEFAULT 0,
  shared_biblio   int         NOT NULL DEFAULT 0,
  shared_total    int         NOT NULL DEFAULT 0,
  jaccard         numeric     NOT NULL DEFAULT 0,
  weights         jsonb       NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (job_id, article_a, article_b)
);

-- GRANTs first (required for PostgREST data API exposure).
GRANT SELECT                         ON public.srangam_corpus_correlations_snapshot TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.srangam_corpus_correlations_snapshot TO service_role;

-- RLS: admins and service-role read; only admins/service-role write.
ALTER TABLE public.srangam_corpus_correlations_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read correlation snapshots"
  ON public.srangam_corpus_correlations_snapshot
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage correlation snapshots"
  ON public.srangam_corpus_correlations_snapshot
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for the two access patterns: "latest snapshot, top jaccard" (page
-- load) and "all rows for one snapshot" (detail view).
CREATE INDEX IF NOT EXISTS srangam_corpus_snap_latest_idx
  ON public.srangam_corpus_correlations_snapshot (computed_at DESC, jaccard DESC);

CREATE INDEX IF NOT EXISTS srangam_corpus_snap_job_idx
  ON public.srangam_corpus_correlations_snapshot (job_id);

COMMENT ON TABLE public.srangam_corpus_correlations_snapshot IS
  'Phase X.7.4 — materialised snapshots of get_corpus_correlations_v2 output. '
  'Written by the corpus_correlate background job (admin/service-role). Query '
  'the most recent snapshot by ordering computed_at DESC.';