import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PuranaReference {
  purana_name: string;
  purana_category: string;
  kanda?: string;
  adhyaya?: string;
  shloka_start?: number;
  shloka_end?: number;
  reference_text: string;
  context_snippet: string;
  claim_made: string;
  confidence_score: number;
  is_primary_source: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { article_id, batch_mode = false } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch article(s)
    let articles: any[] = [];
    if (batch_mode) {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('id, slug, content, title')
        .eq('status', 'published');
      
      if (error) throw error;
      articles = data || [];
    } else {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('id, slug, content, title')
        .eq('id', article_id)
        .single();
      
      if (error) throw error;
      articles = [data];
    }

    const results = [];

    for (const article of articles) {
      console.log(`Processing article: ${article.slug}`);

      // Extract text content - handle both HTML and JSON structures
      let textContent = '';
      
      // Check if content is stored as HTML string (from markdown imports)
      if (typeof article.content?.en === 'string') {
        console.log(`📄 Detected HTML content for ${article.slug}`);
        // Strip HTML tags and decode entities for text analysis
        textContent = article.content.en
          .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
          .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove styles
          .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        console.log(`✓ Extracted ${textContent.length} characters from HTML`);
      }
      // Legacy JSON structure support
      else if (article.content?.en?.sections) {
        console.log(`📋 Detected JSON sections for ${article.slug}`);
        for (const section of article.content.en.sections) {
          if (section.heading) textContent += section.heading + '\n\n';
          if (section.content) textContent += section.content + '\n\n';
        }
        console.log(`✓ Extracted ${textContent.length} characters from JSON sections`);
      }
      
      // Validate we have content to process
      if (!textContent || textContent.length < 100) {
        console.log(`⚠️ Insufficient text content for ${article.slug} (${textContent.length} chars), skipping`);
        results.push({
          article_id: article.id,
          article_slug: article.slug,
          extracted_count: 0,
          high_confidence_count: 0,
          references: [],
        });
        continue;
      }

      // Split into paragraphs for context extraction
      const paragraphs = textContent.split('\n\n').filter(p => p.trim().length > 50);

      const extractedRefs: PuranaReference[] = [];

      // Process in chunks to avoid rate limits
      for (let i = 0; i < paragraphs.length; i += 3) {
        const chunk = paragraphs.slice(i, i + 3).join('\n\n');

        const prompt = `Analyze this text and extract ALL Puranic/Vedic/Itihasa citations with precise details.

TEXT:
${chunk}

Extract references in this JSON format:
{
  "references": [
    {
      "purana_name": "Exact name (e.g., Matsya Purana, Rigveda, Mahabharata)",
      "purana_category": "Mahapurana|Upapurana|Itihasa|Veda|Agama|Other",
      "kanda": "Book/Kanda name if mentioned",
      "adhyaya": "Chapter/Adhyaya number if mentioned",
      "shloka_start": "Starting verse number (integer only)",
      "shloka_end": "Ending verse number if range (integer only)",
      "reference_text": "Exact citation as written (e.g., '114.10-44')",
      "context_snippet": "2-3 sentences surrounding the citation",
      "claim_made": "What historical/geographical/theological claim this citation supports",
      "confidence_score": "0.00-1.00 based on citation explicitness",
      "is_primary_source": "true if citing original text, false if secondary"
    }
  ]
}

CONFIDENCE SCORING RULES:
- 1.00: Exact verse citation (e.g., "Matsya Purāṇa 114.10-44")
- 0.90: Chapter + verse range (e.g., "Rigveda 10.75.5-6")
- 0.80: Chapter only (e.g., "Mahabharata, Sabha Parva, Chapter 28")
- 0.70: Named text without specifics (e.g., "according to the Matsya Purana")
- 0.60: Vague reference (e.g., "Puranic tradition")
- 0.50: Generic mention (e.g., "ancient texts")

CATEGORY MAPPING:
- Mahapurana: 18 Mahā-Purāṇas (Matsya, Vishnu, Bhagavata, etc.)
- Upapurana: 18 Upa-Purāṇas
- Itihasa: Mahabharata, Ramayana
- Veda: Rigveda, Samaveda, Yajurveda, Atharvaveda + Brahmanas/Aranyakas
- Agama: Shaiva/Vaishnava Agamas, Tantras
- Other: Dharmashastra, Kavya, Kosha, etc.

Return ONLY valid JSON. If no references found, return {"references": []}`;

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a Sanskrit scholar specialized in Puranic literature citation extraction. Extract citations with precision and academic rigor.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            response_format: { type: "json_object" }
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI API error: ${aiResponse.status}`);
          continue;
        }

        const aiData = await aiResponse.json();
        const responseText = aiData.choices[0].message.content;

        // Parse JSON response
        try {
          const parsed = JSON.parse(responseText);
          if (parsed.references && Array.isArray(parsed.references)) {
            extractedRefs.push(...parsed.references);
          }
        } catch (e) {
          console.error('Failed to parse AI response:', e);
          console.error('Response text:', responseText);
        }

        // Rate limiting: 500ms delay between chunks
        if (i + 3 < paragraphs.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Deduplicate references
      const uniqueRefs = extractedRefs.filter((ref, index, self) =>
        index === self.findIndex(r =>
          r.purana_name === ref.purana_name &&
          r.reference_text === ref.reference_text &&
          r.adhyaya === ref.adhyaya
        )
      );

      // Insert into database
      const refsToInsert = uniqueRefs.map(ref => ({
        article_id: article.id,
        purana_name: ref.purana_name,
        purana_category: ref.purana_category || 'Other',
        kanda: ref.kanda || null,
        adhyaya: ref.adhyaya || null,
        shloka_start: ref.shloka_start || null,
        shloka_end: ref.shloka_end || null,
        reference_text: ref.reference_text,
        context_snippet: ref.context_snippet?.substring(0, 500) || '',
        claim_made: ref.claim_made?.substring(0, 500) || '',
        confidence_score: Math.min(1.0, Math.max(0.0, ref.confidence_score || 0.5)),
        is_primary_source: ref.is_primary_source ?? true,
        extraction_method: 'ai',
        validation_status: ref.confidence_score >= 0.8 ? 'verified' : 'pending',
      }));

      if (refsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('srangam_purana_references')
          .insert(refsToInsert);

        if (insertError) {
          console.error('Insert error:', insertError);
        }
      }

      results.push({
        article_id: article.id,
        article_slug: article.slug,
        extracted_count: uniqueRefs.length,
        high_confidence_count: uniqueRefs.filter(r => r.confidence_score >= 0.8).length,
        references: uniqueRefs,
      });

      console.log(`Completed ${article.slug}: ${uniqueRefs.length} references extracted`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed_articles: articles.length,
        total_references: results.reduce((sum, r) => sum + r.extracted_count, 0),
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in extract-purana-references:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
