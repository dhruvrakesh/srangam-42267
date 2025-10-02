# Scripts Directory

This directory contains automation scripts for the Srangam project.

## Available Scripts

### `validate_cultural_terms.mjs`

**Purpose**: Validates cultural terms coverage across all articles and generates audit reports.

**Usage**:
```bash
# Full validation with detailed output
node scripts/validate_cultural_terms.mjs

# Quick validation (minimal output)
node scripts/validate_cultural_terms.mjs --quick
```

**What it does**:
1. Extracts all `{{cultural:term}}` markers from article files
2. Cross-references with cultural terms database
3. Generates coverage statistics per article
4. Creates priority matrix for missing terms (high/medium/low frequency)
5. Outputs reports to `docs/` directory

**Outputs**:
- `docs/CULTURAL_TERMS_COVERAGE.md` - Human-readable markdown report
- `docs/cultural-terms-audit.json` - Machine-readable JSON report

**Exit Codes**:
- `0` - All validations passed
- `1` - Some articles below 90% coverage threshold

**Integration**:
- Can be integrated into CI/CD pipeline
- Can be used as pre-commit hook
- Scheduled for monthly audits

---

## Adding New Scripts

When adding new scripts to this directory:

1. Use `.mjs` extension for ES modules
2. Add shebang line: `#!/usr/bin/env node`
3. Make executable: `chmod +x scripts/your-script.mjs`
4. Document in this README
5. Include usage examples
6. Specify exit codes
7. Add to package.json scripts if appropriate

---

## Future Scripts (Planned)

- `monthly_audit.mjs` - Comprehensive monthly audit with unused term detection
- `generate_term_report.mjs` - Generate detailed term etymology reports
- `validate_translations.mjs` - Validate multilingual translation completeness
- `export_glossary.mjs` - Export cultural terms glossary in various formats
