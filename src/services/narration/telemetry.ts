// Phase L.1/L.2 — TTS telemetry bus (in-memory, dev-friendly, side-effect-free)
//
// Records the most recent narration playback (cache vs stream + per-phase
// timings) and lets dev-only UI subscribe for re-renders. Production code
// paths still write here (cheap), but the consumer panel is DEV-gated so
// Vite tree-shakes the UI out of production bundles.
//
// This module MUST NOT throw under any condition: callers wrap in try/catch
// at the boundaries, and every function here is best-effort.

import type { NarrationProvider } from '@/types/narration';

export type TtsOrigin = 'cache' | 'stream';
export type TtsPhase = 'generate' | 'decode' | 'stream' | 'playbackStartGap';

export interface TtsTimings {
  generate?: number;       // POST sent -> first NDJSON byte parsed
  decode?: number;         // first byte -> first decoded base64 slice yielded
  stream?: number;         // first byte -> stream done
  playbackStartGap?: number; // first decoded slice -> audio.play() resolved
  firstPlayMs?: number;    // total: request initiated -> audio playing
}

export interface TtsTelemetry {
  origin: TtsOrigin;
  provider: NarrationProvider;
  voice: string;
  language: string;
  articleSlug?: string;
  contentHashPrefix: string; // first 8 chars of hex sha-256
  timings: TtsTimings;
  slowest?: TtsPhase;
  timestamp: number; // Date.now()
}

type Listener = (record: TtsTelemetry) => void;

const listeners = new Set<Listener>();
const history: TtsTelemetry[] = [];
const HISTORY_MAX = 4;
let last: TtsTelemetry | null = null;

function computeSlowest(t: TtsTimings): TtsPhase | undefined {
  const entries: Array<[TtsPhase, number]> = [];
  if (typeof t.generate === 'number') entries.push(['generate', t.generate]);
  if (typeof t.decode === 'number') entries.push(['decode', t.decode]);
  if (typeof t.stream === 'number') entries.push(['stream', t.stream]);
  if (typeof t.playbackStartGap === 'number') entries.push(['playbackStartGap', t.playbackStartGap]);
  if (entries.length === 0) return undefined;
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

export function recordTelemetry(record: Omit<TtsTelemetry, 'slowest' | 'timestamp'> & { timestamp?: number }): void {
  try {
    const full: TtsTelemetry = {
      ...record,
      timestamp: record.timestamp ?? Date.now(),
      slowest: computeSlowest(record.timings),
    };
    last = full;
    history.unshift(full);
    if (history.length > HISTORY_MAX) history.length = HISTORY_MAX;

    // Single structured log line per play.
    const t = full.timings;
    const parts = [
      `origin=${full.origin}`,
      `provider=${full.provider}`,
      `voice=${full.voice}`,
      full.articleSlug ? `slug=${full.articleSlug}` : null,
      `hash=${full.contentHashPrefix}`,
      typeof t.generate === 'number' ? `generate=${Math.round(t.generate)}` : null,
      typeof t.decode === 'number' ? `decode=${Math.round(t.decode)}` : null,
      typeof t.stream === 'number' ? `stream=${Math.round(t.stream)}` : null,
      typeof t.playbackStartGap === 'number' ? `playbackStartGap=${Math.round(t.playbackStartGap)}` : null,
      typeof t.firstPlayMs === 'number' ? `firstPlay=${Math.round(t.firstPlayMs)}` : null,
      full.slowest ? `slowest=${full.slowest}` : null,
    ].filter(Boolean);
    // eslint-disable-next-line no-console
    console.log(`[TTS perf] ${parts.join(' ')}`);

    listeners.forEach((cb) => {
      try { cb(full); } catch { /* ignore */ }
    });
  } catch {
    // Telemetry must never break playback.
  }
}

export function getLastTelemetry(): TtsTelemetry | null {
  return last;
}

export function getTelemetryHistory(): readonly TtsTelemetry[] {
  return history;
}

export function subscribe(cb: Listener): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
