-- Phase H.3: Media asset lifecycle table (Cloudinary-style soft retire)
CREATE TABLE IF NOT EXISTS public.srangam_media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'og_image',
  provider text NOT NULL,
  model text NOT NULL,
  gdrive_file_id text,
  gdrive_share_url text,
  version int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active',
  prompt_hash text,
  cost_usd numeric(10,4),
  created_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz,
  CONSTRAINT srangam_media_assets_status_check
    CHECK (status IN ('active','superseded','retired')),
  CONSTRAINT srangam_media_assets_kind_check
    CHECK (kind IN ('og_image','hero','illustration'))
);

CREATE INDEX IF NOT EXISTS idx_media_assets_article_kind_status
  ON public.srangam_media_assets (article_id, kind, status);

CREATE INDEX IF NOT EXISTS idx_media_assets_article_version
  ON public.srangam_media_assets (article_id, kind, version DESC);

ALTER TABLE public.srangam_media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active media assets"
  ON public.srangam_media_assets
  FOR SELECT
  USING (status = 'active' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin manage media assets"
  ON public.srangam_media_assets
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Read-side denormalisation on srangam_articles for fast lookups
ALTER TABLE public.srangam_articles
  ADD COLUMN IF NOT EXISTS og_image_version int NOT NULL DEFAULT 1;

ALTER TABLE public.srangam_articles
  ADD COLUMN IF NOT EXISTS og_image_status text NOT NULL DEFAULT 'active';

ALTER TABLE public.srangam_articles
  DROP CONSTRAINT IF EXISTS srangam_articles_og_image_status_check;

ALTER TABLE public.srangam_articles
  ADD CONSTRAINT srangam_articles_og_image_status_check
    CHECK (og_image_status IN ('active','retired','pending'));