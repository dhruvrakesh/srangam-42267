// Intelligent voice selection based on content analysis
import type { ContentProfile, VoiceConfig, NarrationTone, NarrationContentType } from '@/types/narration';

export class VoiceStrategyEngine {
  /**
   * Analyze content to determine profile characteristics
   */
  analyzeContent(text: string, contentType: NarrationContentType): ContentProfile {
    const wordCount = text.split(/\s+/).length;
    
    // Detect Sanskrit terms (words with diacritics)
    const sanskritPattern = /[āīūṛṝḷḹṃḥṅñṭḍṇśṣ]/gi;
    const sanskritMatches = text.match(sanskritPattern) || [];
    const sanskritTermCount = sanskritMatches.length;
    const hasSanskrit = sanskritTermCount > 5;

    // Detect citations
    const citationPattern = /\(([A-Z][a-z]+ \d{4})\)|According to ([A-Z][a-z]+)/g;
    const hasCitations = citationPattern.test(text);

    // Detect poetry/verse (simple heuristic: short lines, no periods)
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const shortLines = lines.filter(l => l.length < 80 && !l.trim().endsWith('.')).length;
    const hasPoetry = shortLines > lines.length * 0.3;

    // Determine content type
    let detectedType: 'narrative' | 'analytical' | 'descriptive' = 'descriptive';
    if (text.includes('battle') || text.includes('voyage') || text.includes('journey')) {
      detectedType = 'narrative';
    } else if (hasCitations || text.includes('evidence') || text.includes('analysis')) {
      detectedType = 'analytical';
    }

    // Emotional tone
    let emotionalTone: 'neutral' | 'dramatic' | 'reverent' = 'neutral';
    if (text.includes('sacred') || text.includes('temple') || text.includes('deity')) {
      emotionalTone = 'reverent';
    } else if (text.includes('storm') || text.includes('conquer') || text.includes('defeat')) {
      emotionalTone = 'dramatic';
    }

    // Complexity
    const avgWordLength = text.split(/\s+/).reduce((sum, w) => sum + w.length, 0) / wordCount;
    let complexity: 'simple' | 'moderate' | 'advanced' = 'moderate';
    if (avgWordLength > 6 || hasCitations) {
      complexity = 'advanced';
    } else if (avgWordLength < 5) {
      complexity = 'simple';
    }

    return {
      hasPoetry,
      hasCitations,
      hasSanskrit,
      contentType: detectedType,
      emotionalTone,
      complexity,
      wordCount,
      sanskritTermCount,
    };
  }

  /**
   * Select optimal voice based on content profile and language
   */
  selectVoice(
    profile: ContentProfile,
    language: string,
    contentType: NarrationContentType,
    userPreference?: Partial<VoiceConfig>
  ): VoiceConfig {
    // User preference takes precedence
    if (userPreference?.voiceId && userPreference?.provider) {
      return {
        provider: userPreference.provider,
        voiceId: userPreference.voiceId,
        languageCode: userPreference.languageCode || this.getLanguageCode(language),
        name: userPreference.name || userPreference.voiceId,
        ...userPreference,
      };
    }

    // Language-specific selection
    const langCode = this.getLanguageCode(language);
    
    if (language === 'en') {
      return this.selectEnglishVoice(profile, contentType);
    } else if (['hi', 'ta', 'te', 'kn', 'bn', 'as', 'pa'].includes(language)) {
      return this.selectIndicVoice(language, profile);
    }

    // Default fallback
    return {
      provider: 'google-cloud',
      voiceId: 'en-US-Neural2-J',
      languageCode: 'en-US',
      name: 'Journey (Neural)',
      speakingRate: 1.0,
    };
  }

  /**
   * Select voice for English content based on profile
   */
  private selectEnglishVoice(profile: ContentProfile, contentType: NarrationContentType): VoiceConfig {
    // Sanskrit-heavy scholarly content
    if (profile.hasSanskrit && profile.hasCitations) {
      return {
        provider: 'google-cloud',
        voiceId: 'en-US-Neural2-J',
        languageCode: 'en-US',
        name: 'Journey (Neural)',
        pitch: 0,
        speakingRate: 0.95, // Slightly slower for Sanskrit terms
      };
    }

    // Dramatic narrative
    if (profile.emotionalTone === 'dramatic' && profile.contentType === 'narrative') {
      return {
        provider: 'google-cloud',
        voiceId: 'en-US-Neural2-D',
        languageCode: 'en-US',
        name: 'Dynamic (Neural)',
        pitch: 1,
        speakingRate: 1.05, // Faster for dramatic effect
      };
    }

    // Reverent/temple content
    if (profile.emotionalTone === 'reverent') {
      return {
        provider: 'google-cloud',
        voiceId: 'en-US-Neural2-F',
        languageCode: 'en-US',
        name: 'Feminine (Neural)',
        pitch: -1,
        speakingRate: 0.9, // Slower, more reverent
      };
    }

    // Short-form content (glossary terms, previews)
    if (contentType === 'term' || contentType === 'preview') {
      return {
        provider: 'openai',
        voiceId: 'echo',
        languageCode: 'en-US',
        name: 'Echo',
        speakingRate: 1.0,
      };
    }

    // Default scholarly voice
    return {
      provider: 'google-cloud',
      voiceId: 'en-US-Neural2-J',
      languageCode: 'en-US',
      name: 'Journey (Neural)',
      speakingRate: 1.0,
    };
  }

  /**
   * Select voice for Indic languages
   */
  private selectIndicVoice(language: string, profile: ContentProfile): VoiceConfig {
    const langCode = this.getLanguageCode(language);
    
    // Google WaveNet/Neural2 voices for quality
    const voiceMap: Record<string, string> = {
      'hi': 'hi-IN-Neural2-D', // Hindi
      'ta': 'ta-IN-Wavenet-D', // Tamil
      'te': 'te-IN-Standard-B', // Telugu
      'kn': 'kn-IN-Wavenet-B', // Kannada
      'bn': 'bn-IN-Wavenet-A', // Bengali
      'as': 'en-IN-Wavenet-D', // Assamese (fallback to English-India)
      'pa': 'pa-IN-Wavenet-A', // Punjabi
    };

    return {
      provider: 'google-cloud',
      voiceId: voiceMap[language] || `${langCode}-Wavenet-A`,
      languageCode: langCode,
      name: `${language.toUpperCase()} Voice`,
      speakingRate: profile.complexity === 'advanced' ? 0.95 : 1.0,
    };
  }

  /**
   * Map short language code to full locale code
   */
  private getLanguageCode(lang: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'kn': 'kn-IN',
      'bn': 'bn-IN',
      'as': 'as-IN',
      'pa': 'pa-IN',
      'pn': 'en-IN', // Manipuri fallback
    };

    // If already in correct format, return as-is
    if (lang.includes('-')) return lang;
    
    return languageMap[lang] || 'en-US';
  }

  /**
   * Get recommended tone for content type
   */
  getRecommendedTone(contentType: NarrationContentType): NarrationTone {
    const toneMap: Record<NarrationContentType, NarrationTone> = {
      'article': 'scholarly',
      'page': 'explanatory',
      'term': 'neutral',
      'visualization': 'explanatory',
      'preview': 'narrative',
    };

    return toneMap[contentType] || 'neutral';
  }
}

export const voiceStrategyEngine = new VoiceStrategyEngine();
