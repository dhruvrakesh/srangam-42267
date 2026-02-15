
-- Phase B: Security Hardening — Tighten 11 overly permissive write policies to admin-only
-- All SELECT policies remain untouched. Edge functions use service role key (bypass RLS).

-- 1. srangam_articles: DROP redundant ALL policy (admin INSERT/UPDATE/DELETE already exist)
DROP POLICY IF EXISTS "Authenticated manage articles" ON public.srangam_articles;

-- 2. srangam_article_analytics: Replace with admin-only
DROP POLICY IF EXISTS "Authenticated manage analytics" ON public.srangam_article_analytics;
CREATE POLICY "Admin manage analytics" ON public.srangam_article_analytics
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. srangam_article_evidence: Replace with admin-only
DROP POLICY IF EXISTS "Service role can manage evidence" ON public.srangam_article_evidence;
CREATE POLICY "Admin manage evidence" ON public.srangam_article_evidence
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. srangam_article_metadata: Replace with admin-only
DROP POLICY IF EXISTS "Authenticated manage metadata" ON public.srangam_article_metadata;
CREATE POLICY "Admin manage metadata" ON public.srangam_article_metadata
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. srangam_article_versions: Replace with admin-only
DROP POLICY IF EXISTS "Authenticated manage versions" ON public.srangam_article_versions;
CREATE POLICY "Admin manage versions" ON public.srangam_article_versions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. srangam_correlation_matrix: Replace with admin-only
DROP POLICY IF EXISTS "Authenticated manage correlations" ON public.srangam_correlation_matrix;
CREATE POLICY "Admin manage correlations" ON public.srangam_correlation_matrix
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. srangam_cultural_terms: Replace with admin-only
DROP POLICY IF EXISTS "Authenticated manage cultural terms" ON public.srangam_cultural_terms;
CREATE POLICY "Admin manage cultural terms" ON public.srangam_cultural_terms
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. srangam_inscriptions: Replace with admin-only
DROP POLICY IF EXISTS "Authenticated manage inscriptions" ON public.srangam_inscriptions;
CREATE POLICY "Admin manage inscriptions" ON public.srangam_inscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. srangam_purana_references: Replace INSERT and UPDATE with admin-only
DROP POLICY IF EXISTS "Authenticated insert purana references" ON public.srangam_purana_references;
DROP POLICY IF EXISTS "Authenticated update purana references" ON public.srangam_purana_references;
CREATE POLICY "Admin insert purana references" ON public.srangam_purana_references
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update purana references" ON public.srangam_purana_references
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 10. srangam_translation_queue: Replace with admin-only
DROP POLICY IF EXISTS "Authenticated manage translation queue" ON public.srangam_translation_queue;
CREATE POLICY "Admin manage translation queue" ON public.srangam_translation_queue
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
