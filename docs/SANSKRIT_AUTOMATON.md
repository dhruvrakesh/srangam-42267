# Sanskrit Automaton Integration

**Last Updated**: 2026-02-01 (Phase 21)

---

## Overview

The Sanskrit Automaton is a Python-based NLP pipeline for analyzing classical Sanskrit texts. This document describes its integration with the Srangam platform.

---

## Pipeline Stages

| Stage | Script | Purpose | Dependencies |
|-------|--------|---------|--------------|
| 1. Normalize | `normalize_text.py` | Unicode normalization, script detection | `indic-transliteration` |
| 2. Sandhi Split | `sandhi_split.py` | Word boundary identification | `sanskrit_parser` |
| 3. Morphology | `morph_parse.py` | Root, case, number, gender | Sanskrit Heritage API |
| 4. NER | `ner_tag.py` | Entity extraction (deities, places, texts) | Trained model |
| 5. Translate | `translate_mt.py` | Evidence-based translation | Lovable AI / IndicTrans2 |

---

## Repository Structure

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
└── api.py                   # FastAPI server (for Srangam)
```

---

## API Contract

### POST /analyze

**Request:**
```json
{
  "text": "नारायणं नमस्कृत्य नरं चैव नरोत्तमम्",
  "mode": "full",
  "options": {
    "transliteration": "iast",
    "includeEvidence": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "mode": "full",
  "source": "python-api",
  "data": {
    "original": "नारायणं नमस्कृत्य नरं चैव नरोत्तमम्",
    "transliterated": "nārāyaṇaṃ namaskṛtya naraṃ caiva narottamam",
    "sandhiSplit": ["nārāyaṇam", "namas-kṛtya", "naram", "ca", "eva", "nara-uttamam"],
    "morphology": [
      {"word": "nārāyaṇam", "root": "nārāyaṇa", "case": "accusative", "number": "singular", "gender": "masculine"}
    ],
    "entities": [
      {"text": "nārāyaṇa", "type": "DEITY", "normalized": "Nārāyaṇa (Viṣṇu)"}
    ],
    "translation": {
      "text": "Having saluted Nārāyaṇa, and Nara, the best of men...",
      "evidence": ["Mahābhārata 1.1.1 invocation"],
      "confidence": 0.95
    }
  }
}
```

### Analysis Modes

| Mode | Pipeline Steps | Use Case |
|------|----------------|----------|
| `full` | All 5 stages | Complete analysis |
| `split` | Normalize + Sandhi | Quick word boundaries |
| `morph` | + Morphology | Grammatical analysis |
| `ner` | + Entity extraction | Named entity focus |
| `translate` | All stages | Translation with evidence |

---

## Deployment Options

### Railway

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn api:app --host 0.0.0.0 --port $PORT"
  }
}
```

### Render

```yaml
services:
  - type: web
    name: sanskrit-automaton
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn api:app --host 0.0.0.0 --port $PORT
```

### Fly.io

```toml
[build]
  builder = "paketobuildpacks/builder:base"

[processes]
  app = "uvicorn api:app --host 0.0.0.0 --port 8080"
```

---

## Srangam Integration Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  React Frontend (Srangam)                                   │
│  ├── SanskritInputPanel (Devanagari input, mode select)    │
│  └── SanskritResultsPanel (tabbed results, export)         │
└────────────────────────────┬────────────────────────────────┘
                             │ POST /sanskrit-analyze
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Edge Function (sanskrit-analyze)                           │
│  ├── Admin-only access check                                │
│  ├── Route to external API or Lovable AI fallback           │
│  └── Response normalization                                 │
└────────────────────────────┬────────────────────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────────┐
│  Python API         │              │  Lovable AI Fallback    │
│  (Railway/Render)   │              │  (Gemini-based)         │
│  Full pipeline      │              │  Approximate analysis   │
└─────────────────────┘              └─────────────────────────┘
```

---

## Fallback Strategy

When `SANSKRIT_API_URL` is not configured or unreachable:

| Feature | Fallback Approach | Accuracy |
|---------|-------------------|----------|
| Transliteration | Gemini prompt | High |
| Sandhi splitting | AI-suggested boundaries | Medium |
| Morphology | Not available | N/A |
| NER | Structured output prompt | Medium |
| Translation | Evidence-based prompt | High |

---

## Error Codes

| Code | Type | Description |
|------|------|-------------|
| `SANSKRIT-E001` | Validation | Empty text input |
| `SANSKRIT-E002` | Validation | Invalid analysis mode |
| `SANSKRIT-E003` | Network | External API unreachable |
| `SANSKRIT-E004` | Timeout | Analysis exceeded 30s |
| `SANSKRIT-E005` | Fallback | Using Lovable AI (reduced accuracy) |
| `SANSKRIT-E006` | Auth | Admin access required |

---

## External Dependencies

| Service | Purpose | URL |
|---------|---------|-----|
| Sanskrit Heritage | Morphological analysis | inria.fr |
| IndicTrans2 | Machine translation | Hugging Face |
| Lovable AI | Fallback analysis | ai.gateway.lovable.dev |

---

## Security

- **Admin-only access**: Edge function checks `user_roles` table
- **Rate limiting**: Handled by Lovable AI gateway
- **No user data storage**: Analysis results not persisted

---

## See Also

- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Phase tracking
- [SCALABILITY_ROADMAP.md](./SCALABILITY_ROADMAP.md) - Performance planning
