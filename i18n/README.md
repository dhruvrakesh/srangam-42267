# Sraṅgam Multilingual i18n System

Complete multilingual publishing pipeline for Sraṅgam articles with protected terminology, coverage tracking, and quality gates.

## 🎯 Overview

This system provides:

- **Segmented content** with stable, human-readable keys
- **Protected glossary** for cultural/historical terms
- **Coverage tracking** (99% threshold for "Available" status)
- **Translation memory** for reusable strings
- **Quality gates** preventing incomplete translations from showing as available
- **SEO optimization** with hreflang tags and localized metadata
- **Visual status HUD** showing translation progress

## 📁 Directory Structure

```
i18n/
├── glossary/
│   └── protected.json          # Terms that should not be translated
├── articles/
│   └── jambudvipa-connected/
│       ├── README.md
│       ├── en.json            # English baseline (100%)
│       ├── ta.json            # Tamil translation
│       ├── te.json            # Telugu translation
│       ├── kn.json            # Kannada translation
│       ├── bn.json            # Bengali translation
│       ├── as.json            # Assamese translation
│       ├── pn.json            # Pnar translation
│       ├── hi.json            # Hindi translation
│       └── pa.json            # Punjabi translation
└── README.md                  # This file

content/
└── articles/
    └── jambudvipa-connected/
        ├── README.md
        └── en.md              # Source Markdown (with YAML front-matter)
```

## 🔑 Key Concepts

### Stable Keys

Content is segmented into stable, human-readable keys:

```typescript
{
  "meta.title": "Article Title",
  "meta.dek": "Article description",
  "section.abstract.heading": "Abstract",
  "section.abstract.p1": "First paragraph...",
  "section.abstract.p2": "Second paragraph...",
  "tag.0": "First tag",
  "figure.keezhadi.caption": "Image caption"
}
```

### Protected Glossary

Cultural, historical, and proper nouns that should **never be translated**:

```json
{
  "term_lock": [
    "Keezhadi",
    "Mahabharata",
    "Jambudvipa",
    ...
  ],
  "rules": {
    "default": "Keep original; allow transliteration",
    "ta": "Prefer Tamil transliteration; retain original on first mention"
  }
}
```

### Coverage Gating

- **Available**: Coverage ≥ 99%
- **In Progress**: Coverage 70-98%
- **Incomplete**: Coverage < 70%

Only "Available" languages are selectable in the language switcher.

## 🛠️ Usage

### For Developers

#### 1. Create Translation Files

Each article needs translation files in `i18n/articles/{slug}/{lang}.json`:

```json
{
  "meta": {
    "slug": "article-slug",
    "lang": "ta",
    "percent": 100
  },
  "strings": {
    "meta.title": "தலைப்பு",
    "meta.dek": "விளக்கம்",
    ...
  }
}
```

#### 2. Update Coverage Data

After adding translations, update `src/lib/i18n/coverageData.ts`:

```typescript
export const articleCoverage: CoverageMap = {
  'article-slug': {
    en: { slug: 'article-slug', lang: 'en', percent: 100, ... },
    ta: { slug: 'article-slug', lang: 'ta', percent: 100, ... },
    ...
  }
};
```

#### 3. Add Components to Article Page

```tsx
import { ArticleHead } from '@/components/i18n/ArticleHead';
import { TranslationStatusHUD } from '@/components/i18n/TranslationStatusHUD';
import { GatedLanguageSwitcher } from '@/components/i18n/GatedLanguageSwitcher';
import { useArticleCoverage } from '@/hooks/useArticleCoverage';

const ArticlePage = () => {
  const { coverageMap, currentCoverage } = useArticleCoverage('article-slug');
  
  return (
    <>
      <ArticleHead articleSlug="article-slug" ... />
      {currentCoverage && <TranslationStatusHUD coverage={currentCoverage} />}
      <GatedLanguageSwitcher articleSlug="article-slug" coverageMap={coverageMap} />
      {/* Article content */}
    </>
  );
};
```

#### 4. Run Quality Audit

```bash
node scripts/i18n_audit.mjs
```

This will:
- Check keyset consistency across all languages
- Validate coverage percentages
- Identify missing/extra keys
- Generate coverage table
- Fail build if any language marked "Available" has <99% coverage

### For Translators

1. **Never translate protected terms** - Check `i18n/glossary/protected.json` first
2. **Maintain key structure** - Don't add or remove keys
3. **Preserve formatting** - Keep markdown syntax intact
4. **Test coverage** - Run audit script to verify 99%+ coverage
5. **Cultural sensitivity** - Follow language-specific rules for transliteration

## 📊 Components

### TranslationStatusHUD

On-page status indicator showing:
- Translation progress bar
- Coverage percentage
- Missing keys (if any)
- "Report issue" button

### GatedLanguageSwitcher

Language selector that:
- Only enables languages with ≥99% coverage
- Shows "Available" or "In progress (XX%)" badges
- Applies script-appropriate fonts
- Displays native language names

### ArticleHead

SEO-optimized head component with:
- Localized title/description
- `hreflang` alternate links for all available languages
- Open Graph multilingual tags
- Structured data (JSON-LD) with language info
- Canonical URLs

## 🔍 SEO Features

Every available language gets:

```html
<link rel="alternate" hreflang="ta" href="/ta/article-slug" />
<meta property="og:locale:alternate" content="ta" />
```

Structured data includes language availability:

```json
{
  "availableLanguage": [
    { "@type": "Language", "name": "Tamil", "alternateName": "ta" }
  ]
}
```

## 🎨 Typography

Script-appropriate fonts are automatically applied:

- Tamil: `font-tamil`
- Telugu: `font-telugu`
- Kannada: `font-kannada`
- Bengali: `font-bengali`
- Assamese: `font-assamese`
- Hindi: `font-hindi` (Devanagari)
- Punjabi: `font-punjabi` (Gurmukhi)
- English/Pnar: `font-sans`

Line-height, hyphenation, and numeral rendering follow locale-specific best practices.

## ✅ Acceptance Criteria

- [ ] Switching to any available language renders 100% localized content
- [ ] Languages <99% coverage show "In progress" and are disabled
- [ ] Protected terms appear unchanged or properly transliterated
- [ ] HUD accurately reflects coverage status
- [ ] SEO tags include all available languages
- [ ] Search works in current language
- [ ] Pre-publish audit passes

## 🚀 Future Enhancements

1. **Translation Memory** - Reuse common strings across articles
2. **Author Override** - Lock specific strings to English per language
3. **Typography Presets** - Per-language spacing/kerning profiles
4. **Automatic Segmentation** - Parse Markdown to JSON automatically
5. **Web Translation Interface** - GUI for translators
6. **AI-Assisted Translation** - With protected term validation

## 📖 Reference

- **Supported Languages**: en, ta, te, kn, bn, as, pn (Pnar), hi, pa
- **Coverage Threshold**: 99%
- **Protected Terms**: 65+ cultural/historical terms
- **Key Format**: `{section}.{subsection}.{element}{index}`

---

For questions or issues, see: `/i18n/articles/{article-slug}/README.md`
