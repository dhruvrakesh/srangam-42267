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