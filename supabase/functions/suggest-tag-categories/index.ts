import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tags } = await req.json();

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Tags array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🤖 Suggesting categories for ${tags.length} tags...`);

    const systemPrompt = `You are an expert in academic taxonomy and South Asian studies. Categorize tags into these categories:

CATEGORIES:
- Period: Historical eras, dynasties, time periods (e.g., "Mauryan Empire", "Vedic Period", "Medieval Period")
- Concept: Abstract ideas, practices, themes (e.g., "Maritime Trade", "Ritual Practices", "Religious Pluralism")
- Location: Geographical places, regions (e.g., "Tamil Nadu", "Kerala", "Indian Ocean")
- Methodology: Research methods, academic approaches (e.g., "Epigraphy", "Archaeological Survey", "Textual Analysis")
- Subject: Specific topics, religions, traditions (e.g., "Buddhism", "Shaivism", "Sanskrit Literature")

Return a JSON object with this exact structure:
{
  "suggestions": [
    {
      "tagId": "tag-id-here",
      "category": "Period|Concept|Location|Methodology|Subject",
      "reasoning": "Brief explanation"
    }
  ]
}`;

    const userPrompt = `Categorize these tags:\n\n${tags.map((t: any) => 
      `- "${t.tag_name}" (ID: ${t.id}, Usage: ${t.usage_count || 0}${t.description ? `, Description: ${t.description}` : ''})`
    ).join('\n')}`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please check your OpenAI API credits." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI categorization failed" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const parsed = JSON.parse(aiData.choices[0].message.content);
    
    // Robust parsing to handle various response formats
    let suggestions = [];
    if (Array.isArray(parsed)) {
      suggestions = parsed;
    } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      suggestions = parsed.suggestions;
    } else if (parsed.categories && Array.isArray(parsed.categories)) {
      suggestions = parsed.categories;
    } else {
      console.error('Unexpected AI response format:', parsed);
      return new Response(
        JSON.stringify({ 
          success: false, 
          suggestions: [],
          error: 'AI returned unexpected format' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate we have suggestions
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      console.warn('No valid suggestions returned from AI');
      return new Response(
        JSON.stringify({ 
          success: false, 
          suggestions: [],
          message: 'No valid suggestions returned from AI' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Generated ${suggestions.length} category suggestions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions,
        message: `Successfully categorized ${suggestions.length} tags` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-tag-categories function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
