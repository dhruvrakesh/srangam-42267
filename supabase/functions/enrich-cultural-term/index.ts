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
    const { termId, term, displayTerm } = await req.json();

    if (!termId || !term) {
      return new Response(
        JSON.stringify({ error: 'Term ID and term are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Enriching term: ${term} (${displayTerm})`);

    const enrichmentPrompt = `You are a Sanskrit and Indic cultural expert. Enrich this cultural term with complete multilingual translations and scholarly context.

Term: "${term}"
Display: "${displayTerm || term}"

Provide comprehensive enrichment following these guidelines:
1. Translations must be accurate and culturally appropriate
2. Use scholarly transliteration (IAST for Sanskrit)
3. Etymology should trace word origins
4. Cultural context should be informative and respectful
5. Module categorization should reflect the term's primary domain

Respond with a JSON object with this exact structure:
{
  "translations": {
    "en": {
      "translation": "English translation",
      "transliteration": "IAST transliteration",
      "etymology": "Root word analysis and meaning",
      "culturalContext": "Detailed 100-200 word explanation of cultural significance"
    },
    "hi": { "translation": "Hindi translation", "transliteration": "Devanagari/romanization", "etymology": "Etymology in Hindi", "culturalContext": "Cultural context in Hindi" },
    "ta": { "translation": "Tamil translation", "transliteration": "Tamil romanization", "etymology": "Etymology in Tamil", "culturalContext": "Cultural context in Tamil" },
    "te": { "translation": "Telugu translation", "transliteration": "Telugu romanization", "etymology": "Etymology in Telugu", "culturalContext": "Cultural context in Telugu" },
    "ml": { "translation": "Malayalam translation", "transliteration": "Malayalam romanization", "etymology": "Etymology in Malayalam", "culturalContext": "Cultural context in Malayalam" },
    "kn": { "translation": "Kannada translation", "transliteration": "Kannada romanization", "etymology": "Etymology in Kannada", "culturalContext": "Cultural context in Kannada" },
    "bn": { "translation": "Bengali translation", "transliteration": "Bengali romanization", "etymology": "Etymology in Bengali", "culturalContext": "Cultural context in Bengali" },
    "gu": { "translation": "Gujarati translation", "transliteration": "Gujarati romanization", "etymology": "Etymology in Gujarati", "culturalContext": "Cultural context in Gujarati" },
    "mr": { "translation": "Marathi translation", "transliteration": "Marathi romanization", "etymology": "Etymology in Marathi", "culturalContext": "Cultural context in Marathi" }
  },
  "module": "vedic-puranic OR geography-cosmology OR philosophy-religion OR social-political OR dynasties-rulers",
  "synonyms": ["synonym1", "synonym2"],
  "relatedTerms": ["related1", "related2"]
}`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a Sanskrit and Indic cultural expert. Always respond with valid JSON only." },
          { role: "user", content: enrichmentPrompt }
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
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI enrichment failed" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const enrichedContent = JSON.parse(aiData.choices[0].message.content);

    console.log("AI enrichment successful, updating database...");

    // Update the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: updateData, error: updateError } = await supabase
      .from('srangam_cultural_terms')
      .update({
        translations: enrichedContent.translations,
        transliteration: enrichedContent.translations.en.transliteration,
        etymology: {
          en: enrichedContent.translations.en.etymology,
          hi: enrichedContent.translations.hi?.etymology,
          ta: enrichedContent.translations.ta?.etymology,
          te: enrichedContent.translations.te?.etymology,
          ml: enrichedContent.translations.ml?.etymology,
          kn: enrichedContent.translations.kn?.etymology,
          bn: enrichedContent.translations.bn?.etymology,
          gu: enrichedContent.translations.gu?.etymology,
          mr: enrichedContent.translations.mr?.etymology
        },
        context: {
          en: enrichedContent.translations.en.culturalContext,
          hi: enrichedContent.translations.hi?.culturalContext,
          ta: enrichedContent.translations.ta?.culturalContext,
          te: enrichedContent.translations.te?.culturalContext,
          ml: enrichedContent.translations.ml?.culturalContext,
          kn: enrichedContent.translations.kn?.culturalContext,
          bn: enrichedContent.translations.bn?.culturalContext,
          gu: enrichedContent.translations.gu?.culturalContext,
          mr: enrichedContent.translations.mr?.culturalContext
        },
        module: enrichedContent.module,
        synonyms: enrichedContent.synonyms || [],
        related_terms: enrichedContent.relatedTerms || []
      })
      .eq('id', termId)
      .select();

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update database", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully enriched term: ${term}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        enrichedTerm: updateData[0],
        message: `Successfully enriched "${displayTerm || term}"` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enrich-cultural-term function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
