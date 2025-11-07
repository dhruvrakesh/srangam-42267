import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'alloy', model = 'tts-1' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const chunks = chunkText(text);
    console.log(`Processing ${chunks.length} chunks with OpenAI TTS`);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            console.log(`Generating OpenAI TTS for chunk ${i + 1}/${chunks.length}`);

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
              console.error('OpenAI TTS error:', errorText);
              throw new Error(`OpenAI TTS error: ${errorText}`);
            }

            // Convert response to base64
            const arrayBuffer = await response.arrayBuffer();
            const base64Audio = btoa(
              String.fromCharCode(...new Uint8Array(arrayBuffer))
            );

            // Send audio chunk as SSE
            const event = {
              type: 'audio.delta',
              delta: base64Audio,
              index: i,
              total: chunks.length,
            };
            
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          }

          // Send completion event
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ type: 'audio.done' })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('TTS stream error:', error);
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
