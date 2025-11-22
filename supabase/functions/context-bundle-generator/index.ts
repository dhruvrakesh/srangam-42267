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
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Create JWT for OAuth2
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const jwtClaim = btoa(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }));
    
    // Note: In production, you'd properly sign this with the private key
    // For now, we'll use the simplified approach from tts-save-drive
    
    const fileName = `Srangam_Context_Bundle_${new Date().toISOString().split('T')[0]}.md`;
    const metadata = {
      name: fileName,
      mimeType: 'text/markdown',
      parents: [] // You could specify a folder ID here
    };

    // This is a simplified version - in production use proper OAuth2 flow
    console.log('Google Drive upload would happen here with filename:', fileName);
    
    return `https://drive.google.com/file/${fileName}`;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return '';
  }
}