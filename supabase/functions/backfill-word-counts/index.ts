import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Calculate word count from markdown content
 * Strips HTML tags, markdown syntax, and counts words
 */
function calculateWordCount(content: string): number {
  if (!content) return 0;
  
  // Remove HTML tags
  let text = content.replace(/<[^>]+>/g, ' ');
  
  // Remove markdown syntax
  text = text
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\*\*|__/g, '') // Bold
    .replace(/\*|_/g, '') // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/`[^`]+`/g, '') // Inline code
    .replace(/>\s/g, '') // Blockquotes
    .replace(/[-*+]\s/g, '') // List items
    .replace(/\d+\.\s/g, '') // Numbered lists
    .replace(/\|[^|]+\|/g, '') // Tables
    .replace(/---+/g, ''); // Horizontal rules

  // Split by whitespace and filter empty strings
  const words = text
    .split(/\s+/)
    .filter(word => word.length > 0 && !/^\d+$/.test(word));

  return words.length;
}

/**
 * Extract text content from multilingual content object
 */
function extractContentText(content: any): string {
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null) {
    // Prefer English, then any available language
    return content.en || Object.values(content).find(v => typeof v === 'string') || '';
  }
  return '';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { dryRun = true } = await req.json().catch(() => ({}));

    console.log(`Starting word count backfill (dryRun: ${dryRun})`);

    // Fetch all articles without word_count
    const { data: articles, error: fetchError } = await supabase
      .from('srangam_articles')
      .select('id, slug, content, word_count')
      .is('word_count', null);

    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }

    if (!articles || articles.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'All articles already have word counts',
        stats: { processed: 0, updated: 0 }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${articles.length} articles without word_count`);

    const results: Array<{ slug: string; wordCount: number; status: string }> = [];
    let updated = 0;

    for (const article of articles) {
      const contentText = extractContentText(article.content);
      const wordCount = calculateWordCount(contentText);

      console.log(`Article "${article.slug}": ${wordCount} words`);

      if (!dryRun && wordCount > 0) {
        const { error: updateError } = await supabase
          .from('srangam_articles')
          .update({ word_count: wordCount })
          .eq('id', article.id);

        if (updateError) {
          console.error(`Failed to update ${article.slug}:`, updateError.message);
          results.push({ slug: article.slug, wordCount, status: 'error' });
        } else {
          updated++;
          results.push({ slug: article.slug, wordCount, status: 'updated' });
        }
      } else {
        results.push({ 
          slug: article.slug, 
          wordCount, 
          status: dryRun ? 'dry-run' : (wordCount === 0 ? 'skipped' : 'pending')
        });
      }
    }

    const summary = {
      success: true,
      dryRun,
      stats: {
        processed: articles.length,
        updated: dryRun ? 0 : updated,
        totalWords: results.reduce((sum, r) => sum + r.wordCount, 0),
        avgWordCount: Math.round(results.reduce((sum, r) => sum + r.wordCount, 0) / articles.length)
      },
      results
    };

    console.log('Backfill complete:', JSON.stringify(summary.stats, null, 2));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Backfill error:', errorMessage);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
