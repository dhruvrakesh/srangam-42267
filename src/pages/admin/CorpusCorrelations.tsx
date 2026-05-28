/**
 * Phase X.6 — Corpus Correlations (admin, read-only).
 *
 * Surfaces the top correlated article pairs computed by the
 * `get_corpus_correlations` RPC over shared gazetteer places and
 * shared Puranic citations. The point is curatorial: surface
 * candidate links a human can then choose to formalise via the
 * existing Cross-References admin flow. Nothing here writes.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Loader2, ExternalLink, Network } from 'lucide-react';
import { useCorpusCorrelations } from '@/hooks/useCorpusCorrelations';

export default function CorpusCorrelations() {
  const [minShared, setMinShared] = useState(1);
  const [limitRows, setLimitRows] = useState(100);
  const { data, isLoading, error, refetch, isFetching } = useCorpusCorrelations({
    minShared,
    limitRows,
  });

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Corpus Correlations</h1>
          <Badge variant="secondary">read-only</Badge>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Article pairs ranked by Jaccard similarity over shared gazetteer
          places and shared Puranic citations. Use this to surface candidate
          cross-references your curators may want to formalise — promotion
          stays a manual step in the Cross-References admin flow.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Query parameters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              Min shared signals: {minShared}
            </label>
            <Slider
              value={[minShared]}
              onValueChange={(v) => setMinShared(v[0])}
              min={1}
              max={10}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              Result cap: {limitRows}
            </label>
            <Slider
              value={[limitRows]}
              onValueChange={(v) => setLimitRows(v[0])}
              min={25}
              max={500}
              step={25}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => refetch()} disabled={isFetching} className="w-full">
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Refreshing…
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Top correlated article pairs
            {data && (
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                ({data.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Computing correlations…</span>
            </div>
          ) : error ? (
            <div className="text-sm text-destructive py-4">
              Failed to load: {(error as Error).message}
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No correlations match the current threshold. Try lowering “Min shared signals”.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3">Article A</th>
                    <th className="py-2 pr-3">Article B</th>
                    <th className="py-2 pr-3 tabular-nums">Places</th>
                    <th className="py-2 pr-3 tabular-nums">Purāṇas</th>
                    <th className="py-2 pr-3 tabular-nums">Total</th>
                    <th className="py-2 pr-3 tabular-nums">Jaccard</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr
                      key={`${r.article_a}-${r.article_b}-${i}`}
                      className="border-b border-border/20 hover:bg-muted/30"
                    >
                      <td className="py-2 pr-3">
                        {r.slug_a ? (
                          <Link
                            to={`/articles/${r.slug_a}`}
                            className="hover:underline inline-flex items-center gap-1"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="line-clamp-1">{r.title_a ?? r.slug_a}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground font-mono text-xs">
                            {r.article_a.slice(0, 8)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        {r.slug_b ? (
                          <Link
                            to={`/articles/${r.slug_b}`}
                            className="hover:underline inline-flex items-center gap-1"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="line-clamp-1">{r.title_b ?? r.slug_b}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground font-mono text-xs">
                            {r.article_b.slice(0, 8)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">{r.shared_places}</td>
                      <td className="py-2 pr-3 tabular-nums">{r.shared_puranas}</td>
                      <td className="py-2 pr-3 tabular-nums font-medium">{r.shared_total}</td>
                      <td className="py-2 pr-3 tabular-nums">
                        <Badge variant={r.jaccard >= 0.3 ? 'default' : 'secondary'}>
                          {Number(r.jaccard).toFixed(3)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
