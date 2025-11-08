// Universal narrator component - can be used anywhere
import React, { useState, useCallback, useEffect } from 'react';
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

  // ✅ Track initialization state
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Wait for language context to initialize
    if (currentLanguage) {
      setIsInitializing(false);
    }
  }, [currentLanguage]);

  // ✅ DEFENSIVE CHECKS AFTER ALL HOOKS - Return consistent structure
  const shouldShowControls = Boolean(
    !isInitializing &&
    currentLanguage && 
    content && 
    content.trim().length > 0
  );

  // Show loading skeleton while initializing
  if (isInitializing) {
    return (
      <div className="animate-pulse bg-muted/30 rounded-lg p-4 h-20" />
    );
  }

  // If checks fail after initialization, show visible error state
  if (!shouldShowControls) {
    const errorReason = !currentLanguage 
      ? 'language context not initialized' 
      : 'no content provided';
    
    return (
      <div className="sticky bottom-0 left-0 right-0 z-40 border-t border-border bg-muted/30 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="opacity-50">🔊</span>
            <span>Audio narration unavailable ({errorReason})</span>
          </div>
        </div>
      </div>
    );
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
