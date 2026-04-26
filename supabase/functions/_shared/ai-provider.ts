/**
 * Tenant-aware AI provider — Phase H.2d
 *
 * Single source of truth for any new AI call site in this project.
 * Uses the customer's own GEMINI_API_KEY (primary, gemini-2.5-flash) and
 * OPENAI_API_KEY (fallback, gpt-4o-mini). Never the Lovable AI Gateway —
 * the project already meters and bills both providers directly and we want
 * one observability trail per call.
 *
 * Returns a normalised result with provider, model, token counts, latency,
 * and a cost estimate so callers can emit `evt: 'pin_complete'` (or similar)
 * via _shared/observability.ts without duplicating any pricing logic.
 *
 * Hard timeout 15 s. On 429/5xx from primary, one retry with backoff, then
 * transparent fallback to secondary.
 *
 * Stable contract (DO NOT break without updating docs/RELIABILITY_AUDIT.md):
 *
 *   aiExtractPlaces(text, opts) -> {
 *     provider: 'gemini' | 'openai',
 *     model: string,
 *     places: { name: string, context: string }[],
 *     prompt_tokens: number,
 *     completion_tokens: number,
 *     latency_ms: number,
 *     cost_usd_estimate: number,
 *   }
 */

const DEFAULT_TIMEOUT_MS = 15_000;

// Public list-price snapshot, USD per 1M tokens.
// Update here only — no caller knows about pricing.
const PRICING = {
  'gemini-2.5-flash': { in: 0.075, out: 0.30 },
  'gpt-4o-mini':      { in: 0.15,  out: 0.60 },
} as const;

export class NoAIProviderError extends Error {
  constructor() {
    super('Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured');
    this.name = 'NoAIProviderError';
  }
}

export interface ExtractedPlace {
  name: string;
  context: string;
}

export interface AIExtractResult {
  provider: 'gemini' | 'openai';
  model: string;
  places: ExtractedPlace[];
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  cost_usd_estimate: number;
}

interface CallOpts {
  signal?: AbortSignal;
  timeoutMs?: number;
}

const SYSTEM_PROMPT =
  'You extract historical place names from scholarly text. ' +
  'Return ONLY ancient, classical, medieval, or early-modern toponyms ' +
  '(ports, cities, regions, kingdoms, inscription findspots). ' +
  'Skip modern-only references, abstract concepts, and personal names. ' +
  'Preserve diacritics. For each place, include a short surrounding phrase as context.';

function estimateCost(model: keyof typeof PRICING, pin: number, pout: number): number {
  const p = PRICING[model];
  if (!p) return 0;
  return (pin / 1_000_000) * p.in + (pout / 1_000_000) * p.out;
}

function withTimeout(signal: AbortSignal | undefined, ms: number): AbortSignal {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(new Error(`timeout ${ms}ms`)), ms);
  if (signal) {
    if (signal.aborted) ctl.abort(signal.reason);
    else signal.addEventListener('abort', () => ctl.abort(signal.reason), { once: true });
  }
  // Best-effort cleanup; sandbox GC handles the rest.
  ctl.signal.addEventListener('abort', () => clearTimeout(t), { once: true });
  return ctl.signal;
}

// ---------- Gemini (primary) ----------

async function callGemini(
  text: string,
  apiKey: string,
  opts: CallOpts,
): Promise<AIExtractResult> {
  const model = 'gemini-2.5-flash';
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name:    { type: 'STRING' },
            context: { type: 'STRING' },
          },
          required: ['name', 'context'],
        },
      },
    },
  };

  const t0 = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: withTimeout(opts.signal, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`gemini ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  const latency_ms = Math.round(performance.now() - t0);

  const raw =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ??
    '[]';

  let places: ExtractedPlace[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) places = parsed.filter(
      (p) => p && typeof p.name === 'string' && typeof p.context === 'string',
    );
  } catch {
    // Malformed JSON despite responseSchema — degrade quietly.
    places = [];
  }

  const prompt_tokens     = Number(data?.usageMetadata?.promptTokenCount ?? 0);
  const completion_tokens = Number(data?.usageMetadata?.candidatesTokenCount ?? 0);

  return {
    provider: 'gemini',
    model,
    places,
    prompt_tokens,
    completion_tokens,
    latency_ms,
    cost_usd_estimate: estimateCost(model, prompt_tokens, completion_tokens),
  };
}

// ---------- OpenAI (fallback) ----------

async function callOpenAI(
  text: string,
  apiKey: string,
  opts: CallOpts,
): Promise<AIExtractResult> {
  const model = 'gpt-4o-mini';
  const url = 'https://api.openai.com/v1/chat/completions';

  const body = {
    model,
    temperature: 0.1,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: text },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'historical_places',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            places: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name:    { type: 'string' },
                  context: { type: 'string' },
                },
                required: ['name', 'context'],
                additionalProperties: false,
              },
            },
          },
          required: ['places'],
          additionalProperties: false,
        },
      },
    },
  };

  const t0 = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: withTimeout(opts.signal, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`openai ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  const latency_ms = Math.round(performance.now() - t0);

  const raw = data?.choices?.[0]?.message?.content ?? '{"places":[]}';
  let places: ExtractedPlace[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.places)) places = parsed.places.filter(
      (p: any) => p && typeof p.name === 'string' && typeof p.context === 'string',
    );
  } catch {
    places = [];
  }

  const prompt_tokens     = Number(data?.usage?.prompt_tokens ?? 0);
  const completion_tokens = Number(data?.usage?.completion_tokens ?? 0);

  return {
    provider: 'openai',
    model,
    places,
    prompt_tokens,
    completion_tokens,
    latency_ms,
    cost_usd_estimate: estimateCost(model, prompt_tokens, completion_tokens),
  };
}

// ---------- Public entry point ----------

/** Whether we should retry on this kind of error (429 / 5xx / timeout). */
function isTransient(err: unknown): boolean {
  const m = err instanceof Error ? err.message : String(err);
  return /\b(429|50\d|timeout)\b/i.test(m);
}

/**
 * Extract historical place names. Tries Gemini first, falls back to OpenAI.
 * Both keys missing ⇒ throws NoAIProviderError so callers can degrade.
 */
export async function aiExtractPlaces(
  text: string,
  opts: CallOpts = {},
): Promise<AIExtractResult> {
  const gemini = Deno.env.get('GEMINI_API_KEY');
  const openai = Deno.env.get('OPENAI_API_KEY');
  if (!gemini && !openai) throw new NoAIProviderError();

  // Truncate defensively — keeps token cost bounded for very long articles.
  const input = text.length > 60_000 ? text.slice(0, 60_000) : text;

  // 1. Gemini primary, with one retry on transient failure.
  if (gemini) {
    try {
      return await callGemini(input, gemini, opts);
    } catch (e) {
      if (isTransient(e)) {
        try {
          await new Promise((r) => setTimeout(r, 800));
          return await callGemini(input, gemini, opts);
        } catch (e2) {
          if (!openai) throw e2;
          // fall through to OpenAI
        }
      } else if (!openai) {
        throw e;
      }
    }
  }

  // 2. OpenAI fallback.
  if (openai) return await callOpenAI(input, openai, opts);

  // Should be unreachable.
  throw new NoAIProviderError();
}
