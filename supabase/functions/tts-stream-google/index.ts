import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Build SSML with Sanskrit diacritics support
function buildSSML(text: string, language: string): string {
  // Enhanced SSML for Sanskrit/IAST diacritics
  const ssmlWrapped = `
    <speak>
      <lang xml:lang="${language}">
        ${text.replace(/([ĀāĪīŪūṚṛṜṝḶḷḸḹṂṃṄṅṆṇŅṇŚśṢṣṬṭḌḍÑñ])/g, (match) => {
          // Add prosody for diacritical marks
          return `<prosody rate="95%">${match}</prosody>`;
        })}
      </lang>
    </speak>
  `.trim();
  
  return ssmlWrapped;
}

// Smart text chunking at sentence boundaries
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

// Get Google Cloud access token
async function getGoogleAccessToken(): Promise<string> {
  const serviceAccount = JSON.parse(
    Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON') || '{}'
  );
  
  const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = btoa(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  
  // Note: In production, use proper JWT signing with the private key
  // For now, use the service account JSON directly with Google Cloud SDK
  
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${jwtHeader}.${jwtPayload}`,
    }),
  });
  
  if (!tokenResponse.ok) {
    console.error('Token error:', await tokenResponse.text());
    throw new Error('Failed to get access token');
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language = 'en-US', voice = 'en-US-Neural2-J', articleSlug } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const chunks = chunkText(text);
    console.log(`Processing ${chunks.length} chunks for article: ${articleSlug}`);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const ssml = buildSSML(chunk, language);

            console.log(`Generating TTS for chunk ${i + 1}/${chunks.length}`);

            const response = await fetch(
              'https://texttospeech.googleapis.com/v1/text:synthesize',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Goog-Api-Key': Deno.env.get('GOOGLE_CLOUD_API_KEY') || '',
                },
                body: JSON.stringify({
                  input: { ssml },
                  voice: { languageCode: language, name: voice },
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
            
            // Send audio chunk as SSE
            const event = {
              type: 'audio.delta',
              delta: result.audioContent,
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
