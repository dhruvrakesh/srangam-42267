/**
 * /corpus/:docCode - one text of the working corpus, for signed-in readers. CORPUS_READER_C5_2026_10_08.
 *
 * Like /texts/:docCode (50 passages to a page, ?p=3 in the URL, #p<page>-<idx> anchors), but for
 * any document on the translation desk, with the Hindi beside the English and, for each passage,
 * the passages nearest to it in meaning across the whole corpus (from its stored vector; no AI call).
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Info, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CorpusGate, { CorpusRefused } from '@/components/corpus/CorpusGate';
import {
  PASSAGES_PER_PAGE, displayTranslation, isLowQuality, pageFromQuery, passageLabel, splitDecoration,
} from '@/lib/corpusDisplay';
import {
  loadMirrorDoc, loadMirrorPage, mirrorHref, type MirrorPassage, type MirrorResult, similarPassages,
} from '@/lib/corpusMirror';

const nf = new Intl.NumberFormat('en-IN');

function Failure({ what, r }: { what: string; r: MirrorResult<unknown> }) {
  if (r.refused) return <CorpusRefused message={r.error} />;
  return (
    <Card className="border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20" role="alert">
      <CardContent className="pt-6 flex items-start gap-3 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" aria-hidden="true" />
        <div>
          <p className="font-semibold">{what} could not be loaded.</p>
          <p className="text-muted-foreground mt-1">This is a loading failure, not missing text. Please try again shortly.</p>
          {r.error && <p className="text-xs text-muted-foreground mt-2 font-mono">{r.error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function Similar({ docCode, p }: { docCode: string; p: MirrorPassage }) {
  const q = useQuery({
    queryKey: ['mirror', 'similar', docCode, p.page_no, p.idx],
    queryFn: () => similarPassages(docCode, p.page_no, p.idx),
    staleTime: 10 * 60 * 1000,
  });
  if (q.isLoading) return <p className="text-xs text-muted-foreground"><Loader2 className="inline w-3 h-3 mr-1 animate-spin" aria-hidden="true" />Looking across the corpus...</p>;
  const r = q.data;
  if (!r) return null;
  if (!r.ok) return <p role="alert" className="text-xs text-amber-800 dark:text-amber-200">{r.error}</p>;
  if (r.rows.length === 0) return <p className="text-xs text-muted-foreground">This passage has no meaning vector yet (it is embedded after it is translated).</p>;
  return (
    <ol className="mt-2 space-y-2 border-l-2 border-border pl-3">
      {r.rows.map((h) => (
        <li key={`${h.doc_code}-${h.page_no}-${h.idx}`} className="text-xs">
          <Link to={mirrorHref(h)} className="text-burgundy hover:underline">
            {h.title} <span className="font-mono">{passageLabel(h)}</span>
          </Link>
          {typeof h.similarity === 'number' && <span className="text-muted-foreground"> &middot; {Math.round(h.similarity * 100)}%</span>}
          {h.snippet && <p lang="en" className="mt-0.5 font-serif text-sm text-muted-foreground line-clamp-2">{displayTranslation(h.snippet)}</p>}
        </li>
      ))}
    </ol>
  );
}

function CorpusDocBody() {
  const { docCode = '' } = useParams<{ docCode: string }>();
  const [search, setSearch] = useSearchParams();
  const [showHindi, setShowHindi] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const docQ = useQuery({
    queryKey: ['mirror', 'doc', docCode],
    queryFn: () => loadMirrorDoc(docCode),
    staleTime: 2 * 60 * 1000,
  });
  const doc = docQ.data?.ok ? docQ.data.rows[0] ?? null : null;
  const total = doc?.passages ?? 0;
  const page = pageFromQuery(search.get('p'), total);
  const lastPage = Math.max(1, Math.ceil(total / PASSAGES_PER_PAGE));

  const passQ = useQuery({
    queryKey: ['mirror', 'page', docCode, page],
    queryFn: () => loadMirrorPage(docCode, page),
    enabled: !!doc,
    staleTime: 2 * 60 * 1000,
  });
  const passages = passQ.data;

  // A link from a search lands with #p<page>-<idx>: scroll to it once the passages are here.
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
  const anyHindi = !!(passages?.ok && passages.rows.some((p) => p.hindi && p.hindi.trim()));

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
        <title>{doc ? `${doc.title} | Working Corpus | Srangam` : 'Working Corpus | Srangam'}</title>
      </Helmet>
      <Link to="/corpus" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" /> The working corpus
      </Link>

      {docQ.isLoading && <Skeleton className="h-24 w-full" />}
      {docQ.data && !docQ.data.ok && <Failure what="This text" r={docQ.data} />}
      {docQ.data?.ok && !doc && (
        <div>
          <h1 className="font-serif text-2xl font-semibold">Text not found</h1>
          <p className="text-muted-foreground mt-2">
            The working corpus has no text with the code <span className="font-mono">{docCode}</span>.
          </p>
        </div>
      )}

      {doc && (
        <>
          <header className="mb-6">
            <h1 className="font-serif text-3xl font-semibold text-foreground">{doc.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {nf.format(doc.passages)} passages &middot; {nf.format(doc.english)} in English
              {doc.hindi > 0 ? <> &middot; {nf.format(doc.hindi)} in Hindi</> : null}
              {doc.category ? <> &middot; {doc.category}</> : null}
              {doc.published ? <> &middot; <Link to={`/texts/${encodeURIComponent(doc.doc_code)}`} className="text-burgundy hover:underline">published reader</Link></> : null}
            </p>
          </header>

          <Card className="mb-6">
            <CardContent className="pt-6 flex items-start gap-3 text-sm text-muted-foreground">
              <Info className="w-5 h-5 shrink-0 text-indigo-dharma" aria-hidden="true" />
              <div className="space-y-2">
                <p>
                  Working text, not reviewed: the Sanskrit as the scanner read it, and machine translations into
                  English and Hindi. Passages not yet translated show the Sanskrit alone.
                </p>
                {anyHindi && (
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={showHindi} onChange={(e) => setShowHindi(e.target.checked)} />
                    Show the Hindi
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {pager}

          {passQ.isLoading && (
            <div className="space-y-4" aria-busy="true">
              <Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" />
            </div>
          )}
          {passages && !passages.ok && <Failure what="The passages" r={passages} />}

          {passages?.ok && (
            <ol className="space-y-6" start={(page - 1) * PASSAGES_PER_PAGE + 1}>
              {passages.rows.map((p) => {
                const id = `p${p.page_no}-${p.idx}`;
                const sa = splitDecoration(p.sanskrit);
                const ia = splitDecoration(p.iast);
                const en = displayTranslation(p.translation);
                return (
                  <li key={id} id={id} className={`border-b border-border pb-6 last:border-b-0 scroll-mt-24 target:rounded-md target:bg-amber-50/70 target:px-3 dark:target:bg-amber-950/30${arrived === id ? ' rounded-md bg-amber-50/70 px-3 dark:bg-amber-950/30' : ''}`}>
                    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <a href={`#${id}`} className="font-mono hover:text-foreground">{passageLabel(p)}</a>
                      {isLowQuality(p.quality_score) && (
                        <span className="rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-1.5 py-0.5">hard-to-read scan</span>
                      )}
                      {p.text_type && p.text_type !== 'mula' && <span className="rounded bg-muted px-1.5 py-0.5">{p.text_type}</span>}
                    </div>
                    {(sa.rule || ia.rule) && <div aria-hidden="true" className="mb-3 h-px w-24 bg-border" />}
                    <p lang="sa" className="font-devanagari text-lg leading-relaxed whitespace-pre-line text-foreground">{sa.text}</p>
                    {ia.text && <p lang="sa-Latn" className="mt-2 italic text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{ia.text}</p>}
                    {en && <p lang="en" className="mt-3 font-serif leading-relaxed whitespace-pre-line text-foreground">{en}</p>}
                    {showHindi && p.hindi && p.hindi.trim() && (
                      <p lang="hi" className="mt-2 font-devanagari leading-relaxed whitespace-pre-line text-foreground/90">{displayTranslation(p.hindi)}</p>
                    )}
                    {en && (
                      <button
                        type="button"
                        onClick={() => setOpen(open === id ? null : id)}
                        aria-expanded={open === id}
                        className="mt-2 inline-flex items-center text-xs text-burgundy hover:underline"
                      >
                        <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
                        {open === id ? 'Hide similar passages' : 'Similar passages in the corpus'}
                      </button>
                    )}
                    {open === id && <Similar docCode={docCode} p={p} />}
                  </li>
                );
              })}
            </ol>
          )}

          {pager}
        </>
      )}
    </div>
  );
}

export default function CorpusDoc() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <CorpusGate>
        <CorpusDocBody />
      </CorpusGate>
    </>
  );
}
