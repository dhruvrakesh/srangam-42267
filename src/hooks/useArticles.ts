import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SupportedLanguage } from '@/types/multilingual';

export interface DatabaseArticle {
  id: string;
  slug: string;
  title: { [key: string]: string };
  dek: { [key: string]: string } | null;
  content: { [key: string]: string };
  theme: string;
  tags: string[] | null;
  status: string;
  read_time_minutes: number | null;
  author: string;
  published_date: string;
  created_at: string;
}

export interface DisplayArticle {
  id: string;
  title: { [key: string]: string } | string;
  excerpt: { [key: string]: string } | string;
  slug: string;
  theme: string;
  tags: Array<{ [key: string]: string } | string>;
  readTime: number;
  author: string;
  date: string;
  source: 'json' | 'database';
}

/**
 * Phase X.8.2 — Typed timeout error raised when the DB roundtrip exceeds
 * the watchdog budget. React Query treats this as a normal rejection and
 * settles `isLoading`, allowing the page to render JSON-only without an
 * infinite spinner.
 */
export class ArticleFetchTimeoutError extends Error {
  constructor(public readonly ms: number) {
    super(`Article fetch exceeded ${ms}ms watchdog`);
    this.name = 'ArticleFetchTimeoutError';
  }
}

const FETCH_TIMEOUT_MS = 12_000;

export const useAllArticles = (language: SupportedLanguage = 'en') => {
  return useQuery({
    queryKey: ['all-articles', language],
    queryFn: async ({ signal }) => {
      const t0 = performance.now();

      const fetchPromise = (async () => {
        const { data, error } = await supabase
          .from('srangam_articles')
          .select('*')
          .eq('status', 'published')
          .order('published_date', { ascending: false })
          .abortSignal(signal);

        if (error) {
          console.error('Error fetching database articles:', error);
          throw error;
        }

        return data.map((article): DisplayArticle => {
          const title = typeof article.title === 'object' && article.title !== null
            ? article.title as { [key: string]: string }
            : { en: String(article.title || '') };

          const excerpt = article.dek && typeof article.dek === 'object'
            ? article.dek as { [key: string]: string }
            : { en: '' };

          return {
            id: article.id,
            slug: `/articles/${(article as any).slug_alias || article.slug}`,
            title,
            excerpt,
            theme: article.theme,
            tags: (article.tags || []).map(tag => ({ en: String(tag) })),
            readTime: article.read_time_minutes || 10,
            author: article.author,
            date: article.published_date,
            source: 'database' as const,
          };
        });
      })();

      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new ArticleFetchTimeoutError(FETCH_TIMEOUT_MS)),
          FETCH_TIMEOUT_MS,
        );
      });

      try {
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        if (timeoutId) clearTimeout(timeoutId);
        return result;
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        // Phase X.8.3 — structured degradation signal. Shape mirrors
        // supabase/functions/_shared/observability.ts so it can be lifted
        // into srangam_event_log without rework.
        const reason =
          err instanceof ArticleFetchTimeoutError
            ? 'timeout'
            : (err as any)?.name === 'AbortError'
              ? 'abort'
              : 'error';
        console.warn(JSON.stringify({
          evt: 'articles_fetch_degraded',
          reason,
          duration_ms: Math.round(performance.now() - t0),
          language,
          message: err instanceof Error ? err.message : String(err),
          ts: new Date().toISOString(),
        }));
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    networkMode: 'offlineFirst',
    refetchOnWindowFocus: false,
  });
};
