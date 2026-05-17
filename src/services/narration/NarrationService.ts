// Core narration service layer - provider-agnostic TTS logic
// Phase 14: Added intelligent provider fallback (ElevenLabs → Google Cloud)
import type { NarrationConfig, NarrationMetadata, CachedAudio, AudioChunk } from '@/types/narration';
import { ssmlBuilder } from './SSMLBuilder';
import { voiceStrategyEngine } from './VoiceStrategyEngine';
import { supabase } from '@/integrations/supabase/client';
import type { TtsTimings } from './telemetry';

/**
 * Phase L.2 — Per-stream timing checkpoints. Populated by streamAudio /
 * processStreamResponse; consumed by useNarration which finalizes the
 * telemetry record after the first audio.play() resolves.
 */
export interface TtsStreamPerf {
  tRequest: number;
  tFirstByte?: number;
  tFirstAudioChunk?: number;
  tStreamDone?: number;
  provider?: string;
  voice?: string;
}

/**
 * Phase K.1: Decode a base64 string into Uint8Array slices.
 *
 * Base64 encodes 3 bytes per 4 chars; we walk the input in 64 KB base64
 * windows (~48 KB decoded) so peak heap stays bounded on mobile WebKit,
 * which throws RangeError when atob() is asked to decode 10+ MB at once
 * and then mapped through Uint8Array.from(..., c => c.charCodeAt(0)).
 */
function* decodeBase64InSlices(b64: string): Generator<Uint8Array> {
  if (!b64) return;
  const WINDOW = 65536; // 64 KB of base64 chars -> ~48 KB decoded
  for (let i = 0; i < b64.length; i += WINDOW) {
    // Snap window to multiple of 4 to keep base64 alignment, except the tail.
    let end = Math.min(i + WINDOW, b64.length);
    if (end < b64.length) end -= (end - i) % 4;
    const slice = b64.substring(i, end);
    if (!slice) continue;
    const bin = atob(slice);
    const out = new Uint8Array(bin.length);
    for (let j = 0; j < bin.length; j++) out[j] = bin.charCodeAt(j);
    yield out;
    i = end - WINDOW; // i += WINDOW happens at loop head; compensate
  }
}

export class NarrationService {
  private abortController: AbortController | null = null;
  /** Phase L.2 — exposed per-stream timing for useNarration to finalize telemetry. */
  public lastPerf: TtsStreamPerf | null = null;

  /**
   * Get endpoint for TTS provider
   */
  private getEndpoint(provider: string): string {
    switch (provider) {
      case 'elevenlabs':
        return '/functions/v1/tts-stream-elevenlabs';
      case 'openai':
        return '/functions/v1/tts-stream-openai';
      default:
        return '/functions/v1/tts-stream-google';
    }
  }

  /**
   * Make TTS request to edge function
   * Phase 15: Added articleSlug and contentHash for server-side caching
   */
  private async makeRequest(
    endpoint: string,
    config: NarrationConfig,
    content: string,
    articleSlug?: string,
    contentHash?: string
  ): Promise<Response> {
    return fetch(`${import.meta.env.VITE_SUPABASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        text: content,
        language: config.language,
        voice: config.voice,
        speed: config.speed,
        // Phase 15: Send caching params to edge function
        articleSlug,
        contentHash,
      }),
      signal: this.abortController?.signal,
    });
  }

  /**
   * Process NDJSON stream response and yield audio chunks
   * Phase 14c: Fixed stream buffering bug - properly handles partial JSON lines
   */
  private async *processStreamResponse(
    response: Response
  ): AsyncGenerator<AudioChunk, void, unknown> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let chunkIndex = 0;
    const decoder = new TextDecoder();
    let buffer = ''; // Accumulator for incomplete NDJSON lines

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process any remaining buffer on stream end
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            if (data.audio) {
              for (const slice of decodeBase64InSlices(data.audio)) {
                yield {
                  audioContent: slice,
                  chunkIndex: chunkIndex++,
                  totalChunks: -1,
                  isLast: false,
                };
              }
            }
            if (data.done) {
              yield {
                audioContent: new Uint8Array(0),
                chunkIndex: chunkIndex,
                totalChunks: chunkIndex,
                isLast: true,
              };
            }
          } catch (e) {
            // Ignore incomplete final line
            console.debug('[NarrationService] Ignoring incomplete final buffer');
          }
        }
        break;
      }

      // Accumulate text in buffer
      buffer += decoder.decode(value, { stream: true });

      // Split into lines, keeping incomplete last line in buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line for next iteration

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const data = JSON.parse(line);

          // Check for auth_blocked error (triggers fallback in parent)
          if (data.error === 'auth_blocked') {
            throw new Error('AUTH_BLOCKED');
          }

          if (data.audio) {
            // Phase K.1: Chunked base64 decode (64 KB slices) to prevent
            // RangeError / GC stalls on mobile WebKit when a single NDJSON
            // line carries 10-15 MB of base64. Yield each decoded slice
            // immediately so the consumer can concatenate without us
            // holding the full decoded buffer in scope.
            for (const slice of decodeBase64InSlices(data.audio)) {
              yield {
                audioContent: slice,
                chunkIndex: chunkIndex++,
                totalChunks: -1,
                isLast: false,
              };
            }
          }

          if (data.done) {
            yield {
              audioContent: new Uint8Array(0),
              chunkIndex: chunkIndex,
              totalChunks: chunkIndex,
              isLast: true,
            };
          }
        } catch (e) {
          if (e instanceof Error && e.message === 'AUTH_BLOCKED') {
            throw e;
          }
          console.warn('[NarrationService] Failed to parse TTS chunk:', line.substring(0, 50), e);
        }
      }
    }
  }

  /**
   * Stream audio from TTS provider with intelligent fallback
   * Phase 14: Auto-fallback to Google Cloud on 401/403 from ElevenLabs
   * Phase 15: Added articleSlug and contentHash for server-side caching
   */
  async *streamAudio(
    content: string,
    config: NarrationConfig,
    articleSlug?: string,
    contentHash?: string
  ): AsyncGenerator<AudioChunk, void, unknown> {
    this.abortController = new AbortController();

    // Track current config (may change on fallback)
    let currentConfig = { ...config };
    let endpoint = this.getEndpoint(currentConfig.provider);

    console.log(`[NarrationService] PRIMARY: Attempting ${currentConfig.provider} via ${endpoint}`);
    console.log(`[NarrationService] Config: voice=${currentConfig.voice}, lang=${currentConfig.language}, caching=${!!(articleSlug && contentHash)}`);

    try {
      const response = await this.makeRequest(endpoint, currentConfig, content, articleSlug, contentHash);
      console.log(`[NarrationService] PRIMARY response status: ${response.status}`);

      // Handle auth failures - trigger fallback
      if (response.status === 401 || response.status === 403) {
        console.warn(
          `[NarrationService] ${currentConfig.provider} auth failed (${response.status}), triggering fallback`
        );

        // Get fallback voice configuration
        const fallbackVoice = voiceStrategyEngine.getFallbackVoice(
          currentConfig.language,
          'article'
        );

        // Reconfigure to fallback provider
        currentConfig = {
          ...currentConfig,
          provider: fallbackVoice.provider,
          voice: fallbackVoice.voiceId,
        };
        // CRITICAL FIX: Use the fallback provider's endpoint, not hardcoded google-cloud
        endpoint = this.getEndpoint(fallbackVoice.provider);

        console.log(`[NarrationService] FALLBACK: Retrying with ${currentConfig.provider} / ${currentConfig.voice} via ${endpoint}`);

        // Retry with fallback provider
        const fallbackResponse = await this.makeRequest(endpoint, currentConfig, content, articleSlug, contentHash);
        console.log(`[NarrationService] FALLBACK response status: ${fallbackResponse.status}`);

        if (!fallbackResponse.ok) {
          throw new Error(`Fallback TTS API error: ${fallbackResponse.statusText}`);
        }

        console.log(`[NarrationService] FALLBACK SUCCESS: Streaming from ${currentConfig.provider}`);
        yield* this.processStreamResponse(fallbackResponse);
        return;
      }

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      // Process primary provider response
      try {
        yield* this.processStreamResponse(response);
      } catch (streamError) {
        // Handle auth_blocked error from stream (structured error response)
        if (streamError instanceof Error && streamError.message === 'AUTH_BLOCKED') {
          console.warn('[NarrationService] Auth blocked in stream, triggering fallback');

          const fallbackVoice = voiceStrategyEngine.getFallbackVoice(
            currentConfig.language,
            'article'
          );

          currentConfig = {
            ...currentConfig,
            provider: fallbackVoice.provider,
            voice: fallbackVoice.voiceId,
          };
          // CRITICAL FIX: Use the fallback provider's endpoint, not hardcoded google-cloud
          endpoint = this.getEndpoint(fallbackVoice.provider);

          console.log(`[NarrationService] STREAM FALLBACK: Retrying with ${currentConfig.provider} / ${currentConfig.voice} via ${endpoint}`);

          const fallbackResponse = await this.makeRequest(endpoint, currentConfig, content, articleSlug, contentHash);

          if (!fallbackResponse.ok) {
            throw new Error(`Fallback TTS API error: ${fallbackResponse.statusText}`);
          }

          yield* this.processStreamResponse(fallbackResponse);
          return;
        }
        throw streamError;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('TTS stream aborted');
      } else {
        console.error('TTS streaming error:', error);
        throw error;
      }
    }
  }

  /**
   * Get cached audio from Supabase - uses Google Drive URLs
   * Phase 15.2: Relaxed filtering to match by content_hash only (hash already encodes lang/voice/speed)
   */
  async getCachedAudio(contentHash: string, config: NarrationConfig): Promise<CachedAudio | null> {
    try {
      // Query by content_hash only - the hash already includes language, voice, speed
      // Previous filters on language_code/voice_id caused cache misses due to format differences (e.g., "en" vs "en-US")
      const { data, error } = await supabase
        .from('srangam_audio_narrations')
        .select('*')
        .eq('content_hash', contentHash)
        .maybeSingle();

      if (error) {
        console.warn('[NarrationService] Cache lookup error:', error.message);
        return null;
      }
      
      if (!data || !data.google_drive_share_url) {
        return null;
      }

      console.log(`[NarrationService] Cache HIT for hash ${contentHash.substring(0, 8)}`);

      // Map provider string from DB to valid NarrationProvider type
      const providerFromDb = data.provider as 'google-cloud' | 'openai' | 'elevenlabs' | undefined;
      const validProvider: 'google-cloud' | 'openai' | 'elevenlabs' = 
        providerFromDb && ['google-cloud', 'openai', 'elevenlabs'].includes(providerFromDb) 
          ? providerFromDb 
          : config.provider;

      return {
        url: data.google_drive_share_url,
        metadata: {
          contentHash: data.content_hash || contentHash,
          articleSlug: data.article_slug,
          language: data.language_code,
          provider: validProvider,
          voice: data.voice_id,
          duration: data.duration_seconds || undefined,
          fileSize: data.file_size_bytes || undefined,
          config,
        },
        createdAt: data.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching cached audio:', error);
      return null;
    }
  }

  /**
   * Save audio metadata - Phase 15: Server-side caching now handles DB writes
   * This method just returns blob URL for immediate playback
   * Actual caching happens in edge functions with service role
   */
  async saveToStorage(
    audioBlob: Blob,
    metadata: NarrationMetadata
  ): Promise<string> {
    // Phase 15: Server-side caching handles GDrive upload and DB write
    // This just returns blob URL for immediate playback
    console.log('[NarrationService] Audio caching handled server-side, returning blob URL');
    return URL.createObjectURL(audioBlob);
  }

  /**
   * Estimate cost for generating audio
   */
  estimateCost(content: string, provider: 'google-cloud' | 'openai' | 'elevenlabs'): number {
    const charCount = content.length;

    // Pricing (approximate)
    const pricing: Record<string, number> = {
      'google-cloud': 0.000016, // $16 per 1M characters (Neural2)
      'openai': 0.000015, // $15 per 1M characters (TTS-1)
      'elevenlabs': 0.00003, // ~$30 per 1M chars, but free tier: 10k chars/month
    };

    return charCount * pricing[provider];
  }

  /**
   * Select optimal voice for content
   */
  selectOptimalVoice(
    content: string,
    language: string,
    contentType: 'article' | 'page' | 'term' | 'visualization' | 'preview'
  ) {
    const profile = voiceStrategyEngine.analyzeContent(content, contentType);
    return voiceStrategyEngine.selectVoice(profile, language, contentType);
  }

  /**
   * Cancel ongoing audio stream
   */
  cancel() {
    this.abortController?.abort();
    this.abortController = null;
  }

  /**
   * Generate content hash for caching.
   *
   * Phase K.1: Upgraded from 32-bit non-crypto hash to SHA-256 (hex) to
   * eliminate collision risk as the narration cache grows. The edge
   * functions persist whatever hash the client sends, so this remains a
   * pure round-trip key.
   */
  async generateContentHash(
    content: string,
    config: Partial<NarrationConfig>
  ): Promise<string> {
    const key = `${content}_${config.language}_${config.voice}_${config.speed}`;
    const bytes = new TextEncoder().encode(key);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export const narrationService = new NarrationService();
