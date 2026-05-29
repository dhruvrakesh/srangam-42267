import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { requireAdmin } from '../_shared/auth-gate.ts';
import {
  countAuthoritative,
  topThemes,
  topTags,
  topTerms,
  recentCrossRefs,
  latestCorrelationSummary,
} from '../_shared/context-metrics.ts';
import {
  loadServiceAccount,
  getDriveAccessToken,
  uploadToDrive,
} from '../_shared/google-drive.ts';

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
    const serviceAccount = loadServiceAccount();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // ─── CX.2/CX.3: Authoritative counts + structured samples + identity sets. ───
    const counts = await countAuthoritative(supabase);
    const [
      themesObject,
      tags,
      terms,
      crossRefs,
      correlation,
      latestArticles,
      allPublishedArticles,
      allTags,
      allTermsForIdentity,
      allModulesRows,
    ] = await Promise.all([
      topThemes(supabase),
      topTags(supabase, 50),
      topTerms(supabase, 100),
      recentCrossRefs(supabase, 100),
      latestCorrelationSummary(supabase),
      supabase
        .from('srangam_articles')
        .select('id, slug, theme, tags, status')
        .eq('status', 'published')
        .order('published_date', { ascending: false })
        .limit(5)
        .then((r) => r.data ?? []),
      // Identity sets — full population (bounded by counts above).
      supabase
        .from('srangam_articles')
        .select('slug')
        .eq('status', 'published')
        .then((r) => (r.data ?? []).map((a: any) => a.slug).filter(Boolean) as string[]),
      supabase
        .from('srangam_tags')
        .select('tag_name')
        .then((r) => (r.data ?? []).map((t: any) => t.tag_name).filter(Boolean) as string[]),
      // term identity = "module:term" so name collisions across modules don't collapse.
      (async () => {
        const keys: string[] = [];
        const pageSize = 1000;
        let from = 0;
        while (from < 100_000) {
          const { data, error } = await supabase
            .from('srangam_cultural_terms')
            .select('term, module')
            .range(from, from + pageSize - 1);
          if (error) throw error;
          if (!data || data.length === 0) break;
          for (const r of data as Array<{ term: string; module: string | null }>) {
            if (r.term) keys.push(`${r.module ?? ''}:${r.term}`);
          }
          if (data.length < pageSize) break;
          from += pageSize;
        }
        return keys;
      })(),
      (async () => {
        const set = new Set<string>();
        const pageSize = 1000;
        let from = 0;
        while (from < 50_000) {
          const { data, error } = await supabase
            .from('srangam_cultural_terms')
            .select('module')
            .range(from, from + pageSize - 1);
          if (error) throw error;
          if (!data || data.length === 0) break;
          for (const r of data as Array<{ module: string | null }>) {
            if (r.module) set.add(r.module);
          }
          if (data.length < pageSize) break;
          from += pageSize;
        }
        return Array.from(set);
      })(),
    ]);


    const avgCrossRefStrengthSampled = crossRefs.length > 0
      ? crossRefs.reduce((acc, r) => acc + (r.strength ?? 0), 0) / crossRefs.length
      : null;

    // ─── Markdown body (CX.2 — authoritative counts + correlation block). ───
    const timestamp = new Date().toISOString();
    const correlationSection = correlation.computed_at
      ? `## Corpus Correlations

- Pair count: ${correlation.pair_count}
- Computed at: ${correlation.computed_at}
- Top 5 by Jaccard:
${correlation.top_pairs.map((p, i) => `  ${i + 1}. ${p.slug_a ?? p.article_a} ↔ ${p.slug_b ?? p.article_b} — jaccard=${p.jaccard.toFixed(3)}, shared=${p.shared_total}`).join('\n')}

`
      : '';

    const contextDocument = `# Srangam Platform Context Snapshot
Generated: ${timestamp}
Generated with: CX.3 (identity-set diffing; shared metrics module; authoritative counts; samples labelled)

## System Statistics

### Articles
- Total Published: ${counts.articles_count}
- Distinct Themes: ${Object.keys(themesObject).length}

### Cultural Terms
- Total Terms: ${counts.terms_count}
- Distinct Modules: ${counts.modules_count}
- Top 10 Terms (sampled from top 100 by usage):
${terms.slice(0, 10).map((t, i) => `  ${i + 1}. ${t.term} (${t.module}) - ${t.usage_count} uses`).join('\n')}

### Cross-References
- Total References: ${counts.cross_refs_count}
- Reference Types (sampled from latest 100): ${[...new Set(crossRefs.map((r) => r.reference_type))].join(', ')}
- Average Strength (sampled from latest 100): ${(avgCrossRefStrengthSampled ?? 0).toFixed(2)}

### Tag Taxonomy
- Total Tags: ${counts.tags_count}
- Categories (sampled from top 50): ${[...new Set(tags.map((t) => t.category).filter(Boolean))].join(', ')}
- Top 10 Tags (sampled from top 50 by usage):
${tags.slice(0, 10).map((t, i) => `  ${i + 1}. ${t.tag_name} (${t.category || 'uncategorized'}) - ${t.usage_count} uses`).join('\n')}

${correlationSection}## Recent Activity

### Latest Articles
${latestArticles.map((a: any, i: number) => `${i + 1}. [${a.slug}] - Tags: ${a.tags?.join(', ') || 'none'}`).join('\n')}

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
Generated automatically by context-save-drive edge function (CX.3).
`;

    // ─── Upload via shared Google Drive helper. ───
    const accessToken = await getDriveAccessToken(serviceAccount);
    const fileName = `srangam_context_${new Date().toISOString().split('T')[0]}.md`;
    const { fileId, shareUrl } = await uploadToDrive({
      accessToken,
      fileName,
      mimeType: 'text/markdown',
      body: { kind: 'text', data: contextDocument },
    });

    const snapshotStatsDetail = {
      generated_with: 'CX.3',
      sample_sizes: { terms: 100, tags: 50, cross_refs: 100 },
      themes: themesObject,
      top_tags: tags.map((t) => ({ name: t.tag_name, usage_count: t.usage_count })),
      top_terms: terms.map((t) => ({ term: t.term, module: t.module, usage_count: t.usage_count })),
      avg_cross_ref_strength_sampled: avgCrossRefStrengthSampled,
      correlation,
    };

    // CX.3 identity sets — sorted for deterministic diffing.
    const identitySets = {
      article_slugs: allPublishedArticles.slice().sort(),
      term_keys: allTermsForIdentity.slice().sort(),
      tag_names: allTags.slice().sort(),
      theme_names: Object.keys(themesObject).slice().sort(),
      module_names: allModulesRows.slice().sort(),
    };

    const { error: snapshotError } = await supabase
      .from('srangam_context_snapshots')
      .insert({
        google_drive_file_id: fileId,
        google_drive_share_url: shareUrl,
        file_size_bytes: contextDocument.length,
        document_length: contextDocument.length,
        articles_count: counts.articles_count,
        terms_count: counts.terms_count,
        tags_count: counts.tags_count,
        cross_refs_count: counts.cross_refs_count,
        modules_count: counts.modules_count,
        stats_detail: snapshotStatsDetail,
        identity_sets: identitySets,
        triggered_by: 'manual',
        status: 'success',
      });

    if (snapshotError) {
      console.error('Error saving snapshot metadata:', snapshotError);
    } else {
      console.log('CX.3 snapshot metadata saved (identity sets:', {
        articles: identitySets.article_slugs.length,
        terms: identitySets.term_keys.length,
        tags: identitySets.tag_names.length,
        themes: identitySets.theme_names.length,
        modules: identitySets.module_names.length,
      }, ')');
    }


    return new Response(
      JSON.stringify({
        success: true,
        fileId,
        fileName,
        shareUrl,
        timestamp,
        stats: counts,
        documentLength: contextDocument.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Context save error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
