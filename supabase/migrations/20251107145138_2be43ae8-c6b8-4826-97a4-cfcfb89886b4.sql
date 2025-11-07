-- Create narration analytics table for tracking TTS usage
CREATE TABLE IF NOT EXISTS public.narration_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  playback_events JSONB DEFAULT '[]'::jsonb,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  language TEXT NOT NULL,
  provider TEXT NOT NULL,
  voice TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_narration_analytics_article ON narration_analytics(article_slug);
CREATE INDEX IF NOT EXISTS idx_narration_analytics_user ON narration_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_narration_analytics_created ON narration_analytics(created_at);

-- Enable RLS
ALTER TABLE public.narration_analytics ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own analytics
CREATE POLICY "Users can insert their own narration analytics"
ON public.narration_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to view their own analytics
CREATE POLICY "Users can view their own narration analytics"
ON public.narration_analytics
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow admins to view all analytics (for dashboard)
CREATE POLICY "Service role can view all narration analytics"
ON public.narration_analytics
FOR SELECT
USING (auth.role() = 'service_role');