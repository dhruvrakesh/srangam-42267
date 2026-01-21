import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Phase 14d: Chunked base64 encoding to prevent memory spikes
// Process in 32KB segments to avoid "Memory limit exceeded"
function chunkedBase64Encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 32768; // 32KB chunks
  let result = '';
  
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
    result += btoa(String.fromCharCode(...chunk));
  }
  
  return result;
}

// Smart text chunking at sentence boundaries
// Phase 14c: Increased to 7500 chars to reduce API calls
function chunkText(text: string, maxChars: number = 7500): string[] {
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

// Phase 14d: Reduced to 8 chunks to prevent memory crash
// ~60,000 characters max (~15-18 min audio)
const MAX_CHUNKS = 8;

// Map voice names to ElevenLabs voice IDs
const voiceIdMap: Record<string, string> = {
  'george': 'JBFqnCBsd6RMkjVDRZzb',
  'daniel': 'onwK4e9ZLuTAKqWW03F9',
  'brian': 'nPczCjzI2devNBz1zQrb',
  'alice': 'Xb7hH8MSUJpSbSDYk0k2',
  'matilda': 'XrExE9yKIg1WjnnlVkGX',
  'roger': 'CwhRBWXzGAHq8TQ4Fs17',
  'sarah': 'EXAVITQu4vr4xnSDxMaL',
  'charlie': 'IKne3meq5aSn9XLyUdCD',
  'liam': 'TX3LPaxmHKxFdv7VOQHJ',
  'jessica': 'cgSgspJ2msm6clMCkdW9',
  'chris': 'iP95p4xoKVk53GoZ742B',
  'lily': 'pFZP5JQG7iQjIQuC4Bku',
};

// Phase 15.1: JWT creation for Google Drive authentication
async function createJWT(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const claimB64 = btoa(JSON.stringify(claim)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${headerB64}.${claimB64}`;

  // Import the private key
  const pemContents = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${unsignedToken}.${signatureB64}`;
}

// Phase 15.1: Upload audio to Google Drive and return share URL
async function uploadAudioToGDrive(
  audioBytes: Uint8Array,
  fileName: string,
  serviceAccount: { client_email: string; private_key: string }
): Promise<{ fileId: string; shareUrl: string }> {
  // Get access token
  const jwt = await createJWT(serviceAccount);
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${tokenResponse.status}`);
  }

  const { access_token } = await tokenResponse.json();
  const folderId = Deno.env.get('GDRIVE_AUDIO_FOLDER_ID') || '1FHKTfDLqNTq1wCzpmjDxN6Xz4IZoTGxt';

  // Upload file
  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'audio/mpeg',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody = new Uint8Array([
    ...new TextEncoder().encode(
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: audio/mpeg\r\n\r\n'
    ),
    ...audioBytes,
    ...new TextEncoder().encode(closeDelimiter),
  ]);

  const uploadResponse = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
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
    throw new Error(`Failed to upload to GDrive: ${uploadResponse.status}`);
  }

  const { id: fileId } = await uploadResponse.json();

  // Make file publicly accessible
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });

  const shareUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  console.log(`[tts-stream-elevenlabs] Audio uploaded to GDrive: ${fileId}`);

  return { fileId, shareUrl };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'george', speed = 1.0, articleSlug, contentHash } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY not configured');
      throw new Error('ElevenLabs API key not configured');
    }

    // Resolve voice ID from name or use as-is if already an ID
    const voiceId = voiceIdMap[voice.toLowerCase()] || voice;
    
    let chunks = chunkText(text);
    console.log(`[tts-stream-elevenlabs] Processing ${chunks.length} chunks (article: ${articleSlug || 'unknown'})`);
    
    // Phase 14c: Truncate very long articles to prevent CPU timeout
    if (chunks.length > MAX_CHUNKS) {
      console.warn(`[tts-stream-elevenlabs] Article too long (${chunks.length} chunks), truncating to ${MAX_CHUNKS}`);
      chunks = chunks.slice(0, MAX_CHUNKS);
    }

    // Phase 15.1: Collect all audio for server-side caching
    const allAudioChunks: Uint8Array[] = [];
    const shouldCache = articleSlug && contentHash;

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(`Generating ElevenLabs TTS for chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

            const response = await fetch(
              `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
              {
                method: 'POST',
                headers: {
                  'xi-api-key': ELEVENLABS_API_KEY,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  text: chunk,
                  model_id: 'eleven_turbo_v2_5', // Low latency, high quality
                  voice_settings: {
                    stability: 0.6,
                    similarity_boost: 0.75,
                    style: 0.3,
                    use_speaker_boost: true,
                    speed: speed,
                  },
                  // Request stitching for multi-chunk: provide context from adjacent chunks
                  ...(i > 0 && { previous_text: chunks[i - 1].slice(-200) }),
                  ...(i < chunks.length - 1 && { next_text: chunks[i + 1].slice(0, 200) }),
                }),
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`ElevenLabs API error (chunk ${i + 1}):`, errorText);
              
              // Phase 14: Structured 401/403 error response for client-side fallback
              if (response.status === 401 || response.status === 403) {
                console.warn(`ElevenLabs auth blocked (${response.status}), signaling fallback`);
                controller.enqueue(
                  new TextEncoder().encode(JSON.stringify({
                    error: 'auth_blocked',
                    status: response.status,
                    fallback_provider: 'google-cloud',
                    message: 'ElevenLabs authentication failed - use fallback provider'
                  }) + '\n')
                );
                controller.close();
                return;
              }
              
              throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
            }

            // Phase 14d: Get audio buffer and encode to base64 in chunks to prevent memory spike
            const audioBuffer = await response.arrayBuffer();
            const audioBytes = new Uint8Array(audioBuffer);
            
            // Phase 15.1: Collect for caching
            if (shouldCache) {
              allAudioChunks.push(audioBytes);
            }
            
            console.log(`[tts-stream-elevenlabs] Encoding ${audioBuffer.byteLength} bytes for chunk ${i + 1}`);
            const base64Audio = chunkedBase64Encode(audioBuffer);
            
            // Send audio chunk as NDJSON (matches Google TTS format for client compatibility)
            controller.enqueue(
              new TextEncoder().encode(JSON.stringify({ audio: base64Audio }) + '\n')
            );
          }

          // Phase 15.1: Server-side caching after all chunks generated
          let cacheUrl: string | undefined;
          if (shouldCache && allAudioChunks.length > 0) {
            try {
              const serviceAccountJson = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT');
              if (serviceAccountJson) {
                const serviceAccount = JSON.parse(serviceAccountJson);
                
                // Combine all audio chunks
                const totalLength = allAudioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
                const combinedAudio = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of allAudioChunks) {
                  combinedAudio.set(chunk, offset);
                  offset += chunk.length;
                }

                console.log(`[tts-stream-elevenlabs] Uploading ${combinedAudio.length} bytes to GDrive for caching`);
                
                const fileName = `elevenlabs_${articleSlug}_${Date.now()}.mp3`;
                const { fileId, shareUrl } = await uploadAudioToGDrive(combinedAudio, fileName, serviceAccount);
                cacheUrl = shareUrl;

                // Write to database using service role (bypasses RLS)
                const supabase = createClient(
                  Deno.env.get('SUPABASE_URL')!,
                  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
                );

                const { error: dbError } = await supabase
                  .from('srangam_audio_narrations')
                  .upsert({
                    article_slug: articleSlug,
                    provider: 'elevenlabs',
                    voice_id: voice,
                    language_code: 'en-US',
                    google_drive_file_id: fileId,
                    google_drive_share_url: shareUrl,
                    content_hash: contentHash,
                    character_count: text.length,
                    file_size_bytes: combinedAudio.length,
                    cost_usd: (text.length / 1000) * 0.18, // ElevenLabs ~$0.18/1k chars
                  }, { onConflict: 'article_slug,voice_id,language_code' });

                if (dbError) {
                  console.error('[tts-stream-elevenlabs] Failed to save cache metadata:', dbError);
                } else {
                  console.log(`[tts-stream-elevenlabs] Audio cached successfully: ${fileId}`);
                }
              }
            } catch (cacheError) {
              console.error('[tts-stream-elevenlabs] Caching failed (non-fatal):', cacheError);
              // Continue - caching failure shouldn't break playback
            }
          }

          // Send completion event with optional cache URL
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify({ done: true, ...(cacheUrl && { cacheUrl }) }) + '\n')
          );
          controller.close();
          console.log('ElevenLabs TTS stream completed successfully');
        } catch (error) {
          console.error('Streaming error:', error);
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
    console.error('ElevenLabs TTS stream error:', error);
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
