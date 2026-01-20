// React hook for narration state and controls
import { useState, useCallback, useRef, useEffect } from 'react';
import type { NarrationConfig, NarrationState } from '@/types/narration';
import { narrationService } from '@/services/narration/NarrationService';

export function useNarration(initialConfig?: Partial<NarrationConfig>) {
  const [state, setState] = useState<NarrationState>({
    status: 'idle',
    progress: 0,
    currentTime: 0,
    duration: 0,
    speed: initialConfig?.speed || 1.0,
    isLoading: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceBufferRef = useRef<MediaSource | null>(null);

  /**
   * Play content with TTS
   */
  const playContent = useCallback(async (
    content: string,
    config: NarrationConfig
  ) => {
    // ✅ Early validation
    if (!content || content.trim().length === 0) {
      console.warn('useNarration: Empty content provided, skipping playback');
      return;
    }

    if (!config.language || !config.provider || !config.voice) {
      console.error('useNarration: Invalid config provided', config);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Invalid narration configuration',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'loading', isLoading: true, error: undefined }));

      // Check cache first
      const contentHash = narrationService.generateContentHash(content, config);
      
      let cached;
      try {
        cached = await narrationService.getCachedAudio(contentHash, config);
      } catch (cacheError) {
        console.warn('Cache lookup failed, will stream from TTS:', cacheError);
        cached = null;
      }

      if (cached) {
        // Play from cache
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        audioRef.current.src = cached.url;
        audioRef.current.playbackRate = config.speed;
        
        try {
          await audioRef.current.play();
        } catch (playError) {
          console.error('Cached audio playback failed:', playError);
          throw new Error('Audio playback blocked by browser. Please try clicking play again.');
        }

        setState(prev => ({
          ...prev,
          status: 'playing',
          isLoading: false,
          duration: cached.metadata.duration || 0,
          config,
          metadata: cached.metadata,
        }));
        return;
      }

      // Stream from TTS provider
      const audioChunks: Uint8Array[] = [];
      let receivedAnyChunks = false;
      
      try {
        for await (const chunk of narrationService.streamAudio(content, config)) {
          if (chunk.audioContent.length > 0) {
            audioChunks.push(chunk.audioContent);
            receivedAnyChunks = true;
          }

          if (chunk.isLast) {
            // Combine all chunks into a single blob
            const totalLength = audioChunks.reduce((sum, arr) => sum + arr.length, 0);
            const combinedArray = new Uint8Array(totalLength);
            let offset = 0;
            
            for (const arr of audioChunks) {
              combinedArray.set(arr, offset);
              offset += arr.length;
            }

            const audioBlob = new Blob([combinedArray], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Play audio
            if (!audioRef.current) {
              audioRef.current = new Audio();
            }
            
            audioRef.current.src = audioUrl;
            audioRef.current.playbackRate = config.speed;
            
            try {
              await audioRef.current.play();
            } catch (playError) {
              console.error('Streamed audio playback failed:', playError);
              throw new Error('Audio playback blocked. Please check browser permissions.');
            }

            setState(prev => ({
              ...prev,
              status: 'playing',
              isLoading: false,
              config,
            }));

            // Save to cache (async, don't await)
            narrationService.saveToStorage(audioBlob, {
              contentHash,
              articleSlug: config.contentType === 'article' ? content.substring(0, 50) : undefined,
              language: config.language,
              provider: config.provider,
              voice: config.voice,
              fileSize: audioBlob.size,
              config,
            }).catch(err => console.error('Failed to cache audio:', err));
          }
        }
        
        // Phase 14d: Detect stream-death (backend crashed before sending any chunks)
        if (!receivedAnyChunks) {
          console.warn('[useNarration] No chunks received from primary provider, stream may have died');
          throw new Error('STREAM_DIED');
        }
      } catch (streamError) {
        // Phase 14d: If stream died or failed, auto-retry with Google TTS
        if (streamError instanceof Error && 
            (streamError.message === 'STREAM_DIED' || streamError.message.includes('TTS'))) {
          console.warn('[useNarration] Primary TTS failed, falling back to Google Cloud');
          
          // Retry with Google Cloud
          const fallbackConfig: NarrationConfig = {
            ...config,
            provider: 'google-cloud',
            voice: 'en-US-Neural2-D',
          };
          
          audioChunks.length = 0; // Clear any partial data
          
          for await (const chunk of narrationService.streamAudio(content, fallbackConfig)) {
            if (chunk.audioContent.length > 0) {
              audioChunks.push(chunk.audioContent);
            }

            if (chunk.isLast && audioChunks.length > 0) {
              const totalLength = audioChunks.reduce((sum, arr) => sum + arr.length, 0);
              const combinedArray = new Uint8Array(totalLength);
              let offset = 0;
              
              for (const arr of audioChunks) {
                combinedArray.set(arr, offset);
                offset += arr.length;
              }

              const audioBlob = new Blob([combinedArray], { type: 'audio/mpeg' });
              const audioUrl = URL.createObjectURL(audioBlob);

              if (!audioRef.current) {
                audioRef.current = new Audio();
              }
              
              audioRef.current.src = audioUrl;
              audioRef.current.playbackRate = fallbackConfig.speed;
              await audioRef.current.play();

              setState(prev => ({
                ...prev,
                status: 'playing',
                isLoading: false,
                config: fallbackConfig,
              }));
              return;
            }
          }
        }
        
        console.error('TTS streaming error:', streamError);
        throw new Error('Text-to-speech generation failed. Please try again later.');
      }
    } catch (error) {
      console.error('Playback error:', error);
      
      let errorMessage = 'Playback failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        status: 'error',
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [state.speed, state.config]);

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, status: 'paused' }));
    }
  }, []);

  /**
   * Resume playback
   */
  const resume = useCallback(async () => {
    if (audioRef.current) {
      await audioRef.current.play();
      setState(prev => ({ ...prev, status: 'playing' }));
    }
  }, []);

  /**
   * Stop playback and reset
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    narrationService.cancel();
    setState({
      status: 'idle',
      progress: 0,
      currentTime: 0,
      duration: 0,
      speed: initialConfig?.speed || 1.0,
      isLoading: false,
    });
  }, [initialConfig?.speed]);

  /**
   * Set playback speed
   */
  const setSpeed = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setState(prev => ({ ...prev, speed }));
  }, []);

  /**
   * Seek to position (seconds)
   */
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  /**
   * Download audio file
   */
  const downloadAudio = useCallback(() => {
    if (audioRef.current?.src) {
      const link = document.createElement('a');
      link.href = audioRef.current.src;
      link.download = 'narration.mp3';
      link.click();
    }
  }, []);

  // Update progress as audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration,
        progress: isNaN(progress) ? 0 : progress,
      }));
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, status: 'idle', progress: 100 }));
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', updateProgress);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing TTS streams
      narrationService.cancel();
      
      // Stop and cleanup audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        // Revoke blob URLs to free memory
        if (audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        // Remove event listeners
        audioRef.current.removeEventListener('timeupdate', () => {});
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        
        // Clear the audio element
        audioRef.current.src = '';
        audioRef.current = null;
      }
      
      // Close audio context
      audioContextRef.current?.close();
      audioContextRef.current = null;
      sourceBufferRef.current = null;
    };
  }, []);

  return {
    ...state,
    playContent,
    pause,
    resume,
    stop,
    setSpeed,
    seek,
    downloadAudio,
  };
}
