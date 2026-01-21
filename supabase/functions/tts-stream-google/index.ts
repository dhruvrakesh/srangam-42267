import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Phase 14e: Simplified SSML to prevent byte-limit issues (5000 byte max)
function buildSSML(text: string, language: string): string {
  return `<speak><lang xml:lang="${language}">${text}</lang></speak>`;
}

// Map ISO 639-1 codes to Google TTS locale codes
function mapLanguageCode(lang: string): string {
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'kn': 'kn-IN',
    'bn': 'bn-IN',
    'as': 'as-IN',
    'pa': 'pa-IN',
    'pn': 'en-IN',
  };
  
  if (lang.includes('-')) return lang;
  return languageMap[lang] || 'en-US';
}

// Smart text chunking at sentence boundaries (1500 chars for SSML safety)
function chunkText(text: string, maxChars: number = 1500): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Memory-safe base64 encoding (32KB chunks)
function chunkedBase64Encode(bytes: Uint8Array): string {
  const chunkSize = 32768;
  let result = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(result);
}

// Convert PEM format private key to ArrayBuffer
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = pem
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\\n/g, '')
    .replace(/\s/g, '');
  
  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}

// JWT signing helper
async function createJWT(serviceAccount: any, scope: string): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const privateKeyBuffer = pemToArrayBuffer(serviceAccount.private_key);
  const key = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
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

// Get Google Cloud access token
async function getGoogleAccessToken(serviceAccount: any, scope: string): Promise<string> {
  const jwt = await createJWT(serviceAccount, scope);
  
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Phase 15: Upload audio to Google Drive
async function uploadAudioToGDrive(
  audioBytes: Uint8Array, 
  fileName: string, 
  serviceAccount: any
): Promise<{ fileId: string; shareUrl: string }> {
  const accessToken = await getGoogleAccessToken(serviceAccount, 'https://www.googleapis.com/auth/drive.file');

  const metadata = {
    name: fileName,
    mimeType: 'audio/mpeg',
    parents: ['0AHOa_eCfO3arUk9PVA'], // Srangam Shared Drive
  };

  const base64Audio = chunkedBase64Encode(audioBytes);
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
    base64Audio +
    closeDelimiter;

  const uploadResponse = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!uploadResponse.ok) {
    throw new Error(`GDrive upload failed: ${await uploadResponse.text()}`);
  }

  const driveFile = await uploadResponse.json();
  const fileId = driveFile.id;

  // Make file publicly accessible
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });

  const shareUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  return { fileId, shareUrl };
}

serve(async (req) => {
  console.log('[tts-stream-google] Request received');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { text, language = 'en-US', voice = 'en-US-Neural2-J', articleSlug, contentHash } = body;
    
    console.log('[tts-stream-google] Config:', { 
      language, 
      voice, 
      textLength: text?.length,
      articleSlug,
      caching: !!(articleSlug && contentHash)
    });

    if (!text) {
      throw new Error('Text is required');
    }

    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');
    }
    const serviceAccount = JSON.parse(serviceAccountJson);

    const chunks = chunkText(text);
    const shouldCache = articleSlug && contentHash;
    console.log(`[tts-stream-google] Processing ${chunks.length} chunks for article: ${articleSlug}`);

    // Collect all audio for caching
    const allAudioChunks: Uint8Array[] = [];

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const mappedLanguage = mapLanguageCode(language);
            const ssml = buildSSML(chunk, mappedLanguage);

            // Check SSML byte size
            const ssmlBytes = new TextEncoder().encode(ssml).length;
            console.log(`[tts-stream-google] Chunk ${i + 1}/${chunks.length}: ${chunk.length} chars, ${ssmlBytes} SSML bytes`);

            // Get access token for TTS
            const accessToken = await getGoogleAccessToken(serviceAccount, 'https://www.googleapis.com/auth/cloud-platform');
            
            // Determine input type based on SSML size
            const inputPayload = ssmlBytes > 4500 
              ? { text: chunk }  // Fallback to plain text
              : { ssml };

            const response = await fetch(
              'https://texttospeech.googleapis.com/v1/text:synthesize',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  input: inputPayload,
                  voice: { languageCode: mappedLanguage, name: voice },
                  audioConfig: { 
                    audioEncoding: 'MP3',
                    speakingRate: 1.0,
                    pitch: 0.0,
                  },
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Google Cloud TTS error: ${await response.text()}`);
            }

            const result = await response.json();
            
            // Decode base64 for caching
            if (shouldCache && result.audioContent) {
              const binaryString = atob(result.audioContent);
              const bytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }
              allAudioChunks.push(bytes);
            }
            
            // Send audio chunk as NDJSON
            controller.enqueue(
              new TextEncoder().encode(JSON.stringify({ audio: result.audioContent }) + '\n')
            );
          }

          // Phase 15: Server-side caching after all chunks complete
          let cacheUrl: string | undefined;
          if (shouldCache && allAudioChunks.length > 0) {
            try {
              console.log('[tts-stream-google] Caching audio to Google Drive...');
              
              // Combine all audio chunks
              const totalLength = allAudioChunks.reduce((sum, arr) => sum + arr.length, 0);
              const combinedAudio = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of allAudioChunks) {
                combinedAudio.set(chunk, offset);
                offset += chunk.length;
              }

              const fileName = `tts-google-${articleSlug}-${Date.now()}.mp3`;
              const { fileId, shareUrl } = await uploadAudioToGDrive(combinedAudio, fileName, serviceAccount);
              cacheUrl = shareUrl;

              // Save metadata to database using service role (bypasses RLS)
              const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
              const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
              const supabase = createClient(supabaseUrl, supabaseServiceKey);

              const { error: dbError } = await supabase
                .from('srangam_audio_narrations')
                .upsert({
                  article_slug: articleSlug,
                  provider: 'google-cloud',
                  voice_id: voice,
                  language_code: mapLanguageCode(language),
                  google_drive_file_id: fileId,
                  google_drive_share_url: shareUrl,
                  content_hash: contentHash,
                  character_count: text.length,
                  cost_usd: text.length * 0.000016,  // Google Neural2 rate
                  file_size_bytes: combinedAudio.length,
                  updated_at: new Date().toISOString(),
                }, {
                  onConflict: 'article_slug,language_code,provider',
                });

              if (dbError) {
                console.error('[tts-stream-google] DB cache error:', dbError);
              } else {
                console.log(`[tts-stream-google] ✅ Cached: ${shareUrl}`);
              }
            } catch (cacheError) {
              console.error('[tts-stream-google] Caching failed (non-fatal):', cacheError);
            }
          }

          // Send completion event
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify({ done: true, cacheUrl }) + '\n')
          );
          controller.close();
        } catch (error) {
          console.error('[tts-stream-google] Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[tts-stream-google] Error:', error);
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
