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
    'pn': 'en-IN', // Manipuri - fallback to English-India voice
  };
  
  // If already in correct format (e.g., 'en-US'), return as-is
  if (lang.includes('-')) return lang;
  
  // Otherwise map from short code
  return languageMap[lang] || 'en-US';
}

// Smart text chunking at sentence boundaries
// Phase 14d: Increased to 3000 chars to reduce API calls
function chunkText(text: string, maxChars: number = 3000): string[] {
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

// Convert PEM format private key to ArrayBuffer
function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Remove PEM headers and footers
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = pem
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\\n/g, '')
    .replace(/\s/g, '');
  
  // Decode base64 to binary string
  const binaryString = atob(pemContents);
  
  // Convert binary string to ArrayBuffer
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}

// JWT signing helper
async function createJWT(serviceAccount: any): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Import the private key - convert PEM to ArrayBuffer
  const privateKeyBuffer = pemToArrayBuffer(serviceAccount.private_key);
  const key = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the token
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
async function getGoogleAccessToken(): Promise<string> {
  const serviceAccount = JSON.parse(
    Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON') || '{}'
  );
  
  const jwt = await createJWT(serviceAccount);
  
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
    console.error('Token error:', errorText);
    throw new Error(`Failed to get access token: ${errorText}`);
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

serve(async (req) => {
  console.log('[tts-stream-google] Request received');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language = 'en-US', voice = 'en-US-Neural2-J', articleSlug } = await req.json();
    
    console.log('[tts-stream-google] Config:', { 
      language, 
      voice, 
      textLength: text?.length,
      articleSlug 
    });

    if (!text) {
      throw new Error('Text is required');
    }

    const chunks = chunkText(text);
    console.log(`[tts-stream-google] Processing ${chunks.length} chunks for article: ${articleSlug}`);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const ssml = buildSSML(chunk, mapLanguageCode(language));

            console.log(`Generating TTS for chunk ${i + 1}/${chunks.length}`);

            // Get access token for authentication
            const accessToken = await getGoogleAccessToken();
            
            // Map language code to Google TTS format
            const mappedLanguage = mapLanguageCode(language);
            
            const response = await fetch(
              'https://texttospeech.googleapis.com/v1/text:synthesize',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  input: { ssml },
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
            
            // Send audio chunk as NDJSON (matches client expectations)
            controller.enqueue(
              new TextEncoder().encode(JSON.stringify({ audio: result.audioContent }) + '\n')
            );
          }

          // Send completion event
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify({ done: true }) + '\n')
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
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
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
