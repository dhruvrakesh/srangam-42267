
# Sub-Phase 21.2: Edge Function Scaffold

## Overview

This sub-phase creates the `sanskrit-analyze` edge function with Lovable AI fallback and updates the config.toml. The function provides admin-only Sanskrit text analysis using Gemini for transliteration, sandhi splitting, entity extraction, and translation.

---

## Files to Create/Modify

### 1. CREATE: `supabase/functions/sanskrit-analyze/index.ts`

A ~300-line edge function that:
- Validates authorization (admin-only via user_roles table)
- Accepts POST with `{ text, mode, options }`
- Uses Lovable AI Gateway (Gemini) for analysis
- Returns structured response with error codes

**Key Features:**

| Feature | Implementation |
|---------|----------------|
| CORS | Standard headers matching existing functions |
| Auth | Admin check via user_roles table |
| AI Gateway | `https://ai.gateway.lovable.dev/v1/chat/completions` |
| Model | `google/gemini-3-flash-preview` |
| Modes | `full`, `split`, `morph`, `ner`, `translate` |
| Errors | Structured codes SANSKRIT-E001 through E006 |

**Admin Check Pattern:**
```typescript
// Using service role to query user_roles
const { data: roleData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .eq('role', 'admin')
  .maybeSingle();

if (!roleData) {
  return Response with SANSKRIT-E006 (403 Forbidden)
}
```

**Analysis Modes:**

| Mode | AI Prompt Focus | Response Fields |
|------|-----------------|-----------------|
| `full` | All analysis steps | transliterated, sandhiSplit, morphology, entities, translation |
| `split` | Sandhi splitting only | transliterated, sandhiSplit |
| `morph` | Grammar analysis | transliterated, sandhiSplit, morphology |
| `ner` | Entity extraction | transliterated, sandhiSplit, entities |
| `translate` | Translation with evidence | transliterated, translation |

**Tool Calling for Structured Output:**
Uses Gemini's function calling to ensure valid JSON response with:
- `transliterated`: IAST with diacritics
- `sandhiSplit`: Array of split words
- `morphology`: Array of {word, root, case, number, gender}
- `entities`: Array of {text, type, normalized}
- `translation`: {text, evidence[], confidence}

**Error Codes:**

| Code | Status | Condition |
|------|--------|-----------|
| SANSKRIT-E001 | 400 | Empty text input |
| SANSKRIT-E002 | 400 | Invalid analysis mode |
| SANSKRIT-E003 | 502 | External API unreachable |
| SANSKRIT-E004 | 504 | Analysis exceeded timeout |
| SANSKRIT-E005 | 200 | Using fallback (warning in response) |
| SANSKRIT-E006 | 403 | Admin access required |

---

### 2. UPDATE: `supabase/config.toml`

Add 3 lines for the new function:

```toml
[functions.sanskrit-analyze]
verify_jwt = false
```

---

## Technical Implementation Details

### Request Schema

```typescript
interface SanskritAnalyzeRequest {
  text: string;                    // Sanskrit text (Devanagari or IAST)
  mode?: 'full' | 'split' | 'morph' | 'ner' | 'translate';
  options?: {
    transliterationScheme?: 'iast' | 'slp1' | 'hk';
    includeEvidence?: boolean;
  };
}
```

### Response Schema

```typescript
interface SanskritAnalysisResult {
  success: boolean;
  mode: string;
  source: 'lovable-ai-fallback' | 'python-api';
  data: {
    original: string;
    transliterated: string;
    sandhiSplit: string[];
    morphology?: MorphologyEntry[];
    entities?: EntityEntry[];
    translation?: TranslationResult;
  };
  warnings?: string[];
  error?: { code: string; message: string };
  processingTimeMs: number;
}

interface MorphologyEntry {
  word: string;
  root: string;
  case?: string;
  number?: string;
  gender?: string;
  partOfSpeech?: string;
}

interface EntityEntry {
  text: string;
  type: 'DEITY' | 'PLACE' | 'PERSON' | 'TRIBE' | 'DYNASTY' | 'TEXT' | 'CONCEPT';
  normalized?: string;
  context?: string;
}

interface TranslationResult {
  text: string;
  evidence?: string[];
  confidence?: number;
}
```

### AI Prompt Strategy

**System Prompt (Transliteration + Sandhi):**
```
You are a Sanskrit linguistics expert. Given Sanskrit text (Devanagari or romanized), provide:
1. IAST transliteration with proper diacritics (ā, ī, ū, ṛ, ṝ, ḷ, ṃ, ḥ, ñ, ṅ, ṭ, ḍ, ṇ, ś, ṣ)
2. Sandhi-split words as an array

Example:
Input: "नारायणं नमस्कृत्य"
Output: {
  "transliterated": "nārāyaṇaṃ namaskṛtya",
  "sandhiSplit": ["nārāyaṇam", "namas", "kṛtya"]
}
```

**System Prompt (Full Analysis):**
Includes additional sections for morphology, entities, and translation with evidence-based citations.

---

## Dependencies

| Dependency | Status |
|------------|--------|
| `LOVABLE_API_KEY` | Already configured (auto-provided) |
| `SUPABASE_URL` | Auto-available in edge functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-available for admin checks |

---

## Security Model

1. **Auth Header Required**: Function extracts JWT from Authorization header
2. **Admin Check**: Queries `user_roles` table for admin role
3. **No User Data Storage**: Analysis results are not persisted
4. **Rate Limiting**: Handled by Lovable AI gateway (429/402 errors surfaced)

---

## Risk Assessment

| Risk | Probability | Mitigation |
|------|-------------|------------|
| AI hallucination on morphology | Medium | Mark as "AI approximate" in warnings |
| Rate limiting | Low | Surface 429 errors with retry guidance |
| Long Sanskrit texts timeout | Medium | Truncate to 2000 characters |

---

## Success Criteria

After this sub-phase:
- `POST /functions/v1/sanskrit-analyze` returns 403 for non-admins
- Admin users receive AI-analyzed Sanskrit text
- Response includes structured data with proper TypeScript types
- Errors return structured codes (SANSKRIT-E001 through E006)
- Console logs show "Using Lovable AI fallback"

---

## Estimated Size

- `index.ts`: ~280 lines
- `config.toml` update: 3 lines added

This is a focused, low-risk change that creates the backend infrastructure for Sanskrit analysis.
