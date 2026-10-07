/**
 * /texts - the published Sanskrit corpus. TEXTS_READER_2026_09_27.
 *
 * Reads srangam_texts through src/lib/corpusTexts.ts (published rows only; RLS
 * enforces the same). A failed query is shown as a failure, never as "no
 * texts" - that is the loader's contract and this page keeps it.
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { listPublishedTexts } from '@/lib/corpusTexts';
import TextSearch from '@/components/texts/TextSearch';   // SEARCH_TEXTS_C3A_2026_10_07

const nf = new Intl.NumberFormat('en-IN');

export default function TextsIndex() {
  const q = useQuery({
    queryKey: ['corpus', 'texts'],
    queryFn: listPublishedTexts,
    staleTime: 5 * 60 * 1000,
  });
  const r = q.data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Helmet>
        <title>Sanskrit Texts | Srangam</title>
        <meta
          name="description"
          content="Sanskrit texts from the Srangam corpus, verse by verse: Devanagari, IAST and an AI-assisted English translation, with the scan quality of every passage."
        />
      </Helmet>

      <header className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-foreground flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-burgundy" aria-hidden="true" />
          Sanskrit Texts
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed max-w-3xl">
          Works from the Srangam corpus, digitised from printed editions and translated with
          AI assistance. Each text is published only after an automated publication check; the
          Sanskrit is shown exactly as it was read from the page, damage included.
        </p>
      </header>

      {r && r.ok && r.rows.length > 0 && <TextSearch />}

      {q.isLoading && (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {r && !r.ok && (
        <Card className="border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20" role="alert">
          <CardContent className="pt-6 flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <p className="font-semibold">The corpus could not be loaded.</p>
              <p className="text-muted-foreground mt-1">
                This is a loading failure, not an empty corpus. Please try again shortly.
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">{r.error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {r && r.ok && r.rows.length === 0 && (
        <p className="text-muted-foreground">No texts are published yet.</p>
      )}

      {r && r.ok && r.rows.length > 0 && (
        <ul className="space-y-4">
          {r.rows.map((t) => (
            <li key={t.id}>
              <Link
                to={`/texts/${encodeURIComponent(t.doc_code)}`}
                className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="hover:border-burgundy/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-xl">{t.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {t.category && <Badge variant="secondary">{t.category}</Badge>}
                      <span>{nf.format(t.passage_count)} passages</span>
                      {t.translation_engine && <span>&middot; translated with {t.translation_engine}</span>}
                    </div>
                    {t.source_note && <p>{t.source_note}</p>}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
