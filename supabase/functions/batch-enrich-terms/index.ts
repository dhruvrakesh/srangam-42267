import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleSlugs } = await req.json();

    if (!articleSlugs || !Array.isArray(articleSlugs)) {
      return new Response(
        JSON.stringify({ error: 'Article slugs array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Regenerating tags for ${articleSlugs.length} articles`);

    const results = [];

    for (const slug of articleSlugs) {
      try {
        // Fetch article
        const { data: article, error: fetchError } = await supabase
          .from('srangam_articles')
          .select('id, slug, title, content')
          .eq('slug', slug)
          .single();

        if (fetchError || !article) {
          console.error(`Article not found: ${slug}`);
          results.push({ slug, success: false, error: 'Article not found' });
          continue;
        }

        // Call generate-article-tags function
        const { data: tagData, error: tagError } = await supabase.functions.invoke(
          'generate-article-tags',
          {
            body: {
              articleId: article.id,
              title: article.title,
              content: article.content
            }
          }
        );

        if (tagError) {
          console.error(`Tag generation failed for ${slug}:`, tagError);
          results.push({ slug, success: false, error: tagError.message });
          continue;
        }

        results.push({ slug, success: true, tags: tagData.tags });
        console.log(`Successfully regenerated tags for ${slug}`);

      } catch (err) {
        console.error(`Error processing ${slug}:`, err);
        results.push({ 
          slug, 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    return new Response(
      JSON.stringify({ 
        success: true,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failCount
        },
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in batch-enrich-terms function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
