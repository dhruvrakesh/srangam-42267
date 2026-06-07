-- Phase S.1.1: tighten narration_analytics INSERT — disallow NULL user_id
-- Scanner flagged that the WITH CHECK `auth.uid() = user_id` is satisfied when both sides are NULL.
DROP POLICY IF EXISTS "Authenticated users insert own narration analytics" ON public.narration_analytics;

CREATE POLICY "Authenticated users insert own narration analytics"
ON public.narration_analytics
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);