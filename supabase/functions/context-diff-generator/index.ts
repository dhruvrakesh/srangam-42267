import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentSnapshotId, previousSnapshotId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching snapshots for diff:', { currentSnapshotId, previousSnapshotId });

    // Fetch both snapshots
    const { data: current, error: currentError } = await supabase
      .from('srangam_context_snapshots')
      .select('*')
      .eq('id', currentSnapshotId)
      .single();

    if (currentError) {
      throw new Error(`Failed to fetch current snapshot: ${currentError.message}`);
    }

    const { data: previous, error: previousError } = await supabase
      .from('srangam_context_snapshots')
      .select('*')
      .eq('id', previousSnapshotId)
      .single();

    if (previousError) {
      throw new Error(`Failed to fetch previous snapshot: ${previousError.message}`);
    }

    // Calculate basic count differences
    const changes = {
      articles: {
        added: current.articles_count - previous.articles_count,
        removed: 0, // Would need article IDs to calculate this accurately
        updated: 0
      },
      terms: {
        added: current.terms_count - previous.terms_count,
        removed: 0,
        updated: 0
      },
      tags: {
        added: current.tags_count - previous.tags_count,
        removed: 0
      },
      cross_refs: {
        added: current.cross_refs_count - previous.cross_refs_count,
        removed: 0
      },
      modules: {
        added: current.modules_count - previous.modules_count,
        removed: 0
      }
    };

    // Detailed article changes (if stats_detail is available)
    const detailedChanges = {
      addedArticles: [],
      updatedArticles: [],
      removedArticles: [],
      addedTerms: [],
      addedTags: [],
    };

    // Extract new tags and themes if available in stats_detail
    if (current.stats_detail && previous.stats_detail) {
      const currentDetail = current.stats_detail as any;
      const previousDetail = previous.stats_detail as any;

      if (currentDetail.themes && previousDetail.themes) {
        const newThemes = currentDetail.themes.filter(
          (theme: string) => !previousDetail.themes.includes(theme)
        );
        if (newThemes.length > 0) {
          detailedChanges.addedArticles = newThemes.map((theme: string) => ({
            theme,
            note: 'New theme detected'
          }));
        }
      }

      if (currentDetail.top_tags && previousDetail.top_tags) {
        const newTags = currentDetail.top_tags.filter(
          (tag: string) => !previousDetail.top_tags.includes(tag)
        );
        detailedChanges.addedTags = newTags;
      }
    }

    const summary = {
      changes,
      detailedChanges,
      currentSnapshot: {
        date: current.snapshot_date,
        articles: current.articles_count,
        terms: current.terms_count,
        tags: current.tags_count,
        cross_refs: current.cross_refs_count
      },
      previousSnapshot: {
        date: previous.snapshot_date,
        articles: previous.articles_count,
        terms: previous.terms_count,
        tags: previous.tags_count,
        cross_refs: previous.cross_refs_count
      },
      timeDifference: new Date(current.snapshot_date).getTime() - new Date(previous.snapshot_date).getTime()
    };

    console.log('Diff generated successfully:', summary);

    return new Response(
      JSON.stringify(summary),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating diff:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});