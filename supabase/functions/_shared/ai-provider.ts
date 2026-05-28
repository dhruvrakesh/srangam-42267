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

// Public list-price snapshot, USD per 1M tokens (text models)
// or USD per generated image (image models). Update here only — no caller
// knows about pricing.
const PRICING = {
  'gemini-2.5-flash': { in: 0.075, out: 0.30 },
  'gpt-4o-mini':      { in: 0.15,  out: 0.60 },
} as const;

// Per-image flat-rate pricing snapshot, USD per image (1024x1024 / std).
const IMAGE_PRICING: Record<string, number> = {
  'gemini-2.5-flash-image':         0.039,
  'gemini-3-pro-image-preview':     0.06,
  'gpt-image-1':                    0.04,
  'dall-e-3':                       0.04,
};

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

// =============================================================================
// Phase X.5 — Generic JSON extraction (Gemini-first, OpenAI fallback)
//
// Used by the Puranic citation extractor (and any future structured-output
// caller) so we get the same provider order, retry semantics, telemetry and
// cost-accounting as `aiExtractPlaces`. Caller supplies the system + user
// prompt; we return both the raw JSON string and a parsed object so the
// caller can apply its own Zod / shape validation.
//
// Implicit-cache-friendly ordering: system text first, then the per-chunk
// user text last (Gemini caches the prefix automatically when repeated).
// =============================================================================

export interface AIJsonResult {
  provider: 'gemini' | 'openai';
  model: string;
  raw: string;
  parsed: unknown;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  cost_usd_estimate: number;
}

interface JsonCallOpts extends CallOpts {
  system: string;
  user: string;
  /** Cap on tokens we send (defensive). Defaults to 60k chars of user text. */
  maxUserChars?: number;
}

async function callGeminiJson(apiKey: string, o: JsonCallOpts): Promise<AIJsonResult> {
  const model = 'gemini-2.5-flash';
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;
  const body = {
    systemInstruction: { parts: [{ text: o.system }] },
    contents: [{ role: 'user', parts: [{ text: o.user }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };
  const t0 = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: withTimeout(o.signal, o.timeoutMs ?? DEFAULT_TIMEOUT_MS),
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
    '{}';
  let parsed: unknown = null;
  try { parsed = JSON.parse(raw); } catch { parsed = null; }
  const prompt_tokens = Number(data?.usageMetadata?.promptTokenCount ?? 0);
  const completion_tokens = Number(data?.usageMetadata?.candidatesTokenCount ?? 0);
  return {
    provider: 'gemini', model, raw, parsed,
    prompt_tokens, completion_tokens, latency_ms,
    cost_usd_estimate: estimateCost(model, prompt_tokens, completion_tokens),
  };
}

async function callOpenAIJson(apiKey: string, o: JsonCallOpts): Promise<AIJsonResult> {
  const model = 'gpt-4o-mini';
  const body = {
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: o.system },
      { role: 'user', content: o.user },
    ],
    response_format: { type: 'json_object' },
  };
  const t0 = performance.now();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: withTimeout(o.signal, o.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`openai ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  const latency_ms = Math.round(performance.now() - t0);
  const raw = data?.choices?.[0]?.message?.content ?? '{}';
  let parsed: unknown = null;
  try { parsed = JSON.parse(raw); } catch { parsed = null; }
  const prompt_tokens = Number(data?.usage?.prompt_tokens ?? 0);
  const completion_tokens = Number(data?.usage?.completion_tokens ?? 0);
  return {
    provider: 'openai', model, raw, parsed,
    prompt_tokens, completion_tokens, latency_ms,
    cost_usd_estimate: estimateCost(model, prompt_tokens, completion_tokens),
  };
}

/**
 * Generic structured-JSON extraction. Tries Gemini first (cheap + uses the
 * tenant's own key), falls back to OpenAI on 429/5xx/timeout. 4xx on the
 * primary is terminal — we do NOT silently double-bill on a malformed
 * request.
 */
export async function aiExtractCitations(opts: JsonCallOpts): Promise<AIJsonResult> {
  const gemini = Deno.env.get('GEMINI_API_KEY');
  const openai = Deno.env.get('OPENAI_API_KEY');
  if (!gemini && !openai) throw new NoAIProviderError();

  const maxChars = opts.maxUserChars ?? 60_000;
  const user = opts.user.length > maxChars ? opts.user.slice(0, maxChars) : opts.user;
  const call = { ...opts, user };

  if (gemini) {
    try {
      return await callGeminiJson(gemini, call);
    } catch (e) {
      if (isTransient(e)) {
        try {
          await new Promise((r) => setTimeout(r, 800));
          return await callGeminiJson(gemini, call);
        } catch (e2) {
          if (!openai) throw e2;
        }
      } else if (!openai) {
        throw e;
      }
    }
  }
  if (openai) return await callOpenAIJson(openai, call);
  throw new NoAIProviderError();
}


export interface AIImageResult {
  bytes: Uint8Array;
  mime: string;
  provider: 'gemini' | 'openai';
  model: string;
  latency_ms: number;
  cost_usd_estimate: number;
  revised_prompt?: string;
}

export interface ImageOpts {
  /** 'landscape' (1792x1024 / 16:9) or 'square'. Default landscape. */
  shape?: 'landscape' | 'square';
  timeoutMs?: number;
}

function decodeB64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function callGeminiImage(
  prompt: string,
  apiKey: string,
  opts: ImageOpts,
): Promise<AIImageResult> {
  const model = 'gemini-2.5-flash-image';
  const t0 = performance.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 60_000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`gemini-image ${res.status}: ${detail.slice(0, 300)}`);
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: any) => p?.inlineData?.data);
    if (!imgPart) throw new Error('gemini-image: no inlineData in response');
    const bytes = decodeB64ToBytes(imgPart.inlineData.data);
    return {
      bytes,
      mime: imgPart.inlineData.mimeType ?? 'image/png',
      provider: 'gemini',
      model,
      latency_ms: Math.round(performance.now() - t0),
      cost_usd_estimate: IMAGE_PRICING[model] ?? 0.04,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAIImage(
  prompt: string,
  apiKey: string,
  opts: ImageOpts,
): Promise<AIImageResult> {
  const model = 'gpt-image-1';
  const size = opts.shape === 'square' ? '1024x1024' : '1536x1024';
  const t0 = performance.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 90_000);

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size,
        quality: 'medium',
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`openai-image ${res.status}: ${detail.slice(0, 300)}`);
    }
    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) throw new Error('openai-image: no b64_json in response');
    const bytes = decodeB64ToBytes(b64);
    return {
      bytes,
      mime: 'image/png',
      provider: 'openai',
      model,
      latency_ms: Math.round(performance.now() - t0),
      cost_usd_estimate: IMAGE_PRICING[model] ?? 0.04,
      revised_prompt: data?.data?.[0]?.revised_prompt,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generate one image. Tries Gemini (Nano Banana) first, falls back to OpenAI
 * (gpt-image-1). Returns raw PNG bytes plus provider telemetry. Caller is
 * responsible for storage (e.g. GDrive upload).
 */
export async function callImage(
  prompt: string,
  opts: ImageOpts = {},
): Promise<AIImageResult> {
  const gemini = Deno.env.get('GEMINI_API_KEY');
  const openai = Deno.env.get('OPENAI_API_KEY');
  if (!gemini && !openai) throw new NoAIProviderError();

  if (gemini) {
    try {
      return await callGeminiImage(prompt, gemini, opts);
    } catch (e) {
      console.warn('[ai-provider] gemini-image failed:', e instanceof Error ? e.message : e);
      if (!openai) throw e;
      // fall through to OpenAI
    }
  }
  return await callOpenAIImage(prompt, openai!, opts);
}
