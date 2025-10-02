# Cultural Terms System Architecture

**Version**: 1.0  
**Last Updated**: 2025-10-02  
**Status**: In Development (Phase 1 Complete)

---

## Overview

The Cultural Terms System provides comprehensive, multilingual contextual tooltips for Dharmic/Bharatiya cultural concepts throughout the Srangam project. When users encounter specialized terms like `{{cultural:jambudvipa}}` in articles, they receive interactive tooltips with translations, transliterations, etymologies, and cultural context in their preferred language.

---

## System Architecture

### 1. Database Structure

**Location**: `src/data/articles/cultural-terms/` (planned modular structure)

**Current Implementation** (Phase 1):
- `src/data/articles/cultural-terms.ts` - Main database
- `src/data/articles/cultural-terms-jambudvipa.ts` - Jambudvipa-specific terms
- `src/data/articles/enhanced-cultural-terms.ts` - Enhanced dharmic terms

**Planned Modular Structure** (Phase 4):
```
src/data/articles/cultural-terms/
├── index.ts                    # Main export & getCulturalContext()
├── vedic-puranic.ts           # Vedic/Puranic terms
├── geography-cosmology.ts     # Geographic/cosmological terms  
├── philosophy-religion.ts     # Philosophical concepts
├── social-political.ts        # Social structures & political terms
├── dynasties-rulers.ts        # Historical figures & dynasties
├── jambudvipa-specific.ts     # Jambudvipa article terms
└── cosmic-island-specific.ts  # Cosmic Island article terms
```

### 2. Term Structure

Each cultural term follows this TypeScript interface:

```typescript
interface CulturalTerm {
  term: string;
  translations: {
    [languageCode: string]: {
      translation: string;        // Native script translation
      transliteration?: string;   // IAST/ISO transliteration
      etymology?: string;          // Source language & meaning
      culturalContext?: string;    // 50-200 character context
    };
  };
}
```

**Example**:
```typescript
{
  term: "jambudvipa",
  translations: {
    en: {
      translation: "Rose Apple Island",
      transliteration: "Jambudvīpa",
      etymology: "Sanskrit: jambu (rose apple tree) + dvipa (island)",
      culturalContext: "Ancient Bharatiya cosmological term for the known inhabited world, centered on Mount Meru"
    },
    hi: {
      translation: "जम्बूद्वीप",
      transliteration: "Jambudvīpa",
      etymology: "संस्कृत: जम्बू (गुलाब सेब का पेड़) + द्वीप (द्वीप)",
      culturalContext: "प्राचीन भारतीय ब्रह्मांड विज्ञान में ज्ञात बसे हुए संसार का नाम"
    }
    // ... 7 more languages
  }
}
```

---

## Usage in Articles

### Syntax

Use the `{{cultural:term}}` marker in article content:

```typescript
export const article = {
  content: {
    en: `The concept of {{cultural:jambudvipa}} appears in the {{cultural:puranas}} 
         and {{cultural:mahabharata}}, describing the {{cultural:sapta-dvipa}} 
         (seven continents) surrounding {{cultural:meru}}.`
  }
};
```

### Rendering

The `ProfessionalTextFormatter` component automatically:
1. Detects `{{cultural:term}}` markers
2. Wraps them in `CulturalTermTooltip` components
3. Fetches context from database based on user language
4. Renders interactive tooltips on hover/click

### Case Handling

The system is **case-insensitive** and handles **hyphenation normalization**:

- `{{cultural:Jambudvipa}}` → matches `jambudvipa`
- `{{cultural:sapta-sindhu}}` → matches `saptasindhu`
- `{{cultural:BHARATVARSHA}}` → matches `bharatvarsha`

---

## Multilingual Support

### Supported Languages (9 total)

| Code | Language | Script | Status |
|------|----------|--------|--------|
| `en` | English | Latin | ✅ Complete |
| `hi` | Hindi | Devanagari | 🟡 In Progress |
| `ta` | Tamil | Tamil | 🟡 In Progress |
| `pa` | Punjabi | Gurmukhi | 🟡 In Progress |
| `te` | Telugu | Telugu | ⚪ Planned |
| `kn` | Kannada | Kannada | ⚪ Planned |
| `bn` | Bengali | Bengali | ⚪ Planned |
| `as` | Assamese | Assamese | ⚪ Planned |
| `pn` | Pnar | Latin | ⚪ Planned |

### Translation Priority

**Tier 1** (Days 5-6): Hindi, Tamil, Punjabi - Top 100 terms  
**Tier 2** (Week 2): Telugu, Kannada, Bengali - Top 50 terms  
**Tier 3** (Week 3): Assamese, Pnar - Top 30 terms

---

## Adding New Terms

### Step-by-Step Guide

1. **Identify the term** in article content
2. **Determine category** (Vedic, Geographic, Philosophical, etc.)
3. **Create database entry** in appropriate module file
4. **Add translations** (at minimum: English + Hindi)
5. **Run validation** to verify structure
6. **Test rendering** on sample article page
7. **Commit** with descriptive message

### Term Addition Checklist

- [ ] English translation complete
- [ ] IAST transliteration accurate
- [ ] Etymology verified from scholarly sources
- [ ] Cultural context written (50-200 chars)
- [ ] At least 2 language translations added
- [ ] Case normalization tested
- [ ] Validation script passes
- [ ] Tooltip renders correctly in browser
- [ ] Git commit with format: `feat: add cultural term [term-name]`

### Example Addition

```typescript
// In src/data/articles/cultural-terms/geography-cosmology.ts

export const geographyCosmologyTerms: Record<string, CulturalTerm> = {
  "sapta-sindhu": {
    term: "sapta-sindhu",
    translations: {
      en: {
        translation: "Seven Rivers",
        transliteration: "Sapta-Sindhu",
        etymology: "Sanskrit: sapta (seven) + sindhu (river)",
        culturalContext: "Ancient name for the land of seven rivers in northwestern South Asia, mentioned in the Rigveda"
      },
      hi: {
        translation: "सप्त-सिंधु",
        transliteration: "Sapta-Sindhu", 
        etymology: "संस्कृत: सप्त (सात) + सिंधु (नदी)",
        culturalContext: "ऋग्वेद में उल्लिखित उत्तर-पश्चिमी दक्षिण एशिया की सात नदियों की भूमि का प्राचीन नाम"
      }
    }
  }
};
```

---

## Validation & Testing

### Validation Script

**Location**: `scripts/validate_cultural_terms.mjs`

**Run validation**:
```bash
# Full validation with detailed output
node scripts/validate_cultural_terms.mjs

# Quick validation (minimal output)  
node scripts/validate_cultural_terms.mjs --quick
```

**What it checks**:
- All `{{cultural:term}}` markers have database entries
- Term structure is valid (TypeScript interface compliance)
- Coverage percentage per article
- Missing terms list with priority ranking
- Cross-article consistency

**Reports Generated**:
- `docs/CULTURAL_TERMS_COVERAGE.md` - Coverage report
- `docs/cultural-terms-audit.json` - JSON audit data

### Manual Testing

1. **Browser Testing**:
   - Navigate to article page (e.g., `/cosmic-island-sacred-land`)
   - Hover over highlighted cultural terms
   - Verify tooltip appears with correct content
   - Switch language and verify translation updates
   - Check console for errors

2. **Cross-Browser Testing**:
   - Chrome: Standard testing
   - Firefox: Case sensitivity edge cases
   - Safari: Hyphenation normalization
   - Mobile: Touch interactions

3. **Performance Testing**:
   - Database load time: <100ms
   - Tooltip render time: <50ms
   - Page load impact: No degradation
   - Memory usage: <2MB increase

---

## Integration Points

### Components

1. **`CulturalTermTooltip.tsx`**  
   Core tooltip component that fetches and displays cultural context

2. **`ProfessionalTextFormatter.tsx`**  
   Parses article content and wraps cultural terms in tooltips

3. **`EnhancedMultilingualText.tsx`**  
   Handles multilingual content with cultural term enhancement

### Hooks

1. **`useLanguagePreferences()`**  
   Gets current user language for context fetching

### Utilities

1. **`getCulturalContext(term, language)`**  
   Fetches cultural term data from database with normalization

2. **`normalizeTerm(term)`**  
   Normalizes term for matching (lowercase, hyphenation)

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Database loaded on-demand per article
2. **Memoization**: Tooltip content cached after first fetch
3. **Tree Shaking**: Only used terms loaded (future optimization)
4. **Code Splitting**: Cultural terms database in separate chunk

### Monitoring

Track these metrics:
- Database bundle size (current: ~500KB uncompressed)
- First tooltip render time
- Cache hit rate
- User interaction frequency

---

## Troubleshooting

### Common Issues

**Issue**: `[object Object]` appears instead of tooltip  
**Cause**: Term not found in database  
**Fix**: Add term to appropriate database module and run validation

**Issue**: Tooltip shows wrong translation  
**Cause**: Language code mismatch or missing translation  
**Fix**: Verify language code normalization in `languageUtils.ts`

**Issue**: Hyphenated term not matching  
**Cause**: Database has different hyphenation format  
**Fix**: Normalization handles this automatically, but verify term exists

**Issue**: Case-sensitive matching fails  
**Cause**: Database lookup not using normalized comparison  
**Fix**: Ensure `getCulturalContext()` uses `normalizeTerm()`

### Debug Mode

Enable debug logging:
```typescript
// In CulturalTermTooltip.tsx
const DEBUG = true;

if (DEBUG) {
  console.log('[Cultural Term]', { term, language, context });
}
```

---

## Maintenance

### Regular Tasks

1. **Monthly Audit** (Automated)
   - Run `scripts/monthly_audit.mjs`
   - Review coverage report
   - Identify unused terms (6+ months)
   - Update documentation

2. **Quarterly Review** (Manual)
   - Scholarly accuracy verification
   - Translation quality check
   - User feedback integration
   - Performance optimization

3. **Annual Update** (Manual)
   - Major version bump
   - Database restructuring if needed
   - New language additions
   - Feature enhancements

### Contributing Guidelines

See `CONTRIBUTING.md` for:
- Code style guide
- Commit message format
- Pull request process
- Review criteria

---

## Roadmap

### Phase 1: Foundation & Audit ✅ (Day 1)
- [x] Create validation script
- [x] Run site-wide audit
- [x] Establish baseline metrics

### Phase 2: Database Population 🚧 (Days 2-4)
- [ ] Add Priority 1 terms (~50 high-frequency)
- [ ] Add Priority 2 terms (~80 medium-frequency)
- [ ] Add Priority 3 terms (~120 low-frequency)
- [ ] Achieve ≥95% coverage on cosmic-island article

### Phase 3: Multilingual Enhancement ⏳ (Days 5-6)
- [ ] Complete Hindi translations (Tier 1)
- [ ] Complete Tamil translations (Tier 1)
- [ ] Complete Punjabi translations (Tier 1)
- [ ] QA validation for all Tier 1 languages

### Phase 4: Documentation ⏳ (Day 7)
- [ ] Complete system architecture docs
- [ ] Complete database reference docs
- [ ] Auto-generate coverage reports
- [ ] Update project README

### Phase 5: Integration & Testing ⏳ (Day 8)
- [ ] Comprehensive frontend testing
- [ ] Performance benchmarking
- [ ] Cross-article consistency validation
- [ ] User acceptance testing

### Phase 6: Automation ⏳ (Day 9)
- [ ] CI/CD pipeline integration
- [ ] Pre-commit hooks
- [ ] Monthly audit automation
- [ ] Alert system for coverage drops

### Phase 7: Final Validation ⏳ (Day 10)
- [ ] All checklist items pass
- [ ] Coverage targets met (≥95%)
- [ ] Zero console errors
- [ ] Performance within thresholds
- [ ] Documentation complete

---

## References

### Scholarly Sources

- Rigveda (Devanagari & IAST editions)
- Mahabharata (Critical Edition, BORI)
- Vishnu Purana (Wilson translation)
- Markandeya Purana
- Sanskrit-English dictionaries (Monier-Williams, Apte)

### Technical Documentation

- [i18next Documentation](https://www.i18next.com/)
- [React i18n Best Practices](https://react.i18next.com/)
- [Unicode CLDR](https://cldr.unicode.org/)
- [IAST Transliteration Standard](https://en.wikipedia.org/wiki/International_Alphabet_of_Sanskrit_Transliteration)

---

## Contact & Support

For questions or contributions related to the Cultural Terms System:

- **GitHub Issues**: Tag with `cultural-terms` label
- **Documentation Updates**: Submit PR to `docs/` directory
- **Translation Contributions**: Contact project maintainers
- **Scholarly Corrections**: Provide academic references

---

*Last generated by validation script: [timestamp]*  
*System version: 1.0*  
*Total terms in database: [auto-populated]*
