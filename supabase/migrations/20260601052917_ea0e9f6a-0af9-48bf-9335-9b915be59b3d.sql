
-- Phase H — Heal broken nightly cron payloads (2026-06-01)
-- Evidence: net._http_response shows jobid 6 → 400 "articleId required",
-- jobid 7 → 200 but no-op (empty articleSlugs[]), jobid 2 healthy,
-- jobid 8 → no response recorded (separate diagnosis).
--
-- This migration adds two SQL enqueuer helpers (SECURITY DEFINER, locked
-- down) and rewrites the broken cron commands via cron.alter_job. Fully
-- reversible: the old `command` text is preserved in the comments below
-- and can be restored with a single cron.alter_job call.

-- =========================================================================
-- H1 — generate-article-og nightly enqueuer
-- =========================================================================
-- Picks up to p_limit published articles missing an og_image_url,
-- creates an og_force job in srangam_admin_jobs with params.targets[],
-- and POSTs to generate-article-og Branch A (first-invocation targets
-- path; auth gate falls through requireAdminOrCron since we DON'T set
-- _pump=true — that path requires the service-role bearer which cron
-- does not present).

CREATE OR REPLACE FUNCTION public.enqueue_og_nightly_job(p_limit integer DEFAULT 1)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_targets jsonb;
  v_count   integer;
  v_job_id  uuid;
  v_req_id  bigint;
BEGIN
  IF p_limit IS NULL OR p_limit < 1 THEN p_limit := 1; END IF;
  IF p_limit > 5 THEN p_limit := 5; END IF;  -- hard cost cap (~$0.20/night)

  SELECT
    coalesce(jsonb_agg(jsonb_build_object(
      'articleId', id::text,
      'slug',      slug,
      'title',     coalesce(title->>'en', slug),
      'theme',     theme
    ) ORDER BY published_date DESC), '[]'::jsonb),
    count(*)
  INTO v_targets, v_count
  FROM (
    SELECT id, slug, title, theme, published_date
    FROM public.srangam_articles
    WHERE status = 'published'
      AND (og_image_url IS NULL OR og_image_status = 'retired')
    ORDER BY published_date DESC, created_at DESC
    LIMIT p_limit
  ) s;

  IF v_count = 0 THEN
    RETURN jsonb_build_object('ok', true, 'enqueued', 0, 'reason', 'no_candidates');
  END IF;

  INSERT INTO public.srangam_admin_jobs (kind, status, total, processed, params, started_at, heartbeat_at)
  VALUES (
    'og_force', 'running', v_count, 0,
    jsonb_build_object('targets', v_targets, 'source', 'nightly_cron'),
    now(), now()
  )
  RETURNING id INTO v_job_id;

  v_req_id := public._cron_invoke_edge(
    'generate-article-og',
    jsonb_build_object('job_id', v_job_id::text, 'targets', v_targets, 'cursor', 0, 'force', false)
  );

  RETURN jsonb_build_object(
    'ok', true, 'enqueued', v_count, 'job_id', v_job_id, 'request_id', v_req_id
  );
END;
$fn$;

REVOKE ALL ON FUNCTION public.enqueue_og_nightly_job(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_og_nightly_job(integer) TO postgres, service_role;

-- =========================================================================
-- H2 — batch-enrich-terms (tag regeneration) nightly enqueuer
-- =========================================================================
-- IMPORTANT: this function regenerates AI tags via generate-article-tags.
-- To avoid overwriting curated tags, we scope strictly to articles whose
-- tags array is empty (or NULL). Hard cap = 5 articles/night.

CREATE OR REPLACE FUNCTION public.enqueue_term_enrichment_nightly(p_limit integer DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_slugs jsonb;
  v_count integer;
  v_req_id bigint;
BEGIN
  IF p_limit IS NULL OR p_limit < 1 THEN p_limit := 1; END IF;
  IF p_limit > 10 THEN p_limit := 10; END IF;  -- cost cap

  SELECT
    coalesce(jsonb_agg(slug ORDER BY published_date DESC), '[]'::jsonb),
    count(*)
  INTO v_slugs, v_count
  FROM (
    SELECT slug, published_date
    FROM public.srangam_articles
    WHERE status = 'published'
      AND (tags IS NULL OR array_length(tags, 1) IS NULL OR array_length(tags, 1) = 0)
    ORDER BY published_date DESC, created_at DESC
    LIMIT p_limit
  ) s;

  IF v_count = 0 THEN
    RETURN jsonb_build_object('ok', true, 'enqueued', 0, 'reason', 'no_candidates');
  END IF;

  v_req_id := public._cron_invoke_edge(
    'batch-enrich-terms',
    jsonb_build_object('articleSlugs', v_slugs, 'source', 'nightly_cron')
  );

  RETURN jsonb_build_object(
    'ok', true, 'enqueued', v_count, 'request_id', v_req_id, 'slugs', v_slugs
  );
END;
$fn$;

REVOKE ALL ON FUNCTION public.enqueue_term_enrichment_nightly(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_term_enrichment_nightly(integer) TO postgres, service_role;

-- =========================================================================
-- Rewrite cron commands for jobid 6 (og) and 7 (term-enrichment)
-- =========================================================================
-- Old jobid 6 command (broken — kept for rollback):
--   SELECT public._cron_invoke_edge('generate-article-og', '{"nightly":true,"limit":1}'::jsonb);
-- Old jobid 7 command (no-op — kept for rollback):
--   SELECT public._cron_invoke_edge('batch-enrich-terms', '{"articleSlugs":[]}'::jsonb);

SELECT cron.alter_job(
  job_id  := 6,
  command := $cmd$ SELECT public.enqueue_og_nightly_job(1); $cmd$
);

SELECT cron.alter_job(
  job_id  := 7,
  command := $cmd$ SELECT public.enqueue_term_enrichment_nightly(5); $cmd$
);

-- =========================================================================
-- H3 — context-snapshot diagnosis (no command change, read-only)
-- =========================================================================
-- We leave jobid 8 untouched until the next nightly run produces evidence
-- of either (a) a fresh srangam_context_snapshots row, or (b) a recorded
-- pg_net response. The previous run had NULL status_code, suggesting the
-- response landed outside pg_net's collection window. Observability first.
