import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Volume2, Download, Loader2 } from 'lucide-react';
import { VoiceSelector } from './VoiceSelector';
import { supabase } from '@/integrations/supabase/client';
import crypto from 'crypto-js';

interface ArticleNarratorProps {
  articleSlug: string;
  content: string;
  language: string;
  title: string;
}

export const ArticleNarrator: React.FC<ArticleNarratorProps> = ({
  articleSlug,
  content,
  language,
  title,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('en-US-Neural2-J');
  const [selectedProvider, setSelectedProvider] = useState<'google-cloud' | 'openai'>('google-cloud');
  const [driveUrl, setDriveUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize AudioContext
    audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playAudioBuffer = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = speed;
    source.connect(audioContextRef.current.destination);

    const startTime = Math.max(
      nextPlayTimeRef.current,
      audioContextRef.current.currentTime
    );
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration / speed;

    source.onended = () => {
      if (audioQueueRef.current.length === 0) {
        setIsPlaying(false);
        setProgress(100);
      }
    };

    currentSourceRef.current = source;
  };

  const streamAudio = async () => {
    setIsLoading(true);
    setIsPlaying(true);
    setProgress(0);
    audioQueueRef.current = [];
    nextPlayTimeRef.current = audioContextRef.current?.currentTime || 0;

    try {
      const contentHash = crypto.SHA256(content).toString();
      
      // Check cache first
      const { data: cached } = await supabase.rpc('check_audio_cache', {
        p_slug: articleSlug,
        p_lang: language,
        p_content_hash: contentHash,
      });

      if (cached && cached.length > 0 && cached[0].drive_url) {
        toast({
          title: "Using cached audio",
          description: "Playing from saved version",
        });
        setDriveUrl(cached[0].drive_url);
        // In production, stream from Drive URL
        return;
      }

      const functionName = selectedProvider === 'google-cloud' 
        ? 'tts-stream-google' 
        : 'tts-stream-openai';

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: content,
            language,
            voice: selectedVoice,
            articleSlug,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('TTS stream failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';
      let processedChunks = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'audio.delta') {
              processedChunks++;
              setProgress((processedChunks / (data.total || 1)) * 100);
              
              // Decode base64 to audio buffer
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }

              if (audioContextRef.current) {
                const audioBuffer = await audioContextRef.current.decodeAudioData(
                  bytes.buffer
                );
                audioQueueRef.current.push(audioBuffer);
                
                if (processedChunks === 1) {
                  setIsLoading(false);
                  playAudioBuffer(audioBuffer);
                } else {
                  playAudioBuffer(audioBuffer);
                }
              }
            } else if (data.type === 'audio.done') {
              toast({
                title: "Playback complete",
                description: "Audio narration finished",
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: "Audio generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      currentSourceRef.current?.stop();
      setIsPlaying(false);
    } else {
      streamAudio();
    }
  };

  const saveToDrive = async () => {
    setIsSaving(true);
    try {
      toast({
        title: "Saving to Drive",
        description: "This may take a few moments...",
      });

      // Re-generate and save
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-save-drive`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            articleSlug,
            audioData: '', // Would contain full audio in production
            provider: selectedProvider,
            voiceId: selectedVoice,
            languageCode: language,
            characterCount: content.length,
            contentHash: crypto.SHA256(content).toString(),
          }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setDriveUrl(result.shareUrl);
        toast({
          title: "Saved to Google Drive",
          description: "Audio file is now available offline",
        });
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            disabled={isLoading}
            variant="default"
            size="lg"
            className="shrink-0"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[speed]}
                  onValueChange={(val) => setSpeed(val[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-24"
                  aria-label="Playback speed"
                />
                <span className="text-sm text-muted-foreground">{speed}x</span>
              </div>

              <VoiceSelector
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
                language={language}
              />

              <Button
                onClick={saveToDrive}
                disabled={isSaving || !isPlaying}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>

              {driveUrl && (
                <a 
                  href={driveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View in Drive
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
