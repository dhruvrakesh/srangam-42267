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
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      throw new Error('Google service account not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Gather current system statistics
    const { data: articles, error: articlesError } = await supabase
      .from('srangam_articles')
      .select('id, slug, theme, tags, status')
      .eq('status', 'published');

    if (articlesError) throw articlesError;

    const { data: terms, error: termsError } = await supabase
      .from('srangam_cultural_terms')
      .select('term, module, usage_count')
      .order('usage_count', { ascending: false })
      .limit(100);

    if (termsError) throw termsError;

    const { data: crossRefs, error: crossRefsError } = await supabase
      .from('srangam_cross_references')
      .select('reference_type, strength')
      .order('created_at', { ascending: false })
      .limit(100);

    if (crossRefsError) throw crossRefsError;

    const { data: tags, error: tagsError } = await supabase
      .from('srangam_tags')
      .select('tag_name, category, usage_count')
      .order('usage_count', { ascending: false })
      .limit(50);

    if (tagsError) throw tagsError;

    // Generate context snapshot document
    const timestamp = new Date().toISOString();
    const contextDocument = `# Srangam Platform Context Snapshot
Generated: ${timestamp}

## System Statistics

### Articles
- Total Published: ${articles?.length || 0}
- Themes: ${[...new Set(articles?.map(a => a.theme))].length}
- Total Tags Used: ${articles?.reduce((acc, a) => acc + (a.tags?.length || 0), 0)}

### Cultural Terms
- Total Terms: ${terms?.length || 0}
- Total Occurrences: ${terms?.reduce((acc, t) => acc + (t.usage_count || 0), 0)}
- Top 10 Terms:
${terms?.slice(0, 10).map((t, i) => `  ${i + 1}. ${t.term} (${t.module}) - ${t.usage_count} uses`).join('\n')}

### Cross-References
- Total References: ${crossRefs?.length || 0}
- Reference Types: ${[...new Set(crossRefs?.map(r => r.reference_type))].join(', ')}
- Average Strength: ${(crossRefs?.reduce((acc, r) => acc + r.strength, 0) / (crossRefs?.length || 1)).toFixed(2)}

### Tag Taxonomy
- Total Tags: ${tags?.length || 0}
- Categories: ${[...new Set(tags?.map(t => t.category).filter(Boolean))].join(', ')}
- Top 10 Tags:
${tags?.slice(0, 10).map((t, i) => `  ${i + 1}. ${t.tag_name} (${t.category || 'uncategorized'}) - ${t.usage_count} uses`).join('\n')}

## Recent Activity

### Latest Articles
${articles?.slice(0, 5).map((a, i) => `${i + 1}. [${a.slug}] - Tags: ${a.tags?.join(', ') || 'none'}`).join('\n')}

## Database Schema Summary

Tables:
- srangam_articles: Core article storage with multilingual content
- srangam_cultural_terms: Sanskrit/Indic terminology database
- srangam_cross_references: Knowledge graph connections
- srangam_tags: Tag taxonomy with categorization
- srangam_audio_narrations: TTS audio cache with Google Drive integration
- srangam_markdown_sources: Original markdown preservation
- srangam_purana_references: Scriptural citation tracking

## Implementation Status

✅ **Fully Operational**
- Markdown import pipeline with AI tag generation
- Cultural term extraction and tooltip system
- Cross-reference detection (thematic, explicit, same-theme)
- Knowledge graph visualization
- Admin dashboard with management tools
- TTS narration with Google Drive storage

🚧 **In Progress**
- Analytics data collection
- Semantic search with embeddings
- Advanced metadata enrichment

📋 **Planned**
- Chapter compilation system
- Bibliography consolidation
- PDF export functionality
- AI translation pipeline

---

This snapshot represents the current state of the Srangam platform.
Generated automatically by context-save-drive edge function.
`;

    // Parse service account credentials
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Create JWT for OAuth2 authentication
    const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = btoa(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }));
    
    // Get access token (simplified - production should use proper JWT signing library)
    const accessTokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${jwtHeader}.${jwtPayload}.${serviceAccount.private_key}`,
      }),
    });

    if (!accessTokenResponse.ok) {
      console.error('OAuth2 token error:', await accessTokenResponse.text());
      throw new Error('Failed to authenticate with Google Drive');
    }

    const { access_token } = await accessTokenResponse.json();

    // Upload context document to Google Drive
    const fileName = `srangam_context_${new Date().toISOString().split('T')[0]}.md`;
    const metadata = {
      name: fileName,
      mimeType: 'text/markdown',
      parents: ['root'], // Could be changed to a specific folder ID
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
      contextDocument +
      closeDelimiter;

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
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
      throw new Error('Failed to upload context to Google Drive');
    }

    const driveFile = await uploadResponse.json();
    const fileId = driveFile.id;

    // Make file shareable
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
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

    // Save snapshot metadata to database
    const snapshotStats = {
      articles_count: articles?.length || 0,
      terms_count: terms?.length || 0,
      tags_count: tags?.length || 0,
      cross_refs_count: crossRefs?.length || 0,
    };

    console.log('Successfully uploaded context snapshot to Google Drive:', {
      fileName,
      fileId,
      shareUrl,
      stats: snapshotStats,
    });

    // Save snapshot metadata to database
    const snapshotStatsDetail = {
      themes: Array.from(new Set((articles || []).map((a: any) => a.theme))),
      top_tags: (tags || []).slice(0, 20).map((t: any) => t.tag_name),
      avg_cross_ref_strength: crossRefs && crossRefs.length > 0
        ? crossRefs.reduce((acc: number, ref: any) => acc + (ref.strength || 0), 0) / crossRefs.length
        : 0
    };

    const { error: snapshotError } = await supabase
      .from('srangam_context_snapshots')
      .insert({
        google_drive_file_id: fileId,
        google_drive_share_url: shareUrl,
        file_size_bytes: contextDocument.length,
        document_length: contextDocument.length,
        articles_count: articles?.length || 0,
        terms_count: terms?.length || 0,
        tags_count: tags?.length || 0,
        cross_refs_count: crossRefs?.length || 0,
        modules_count: terms ? new Set(terms.map((t: any) => t.module)).size : 0,
        stats_detail: snapshotStatsDetail,
        triggered_by: 'manual',
        status: 'success'
      });

    if (snapshotError) {
      console.error('Error saving snapshot metadata:', snapshotError);
    } else {
      console.log('Snapshot metadata saved to database');
    }

    return new Response(
      JSON.stringify({
        success: true,
        fileId,
        fileName,
        shareUrl,
        timestamp,
        stats: snapshotStats,
        documentLength: contextDocument.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Context save error:', error);
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
