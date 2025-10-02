# Cultural Terms Database - Complete Reference

**Last Updated**: October 2, 2025  
**Total Terms**: ~250 (Current) | ~1000 (Target)  
**Database Version**: 1.0

---

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Term Inventory](#term-inventory)
3. [Module Breakdown](#module-breakdown)
4. [Term Addition Workflow](#term-addition-workflow)
5. [Translation Standards](#translation-standards)
6. [Quality Assurance](#quality-assurance)
7. [Scholarly Sources](#scholarly-sources)

---

## Database Architecture

### Current Structure (Fragmented - Technical Debt)

⚠️ **Status**: Database currently split across 3 files with inconsistent formats

```
src/data/articles/
├── cultural-terms.ts                    # Main database (Record format)
│   └── ~150 core terms
│       - Vedic & Puranic: agni, rigveda, vedic, mahabharata
│       - Geographic: bharatvarsha, himavan, sapta-sindhu
│       - Philosophical: dharma, karma, moksha, arya
│       - Recently merged enhanced-cultural-terms.ts content
│
├── cultural-terms-jambudvipa.ts         # Jambudvipa-specific (Array format)
│   └── ~500 terms (2275 lines)
│       - Comprehensive coverage for Jambudvipa article
│       - Legacy array-based structure
│       - Needs migration to Record format
│
└── enhanced-cultural-terms.ts           # Dharmic core (Record format)
    └── ~40 terms (144 lines)
        - High-quality 9-language translations
        - Recently merged into cultural-terms.ts
```

### Target Modular Structure (Planned Refactor)

```
src/data/articles/cultural-terms/
├── index.ts                           # Main export & getCulturalContext()
│   └── Re-exports all modules
│   └── Provides unified getCulturalContext(term, lang) function
│
├── vedic-puranic.ts                   # Vedic & Puranic Literature
│   └── ~120 terms
│       - Vedic texts: rigveda, yajurveda, samaveda, atharvaveda
│       - Vedangas: brahmanas, aranyakas, upanishads
│       - Puranas: vishnu-purana, vayu-purana, markandeya-purana
│       - Epics: mahabharata, ramayana, itihasa
│       - Deities: agni, indra, varuna, soma
│
├── geography-cosmology.ts             # Geographic & Cosmological Terms
│   └── ~150 terms
│       - Cosmic geography: jambudwipa, sapta-dvipa, mount-meru, bhumandala
│       - Terrestrial: bharatvarsha, aryavarta, dakshinapatha
│       - Mountains: himavan, vindhya, malaya, sahya, mahendra
│       - Rivers: sarasvati, ganga, yamuna, sindhu, narmada
│       - Regions: sapta-sindhu, madhyadesha, janapadas
│       - Divisions: varshas, kulaparvatas, dvipas
│
├── philosophy-religion.ts             # Philosophical & Religious Concepts
│   └── ~80 terms
│       - Core concepts: dharma, karma, moksha, samsara
│       - Metaphysics: atman, brahman, maya, loka
│       - Ethics: arya, anarya, dharmic, adharmic
│       - Cosmology: svarga, naraka, yuga, kalpa
│       - Practices: yajna, tapas, dana, diksha
│
├── social-political.ts                # Social Structure & Political Terms
│   └── ~60 terms
│       - Varna system: brahmin, kshatriya, vaishya, shudra
│       - Social categories: varnas, jatis, dasyu, mleccha
│       - Political units: janapadas, mahajanapadas, rashtra
│       - Rulership: raja, maharaja, samrat, chakravartin
│       - Concepts: digvijaya, rajya, mandala
│
├── dynasties-rulers.ts                # Historical Dynasties & Figures
│   └── ~50 terms
│       - Legendary rulers: bharata, dushyanta, sudas, sagara
│       - Dynasties: chandravamsha, suryavamsha, ikshvaku
│       - Tribes: bharatas, purus, yadavas, kurus
│       - Historical: maurya, gupta, pallava, chola
│       - Events: dasarajna, kurukshetra, mahabharata-war
│
├── jambudvipa-specific.ts             # Jambudvipa Article Terms
│   └── ~500 terms (migrated from jambudvipa.ts)
│       - Article-specific geographic details
│       - Puranic cosmographic minutiae
│       - Specialized terminology for Jambudvipa article
│
├── cosmic-island-specific.ts          # Cosmic Island Article Terms
│   └── ~130 terms (to be populated)
│       - Terms unique to "From Cosmic Island to Sacred Land" article
│       - Currently 25% coverage gap (~128 missing terms)
│       - Priority: High-frequency terms first
│
└── types.ts                           # TypeScript interfaces
    └── CulturalTerm, TranslationEntry, SupportedLanguage
```

---

## Term Inventory

### Current Coverage Statistics

**By Database File**:
| File | Terms | Format | Quality | Completeness |
|------|-------|--------|---------|--------------|
| `cultural-terms.ts` | ~150 | Record | ⭐⭐⭐⭐ | 80% (en), 40% (hi) |
| `cultural-terms-jambudvipa.ts` | ~500 | Array | ⭐⭐⭐ | 90% (en), 30% (hi) |
| `enhanced-cultural-terms.ts` | ~40 | Record | ⭐⭐⭐⭐⭐ | 100% (en), 80% (hi/ta) |

**By Category**:
| Category | Current Terms | Target Terms | Priority |
|----------|--------------|--------------|----------|
| Vedic & Puranic | 45 | 120 | High |
| Geography & Cosmology | 80 | 150 | High |
| Philosophy & Religion | 30 | 80 | Medium |
| Social & Political | 20 | 60 | Medium |
| Dynasties & Rulers | 15 | 50 | Low |
| Jambudvipa-specific | 500 | 500 | Complete ✅ |
| Cosmic Island-specific | 10 | 130 | **Critical** 🔴 |

### By Article Coverage

| Article | Total Markers | Coverage % | Missing Terms |
|---------|---------------|------------|---------------|
| `jambudvipa-connected` | 500 | 95% ✅ | 25 |
| `cosmic-island-sacred-land` | 518 | **75%** ⚠️ | **128** |
| `maritime-memories-south-india` | ~80 | 85% 🟡 | ~12 |
| `scripts-that-sailed` | 0 | N/A | N/A |
| `riders-on-monsoon` | 0 | N/A | N/A |
| `indian-ocean-power-networks` | 0 | N/A | N/A |
| `ashoka-kandahar-edicts` | 0 | N/A | N/A |
| `kutai-yupa-borneo` | 0 | N/A | N/A |
| `chola-naval-raid` | ~40 | 80% 🟡 | ~8 |
| `pepper-and-bullion` | 0 | N/A | N/A |
| `earth-sea-sangam` | 0 | N/A | N/A |
| `gondwana-to-himalaya` | ~30 | 70% 🟠 | ~9 |
| `monsoon-trade-clock` | 0 | N/A | N/A |

**Site-Wide Aggregate**:
- **Total Unique Terms**: ~250 (current) → ~1000 (target)
- **Average Coverage**: 85% → 95% (target)
- **Critical Gap**: `cosmic-island-sacred-land` needs 128 terms

---

## Module Breakdown

### 1. Vedic & Puranic Literature (`vedic-puranic.ts`)

**Target**: 120 terms  
**Current**: 45 terms  
**Gap**: 75 terms

**High-Priority Terms (Frequency >10)**:
```
agni ✅, rigveda ✅, vedic ✅, puranic ✅, puranas ✅
mahabharata ✅, vishnu-purana ✅, veda 🔴, yajurveda 🔴
brahmanas 🔴, upanishads 🔴, itihasa ✅, ramayana 🔴
indra 🔴, varuna 🔴, soma 🔴, samaveda 🔴
```

**Medium-Priority Terms (Frequency 5-10)**:
```
atharvaveda, markandeya-purana, vayu-purana, brahmanda-purana
shatapatha-brahmana, aranyakas, sutras, shrauta-sutras
rigvedic, yajurvedic, vedangas, shakhas
```

**Example Entry**:
```typescript
rigveda: {
  term: "rigveda",
  translations: {
    en: {
      translation: "Rigveda",
      transliteration: "Ṛgveda",
      etymology: "Sanskrit: ṛc (praise/verse) + veda (knowledge)",
      culturalContext: "Oldest Vedic text (c. 1500-1200 BCE), collection of 1,028 hymns to Vedic deities. Primary source for early Indo-Aryan religion and society."
    },
    hi: {
      translation: "ऋग्वेद",
      transliteration: "Ṛgveda",
      etymology: "संस्कृत: ऋच् + वेद",
      culturalContext: "सबसे प्राचीन वैदिक ग्रंथ (लगभग 1500-1200 ईसा पूर्व), वैदिक देवताओं की 1,028 स्तुतियों का संग्रह।"
    }
  }
}
```

---

### 2. Geography & Cosmology (`geography-cosmology.ts`)

**Target**: 150 terms  
**Current**: 80 terms  
**Gap**: 70 terms

**High-Priority Terms**:
```
bharatvarsha ✅, jambudwipa ✅, sapta-sindhu ✅, himavan ✅
mount-meru ✅, meru ✅, varshas ✅, dvipas ✅
sapta-dvipa 🔴, bhumandala 🔴, ilavrita 🔴, kulaparvatas 🔴
aryavarta 🔴, madhyadesha 🔴, dakshinapatha 🔴
```

**Rivers (High Priority)**:
```
sarasvati ✅, ganga 🔴, yamuna 🔴, sindhu ✅
narmada 🔴, godavari 🔴, krishna 🔴, kaveri 🔴
sutlej 🔴, jhelum 🔴, ravi 🔴, tamraparni 🔴
```

**Mountains**:
```
himalayas ✅, vindhya 🔴, malaya 🔴, sahya 🔴
mahendra 🔴, udayagiri 🔴, riksha 🔴, pariyatra 🔴
```

**Example Entry**:
```typescript
bharatvarsha: {
  term: "bharatvarsha",
  translations: {
    en: {
      translation: "Bharatavarsha",
      transliteration: "Bhāratavarṣa",
      etymology: "Sanskrit: bhārata (belonging to Bharata) + varṣa (realm/division)",
      culturalContext: "Ancient name for Indian subcontinent, derived from legendary King Bharata. One of nine varshas of Jambudwipa (Vishnu Purana 2.3)."
    },
    hi: {
      translation: "भारतवर्ष",
      transliteration: "Bhāratavarṣa",
      etymology: "संस्कृत: भारत + वर्ष",
      culturalContext: "भारतीय उपमहाद्वीप का प्राचीन नाम, महाराज भरत से व्युत्पन्न। जम्बूद्वीप के नौ वर्षों में से एक (विष्णु पुराण 2.3)।"
    }
  }
}
```

---

### 3. Philosophy & Religion (`philosophy-religion.ts`)

**Target**: 80 terms  
**Current**: 30 terms  
**Gap**: 50 terms

**Core Concepts (High Priority)**:
```
dharma ✅, karma 🔴, moksha 🔴, samsara 🔴
atman 🔴, brahman 🔴, maya 🔴, dharmic ✅
arya ✅, anarya 🔴, yajna 🔴, tapas 🔴
```

**Metaphysical Terms**:
```
loka 🔴, svarga 🔴, naraka 🔴, triloka 🔴
yuga 🔴, kalpa 🔴, pralaya 🔴, srishti 🔴
```

**Example Entry**:
```typescript
dharma: {
  term: "dharma",
  translations: {
    en: {
      translation: "Dharma",
      transliteration: "Dharma",
      etymology: "Sanskrit: dhṛ (to hold/sustain) + -ma (abstract noun suffix)",
      culturalContext: "Cosmic law, duty, righteousness. Central concept in Hindu, Buddhist, Jain thought. Vedic rita evolved into dharma in Upanishadic period."
    },
    hi: {
      translation: "धर्म",
      transliteration: "Dharma",
      etymology: "संस्कृत: धृ (धारण करना) + म",
      culturalContext: "ब्रह्माण्डीय नियम, कर्तव्य, नैतिकता। हिंदू, बौद्ध, जैन विचार में केंद्रीय अवधारणा।"
    }
  }
}
```

---

### 4. Social & Political (`social-political.ts`)

**Target**: 60 terms  
**Current**: 20 terms  
**Gap**: 40 terms

**Varna System**:
```
brahmin 🔴, kshatriya 🔴, vaishya 🔴, shudra 🔴
varnas 🔴, jatis 🔴, dasyu 🔴, mleccha 🔴
```

**Political Units**:
```
janapadas ✅, mahajanapadas 🔴, rashtra 🔴, mandala 🔴
raja 🔴, maharaja 🔴, samrat 🔴, chakravartin 🔴
```

---

### 5. Dynasties & Rulers (`dynasties-rulers.ts`)

**Target**: 50 terms  
**Current**: 15 terms  
**Gap**: 35 terms

**Legendary Figures**:
```
bharata 🔴, dushyanta 🔴, sudas 🔴, sagara 🔴
manu 🔴, ikshvaku 🔴, yayati 🔴, puru 🔴
```

**Dynasties & Tribes**:
```
chandravamsha 🔴, suryavamsha 🔴, bharatas ✅
purus 🔴, yadavas 🔴, kurus 🔴, panchalas 🔴
```

---

### 6. Jambudvipa-Specific (`jambudvipa-specific.ts`)

**Status**: ✅ **Complete** (500 terms, 95% coverage)

**Contents**:
- Detailed cosmographic terms from Puranas
- Specialized terminology for Jambudvipa article
- Comprehensive mountain, river, region names
- Dvipa-specific varshas and their characteristics

**Migration Note**: Currently in `cultural-terms-jambudvipa.ts` (Array format) → Will migrate to modular Record format

---

### 7. Cosmic Island-Specific (`cosmic-island-specific.ts`)

**Status**: 🔴 **CRITICAL GAP** (10 terms, 75% coverage, needs 128 terms)

**Required Terms** (From validation audit):

**Priority 1 (Frequency >10)** - 50 terms:
```
agni, rigveda, puranas, vedic, puranic, mahabharata
bharata (king), dushyanta, sudas, brahmanas
brahma, vishnu, indra, siddhas, bharata (tribe)
sarasvati (river), ganga, yamuna, brahmin, kshatriya
meru, himavan, bhumandala, ilavrita, varshas
karma, moksha, svarga, arya, aryavarta
cholas, kambojas, pandyas, keralas, yavanas
```

**Priority 2 (Frequency 5-10)** - 40 terms:
```
vishnu-purana, markandeya-purana, vayu-purana, brahmanda-puraba
videgha-mathava, videha, kuru, panchala
sindhu, sutlej, jhelum, ravi, narmada, godavari
vindhya, malaya, sahya, mahendra, riksha
chandravamsha, ikshvaku, dasarajna, digvijaya
atman, brahman, loka, yuga, yajna
```

**Priority 3 (Frequency <5)** - 38 terms:
```
[Article-specific terms from validation report]
```

---

## Term Addition Workflow

### 1. Pre-Addition Research

**Required Information**:
- ✅ **Primary Source Citation**: Exact reference (e.g., "Rigveda 10.75.5", "Vishnu Purana 2.3.1")
- ✅ **English Definition**: Clear, scholarly (not Wikipedia)
- ✅ **IAST Transliteration**: Accurate diacritics
- ✅ **Etymology**: Source language + component breakdown
- ✅ **Cultural Context**: 50-200 characters, historically grounded

**Recommended Sources**:

**Dictionaries**:
- Monier-Williams Sanskrit-English Dictionary (1899)
- Apte Sanskrit-English Dictionary (1957-59)
- Vedic Index (Macdonell & Keith, 1912)

**Primary Texts**:
- Rigveda: Sontakke & Kashikar edition (1933-51)
- Mahabharata: BORI Critical Edition (1933-66)
- Puranas: Gita Press editions (various)
- Upanishads: Radhakrishnan translation (1953)

**Scholarly Works**:
- Witzel, M. "The Development of the Vedic Canon" (1997)
- Thapar, R. "Early India: From the Origins to AD 1300" (2002)
- Kulke & Rothermund "A History of India" (2004)

### 2. Database Entry Template

```typescript
"term-name": {
  term: "term-name",                    // Normalized (lowercase, no hyphens)
  translations: {
    en: {
      translation: "English Translation",
      transliteration: "IAST Transliteration with diacritics",
      etymology: "Source Language: component1 + component2",
      culturalContext: "Scholarly context 50-200 chars with primary source (Text X.Y.Z)"
    },
    hi: {                               // Hindi (Tier 1 priority)
      translation: "हिंदी अनुवाद",
      transliteration: "IAST (same as English)",
      etymology: "व्युत्पत्ति विवरण",
      culturalContext: "सांस्कृतिक संदर्भ"
    },
    ta: {                               // Tamil (Tier 1 priority)
      translation: "தமிழ் மொழிபெயர்ப்பு",
      transliteration: "ISO 15919 for Tamil",
      etymology: "சொற்பிறப்பியல்",
      culturalContext: "கலாச்சார சூழல்"
    },
    // Add remaining 6 languages as resources permit
  }
}
```

### 3. Quality Checklist

**Before Committing**:
- [ ] Term normalized (lowercase, no hyphens, underscores)
- [ ] English entry complete (all 4 fields: translation, transliteration, etymology, context)
- [ ] IAST/ISO transliteration verified (check diacritics)
- [ ] Etymology cites source language
- [ ] Cultural context 50-200 characters (not too brief/verbose)
- [ ] Primary source cited in context (e.g., "Vishnu Purana 2.3")
- [ ] At least Hindi translation added (Tier 1 priority)
- [ ] No duplicate entries in database (grep check)
- [ ] TypeScript compiles without errors
- [ ] Validation script passes

### 4. Validation Steps

**Automated**:
```bash
# Run validation script
node scripts/validate_cultural_terms.mjs

# Check for structure errors
# - Missing required fields
# - Invalid character encoding
# - Duplicate entries

# Verify coverage increase
# Before: cosmic-island-sacred-land: 75% (390/518)
# After:  cosmic-island-sacred-land: 76% (394/518) ✅
```

**Manual**:
```bash
# Check for duplicates
grep -r "term-name" src/data/articles/cultural-terms*.ts

# Verify IAST encoding
echo "Bhāratavarṣa" | iconv -f UTF-8 -t ASCII//TRANSLIT

# Test TypeScript compilation
npm run build
```

### 5. Frontend Testing

**Testing Checklist**:
1. Navigate to article using the term
2. Locate `{{cultural:term-name}}` in article text
3. Verify underline appears (dotted decoration)
4. Hover over term → Tooltip appears within 50ms
5. Check tooltip content:
   - [ ] Translation correct
   - [ ] Transliteration with diacritics
   - [ ] Etymology present
   - [ ] Cultural context readable (50-200 chars)
6. Switch to Hindi → Hindi tooltip appears
7. Switch to Tamil → Tamil tooltip or English fallback
8. Check browser console → Zero errors

### 6. Commit & Documentation

```bash
# Stage changes
git add src/data/articles/cultural-terms.ts

# Commit with descriptive message
git commit -m "feat(cultural-terms): add 'bharatvarsha' with 9 language translations

- Added complete English entry with IAST transliteration
- Added Hindi, Tamil, Punjabi translations (Tier 1)
- Primary source: Vishnu Purana 2.3.1
- Coverage increase: cosmic-island-sacred-land 75% → 76%"

# Push to feature branch
git push origin feature/cultural-terms-batch-5
```

---

## Translation Standards

### IAST (International Alphabet of Sanskrit Transliteration)

**Use For**: Sanskrit, Pali, Prakrit terms

**Diacritics**:
```
Vowels: ā ī ū ṛ ṝ ḷ ḹ
Anusvara: ṃ
Visarga: ḥ
Gutturals: k kh g gh ṅ
Palatals: c ch j jh ñ
Retroflexes: ṭ ṭh ḍ ḍh ṇ
Dentals: t th d dh n
Labials: p ph b bh m
Sibilants: ś ṣ s
```

**Examples**:
- bharatvarsha → `Bhāratavarṣa`
- jambudwipa → `Jambūdvīpa`
- rigveda → `Ṛgveda`
- shatapatha brahmana → `Śatapatha Brāhmaṇa`

### ISO 15919 (For Modern Indian Languages)

**Use For**: Hindi, Tamil, Telugu, Kannada, Bengali, etc.

**Key Differences from IAST**:
- More comprehensive for non-Sanskrit scripts
- Tamil: Uses dot-below for retroflex (ṭ, ṇ, etc.)
- Example: Tamil `Cōḻar` (not `Cholar`)

### Cultural Context Guidelines

**Length**: 50-200 characters (sweet spot: 100-120)

**Structure**:
```
[Brief definition] (10-20 chars) + 
[Historical/cultural significance] (30-50 chars) + 
[Primary source citation] (20-30 chars)
```

**Good Example** (112 chars):
```
Ancient name for Indian subcontinent, derived from King Bharata. 
One of nine varshas of Jambudwipa (Vishnu Purana 2.3).
```

**Bad Examples**:

❌ **Too Brief** (18 chars):
```
Name for India.
```
*Problem*: No historical context, no source citation

❌ **Too Verbose** (320 chars):
```
Bharatavarsha is the ancient Sanskrit name for the Indian subcontinent 
according to Hindu cosmography, which was named after the legendary 
emperor Bharata who was a descendant of the Chandravamsha (Lunar Dynasty), 
and this term appears extensively throughout the Mahabharata epic as well 
as numerous Puranas including the Vishnu Purana, Markandeya Purana, and 
Vayu Purana, where it is described as one of the nine varshas or divisions 
of the Jambudwipa continent in the Puranic cosmographic model.
```
*Problem*: Excessive detail, breaks tooltip readability

---

## Quality Assurance

### Validation Criteria

**Tier 1 (Required for ALL terms)**:
- ✅ English translation complete
- ✅ IAST/ISO transliteration accurate
- ✅ Etymology cites source language
- ✅ Cultural context 50-200 characters
- ✅ Primary source cited
- ✅ Term normalized (lowercase, no hyphens)

**Tier 2 (Required for Priority 1 terms)**:
- ✅ Hindi translation complete
- ✅ Tamil translation complete (for South India articles)
- ✅ Punjabi translation complete (for North India articles)

**Tier 3 (Aspirational)**:
- 🎯 All 9 languages translated
- 🎯 Audio pronunciation (IPA + native speaker)
- 🎯 Visual illustration (for geographic terms)

### Peer Review Checklist

**Scholarly Accuracy**:
- [ ] Primary source correctly cited (verified in original text)
- [ ] Etymology verified in Monier-Williams/Apte
- [ ] IAST transliteration matches scholarly consensus
- [ ] Cultural context historically accurate (no anachronisms)
- [ ] Debated interpretations noted (if applicable)

**Technical Quality**:
- [ ] TypeScript compiles without errors
- [ ] JSON structure valid
- [ ] UTF-8 encoding correct (diacritics render)
- [ ] No duplicate entries
- [ ] Normalization correct (lowercase, no hyphens)

**Frontend Quality**:
- [ ] Tooltip renders correctly
- [ ] Content readable (not truncated)
- [ ] Language switching works
- [ ] No console errors
- [ ] Performance acceptable (<50ms render)

---

## Scholarly Sources

### Primary Texts (Critical Editions)

**Vedic**:
- Rigveda: Sontakke & Kashikar (Vaidika Samsodhana Mandala, 1933-51)
- Atharvaveda: Whitney & Lanman (Harvard Oriental Series, 1905)
- Shatapatha Brahmana: Eggeling translation (Sacred Books of the East, 1882-1900)

**Epic**:
- Mahabharata: BORI Critical Edition (19 vols, 1933-1966)
- Ramayana: Baroda Critical Edition (7 vols, 1960-75)

**Puranic**:
- Vishnu Purana: M.M. Dutt (1896) / Wilson (1840)
- Vayu Purana: Tagare (Motilal Banarsidass, 1987)
- Markandeya Purana: Pargiter (1904)

### Dictionaries & Lexicons

**Sanskrit**:
- Monier-Williams Sanskrit-English Dictionary (1899) - **PRIMARY REFERENCE**
- Apte Sanskrit-English Dictionary (1957-59)
- Vedic Index (Macdonell & Keith, 1912) - For Vedic terms

**Regional Languages**:
- Tamil Lexicon (University of Madras, 1924-36)
- Kannada-English Dictionary (Kittel, 1894)
- Telugu-English Dictionary (Brown, 1903)

### Scholarly Works (Modern)

**Ancient India**:
- Thapar, Romila. *Early India: From the Origins to AD 1300* (2002)
- Witzel, Michael. "The Development of the Vedic Canon and its Schools" (1997)
- Kulke & Rothermund. *A History of India* (4th ed., 2004)

**Geography & Cosmography**:
- Kirfel, Willibald. *Die Kosmographie der Inder* (1920) - Puranic cosmography
- Darian, Steven G. *The Ganges in Myth and History* (1978)
- Sircar, D.C. *Studies in the Geography of Ancient and Medieval India* (1971)

**Epigraphy & Archaeology**:
- Sircar, D.C. *Indian Epigraphical Glossary* (1966)
- Bühler, Georg. *Indische Palaeographie* (1896) - Scripts & inscriptions

---

## Appendices

### Appendix A: Complete IAST Character Set

```
a ā i ī u ū ṛ ṝ ḷ ḹ e ai o au
k kh g gh ṅ
c ch j jh ñ
ṭ ṭh ḍ ḍh ṇ
t th d dh n
p ph b bh m
y r l v
ś ṣ s h
ṃ ḥ
```

### Appendix B: Common Normalization Patterns

| Article Usage | Normalized Form | Database Key |
|---------------|----------------|--------------|
| Bharatvarsha | bharatvarsha | `bharatvarsha` |
| Bharata-varsha | bharatvarsha | `bharatvarsha` |
| bharata_varsha | bharatvarsha | `bharatvarsha` |
| BHARATVARSHA | bharatvarsha | `bharatvarsha` |
| Jambudwipa | jambudwipa | `jambudwipa` |
| Jambu-dwipa | jambudwipa | `jambudwipa` |
| jambu_dvipa | jambudwipa | `jambudwipa` |
| Ṛgveda | rigveda | `rigveda` |
| Rig-veda | rigveda | `rigveda` |

### Appendix C: Term Addition Batch Log

**Phase 1 (Oct 1-3, 2025)**:
- Batch 1: 15 Vedic terms (agni, rigveda, vedic, etc.)
- Batch 2: 12 Geographic terms (bharatvarsha, himavan, etc.)
- Batch 3: 8 Philosophical terms (dharma, karma, etc.)
- **Total Added**: 35 terms
- **Coverage Increase**: 75% → 82%

**Phase 2 (Oct 4-6, 2025)** - Planned:
- Batch 4: 20 High-frequency cosmic-island terms
- Batch 5: 25 Medium-frequency terms
- Batch 6: 15 Social/political terms
- **Target**: 95 total terms added
- **Target Coverage**: 82% → 92%

---

**Document Version**: 1.0  
**Next Review**: November 2, 2025  
**Total Terms Target**: 1000 by December 31, 2025  
**Maintained By**: Srangam Research Team
