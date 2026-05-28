/**
 * Phase X.6 / X.7 — Corpus correlation hooks.
 *
 * X.6 introduced the read-only Jaccard view over places + Puranic refs.
 * X.7.2 widens the substrate to 5 axes (places, purāṇas, cultural terms,
 *       tags, bibliography) with per-axis weights.
 * X.7.3 adds a curator-in-the-loop `promotePair` mutation that turns a
 *       Jaccard pair into a row in the existing `srangam_cross_references`
 *       table (no schema change — admin RLS already in place).
 * X.7.4 adds a snapshot-source mode so the page can render from a nightly
 *       materialised snapshot in <200 ms instead of running the RPC live.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CorrelationWeights {
  w_place: number;
  w_purana: number;
  w_term: number;
  w_tag: number;
  w_biblio: number;
}

export const DEFAULT_WEIGHTS: CorrelationWeights = {
  w_place: 0.25,
  w_purana: 0.30,
  w_term: 0.20,
  w_tag: 0.10,
  w_biblio: 0.15,
};

export interface CorrelationRow {
  article_a: string;
  article_b: string;
  shared_places: number;
  shared_puranas: number;
  shared_terms: number;
  shared_tags: number;
  shared_biblio: number;
  shared_total: number;
  jaccard: number;
}

export interface CorrelationRowResolved extends CorrelationRow {
  slug_a: string | null;
  title_a: string | null;
  slug_b: string | null;
  title_b: string | null;
  /** True if a row already exists in srangam_cross_references for this pair
   *  (either direction). UI surfaces a "Promoted" badge so curators don't
   *  re-promote the same finding. */
  promoted: boolean;
}

const FIVE_MIN = 5 * 60 * 1000;

interface UseCorpusCorrelationsArgs {
  minShared: number;
  limitRows: number;
  weights?: CorrelationWeights;
  /** 'live' runs the RPC; 'snapshot' reads the most recent nightly snapshot. */
  source?: 'live' | 'snapshot';
}

async function resolveArticles(rows: CorrelationRow[]): Promise<CorrelationRowResolved[]> {
  if (rows.length === 0) return [];

  const ids = Array.from(new Set(rows.flatMap((r) => [r.article_a, r.article_b])));
  const [{ data: articles, error: aErr }, { data: xrefs }] = await Promise.all([
    supabase.from('srangam_articles').select('id, slug, title').in('id', ids),
    supabase
      .from('srangam_cross_references')
      .select('source_article_id, target_article_id')
      .or(
        ids
          .map((id) => `source_article_id.eq.${id},target_article_id.eq.${id}`)
          .join(','),
      ),
  ]);
  if (aErr) throw aErr;

  const byId = new Map<string, { slug: string; title: any }>();
  (articles ?? []).forEach((a: any) => byId.set(a.id, { slug: a.slug, title: a.title }));

  const promotedSet = new Set<string>();
  (xrefs ?? []).forEach((x: any) => {
    if (!x.source_article_id || !x.target_article_id) return;
    const [lo, hi] = [x.source_article_id, x.target_article_id].sort();
    promotedSet.add(`${lo}::${hi}`);
  });

  const titleOf = (t: any): string | null => {
    if (!t) return null;
    if (typeof t === 'string') return t;
    return t.en ?? Object.values(t)[0] ?? null;
  };

  return rows.map((r) => {
    const a = byId.get(r.article_a);
    const b = byId.get(r.article_b);
    const [lo, hi] = [r.article_a, r.article_b].sort();
    return {
      ...r,
      slug_a: a?.slug ?? null,
      title_a: titleOf(a?.title),
      slug_b: b?.slug ?? null,
      title_b: titleOf(b?.title),
      promoted: promotedSet.has(`${lo}::${hi}`),
    };
  });
}

export function useCorpusCorrelations(args: UseCorpusCorrelationsArgs) {
  const weights = args.weights ?? DEFAULT_WEIGHTS;
  const source = args.source ?? 'snapshot';
  return useQuery({
    queryKey: [
      'corpus-correlations',
      source,
      args.minShared,
      args.limitRows,
      weights.w_place,
      weights.w_purana,
      weights.w_term,
      weights.w_tag,
      weights.w_biblio,
    ],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<{
      rows: CorrelationRowResolved[];
      computedAt: string | null;
      mode: 'live' | 'snapshot';
    }> => {
      if (source === 'snapshot') {
        // Take rows from the most recent nightly snapshot.
        const sb = supabase as any;
        const { data: latest } = await sb
          .from('srangam_corpus_correlations_snapshot')
          .select('computed_at')
          .order('computed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latest?.computed_at) {
          const { data, error } = await sb
            .from('srangam_corpus_correlations_snapshot')
            .select(
              'article_a, article_b, shared_places, shared_puranas, shared_terms, shared_tags, shared_biblio, shared_total, jaccard',
            )
            .eq('computed_at', latest.computed_at)
            .gte('shared_total', Math.max(args.minShared, 1))
            .order('jaccard', { ascending: false })
            .limit(args.limitRows);
          if (error) throw error;
          const rows = (data ?? []) as CorrelationRow[];
          return { rows: await resolveArticles(rows), computedAt: latest.computed_at, mode: 'snapshot' };
        }
        // Fall through to live if no snapshot exists yet.
      }

      const { data, error } = await supabase.rpc('get_corpus_correlations_v2' as any, {
        min_shared: args.minShared,
        limit_rows: args.limitRows,
        ...weights,
      } as any);
      if (error) throw error;
      const rows = (data ?? []) as CorrelationRow[];
      return { rows: await resolveArticles(rows), computedAt: null, mode: 'live' };
    },
  });
}

/** Promote a Jaccard pair into a curated row in srangam_cross_references. */
export function usePromoteCorrelation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pair: CorrelationRowResolved) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('srangam_cross_references').insert({
        source_article_id: pair.article_a,
        target_article_id: pair.article_b,
        reference_type: 'discovered',
        strength: Math.max(1, Math.min(10, Math.ceil(Number(pair.jaccard) * 10))),
        bidirectional: true,
        created_by: user?.id ?? null,
        context_description: {
          source: 'corpus-correlations',
          axes: {
            places: pair.shared_places,
            puranas: pair.shared_puranas,
            terms: pair.shared_terms,
            tags: pair.shared_tags,
            biblio: pair.shared_biblio,
          },
          jaccard: Number(pair.jaccard),
        } as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Promoted to cross-reference');
      queryClient.invalidateQueries({ queryKey: ['corpus-correlations'] });
      queryClient.invalidateQueries({ queryKey: ['cross-references'] });
    },
    onError: (e: Error) => {
      toast.error(`Promotion failed: ${e.message}`);
    },
  });
}

/** Per-article overlay of pins × Puranic refs. */
export function usePuranaPinOverlap(articleId?: string | null, limit = 200) {
  return useQuery({
    queryKey: ['corpus-purana-pin-overlap', articleId ?? null, limit],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      const sb = supabase as any;
      let q = sb
        .from('srangam_corpus_purana_pin_overlap')
        .select('*')
        .order('purana_conf', { ascending: false })
        .limit(limit);
      if (articleId) q = q.eq('article_id', articleId);
      const { data, error } = await q;
      if (error) throw error;
      return ((data ?? []) as unknown) as Array<{
        article_id: string;
        purana_name: string;
        kanda: string | null;
        adhyaya: string | null;
        purana_conf: number | null;
        gazetteer_id: string;
        place: string;
        pin_conf: string | null;
      }>;
    },
  });
}
