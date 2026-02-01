
# Phase 21: Sanskrit Automaton Integration

## Overview

This phase integrates the Sanskrit Automaton Python pipeline with the Srangam platform, enabling interactive Sanskrit text analysis directly on the platform. The implementation follows a three-tier architecture: external Python API, Edge Function proxy, and interactive React UI.

---

## Context Preservation: Documentation First

Before implementation, update project documentation to capture the Sanskrit Automaton architecture and integration plan.

### File: `docs/SANSKRIT_AUTOMATON.md` (NEW)

Master documentation for the Sanskrit Automaton integration:

```text
Contents:
- Repository overview (sa.py CLI tool)
- Pipeline stages (normalize, sandhi, morph, NER, translate)
- Dependencies (fastapi, sanskrit_parser, indic-transliteration)
- Deployment options (Railway, Render, Fly.io)
- API contract specification
- Integration architecture with Srangam
- Fallback strategies (Lovable AI, cached responses)
```

### File: `docs/IMPLEMENTATION_STATUS.md` (UPDATE)

Add Phase 21 tracking section:

```markdown
## Phase 21 (February 2026) - In Progress

| Task | Status | Notes |
|------|--------|-------|
| 21.1 Documentation | ✅ COMPLETE | `docs/SANSKRIT_AUTOMATON.md` |
| 21.2 Edge Function Proxy | 🔲 PENDING | `sanskrit-analyze` function |
| 21.3 Python API Deployment | 🔲 PENDING | External hosting required |
| 21.4 Interactive UI Components | 🔲 PENDING | Input panel, results viewer |
| 21.5 Fallback Mode (Lovable AI) | 🔲 PENDING | Gemini-based analysis |
| 21.6 Landing Page Update | 🔲 PENDING | Live demo integration |
```

### File: `docs/SCALABILITY_ROADMAP.md` (UPDATE)

Add Sanskrit Automaton service to architecture:

```markdown
### External Services

| Service | Purpose | Dependency |
|---------|---------|------------|
| Sanskrit Automaton API | Text analysis | Railway/Render |
| Sanskrit Heritage | Morphological data | inria.fr |
| IndicTrans2 | Machine translation | Hugging Face |
```

---

## Architecture: Three-Tier Design

```text
┌─────────────────────────────────────────────────────────────┐
│  TIER 1: React Frontend (Srangam)                           │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │ SanskritInput   │  │ SanskritResults                 │   │
│  │ - Devanagari    │→ │ - Sandhi splits                 │   │
│  │ - IAST toggle   │  │ - Morphology table              │   │
│  │ - Sample texts  │  │ - NER highlights                │   │
│  └─────────────────┘  │ - Translation + citations       │   │
│                       └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ POST /sanskrit-analyze
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  TIER 2: Supabase Edge Function (sanskrit-analyze)          │
│  - CORS handling                                            │
│  - Request validation                                       │
│  - Route to external API or Lovable AI fallback             │
│  - Response normalization                                   │
│  - Error handling with structured codes                     │
└─────────────────────────────────────────────────────────────┘
                            │ POST /analyze
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  TIER 3: Python API (External - Railway/Render)             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │normalize│→ │sandhi   │→ │morph    │→ │translate│        │
│  │_text.py │  │_split.py│  │_parse.py│  │_mt.py   │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                             │
│  Dependencies: sanskrit_parser, indic-transliteration       │
│  Storage: SQLite (context.db)                               │
│  External: Sanskrit Heritage API, OpenAI/Lovable AI         │
└─────────────────────────────────────────────────────────────┘
```

---

## Component 1: Python API Deployment (External)

### Repository Structure (from uploaded ZIP)

Based on analysis of `sa.py` and `requirements.txt`:

```text
sanskrit-automaton/
├── sa.py                    # CLI entry point
├── requirements.txt         # Python dependencies
├── scripts/
│   ├── db_utils.py          # SQLite schema
│   ├── ingest_any_pdf.py    # PDF ingestion
│   ├── translate_passages.py # Translation engine
│   ├── polish_translation_debroy.py
│   ├── export_html.py       # HTML export
│   └── run_inbox.py         # Batch processing
├── data/
│   └── context.db           # SQLite database
└── api.py                   # FastAPI server (TO CREATE)
```

### FastAPI Wrapper (api.py - to be created externally)

```python
# Key endpoints for Srangam integration:
POST /analyze
  Body: { text, mode, options }
  Returns: { splits, morphology, entities, translation }

POST /translate
  Body: { text, style, explain }
  Returns: { translation, evidence, confidence }

GET /health
  Returns: { status, version, dependencies }
```

### Deployment Requirements

| Platform | Configuration |
|----------|---------------|
| Railway | `railway.json` with Python 3.11 |
| Render | `render.yaml` with FastAPI service |
| Fly.io | `fly.toml` with Uvicorn |

**Secret Required:** `SANSKRIT_API_URL` (e.g., `https://sanskrit-automaton.railway.app`)

---

## Component 2: Edge Function Proxy

### File: `supabase/functions/sanskrit-analyze/index.ts`

```typescript
// Core functionality:
// 1. Accept POST with { text, mode, options }
// 2. Validate input (non-empty text, valid mode)
// 3. Check SANSKRIT_API_URL secret
// 4. If external API unavailable, use Lovable AI fallback
// 5. Return normalized response with error codes
```

**Modes Supported:**

| Mode | Pipeline Steps | Response Fields |
|------|----------------|-----------------|
| `full` | All 5 stages | splits, morphology, entities, translation |
| `split` | Normalize + Sandhi | splits only |
| `morph` | Normalize + Sandhi + Parse | splits, morphology |
| `ner` | Full except translate | splits, morphology, entities |
| `translate` | All stages | translation, evidence |

**Error Codes:**

| Code | Type | Message |
|------|------|---------|
| `SANSKRIT-E001` | validation | Empty text input |
| `SANSKRIT-E002` | validation | Invalid analysis mode |
| `SANSKRIT-E003` | network | External API unreachable |
| `SANSKRIT-E004` | timeout | Analysis exceeded 30s |
| `SANSKRIT-E005` | fallback | Using Lovable AI (reduced accuracy) |

### Lovable AI Fallback Mode

When `SANSKRIT_API_URL` is not configured or unreachable:

```typescript
// Use Gemini for:
// 1. Transliteration (Devanagari ↔ IAST)
// 2. Basic sandhi suggestions
// 3. Translation with evidence prompt
// 4. Entity extraction via NER prompt

// Limitations clearly communicated:
// - No sanskrit_parser morphology
// - AI-based splits (not rule-based)
// - Reduced grammatical precision
```

---

## Component 3: React UI Components

### File: `src/components/sanskrit/SanskritInputPanel.tsx`

```typescript
// Features:
// - Devanagari text input with proper font
// - IAST transliteration toggle
// - Sample text buttons (Mahābhārata, Gītā, Upaniṣads)
// - Mode selector (Full Analysis, Sandhi Only, Translate)
// - Character counter and validation
// - "Analyzing..." loading state
```

### File: `src/components/sanskrit/SanskritResultsPanel.tsx`

```typescript
// Features:
// - Tabbed interface: Sandhi | Morphology | Entities | Translation
// - Sandhi tab: Word-by-word split with highlighting
// - Morphology tab: Table with root, case, number, gender
// - Entities tab: Clickable terms linked to cultural terms DB
// - Translation tab: English with citations and evidence
// - Export buttons: JSON, HTML, Copy
// - Fallback indicator (if using Lovable AI)
```

### File: `src/hooks/useSanskritAnalysis.ts`

```typescript
// API hook:
// - Calls /sanskrit-analyze edge function
// - Handles loading, error, success states
// - Caches recent analyses (5 min TTL)
// - Tracks usage for analytics
```

---

## Component 4: Landing Page Integration

### File: `src/pages/SanskritTranslator.tsx` (UPDATE)

Add interactive demo section between "How the Pipeline Works" and "See It In Action":

```text
New Section: "Try It Now"
┌─────────────────────────────────────────────────────────────┐
│  LIVE ANALYSIS                                              │
│  ┌─────────────────────────────────────────────────────────┐
│  │ [Devanagari input area]                                 │
│  │ नारायणं नमस्कृत्य नरं चैव नरोत्तमम्                     │
│  └─────────────────────────────────────────────────────────┘
│  [Full Analysis] [Sandhi Only] [Translate]                  │
│                                                             │
│  ┌───────┬──────────┬──────────┬────────────┐              │
│  │Sandhi │Morphology│ Entities │Translation │              │
│  └───────┴──────────┴──────────┴────────────┘              │
│  ┌─────────────────────────────────────────────────────────┐
│  │ [Results panel - populated after analysis]              │
│  │ nārāyaṇam | namas-kṛtya | naram | ca | eva | ...       │
│  └─────────────────────────────────────────────────────────┘
│  [Export JSON] [Export HTML] [Copy]                         │
└─────────────────────────────────────────────────────────────┘
```

### Sample Texts (Preloaded)

| Text | Source | Purpose |
|------|--------|---------|
| नारायणं नमस्कृत्य... | Mahābhārata 1.1.1 | Demo sandhi/NER |
| धर्मक्षेत्रे कुरुक्षेत्रे... | Gītā 1.1 | Demo place names |
| असतो मा सद्गमय... | Bṛhadāraṇyaka 1.3.28 | Demo philosophical terms |

---

## Implementation Phases

### Phase 21.1: Documentation (Immediate)

| File | Action |
|------|--------|
| `docs/SANSKRIT_AUTOMATON.md` | CREATE - Full integration docs |
| `docs/IMPLEMENTATION_STATUS.md` | UPDATE - Add Phase 21 section |
| `docs/SCALABILITY_ROADMAP.md` | UPDATE - Add external services |

### Phase 21.2: Edge Function (Day 1)

| File | Action |
|------|--------|
| `supabase/functions/sanskrit-analyze/index.ts` | CREATE |
| `supabase/config.toml` | UPDATE - Add function config |

### Phase 21.3: Fallback Mode (Day 1-2)

Implement Lovable AI fallback within edge function:
- Transliteration via Gemini
- AI-based sandhi suggestions
- Translation with evidence prompts
- Entity extraction

This allows testing before Python API is deployed.

### Phase 21.4: UI Components (Day 2-3)

| File | Action |
|------|--------|
| `src/components/sanskrit/SanskritInputPanel.tsx` | CREATE |
| `src/components/sanskrit/SanskritResultsPanel.tsx` | CREATE |
| `src/hooks/useSanskritAnalysis.ts` | CREATE |

### Phase 21.5: Landing Page Integration (Day 3)

| File | Action |
|------|--------|
| `src/pages/SanskritTranslator.tsx` | UPDATE - Add live demo |

### Phase 21.6: Python API Connection (After External Deploy)

| Requirement | Action |
|-------------|--------|
| `SANSKRIT_API_URL` secret | Add via Lovable Cloud |
| Edge function update | Switch from fallback to external API |
| Health check | Verify connectivity |

---

## Files Summary

### Create (5 files)

| File | Purpose |
|------|---------|
| `docs/SANSKRIT_AUTOMATON.md` | Integration documentation |
| `supabase/functions/sanskrit-analyze/index.ts` | Edge function proxy |
| `src/components/sanskrit/SanskritInputPanel.tsx` | Text input component |
| `src/components/sanskrit/SanskritResultsPanel.tsx` | Results display |
| `src/hooks/useSanskritAnalysis.ts` | API hook |

### Update (4 files)

| File | Change |
|------|--------|
| `docs/IMPLEMENTATION_STATUS.md` | Add Phase 21 tracking |
| `docs/SCALABILITY_ROADMAP.md` | Add external services section |
| `supabase/config.toml` | Add sanskrit-analyze function |
| `src/pages/SanskritTranslator.tsx` | Add interactive demo section |

---

## Secret Requirements

| Secret | When Needed | Default |
|--------|-------------|---------|
| `SANSKRIT_API_URL` | External API deployed | None (uses fallback) |
| `LOVABLE_API_KEY` | Already configured | Auto-provided |

---

## Fallback Behavior Matrix

| Scenario | SANSKRIT_API_URL | Behavior |
|----------|------------------|----------|
| External API available | Set + reachable | Full pipeline via Python |
| External API down | Set but unreachable | Lovable AI fallback |
| No external API | Not set | Lovable AI only mode |

### Lovable AI Capabilities (Fallback)

| Feature | Accuracy | Notes |
|---------|----------|-------|
| Transliteration | High | Gemini handles well |
| Sandhi splitting | Medium | AI-based, not rule-based |
| Morphology | Low | Cannot match sanskrit_parser |
| NER | Medium | Trained on Sanskrit texts |
| Translation | High | Good with evidence prompts |

---

## Testing Strategy

### Unit Tests

| Test | Description |
|------|-------------|
| Edge function CORS | Verify preflight handling |
| Input validation | Empty text, invalid modes |
| Fallback trigger | API unreachable scenario |
| Response normalization | Consistent format |

### Integration Tests

| Test | Description |
|------|-------------|
| Full pipeline | Text → Analysis → Display |
| Tab switching | Results panel navigation |
| Export functions | JSON/HTML download |
| Cultural terms linking | Entity → Terms DB |

### Manual Tests

| Test | URL |
|------|-----|
| Sample verse analysis | `/sanskrit-translator` |
| Mode switching | Full/Sandhi/Translate |
| Mobile responsiveness | 375px viewport |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Analysis latency | < 3s (fallback), < 5s (external) | Edge function logs |
| Error rate | < 1% | Function error tracking |
| User engagement | 100+ analyses/month | Analytics |
| Fallback usage | < 20% (after Python deploy) | Edge function logs |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Python API latency | Medium | User waits | 30s timeout, progress indicator |
| Sanskrit Heritage API down | Low | No morphology | Cache common responses |
| Lovable AI rate limits | Low | Degraded service | Error codes, retry logic |
| Mobile keyboard issues | Medium | Poor input UX | Virtual Devanagari keyboard |

---

## External Dependencies (User Action Required)

### Before Full Implementation

1. **Deploy Python API** - Extract ZIP, push to GitHub, deploy to Railway/Render
2. **Add `SANSKRIT_API_URL` secret** - After deployment, configure in Lovable Cloud
3. **Verify Sanskrit Heritage API access** - External dependency for morphology

### Can Proceed Immediately

- Documentation updates
- Edge function with fallback
- UI components
- Landing page integration
- Lovable AI-only mode testing

---

## Recommended Implementation Order

1. **Week 1: Documentation + Fallback Edge Function + UI**
   - Create all documentation
   - Build edge function with Lovable AI fallback
   - Create React components
   - Update landing page

2. **Week 2: Testing + Polish**
   - End-to-end testing with fallback mode
   - Mobile responsiveness
   - Error handling refinement

3. **Week 3+: External API Connection (When Ready)**
   - User deploys Python API
   - Add `SANSKRIT_API_URL` secret
   - Switch to full pipeline
   - Performance optimization
