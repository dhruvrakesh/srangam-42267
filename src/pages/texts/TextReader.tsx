/**
 * /texts/:docCode - one published text, verse by verse. TEXTS_READER_2026_09_27.
 *
 * Sanskrit (Devanagari), IAST and English, 50 passages to a page, the page in
 * the URL (?p=3) so a verse can be cited. Every query goes through
 * src/lib/corpusTexts.ts, which keeps "failed" distinct from "empty" and
 * bounds the passage query with .range().
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { loadPassages, loadTextByDocCode } from '@/lib/corpusTexts';
import {
  PASSAGES_PER_PAGE, displayTranslation, isLowQuality, pageFromQuery, passageLabel, splitDecoration,
} from '@/lib/corpusDisplay';

const nf = new Intl.NumberFormat('en-IN');

function Failure({ what, error }: { what: string; error: string | null }) {
  return (
    <Card className="border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20" role="alert">
      <CardContent className="pt-6 flex items-start gap-3 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" aria-hidden="true" />
        <div>
          <p className="font-semibold">{what} could not be loaded.</p>
          <p className="text-muted-foreground mt-1">This is a loading failure, not missing text. Please try again shortly.</p>
          {error && <p className="text-xs text-muted-foreground mt-2 font-mono">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TextReader() {
  const { docCode } = useParams<{ docCode: string }>();
  const [search, setSearch] = useSearchParams();

  const textQ = useQuery({
    queryKey: ['corpus', 'text', docCode],
    queryFn: () => loadTextByDocCode(docCode),
    staleTime: 5 * 60 * 1000,
  });
  const text = textQ.data?.ok ? textQ.data.row : null;
  const total = text?.passage_count ?? 0;
  const page = pageFromQuery(search.get('p'), total);
  const lastPage = Math.max(1, Math.ceil(total / PASSAGES_PER_PAGE));

  const passQ = useQuery({
    queryKey: ['corpus', 'passages', text?.id, page],
    queryFn: () => loadPassages(text?.id, { offset: (page - 1) * PASSAGES_PER_PAGE, limit: PASSAGES_PER_PAGE }),
    enabled: !!text?.id,
    staleTime: 5 * 60 * 1000,
  });
  const passages = passQ.data;

  // SEARCH_TEXTS_C3A_2026_10_07: a link from search lands here with #p<page>-<idx>. The browser looks
  // for that anchor before the passages exist (and :target never applies to a later element), so
  // once they have arrived, scroll to it and mark it.
  const [arrived, setArrived] = useState<string | null>(null);
  useEffect(() => {
    const h = window.location.hash;
    if (!h || !passages || !passages.ok || !/^#p\d+-\d+$/.test(h)) return;
    const el = document.getElementById(h.slice(1));
    if (!el) return;
    setArrived(h.slice(1));
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [passages]);

  const go = (p: number) => {
    setSearch(p > 1 ? { p: String(p) } : {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pager = total > PASSAGES_PER_PAGE && (
    <nav className="flex items-center justify-between gap-4 my-6" aria-label="Pages of this text">
      <Button variant="outline" size="sm" onClick={() => go(page - 1)} disabled={page <= 1}>
        <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" /> Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {lastPage} &middot; passages {nf.format((page - 1) * PASSAGES_PER_PAGE + 1)}
        &ndash;{nf.format(Math.min(page * PASSAGES_PER_PAGE, total))} of {nf.format(total)}
      </span>
      <Button variant="outline" size="sm" onClick={() => go(page + 1)} disabled={page >= lastPage}>
        Next <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
      </Button>
    </nav>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Helmet>
        <title>{text ? `${text.title} | Sanskrit Texts | Srangam` : 'Sanskrit Texts | Srangam'}</title>
        {text && (
          <meta
            name="description"
            content={`${text.title}: ${nf.format(text.passage_count)} passages in Devanagari, IAST and English, from the Srangam corpus.`}
          />
        )}
      </Helmet>

      <Link to="/texts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" /> All texts
      </Link>

      {textQ.isLoading && <Skeleton className="h-24 w-full" />}
      {textQ.data && !textQ.data.ok && <Failure what="This text" error={textQ.data.error} />}
      {textQ.data?.ok && !text && (
        <div>
          <h1 className="font-serif text-2xl font-semibold">Text not found</h1>
          <p className="text-muted-foreground mt-2">
            No published text has the code <span className="font-mono">{docCode}</span>. It may not be published yet.
          </p>
        </div>
      )}

      {text && (
        <>
          <header className="mb-6">
            <h1 className="font-serif text-3xl font-semibold text-foreground">{text.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {nf.format(text.passage_count)} passages
              {text.category ? <> &middot; {text.category}</> : null}
            </p>
          </header>

          <Card className="mb-6">
            <CardContent className="pt-6 flex items-start gap-3 text-sm text-muted-foreground">
              <Info className="w-5 h-5 shrink-0 text-indigo-dharma" aria-hidden="true" />
              <div className="space-y-1">
                {text.source_note && <p>{text.source_note}</p>}
                <p>
                  The English is an AI-assisted translation
                  {text.translation_engine ? <> ({text.translation_engine})</> : null}, made directly from the
                  Sanskrit and not yet reviewed by a scholar. <span className="font-mono">[ILLEGIBLE]</span> marks
                  words the scan does not show; passages from hard-to-read pages are flagged.
                </p>
              </div>
            </CardContent>
          </Card>

          {pager}

          {passQ.isLoading && (
            <div className="space-y-4" aria-busy="true">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}
          {passages && !passages.ok && <Failure what="The passages" error={passages.error} />}

          {passages?.ok && (
            <ol className="space-y-6" start={(page - 1) * PASSAGES_PER_PAGE + 1}>
              {passages.rows.map((p) => (
                <li key={p.id} id={`p${p.page_no}-${p.idx}`} className={`border-b border-border pb-6 last:border-b-0 scroll-mt-24 target:rounded-md target:bg-amber-50/70 target:px-3 dark:target:bg-amber-950/30${arrived === `p${p.page_no}-${p.idx}` ? ' rounded-md bg-amber-50/70 px-3 dark:bg-amber-950/30' : ''}`}>
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <a href={`#p${p.page_no}-${p.idx}`} className="font-mono hover:text-foreground">
                      {passageLabel(p)}
                    </a>
                    {isLowQuality(p.quality_score) && (
                      <span className="rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-1.5 py-0.5">
                        hard-to-read scan
                      </span>
                    )}
                  </div>
                  {/* READER_MARKS_2026_10_07: an ornamental rule of the page, drawn, not printed as text */}
                  {(splitDecoration(p.sanskrit).rule || splitDecoration(p.iast).rule) && (
                    <div aria-hidden="true" className="mb-3 h-px w-24 bg-border" />
                  )}
                  <p lang="sa" className="font-devanagari text-lg leading-relaxed whitespace-pre-line text-foreground">
                    {splitDecoration(p.sanskrit).text}
                  </p>
                  {splitDecoration(p.iast).text && (
                    <p lang="sa-Latn" className="mt-2 italic text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                      {splitDecoration(p.iast).text}
                    </p>
                  )}
                  <p lang="en" className="mt-3 font-serif leading-relaxed whitespace-pre-line text-foreground">
                    {displayTranslation(p.translation)}
                  </p>
                </li>
              ))}
            </ol>
          )}

          {pager}
        </>
      )}
    </div>
  );
}
