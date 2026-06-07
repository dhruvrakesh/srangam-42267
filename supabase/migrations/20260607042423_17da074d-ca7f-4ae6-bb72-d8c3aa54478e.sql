-- Phase S.1 — Surgical RLS healing (2026-06-07)
-- 1. srangam_media_assets: drop public SELECT, admin-only
DROP POLICY IF EXISTS "Public read active media assets" ON public.srangam_media_assets;
CREATE POLICY "Admins read media assets"
  ON public.srangam_media_assets FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. narration_analytics: drop anon-insert hole, strict ownership
DROP POLICY IF EXISTS "Users can insert their own narration analytics" ON public.narration_analytics;
CREATE POLICY "Authenticated users insert their own narration analytics"
  ON public.narration_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. srangam_article_chapters: gate public SELECT on published article
DROP POLICY IF EXISTS "Public read article chapters" ON public.srangam_article_chapters;
CREATE POLICY "Public read article chapters for published articles"
  ON public.srangam_article_chapters FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.srangam_articles a
    WHERE a.id = srangam_article_chapters.article_id
      AND a.status = 'published'
  ));

-- 4. srangam_markdown_sources: lock intent inline (advisory, no policy change)
COMMENT ON TABLE public.srangam_markdown_sources IS
  'Admin-only by design (Phase S.1, 2026-06-07). Stores raw markdown including drafts. Never add anon/authenticated SELECT — expose via a published-only view if external read is ever needed.';
