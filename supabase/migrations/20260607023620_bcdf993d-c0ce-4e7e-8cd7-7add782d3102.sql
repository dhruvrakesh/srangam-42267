ALTER TABLE public.srangam_purana_references_dedup_archive_20260606
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.srangam_purana_references_dedup_archive_20260606 FROM anon, authenticated;
GRANT  SELECT ON public.srangam_purana_references_dedup_archive_20260606 TO authenticated;
GRANT  ALL    ON public.srangam_purana_references_dedup_archive_20260606 TO service_role;

CREATE POLICY "Admins read purana dedup archive"
  ON public.srangam_purana_references_dedup_archive_20260606
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));