import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Smart text chunking at sentence boundaries (max 5000 chars for ElevenLabs)
function chunkText(text: string, maxChars: number = 4500): string[] {
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
    
    const chunks = chunkText(text);
    console.log(`Processing ${chunks.length} chunks for ElevenLabs TTS (article: ${articleSlug || 'unknown'})`);

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
