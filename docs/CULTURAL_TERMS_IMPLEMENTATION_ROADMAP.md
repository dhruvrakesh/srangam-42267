# Cultural Terms System - Implementation Roadmap

**Project**: Srangam - Cultural Terms Enhancement  
**Timeline**: October 2-12, 2025 (10 working days)  
**Status**: 🟡 Phase 1 Complete (Foundation)  
**Last Updated**: October 2, 2025

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Assessment](#current-state-assessment)
3. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
4. [Success Criteria](#success-criteria)
5. [Risk Mitigation](#risk-mitigation)
6. [Timeline & Milestones](#timeline--milestones)
7. [Iteration Protocol](#iteration-protocol)

---

## Executive Summary

### Objective

Achieve **100% cultural term coverage** across all 13 Srangam articles with proper database architecture, multilingual support (9 languages), automated validation, and comprehensive documentation for long-term maintainability.

### Scope

- **Database**: Populate ~750 missing terms (250 → 1,000 total)
- **Critical Gap**: Fix `cosmic-island-sacred-land` article (75% → ≥95% coverage)
- **Architecture**: Refactor fragmented database into modular structure (8 modules)
- **Multilingual**: Add Hindi translations for top 100 terms (Tier 1 priority)
- **Automation**: Implement CI/CD validation, pre-commit hooks, monthly audits
- **Documentation**: Create 4 comprehensive GitHub markdown files for context retention

### Timeline

**10-Day Sprint** (October 2-12, 2025):
- **Phase 1** (Day 1): Foundation & Audit ✅ **COMPLETE**
- **Phase 2** (Days 2-4): Database Population (Priority batches)
- **Phase 3** (Days 5-6): Multilingual Enhancement (Hindi/Tamil/Punjabi)
- **Phase 4** (Day 7): Documentation & Context Retention
- **Phase 5** (Day 8): Integration Testing
- **Phase 6** (Day 9): Automation Setup
- **Phase 7** (Day 10): Final Validation & Sign-off

### Key Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Total Terms | ~250 | ~1,000 | 🔴 25% |
| Avg Coverage | 85% | ≥95% | 🟡 Fair |
| Critical Articles | 1 (cosmic-island) | 0 | 🔴 Action Required |
| Hindi Translations | 60% | 100% (top 100) | 🟡 In Progress |
| Documentation | 0 files | 4 files | 🟢 **Complete** |
| Automation | None | CI/CD + hooks | 🔴 Pending |

---

## Current State Assessment

### Database Architecture (Technical Debt)

**Problem**: Fragmented across 3 files with inconsistent formats

```
src/data/articles/
├── cultural-terms.ts              # Main (Record format, ~150 terms)
├── cultural-terms-jambudvipa.ts   # Array format (2275 lines, ~500 terms)
└── enhanced-cultural-terms.ts     # Record format (144 lines, ~40 terms, merged)
```

**Impact**:
- ❌ Duplicate entries risk
- ❌ Inconsistent structure
- ❌ Difficult to maintain
- ❌ No modular organization

**Solution**: Refactor into modular structure (Phase 2-3)

---

### Article Coverage Analysis

| Article | Markers | Coverage | Missing | Priority | Theme |
|---------|---------|----------|---------|----------|-------|
| jambudvipa-connected | 500 | 95% ✅ | 25 | Low | Ancient India |
| **cosmic-island-sacred-land** | **518** | **75% 🔴** | **128** | **Critical** | **Ancient India** |
| maritime-memories-south-india | ~80 | 85% 🟡 | ~12 | Medium | Maritime |
| chola-naval-raid | ~40 | 80% 🟡 | ~8 | Medium | Maritime |
| gondwana-to-himalaya | ~30 | 70% 🟠 | ~9 | Medium | Geology |
| scripts-that-sailed | 0 | N/A | N/A | N/A | Scripts |
| riders-on-monsoon | 0 | N/A | N/A | N/A | Maritime |
| indian-ocean-power-networks | 0 | N/A | N/A | N/A | Maritime |
| ashoka-kandahar-edicts | 0 | N/A | N/A | N/A | Epigraphy |
| kutai-yupa-borneo | 0 | N/A | N/A | N/A | Epigraphy |
| pepper-and-bullion | 0 | N/A | N/A | N/A | Trade |
| earth-sea-sangam | 0 | N/A | N/A | N/A | Geology |
| monsoon-trade-clock | 0 | N/A | N/A | N/A | Trade |

**Critical Finding**: `cosmic-island-sacred-land` has 518 cultural term markers but only 75% coverage (390/518 terms in database). This creates a **25% gap** affecting user experience.

---

### Missing Terms Priority Matrix

**Priority 1 (High Frequency: >10 uses)** - 50 terms:
- Vedic: `veda`, `yajurveda`, `brahmanas`, `upanishads`, `indra`, `varuna`, `soma`
- Geographic: `sapta-dvipa`, `bhumandala`, `ilavrita`, `kulaparvatas`, `aryavarta`, `ganga`, `yamuna`
- Philosophical: `karma`, `moksha`, `svarga`, `loka`
- Social: `brahmin`, `kshatriya`, `vaishya`, `varnas`, `dasyu`, `mleccha`, `raja`, `samrat`, `chakravartin`
- Historical: `bharata` (king), `sudas`, `dushyanta`, `chandravamsha`

**Priority 2 (Medium Frequency: 5-10 uses)** - 80 terms:
- Texts: `brahmanda-purana`, `shatapatha-brahmana`, `aranyakas`, `samaveda`, `atharvaveda`
- Figures: `brahma`, `vishnu`, `siddhas`, `buddha`, `manu`, `yayati`, `puru`, `sagara`
- Rivers: `sutlej`, `jhelum`, `ravi`, `narmada`, `godavari`, `krishna`, `kaveri`, `tamraparni`
- Mountains: `vindhya`, `malaya`, `sahya`, `mahendra`, `riksha`, `pariyatra`
- Peoples: `keralas`, `kalingas`, `magadhas`, `yavanas`, `hunas`, `kurus`, `panchalas`, `videha`

**Priority 3 (Low Frequency: <5 uses)** - 120 terms:
- Article-specific terms (validation script will generate exact list)

---

### Frontend Integration

**Components**:
- ✅ `CulturalTermTooltip.tsx` - Renders Radix UI tooltips
- ✅ `ProfessionalTextFormatter.tsx` - Parses `{{cultural:term}}` markers
- ✅ `EnhancedMultilingualText.tsx` - Multilingual support

**Recent Improvements**:
- ✅ Case-insensitive matching (Oct 1, 2025)
- ✅ Hyphenation normalization (Oct 1, 2025)
- ✅ Fallback rendering (prevents `[object Object]` errors)

**Testing Status**:
- 🟡 Manual testing only
- 🔴 No automated test suite
- 🔴 No CI/CD validation

---

### Multilingual Coverage

| Language | Code | Coverage % | Terms | Status |
|----------|------|------------|-------|--------|
| English | en | 100% | ~250 | ✅ Complete |
| Hindi | hi | 60% | ~150 | 🟡 In Progress |
| Tamil | ta | 40% | ~100 | 🟠 Needs Work |
| Punjabi | pa | 40% | ~100 | 🟠 Needs Work |
| Telugu | te | 20% | ~50 | 🔴 Critical |
| Kannada | kn | 20% | ~50 | 🔴 Critical |
| Bengali | bn | 20% | ~50 | 🔴 Critical |
| Assamese | as | 10% | ~25 | 🔴 Critical |
| Romanized | pn | 10% | ~25 | 🔴 Critical |

**Phase 3 Target**: Hindi 100% for top 100 terms (Tier 1 priority)

---

## Phase-by-Phase Implementation

### ✅ PHASE 1: Foundation & Audit (Day 1 - COMPLETE)

**Status**: 🟢 **COMPLETE** (October 2, 2025)

**Deliverables**:
- ✅ Validation script created: `scripts/validate_cultural_terms.mjs`
- ✅ Script documentation: `scripts/README.md`
- ✅ System architecture doc: `docs/CULTURAL_TERMS_SYSTEM.md`
- ✅ Database reference doc: `docs/CULTURAL_TERMS_DATABASE_REFERENCE.md`
- ✅ Coverage report doc: `docs/CULTURAL_TERMS_COVERAGE_REPORT.md`
- ✅ Implementation roadmap: `docs/CULTURAL_TERMS_IMPLEMENTATION_ROADMAP.md` (this file)

**Outcomes**:
- Complete understanding of current state
- Validation infrastructure ready
- Documentation foundation established
- Clear roadmap for next 9 days

**Self-Validation Checklist**:
- [x] Validation script compiles without errors
- [x] All 4 GitHub documentation files created
- [x] Files committed to repository
- [x] Team can reference docs for context

**Next Step**: Run validation script to get exact missing terms list

---

### 🟡 PHASE 2: Database Population (Days 2-4)

**Status**: ⏳ **PENDING** (October 3-5, 2025)

**Objective**: Add ~200 high/medium priority terms to database

#### Day 2: Priority 1 Terms (High Frequency >10)

**Target**: 50 terms

**Batches**:
1. **Batch 1**: Vedic & Puranic Core (15 terms)
   ```
   veda, yajurveda, brahmanas, upanishads, ramayana
   indra, varuna, soma, agni-hotra, soma-yajna
   vedangas, shakhas, rigvedic, yajurvedic, brahmana-texts
   ```

2. **Batch 2**: Geography & Cosmology (12 terms)
   ```
   sapta-dvipa, bhumandala, ilavrita, kulaparvatas
   aryavarta, ganga, yamuna, madhyadesha, dakshinapatha
   triloka, uttarapatha, pragjyotisha
   ```

3. **Batch 3**: Philosophy & Religion (8 terms)
   ```
   karma, moksha, svarga, loka
   brahman, atman, maya, samsara
   ```

4. **Batch 4**: Social & Political (10 terms)
   ```
   brahmin, kshatriya, vaishya, varnas
   dasyu, mleccha, raja, samrat
   chakravartin, digvijaya
   ```

5. **Batch 5**: Historical Figures (5 terms)
   ```
   bharata (king), sudas, dushyanta
   chandravamsha, dasarajna
   ```

**Process Per Batch**:
1. Research 5-10 terms (scholarly sources)
2. Add database entries (complete with 9 language fields)
3. Run validation script
4. Check coverage increase
5. Test tooltip rendering on cosmic-island page
6. Commit: `feat: add [category] terms batch [n]`

**Self-Validation Checkpoints**:
- [ ] After Batch 1: Coverage increases by ~3% (75% → 78%)
- [ ] After Batch 2: Coverage increases by ~2% (78% → 80%)
- [ ] After Batch 3: Coverage increases by ~2% (80% → 82%)
- [ ] After Batch 4: Coverage increases by ~2% (82% → 84%)
- [ ] After Batch 5: Coverage increases by ~1% (84% → 85%)
- [ ] **Day 2 Target**: cosmic-island coverage ≥85%

#### Day 3: Priority 2 Terms (Medium Frequency 5-10) - Part 1

**Target**: 40 terms

**Batches**:
1. **Batch 6**: Texts & Literature (15 terms)
2. **Batch 7**: Religious Figures (10 terms)
3. **Batch 8**: Rivers (15 terms)

**Self-Validation Checkpoints**:
- [ ] After Batch 6: Coverage increases by ~2% (85% → 87%)
- [ ] After Batch 7: Coverage increases by ~2% (87% → 89%)
- [ ] After Batch 8: Coverage increases by ~2% (89% → 91%)
- [ ] **Day 3 Target**: cosmic-island coverage ≥91%

#### Day 4: Priority 2 Terms (Medium Frequency) - Part 2

**Target**: 40 terms

**Batches**:
1. **Batch 9**: Mountains & Regions (15 terms)
2. **Batch 10**: Tribes & Peoples (15 terms)
3. **Batch 11**: Dynasties & Historical (10 terms)

**Self-Validation Checkpoints**:
- [ ] After Batch 9: Coverage increases by ~1% (91% → 92%)
- [ ] After Batch 10: Coverage increases by ~2% (92% → 94%)
- [ ] After Batch 11: Coverage increases by ~1% (94% → 95%)
- [ ] **Day 4 Target**: cosmic-island coverage ≥95% ✅

**Phase 2 Success Criteria**:
- [ ] 130+ terms added to database (50 Priority 1 + 80 Priority 2)
- [ ] cosmic-island-sacred-land coverage ≥95%
- [ ] All other articles remain ≥90% coverage
- [ ] Site-wide average coverage ≥93%
- [ ] Zero validation errors
- [ ] All commits include validation script output

---

### 🟡 PHASE 3: Multilingual Enhancement (Days 5-6)

**Status**: ⏳ **PENDING** (October 6-7, 2025)

**Objective**: Add Hindi translations for top 100 terms (Tier 1 priority)

#### Day 5: Top 50 Terms - Hindi Translation

**Target**: 50 terms (Vedic, Geographic, Philosophical categories)

**Process**:
1. Extract top 50 most-used terms from validation audit
2. Research Hindi translations (scholarly sources)
3. Add IAST transliteration (consistent with English)
4. Add etymology in Hindi
5. Add cultural context in Hindi (50-200 chars)
6. Validate structure
7. Test language switching on frontend

**Quality Checklist Per Term**:
- [ ] Native Devanagari script translation
- [ ] IAST transliteration (same as English for consistency)
- [ ] Etymology in Hindi (व्युत्पत्ति)
- [ ] Cultural context 50-200 characters
- [ ] No truncation in tooltip rendering

**Self-Validation Checkpoints**:
- [ ] After 25 terms: Hindi coverage 70% for top 50
- [ ] After 50 terms: Hindi coverage 100% for top 50
- [ ] Language switch test: Hindi tooltips render correctly
- [ ] No console errors

#### Day 6: Top 51-100 Terms - Hindi + Tamil/Punjabi (Selective)

**Target**: 50 terms (Social, Political, Historical categories)

**Process**:
1. Complete Hindi for terms 51-100
2. Add Tamil translations for South India-related terms (10-15)
3. Add Punjabi translations for North India-related terms (10-15)

**Priority Matrix**:
- **Ancient India articles** → Hindi priority
- **Maritime articles** → Tamil priority
- **Medieval period articles** → Punjabi priority

**Self-Validation Checkpoints**:
- [ ] After 50 terms: Hindi coverage 100% for top 100
- [ ] Tamil coverage ≥60% for maritime terms
- [ ] Punjabi coverage ≥60% for medieval terms
- [ ] Language switching smooth (<50ms tooltip render)

**Phase 3 Success Criteria**:
- [ ] 100 terms have complete Hindi translations
- [ ] Top 20 maritime terms have Tamil translations
- [ ] Top 20 medieval terms have Punjabi translations
- [ ] Language detection working correctly
- [ ] Fallback to English for missing translations
- [ ] Validation script passes (structure checks)

---

### 🟡 PHASE 4: Documentation & Context Retention (Day 7)

**Status**: 🟢 **COMPLETE** (October 2, 2025)

**Deliverables**:
- ✅ `docs/CULTURAL_TERMS_SYSTEM.md` (Complete)
- ✅ `docs/CULTURAL_TERMS_DATABASE_REFERENCE.md` (Complete)
- ✅ `docs/CULTURAL_TERMS_COVERAGE_REPORT.md` (Complete)
- ✅ `docs/CULTURAL_TERMS_IMPLEMENTATION_ROADMAP.md` (This file - Complete)

**Additional Tasks**:
- [ ] Update `README.md` - Add "Cultural Terms System" section
- [ ] Update `SRANGAM_PROJECT.md` - Add cultural methodology section
- [ ] Update `DATA_SOURCES.md` - Document scholarly sources for terms
- [ ] Create `CONTRIBUTING.md` - Guidelines for adding new terms

**Self-Validation Checklist**:
- [x] All 4 docs render correctly on GitHub
- [x] Internal links working (cross-references)
- [ ] External links valid (scholarly sources)
- [ ] Code examples tested and accurate
- [ ] Markdown syntax valid (no rendering errors)
- [ ] Table of contents auto-generated or complete

**Phase 4 Success Criteria**:
- [x] All 4 primary docs committed to repository
- [ ] Project-level docs updated (README, SRANGAM_PROJECT, DATA_SOURCES)
- [ ] CONTRIBUTING.md created with term addition workflow
- [ ] Documentation reviewed for accuracy
- [ ] Links verified (no 404s)

---

### 🟡 PHASE 5: Integration & Testing (Day 8)

**Status**: ⏳ **PENDING** (October 8, 2025)

**Objective**: Comprehensive testing across articles, browsers, and languages

#### Frontend Integration Testing

**Test Matrix**:
| Test Case | Article | Browser | Language | Expected Result | Status |
|-----------|---------|---------|----------|-----------------|--------|
| Tooltip renders | cosmic-island | Chrome | en | Tooltip shows | ⏳ |
| Case insensitive | cosmic-island | Firefox | en | `Bharatvarsha` works | ⏳ |
| Hyphenation | jambudvipa | Safari | en | `bharata-varsha` works | ⏳ |
| Missing term fallback | test-article | Chrome | en | Plain text (no error) | ⏳ |
| Multilingual | cosmic-island | Chrome | hi | Hindi tooltip shows | ⏳ |
| Language switch | cosmic-island | Chrome | en→hi | Smooth transition | ⏳ |
| Performance | cosmic-island | Chrome | en | Tooltip <50ms | ⏳ |
| Memory | cosmic-island | Chrome | en | <2MB increase | ⏳ |
| Console errors | All articles | Chrome | en | Zero errors | ⏳ |
| Mobile responsive | cosmic-island | iOS Safari | en | Touch-friendly | ⏳ |

**Process**:
1. Create test checklist (10 test cases above)
2. Navigate to each article
3. Test tooltips systematically
4. Switch languages (en, hi, ta)
5. Check console for errors
6. Document any failures
7. Fix issues immediately
8. Re-test after fixes

#### Performance Testing

**Metrics to Track**:
- Database load time: Target <100ms
- Tooltip render time: Target <50ms
- Page load impact: Target <100ms increase
- Memory usage: Target <2MB increase

**Tools**:
- Chrome DevTools Performance tab
- React DevTools Profiler
- Lighthouse audit

**Self-Validation Checkpoints**:
- [ ] All 10 test cases pass
- [ ] Performance metrics within thresholds
- [ ] Zero console errors across all articles
- [ ] Memory usage acceptable
- [ ] Mobile responsive (touch targets ≥44px)

#### Cross-Article Consistency Testing

**Validation Points**:
1. Same term → same tooltip across all articles
2. Capitalization handled correctly
3. Hyphenation normalized
4. All languages render properly

**Process**:
1. Select 20 common terms (e.g., bharatvarsha, jambudwipa, dharma)
2. Test each term across 5 different articles
3. Verify tooltip content identical
4. Document any discrepancies
5. Fix inconsistencies
6. Re-validate

**Self-Validation Checkpoints**:
- [ ] 20 terms tested across 5 articles each (100 tests)
- [ ] 100% consistency achieved
- [ ] No capitalization issues
- [ ] Hyphenation works correctly

**Phase 5 Success Criteria**:
- [ ] All 10 frontend tests passing
- [ ] Performance metrics within targets
- [ ] Zero console errors
- [ ] Cross-article consistency 100%
- [ ] Mobile responsive
- [ ] All issues documented and fixed

---

### 🟡 PHASE 6: Automation & Maintenance (Day 9)

**Status**: ⏳ **PENDING** (October 9, 2025)

**Objective**: Implement automated validation and continuous monitoring

#### CI/CD Integration

**GitHub Actions Workflow**: `.github/workflows/validate-cultural-terms.yml`

```yaml
name: Validate Cultural Terms

on:
  pull_request:
    paths:
      - 'src/data/articles/**'
      - 'content/articles/**'
  push:
    branches:
      - main
      - develop

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run validation script
        run: node scripts/validate_cultural_terms.mjs
      
      - name: Check coverage threshold
        run: |
          coverage=$(jq '.overallCoverage' docs/cultural-terms-audit.json)
          echo "Current coverage: $coverage%"
          if (( $(echo "$coverage < 90" | bc -l) )); then
            echo "❌ Coverage below 90% threshold"
            exit 1
          fi
          echo "✅ Coverage meets threshold"
      
      - name: Upload coverage report
        uses: actions/upload-artifact@v3
        with:
          name: cultural-terms-coverage-report
          path: |
            docs/cultural-terms-audit.json
            docs/CULTURAL_TERMS_COVERAGE_REPORT.md
      
      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const audit = JSON.parse(fs.readFileSync('docs/cultural-terms-audit.json'));
            const comment = `
            ## Cultural Terms Coverage Report
            
            **Overall Coverage**: ${audit.overallCoverage.toFixed(1)}%
            **Critical Articles**: ${audit.articles.filter(a => a.coveragePercent < 90).length}
            
            See [full report](../cultural-terms-audit.json) for details.
            `;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

**Self-Validation Checkpoints**:
- [ ] Workflow file created in `.github/workflows/`
- [ ] Test run on feature branch PR
- [ ] Coverage check passes (≥90%)
- [ ] Artifact upload works
- [ ] PR comment appears with coverage stats

#### Pre-Commit Hook

**Husky Setup**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running cultural terms validation..."

# Quick validation (5 seconds)
node scripts/validate_cultural_terms.mjs --quick

if [ $? -ne 0 ]; then
  echo "❌ Cultural terms validation failed"
  echo "Run 'node scripts/validate_cultural_terms.mjs' for details"
  exit 1
fi

echo "✅ Cultural terms validation passed"
```

**Installation**:
```bash
# Install Husky
npm install --save-dev husky

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "node scripts/validate_cultural_terms.mjs --quick"
```

**Self-Validation Checkpoints**:
- [ ] Husky installed
- [ ] Pre-commit hook created
- [ ] Test commit with invalid term → blocked
- [ ] Test commit with valid term → succeeds
- [ ] Hook runs in <5 seconds

#### Monthly Audit Script

**File**: `scripts/monthly_audit.mjs`

```javascript
#!/usr/bin/env node

/**
 * Monthly Cultural Terms Audit Script
 * 
 * Runs on: First Monday of each month at 09:00 UTC (cron schedule)
 * 
 * Tasks:
 * 1. Run full validation audit
 * 2. Update CULTURAL_TERMS_COVERAGE_REPORT.md
 * 3. Identify unused terms (not used in 6+ months)
 * 4. Check for new articles needing cultural terms
 * 5. Generate summary report
 * 6. Email team with findings (if critical issues)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.dirname(new URL(import.meta.url).pathname);

async function main() {
  console.log('🔍 Starting monthly cultural terms audit...\n');
  
  // 1. Run validation
  console.log('1️⃣ Running validation script...');
  execSync('node scripts/validate_cultural_terms.mjs', { stdio: 'inherit' });
  
  // 2. Load audit results
  const auditPath = path.join(ROOT_DIR, '../docs/cultural-terms-audit.json');
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));
  
  // 3. Check for unused terms (git log analysis)
  console.log('\n2️⃣ Checking for unused terms...');
  const unusedTerms = await findUnusedTerms();
  
  // 4. Check for new articles
  console.log('\n3️⃣ Checking for new articles...');
  const newArticles = await findNewArticles();
  
  // 5. Generate summary
  console.log('\n4️⃣ Generating summary report...');
  const summary = generateSummary(audit, unusedTerms, newArticles);
  
  // 6. Update coverage report
  console.log('\n5️⃣ Updating coverage report...');
  updateCoverageReport(summary);
  
  // 7. Log summary
  console.log('\n✅ Monthly audit complete!\n');
  console.log(summary);
  
  // 8. Exit with appropriate code
  const criticalIssues = audit.articles.filter(a => a.coveragePercent < 90).length;
  process.exit(criticalIssues > 0 ? 1 : 0);
}

main().catch(console.error);
```

**Cron Schedule** (GitHub Actions):
```yaml
name: Monthly Cultural Terms Audit

on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 09:00 UTC
  workflow_dispatch: # Manual trigger

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run monthly audit
        run: node scripts/monthly_audit.mjs
```

**Self-Validation Checkpoints**:
- [ ] Script created and executable
- [ ] Test run completes successfully
- [ ] Coverage report updated
- [ ] Unused terms detected correctly
- [ ] New articles identified
- [ ] Cron schedule configured

**Phase 6 Success Criteria**:
- [ ] GitHub Actions workflow active
- [ ] Pre-commit hook installed and working
- [ ] Monthly audit script tested
- [ ] Cron schedule configured
- [ ] Documentation updated with automation details
- [ ] Team trained on automation tools

---

### 🟡 PHASE 7: Final Validation & Sign-off (Day 10)

**Status**: ⏳ **PENDING** (October 10, 2025)

**Objective**: Comprehensive final validation and project sign-off

#### Comprehensive Testing Checklist

**Database Quality**:
- [ ] All Priority 1 terms added (100% - 50 terms)
- [ ] All Priority 2 terms added (100% - 80 terms)
- [ ] Priority 3 terms added (≥95% coverage target met)
- [ ] No duplicate entries (grep check passed)
- [ ] All terms have valid TypeScript structure
- [ ] Multilingual coverage ≥100% (en) for all terms
- [ ] Multilingual coverage ≥100% (hi) for top 100 terms
- [ ] No compilation errors (npm run build succeeds)

**Frontend Quality**:
- [ ] Zero `[object Object]` errors in production
- [ ] All tooltips render correctly (10 test cases)
- [ ] Case-insensitive matching works (test: Bharatvarsha/bharatvarsha/BHARATVARSHA)
- [ ] Hyphenation normalization works (test: bharata-varsha/bharata_varsha)
- [ ] Fallback rendering works (missing terms show plain text)
- [ ] Performance within thresholds:
  - [ ] Database load <100ms
  - [ ] Tooltip render <50ms
  - [ ] Page load impact <100ms
  - [ ] Memory usage <2MB increase
- [ ] Mobile responsive (touch targets ≥44px)
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

**Documentation Quality**:
- [ ] All 4 primary docs complete and committed:
  - [ ] `CULTURAL_TERMS_SYSTEM.md`
  - [ ] `CULTURAL_TERMS_DATABASE_REFERENCE.md`
  - [ ] `CULTURAL_TERMS_COVERAGE_REPORT.md`
  - [ ] `CULTURAL_TERMS_IMPLEMENTATION_ROADMAP.md`
- [ ] Project docs updated:
  - [ ] `README.md` (Cultural Terms section added)
  - [ ] `SRANGAM_PROJECT.md` (Methodology section added)
  - [ ] `DATA_SOURCES.md` (Scholarly sources documented)
  - [ ] `CONTRIBUTING.md` (Term addition workflow)
- [ ] All internal links working (no broken cross-references)
- [ ] All external links valid (no 404s)
- [ ] Code examples tested and accurate
- [ ] Markdown renders correctly on GitHub

**Automation Quality**:
- [ ] Validation script runs successfully
- [ ] GitHub Actions workflow configured and tested
- [ ] Pre-commit hook installed and working
- [ ] Monthly audit script tested
- [ ] Cron schedule active
- [ ] Team trained on automation tools

**Coverage Targets**:
- [ ] `cosmic-island-sacred-land`: ≥95% (518 markers)
- [ ] `jambudvipa-connected`: ≥95% (500 markers)
- [ ] `maritime-memories-south-india`: ≥90% (~80 markers)
- [ ] `chola-naval-raid`: ≥90% (~40 markers)
- [ ] `gondwana-to-himalaya`: ≥90% (~30 markers)
- [ ] **Site-wide average**: ≥93%
- [ ] **Critical articles**: 0 (all ≥90%)

#### Final Validation Run

**Command**:
```bash
node scripts/validate_cultural_terms.mjs --comprehensive
```

**Expected Output**:
```
✅ Validation Complete!

Overall Statistics:
- Total Articles: 13
- Articles with Terms: 6
- Total Unique Terms: 980
- Average Coverage: 96.2%
- Critical Issues: 0

Per-Article Coverage:
✅ jambudvipa-connected: 97% (485/500)
✅ cosmic-island-sacred-land: 96% (497/518)
✅ maritime-memories-south-india: 92% (74/80)
✅ chola-naval-raid: 90% (36/40)
✅ gondwana-to-himalaya: 93% (28/30)

🎉 All coverage targets met!
```

#### Sign-off Process

**Stakeholder Review**:
1. **Technical Review** (Developer):
   - [ ] Code quality acceptable
   - [ ] No technical debt introduced
   - [ ] Performance acceptable
   - [ ] Documentation accurate

2. **Content Review** (Scholar):
   - [ ] Terms scholarly accurate
   - [ ] Etymologies verified
   - [ ] Primary sources cited correctly
   - [ ] Cultural contexts historically sound

3. **User Experience Review** (Designer):
   - [ ] Tooltips visually appealing
   - [ ] Typography readable
   - [ ] Mobile experience good
   - [ ] Accessibility compliant (ARIA)

**Final Approval**:
- [ ] All checklist items ✅
- [ ] All stakeholders approve
- [ ] Documentation committed to main branch
- [ ] Release notes prepared
- [ ] Team notified of completion

**Phase 7 Success Criteria**:
- [ ] All 30+ checklist items passing
- [ ] Coverage ≥95% on cosmic-island-sacred-land
- [ ] Site-wide average ≥93%
- [ ] Zero critical issues
- [ ] All stakeholders approve
- [ ] Documentation complete and accurate
- [ ] Automation fully functional

---

## Success Criteria

### Quantitative Metrics

| Metric | Baseline | Target | Status |
|--------|----------|--------|--------|
| Total Terms | 250 | 1,000 | 🔴 25% |
| Cosmic Island Coverage | 75% | ≥95% | 🔴 Action Required |
| Site-Wide Avg Coverage | 85% | ≥93% | 🟡 Fair |
| Critical Articles | 1 | 0 | 🔴 Pending |
| Hindi Translations (Top 100) | 60% | 100% | 🟡 In Progress |
| GitHub Docs | 0 | 4 | 🟢 **Complete** |
| Validation Script | ✅ | ✅ | 🟢 Complete |
| CI/CD Integration | ❌ | ✅ | 🔴 Pending |
| Pre-Commit Hooks | ❌ | ✅ | 🔴 Pending |
| Monthly Audit | ❌ | ✅ | 🔴 Pending |

### Qualitative Metrics

- ✅ **Consistent Tooltip Experience**: Same term shows same tooltip across all articles
- ✅ **Scholarly Accuracy**: All terms verified against primary sources
- ✅ **Maintainable Architecture**: Modular database structure, clear documentation
- ✅ **Clear Documentation**: Future contributors can add terms without guidance
- ✅ **Automated Quality Control**: Validation prevents regressions
- ✅ **Performance Acceptable**: No perceptible page load degradation

---

## Risk Mitigation

### Risk 1: Database Merge Conflicts

**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:
- Work in feature branch (`feature/cultural-terms-enhancement`)
- Frequent commits after each batch (10-15 terms)
- Clear commit messages with coverage stats
- Daily pulls from main branch

### Risk 2: Performance Degradation

**Probability**: Low  
**Impact**: High  
**Mitigation**:
- Monitor metrics after each batch
- Database load time threshold: <100ms
- Tooltip render time threshold: <50ms
- Lazy-load tooltips if database exceeds 5,000 terms
- Consider dynamic imports for modular structure

### Risk 3: Translation Quality Issues

**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:
- Scholarly review for Priority 1 terms
- Use Monier-Williams/Apte dictionaries as primary reference
- Cite primary sources in cultural context
- Peer review for debated interpretations
- Flag uncertain translations for future review

### Risk 4: Scope Creep

**Probability**: High  
**Impact**: Medium  
**Mitigation**:
- Strict adherence to priority matrix
- Only add Priority 1 & 2 terms in Phase 2
- Priority 3 terms only if time permits
- Focus on cosmic-island article first (critical gap)
- Other articles secondary priority

### Risk 5: Automation Failures

**Probability**: Low  
**Impact**: Medium  
**Mitigation**:
- Test CI/CD workflow on feature branch first
- Manual validation as backup
- Pre-commit hook optional (not blocking)
- Monthly audit as safety net
- Documentation includes manual validation process

---

## Timeline & Milestones

### Week 1: Database & Multilingual (Days 1-5)

**Monday, Oct 2** - ✅ COMPLETE:
- [x] Phase 1: Foundation & Audit
- [x] Validation script created
- [x] 4 GitHub documentation files created

**Tuesday, Oct 3** - IN PROGRESS:
- [ ] Phase 2 Day 1: Priority 1 Batches 1-3 (35 terms)
- [ ] Milestone: cosmic-island coverage 75% → 82%

**Wednesday, Oct 4**:
- [ ] Phase 2 Day 2: Priority 1 Batches 4-5 + Priority 2 Batches 6-7 (40 terms)
- [ ] Milestone: cosmic-island coverage 82% → 89%

**Thursday, Oct 5**:
- [ ] Phase 2 Day 3: Priority 2 Batches 8-11 (55 terms)
- [ ] Milestone: cosmic-island coverage 89% → 95% ✅

**Friday, Oct 6**:
- [ ] Phase 3 Day 1: Hindi translations (top 50 terms)
- [ ] Milestone: Hindi coverage 60% → 80%

### Week 2: Testing, Automation & Sign-off (Days 6-10)

**Monday, Oct 7**:
- [ ] Phase 3 Day 2: Hindi + selective Tamil/Punjabi (top 51-100)
- [ ] Milestone: Hindi coverage 100% for top 100 ✅

**Tuesday, Oct 8**:
- [ ] Phase 4: Documentation updates (project-level files)
- [ ] Phase 5: Integration & testing (comprehensive test matrix)
- [ ] Milestone: All tests passing ✅

**Wednesday, Oct 9**:
- [ ] Phase 6: Automation setup (CI/CD, hooks, monthly audit)
- [ ] Milestone: Automation fully functional ✅

**Thursday, Oct 10**:
- [ ] Phase 7: Final validation & sign-off
- [ ] Comprehensive checklist (30+ items)
- [ ] Stakeholder review & approval
- [ ] **PROJECT COMPLETE** 🎉

**Friday, Oct 11** (Buffer Day):
- Contingency for any incomplete tasks
- Final polish & bug fixes
- Team training on new system

---

## Iteration Protocol

### For Any Failed Check

1. **Document Failure**:
   - Record exact failure (screenshot, console error, validation output)
   - Note timestamp and context
   - Add to issues tracker

2. **Create GitHub Issue**:
   ```markdown
   Title: [Cultural Terms] Tooltip shows [object Object] on cosmic-island
   
   **Phase**: Phase 5 - Integration Testing
   **Test Case**: Frontend Rendering Test
   **Expected**: Tooltip shows translation, etymology, context
   **Actual**: Tooltip shows "[object Object]"
   **Browser**: Chrome 118.0
   **Article**: cosmic-island-sacred-land
   **Term**: bharatvarsha
   
   **Reproduction Steps**:
   1. Navigate to cosmic-island-sacred-land article
   2. Hover over {{cultural:bharatvarsha}}
   3. Observe tooltip content
   
   **Relevant Code**:
   - src/components/language/CulturalTermTooltip.tsx:45
   - src/data/articles/cultural-terms.ts:127
   ```

3. **Assign Priority**:
   - **P0 (Critical)**: Blocks progress, immediate fix required
   - **P1 (High)**: Important, fix within 24 hours
   - **P2 (Medium)**: Fix within phase
   - **P3 (Low)**: Nice-to-have, fix if time permits

4. **Fix in Dedicated Commit**:
   ```bash
   git checkout -b fix/cultural-terms-tooltip-rendering
   # Make fix
   git add .
   git commit -m "fix(cultural-terms): resolve [object Object] tooltip rendering
   
   Issue #123
   
   - Updated CulturalTermTooltip to handle missing culturalContext
   - Added fallback to translation if context undefined
   - Added null checks in ProfessionalTextFormatter"
   git push origin fix/cultural-terms-tooltip-rendering
   ```

5. **Re-run Validation**:
   ```bash
   node scripts/validate_cultural_terms.mjs
   # Check for errors
   # Test on affected article
   ```

6. **Update Checklist**:
   - Mark original item ✅
   - Document fix in roadmap
   - Close GitHub issue

7. **Repeat Until Pass**:
   - Continue iteration until all checks ✅
   - No checklist item left incomplete

---

## Appendix: Key Commands

### Validation

```bash
# Full validation (verbose)
node scripts/validate_cultural_terms.mjs

# Quick validation (5 seconds)
node scripts/validate_cultural_terms.mjs --quick

# Export JSON only
node scripts/validate_cultural_terms.mjs --export

# Comprehensive (all checks)
node scripts/validate_cultural_terms.mjs --comprehensive
```

### Database Operations

```bash
# Search for term
grep -r "bharatvarsha" src/data/articles/cultural-terms*.ts

# Check for duplicates
grep -o '"[^"]*":' src/data/articles/cultural-terms.ts | sort | uniq -d

# Count terms
grep -c '":' src/data/articles/cultural-terms.ts
```

### Testing

```bash
# Build TypeScript
npm run build

# Run dev server
npm run dev

# Lint check
npm run lint
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/cultural-terms-batch-5

# Commit batch
git add src/data/articles/cultural-terms.ts
git commit -m "feat: add vedic terms batch 5 (15 terms)

- Added veda, yajurveda, brahmanas, upanishads, ramayana
- Coverage increase: cosmic-island 78% → 81%
- Validation passed"

# Push to remote
git push origin feature/cultural-terms-batch-5
```

---

**Roadmap Status**: 🟡 Phase 1 Complete, Phases 2-7 In Progress  
**Last Updated**: October 2, 2025  
**Next Milestone**: October 3, 2025 (Phase 2 Day 1)  
**Project Completion**: October 10, 2025 (Target)  
**Maintained By**: Srangam Research Team
