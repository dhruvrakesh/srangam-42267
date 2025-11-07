// Universal narrator component - can be used anywhere
import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/components/language/LanguageProvider';
import { useNarration } from '@/hooks/useNarration';
import { NarrationControls } from './NarrationControls';
import { voiceStrategyEngine } from '@/services/narration/VoiceStrategyEngine';
import type { NarrationConfig, NarrationContentType } from '@/types/narration';

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

  // ✅ DEFENSIVE CHECKS AFTER ALL HOOKS
  if (!currentLanguage) {
    console.warn('UniversalNarrator: currentLanguage not available');
    return null;
  }

  if (!content || content.trim().length === 0) {
    console.warn('UniversalNarrator: no content provided');
    return null;
  }

  const handlePlay = useCallback(async () => {
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
          hasCitations: content.includes('('),
          hasSanskrit: /[āīūṛṝḷḹṃḥṅñṭḍṇśṣ]/i.test(content),
          hasPoetry: content.split('\n').filter(l => l.length < 80).length > 10,
        } : undefined,
      };

      await playContent(content, config);
      setHasStarted(true);
    }
  }, [status, hasStarted, content, contentType, currentLanguage, speed, autoAnalyze, playContent, resume]);

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
