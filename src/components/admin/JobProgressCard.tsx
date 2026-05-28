/**
 * Phase H.4 — Live progress card for long-running admin jobs.
 *
 * Pure presentation. Subscribes to a single `srangam_admin_jobs` row
 * via `useAdminJob` and renders the bar / counters / ETA / cancel
 * button. When the job reaches a terminal state it shows a summary
 * and a Dismiss button (provided by parent via `onDismiss`).
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, CheckCircle2, AlertTriangle, Ban } from 'lucide-react';
import { useAdminJob, formatEta } from '@/hooks/useAdminJob';

const KIND_LABEL: Record<string, string> = {
  pin_backfill: 'Pin Backfill',
  og_generate: 'OG Image Generation',
  og_force: 'OG Image Regeneration',
};

interface Props {
  jobId: string;
  onDismiss?: () => void;
}

export function JobProgressCard({ jobId, onDismiss }: Props) {
  const { job, progress, etaMs, cancel } = useAdminJob(jobId);

  if (!job) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Starting job…</span>
        </CardContent>
      </Card>
    );
  }

  const terminal = job.status === 'succeeded' || job.status === 'failed' || job.status === 'cancelled';
  const startedLabel = job.started_at
    ? new Date(job.started_at).toLocaleTimeString()
    : '—';

  const StatusIcon =
    job.status === 'running'   ? Loader2 :
    job.status === 'succeeded' ? CheckCircle2 :
    job.status === 'failed'    ? AlertTriangle :
    job.status === 'cancelled' ? Ban : Loader2;

  const statusTone =
    job.status === 'succeeded' ? 'text-emerald-500' :
    job.status === 'failed'    ? 'text-destructive' :
    job.status === 'cancelled' ? 'text-muted-foreground' :
    'text-primary';

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <StatusIcon
              className={`h-4 w-4 ${statusTone} ${job.status === 'running' ? 'animate-spin' : ''}`}
            />
            {KIND_LABEL[job.kind] ?? job.kind}
            <Badge variant={terminal ? 'secondary' : 'default'} className="ml-1">
              {job.status}
            </Badge>
          </CardTitle>
          {terminal && onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Counter row */}
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">
            {job.processed} / {job.total} item{job.total === 1 ? '' : 's'}
          </span>
          <span className="tabular-nums text-muted-foreground">{progress}%</span>
        </div>

        <Progress value={progress} className="h-2" />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <Stat label="Succeeded" value={job.succeeded} tone="ok" />
          <Stat label="Failed" value={job.failed} tone={job.failed > 0 ? 'bad' : 'muted'} />
          <Stat label="Cost"   value={`$${Number(job.cost_usd).toFixed(4)}`} tone="muted" />
          <Stat
            label={job.status === 'running' ? 'ETA' : 'Duration'}
            value={
              job.status === 'running'
                ? formatEta(etaMs)
                : job.started_at && job.finished_at
                  ? formatEta(new Date(job.finished_at).getTime() - new Date(job.started_at).getTime())
                  : '—'
            }
            tone="muted"
          />
        </div>

        {/* Last item / error / tier breakdown (Phase X.1) */}
        {job.last_item && (
          <div className="text-xs text-muted-foreground truncate">
            Last: <span className="font-mono">{job.last_item}</span>
            {job.params?.tier_totals && (
              (() => {
                const t = job.params!.tier_totals!;
                const a = t.a ?? 0, b = t.b ?? 0, c = t.c ?? 0;
                if (a + b + c === 0) return null;
                return (
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-wide">
                    (A:{a} B:{b} C:{c})
                  </span>
                );
              })()
            )}
          </div>
        )}
        {job.last_error && job.failed > 0 && (
          <div className="text-xs text-destructive truncate" title={job.last_error}>
            Last error: {job.last_error}
          </div>
        )}


        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">Started {startedLabel}</span>
          {job.status === 'running' && (
            <Button size="sm" variant="outline" onClick={cancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'ok' | 'bad' | 'muted';
}) {
  const cls =
    tone === 'ok' ? 'text-emerald-500' :
    tone === 'bad' ? 'text-destructive' : 'text-foreground';
  return (
    <div className="rounded border border-border/40 bg-muted/20 px-2 py-1.5">
      <div className="uppercase tracking-wide text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium tabular-nums ${cls}`}>{value}</div>
    </div>
  );
}
