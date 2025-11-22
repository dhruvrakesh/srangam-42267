import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      includeArticles = true,
      includeTerms = true,
      includeSchema = true,
      includeDocs = true
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating context bundle with options:', {
      includeArticles,
      includeTerms,
      includeSchema,
      includeDocs
    });

    let bundle = `# Srangam Platform - AI Context Bundle\nGenerated: ${new Date().toISOString()}\n\n`;
    bundle += `---\n\n`;

    // Include Articles Database
    if (includeArticles) {
      const { data: articles } = await supabase
        .from('srangam_articles')
        .select('slug, title, theme, tags, status, author, read_time_minutes')
        .eq('status', 'published')
        .order('published_date', { ascending: false });

      bundle += `## Articles Database (${articles?.length || 0} published)\n\n`;
      
      const themeGroups: Record<string, any[]> = {};
      articles?.forEach(article => {
        if (!themeGroups[article.theme]) {
          themeGroups[article.theme] = [];
        }
        themeGroups[article.theme].push(article);
      });

      Object.entries(themeGroups).forEach(([theme, themeArticles]) => {
        bundle += `### ${theme} (${themeArticles.length} articles)\n\n`;
        themeArticles.forEach(article => {
          const titleEn = article.title?.en || 'Untitled';
          bundle += `- **${titleEn}**\n`;
          bundle += `  - Slug: \`${article.slug}\`\n`;
          bundle += `  - Author: ${article.author}\n`;
          bundle += `  - Tags: ${article.tags?.join(', ') || 'None'}\n`;
          if (article.read_time_minutes) {
            bundle += `  - Read Time: ${article.read_time_minutes} min\n`;
          }
          bundle += `\n`;
        });
      });
      
      bundle += `\n---\n\n`;
    }

    // Include Cultural Terms
    if (includeTerms) {
      const { data: terms } = await supabase
        .from('srangam_cultural_terms')
        .select('term, display_term, module, usage_count, transliteration')
        .order('usage_count', { ascending: false })
        .limit(300);

      bundle += `## Cultural Terms Database (Top 300 by usage)\n\n`;
      
      const moduleGroups: Record<string, any[]> = {};
      terms?.forEach(term => {
        if (!moduleGroups[term.module]) {
          moduleGroups[term.module] = [];
        }
        moduleGroups[term.module].push(term);
      });

      Object.entries(moduleGroups).forEach(([module, moduleTerms]) => {
        bundle += `### ${module} Module (${moduleTerms.length} terms)\n\n`;
        moduleTerms.slice(0, 20).forEach(term => {
          bundle += `- **${term.display_term}**`;
          if (term.transliteration) {
            bundle += ` (${term.transliteration})`;
          }
          bundle += `: ${term.usage_count} occurrences\n`;
        });
        bundle += `\n`;
      });

      bundle += `\n---\n\n`;
    }

    // Include Database Schema
    if (includeSchema) {
      bundle += `## Database Schema Overview\n\n`;
      
      const { data: articleCount } = await supabase
        .from('srangam_articles')
        .select('id', { count: 'exact', head: true });
      
      const { data: termCount } = await supabase
        .from('srangam_cultural_terms')
        .select('id', { count: 'exact', head: true });
      
      const { data: tagCount } = await supabase
        .from('srangam_tags')
        .select('id', { count: 'exact', head: true });
      
      const { data: crossRefCount } = await supabase
        .from('srangam_cross_references')
        .select('id', { count: 'exact', head: true });

      bundle += `### Key Tables:\n\n`;
      bundle += `- **srangam_articles**: ${articleCount || 'N/A'} records\n`;
      bundle += `  - Multilingual content (9 languages)\n`;
      bundle += `  - Status-based publishing workflow\n`;
      bundle += `  - Tag-based categorization\n`;
      bundle += `\n`;
      bundle += `- **srangam_cultural_terms**: ${termCount || 'N/A'} records\n`;
      bundle += `  - Organized by modules (12 total)\n`;
      bundle += `  - Usage tracking\n`;
      bundle += `  - Multilingual translations\n`;
      bundle += `\n`;
      bundle += `- **srangam_tags**: ${tagCount || 'N/A'} records\n`;
      bundle += `  - AI-generated with taxonomy\n`;
      bundle += `  - Usage count tracking\n`;
      bundle += `\n`;
      bundle += `- **srangam_cross_references**: ${crossRefCount || 'N/A'} records\n`;
      bundle += `  - Knowledge graph connections\n`;
      bundle += `  - Strength-based relationships\n`;
      bundle += `\n`;

      bundle += `\n---\n\n`;
    }

    // Include Documentation Links
    if (includeDocs) {
      bundle += `## Platform Documentation\n\n`;
      bundle += `### Architecture\n`;
      bundle += `- **Technology Stack**: React, Vite, Tailwind CSS, TypeScript, Supabase\n`;
      bundle += `- **Languages Supported**: 9 (English, Tamil, Telugu, Kannada, Bengali, Assamese, Punjabi, Hindi, Pali)\n`;
      bundle += `- **Content Modules**: 12 specialized cultural term modules\n`;
      bundle += `\n`;
      bundle += `### Key Features\n`;
      bundle += `- Multilingual article system with JSON-based content\n`;
      bundle += `- Cultural term glossary with contextual tooltips\n`;
      bundle += `- Cross-reference knowledge graph\n`;
      bundle += `- Google Drive integration for narration storage\n`;
      bundle += `- Admin dashboard for content management\n`;
      bundle += `\n`;
      bundle += `### API Endpoints (Edge Functions)\n`;
      bundle += `- \`markdown-to-article-import\`: Import articles from markdown\n`;
      bundle += `- \`batch-import-from-github\`: Batch import from GitHub\n`;
      bundle += `- \`context-save-drive\`: Save context snapshots to Google Drive\n`;
      bundle += `- \`tts-save-drive\`: Save narration audio to Google Drive\n`;
      bundle += `- \`context-diff-generator\`: Generate diffs between snapshots\n`;
      bundle += `- \`context-bundle-generator\`: Generate AI context bundles (this function)\n`;
      bundle += `\n`;
    }

    bundle += `---\n\n`;
    bundle += `## Usage Instructions for AI Tools\n\n`;
    bundle += `This bundle provides complete context about the Srangam platform for AI assistants.\n`;
    bundle += `Use this information to:\n`;
    bundle += `- Answer questions about platform architecture\n`;
    bundle += `- Generate new articles or content\n`;
    bundle += `- Understand the cultural term taxonomy\n`;
    bundle += `- Navigate the knowledge graph structure\n`;
    bundle += `\n`;
    bundle += `**Last Generated**: ${new Date().toISOString()}\n`;

    // Upload to Google Drive
    const googleDriveUrl = await uploadToGoogleDrive(bundle);

    console.log('Bundle generated successfully, size:', bundle.length);

    return new Response(
      JSON.stringify({
        success: true,
        bundleSize: bundle.length,
        fileCount: [
          includeArticles && 'Articles Database',
          includeTerms && 'Cultural Terms',
          includeSchema && 'Database Schema',
          includeDocs && 'Documentation'
        ].filter(Boolean).length,
        googleDriveUrl,
        markdown: bundle
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating bundle:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function uploadToGoogleDrive(content: string): Promise<string> {
  const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  
  if (!serviceAccountJson) {
    console.warn('GOOGLE_SERVICE_ACCOUNT_JSON not configured, skipping Drive upload');
    return '';
  }

  try {
    // Parse service account credentials
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Helper: Base64URL encoding (RFC 4648)
    function base64UrlEncode(data: ArrayBuffer | string): string {
      const bytes = typeof data === 'string' 
        ? new TextEncoder().encode(data)
        : new Uint8Array(data);
      
      const base64 = btoa(String.fromCharCode(...bytes));
      return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    
    // Helper: Import RSA private key from PEM format
    async function importPrivateKey(pemKey: string): Promise<CryptoKey> {
      // Remove PEM headers and decode base64
      const pemContents = pemKey
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s/g, '');
      
      const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
      
      return await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
      );
    }
    
    // Create JWT for OAuth2 authentication with proper RS256 signing
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    
    // Import private key and sign
    const privateKey = await importPrivateKey(serviceAccount.private_key);
    const signatureBuffer = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      new TextEncoder().encode(signatureInput)
    );
    const encodedSignature = base64UrlEncode(signatureBuffer);
    
    const jwt = `${signatureInput}.${encodedSignature}`;
    
    console.log('JWT created successfully, requesting access token...');
    
    // Get access token with properly signed JWT
    const accessTokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!accessTokenResponse.ok) {
      const errorText = await accessTokenResponse.text();
      console.error('OAuth2 token error:', errorText);
      throw new Error('Failed to authenticate with Google Drive');
    }

    const { access_token } = await accessTokenResponse.json();
    console.log('Access token obtained successfully');

    // Upload bundle to Google Drive
    const fileName = `Srangam_Context_Bundle_${new Date().toISOString().split('T')[0]}.md`;
    const metadata = {
      name: fileName,
      mimeType: 'text/markdown',
      parents: ['0AHOa_ecfO3arUk9PVA'], // Srangam Shared Drive
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartBody = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/markdown\r\n\r\n' +
      content +
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
      console.error('Drive upload error:', await uploadResponse.text());
      throw new Error('Failed to upload to Google Drive');
    }

    const driveFile = await uploadResponse.json();
    const fileId = driveFile.id;

    // Make file shareable (anyone with link can view)
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

    const shareUrl = `https://drive.google.com/file/d/${fileId}/view`;
    
    console.log('Successfully uploaded bundle to Google Drive:', {
      fileName,
      fileId,
      size: content.length,
    });

    return shareUrl;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return '';
  }
}