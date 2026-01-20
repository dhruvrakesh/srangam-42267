import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Theme-to-color mapping for consistent branding
const themeColors: Record<string, { primary: string; accent: string; motif: string }> = {
  'Ancient India': { 
    primary: 'saffron orange (#FF9933)', 
    accent: 'deep burgundy (#7B2D26)', 
    motif: 'temple silhouette, lotus pattern' 
  },
  'Indian Ocean World': { 
    primary: 'ocean teal (#2A9D8F)', 
    accent: 'coral gold (#D4A574)', 
    motif: 'wave patterns, dhow ship silhouette' 
  },
  'Scripts & Inscriptions': { 
    primary: 'stone gray (#6B7280)', 
    accent: 'copper brown (#B87333)', 
    motif: 'ancient script fragments, pillar silhouette' 
  },
  'Geology & Deep Time': { 
    primary: 'laterite red (#C84B31)', 
    accent: 'earth brown (#8B4513)', 
    motif: 'rock strata, mountain silhouette' 
  },
  'Empires & Exchange': { 
    primary: 'royal purple (#6B21A8)', 
    accent: 'gold metallic (#D4AF37)', 
    motif: 'coin motifs, caravan silhouette' 
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, title, theme, slug } = await req.json();
    
    console.log(`Generating OG image for: ${title} (theme: ${theme})`);
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const colors = themeColors[theme] || themeColors['Ancient India'];

    // Construct DALL-E 3 prompt
    const prompt = `Create a professional academic Open Graph image (1792x1024 landscape) for a scholarly article about Indian civilization research:

TITLE: "${title}"
THEME: ${theme}

DESIGN REQUIREMENTS:
- Clean, minimalist academic aesthetic with dignified scholarly appearance
- Sacred geometry patterns as subtle background (faded mandala, yantra, or ${colors.motif})
- The article title "${title}" MUST appear clearly readable in large elegant serif font (center or left-aligned)
- Primary color: ${colors.primary}
- Accent color: ${colors.accent}
- Background: warm cream (#F8F5F0) with subtle texture
- NO photographs, NO human faces, NO AI-looking effects
- Professional typography suitable for academic journals
- Subtle dharmic/Indic design elements as decorative borders or corners
- Clear visual hierarchy: title prominent, decorative elements subtle

STYLE: Scholarly, dignified, suitable for sharing on LinkedIn, Twitter, and academic platforms. Think academic journal cover or museum exhibition poster.`;

    console.log('Calling OpenAI DALL-E 3 API...');
    
    // Call OpenAI DALL-E 3
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024', // Landscape for OG (closest to 1.91:1)
        quality: 'standard', // 'hd' for premium, 'standard' for cost efficiency
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DALL-E API error:', errorText);
      throw new Error(`DALL-E API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const base64Image = data.data[0].b64_json;
    const revisedPrompt = data.data[0].revised_prompt;

    console.log('Image generated successfully. Uploading to storage...');
    console.log('Revised prompt:', revisedPrompt?.substring(0, 100) + '...');

    // Decode base64 and upload to Supabase Storage
    const binaryString = atob(base64Image);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const fileName = `articles/${slug || articleId}.png`;

    const { error: uploadError } = await supabase.storage
      .from('og-images')
      .upload(fileName, bytes, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('og-images')
      .getPublicUrl(fileName);

    console.log('Uploaded to:', urlData.publicUrl);

    // Update article with OG image URL
    if (articleId) {
      const { error: updateError } = await supabase
        .from('srangam_articles')
        .update({ og_image_url: urlData.publicUrl })
        .eq('id', articleId);

      if (updateError) {
        console.error('Article update error:', updateError);
        // Don't throw - image was still generated successfully
      } else {
        console.log('Article og_image_url updated');
      }
    }

    console.log(`✅ Generated OG image for: ${title}`);

    return new Response(JSON.stringify({
      success: true,
      url: urlData.publicUrl,
      revisedPrompt,
      cost: '$0.04',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OG generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
