-- Phase X.6 — Corpus correlation substrate (read-only, additive).

-- 1. Per-article overlay: pins (places) × purana refs.
CREATE OR REPLACE VIEW public.srangam_corpus_purana_pin_overlap AS
SELECT
  pr.article_id,
  pr.purana_name,
  pr.kanda,
  pr.adhyaya,
  pr.confidence_score AS purana_conf,
  g.id               AS gazetteer_id,
  g.canonical_name   AS place,
  p.confidence       AS pin_conf
FROM public.srangam_purana_references pr
JOIN public.srangam_article_pins      p USING (article_id)
JOIN public.srangam_gazetteer         g ON g.id = p.gazetteer_id;

-- 2. Article-pair overlap on shared places.
CREATE OR REPLACE VIEW public.srangam_corpus_article_place_pairs AS
SELECT
  LEAST(p1.article_id,  p2.article_id) AS article_a,
  GREATEST(p1.article_id, p2.article_id) AS article_b,
  COUNT(DISTINCT p1.gazetteer_id)      AS shared_places
FROM public.srangam_article_pins p1
JOIN public.srangam_article_pins p2
  ON p1.gazetteer_id = p2.gazetteer_id
 AND p1.article_id <> p2.article_id
GROUP BY 1, 2;

-- 3. Article-pair overlap on shared Puranic sources (purana_name+kanda+adhyaya).
CREATE OR REPLACE VIEW public.srangam_corpus_article_purana_pairs AS
SELECT
  LEAST(r1.article_id,  r2.article_id) AS article_a,
  GREATEST(r1.article_id, r2.article_id) AS article_b,
  COUNT(DISTINCT (r1.purana_name, COALESCE(r1.kanda,''), COALESCE(r1.adhyaya,''))) AS shared_puranas
FROM public.srangam_purana_references r1
JOIN public.srangam_purana_references r2
  ON r1.purana_name = r2.purana_name
 AND COALESCE(r1.kanda,'')   = COALESCE(r2.kanda,'')
 AND COALESCE(r1.adhyaya,'') = COALESCE(r2.adhyaya,'')
 AND r1.article_id <> r2.article_id
GROUP BY 1, 2;

-- Grants: views are exposed to authenticated only (admin gate at app layer).
REVOKE ALL ON public.srangam_corpus_purana_pin_overlap     FROM anon;
REVOKE ALL ON public.srangam_corpus_article_place_pairs    FROM anon;
REVOKE ALL ON public.srangam_corpus_article_purana_pairs   FROM anon;
GRANT SELECT ON public.srangam_corpus_purana_pin_overlap     TO authenticated;
GRANT SELECT ON public.srangam_corpus_article_place_pairs    TO authenticated;
GRANT SELECT ON public.srangam_corpus_article_purana_pairs   TO authenticated;
GRANT ALL    ON public.srangam_corpus_purana_pin_overlap     TO service_role;
GRANT ALL    ON public.srangam_corpus_article_place_pairs    TO service_role;
GRANT ALL    ON public.srangam_corpus_article_purana_pairs   TO service_role;

-- 4. RPC: top correlated article pairs by Jaccard of (shared_places ∪ shared_puranas).
--    SECURITY DEFINER so it reads the views regardless of caller's row visibility,
--    but EXECUTE is restricted to authenticated (the admin-only route gates UX).
CREATE OR REPLACE FUNCTION public.get_corpus_correlations(
  min_shared int DEFAULT 1,
  limit_rows int DEFAULT 200
)
RETURNS TABLE (
  article_a       uuid,
  article_b       uuid,
  shared_places   int,
  shared_puranas  int,
  shared_total    int,
  jaccard         numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH pp AS (
    SELECT article_a, article_b, shared_places, 0 AS shared_puranas
      FROM public.srangam_corpus_article_place_pairs
    UNION ALL
    SELECT article_a, article_b, 0 AS shared_places, shared_puranas
      FROM public.srangam_corpus_article_purana_pairs
  ),
  agg AS (
    SELECT article_a, article_b,
           SUM(shared_places)::int  AS shared_places,
           SUM(shared_puranas)::int AS shared_puranas,
           SUM(shared_places + shared_puranas)::int AS shared_total
      FROM pp
     GROUP BY article_a, article_b
  ),
  sizes AS (
    SELECT a.article_a, a.article_b,
           a.shared_places, a.shared_puranas, a.shared_total,
           -- proxy "size" = total signals an article carries
           (SELECT COUNT(*) FROM public.srangam_article_pins      WHERE article_id = a.article_a)
         + (SELECT COUNT(*) FROM public.srangam_purana_references WHERE article_id = a.article_a) AS size_a,
           (SELECT COUNT(*) FROM public.srangam_article_pins      WHERE article_id = a.article_b)
         + (SELECT COUNT(*) FROM public.srangam_purana_references WHERE article_id = a.article_b) AS size_b
      FROM agg a
  )
  SELECT s.article_a, s.article_b,
         s.shared_places, s.shared_puranas, s.shared_total,
         CASE
           WHEN (size_a + size_b - shared_total) <= 0 THEN 0
           ELSE ROUND(shared_total::numeric / (size_a + size_b - shared_total)::numeric, 4)
         END AS jaccard
    FROM sizes s
   WHERE s.shared_total >= GREATEST(min_shared, 1)
   ORDER BY jaccard DESC, shared_total DESC
   LIMIT GREATEST(LEAST(limit_rows, 1000), 1);
$$;

REVOKE ALL    ON FUNCTION public.get_corpus_correlations(int,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_corpus_correlations(int,int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_corpus_correlations(int,int) TO service_role;

COMMENT ON FUNCTION public.get_corpus_correlations(int,int) IS
  'Phase X.6 — read-only. Returns top article pairs ranked by Jaccard over shared '
  'gazetteer places + shared Puranic citations. Capped at 1000 rows. Gated by '
  'admin-only route at the app layer; SECURITY DEFINER lets it bypass per-row RLS '
  'on the underlying tables since views aggregate non-sensitive structural counts.';