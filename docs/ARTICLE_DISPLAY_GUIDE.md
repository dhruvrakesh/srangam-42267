# Article Display Guide

**Last Updated**: 2025-12-28  
**Purpose**: Best practices for markdown authoring, evidence tables, and multilingual content in Srangam

---

## 📝 Markdown Authoring Best Practices

### Frontmatter Requirements

Every article markdown file should include YAML frontmatter:

```yaml
---
title: "Article Title Here"
slug: "short-seo-friendly-slug"
slug_alias: "even-shorter-alias"  # Optional, auto-generated if omitted
author: "Author Name"
theme: "Ancient India"  # One of 6 themes
tags:
  - primary-tag
  - secondary-tag
dek: "A one-sentence summary for article cards and SEO."
published_date: "2025-12-28"
---
```

### Supported Themes

| Theme ID | Display Name |
|----------|--------------|
| `ancient-india` | Ancient India |
| `indian-ocean` | Indian Ocean World |
| `geology` | Geology & Deep Time |
| `scripts` | Scripts & Inscriptions |
| `empires` | Empires & Exchange |
| `sacred-ecology` | Sacred Ecology |

### Heading Hierarchy

```markdown
# H1 - Reserved for article title (auto-generated)

## H2 - Major sections
Use § symbol prefix (auto-rendered)

### H3 - Subsections
Use ◆ symbol prefix (auto-rendered)

#### H4 - Sub-subsections (sparingly)
```

### Cultural Terms

Mark cultural terms for tooltip highlighting:

```markdown
The {{cultural:dharma}} concept is central to understanding...
```

Or let the system auto-detect them (enabled by default via `autoHighlightTerms`).

**Database of 1,221+ terms** includes:
- Sanskrit philosophical terms (dharma, karma, moksha)
- Historical terms (Maurya, Gupta, Chola)
- Geographic terms (Uttarapatha, Daksinapatha)
- Technical terms (shilpa, yantra, sutra)

---

## 📊 Evidence Table Format

### Standard 6-Column Scholarly Table

For chronological evidence or historical events, use this format:

```markdown
| Date | Place | Actors | Event | Meaning | Evidence |
|------|-------|--------|-------|---------|----------|
| c. 1700 CE | Barnala, Punjab | Baba Ala Singh | Fortification begins | Strategic consolidation | Regional chronicles |
| 1748 | Sirhind | Ahmad Shah Abdali, Ala Singh | Alliance formed | Political pragmatism | *Twarikh-i-Punjab* |
```

### Table Rendering Features (Phase 5 - Robust Extraction)

| Feature | Description |
|---------|-------------|
| **Robust Extraction** | `extractTableData()` handles all ReactMarkdown output variations |
| **Hindi Support** | `isEvidenceTable()` detects Hindi headers (तिथि, स्थान, साक्ष्य) |
| **Dynamic Column Sizing** | Columns auto-size based on content (no fixed widths) |
| **Sticky Headers** | Header row stays visible when scrolling |
| **Zebra Striping** | Alternating row colors for readability |
| **Hover Highlights** | Active row highlights on mouseover |
| **Min/Max Cell Width** | Cells have `min-w-[80px]` and `max-w-[280px]` |
| **First Column Emphasis** | Date column has subtle background |
| **Mobile Scroll** | Horizontal scroll with gradient indicator |
| **Script Fonts** | Devanagari, Gurmukhi auto-applied in cells |
| **Table Protection** | Cultural term enhancement skips table content |

### EvidenceTable Detection Rules

The `isEvidenceTable()` function detects tables using:

1. **Minimum columns**: 5+ columns required
2. **English patterns**: Date/Year + Place/Location + Evidence/Source
3. **Hindi patterns**: तिथि/वर्ष + स्थान/जगह + साक्ष्य/प्रमाण
4. **Scholarly fallback**: 6+ columns with Sl#/Event headers

### EvidenceTable Component (Specialized)

For 6-column scholarly evidence tables, use the dedicated `EvidenceTable` component:

| Feature | Description |
|---------|-------------|
| **Source Quality Badges** | Primary (emerald), Secondary (amber), Tradition (slate) |
| **Mobile Card Layout** | Collapsible cards on screens < 768px |
| **Optimized Columns** | Date(10%), Place(12%), Actors(15%), Event(20%), Meaning(23%), Evidence(20%) |
| **Detection** | Auto-detects tables with Date + Place + Evidence headers |

For detailed evidence with sources:

```markdown
| Sl. | Date | Place | Actor(s) | Event | Significance | Evidence Type |
|-----|------|-------|----------|-------|--------------|---------------|
| 1 | c. 1700 CE | Barnala | Baba Ala Singh | Fortification | Strategic base | Archaeological |
| 2 | 1748 | Sirhind | Ala Singh, Abdali | Alliance | Legitimacy | Textual (Primary) |
| 3 | 1761 | Panipat | Ala Singh | Observed battle | Non-participation | Oral tradition |
```

**Source Quality Badges** (future Phase 3 enhancement):
- `Archaeological` - Physical evidence
- `Textual (Primary)` - Contemporary sources
- `Textual (Secondary)` - Later compilations
- `Oral tradition` - Traditional accounts
- `Epigraphic` - Inscriptions

---

## 🌐 Multilingual Content Guidelines

### Language Codes

| Code | Language | Script | Font Class |
|------|----------|--------|------------|
| `en` | English | Latin | Default |
| `hi` | Hindi | Devanagari | `font-noto-devanagari` |
| `pa` | Punjabi | Gurmukhi | `font-noto-gurmukhi` |
| `ta` | Tamil | Tamil | `font-noto-tamil` |
| `sa` | Sanskrit | Devanagari | `font-noto-devanagari` |

### Importing Multilingual Content

**Step 1**: Import English version first
```
POST /functions/v1/markdown-to-article-import
Body: { markdown content }
```

**Step 2**: Import Hindi/other translation with merge flag
```
POST /functions/v1/markdown-to-article-import?lang=hi&mergeIntoArticle=true
Body: { Hindi markdown content }
```

**Step 3**: Verify in database
```sql
SELECT slug, content->>'en' IS NOT NULL as has_en, 
       content->>'hi' IS NOT NULL as has_hi
FROM srangam_articles 
WHERE slug = 'baba-ala-singh-patiala';
```

### Hindi/Devanagari Best Practices

1. **Diacritics**: Use IAST for romanization (ā, ī, ū, ṛ, ś, ṣ, ṇ)
2. **Script**: Native Devanagari preferred for Hindi content
3. **Tables**: Hindi content in tables renders with proper fonts
4. **OCR Cleanup**: Check for common OCR errors:
   - `।` (danda) vs `|` (pipe)
   - `॥` (double danda) for verse endings
   - Conjunct consonants (क्ष, ज्ञ, त्र)

---

## 🔧 Technical Implementation

### File: `ProfessionalTextFormatter.tsx`

The main article renderer with these features:

```tsx
// Auto-enhance cultural terms
if (enableCulturalTerms && autoHighlightTerms) {
  text = enhanceTextWithCulturalTerms(text, {
    maxLength: 15000,
    preserveExisting: true
  });
}
```

### Custom Renderers

```tsx
table: ({ children }) => (
  <div className="relative overflow-x-auto my-8 rounded-lg border border-burgundy/20 shadow-sm">
    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent pointer-events-none lg:hidden" />
    <table className="w-full border-collapse min-w-[800px]">
      {children}
    </table>
  </div>
),

thead: ({ children }) => (
  <thead className="sticky top-0 z-10 bg-sandalwood/90 backdrop-blur-sm border-b-2 border-burgundy/30">
    {children}
  </thead>
),

tbody: ({ children }) => (
  <tbody className="divide-y divide-burgundy/10 [&>tr:nth-child(even)]:bg-cream/30 [&>tr:hover]:bg-saffron/5">
    {children}
  </tbody>
),
```

### CSS Classes Used

| Class | Purpose |
|-------|---------|
| `bg-sandalwood/90` | Header background |
| `bg-cream/30` | Zebra stripe color |
| `bg-saffron/5` | Hover highlight |
| `border-burgundy/20` | Table borders |
| `text-burgundy` | Header text |
| `backdrop-blur-sm` | Frosted glass effect |

---

## 📱 Responsive Design

### Mobile Table Behavior

- Tables scroll horizontally on mobile
- Gradient indicator shows more content to right
- Minimum width of 800px ensures proper layout
- First column sticky (future enhancement)

### Breakpoints

| Breakpoint | Table Behavior |
|------------|----------------|
| `< 640px` (mobile) | Horizontal scroll, gradient indicator visible |
| `640-1024px` (tablet) | Horizontal scroll if needed |
| `> 1024px` (desktop) | Full table visible |

---

## 🔍 Debugging Article Display

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Loading article..." | Missing slug_alias | Add slug_alias in database |
| Raw HTML in content | Markdown not processed | Check ReactMarkdown component |
| Missing cultural tooltips | Term not in database | Add term to srangam_cultural_terms |
| Table not styling | Wrong HTML structure | Ensure proper markdown table syntax |
| Hindi font wrong | Script font not applied | Check `getScriptFont()` in cells |

### Console Debugging

```javascript
// Check article content structure
const article = await supabase
  .from('srangam_articles')
  .select('*')
  .eq('slug_alias', 'baba-ala-singh-patiala')
  .single();

console.log('Content keys:', Object.keys(article.data.content));
console.log('Has Hindi:', 'hi' in article.data.content);
```

---

## 📚 Related Documentation

- [Current Status](./CURRENT_STATUS.md) - Overall platform status
- [Article Status](./ARTICLE_STATUS.md) - Individual article tracking
- [Import Workflow](./IMPORT_WORKFLOW.md) - Markdown import process
- [Cross-Reference System](./architecture/CROSS_REFERENCE_SYSTEM.md) - How articles connect

---

**Maintained By**: Srangam Development Team  
**Last Reviewed**: 2025-12-28

---

## Phase AR.1–AR.3 — Article Rendering Contract (2026-05-29)

Surgical healing of `src/components/articles/enhanced/ProfessionalTextFormatter.tsx`.
Each phase ships and reverts independently. No backend, edge, schema, or route changes.

### AR.1 — Single-pass rendering (P0 fix)

The body is parsed by **exactly one** `<ReactMarkdown>` instance. Cultural-term
tokens `{{cultural:term}}` are resolved inside leaf renderers via
`resolveCulturalTokens`, which walks `React.Children` and only replaces tokens
when the child is a `string`. Pre-rendered React elements pass through untouched;
their own renderer (if any) handles tokens inside their children.

Renderers that resolve tokens: `p`, `li`, `blockquote`, `strong`, `em`, `h1`,
`td`, `th`, plus the inner text span of `h2` / `h3` (never the §/◆ icon span).

**The `code` renderer deliberately does not resolve tokens.**
`src/lib/culturalTermEnhancer.ts` protects HTML and markdown tables but does
not skip fenced code/mermaid blocks, so a stray token may land inside a
fence; leaving it as literal text inside `<code>` is the correct fallback
and keeps the block structurally intact.

**Do not** re-introduce the previous line-split rendering — it tore tables,
mermaid, blockquotes, and nested lists across separate ReactMarkdown parses.

### AR.2 — Drop cap scoped to the opening paragraph

`enableDropCap` adds the `article-dropcap` class to the outer container only.
The styling lives in `src/index.css` under
`.article-content.article-dropcap > p:first-of-type::first-letter`. Never
re-attach `first-letter:*` Tailwind utilities to the `p` renderer
(`::first-letter` is per-block, so every paragraph would render with the
giant initial — the bug we fixed).

### AR.3 — Whitespace, anchors, log hygiene

- `getText()` only collapses `\n{3,}` → `\n\n`. Per-line leading-whitespace
  stripping is forbidden (it flattens nested lists & corrupts fenced code).
- Heading anchor ids come from `slugifyHeading()` in `src/lib/headingSlug.ts`,
  used by **both** the formatter (`h1`/`h2`/`h3` `id={...}`) and
  `StickyTableOfContents.extractTableOfContents`. If these two diverge, TOC
  clicks silently no-op (`getElementById` returns `null`).
- `[TableExtraction]` console output is gated by `import.meta.env.DEV`.

### Frozen baseline

Prior baseline (line-split rendering, per-paragraph drop cap, line-leading
whitespace stripping, slug forks, production table logs) is frozen as
"pre-AR.1" — do not restore any of those behaviours.
