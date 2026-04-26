/**
 * Shared observability helpers — Phase H.1
 *
 * Single source of truth for the structured-log shape used by importers
 * and other long-running edge functions. Modelled on OpenTelemetry log
 * record semantic conventions: every event line is a JSON object with a
 * stable `evt` field and a `duration_ms` (`ms`) field where applicable.
 *
 * Stable contract (DO NOT break without updating docs/RELIABILITY_AUDIT.md):
 *
 *   { evt: 'import_stage', stage: <string>, ms: <number>, ok: <bool>,
 *     ts: <iso8601>, error?: <string>, ...meta }
 *
 *   { evt: 'import_complete', slug: <string>, total_ms: <number>,
 *     word_count: <number>, citations: <number>, terms: <number>,
 *     mermaid_blocks: <number>, lang: <string>, ts: <iso8601> }
 *
 * When the queued `srangam_event_log` table lands, swap the
 * `console.log` for a `supabase.from('srangam_event_log').insert(...)`
 * with the same field shape — no caller changes required.
 */

export async function stage<T>(
  name: string,
  meta: Record<string, unknown>,
  fn: () => T | Promise<T>,
): Promise<T> {
  const t0 = performance.now();
  try {
    const v = await fn();
    console.log(JSON.stringify({
      evt: 'import_stage',
      stage: name,
      ms: Math.round(performance.now() - t0),
      ok: true,
      ts: new Date().toISOString(),
      ...meta,
    }));
    return v;
  } catch (e) {
    console.log(JSON.stringify({
      evt: 'import_stage',
      stage: name,
      ms: Math.round(performance.now() - t0),
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      ts: new Date().toISOString(),
      ...meta,
    }));
    throw e;
  }
}

export function logComplete(meta: Record<string, unknown>): void {
  console.log(JSON.stringify({
    evt: 'import_complete',
    ts: new Date().toISOString(),
    ...meta,
  }));
}

/** Count fenced ```mermaid blocks — cheap signal that diagram repair fired. */
export function countMermaidBlocks(markdown: string): number {
  const matches = markdown.match(/^```mermaid\b/gm);
  return matches ? matches.length : 0;
}
