import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Phase 14e: Memory-safe base64 encoding (32KB chunks)
function chunkedBase64Encode(bytes: Uint8Array): string {
  const chunkSize = 32768;
  let result = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(result);
}

// Smart text chunking at sentence boundaries
function chunkText(text: string, maxChars: number = 4000): string[] {
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

// Phase 14e: Limit chunks to prevent timeout
const MAX_CHUNKS = 10;

// Phase 15: RS256 JWT signing for Google Drive upload
async function createJWT(serviceAccount: any): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Convert PEM private key to ArrayBuffer
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = serviceAccount.private_key
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

// Phase 15: Upload audio to Google Drive
async function uploadAudioToGDrive(
  audioBytes: Uint8Array, 
  fileName: string, 
  serviceAccount: any
): Promise<{ fileId: string; shareUrl: string }> {
  const jwt = await createJWT(serviceAccount);

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Google OAuth failed: ${await tokenResponse.text()}`);
  }

  const { access_token } = await tokenResponse.json();

  // Multipart upload
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
        'Authorization': `Bearer ${access_token}`,
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
      'Authorization': `Bearer ${access_token}`,
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { text, voice = 'onyx', model = 'tts-1', articleSlug, contentHash } = body;

    if (!text) {
      throw new Error('Text is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Check if caching is requested (Phase 15)
    const shouldCache = articleSlug && contentHash;
    const serviceAccountJson = shouldCache ? Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON') : null;

    let chunks = chunkText(text);
    
    // Phase 14e: Guard against very long articles
    if (chunks.length > MAX_CHUNKS) {
      console.warn(`[OpenAI TTS] Article too long (${chunks.length} chunks), truncating to ${MAX_CHUNKS}`);
      chunks = chunks.slice(0, MAX_CHUNKS);
    }
    
    console.log(`[OpenAI TTS] Processing ${chunks.length} chunks with voice: ${voice}, caching: ${shouldCache}`);

    // Collect all audio for caching
    const allAudioChunks: Uint8Array[] = [];

    // Phase 14e: NDJSON streaming (matches client expectation)
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            console.log(`[OpenAI TTS] Generating chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

            const response = await fetch('https://api.openai.com/v1/audio/speech', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model,
                input: chunk,
                voice,
                response_format: 'mp3',
                speed: 1.0,
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('[OpenAI TTS] API error:', errorText);
              throw new Error(`OpenAI TTS error: ${errorText}`);
            }

            // Phase 14e: Memory-safe base64 encoding
            const arrayBuffer = await response.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            allAudioChunks.push(bytes);
            const base64Audio = chunkedBase64Encode(bytes);

            // Phase 14e: NDJSON format (matches client expectation)
            controller.enqueue(
              new TextEncoder().encode(JSON.stringify({ audio: base64Audio }) + '\n')
            );
          }

          // Phase 15: Server-side caching after all chunks complete
          let cacheUrl: string | undefined;
          if (shouldCache && serviceAccountJson && allAudioChunks.length > 0) {
            try {
              console.log('[OpenAI TTS] Caching audio to Google Drive...');
              
              // Combine all audio chunks
              const totalLength = allAudioChunks.reduce((sum, arr) => sum + arr.length, 0);
              const combinedAudio = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of allAudioChunks) {
                combinedAudio.set(chunk, offset);
                offset += chunk.length;
              }

              const serviceAccount = JSON.parse(serviceAccountJson);
              const fileName = `tts-openai-${articleSlug}-${Date.now()}.mp3`;
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
                  provider: 'openai',
                  voice_id: voice,
                  language_code: 'en-US',
                  google_drive_file_id: fileId,
                  google_drive_share_url: shareUrl,
                  content_hash: contentHash,
                  character_count: text.length,
                  cost_usd: text.length * 0.000015,  // OpenAI TTS-1 rate
                  file_size_bytes: combinedAudio.length,
                  updated_at: new Date().toISOString(),
                }, {
                  onConflict: 'article_slug,language_code,provider',
                });

              if (dbError) {
                console.error('[OpenAI TTS] DB cache error:', dbError);
              } else {
                console.log(`[OpenAI TTS] ✅ Cached: ${shareUrl}`);
              }
            } catch (cacheError) {
              console.error('[OpenAI TTS] Caching failed (non-fatal):', cacheError);
            }
          }

          // Phase 14e: Send completion event in NDJSON format
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify({ done: true, cacheUrl }) + '\n')
          );
          controller.close();
        } catch (error) {
          console.error('[OpenAI TTS] Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[OpenAI TTS] Error:', error);
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
