// Enterprise-grade narration type definitions

export type NarrationProvider = 'google-cloud' | 'openai' | 'elevenlabs';
export type NarrationContentType = 'article' | 'page' | 'term' | 'visualization' | 'preview';
export type NarrationTone = 'scholarly' | 'narrative' | 'explanatory' | 'poetic' | 'neutral';
export type NarrationStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
export type ContentComplexity = 'simple' | 'moderate' | 'advanced';
export type EmotionalTone = 'neutral' | 'dramatic' | 'reverent';

export interface NarrationConfig {
  provider: NarrationProvider;
  voice: string;
  speed: number;
  language: string;
  contentType: NarrationContentType;
  contextHints?: {
    tone?: NarrationTone;
    emphasis?: string[]; // Words/phrases to emphasize
    pronunciation?: Record<string, string>; // Custom pronunciation guide
    hasCitations?: boolean;
    hasSanskrit?: boolean;
    hasPoetry?: boolean;
  };
}

export interface ContentProfile {
  hasPoetry: boolean;
  hasCitations: boolean;
  hasSanskrit: boolean;
  contentType: 'narrative' | 'analytical' | 'descriptive';
  emotionalTone: EmotionalTone;
  complexity: ContentComplexity;
  wordCount: number;
  sanskritTermCount: number;
}

export interface VoiceConfig {
  provider: NarrationProvider;
  voiceId: string;
  languageCode: string;
  name: string;
  gender?: 'male' | 'female' | 'neutral';
  pitch?: number;
  speakingRate?: number;
}

export interface AudioChunk {
  audioContent: Uint8Array;
  chunkIndex: number;
  totalChunks: number;
  isLast: boolean;
}

export interface CachedAudio {
  url: string;
  metadata: NarrationMetadata;
  segments?: AudioSegment[];
  createdAt: string;
  expiresAt?: string;
}

export interface AudioSegment {
  index: number;
  url: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface NarrationMetadata {
  contentHash: string;
  articleSlug?: string;
  language: string;
  provider: NarrationProvider;
  voice: string;
  duration?: number;
  fileSize?: number;
  config: NarrationConfig;
}

export interface NarrationState {
  status: NarrationStatus;
  progress: number; // 0-100
  currentTime: number; // seconds
  duration: number; // seconds
  speed: number;
  isLoading: boolean;
  error?: string;
  config?: NarrationConfig;
  metadata?: NarrationMetadata;
}

export interface NarrationBookmark {
  id: string;
  articleSlug: string;
  timestamp: number; // seconds into narration
  note: string;
  highlightedText: string;
  createdAt: string;
}

export interface NarrationAnalytics {
  articleSlug: string;
  userId?: string;
  sessionId: string;
  startedAt: string;
  completed: boolean;
  playbackEvents: PlaybackEvent[];
  device: 'mobile' | 'desktop' | 'tablet';
  language: string;
  provider: NarrationProvider;
  voice: string;
}

export interface PlaybackEvent {
  type: 'play' | 'pause' | 'resume' | 'seek' | 'speed_change' | 'complete';
  timestamp: string;
  value?: number; // for seek position or speed value
}
