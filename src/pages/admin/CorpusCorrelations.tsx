/**
 * Phase X.6 → X.7 — Corpus Correlations (admin, read + curator promotion).
 *
 * Surfaces top correlated article pairs across 5 axes: places, purāṇas,
 * cultural terms, tags, bibliography. Curators can adjust per-axis weights
 * and promote any pair into the existing srangam_cross_references table
 * with a single click (no auto-promotion — humans stay in the loop).
 *
 * Source toggle:
 *   • snapshot (default) — reads the most recent nightly snapshot, <200 ms.
 *   • live              — runs get_corpus_correlations_v2 RPC on the fly.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Loader2,
  ExternalLink,
  Network,
  ChevronDown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  useCorpusCorrelations,
  usePromoteCorrelation,
  DEFAULT_WEIGHTS,
  type CorrelationWeights,
} from '@/hooks/useCorpusCorrelations';

const formatComputedAt = (iso: string | null): string => {
  if (!iso) return 'live';
  const d = new Date(iso);
  return d.toLocaleString();
};

export default function CorpusCorrelations() {
  const [minShared, setMinShared] = useState(1);
  const [limitRows, setLimitRows] = useState(100);
  const [useSnapshot, setUseSnapshot] = useState(true);
  const [weights, setWeights] = useState<CorrelationWeights>(DEFAULT_WEIGHTS);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useCorpusCorrelations({
    minShared,
    limitRows,
    weights,
    source: useSnapshot ? 'snapshot' : 'live',
  });
  const promoteMut = usePromoteCorrelation();

  const rows = data?.rows ?? [];
  const computedAt = data?.computedAt ?? null;
  const mode = data?.mode ?? (useSnapshot ? 'snapshot' : 'live');

  const setWeight = (key: keyof CorrelationWeights) => (v: number[]) =>
    setWeights((w) => ({ ...w, [key]: v[0] / 100 }));

  const weightControls = useMemo(
    () =>
      (
        [
          ['w_place', 'Places'],
          ['w_purana', 'Purāṇas'],
          ['w_term', 'Cultural terms'],
          ['w_tag', 'Tags'],
          ['w_biblio', 'Bibliography'],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}: {weights[key].toFixed(2)}
          </label>
          <Slider
            value={[Math.round(weights[key] * 100)]}
            onValueChange={setWeight(key)}
            min={0}
            max={100}
            step={5}
          />
        </div>
      )),
    [weights],
  );

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <header className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Network className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Corpus Correlations</h1>
          <Badge variant="secondary">curator</Badge>
          <Badge variant="outline" className="font-mono text-xs">
            {mode === 'snapshot' ? `snapshot · ${formatComputedAt(computedAt)}` : 'live RPC'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Article pairs ranked by weighted Jaccard similarity across five axes:
          shared gazetteer places, Puranic citations, cultural terms, tags, and
          bibliography entries. Adjust weights to surface different kinds of
          connection. Promotion to a formal cross-reference is always a manual
          click — AI for curation, not expansion.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Query parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
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
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Switch
                  id="snapshot-toggle"
                  checked={useSnapshot}
                  onCheckedChange={setUseSnapshot}
                />
                <Label htmlFor="snapshot-toggle" className="text-xs cursor-pointer">
                  Use snapshot
                </Label>
              </div>
              <Button onClick={() => refetch()} disabled={isFetching} size="sm">
                {isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Refreshing…
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </div>

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="-ml-2 gap-1">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                />
                Advanced — per-axis weights
                <Badge variant="secondary" className="ml-2 font-mono text-[10px]">
                  Σ {(
                    weights.w_place + weights.w_purana + weights.w_term
                    + weights.w_tag + weights.w_biblio
                  ).toFixed(2)}
                </Badge>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {weightControls}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setWeights(DEFAULT_WEIGHTS)}
                  disabled={
                    JSON.stringify(weights) === JSON.stringify(DEFAULT_WEIGHTS)
                  }
                >
                  Reset defaults
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Top correlated article pairs
            {data && (
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                ({rows.length})
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
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              {mode === 'snapshot'
                ? 'No snapshot available yet. Toggle off "Use snapshot" to compute live, or wait for the nightly job.'
                : 'No correlations match the current threshold. Try lowering “Min shared signals”.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3">Article A</th>
                    <th className="py-2 pr-3">Article B</th>
                    <th className="py-2 pr-3 tabular-nums">Pl.</th>
                    <th className="py-2 pr-3 tabular-nums">Pur.</th>
                    <th className="py-2 pr-3 tabular-nums">Term</th>
                    <th className="py-2 pr-3 tabular-nums">Tag</th>
                    <th className="py-2 pr-3 tabular-nums">Bib.</th>
                    <th className="py-2 pr-3 tabular-nums">Σ</th>
                    <th className="py-2 pr-3 tabular-nums">Jaccard</th>
                    <th className="py-2 pr-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
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
                            <span className="line-clamp-1 max-w-[18ch]">
                              {r.title_a ?? r.slug_a}
                            </span>
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
                            <span className="line-clamp-1 max-w-[18ch]">
                              {r.title_b ?? r.slug_b}
                            </span>
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
                      <td className="py-2 pr-3 tabular-nums">{r.shared_terms}</td>
                      <td className="py-2 pr-3 tabular-nums">{r.shared_tags}</td>
                      <td className="py-2 pr-3 tabular-nums">{r.shared_biblio}</td>
                      <td className="py-2 pr-3 tabular-nums font-medium">
                        {r.shared_total}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">
                        <Badge variant={Number(r.jaccard) >= 0.3 ? 'default' : 'secondary'}>
                          {Number(r.jaccard).toFixed(3)}
                        </Badge>
                      </td>
                      <td className="py-2 pr-0 text-right">
                        {r.promoted ? (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Promoted
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 h-7 px-2"
                            disabled={promoteMut.isPending}
                            onClick={() => promoteMut.mutate(r)}
                          >
                            <Sparkles className="h-3 w-3" /> Promote
                          </Button>
                        )}
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
