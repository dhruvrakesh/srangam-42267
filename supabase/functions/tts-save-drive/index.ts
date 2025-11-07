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
    const { 
      articleSlug, 
      audioData, 
      provider, 
      voiceId, 
      languageCode,
      characterCount,
      contentHash 
    } = await req.json();

    if (!articleSlug || !audioData) {
      throw new Error('Missing required fields');
    }

    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      throw new Error('Google service account not configured');
    }

    // Convert base64 audio to buffer
    const binaryAudio = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    const blob = new Blob([binaryAudio], { type: 'audio/mpeg' });

    // Upload to Google Drive
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // For simplicity, using direct API call
    // In production, use proper OAuth2 flow with googleapis package
    const metadata = {
      name: `${articleSlug}_${languageCode}.mp3`,
      mimeType: 'audio/mpeg',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    // Note: This is a simplified version
    // In production, implement proper Google Drive API integration
    console.log('Would upload to Google Drive:', {
      articleSlug,
      languageCode,
      size: binaryAudio.length,
    });

    // For now, simulate successful upload
    const mockFileId = `file_${Date.now()}`;
    const mockShareUrl = `https://drive.google.com/file/d/${mockFileId}/view`;

    // Save metadata to Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('srangam_audio_narrations')
      .upsert({
        article_slug: articleSlug,
        provider,
        voice_id: voiceId,
        language_code: languageCode,
        google_drive_file_id: mockFileId,
        google_drive_share_url: mockShareUrl,
        file_size_bytes: binaryAudio.length,
        character_count: characterCount,
        content_hash: contentHash,
        cost_usd: provider === 'google-cloud' 
          ? characterCount * 0.000044 
          : characterCount * 0.00001,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        fileId: mockFileId,
        shareUrl: mockShareUrl,
        metadata: data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Save to Drive error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
