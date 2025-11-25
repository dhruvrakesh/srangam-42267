// Phase 2: AI-Powered Tag Generation Edge Function
// Uses OpenAI GPT-4o-mini to analyze article content and generate contextually relevant tags
// Intelligently merges with existing tag taxonomy for consistency

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TagGenerationRequest {
  title: string;
  theme: string;
  culturalTerms: string[];
  contentPreview: string; // First 1000 words
}

interface TagGenerationResponse {
  success: boolean;
  tags: string[];
  confidence: number;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, theme, culturalTerms, contentPreview }: TagGenerationRequest = await req.json();
    
    console.log('🏷️ Generating tags for:', title);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch existing tags for context (top 100 most used)
    const { data: existingTagsData, error: tagsError } = await supabase
      .from('srangam_tags')
      .select('tag_name, category, usage_count')
      .order('usage_count', { ascending: false })
      .limit(100);

    if (tagsError) {
      console.error('Error fetching existing tags:', tagsError);
    }

    const existingTags = existingTagsData?.map(t => t.tag_name) || [];
    const tagCategories = existingTagsData?.reduce((acc, t) => {
      if (t.category) acc[t.tag_name] = t.category;
      return acc;
    }, {} as Record<string, string>) || {};

    console.log(`📊 Found ${existingTags.length} existing tags in taxonomy`);

    // Prepare AI prompt
    const systemPrompt = `You are an expert in Indian Ocean history, South Asian studies, and academic taxonomy. Your task is to generate 5-8 highly relevant tags for scholarly articles.

EXISTING TAG TAXONOMY (top 100 most used):
${existingTags.length > 0 ? existingTags.join(', ') : 'No existing tags yet - you are creating the initial taxonomy'}

TAG CATEGORIES:
- Period: e.g., "Mauryan Empire", "Chola Dynasty", "Medieval Period"
- Concept: e.g., "Maritime Trade", "Temple Architecture", "Ritual Practices"
- Location: e.g., "Tamil Nadu", "Kerala", "Indian Ocean"
- Methodology: e.g., "Epigraphy", "Archaeological Survey", "Textual Analysis"
- Subject: e.g., "Buddhism", "Sanskrit Literature", "Geomythology"

RULES:
1. Generate 5-8 tags that are specific and academically precise
2. PREFER existing tags when appropriate (normalize capitalization/spelling)
3. When creating new tags, follow the naming patterns of existing tags
4. Mix specific tags (dynasties, locations) with broader concepts
5. Include the theme if it's not already covered by other tags
6. Use proper capitalization for proper nouns
7. Avoid overly generic tags like "History" or "India" unless highly relevant

Return ONLY a JSON object with this structure:
{
  "tags": ["Tag 1", "Tag 2", "Tag 3", ...],
  "reasoning": "Brief explanation of tag choices"
}`;

    const userPrompt = `Article Title: ${title}
Theme: ${theme}
Cultural Terms Found: ${culturalTerms.slice(0, 20).join(', ')}${culturalTerms.length > 20 ? '...' : ''}

Content Preview (first 1000 characters):
${contentPreview.slice(0, 1000)}

Generate 5-8 relevant tags for this article.`;

    // Call OpenAI API
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('🤖 Calling OpenAI API for tag generation...');

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
        temperature: 0.3, // Lower temperature for more consistent tagging
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            tags: [],
            message: 'Rate limit exceeded. Please try again later.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0]?.message?.content || '';
    
    console.log('🤖 AI Response:', aiContent);

    // Parse AI response (handle markdown code blocks)
    let parsedResponse;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(aiContent);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('AI returned invalid JSON format');
    }

    const generatedTags = parsedResponse.tags || [];
    
    console.log(`✅ Generated ${generatedTags.length} tags:`, generatedTags);
    console.log('💭 Reasoning:', parsedResponse.reasoning);

    // Fuzzy matching and normalization
    const normalizedTagsWithCategories = (Array.isArray(parsedResponse.tags) ? parsedResponse.tags : []).map((genTag: any) => {
      const tagName = typeof genTag === 'string' ? genTag : genTag.name;
      const category = typeof genTag === 'string' ? null : genTag.category;
      const lowerTag = tagName.toLowerCase();
      
      // Check for exact match (case-insensitive)
      const exactMatch = existingTags.find(et => et.toLowerCase() === lowerTag);
      if (exactMatch) {
        return { 
          name: exactMatch, 
          category: tagCategories[exactMatch] || category 
        };
      }
      
      // Check for close variants
      const closeMatch = existingTags.find(et => {
        const lowerExisting = et.toLowerCase();
        return lowerExisting.includes(lowerTag) || lowerTag.includes(lowerExisting);
      });
      
      if (closeMatch) {
        console.log(`🔄 Normalized "${tagName}" → "${closeMatch}"`);
        return { 
          name: closeMatch, 
          category: tagCategories[closeMatch] || category 
        };
      }
      
      return { name: tagName, category };
    });

    const normalizedTags = normalizedTagsWithCategories.map((t: any) => t.name);

    // Create new tags with categories
    const newTags = normalizedTagsWithCategories.filter((t: any) => !existingTags.includes(t.name));
    if (newTags.length > 0) {
      console.log(`📝 Creating ${newTags.length} new tags with categories:`, newTags);
      const { error: insertError } = await supabase
        .from('srangam_tags')
        .insert(
          newTags.map((tag: any) => ({
            tag_name: tag.name,
            category: tag.category || null,
            usage_count: 1,
          }))
        );
      
      if (insertError) {
        console.error('Error creating new tags:', insertError);
      }
    }

    const response: TagGenerationResponse = {
      success: true,
      tags: normalizedTags,
      confidence: 0.85,
      message: `Generated ${normalizedTags.length} tags using AI analysis. ${parsedResponse.reasoning || ''}`
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Tag generation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        tags: [],
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
