-- Create audio narrations table for TTS caching
CREATE TABLE IF NOT EXISTS srangam_audio_narrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google-cloud', 'openai')),
  voice_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  
  -- Google Drive storage
  google_drive_file_id TEXT,
  google_drive_share_url TEXT,
  
  -- Quality metadata
  sample_rate INTEGER DEFAULT 24000,
  audio_format TEXT DEFAULT 'mp3',
  
  -- Cost tracking
  character_count INTEGER,
  cost_usd DECIMAL(10, 4),
  
  -- Versioning
  content_hash TEXT,
  provider_metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(article_slug, language_code, provider)
);

-- Enable RLS
ALTER TABLE srangam_audio_narrations ENABLE ROW LEVEL SECURITY;

-- Public read access for all audio narrations
CREATE POLICY "Audio narrations are viewable by everyone"
ON srangam_audio_narrations
FOR SELECT
USING (true);

-- Authenticated users can insert/update audio narrations
CREATE POLICY "Authenticated users can create audio narrations"
ON srangam_audio_narrations
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can update audio narrations"
ON srangam_audio_narrations
FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS idx_audio_cache ON srangam_audio_narrations(article_slug, language_code);
CREATE INDEX IF NOT EXISTS idx_audio_content_hash ON srangam_audio_narrations(content_hash);

-- Function to check audio cache
CREATE OR REPLACE FUNCTION check_audio_cache(
  p_slug TEXT,
  p_lang TEXT,
  p_content_hash TEXT
) RETURNS TABLE(
  cache_exists BOOLEAN,
  drive_url TEXT,
  duration INTEGER,
  provider TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE,
    google_drive_share_url,
    duration_seconds,
    srangam_audio_narrations.provider
  FROM srangam_audio_narrations
  WHERE article_slug = p_slug
    AND language_code = p_lang
    AND content_hash = p_content_hash
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_srangam_audio_narrations_updated_at
BEFORE UPDATE ON srangam_audio_narrations
FOR EACH ROW
EXECUTE FUNCTION srangam_update_updated_at();