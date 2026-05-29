// Shared context-metrics helpers (Phase CX.2).
// Authoritative-count utilities for snapshot generation + bundle generation.
//
// CONTRACT (do not break):
//  - All *_count values MUST come from head:true, count:'exact' queries.
//    Never derive counts from .length of a .limit()-bounded fetch.
//    Never destructure data from a head:true query (data is always null there).
//  - modules_count paginates the full srangam_cultural_terms.module column.
//    Never use new Set(top-N.map(module)).

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthoritativeCounts {
  articles_count: number;
  terms_count: number;
  tags_count: number;
  cross_refs_count: number;
  modules_count: number;
}

export async function countAuthoritative(
  supabase: SupabaseClient,
): Promise<AuthoritativeCounts> {
  const [
    { count: articlesCount, error: aErr },
    { count: termsCount, error: tErr },
    { count: tagsCount, error: gErr },
    { count: crossRefsCount, error: xErr },
  ] = await Promise.all([
    supabase
      .from('srangam_articles')
      .select('id', { head: true, count: 'exact' })
      .eq('status', 'published'),
    supabase.from('srangam_cultural_terms').select('id', { head: true, count: 'exact' }),
    supabase.from('srangam_tags').select('id', { head: true, count: 'exact' }),
    supabase.from('srangam_cross_references').select('id', { head: true, count: 'exact' }),
  ]);
  if (aErr) throw aErr;
  if (tErr) throw tErr;
  if (gErr) throw gErr;
  if (xErr) throw xErr;

  const modules_count = await countDistinctModules(supabase);

  return {
    articles_count: articlesCount ?? 0,
    terms_count: termsCount ?? 0,
    tags_count: tagsCount ?? 0,
    cross_refs_count: crossRefsCount ?? 0,
    modules_count,
  };
}

export async function countDistinctModules(supabase: SupabaseClient): Promise<number> {
  const modules = new Set<string>();
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
      if (r.module) modules.add(r.module);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return modules.size;
}

export async function topThemes(
  supabase: SupabaseClient,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('srangam_articles')
    .select('theme')
    .eq('status', 'published');
  if (error) throw error;
  const themes: Record<string, number> = {};
  for (const a of (data ?? []) as Array<{ theme: string | null }>) {
    if (a.theme) themes[a.theme] = (themes[a.theme] ?? 0) + 1;
  }
  return themes;
}

export interface CorrelationSummary {
  pair_count: number;
  computed_at: string | null;
  top_pairs: Array<{
    article_a: string;
    article_b: string;
    jaccard: number;
    shared_total: number;
    slug_a?: string;
    slug_b?: string;
  }>;
}

export async function latestCorrelationSummary(
  supabase: SupabaseClient,
): Promise<CorrelationSummary> {
  const empty: CorrelationSummary = { pair_count: 0, computed_at: null, top_pairs: [] };
  const { data: latest } = await supabase
    .from('srangam_corpus_correlations_snapshot')
    .select('job_id, computed_at')
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!latest?.job_id) return empty;

  const { count } = await supabase
    .from('srangam_corpus_correlations_snapshot')
    .select('article_a', { head: true, count: 'exact' })
    .eq('job_id', latest.job_id);

  const { data: pairs } = await supabase
    .from('srangam_corpus_correlations_snapshot')
    .select('article_a, article_b, jaccard, shared_total')
    .eq('job_id', latest.job_id)
    .order('jaccard', { ascending: false })
    .limit(5);

  let top_pairs: CorrelationSummary['top_pairs'] = [];
  if (pairs && pairs.length > 0) {
    const ids = Array.from(
      new Set(pairs.flatMap((p: any) => [p.article_a, p.article_b])),
    );
    const { data: slugLookup } = await supabase
      .from('srangam_articles')
      .select('id, slug')
      .in('id', ids);
    const idToSlug = new Map<string, string>(
      (slugLookup ?? []).map((r: any) => [r.id, r.slug]),
    );
    top_pairs = pairs.map((p: any) => ({
      article_a: p.article_a,
      article_b: p.article_b,
      jaccard: Number(p.jaccard),
      shared_total: p.shared_total,
      slug_a: idToSlug.get(p.article_a),
      slug_b: idToSlug.get(p.article_b),
    }));
  }

  return {
    pair_count: count ?? 0,
    computed_at: latest.computed_at,
    top_pairs,
  };
}

export async function topTags(
  supabase: SupabaseClient,
  limit = 50,
): Promise<Array<{ tag_name: string; category: string | null; usage_count: number }>> {
  const { data, error } = await supabase
    .from('srangam_tags')
    .select('tag_name, category, usage_count')
    .order('usage_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as any;
}

export async function topTerms(
  supabase: SupabaseClient,
  limit = 100,
): Promise<Array<{ term: string; module: string | null; usage_count: number }>> {
  const { data, error } = await supabase
    .from('srangam_cultural_terms')
    .select('term, module, usage_count')
    .order('usage_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as any;
}

export async function recentCrossRefs(
  supabase: SupabaseClient,
  limit = 100,
): Promise<Array<{ reference_type: string; strength: number | null }>> {
  const { data, error } = await supabase
    .from('srangam_cross_references')
    .select('reference_type, strength')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as any;
}
