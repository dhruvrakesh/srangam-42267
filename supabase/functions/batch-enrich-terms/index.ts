import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

import { requireAdminOrCron } from '../_shared/auth-gate.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  // TAGS_PROVENANCE_2026_09_07
  const body = await req.clone().json().catch(() => ({} as any));
  const __gate = await requireAdminOrCron(req, body);
  if (__gate.error) return __gate.error;

  try {
    const { articleSlugs } = body ?? {};

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
          .select('id, slug, title, content, theme, tags')   // TAGS_PROVENANCE_2026_09_07: theme is required by generate-article-tags
          .eq('slug', slug)
          .single();

        if (fetchError || !article) {
          console.error(`Article not found: ${slug}`);
          results.push({ slug, success: false, error: 'Article not found' });
          continue;
        }

        // TAGS_PROVENANCE_2026_09_07 - was sending { articleId, title, content }.
        // generate-article-tags:38 destructures { title, theme, culturalTerms,
        // contentPreview }, so contentPreview/theme/culturalTerms arrived
        // undefined and articleId was never read. Every article was rejected.
        // This is the shape markdown-to-article-import:547 sends, which works.
        const titleText = typeof article.title === 'string'
          ? article.title
          : (article.title?.en ?? Object.values(article.title ?? {})[0] ?? article.slug);
        const contentText = typeof article.content === 'string'
          ? article.content
          : (article.content?.en ?? '');
        if (!contentText) {
          results.push({ slug, success: false, error: 'article has no English body to derive tags from' });
          continue;
        }
        // TAGS_AUTH_2026_09_08: invoking with the service-role client sent a
        // service-role bearer that generate-article-tags' admin gate rejected
        // with 401. Send the cron/service credentials it now accepts.
        const { data: tagData, error: tagError } = await supabase.functions.invoke(
          'generate-article-tags',
          {
            headers: { 'x-cron-secret': Deno.env.get('CRON_SECRET') ?? '' },
            body: {
              _cron: true,
              title: titleText,
              theme: article.theme ?? '',
              culturalTerms: [],
              contentPreview: contentText.slice(0, 1000),
            }
          }
        );

        if (tagError) {
          console.error(`Tag generation failed for ${slug}:`, tagError);
          results.push({ slug, success: false, error: tagError.message });
          continue;
        }

        // TAGS_PROVENANCE_2026_09_07 - the tags used to be pushed into `results`
        // and discarded; this file contained no UPDATE at all, which is why the
        // report said success while no tags were ever added. Persist, then
        // report what the database returned - never what we hoped to write.
        const newTags = Array.isArray(tagData?.tags) ? tagData.tags : null;
        if (!newTags || newTags.length === 0) {
          results.push({ slug, success: false, error: 'tag service returned no tags' });
          continue;
        }
        const { data: updated, error: updateError } = await supabase
          .from('srangam_articles')
          .update({ tags: newTags, updated_at: new Date().toISOString() })
          .eq('id', article.id)
          .select('id, tags')
          .single();
        if (updateError || !updated) {
          results.push({ slug, success: false, error: `tags generated but NOT saved: ${updateError?.message ?? 'no row returned'}` });
          continue;
        }
        results.push({ slug, success: true, tagsWritten: updated.tags?.length ?? 0, tags: updated.tags });
        console.log(`Wrote ${updated.tags?.length ?? 0} tags to ${slug}`);

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
        // TAGS_PROVENANCE_2026_09_07 - was unconditionally true. Four failed
        // articles rendered as a successful run because the admin UI reads this
        // flag and not summary.failed.
        success: failCount === 0,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failCount
        },
        results 
      }),
      {
        // 207 Multi-Status when some articles failed, so a caller that only
        // checks the HTTP code cannot be misled either.
        status: failCount === 0 ? 200 : 207,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in batch-enrich-terms function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
