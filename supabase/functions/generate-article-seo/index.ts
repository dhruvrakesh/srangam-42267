import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SEORequest {
  currentFilters?: {
    themes?: string[];
    searchQuery?: string;
    sortBy?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentFilters }: SEORequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch published articles
    const { data: articles, error } = await supabase
      .from('srangam_articles')
      .select('title, dek, theme, tags, author, published_date, slug')
      .eq('status', 'published')
      .order('published_date', { ascending: false });

    if (error) throw error;

    const dbArticleCount = articles?.length || 0;
    const totalArticles = dbArticleCount + 30; // Include JSON articles
    let filteredCount = totalArticles;

    // Calculate filtered count
    if (currentFilters && articles) {
      let filtered = articles;
      
      if (currentFilters.themes?.length) {
        filtered = filtered.filter(a => currentFilters.themes?.includes(a.theme));
      }
      
      if (currentFilters.searchQuery) {
        const query = currentFilters.searchQuery.toLowerCase();
        filtered = filtered.filter(a => {
          const titleStr = typeof a.title === 'string' ? a.title : JSON.stringify(a.title);
          const dekStr = a.dek ? (typeof a.dek === 'string' ? a.dek : JSON.stringify(a.dek)) : '';
          return titleStr.toLowerCase().includes(query) || dekStr.toLowerCase().includes(query);
        });
      }
      
      filteredCount = filtered.length;
    }

    // Build OpenAI prompt
    const systemPrompt = `You are an SEO expert specializing in academic and cultural content. Generate compelling, search-optimized meta descriptions for article listings.

GUIDELINES:
- Length: 140-160 characters maximum
- Include the article count naturally
- Focus on academic credibility and cultural richness
- Incorporate specific themes/filters if provided
- Use keywords naturally (Ancient India, Sanskrit, Maritime Trade, Sacred Ecology, Vedic Period)
- Make it engaging and informative`;

    let userPrompt: string;
    if (currentFilters?.themes?.length || currentFilters?.searchQuery) {
      const filters: string[] = [];
      if (currentFilters.themes?.length) {
        filters.push(`themes: ${currentFilters.themes.join(', ')}`);
      }
      if (currentFilters.searchQuery) {
        filters.push(`search: "${currentFilters.searchQuery}"`);
      }
      userPrompt = `Generate an SEO meta description for a filtered article browse page showing ${filteredCount} articles. Active filters: ${filters.join('; ')}. Make it specific to these filters.`;
    } else {
      userPrompt = `Generate an SEO meta description for a research archive browse page with ${totalArticles} scholarly articles covering Ancient India, Maritime Trade, Sanskrit Literature, Sacred Ecology, and Cultural Continuity.`;
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const generatedDescription = aiData.choices[0]?.message?.content?.trim() || '';

    // Generate schema.org structured data
    const topArticles = articles?.slice(0, 10) || [];
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      numberOfItems: filteredCount,
      itemListElement: topArticles.map((article, index) => {
        const title = typeof article.title === 'object' && article.title.en 
          ? article.title.en 
          : (typeof article.title === 'string' ? article.title : 'Untitled');
        
        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'ScholarlyArticle',
            headline: title,
            author: { '@type': 'Person', name: article.author },
            datePublished: article.published_date,
            about: article.theme,
            keywords: article.tags?.join(', ') || '',
            url: `https://srangam.lovable.app/articles/${article.slug}`
          }
        };
      })
    };

    return new Response(
      JSON.stringify({
        success: true,
        metaDescription: generatedDescription,
        structuredData,
        articleCount: filteredCount,
        generatedAt: new Date().toISOString(),
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('SEO generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        metaDescription: 'Browse scholarly articles on Ancient India, Maritime Trade, Sanskrit Literature, and Cultural Continuity.',
        articleCount: 56
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
