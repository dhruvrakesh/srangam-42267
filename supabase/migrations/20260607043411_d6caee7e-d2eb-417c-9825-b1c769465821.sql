-- Phase S.2: published-status gate on per-article child tables.
-- Mirrors srangam_article_chapters / srangam_article_metadata pattern from Phase S.1.

-- 1. srangam_article_bibliography
DROP POLICY IF EXISTS "Public read article bibliography"
  ON public.srangam_article_bibliography;

CREATE POLICY "Public read article bibliography for published articles"
  ON public.srangam_article_bibliography
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.srangam_articles a
    WHERE a.id = srangam_article_bibliography.article_id
      AND a.status = 'published'
  ));

-- 2. srangam_article_evidence
DROP POLICY IF EXISTS "Evidence is publicly readable"
  ON public.srangam_article_evidence;

CREATE POLICY "Public read article evidence for published articles"
  ON public.srangam_article_evidence
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.srangam_articles a
    WHERE a.id = srangam_article_evidence.article_id
      AND a.status = 'published'
  ));

-- 3. srangam_cross_references — BOTH endpoints must be published
DROP POLICY IF EXISTS "Public read cross references"
  ON public.srangam_cross_references;

CREATE POLICY "Public read cross references between published articles"
  ON public.srangam_cross_references
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.srangam_articles a
      WHERE a.id = srangam_cross_references.source_article_id
        AND a.status = 'published'
    )
    AND
    EXISTS (
      SELECT 1 FROM public.srangam_articles a
      WHERE a.id = srangam_cross_references.target_article_id
        AND a.status = 'published'
    )
  );

-- 4. srangam_purana_references — admin SELECT first, then gate public SELECT
CREATE POLICY "Admin read purana references"
  ON public.srangam_purana_references
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read purana references"
  ON public.srangam_purana_references;

CREATE POLICY "Public read purana references for published articles"
  ON public.srangam_purana_references
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.srangam_articles a
    WHERE a.id = srangam_purana_references.article_id
      AND a.status = 'published'
  ));