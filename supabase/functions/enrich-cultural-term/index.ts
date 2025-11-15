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
    let parsedContent = JSON.parse(aiData.choices[0].message.content);

    // ✅ HANDLE ARRAY RESPONSES (when AI processes multiple terms together)
    let enrichedContent = parsedContent;
    if (Array.isArray(parsedContent)) {
      console.log(`⚠️ AI returned array of ${parsedContent.length} terms, extracting first one`);
      enrichedContent = parsedContent[0];
    }

    // ✅ VALIDATE the AI response structure
    if (!enrichedContent || !enrichedContent.translations || !enrichedContent.translations.en) {
      console.error(`❌ Invalid AI response structure for term: ${term}`, JSON.stringify(enrichedContent, null, 2));
      return new Response(
        JSON.stringify({ 
          error: "AI returned incomplete data structure", 
          term: term,
          displayTerm: displayTerm,
          received: parsedContent 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ VALIDATE required English fields
    const enTranslation = enrichedContent.translations.en;
    if (!enTranslation.translation || !enTranslation.transliteration || !enTranslation.etymology || !enTranslation.culturalContext) {
      console.error(`❌ Missing required English translation fields for term: ${term}`, JSON.stringify(enTranslation, null, 2));
      return new Response(
        JSON.stringify({ 
          error: "AI returned incomplete English translation", 
          term: term,
          displayTerm: displayTerm,
          received: enTranslation 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ AI enrichment validated successfully for: ${term}`);

    // Update the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ✅ Update database with safe defaults and optional chaining
    const { data: updateData, error: updateError } = await supabase
      .from('srangam_cultural_terms')
      .update({
        translations: enrichedContent.translations,
        transliteration: enrichedContent.translations.en?.transliteration || term,
        etymology: {
          en: enrichedContent.translations.en?.etymology || null,
          hi: enrichedContent.translations.hi?.etymology || null,
          ta: enrichedContent.translations.ta?.etymology || null,
          te: enrichedContent.translations.te?.etymology || null,
          ml: enrichedContent.translations.ml?.etymology || null,
          kn: enrichedContent.translations.kn?.etymology || null,
          bn: enrichedContent.translations.bn?.etymology || null,
          gu: enrichedContent.translations.gu?.etymology || null,
          mr: enrichedContent.translations.mr?.etymology || null
        },
        context: {
          en: enrichedContent.translations.en?.culturalContext || null,
          hi: enrichedContent.translations.hi?.culturalContext || null,
          ta: enrichedContent.translations.ta?.culturalContext || null,
          te: enrichedContent.translations.te?.culturalContext || null,
          ml: enrichedContent.translations.ml?.culturalContext || null,
          kn: enrichedContent.translations.kn?.culturalContext || null,
          bn: enrichedContent.translations.bn?.culturalContext || null,
          gu: enrichedContent.translations.gu?.culturalContext || null,
          mr: enrichedContent.translations.mr?.culturalContext || null
        },
        module: enrichedContent.module || "philosophy-religion",
        synonyms: enrichedContent.synonyms || [],
        related_terms: enrichedContent.relatedTerms || []
      })
      .eq('id', termId)
      .select();

    if (updateError) {
      console.error(`❌ Database update error for term: ${term}`, updateError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to update database", 
          term: term,
          displayTerm: displayTerm,
          details: updateError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Successfully enriched term: ${displayTerm || term}`);

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
