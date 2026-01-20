// Universal narrator component - can be used anywhere
import React, { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '@/components/language/LanguageProvider';
import { useNarration } from '@/hooks/useNarration';
import { NarrationControls } from './NarrationControls';
import { voiceStrategyEngine } from '@/services/narration/VoiceStrategyEngine';
import type { NarrationConfig, NarrationContentType } from '@/types/narration';

/**
 * Phase 14d: Strip HTML tags, URLs, and footnotes from content before TTS
 * Reduces character count by ~30% and produces cleaner audio
 */
function extractNarrationText(html: string): string {
  let text = html;
  
  // Remove HTML tags but keep content
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Remove URLs (http/https/file)
  text = text.replace(/(?:https?|file):\/\/[^\s<>"']+/gi, '');
  
  // Remove footnote markers like [1], [2], etc.
  text = text.replace(/\[\d+\]/g, '');
  
  // Remove citation patterns like (Author, Year)
  text = text.replace(/\([A-Za-z]+,?\s*\d{4}[a-z]?\)/g, '');
  
  // Collapse multiple spaces/newlines
  text = text.replace(/\s+/g, ' ');
  
  // Trim
  text = text.trim();
  
  return text;
}

interface UniversalNarratorProps {
  content: string;
  contentType?: NarrationContentType;
  articleSlug?: string;
  variant?: 'sticky-bottom' | 'inline' | 'floating';
  className?: string;
  autoAnalyze?: boolean; // Auto-analyze content for optimal voice
}

export function UniversalNarrator({
  content,
  contentType = 'article',
  articleSlug,
  variant = 'sticky-bottom',
  className,
  autoAnalyze = true,
}: UniversalNarratorProps) {
  // ✅ ALL HOOKS MUST BE CALLED AT THE TOP - NEVER CONDITIONALLY
  const { currentLanguage } = useLanguage();
  const [hasStarted, setHasStarted] = useState(false);
  
  const {
    status,
    progress,
    currentTime,
    duration,
    speed,
    isLoading,
    error,
    playContent,
    pause,
    resume,
    stop,
    setSpeed,
    seek,
  } = useNarration({ speed: 1.0 });

  // Phase 14d: Sanitize content before sending to TTS
  const sanitizedContent = useMemo(() => extractNarrationText(content), [content]);

  const handlePlay = useCallback(async () => {
    // Validation inside callback to avoid early return before hooks
    if (!currentLanguage || !sanitizedContent || sanitizedContent.trim().length === 0) {
      console.warn('[UniversalNarrator] Cannot play: missing language or content');
      return;
    }

    if (status === 'paused') {
      await resume();
      return;
    }

    if (!hasStarted) {
      // Auto-select optimal voice if enabled
      let voiceConfig;
      if (autoAnalyze) {
        try {
          voiceConfig = voiceStrategyEngine.selectVoice(
            voiceStrategyEngine.analyzeContent(content, contentType),
            currentLanguage,
            contentType
          );
        } catch (error) {
          console.error('Voice selection failed, using default:', error);
          // Fallback to default voice configuration
          voiceConfig = {
            provider: 'google-cloud' as const,
            voiceId: 'en-US-Neural2-J',
            languageCode: 'en-US',
            name: 'Default Voice'
          };
        }
      }

      const config: NarrationConfig = {
        provider: voiceConfig?.provider || 'google-cloud',
        voice: voiceConfig?.voiceId || 'en-US-Neural2-J',
        speed,
        language: currentLanguage,
        contentType,
        contextHints: autoAnalyze ? {
          hasCitations: sanitizedContent.includes('('),
          hasSanskrit: /[āīūṛṝḷḹṃḥṅñṭḍṇśṣ]/i.test(sanitizedContent),
          hasPoetry: sanitizedContent.split('\n').filter(l => l.length < 80).length > 10,
        } : undefined,
      };

      // Phase 14d: Use sanitized content (no HTML/URLs)
      console.log(`[UniversalNarrator] Playing ${sanitizedContent.length} chars (sanitized from ${content.length})`);
      await playContent(sanitizedContent, config);
      setHasStarted(true);
    }
  }, [status, hasStarted, sanitizedContent, content, contentType, currentLanguage, speed, autoAnalyze, playContent, resume]);

  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  const handleStop = useCallback(() => {
    stop();
    setHasStarted(false);
  }, [stop]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, [setSpeed]);

  const handleSeek = useCallback((time: number) => {
    seek(time);
  }, [seek]);

  // Early return AFTER all hooks
  if (!currentLanguage || !content || content.trim().length === 0) {
    return null;
  }

  return (
    <NarrationControls
      status={status}
      progress={progress}
      currentTime={currentTime}
      duration={duration}
      speed={speed}
      isLoading={isLoading}
      error={error}
      onPlay={handlePlay}
      onPause={handlePause}
      onStop={handleStop}
      onSpeedChange={handleSpeedChange}
      onSeek={handleSeek}
      className={className}
      variant={variant}
    />
  );
}
