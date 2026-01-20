import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Smart text chunking at sentence boundaries
// Phase 14c: Increased to 7500 chars to reduce API calls and prevent CPU timeout
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

// Maximum chunks to prevent CPU timeout on very long articles
const MAX_CHUNKS = 12; // ~90,000 characters max (~20-25 min audio)

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'george', speed = 1.0, articleSlug } = await req.json();

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

            // Get audio buffer and encode to base64
            const audioBuffer = await response.arrayBuffer();
            const base64Audio = base64Encode(audioBuffer);
            
            // Send audio chunk as NDJSON (matches Google TTS format for client compatibility)
            controller.enqueue(
              new TextEncoder().encode(JSON.stringify({ audio: base64Audio }) + '\n')
            );
          }

          // Send completion event
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify({ done: true }) + '\n')
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
