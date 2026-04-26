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
import { useState, useMemo, useRef } from 'react';
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
  const [filter, setFilter] = useState('');
  const [busyArticleId, setBusyArticleId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState<null | 'pins' | 'og_missing' | 'og_force'>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const cancelledJobRef = useRef<Set<string>>(new Set());
  const [logs, setLogs] = useState<string[]>([]);

  function log(s: string) {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${s}`, ...prev].slice(0, 200));
  }

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
  }

  // ---- pin backfill (bulk — chunked, durable, cancellable) ----
  async function backfillPinsBulk(limit = 50, chunkSize = 5) {
    setBulkBusy('pins');
    try {
      // 1. Pre-create the durable job row so the UI can subscribe immediately.
      const { data: { user } } = await supabase.auth.getUser();
      // We don't yet know the exact total (the function will count published
      // rows on first invocation), so seed with `limit` and let the worker
      // correct it via the first chunk's `total` response.
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
      log(`▶ Started pin backfill job ${jobId.slice(0, 8)} (chunks of ${chunkSize})`);

      // 2. Drive chunks until done / cancelled / fatal.
      let offset = 0;
      let actualTotal = limit;
      while (true) {
        if (await jobIsCancelled(jobId)) {
          log(`■ Cancelled by operator at offset ${offset}/${actualTotal}`);
          break;
        }
        const { data, error } = await supabase.functions.invoke('backfill-article-pins', {
          body: { all_published: true, limit, offset, chunk_size: chunkSize, job_id: jobId },
        });
        if (error) throw error;

        // Sync the real total back into the job row on first response.
        if (typeof data?.total === 'number' && data.total !== actualTotal) {
          actualTotal = data.total;
          await supabase.from('srangam_admin_jobs').update({ total: actualTotal }).eq('id', jobId);
        }

        if (data?.cancelled || data?.done) break;
        if (typeof data?.next_offset !== 'number' || data.next_offset <= offset) {
          // Safety: avoid infinite loop on a misbehaving worker.
          log(`⚠ Worker returned non-advancing offset; stopping.`);
          await supabase
            .from('srangam_admin_jobs')
            .update({ status: 'failed', last_error: 'non-advancing offset', finished_at: new Date().toISOString() })
            .eq('id', jobId);
          break;
        }
        offset = data.next_offset;
      }

      await qc.invalidateQueries({ queryKey: ['admin', 'geography-media'] });
      toast({ title: 'Pin backfill finished', description: 'See the progress card for details.' });
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

  // ---- OG bulk (chunked, durable, cancellable) ----
  async function bulkOg(force: boolean) {
    const targets = force ? articles : articles.filter((a) => !a.og_image_url);
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
          params: { force, count: targets.length },
        })
        .select('id')
        .single();
      if (jobErr || !jobRow) throw jobErr ?? new Error('failed to create job');
      const jobId = jobRow.id as string;
      setActiveJobId(jobId);
      log(`▶ ${force ? 'Force-regenerating' : 'Generating missing'} OG for ${targets.length} article(s) — job ${jobId.slice(0, 8)}`);

      // Drive one article at a time. Each call is short (~10 s for Gemini)
      // so we never approach the 150 s edge-function ceiling. Cancellation
      // is checked between every article.
      for (const a of targets) {
        if (await jobIsCancelled(jobId)) {
          log(`■ Cancelled by operator.`);
          break;
        }
        let ok = false;
        let cost = 0;
        let errMsg: string | null = null;
        try {
          const r = await generateOg(a, force);
          ok = true;
          cost = r.cost;
        } catch (e: any) {
          errMsg = e?.message ?? String(e);
          log(`  ✗ ${getEnglishTitle(a.title)}: ${errMsg}`);
        }

        // Per-item update on the job row → realtime push to the progress card.
        const { data: cur } = await supabase
          .from('srangam_admin_jobs')
          .select('processed,succeeded,failed,cost_usd,last_error')
          .eq('id', jobId)
          .maybeSingle();
        if (cur) {
          await supabase
            .from('srangam_admin_jobs')
            .update({
              processed: cur.processed + 1,
              succeeded: cur.succeeded + (ok ? 1 : 0),
              failed: cur.failed + (ok ? 0 : 1),
              cost_usd: Number(cur.cost_usd) + cost,
              last_item: a.slug_alias || a.slug,
              last_error: ok ? cur.last_error : errMsg,
            })
            .eq('id', jobId);
        }

        await new Promise((r) => setTimeout(r, 600)); // gentle pacing for image API
      }

      // Mark terminal (unless cancelled mid-loop, which already set status).
      const finalCancelled = await jobIsCancelled(jobId);
      if (!finalCancelled) {
        await supabase
          .from('srangam_admin_jobs')
          .update({ status: 'succeeded', finished_at: new Date().toISOString() })
          .eq('id', jobId);
      }
      await qc.invalidateQueries({ queryKey: ['admin', 'geography-media'] });
      toast({ title: 'Bulk OG finished', description: 'See the progress card for details.' });
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
              onClick={async () => {
                setBulkBusy('pins');
                await backfillPins({ all: true });
                setBulkBusy(null);
              }}
              disabled={bulkBusy !== null}
            >
              {bulkBusy === 'pins' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Backfill all published (50 max)
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
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
                      <tr key={a.id} className="border-b border-border/40 align-top">
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
