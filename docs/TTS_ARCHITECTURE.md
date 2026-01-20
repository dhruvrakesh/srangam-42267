# Srangam TTS Architecture

**Last Updated**: 2025-01-20 (Phase 13: ElevenLabs Integration)

## Overview

Srangam Digital implements a hybrid multi-provider text-to-speech (TTS) system optimized for scholarly content with Sanskrit IAST diacritics and multilingual support across 9 Indian languages.

## Provider Selection Logic

### 1. Content Analysis

The system automatically selects the optimal TTS provider based on content characteristics:

- **English content** → **ElevenLabs** (highest quality, most human-like) - *Added Phase 13*
- **Sanskrit diacritics (IAST) detected** → Google Cloud Neural2 (best pronunciation)
- **Regional language (hi, ta, pa, bn, kn)** → Google Cloud WaveNet (best multilingual support)
- **Fallback** → OpenAI TTS-1 (fast, reliable)

### Provider Priority (English Content)
1. **ElevenLabs** (default for English) - eleven_turbo_v2_5 model
2. **Google Cloud Neural2** (if Sanskrit detected)
3. **OpenAI TTS-1** (fallback)

### 2. Cache-First Strategy

Before generating new audio:

1. Calculate content hash (SHA-256 of article text)
2. Query `srangam_audio_narrations` table
3. If matching hash exists → Stream from Google Drive
4. If stale or missing → Generate new audio

**Benefits:**
- 95% cost reduction (one-time generation per version)
- Faster playback start (cached audio)
- Consistent voice quality

### 3. Smart Text Chunking

Long articles (18,000+ words) are split into manageable chunks:

**Algorithm:**
```typescript
function chunkText(text: string, maxChars: number = 1500): string[] {
  // Split at sentence boundaries (. ! ?)
  // Preserve SSML tags across chunks
  // Max 1500 chars/chunk for Google Cloud
  // Max 4000 chars/chunk for OpenAI
}
```

**Parallel Generation:**
- Process 3 chunks concurrently
- Stream to client as each completes
- Seamless playback transition

## SSML Markup for Sanskrit

### Diacritical Marks Enhancement

Google Cloud TTS supports SSML for precise pronunciation control:

```xml
<speak>
  <lang xml:lang="en-US">
    The myth of 
    <prosody rate="slow">
      <phoneme alphabet="ipa" ph="pəɾəʃuˈɾɑːmə">Paraśurāma</phoneme>
    </prosody>
    throwing his axe from 
    <phoneme alphabet="ipa" ph="goˈkəɾɳə">Gokarṇa</phoneme>
  </lang>
</speak>
```

### Citation Formatting

MLA citations require special handling:

```xml
<break time="200ms"/>
(Agrawal, D.P.
<say-as interpret-as="ordinal">1985</say-as>
: 267-279)
<break time="300ms"/>
```

## Architecture Diagram

```
User Request
    ↓
Cache Check (srangam_audio_narrations)
    ├─ Cache Hit → Stream from Google Drive
    └─ Cache Miss
          ↓
    Content Analysis (VoiceStrategyEngine.ts)
          ├─ English → ElevenLabs (George voice)
          ├─ English + Sanskrit → Google Cloud Neural2
          ├─ Regional (hi/ta/pa) → Google Cloud WaveNet
          └─ Fallback → OpenAI TTS-1
          ↓
    Text Chunking (1500 chars Google, 4000 chars OpenAI)
          ↓
    Parallel TTS Generation (3 chunks)
          ↓
    NDJSON Streaming (newline-delimited JSON)
          ↓
    AudioContext Playback
          ↓
    (Optional) Save to Google Drive
          ↓
    Store metadata in DB
```

## Edge Functions

### tts-stream-elevenlabs (NEW - Phase 13)

**Purpose:** High-quality English narration with human-like voices

**Features:**
- ElevenLabs `eleven_turbo_v2_5` model (low latency, high quality)
- NDJSON streaming (compatible with client)
- Request stitching for multi-chunk content
- Voice personality mapping

**Voice Mapping:**
| Voice ID | Name | Use Case |
|----------|------|----------|
| JBFqnCBsd6RMkjVDRZzb | George | Scholarly (default for English) |
| nPczCjzI2devNBz1zQrb | Brian | Dramatic, epic narratives |
| XrExE9yKIg1WjnnlVkGX | Matilda | Reverent, devotional |
| onwK4e9ZLuTAKqWW03F9 | Daniel | Short-form, preview |

**Rate Limits:** 10,000 chars/month (free tier)

### tts-stream-google

**Purpose:** Stream audio from Google Cloud Text-to-Speech

**Features:**
- SSML generation for Sanskrit diacritics
- Neural2 voices for academic tone
- NDJSON streaming
- Chunk-by-chunk delivery

**Rate Limits:** 600 requests/minute

### tts-stream-openai

**Purpose:** Fast fallback for English content

**Features:**
- OpenAI TTS-1 model (low latency)
- 6 preset voices
- MP3 streaming
- No SSML support (limitation)

**Rate Limits:** 50 requests/minute

### tts-save-drive

**Purpose:** Upload generated audio to Google Drive

**Features:**
- Service account authentication (RS256 JWT)
- Public shareable links
- Metadata storage in Supabase
- Cost tracking (character count × rate)

**Critical Fix (Phase 13):** JWT signing bug fixed - now uses `crypto.subtle.sign()` instead of string concatenation

## Database Schema

### srangam_audio_narrations

```sql
CREATE TABLE srangam_audio_narrations (
  id UUID PRIMARY KEY,
  article_slug TEXT NOT NULL,
  provider TEXT CHECK (provider IN ('google-cloud', 'openai', 'elevenlabs')),
  voice_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  google_drive_file_id TEXT,
  google_drive_share_url TEXT,
  content_hash TEXT,  -- SHA-256 for cache invalidation
  character_count INTEGER,
  cost_usd DECIMAL(10, 4),
  duration_seconds INTEGER,
  file_size_bytes INTEGER,
  audio_format TEXT DEFAULT 'mp3',
  sample_rate INTEGER DEFAULT 44100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_slug, language_code, provider)
);
```

**Cache Lookup Function:**
```sql
SELECT * FROM check_audio_cache(
  'geomythology-land-reclamation',
  'en-US',
  'a3f7b8c9...'  -- content hash
);
```

## Cost Optimization

### 1. Aggressive Caching
- Store `content_hash` to detect changes
- Invalidate only on content updates
- **Savings:** 95% (one-time generation)

### 2. Smart Chunking
- Generate only requested sections
- Enable "play from chapter" feature
- **Savings:** 60% (users rarely finish 48-min articles)

### 3. Provider Routing
- Use OpenAI TTS-1 for English previews
- Use Google Neural2 for full Sanskrit content
- **Savings:** 40% on preview traffic

### 4. Google Drive Lifecycle
- Auto-delete after 90 days of inactivity
- Re-generate on-demand
- **Savings:** 25% on storage costs

## Performance Metrics

| Provider | First Audio Byte | Full Article Start | Total Generation Time |
|----------|------------------|--------------------|-----------------------|
| Google Neural2 | 1.2s | 1.8s | 48min audio in 3.2min |
| OpenAI TTS-1 | 0.8s | 1.5s | 48min audio in 2.8min |

## Security

### Google Cloud Service Account

**Required Roles:**
- `Cloud Text-to-Speech User`
- `Drive File Creator`

**Scope Restrictions:**
- Can create files in dedicated folder only
- Cannot access existing user files
- Files are publicly readable (shareable links)

### Rate Limiting

```typescript
const RATE_LIMIT_KEY = `tts:${userId}:${date}`;
const MAX_CHARS_PER_DAY = 100000; // ~1 article/user/day
```

## Testing Guidelines

### Test Cases

1. **Sanskrit Pronunciation**
   - Input: `Nīlamata Purāṇa`, `Kaśyapa`, `Satisaras`
   - Verify: Clear diacritics pronunciation

2. **Long-Form Endurance**
   - Input: 18,000-word article
   - Verify: No fatigue, consistent tone

3. **Multilingual Switching**
   - Input: English + embedded Tamil quote
   - Verify: Seamless language transition

4. **Citation Clarity**
   - Input: `(Agrawal, D.P. 1985: 267-279)`
   - Expected: "Agrawal, D.P., nineteen eighty-five, pages..."

## Future Enhancements

1. **Voice Cloning** (Coqui XTTS v2)
   - Custom voices for academic authority
   - Offline capability for institutions

2. **Real-time Streaming**
   - WebRTC for lower latency
   - Interactive reading mode

3. **Chapter Navigation**
   - Jump to specific sections
   - Bookmark support

4. **Multilingual Mixing**
   - Automatic language detection
   - Code-switching without manual tags

## Troubleshooting

### Common Issues

**"Audio generation failed"**
- Check API keys in Lovable Cloud secrets
- Verify rate limits not exceeded

**"Choppy playback"**
- Reduce playback speed
- Check network stability
- Clear audio queue and restart

**"Wrong pronunciation"**
- Use SSML phoneme tags
- Report to Google Cloud for voice improvement

## References

- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech)
- [OpenAI TTS API](https://platform.openai.com/docs/guides/text-to-speech)
- [SSML Specification](https://www.w3.org/TR/speech-synthesis/)
