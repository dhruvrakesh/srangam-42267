
-- Migration: 20251027154432
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- Create app_role enum if not exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLE 1: srangam_articles - Core Content Repository
-- ============================================
CREATE TABLE public.srangam_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL,
    dek JSONB,
    content JSONB NOT NULL,
    content_markdown_path TEXT,
    author TEXT NOT NULL,
    published_date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    theme TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    read_time_minutes INTEGER,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT false,
    series_id UUID,
    part_number INTEGER
);

-- ============================================
-- TABLE 2: srangam_article_metadata - AI-Generated Insights
-- ============================================
CREATE TABLE public.srangam_article_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.srangam_articles(id) ON DELETE CASCADE,
    ai_summary JSONB,
    ai_keywords TEXT[] DEFAULT '{}',
    ai_themes TEXT[] DEFAULT '{}',
    cultural_density_score FLOAT,
    sentiment_analysis JSONB,
    embeddings vector(1536),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ai_model_version TEXT,
    UNIQUE(article_id)
);

-- ============================================
-- TABLE 3: srangam_cultural_terms - Dharmic Concepts Database
-- ============================================
CREATE TABLE public.srangam_cultural_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term TEXT UNIQUE NOT NULL,
    display_term TEXT NOT NULL,
    module TEXT NOT NULL,
    transliteration TEXT,
    translations JSONB NOT NULL,
    etymology JSONB,
    context JSONB,
    synonyms TEXT[] DEFAULT '{}',
    related_terms TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE 4: srangam_correlation_matrix - Evidence Linking System
-- ============================================
CREATE TABLE public.srangam_correlation_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id TEXT UNIQUE NOT NULL,
    article_slug TEXT,
    theme TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('textual', 'archaeological', 'geographic')),
    location_ancient TEXT,
    location_modern TEXT,
    coordinates geography(POINT),
    confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low', 'approximate')),
    evidence_description JSONB,
    bibliography JSONB,
    pin_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE 5: srangam_article_versions - Version Control
-- ============================================
CREATE TABLE public.srangam_article_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.srangam_articles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content_snapshot JSONB NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(article_id, version_number)
);

-- ============================================
-- TABLE 6: srangam_article_analytics - Usage Tracking
-- ============================================
CREATE TABLE public.srangam_article_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.srangam_articles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_read_time_seconds INTEGER DEFAULT 0,
    completion_rate FLOAT DEFAULT 0,
    language_breakdown JSONB DEFAULT '{}',
    cultural_term_interactions INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(article_id, date)
);

-- ============================================
-- TABLE 7: srangam_translation_queue - Content Management
-- ============================================
CREATE TABLE public.srangam_translation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES public.srangam_articles(id) ON DELETE CASCADE,
    target_language TEXT NOT NULL,
    source_language TEXT NOT NULL DEFAULT 'en',
    content_type TEXT NOT NULL CHECK (content_type IN ('article', 'cultural_term', 'metadata')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed')),
    assigned_translator TEXT,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE 8: srangam_inscriptions - Specialized Epigraphy Data
-- ============================================
CREATE TABLE public.srangam_inscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscription_id TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL,
    location_ancient TEXT NOT NULL,
    location_modern TEXT NOT NULL,
    coordinates geography(POINT),
    period_dynasty TEXT NOT NULL,
    period_ruler TEXT,
    century TEXT NOT NULL,
    dating_method TEXT CHECK (dating_method IN ('paleographic', 'archaeological', 'historical', 'astronomical')),
    script_types TEXT[] NOT NULL,
    scripts JSONB NOT NULL,
    translations JSONB NOT NULL,
    significance JSONB,
    bibliography TEXT[] DEFAULT '{}',
    related_inscriptions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.srangam_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srangam_article_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srangam_cultural_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srangam_correlation_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srangam_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srangam_article_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srangam_translation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srangam_inscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PUBLIC READ, AUTHENTICATED WRITE
-- ============================================

-- Articles: Public can read published articles
CREATE POLICY "Public read published articles"
    ON public.srangam_articles FOR SELECT
    TO public
    USING (status = 'published');

-- Articles: Authenticated users can manage all articles
CREATE POLICY "Authenticated manage articles"
    ON public.srangam_articles FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Article Metadata: Public can read metadata for published articles
CREATE POLICY "Public read article metadata"
    ON public.srangam_article_metadata FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.srangam_articles
            WHERE id = article_id AND status = 'published'
        )
    );

-- Article Metadata: Authenticated users can manage metadata
CREATE POLICY "Authenticated manage metadata"
    ON public.srangam_article_metadata FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Cultural Terms: Public can read all terms
CREATE POLICY "Public read cultural terms"
    ON public.srangam_cultural_terms FOR SELECT
    TO public
    USING (true);

-- Cultural Terms: Authenticated users can manage terms
CREATE POLICY "Authenticated manage cultural terms"
    ON public.srangam_cultural_terms FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Correlation Matrix: Public can read all correlations
CREATE POLICY "Public read correlation matrix"
    ON public.srangam_correlation_matrix FOR SELECT
    TO public
    USING (true);

-- Correlation Matrix: Authenticated users can manage correlations
CREATE POLICY "Authenticated manage correlations"
    ON public.srangam_correlation_matrix FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Article Versions: Authenticated users only
CREATE POLICY "Authenticated manage versions"
    ON public.srangam_article_versions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Analytics: Authenticated users only
CREATE POLICY "Authenticated manage analytics"
    ON public.srangam_article_analytics FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Translation Queue: Authenticated users only
CREATE POLICY "Authenticated manage translation queue"
    ON public.srangam_translation_queue FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Inscriptions: Public can read all inscriptions
CREATE POLICY "Public read inscriptions"
    ON public.srangam_inscriptions FOR SELECT
    TO public
    USING (true);

-- Inscriptions: Authenticated users can manage inscriptions
CREATE POLICY "Authenticated manage inscriptions"
    ON public.srangam_inscriptions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Articles indexes
CREATE INDEX idx_srangam_articles_slug ON public.srangam_articles(slug);
CREATE INDEX idx_srangam_articles_theme ON public.srangam_articles(theme);
CREATE INDEX idx_srangam_articles_status_date ON public.srangam_articles(status, published_date DESC);
CREATE INDEX idx_srangam_articles_tags ON public.srangam_articles USING GIN(tags);

-- Cultural terms indexes
CREATE INDEX idx_srangam_cultural_terms_term ON public.srangam_cultural_terms(term);
CREATE INDEX idx_srangam_cultural_terms_module ON public.srangam_cultural_terms(module);

-- Article metadata indexes
CREATE INDEX idx_srangam_article_metadata_article_id ON public.srangam_article_metadata(article_id);
CREATE INDEX idx_srangam_article_metadata_embeddings ON public.srangam_article_metadata USING ivfflat (embeddings vector_cosine_ops) WITH (lists = 100);

-- Correlation matrix indexes
CREATE INDEX idx_srangam_correlation_matrix_article_slug ON public.srangam_correlation_matrix(article_slug);
CREATE INDEX idx_srangam_correlation_matrix_theme ON public.srangam_correlation_matrix(theme);
CREATE INDEX idx_srangam_correlation_matrix_coordinates ON public.srangam_correlation_matrix USING GIST(coordinates);

-- Analytics indexes
CREATE INDEX idx_srangam_article_analytics_date ON public.srangam_article_analytics(date DESC);
CREATE INDEX idx_srangam_article_analytics_article_id ON public.srangam_article_analytics(article_id);

-- Inscriptions indexes
CREATE INDEX idx_srangam_inscriptions_inscription_id ON public.srangam_inscriptions(inscription_id);
CREATE INDEX idx_srangam_inscriptions_coordinates ON public.srangam_inscriptions USING GIST(coordinates);

-- ============================================
-- UTILITY FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.srangam_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_srangam_articles_updated_at
    BEFORE UPDATE ON public.srangam_articles
    FOR EACH ROW
    EXECUTE FUNCTION public.srangam_update_updated_at();

CREATE TRIGGER update_srangam_article_analytics_updated_at
    BEFORE UPDATE ON public.srangam_article_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.srangam_update_updated_at();

-- Function: Increment cultural term usage counter
CREATE OR REPLACE FUNCTION public.srangam_increment_term_usage(term_key text)
RETURNS void AS $$
BEGIN
    UPDATE public.srangam_cultural_terms
    SET usage_count = usage_count + 1
    WHERE term = term_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Semantic article search using vector embeddings
CREATE OR REPLACE FUNCTION public.srangam_search_articles_semantic(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    article_id uuid,
    slug text,
    title jsonb,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.slug,
        a.title,
        1 - (m.embeddings <=> query_embedding) as similarity
    FROM public.srangam_articles a
    JOIN public.srangam_article_metadata m ON m.article_id = a.id
    WHERE 
        a.status = 'published' 
        AND m.embeddings IS NOT NULL
        AND 1 - (m.embeddings <=> query_embedding) > match_threshold
    ORDER BY m.embeddings <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STORAGE BUCKET & POLICIES
-- ============================================

-- Create storage bucket for markdown articles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'srangam-articles',
    'srangam-articles',
    true,
    10485760,
    ARRAY['text/markdown', 'text/plain', 'application/json']
) ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Public read markdown articles
CREATE POLICY "Public read srangam articles"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'srangam-articles');

-- Storage Policy: Authenticated upload articles
CREATE POLICY "Authenticated upload srangam articles"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'srangam-articles');

-- Storage Policy: Authenticated update articles
CREATE POLICY "Authenticated update srangam articles"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'srangam-articles')
    WITH CHECK (bucket_id = 'srangam-articles');

-- Storage Policy: Authenticated delete articles
CREATE POLICY "Authenticated delete srangam articles"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'srangam-articles');

-- Migration: 20251027154549
-- Fix security warnings: Add search_path to all functions

-- Fix: srangam_update_updated_at function
CREATE OR REPLACE FUNCTION public.srangam_update_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix: srangam_increment_term_usage function
CREATE OR REPLACE FUNCTION public.srangam_increment_term_usage(term_key text)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.srangam_cultural_terms
    SET usage_count = usage_count + 1
    WHERE term = term_key;
END;
$$;

-- Fix: srangam_search_articles_semantic function
CREATE OR REPLACE FUNCTION public.srangam_search_articles_semantic(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    article_id uuid,
    slug text,
    title jsonb,
    similarity float
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.slug,
        a.title,
        1 - (m.embeddings <=> query_embedding) as similarity
    FROM public.srangam_articles a
    JOIN public.srangam_article_metadata m ON m.article_id = a.id
    WHERE 
        a.status = 'published' 
        AND m.embeddings IS NOT NULL
        AND 1 - (m.embeddings <=> query_embedding) > match_threshold
    ORDER BY m.embeddings <=> query_embedding
    LIMIT match_count;
END;
$$;
