import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'onyx', model = 'tts-1' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    let chunks = chunkText(text);
    
    // Phase 14e: Guard against very long articles
    if (chunks.length > MAX_CHUNKS) {
      console.warn(`[OpenAI TTS] Article too long (${chunks.length} chunks), truncating to ${MAX_CHUNKS}`);
      chunks = chunks.slice(0, MAX_CHUNKS);
    }
    
    console.log(`[OpenAI TTS] Processing ${chunks.length} chunks with voice: ${voice}`);

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
            const base64Audio = chunkedBase64Encode(bytes);

            // Phase 14e: NDJSON format (matches client expectation)
            controller.enqueue(
              new TextEncoder().encode(JSON.stringify({ audio: base64Audio }) + '\n')
            );
          }

          // Phase 14e: Send completion event in NDJSON format
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify({ done: true }) + '\n')
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
