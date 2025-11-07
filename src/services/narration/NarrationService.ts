// Core narration service layer - provider-agnostic TTS logic
import type { NarrationConfig, NarrationMetadata, CachedAudio, AudioChunk } from '@/types/narration';
import { ssmlBuilder } from './SSMLBuilder';
import { voiceStrategyEngine } from './VoiceStrategyEngine';
import { supabase } from '@/integrations/supabase/client';

export class NarrationService {
  private abortController: AbortController | null = null;

  /**
   * Stream audio from TTS provider (Google Cloud by default)
   */
  async *streamAudio(
    content: string,
    config: NarrationConfig
  ): AsyncGenerator<AudioChunk, void, unknown> {
    this.abortController = new AbortController();

    try {
      // Build SSML if needed
      let processedContent = content;
      if (config.contextHints?.hasSanskrit || config.contextHints?.hasCitations) {
        processedContent = ssmlBuilder.buildForArticle(content, {
          language: config.language,
          hasCitations: config.contextHints.hasCitations,
          hasSanskrit: config.contextHints.hasSanskrit,
          hasPoetry: config.contextHints.hasPoetry,
        });
      }

      // Call appropriate edge function based on provider
      const endpoint = config.provider === 'openai' 
        ? '/functions/v1/tts-stream-openai'
        : '/functions/v1/tts-stream-google';

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: processedContent,
            language: config.language,
            voice: config.voice,
            speed: config.speed,
          }),
          signal: this.abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let chunkIndex = 0;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Parse JSON chunks
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.audio) {
              const audioContent = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
              
              yield {
                audioContent,
                chunkIndex: chunkIndex++,
                totalChunks: -1, // Unknown until complete
                isLast: false,
              };
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
            console.warn('Failed to parse TTS chunk:', e);
          }
        }
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
   */
  async getCachedAudio(contentHash: string, config: NarrationConfig): Promise<CachedAudio | null> {
    try {
      const { data, error } = await supabase
        .from('srangam_audio_narrations')
        .select('*')
        .eq('content_hash', contentHash)
        .eq('language_code', config.language)
        .eq('voice_id', config.voice)
        .single();

      if (error || !data) {
        return null;
      }

      // Use Google Drive share URL
      const url = data.google_drive_share_url || '';

      return {
        url,
        metadata: {
          contentHash: data.content_hash || contentHash,
          articleSlug: data.article_slug,
          language: data.language_code,
          provider: config.provider,
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
   * Save audio metadata to database (actual file stored on Google Drive via edge function)
   */
  async saveToStorage(
    audioBlob: Blob,
    metadata: NarrationMetadata
  ): Promise<string> {
    try {
      // Note: Actual audio upload happens in edge function to Google Drive
      // This just saves metadata for future reference
      const { error: dbError } = await supabase
        .from('srangam_audio_narrations')
        .insert({
          article_slug: metadata.articleSlug || 'unknown',
          language_code: metadata.language,
          voice_id: metadata.voice,
          provider: metadata.provider,
          content_hash: metadata.contentHash,
          duration_seconds: metadata.duration,
          file_size_bytes: metadata.fileSize,
          character_count: metadata.contentHash.length, // Approximate
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
      }

      // For now, return blob URL (in production, edge function handles Google Drive upload)
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Error saving audio metadata:', error);
      throw error;
    }
  }

  /**
   * Estimate cost for generating audio
   */
  estimateCost(content: string, provider: 'google-cloud' | 'openai'): number {
    const charCount = content.length;
    
    // Pricing (approximate)
    const pricing = {
      'google-cloud': 0.000016, // $16 per 1M characters (Neural2)
      'openai': 0.000015, // $15 per 1M characters (TTS-1)
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
   * Generate content hash for caching
   */
  generateContentHash(content: string, config: Partial<NarrationConfig>): string {
    const key = `${content}_${config.language}_${config.voice}_${config.speed}`;
    
    // Simple hash function (for production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }
}

export const narrationService = new NarrationService();
