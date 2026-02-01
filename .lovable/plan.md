
# Phase 21: Sanskrit Automaton Integration - Reliable Incremental Implementation

## Diagnosis: Why Execution Fails

Based on your description that "the Lovable project making changes to code fails and stops," this typically occurs when:

1. **Too many parallel file changes** - Large batch writes can time out
2. **Complex file modifications** - Long files with many edits
3. **Missing dependencies** - Files referencing non-existent paths

## Solution: Smaller, Sequential Steps

I will implement Phase 21 in **6 discrete sub-phases**, each with minimal file changes. After each sub-phase completes successfully, proceed to the next.

---

## Sub-Phase 21.1: Documentation Only (3 files)

Create documentation to preserve context:

| File | Action | Size |
|------|--------|------|
| `docs/SANSKRIT_AUTOMATON.md` | CREATE | ~150 lines |
| `docs/IMPLEMENTATION_STATUS.md` | CREATE | ~100 lines |
| `docs/SCALABILITY_ROADMAP.md` | UPDATE | Add ~30 lines |

**This sub-phase:** No edge functions, no React components.

---

## Sub-Phase 21.2: Edge Function Scaffold (2 files)

Create the `sanskrit-analyze` edge function with Lovable AI fallback:

| File | Action |
|------|--------|
| `supabase/functions/sanskrit-analyze/index.ts` | CREATE |
| `supabase/config.toml` | UPDATE (add 3 lines) |

**Features in this sub-phase:**
- CORS handling
- Admin-only access check (mirrors `UniversalNarrator.tsx` pattern)
- Lovable AI fallback for transliteration, sandhi, translation
- Structured error codes (SANSKRIT-E001 through E005)

---

## Sub-Phase 21.3: React Hook (1 file)

Create the API hook for calling the edge function:

| File | Action |
|------|--------|
| `src/hooks/useSanskritAnalysis.ts` | CREATE |

**Features:**
- Calls `/functions/v1/sanskrit-analyze`
- Handles loading, error, success states
- Returns structured analysis result

---

## Sub-Phase 21.4: Input Component (1 file)

Create the input panel component:

| File | Action |
|------|--------|
| `src/components/sanskrit/SanskritInputPanel.tsx` | CREATE |

**Features:**
- Devanagari text input with proper font
- Sample text buttons (3 canonical verses)
- Mode selector (Full, Sandhi, Translate)
- Analyze button with loading state

---

## Sub-Phase 21.5: Results Component (1 file)

Create the results display component:

| File | Action |
|------|--------|
| `src/components/sanskrit/SanskritResultsPanel.tsx` | CREATE |

**Features:**
- Tabbed interface (Sandhi, Morphology, Entities, Translation)
- Admin-only visibility (matches narration pattern)
- Fallback indicator when using AI
- Export buttons (JSON, copy)

---

## Sub-Phase 21.6: Landing Page Integration (1 file)

Update the existing Sanskrit Translator page:

| File | Action |
|------|--------|
| `src/pages/SanskritTranslator.tsx` | UPDATE |

**Changes:**
- Add "Try It Now" section between pipeline and demo sections
- Import and render `SanskritInputPanel` and `SanskritResultsPanel`
- Admin gate for interactive features (public sees static demo)

---

## Architecture Summary

```text
User (Admin) → SanskritInputPanel
                     ↓
              useSanskritAnalysis hook
                     ↓
              Edge Function (sanskrit-analyze)
                     ↓
          ┌─────────┴─────────┐
          ↓                   ↓
    SANSKRIT_API_URL     Lovable AI Fallback
    (external Python)    (Gemini-based)
          ↓                   ↓
    Full Pipeline        AI Approximation
          ↓                   ↓
              SanskritResultsPanel
```

---

## Edge Function: Key Design Decisions

### Admin-Only Access

```typescript
// Mirrors existing UniversalNarrator pattern
const isAdmin = await checkAdminRole(supabase, userId);
if (!isAdmin) {
  return new Response(JSON.stringify({
    error: 'Admin access required',
    code: 'SANSKRIT-E006'
  }), { status: 403, headers: corsHeaders });
}
```

### Lovable AI Fallback Prompts

When `SANSKRIT_API_URL` is not configured, the edge function uses Gemini for:

1. **Transliteration**: Devanagari ↔ IAST with diacritics
2. **Sandhi splitting**: AI-suggested word boundaries (marked as approximate)
3. **Translation**: Evidence-based with citation prompts
4. **Entity extraction**: NER via structured output

### Response Schema

```typescript
interface SanskritAnalysisResult {
  success: boolean;
  mode: 'full' | 'split' | 'morph' | 'ner' | 'translate';
  source: 'python-api' | 'lovable-ai-fallback';
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
}
```

---

## Files Summary (9 total)

| Sub-Phase | Files | Risk |
|-----------|-------|------|
| 21.1 | 3 docs | Low |
| 21.2 | 2 (edge fn + config) | Medium |
| 21.3 | 1 hook | Low |
| 21.4 | 1 component | Low |
| 21.5 | 1 component | Low |
| 21.6 | 1 page update | Medium |

---

## Secret Requirements

| Secret | Required Now | Notes |
|--------|--------------|-------|
| `LOVABLE_API_KEY` | Already configured | Auto-provided |
| `SANSKRIT_API_URL` | No | Add when Python API deployed |

---

## External Dependencies (User Action Later)

1. **Deploy Python API** to Railway/Render/Fly.io
2. **Create `api.py`** wrapper using FastAPI (I can provide exact code)
3. **Add `SANSKRIT_API_URL`** secret to Lovable Cloud

---

## Recommended Execution Order

1. Approve this plan
2. I implement **Sub-Phase 21.1** (docs only)
3. Verify changes applied successfully
4. Request **Sub-Phase 21.2** (edge function)
5. Continue sequentially through 21.6

This incremental approach minimizes the risk of execution failures.

---

## Success Criteria

After all sub-phases:
- Admin users see "Try It Now" section on `/sanskrit-translator`
- Entering Sanskrit text and clicking "Analyze" returns AI-generated analysis
- Results display in tabbed interface
- Non-admin users see static landing page only
- Console shows "Using Lovable AI fallback" until Python API connected
