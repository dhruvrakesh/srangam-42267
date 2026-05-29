import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { requireAdmin } from '../_shared/auth-gate.ts';
import {
  loadServiceAccount,
  getDriveAccessToken,
  uploadToDrive,
} from '../_shared/google-drive.ts';

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
    const {
      articleSlug,
      audioData,
      provider,
      voiceId,
      languageCode,
      characterCount,
      contentHash,
    } = await req.json();

    if (!articleSlug || !audioData) {
      throw new Error('Missing required fields');
    }

    // ─── CX.2: shared GDrive helper (was a duplicated JWT/upload block). ───
    const serviceAccount = loadServiceAccount();
    const accessToken = await getDriveAccessToken(serviceAccount);

    const { fileId, shareUrl } = await uploadToDrive({
      accessToken,
      fileName: `${articleSlug}_${languageCode}.mp3`,
      mimeType: 'audio/mpeg',
      body: { kind: 'base64', data: audioData },
    });

    // Approximate decoded size from base64 length (avoids re-decoding the buffer here).
    const decodedSize = Math.floor((audioData.length * 3) / 4);

    console.log('Successfully uploaded TTS audio to Google Drive:', {
      articleSlug,
      languageCode,
      fileId,
      size: decodedSize,
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase
      .from('srangam_audio_narrations')
      .upsert({
        article_slug: articleSlug,
        provider,
        voice_id: voiceId,
        language_code: languageCode,
        google_drive_file_id: fileId,
        google_drive_share_url: shareUrl,
        file_size_bytes: decodedSize,
        character_count: characterCount,
        content_hash: contentHash,
        cost_usd:
          provider === 'google-cloud'
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
      JSON.stringify({ success: true, fileId, shareUrl, metadata: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Save to Drive error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
