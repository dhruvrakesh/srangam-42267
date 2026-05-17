-- Phase O — Residual security remediation (post Phase N re-scan)

-- O.1 — Fix book_chapters `OR true` RLS bug
DROP POLICY IF EXISTS "Public read published book chapters" ON public.srangam_book_chapters;
CREATE POLICY "Public read published book chapters"
  ON public.srangam_book_chapters FOR SELECT TO public
  USING (status = 'published');
CREATE POLICY "Admins read all book chapters"
  ON public.srangam_book_chapters FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- O.2 — Hide narration cost/metadata behind public view; lock base table SELECT
CREATE OR REPLACE VIEW public.srangam_audio_narrations_public
WITH (security_invoker = on) AS
SELECT id, article_slug, language_code, voice_id, provider,
       google_drive_share_url, file_size_bytes, duration_seconds,
       audio_format, sample_rate, created_at, updated_at
FROM public.srangam_audio_narrations;

GRANT SELECT ON public.srangam_audio_narrations_public TO anon, authenticated;

DROP POLICY IF EXISTS "Audio narrations are viewable by everyone" ON public.srangam_audio_narrations;
CREATE POLICY "Admins and service role read narrations"
  ON public.srangam_audio_narrations FOR SELECT TO public
  USING (has_role(auth.uid(), 'admin') OR auth.role() = 'service_role');

-- O.3 — Admin-only writes on srangam-articles storage bucket
DROP POLICY IF EXISTS "Authenticated upload srangam articles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update srangam articles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete srangam articles" ON storage.objects;

CREATE POLICY "Admin upload srangam articles" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'srangam-articles' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update srangam articles" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'srangam-articles' AND has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'srangam-articles' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete srangam articles" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'srangam-articles' AND has_role(auth.uid(), 'admin'));

-- O.4 — Revoke EXECUTE on internal SECURITY DEFINER helpers from public roles
REVOKE EXECUTE ON FUNCTION public.analyze_tag_cooccurrence FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_purana_statistics    FROM PUBLIC, anon, authenticated;