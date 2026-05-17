-- ============================================================
-- N.6.a — narration_analytics: anon row read closed
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own narration analytics" ON public.narration_analytics;

CREATE POLICY "Owners and admins view narration analytics"
  ON public.narration_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- N.6.b — srangam_audio_narrations: writes admin / service-role only
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create audio narrations" ON public.srangam_audio_narrations;
DROP POLICY IF EXISTS "Authenticated users can update audio narrations" ON public.srangam_audio_narrations;

CREATE POLICY "Admins or service role insert narrations"
  ON public.srangam_audio_narrations
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.role() = 'service_role');

CREATE POLICY "Admins or service role update narrations"
  ON public.srangam_audio_narrations
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR auth.role() = 'service_role')
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.role() = 'service_role');

-- ============================================================
-- N.6.c — Editorial content tables: blanket authenticated → admin-only
-- ============================================================
-- srangam_book_chapters
DROP POLICY IF EXISTS "Authenticated manage book chapters" ON public.srangam_book_chapters;
CREATE POLICY "Admin manage book chapters"
  ON public.srangam_book_chapters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- srangam_article_chapters
DROP POLICY IF EXISTS "Authenticated manage article chapters" ON public.srangam_article_chapters;
CREATE POLICY "Admin manage article chapters"
  ON public.srangam_article_chapters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- srangam_bibliography_entries
DROP POLICY IF EXISTS "Authenticated manage bibliography" ON public.srangam_bibliography_entries;
CREATE POLICY "Admin manage bibliography"
  ON public.srangam_bibliography_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- srangam_article_bibliography
DROP POLICY IF EXISTS "Authenticated manage article bibliography" ON public.srangam_article_bibliography;
CREATE POLICY "Admin manage article bibliography"
  ON public.srangam_article_bibliography FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- srangam_markdown_sources
DROP POLICY IF EXISTS "Authenticated manage markdown sources" ON public.srangam_markdown_sources;
DROP POLICY IF EXISTS "Authenticated read markdown sources" ON public.srangam_markdown_sources;
CREATE POLICY "Admin manage markdown sources"
  ON public.srangam_markdown_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- srangam_cross_references
DROP POLICY IF EXISTS "Authenticated manage cross references" ON public.srangam_cross_references;
CREATE POLICY "Admin manage cross references"
  ON public.srangam_cross_references FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- N.7 — SECURITY DEFINER EXECUTE lockdown
-- ============================================================
-- Trigger-only functions: revoke from public/anon/authenticated (triggers fire as owner)
REVOKE EXECUTE ON FUNCTION public.update_tag_stats()                                FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.srangam_update_updated_at()                       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.srangam_increment_bibliography_usage()            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.srangam_increment_term_usage(term_key text)       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_term_usage_counts(term_names text[])    FROM PUBLIC, anon, authenticated;

-- Admin-only analytics: revoke from public/anon; keep authenticated so admin UI still calls them
REVOKE EXECUTE ON FUNCTION public.analyze_tag_cooccurrence()  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_purana_statistics()     FROM PUBLIC, anon;

-- has_role, fulltext + semantic search functions retain their existing grants (intentionally callable).

-- ============================================================
-- N.8 — Public storage bucket listing: close enumeration, keep CDN URLs
-- ============================================================
DROP POLICY IF EXISTS "Public read srangam articles" ON storage.objects;
DROP POLICY IF EXISTS "Public can view OG images"    ON storage.objects;

CREATE POLICY "Admins list srangam-articles bucket objects"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'srangam-articles' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins list og-images bucket objects"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'og-images' AND public.has_role(auth.uid(), 'admin'));