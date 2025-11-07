// Modular narration controls component
import React from 'react';
import { Play, Pause, Square, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { NarrationStatus } from '@/types/narration';

interface NarrationControlsProps {
  status: NarrationStatus;
  progress: number;
  currentTime: number;
  duration: number;
  speed: number;
  isLoading: boolean;
  error?: string;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (time: number) => void;
  className?: string;
  variant?: 'sticky-bottom' | 'inline' | 'floating';
}

export function NarrationControls({
  status,
  progress,
  currentTime,
  duration,
  speed,
  isLoading,
  error,
  onPlay,
  onPause,
  onStop,
  onSpeedChange,
  onSeek,
  className,
  variant = 'sticky-bottom',
}: NarrationControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const variantClasses = {
    'sticky-bottom': 'sticky bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
    'inline': 'relative border rounded-lg bg-muted/30',
    'floating': 'fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-background border',
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      <div className="container max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Play/Pause/Stop buttons */}
          <div className="flex items-center gap-2">
            {status === 'idle' && (
              <Button
                size="sm"
                onClick={onPlay}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Play
              </Button>
            )}

            {status === 'playing' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onPause}
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}

            {status === 'paused' && (
              <Button
                size="sm"
                onClick={onPlay}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}

            {(status === 'playing' || status === 'paused') && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onStop}
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex-1 space-y-1">
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={([value]) => {
                const newTime = (value / 100) * duration;
                onSeek(newTime);
              }}
              className="cursor-pointer"
              disabled={status === 'idle' || isLoading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <select
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="text-sm bg-background border rounded px-2 py-1 cursor-pointer"
              disabled={status === 'idle'}
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1.0}>1.0x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2.0}>2.0x</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
