import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Theme-to-color mapping for consistent branding
const themeColors: Record<string, { primary: string; accent: string; motif: string }> = {
  'Ancient India': { 
    primary: 'saffron orange (#FF9933)', 
    accent: 'deep burgundy (#7B2D26)', 
    motif: 'temple silhouette, lotus pattern' 
  },
  'Indian Ocean World': { 
    primary: 'ocean teal (#2A9D8F)', 
    accent: 'coral gold (#D4A574)', 
    motif: 'wave patterns, dhow ship silhouette' 
  },
  'Scripts & Inscriptions': { 
    primary: 'stone gray (#6B7280)', 
    accent: 'copper brown (#B87333)', 
    motif: 'ancient script fragments, pillar silhouette' 
  },
  'Geology & Deep Time': { 
    primary: 'laterite red (#C84B31)', 
    accent: 'earth brown (#8B4513)', 
    motif: 'rock strata, mountain silhouette' 
  },
  'Empires & Exchange': { 
    primary: 'royal purple (#6B21A8)', 
    accent: 'gold metallic (#D4AF37)', 
    motif: 'coin motifs, caravan silhouette' 
  },
};

// Proper RS256 JWT signing for Google OAuth2
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

  // Convert PEM private key to ArrayBuffer for crypto.subtle
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

// Upload image to Google Drive and return share URL
async function uploadToGoogleDrive(
  imageBytes: Uint8Array, 
  fileName: string, 
  serviceAccount: any
): Promise<{ fileId: string; shareUrl: string }> {
  const jwt = await createJWT(serviceAccount);
  console.log('JWT created for Google Drive authentication');

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
    const errorText = await tokenResponse.text();
    console.error('OAuth2 token error:', errorText);
    throw new Error(`Google OAuth failed: ${errorText}`);
  }

  const { access_token } = await tokenResponse.json();
  console.log('Google OAuth2 access token obtained');

  // Upload using multipart upload
  const metadata = {
    name: fileName,
    mimeType: 'image/png',
    parents: ['0AHOa_eCfO3arUk9PVA'], // Srangam Shared Drive
  };

  // Chunked base64 encoding to avoid stack overflow on large images (2-3MB)
  function bytesToBase64(bytes: Uint8Array): string {
    let binaryString = '';
    const chunkSize = 65536; // 64KB chunks - safe for call stack
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
      binaryString += String.fromCharCode(...chunk);
    }
    return btoa(binaryString);
  }

  const base64Image = bytesToBase64(imageBytes);
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: image/png\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    base64Image +
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
    const errorText = await uploadResponse.text();
    console.error('GDrive upload error:', errorText);
    throw new Error(`GDrive upload failed: ${errorText}`);
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

  // Direct embed URL for og:image meta tags
  const shareUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  
  return { fileId, shareUrl };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, title, theme, slug } = await req.json();
    
    console.log(`Generating OG image for: ${title} (theme: ${theme})`);
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');
    }
    const serviceAccount = JSON.parse(serviceAccountJson);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const colors = themeColors[theme] || themeColors['Ancient India'];

    // Construct DALL-E 3 prompt
    const prompt = `Create a professional academic Open Graph image (1792x1024 landscape) for a scholarly article about Indian civilization research:

TITLE: "${title}"
THEME: ${theme}

DESIGN REQUIREMENTS:
- Clean, minimalist academic aesthetic with dignified scholarly appearance
- Sacred geometry patterns as subtle background (faded mandala, yantra, or ${colors.motif})
- The article title "${title}" MUST appear clearly readable in large elegant serif font (center or left-aligned)
- Primary color: ${colors.primary}
- Accent color: ${colors.accent}
- Background: warm cream (#F8F5F0) with subtle texture
- NO photographs, NO human faces, NO AI-looking effects
- Professional typography suitable for academic journals
- Subtle dharmic/Indic design elements as decorative borders or corners
- Clear visual hierarchy: title prominent, decorative elements subtle

STYLE: Scholarly, dignified, suitable for sharing on LinkedIn, Twitter, and academic platforms. Think academic journal cover or museum exhibition poster.`;

    console.log('Calling OpenAI DALL-E 3 API...');
    
    // Retry logic for OpenAI API (handles occasional 500 errors)
    let response: Response | null = null;
    const maxRetries = 3;
    const retryDelays = [2000, 4000, 6000];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1792x1024',
          quality: 'standard',
          response_format: 'b64_json',
        }),
      });

      if (response.ok) break;
      
      if (response.status >= 500 && attempt < maxRetries - 1) {
        console.log(`DALL-E API error (attempt ${attempt + 1}), retrying in ${retryDelays[attempt]}ms...`);
        await new Promise(r => setTimeout(r, retryDelays[attempt]));
      }
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : 'No response';
      console.error('DALL-E API error after retries:', errorText);
      throw new Error(`DALL-E API error: ${response?.status} - ${errorText}`);
    }

    const data = await response.json();
    const base64Image = data.data[0].b64_json;
    const revisedPrompt = data.data[0].revised_prompt;

    console.log('Image generated successfully. Uploading to Google Drive...');
    console.log('Revised prompt:', revisedPrompt?.substring(0, 100) + '...');

    // Decode base64 to bytes
    const binaryString = atob(base64Image);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const fileName = `og-${slug || articleId}.png`;

    // Upload to Google Drive instead of Supabase Storage
    const { fileId, shareUrl } = await uploadToGoogleDrive(bytes, fileName, serviceAccount);
    
    console.log('Uploaded to Google Drive:', { fileId, shareUrl });

    // Update article with GDrive OG image URL
    if (articleId) {
      const { error: updateError } = await supabase
        .from('srangam_articles')
        .update({ og_image_url: shareUrl })
        .eq('id', articleId);

      if (updateError) {
        console.error('Article update error:', updateError);
      } else {
        console.log('Article og_image_url updated to GDrive URL');
      }
    }

    console.log(`✅ Generated OG image for: ${title} (stored in GDrive)`);

    return new Response(JSON.stringify({
      success: true,
      url: shareUrl,
      gdriveFileId: fileId,
      revisedPrompt,
      cost: '$0.04',
      storage: 'google-drive',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OG generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
