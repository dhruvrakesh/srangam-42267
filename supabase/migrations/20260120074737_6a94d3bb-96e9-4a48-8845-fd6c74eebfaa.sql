-- Add og_image_url column to srangam_articles
ALTER TABLE srangam_articles 
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

COMMENT ON COLUMN srangam_articles.og_image_url IS 
  'AI-generated Open Graph image URL for social sharing (DALL-E 3)';

-- Create og-images storage bucket for article OG images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('og-images', 'og-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Public read access for OG images (needed for social media crawlers)
CREATE POLICY "Public can view OG images"
ON storage.objects FOR SELECT
USING (bucket_id = 'og-images');

-- Service role can write OG images (edge functions use service role)
CREATE POLICY "Service role can upload OG images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'og-images');

-- Service role can update/overwrite OG images
CREATE POLICY "Service role can update OG images"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'og-images');

-- Service role can delete OG images
CREATE POLICY "Service role can delete OG images"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'og-images');