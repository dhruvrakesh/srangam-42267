import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { requireAdmin } from '../_shared/auth-gate.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const __gate = await requireAdmin(req);
  if (__gate.error) return __gate.error;

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

    // CX.2: consume structured stats_detail shape. Falls back to mode:'count_only'
    // when either snapshot is pre-CX.2 (themes/top_tags shipped as flat arrays via _compat,
    // or stats_detail missing entirely). Never crashes on legacy snapshots — frozen baseline
    // snapshots prior to 2026-05-29 are immutable by policy.
    const detailedChanges: {
      mode: 'identity' | 'count_only';
      addedArticles: any[];
      updatedArticles: any[];
      removedArticles: any[];
      addedTerms: any[];
      addedTags: any[];
      newThemes: string[];
      reason?: string;
    } = {
      mode: 'identity',
      addedArticles: [],
      updatedArticles: [],
      removedArticles: [],
      addedTerms: [],
      addedTags: [],
      newThemes: [],
    };

    const currentDetail = (current.stats_detail ?? {}) as any;
    const previousDetail = (previous.stats_detail ?? {}) as any;

    // Themes: structured shape is Record<string, number>; pre-CX.2 was a flat string[].
    const currentThemes = currentDetail.themes;
    const previousThemes = previousDetail.themes;
    const themesAreStructured =
      currentThemes && typeof currentThemes === 'object' && !Array.isArray(currentThemes) &&
      previousThemes && typeof previousThemes === 'object' && !Array.isArray(previousThemes);

    // Tags: structured shape is Array<{name, usage_count}>; pre-CX.2 was a flat string[].
    const currentTags = currentDetail.top_tags;
    const previousTags = previousDetail.top_tags;
    const tagsAreStructured =
      Array.isArray(currentTags) && currentTags.every((t: any) => t && typeof t === 'object' && 'name' in t) &&
      Array.isArray(previousTags) && previousTags.every((t: any) => t && typeof t === 'object' && 'name' in t);

    if (themesAreStructured && tagsAreStructured) {
      const newThemes = Object.keys(currentThemes).filter((t) => !(t in previousThemes));
      detailedChanges.newThemes = newThemes;
      detailedChanges.addedArticles = newThemes.map((theme: string) => ({
        theme,
        note: 'New theme detected',
      }));

      const prevTagNames = new Set(previousTags.map((t: any) => t.name));
      detailedChanges.addedTags = currentTags
        .filter((t: any) => !prevTagNames.has(t.name))
        .map((t: any) => t.name);
    } else {
      detailedChanges.mode = 'count_only';
      detailedChanges.reason =
        'One or both snapshots predate CX.2 structured stats_detail (frozen baseline). Only count-based deltas are available.';
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