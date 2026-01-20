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

    // Parse service account credentials
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Proper RS256 JWT signing (copied from working tts-stream-google function)
    async function createJWT(sa: any): Promise<string> {
      const header = { alg: 'RS256', typ: 'JWT' };
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/drive.file',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
      };

      const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const unsignedToken = `${encodedHeader}.${encodedPayload}`;

      // Convert PEM private key to ArrayBuffer for crypto.subtle
      const pemHeader = '-----BEGIN PRIVATE KEY-----';
      const pemFooter = '-----END PRIVATE KEY-----';
      const pemContents = sa.private_key
        .replace(pemHeader, '')
        .replace(pemFooter, '')
        .replace(/\\n/g, '')
        .replace(/\s/g, '');
      
      const binaryString = atob(pemContents);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const key = await crypto.subtle.importKey(
        'pkcs8',
        bytes.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        new TextEncoder().encode(unsignedToken)
      );

      const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      return `${unsignedToken}.${encodedSignature}`;
    }

    const jwt = await createJWT(serviceAccount);
    console.log('JWT created successfully for Google Drive authentication');
    
    const accessTokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!accessTokenResponse.ok) {
      const errorText = await accessTokenResponse.text();
      console.error('OAuth2 token error:', errorText);
      throw new Error(`Failed to authenticate with Google Drive: ${errorText}`);
    }

    const { access_token } = await accessTokenResponse.json();
    console.log('Google OAuth2 access token obtained successfully');

    // Upload to Google Drive using multipart upload
    const metadata = {
      name: `${articleSlug}_${languageCode}.mp3`,
      mimeType: 'audio/mpeg',
      parents: ['0AHOa_eCfO3arUk9PVA'], // Srangam Shared Drive
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartBody = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: audio/mpeg\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      audioData +
      closeDelimiter;

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      }
    );

    if (!uploadResponse.ok) {
      console.error('Drive upload error:', await uploadResponse.text());
      throw new Error('Failed to upload to Google Drive');
    }

    const driveFile = await uploadResponse.json();
    const fileId = driveFile.id;

    // Make file shareable (anyone with link can view)
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });

    const shareUrl = `https://drive.google.com/file/d/${fileId}/view`;
    
    console.log('Successfully uploaded to Google Drive:', {
      articleSlug,
      languageCode,
      fileId,
      size: binaryAudio.length,
    });

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
        google_drive_file_id: fileId,
        google_drive_share_url: shareUrl,
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
        fileId,
        shareUrl,
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
