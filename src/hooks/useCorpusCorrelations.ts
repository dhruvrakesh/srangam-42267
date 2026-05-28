/**
 * Phase X.6 — Read-only corpus correlation hook.
 *
 * Wraps the `get_corpus_correlations` RPC and resolves article ids to
 * their slug + title so the admin UI can render human-readable rows
 * without each row firing its own request. Both queries are cached for
 * 5 minutes (`staleTime`) because the underlying signals (pins and
 * Puranic refs) only change after batch admin jobs.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CorrelationRow {
  article_a: string;
  article_b: string;
  shared_places: number;
  shared_puranas: number;
  shared_total: number;
  jaccard: number;
}

export interface CorrelationRowResolved extends CorrelationRow {
  slug_a: string | null;
  title_a: string | null;
  slug_b: string | null;
  title_b: string | null;
}

const FIVE_MIN = 5 * 60 * 1000;

export function useCorpusCorrelations(args: { minShared: number; limitRows: number }) {
  return useQuery({
    queryKey: ['corpus-correlations', args.minShared, args.limitRows],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<CorrelationRowResolved[]> => {
      const { data, error } = await supabase.rpc('get_corpus_correlations', {
        min_shared: args.minShared,
        limit_rows: args.limitRows,
      });
      if (error) throw error;
      const rows = (data ?? []) as CorrelationRow[];
      if (rows.length === 0) return [];

      // Resolve ids to slug + title in one round-trip.
      const ids = Array.from(new Set(rows.flatMap((r) => [r.article_a, r.article_b])));
      const { data: articles, error: aErr } = await supabase
        .from('srangam_articles')
        .select('id, slug, title')
        .in('id', ids);
      if (aErr) throw aErr;

      const byId = new Map<string, { slug: string; title: any }>();
      (articles ?? []).forEach((a: any) => byId.set(a.id, { slug: a.slug, title: a.title }));

      const titleOf = (t: any): string | null => {
        if (!t) return null;
        if (typeof t === 'string') return t;
        // multilingual JSON — prefer English then any locale.
        return t.en ?? Object.values(t)[0] ?? null;
      };

      return rows.map((r) => {
        const a = byId.get(r.article_a);
        const b = byId.get(r.article_b);
        return {
          ...r,
          slug_a: a?.slug ?? null,
          title_a: titleOf(a?.title),
          slug_b: b?.slug ?? null,
          title_b: titleOf(b?.title),
        };
      });
    },
  });
}

/** Per-article overlay of pins × Puranic refs. Optional `articleId`
 *  filter; otherwise returns the top N rows by purana confidence. */
export function usePuranaPinOverlap(articleId?: string | null, limit = 200) {
  return useQuery({
    queryKey: ['corpus-purana-pin-overlap', articleId ?? null, limit],
    staleTime: FIVE_MIN,
    queryFn: async () => {
      // Cast supabase client to any — view is not in generated Database types yet.
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

