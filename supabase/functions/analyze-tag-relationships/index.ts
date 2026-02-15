// Phase 4: Tag Relationship Analyzer Edge Function
// Analyzes tag co-occurrence patterns and updates related_tags for smart suggestions
// Run periodically (e.g., daily cron job) or after bulk imports

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { classifyError } from '../_shared/error-response.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RelationshipAnalysisResponse {
  success: boolean;
  tagsUpdated: number;
  relationshipsFound: number;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting tag relationship analysis...');

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the database function to analyze tag co-occurrence
    const { data: cooccurrenceData, error: cooccurrenceError } = await supabase
      .rpc('analyze_tag_cooccurrence');

    if (cooccurrenceError) {
      console.error('Error analyzing tag co-occurrence:', cooccurrenceError);
      throw cooccurrenceError;
    }

    console.log(`📊 Found ${cooccurrenceData?.length || 0} tag relationships`);

    // Build a map of related tags for each tag
    const relationshipMap = new Map<string, Array<{ tag: string; score: number }>>();

    for (const row of (cooccurrenceData || [])) {
      const { tag1, tag2, cooccurrence_count } = row;
      
      // Add tag2 to tag1's related tags
      if (!relationshipMap.has(tag1)) {
        relationshipMap.set(tag1, []);
      }
      relationshipMap.get(tag1)!.push({
        tag: tag2,
        score: Number(cooccurrence_count)
      });

      // Add tag1 to tag2's related tags (bidirectional)
      if (!relationshipMap.has(tag2)) {
        relationshipMap.set(tag2, []);
      }
      relationshipMap.get(tag2)!.push({
        tag: tag1,
        score: Number(cooccurrence_count)
      });
    }

    console.log(`🔗 Built relationship map for ${relationshipMap.size} tags`);

    // Update each tag's related_tags field
    let updatedCount = 0;
    const updatePromises = [];

    for (const [tagName, relationships] of relationshipMap.entries()) {
      // Sort by score (descending) and take top 10
      const topRelated = relationships
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(r => ({ tag: r.tag, score: r.score }));

      const updatePromise = supabase
        .from('srangam_tags')
        .update({ related_tags: topRelated })
        .eq('tag_name', tagName);

      updatePromises.push(updatePromise);
    }

    // Execute all updates in parallel
    const results = await Promise.all(updatePromises);
    
    // Count successful updates
    for (const result of results) {
      if (!result.error) {
        updatedCount++;
      } else {
        console.error(`Error updating tag:`, result.error);
      }
    }

    console.log(`✅ Updated ${updatedCount} tags with relationship data`);

    // Calculate relationship strength statistics
    const allScores = Array.from(relationshipMap.values())
      .flat()
      .map(r => r.score);
    
    const avgScore = allScores.length > 0 
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
      : 0;
    
    const maxScore = allScores.length > 0 ? Math.max(...allScores) : 0;

    const response: RelationshipAnalysisResponse = {
      success: true,
      tagsUpdated: updatedCount,
      relationshipsFound: cooccurrenceData?.length || 0,
      message: `Analysis complete. Updated ${updatedCount} tags with relationship data. Average co-occurrence: ${avgScore.toFixed(1)}, Max: ${maxScore}`
    };

    console.log('📈 Analysis summary:', response.message);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Tag relationship analysis error:', error);
    
    const detail = classifyError(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: detail,
        tagsUpdated: 0,
        relationshipsFound: 0,
        message: detail.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
