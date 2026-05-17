-- N.1: Close draft-articles read hole
DROP POLICY IF EXISTS "Anyone can view articles" ON public.srangam_articles;

CREATE POLICY "Admins can view all articles"
  ON public.srangam_articles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- N.2: Lock realtime broadcast for admin jobs to admins only.
-- srangam_admin_jobs stays in publication so the Admin Job Progress card
-- keeps live updates. Restrictive policy on realtime.messages scopes
-- channel access to admin subscribers only.
CREATE POLICY "Only admins can read realtime messages"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));