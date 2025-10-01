# Jambudvipa Connected - Translations

This directory contains translation data for the "Jambudvipa Connected" article.

## Files

- `en.json` - English baseline (100% coverage)
- `ta.json` - Tamil translation
- `te.json` - Telugu translation
- `kn.json` - Kannada translation
- `bn.json` - Bengali translation
- `as.json` - Assamese translation
- `pn.json` - Pnar translation
- `hi.json` - Hindi translation
- `pa.json` - Punjabi translation

## Schema

Each JSON file follows this structure:

```json
{
  "meta": {
    "slug": "jambudvipa-connected",
    "lang": "XX",
    "percent": 100
  },
  "strings": {
    "meta.title": "...",
    "meta.dek": "...",
    "section.abstract.heading": "...",
    "section.abstract.p1": "...",
    ...
  }
}
```

## Coverage Requirements

- A language is marked "Available" only when coverage ≥ 99%
- Languages below 99% show "In progress (XX%)"
- Missing keys automatically fall back to English

## Protected Terms

Terms from `/i18n/glossary/protected.json` are preserved during translation.
