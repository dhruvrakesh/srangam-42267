/**
 * Phase H.3 — Geography & Media admin page.
 *
 * Single surgical surface for the operations the user reported as missing:
 *
 *   1. Pin backfill (per-article + bulk) — wires the existing
 *      `backfill-article-pins` edge function into the UI for the first time.
 *   2. OG image regeneration & retire — uses the new tenant-aware
 *      `generate-article-og` (Gemini-first) and `retire-og-image` functions
 *      together with the `srangam_media_assets` lifecycle table.
 *
 * The page is admin-only (mounted under /admin via ProtectedRoute) and is
 * lazy-loaded, so it adds 0kB to the public bundle.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Image as ImageIcon, RotateCcw, Trash2, Sparkles, RefreshCcw } from 'lucide-react';
import { JobProgressCard } from '@/components/admin/JobProgressCard';

interface ArticleRow {
  id: string;
  slug: string;
  slug_alias: string | null;
  theme: string;
  title: Record<string, string> | string;
  og_image_url: string | null;
  og_image_version: number | null;
  og_image_status: string | null;
  pin_count: number;
  status: string;
}

function getEnglishTitle(t: ArticleRow['title']): string {
  if (typeof t === 'object' && t) return t.en ?? Object.values(t)[0] ?? '';
  return String(t ?? '');
}

export default function GeographyMedia() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusSlug = searchParams.get('article');
  const [filter, setFilter] = useState(focusSlug ?? '');
  const [busyArticleId, setBusyArticleId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState<null | 'pins' | 'og_missing' | 'og_force'>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const cancelledJobRef = useRef<Set<string>>(new Set());
  const [logs, setLogs] = useState<string[]>([]);
  const [flashedRowId, setFlashedRowId] = useState<string | null>(null);

  function log(s: string) {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${s}`, ...prev].slice(0, 200));
  }

  // Phase X.1 — rehydrate the most-recent running job on mount so a tab
  // refresh re-attaches the progress card to a backfill or OG run that the
  // server is still pumping. Admin-only RLS already scopes the query.
  useEffect(() => {
    if (activeJobId) return; // do not stomp an in-page kick-off
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('srangam_admin_jobs')
        .select('id')
        .eq('status', 'running')
        .in('kind', ['pin_backfill', 'og_generate', 'og_force'])
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data?.id) {
        setActiveJobId(data.id);
        log(`↻ Re-attached to running job ${data.id.slice(0, 8)}`);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: poll the job row to learn whether the operator clicked Cancel
  // between chunks. Cheap (single indexed PK lookup).
  async function jobIsCancelled(jobId: string): Promise<boolean> {
    if (cancelledJobRef.current.has(jobId)) return true;
    const { data } = await supabase
      .from('srangam_admin_jobs')
      .select('status')
      .eq('id', jobId)
      .maybeSingle();
    if (data?.status === 'cancelled') {
      cancelledJobRef.current.add(jobId);
      return true;
    }
    return false;
  }


  const { data: articles = [], isLoading, refetch } = useQuery({
    queryKey: ['admin', 'geography-media', 'articles'],
    queryFn: async (): Promise<ArticleRow[]> => {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('id, slug, slug_alias, theme, title, og_image_url, og_image_version, og_image_status, status')
        .eq('status', 'published')
        .order('updated_at', { ascending: false });
      if (error) throw error;

      const ids = (data ?? []).map((a) => a.id);
      let pinCounts: Record<string, number> = {};
      if (ids.length > 0) {
        const { data: pins } = await supabase
          .from('srangam_article_pins')
          .select('article_id')
          .in('article_id', ids);
        for (const p of pins ?? []) {
          pinCounts[p.article_id] = (pinCounts[p.article_id] ?? 0) + 1;
        }
      }
      return (data ?? []).map((a: any) => ({ ...a, pin_count: pinCounts[a.id] ?? 0 }));
    },
  });

  const filtered = useMemo(() => {
    if (!filter.trim()) return articles;
    const f = filter.toLowerCase();
    return articles.filter(
      (a) =>
        a.slug.toLowerCase().includes(f) ||
        (a.slug_alias ?? '').toLowerCase().includes(f) ||
        getEnglishTitle(a.title).toLowerCase().includes(f) ||
        a.theme.toLowerCase().includes(f),
    );
  }, [articles, filter]);

  const stats = useMemo(() => {
    const total = articles.length;
    const withPins = articles.filter((a) => a.pin_count > 0).length;
    const totalPins = articles.reduce((s, a) => s + a.pin_count, 0);
    const withOg = articles.filter((a) => !!a.og_image_url).length;
    return { total, withPins, totalPins, withOg, withoutOg: total - withOg, withoutPins: total - withPins };
  }, [articles]);

  // Phase J.1 — deep-link from per-article ImagingLabLauncher CTA.
  // Surfaces the requested article at the top of the table, scrolls to it,
  // and flashes its row briefly so the admin's eye lands on the right line.
  useEffect(() => {
    if (!focusSlug || isLoading) return;
    const target = articles.find(
      (a) => a.slug === focusSlug || a.slug_alias === focusSlug,
    );
    if (!target) return;
    setFlashedRowId(target.id);
    requestAnimationFrame(() => {
      const el = document.getElementById(`gm-row-${target.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const t = setTimeout(() => {
      setFlashedRowId(null);
      const next = new URLSearchParams(searchParams);
      next.delete('article');
      setSearchParams(next, { replace: true });
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSlug, isLoading, articles.length]);

  // ---- pin backfill (single article — unchanged single-shot path) ----
  async function backfillPinsSingle(articleId: string) {
    log(`Backfilling pins for article…`);
    const { data, error } = await supabase.functions.invoke('backfill-article-pins', {
      body: { article_id: articleId },
    });
    if (error) throw error;
    const summary = `processed=${data?.processed ?? 0} cost=$${data?.total_cost_usd_estimate ?? 0}`;
    log(`✓ Pin backfill done: ${summary}`);
    toast({ title: 'Pin backfill complete', description: summary });
    await qc.invalidateQueries({ queryKey: ['admin', 'geography-media'] });
  // ---- pin backfill (bulk — server self-pumps after first chunk) ----
  // Phase X.1: the browser only kicks off chunk 0. The edge function
  // re-invokes itself via EdgeRuntime.waitUntil for every subsequent chunk,
  // so closing the tab no longer stalls the job. Progress streams in via
  // Realtime on srangam_admin_jobs.
  async function backfillPinsBulk(limit = 50, chunkSize = 5) {
    setBulkBusy('pins');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: jobRow, error: jobErr } = await supabase
        .from('srangam_admin_jobs')
        .insert({
          kind: 'pin_backfill',
          status: 'running',
          total: limit,
          started_at: new Date().toISOString(),
          created_by: user?.id ?? null,
          params: { all_published: true, limit, chunk_size: chunkSize },
        })
        .select('id')
        .single();
      if (jobErr || !jobRow) throw jobErr ?? new Error('failed to create job');

      const jobId = jobRow.id as string;
      setActiveJobId(jobId);
      log(`▶ Started pin backfill job ${jobId.slice(0, 8)} (server-pumped, chunks of ${chunkSize})`);

      // Single kick-off for chunk 0. The edge function will self-reinvoke
      // for every chunk after this and finishJob() when done.
      const { data, error } = await supabase.functions.invoke('backfill-article-pins', {
        body: { all_published: true, limit, offset: 0, chunk_size: chunkSize, job_id: jobId },
      });
      if (error) throw error;
      if (typeof data?.total === 'number' && data.total !== limit) {
        await supabase.from('srangam_admin_jobs').update({ total: data.total }).eq('id', jobId);
      }
      log(`  chunk 0 returned (pumped=${data?.pumped ? 'yes' : 'no'}, done=${data?.done ? 'yes' : 'no'}). Watch progress card.`);
    } catch (e: any) {
      log(`✗ Pin backfill failed: ${e?.message ?? e}`);
      toast({ title: 'Pin backfill failed', description: e?.message ?? 'Unknown error', variant: 'destructive' });
    } finally {
      setBulkBusy(null);
    }
  }

  // ---- OG generation (single article) ----
  async function generateOg(article: ArticleRow, force: boolean) {
    const title = getEnglishTitle(article.title) || 'Untitled';
    const slug = article.slug_alias || article.slug;
    log(`${force ? 'Regenerating' : 'Generating'} OG for "${title}"…`);
    const { data, error } = await supabase.functions.invoke('generate-article-og', {
      body: { articleId: article.id, title, theme: article.theme, slug, force },
    });
    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error || 'unknown');
    const tag = data.skipped
      ? `skipped (${data.reason})`
      : `${data.provider} v${data.version} $${data.cost_usd}`;
    log(`✓ OG ${tag} — ${title}`);
    return { ok: true, cost: Number(data?.cost_usd ?? 0) };
  }

  async function retireOg(article: ArticleRow) {
    log(`Retiring OG for "${getEnglishTitle(article.title)}"…`);
    const { data, error } = await supabase.functions.invoke('retire-og-image', {
      body: { articleId: article.id },
    });
    if (error) throw new Error(error.message);
    if (!data?.ok) throw new Error(data?.error || 'unknown');
    log(`✓ Retired asset v${data.version}`);
  }

  async function runOnRow(action: 'pins' | 'og_gen' | 'og_force' | 'og_retire', article: ArticleRow) {
    setBusyArticleId(article.id);
    try {
      if (action === 'pins') await backfillPinsSingle(article.id);
      else if (action === 'og_gen') await generateOg(article, false);
      else if (action === 'og_force') await generateOg(article, true);
      else if (action === 'og_retire') await retireOg(article);
      await qc.invalidateQueries({ queryKey: ['admin', 'geography-media'] });
    } catch (e: any) {
      log(`✗ ${action} failed: ${e?.message ?? e}`);
      toast({ title: `${action} failed`, description: e?.message ?? 'Unknown error', variant: 'destructive' });
    } finally {
      setBusyArticleId(null);
    }
  }

  // ---- OG bulk (Phase X.1 — server self-pumps after first article) ----
  // The browser persists the full target list into srangam_admin_jobs.params
  // and kicks off cursor=0. The edge function processes one article per
  // invocation, reports progress, and self-reinvokes for the next cursor
  // via EdgeRuntime.waitUntil. Refresh-safe, tab-close-safe, cancel-safe.
  async function bulkOg(force: boolean) {
    const targets = (force ? articles : articles.filter((a) => !a.og_image_url)).map((a) => ({
      articleId: a.id,
      title: getEnglishTitle(a.title) || 'Untitled',
      theme: a.theme,
      slug: a.slug_alias || a.slug,
    }));
    if (targets.length === 0) {
      toast({ title: 'Nothing to do', description: force ? 'No articles found.' : 'All articles already have OG images.' });
      return;
    }
    setBulkBusy(force ? 'og_force' : 'og_missing');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: jobRow, error: jobErr } = await supabase
        .from('srangam_admin_jobs')
        .insert({
          kind: force ? 'og_force' : 'og_generate',
          status: 'running',
          total: targets.length,
          started_at: new Date().toISOString(),
          created_by: user?.id ?? null,
          // Persist the full target list so subsequent self-pumps don't need
          // the browser to be alive.
          params: { force, count: targets.length, targets },
        })
        .select('id')
        .single();
      if (jobErr || !jobRow) throw jobErr ?? new Error('failed to create job');
      const jobId = jobRow.id as string;
      setActiveJobId(jobId);
      log(`▶ ${force ? 'Force-regenerating' : 'Generating missing'} OG for ${targets.length} article(s) — server-pumped job ${jobId.slice(0, 8)}`);

      // Kick off cursor 0; server pumps the rest.
      const { data, error } = await supabase.functions.invoke('generate-article-og', {
        body: { job_id: jobId, cursor: 0, force, targets },
      });
      if (error) throw error;
      log(`  cursor 0 returned (pumped=${data?.pumped ? 'yes' : 'no'}, done=${data?.done ? 'yes' : 'no'}). Watch progress card.`);
    } catch (e: any) {
      log(`✗ Bulk OG failed: ${e?.message ?? e}`);
      toast({ title: 'Bulk OG failed', description: e?.message ?? 'Unknown error', variant: 'destructive' });
    } finally {
      setBulkBusy(null);
    }
  }


  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Geography &amp; Media</h1>
        <p className="text-muted-foreground">
          Backfill article-to-place pins (powers mini-maps and the public Atlas) and manage AI-generated cover images
          (Gemini-first, OpenAI fallback). All actions are idempotent and tenant-aware.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Published" value={stats.total} />
        <StatCard label="With pins" value={`${stats.withPins} / ${stats.total}`} />
        <StatCard label="Total pins" value={stats.totalPins} />
        <StatCard label="With OG image" value={`${stats.withOg} / ${stats.total}`} />
        <StatCard label="Missing OG" value={stats.withoutOg} />
      </div>

      {/* Bulk actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" /> Pin Backfill
            </CardTitle>
            <CardDescription>
              Scans evidence rows, content, and AI NER against the gazetteer to populate article geography.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              onClick={() => backfillPinsBulk(50, 5)}
              disabled={bulkBusy !== null}
            >
              {bulkBusy === 'pins' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Backfill all published (50 max)
            </Button>
            <Button variant="outline" onClick={() => refetch()} disabled={bulkBusy !== null}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh stats
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5" /> OG Image Pipeline
            </CardTitle>
            <CardDescription>
              Provider: Gemini Nano Banana (primary), OpenAI gpt-image-1 (fallback). Stored in Google Drive, versioned.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => bulkOg(false)} disabled={bulkBusy !== null}>
              {bulkBusy === 'og_missing' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate missing ({stats.withoutOg})
            </Button>
            <Button variant="secondary" onClick={() => bulkOg(true)} disabled={bulkBusy !== null}>
              {bulkBusy === 'og_force' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
              Force regenerate ({stats.total})
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live job progress (Realtime-driven) */}
      {activeJobId && (
        <JobProgressCard jobId={activeJobId} onDismiss={() => setActiveJobId(null)} />
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted/30 p-3 rounded max-h-48 overflow-auto whitespace-pre-wrap">
{logs.join('\n')}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Per-article table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle>Per-article controls</CardTitle>
            <Input
              placeholder="Filter by title, slug, or theme…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="md:w-80"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Theme</th>
                    <th className="py-2 pr-3">Pins</th>
                    <th className="py-2 pr-3">OG</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const busy = busyArticleId === a.id;
                    return (
                      <tr
                        key={a.id}
                        id={`gm-row-${a.id}`}
                        className={`border-b border-border/40 align-top transition-colors duration-700 ${
                          flashedRowId === a.id ? 'bg-primary/10' : ''
                        }`}
                      >
                        <td className="py-2 pr-3">
                          <div className="font-medium">{getEnglishTitle(a.title)}</div>
                          <div className="text-xs text-muted-foreground">{a.slug_alias || a.slug}</div>
                        </td>
                        <td className="py-2 pr-3">
                          <Badge variant="outline">{a.theme}</Badge>
                        </td>
                        <td className="py-2 pr-3">
                          <Badge variant={a.pin_count > 0 ? 'default' : 'secondary'}>
                            {a.pin_count}
                          </Badge>
                        </td>
                        <td className="py-2 pr-3">
                          {a.og_image_url ? (
                            <Badge>v{a.og_image_version ?? 1}</Badge>
                          ) : (
                            <Badge variant="outline">none</Badge>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex flex-wrap gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => runOnRow('pins', a)}
                              disabled={busy}
                            >
                              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                              <span className="ml-1">Pins</span>
                            </Button>
                            {a.og_image_url ? (
                              <>
                                <Button size="sm" variant="secondary" onClick={() => runOnRow('og_force', a)} disabled={busy}>
                                  <RotateCcw className="h-3 w-3 mr-1" /> Regen
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => runOnRow('og_retire', a)} disabled={busy}>
                                  <Trash2 className="h-3 w-3 mr-1" /> Retire
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" onClick={() => runOnRow('og_gen', a)} disabled={busy}>
                                <Sparkles className="h-3 w-3 mr-1" /> Gen OG
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
