DROP VIEW IF EXISTS public.srangam_audio_narrations_public;
CREATE VIEW public.srangam_audio_narrations_public
WITH (security_invoker = on) AS
SELECT id, article_slug, language_code, voice_id, provider,
       google_drive_share_url, file_size_bytes, duration_seconds,
       audio_format, sample_rate, created_at, updated_at,
       content_hash, character_count
FROM public.srangam_audio_narrations;

GRANT SELECT ON public.srangam_audio_narrations_public TO anon, authenticated;