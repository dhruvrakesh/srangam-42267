import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  selectedProvider: 'google-cloud' | 'openai';
  onProviderChange: (provider: 'google-cloud' | 'openai') => void;
  language: string;
}

const GOOGLE_VOICES = {
  'en-US': [
    { id: 'en-US-Neural2-J', name: 'Male Academic', flag: '🇺🇸' },
    { id: 'en-US-Neural2-F', name: 'Female Academic', flag: '🇺🇸' },
  ],
  'ta-IN': [
    { id: 'ta-IN-Wavenet-A', name: 'Tamil Female', flag: '🇮🇳' },
    { id: 'ta-IN-Wavenet-B', name: 'Tamil Male', flag: '🇮🇳' },
  ],
  'hi-IN': [
    { id: 'hi-IN-Neural2-C', name: 'Hindi Male', flag: '🇮🇳' },
    { id: 'hi-IN-Neural2-D', name: 'Hindi Female', flag: '🇮🇳' },
  ],
  'te-IN': [
    { id: 'te-IN-Standard-A', name: 'Telugu Female', flag: '🇮🇳' },
    { id: 'te-IN-Standard-B', name: 'Telugu Male', flag: '🇮🇳' },
  ],
  'kn-IN': [
    { id: 'kn-IN-Standard-A', name: 'Kannada Female', flag: '🇮🇳' },
    { id: 'kn-IN-Standard-B', name: 'Kannada Male', flag: '🇮🇳' },
  ],
  'bn-IN': [
    { id: 'bn-IN-Standard-A', name: 'Bengali Female', flag: '🇮🇳' },
    { id: 'bn-IN-Standard-B', name: 'Bengali Male', flag: '🇮🇳' },
  ],
};

const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy (Neutral)', flag: '🎙️' },
  { id: 'echo', name: 'Echo (Male)', flag: '🎙️' },
  { id: 'fable', name: 'Fable (British)', flag: '🎙️' },
  { id: 'onyx', name: 'Onyx (Deep)', flag: '🎙️' },
  { id: 'nova', name: 'Nova (Female)', flag: '🎙️' },
  { id: 'shimmer', name: 'Shimmer (Soft)', flag: '🎙️' },
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceChange,
  selectedProvider,
  onProviderChange,
  language,
}) => {
  const languageCode = language.startsWith('en') ? 'en-US' : language;
  const availableVoices = selectedProvider === 'google-cloud'
    ? GOOGLE_VOICES[languageCode as keyof typeof GOOGLE_VOICES] || GOOGLE_VOICES['en-US']
    : OPENAI_VOICES;

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedProvider} onValueChange={onProviderChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="google-cloud">
            <div className="flex items-center gap-2">
              <span>Google</span>
              <Badge variant="secondary" className="text-xs">Free</Badge>
            </div>
          </SelectItem>
          <SelectItem value="openai">
            <div className="flex items-center gap-2">
              <span>OpenAI</span>
              <Badge variant="outline" className="text-xs">Fast</Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedVoice} onValueChange={onVoiceChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableVoices.map((voice) => (
            <SelectItem key={voice.id} value={voice.id}>
              <div className="flex items-center gap-2">
                <span>{voice.flag}</span>
                <span>{voice.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
