import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { requireAdmin } from '../_shared/auth-gate.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const __gate = await requireAdmin(req);
  if (__gate.error) return __gate.error;

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

    // ─── CX.1: Authoritative counts (head:true, count:'exact'). Never derived from .limit() slices. ───
    const [
      { count: articlesCount, error: aErr },
      { count: termsCount, error: tErr },
      { count: tagsCount, error: gErr },
      { count: crossRefsCount, error: xErr },
    ] = await Promise.all([
      supabase.from('srangam_articles').select('id', { head: true, count: 'exact' }).eq('status', 'published'),
      supabase.from('srangam_cultural_terms').select('id', { head: true, count: 'exact' }),
      supabase.from('srangam_tags').select('id', { head: true, count: 'exact' }),
      supabase.from('srangam_cross_references').select('id', { head: true, count: 'exact' }),
    ]);
    if (aErr) throw aErr;
    if (tErr) throw tErr;
    if (gErr) throw gErr;
    if (xErr) throw xErr;

    // Distinct modules — paginate over the full cultural_terms.module column.
    // CX.2 will lift this into _shared/context-metrics.ts.
    const countDistinctModules = async (): Promise<number> => {
      const modules = new Set<string>();
      const pageSize = 1000;
      let from = 0;
      // Hard ceiling to protect against runaway loops.
      while (from < 50_000) {
        const { data, error } = await supabase
          .from('srangam_cultural_terms')
          .select('module')
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        for (const r of data) if (r.module) modules.add(r.module);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return modules.size;
    };
    const modulesCount = await countDistinctModules();

    // Themes — fetch theme column for ALL published articles (single light column, no limit).
    const { data: allThemes, error: themesErr } = await supabase
      .from('srangam_articles')
      .select('theme')
      .eq('status', 'published');
    if (themesErr) throw themesErr;
    const themesObject: Record<string, number> = {};
    for (const a of allThemes ?? []) {
      if (a.theme) themesObject[a.theme] = (themesObject[a.theme] ?? 0) + 1;
    }

    // ─── Top-N samples for the human-readable markdown body. NEVER fed into persisted counts. ───
    const { data: articles, error: articlesError } = await supabase
      .from('srangam_articles')
      .select('id, slug, theme, tags, status')
      .eq('status', 'published')
      .order('published_date', { ascending: false });
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

    // ─── Correlation summary from srangam_corpus_correlations_snapshot (latest job). ───
    const { data: latestCorrelation } = await supabase
      .from('srangam_corpus_correlations_snapshot')
      .select('job_id, computed_at')
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let topCorrelationPairs: Array<{ article_a: string; article_b: string; jaccard: number; shared_total: number; slug_a?: string; slug_b?: string }> = [];
    let correlationPairCount = 0;
    let correlationComputedAt: string | null = null;
    if (latestCorrelation?.job_id) {
      correlationComputedAt = latestCorrelation.computed_at;
      const { count } = await supabase
        .from('srangam_corpus_correlations_snapshot')
        .select('article_a', { head: true, count: 'exact' })
        .eq('job_id', latestCorrelation.job_id);
      correlationPairCount = count ?? 0;

      const { data: topPairs } = await supabase
        .from('srangam_corpus_correlations_snapshot')
        .select('article_a, article_b, jaccard, shared_total')
        .eq('job_id', latestCorrelation.job_id)
        .order('jaccard', { ascending: false })
        .limit(5);

      if (topPairs && topPairs.length > 0) {
        const ids = Array.from(new Set(topPairs.flatMap((p: any) => [p.article_a, p.article_b])));
        const { data: slugLookup } = await supabase
          .from('srangam_articles')
          .select('id, slug')
          .in('id', ids);
        const idToSlug = new Map<string, string>((slugLookup ?? []).map((r: any) => [r.id, r.slug]));
        topCorrelationPairs = topPairs.map((p: any) => ({
          article_a: p.article_a,
          article_b: p.article_b,
          jaccard: Number(p.jaccard),
          shared_total: p.shared_total,
          slug_a: idToSlug.get(p.article_a),
          slug_b: idToSlug.get(p.article_b),
        }));
      }
    }

    // ─── Markdown body (CX.1 — authoritative counts + correlation block). ───
    const timestamp = new Date().toISOString();
    const correlationSection = latestCorrelation
      ? `## Corpus Correlations

- Pair count: ${correlationPairCount}
- Computed at: ${correlationComputedAt}
- Top 5 by Jaccard:
${topCorrelationPairs.map((p, i) => `  ${i + 1}. ${p.slug_a ?? p.article_a} ↔ ${p.slug_b ?? p.article_b} — jaccard=${p.jaccard.toFixed(3)}, shared=${p.shared_total}`).join('\n')}

`
      : '';

    const contextDocument = `# Srangam Platform Context Snapshot
Generated: ${timestamp}
Generated with: CX.1 (authoritative counts; samples labelled)

## System Statistics

### Articles
- Total Published: ${articlesCount ?? 0}
- Distinct Themes: ${Object.keys(themesObject).length}

### Cultural Terms
- Total Terms: ${termsCount ?? 0}
- Distinct Modules: ${modulesCount}
- Top 10 Terms (sampled from top 100 by usage):
${(terms ?? []).slice(0, 10).map((t, i) => `  ${i + 1}. ${t.term} (${t.module}) - ${t.usage_count} uses`).join('\n')}

### Cross-References
- Total References: ${crossRefsCount ?? 0}
- Reference Types (sampled from latest 100): ${[...new Set((crossRefs ?? []).map(r => r.reference_type))].join(', ')}
- Average Strength (sampled from latest 100): ${((crossRefs ?? []).reduce((acc, r) => acc + (r.strength ?? 0), 0) / ((crossRefs?.length || 1))).toFixed(2)}

### Tag Taxonomy
- Total Tags: ${tagsCount ?? 0}
- Categories (sampled from top 50): ${[...new Set((tags ?? []).map(t => t.category).filter(Boolean))].join(', ')}
- Top 10 Tags (sampled from top 50 by usage):
${(tags ?? []).slice(0, 10).map((t, i) => `  ${i + 1}. ${t.tag_name} (${t.category || 'uncategorized'}) - ${t.usage_count} uses`).join('\n')}

${correlationSection}## Recent Activity

### Latest Articles
${(articles ?? []).slice(0, 5).map((a, i) => `${i + 1}. [${a.slug}] - Tags: ${a.tags?.join(', ') || 'none'}`).join('\n')}

## Database Schema Summary

Tables:
- srangam_articles: Core article storage with multilingual content
- srangam_cultural_terms: Sanskrit/Indic terminology database
- srangam_cross_references: Knowledge graph connections
- srangam_tags: Tag taxonomy with categorization
- srangam_corpus_correlations_snapshot: Cross-article overlap (places/puranas/terms/tags/biblio) with jaccard
- srangam_audio_narrations: TTS audio cache with Google Drive integration
- srangam_markdown_sources: Original markdown preservation
- srangam_purana_references: Scriptural citation tracking

---

This snapshot represents the current state of the Srangam platform.
Generated automatically by context-save-drive edge function (CX.1).
`;


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

    // Upload context document to Google Drive
    const fileName = `srangam_context_${new Date().toISOString().split('T')[0]}.md`;
    const metadata = {
      name: fileName,
      mimeType: 'text/markdown',
      parents: ['0AHOa_eCfO3arUk9PVA'], // Srangam Shared Drive
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
      throw new Error('Failed to upload context to Google Drive');
    }

    const driveFile = await uploadResponse.json();
    const fileId = driveFile.id;

    // Make file shareable
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
