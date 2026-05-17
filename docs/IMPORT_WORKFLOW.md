# Markdown Import Workflow

**Last Updated**: 2025-11-09  
**Status**: Fully operational with AI tag generation

---

## 📋 **Overview**

The markdown import system converts academic articles from Markdown format into structured database entries with automatic metadata extraction, AI-powered tagging, cultural term detection, and cross-reference generation.

---

## 🎯 **User Workflow**

### **Step 1: Navigate to Import Page**
- URL: `/admin/import`
- Access via: Admin dashboard (future) or direct navigation

### **Step 2: Upload Markdown Content**

**Option A: File Upload**
1. Click "Upload Markdown" card
2. Select `.md` or `.markdown` file
3. UI displays file name badge
4. Metadata auto-extracts and displays

**Option B: Paste Markdown**
1. Paste markdown content directly into textarea
2. Metadata auto-extracts and displays

### **Step 3: Review Extracted Metadata**

The UI automatically displays:
- **Title**: From frontmatter `title` field
- **Author**: From frontmatter `author` field (defaults to "NF Team")
- **Date**: From frontmatter `date` field
- **Theme**: From frontmatter `theme` field (select from dropdown)
- **Tags**: From frontmatter `tags` field
  - If empty: Shows "AI will generate them during import"
  - If present: Shows tags as badges

### **Step 4: Generate Frontmatter (if missing)**

If markdown doesn't have frontmatter:
1. Alert appears: "Missing Frontmatter"
2. Click "Generate Frontmatter" button
3. Template frontmatter is added with:
   - Title extracted from first heading
   - Slug auto-generated from title
   - Default author, date, theme
   - Empty tags array (AI will populate)

**Generated Template**:
```yaml
---
title: "Article Title Goes Here"
author: "NF Research Team"
date: 2025-11-09
theme: "Ancient India"
tags: []
slug: "article-title-goes-here"
---
```

### **Step 5: Configure Import Options**

**Checkbox Options**:
- ✅ **Auto-detect cultural terms** (recommended)
  - Extracts Sanskrit/Pali/Tamil terms from content
  - Saves to `srangam_cultural_terms` table
  
- ✅ **Save markdown source** (recommended)
  - Preserves original markdown in `srangam_markdown_sources`
  - Enables re-export and version control
  
- ✅ **Overwrite if exists** (use for re-imports)
  - If slug exists: updates article instead of throwing error
  - Use when re-importing articles with improvements

**Chapter Assignment** (optional):
- Select book chapter from dropdown
- Assign sequence number within chapter
- Links article to `srangam_book_chapters` table

### **Step 6: Import Article**

1. Click "Import Article to Database" button
2. Progress steps display:
   - Parsing frontmatter
   - Converting markdown to HTML
   - Extracting cultural terms
   - Creating bibliography entries
   - Inserting into database
   - Linking to chapter

3. Success toast shows:
   - Article slug
   - Word count
   - Cultural terms (extracted + created)
   - Cross-references created
   - AI-generated tags (if applicable)
   - Read time

---

## 🔧 **Backend Pipeline**

### **Architecture Overview**

```
User Upload → Edge Function → Database Updates
     ↓
Markdown File
     ↓
Parse Frontmatter (YAML) ──→ Extract Metadata
     ↓
Convert MD → HTML (marked.js)
     ↓
Calculate Word Count & Read Time
     ↓
Extract Cultural Terms (regex) ──→ Validate & Filter
     ↓
Extract Citations (MLA9 format)
     ↓
Generate Slug (or use frontmatter slug)
     ↓
Check for Duplicate Slug ──→ [If exists & overwrite=false] → 409 Error
     ↓                        [If exists & overwrite=true] → UPDATE
     ↓                        [If new] → INSERT
     ↓
AI Tag Generation (if tags empty) ──→ Call generate-article-tags edge function
     ↓
Save Article to srangam_articles
     ↓
Save Markdown Source to srangam_markdown_sources
     ↓
Link to Chapter (if assigned) → srangam_article_chapters
     ↓
Process Cultural Terms ──→ [For each term]
     ↓                           ↓
     ├─→ [Term exists] → Increment usage_count
     └─→ [New term] → INSERT with usage_count=1
     ↓
Generate Cross-References ──→ Query existing articles
     ↓                           ↓
     ├─→ Tag Similarity (shared tags ≥ 2) → Create thematic reference
     ├─→ Theme Matching (same theme) → Create same_theme reference
     └─→ Explicit Citation (see: slug) → Create explicit_citation reference
     ↓
Bulk Insert Cross-References
     ↓
Return Success Response with Stats
```

---

## 📊 **Edge Function Details**

### **Endpoint**
```
POST https://[PROJECT_ID].supabase.co/functions/v1/markdown-to-article-import
```

### **Request Body**
```typescript
{
  markdownContent: string;      // Full markdown file content
  overwriteExisting?: boolean;  // Default: false
  assignToChapter?: string;     // Chapter ID (e.g., "vol1-ch1-deep-time")
  sequenceNumber?: number;      // Position in chapter (e.g., 1, 2, 3)
}
```

### **Response**
```typescript
{
  success: boolean;
  articleId?: string;           // UUID of created/updated article
  slug?: string;                // Article slug
  stats?: {
    wordCount: number;          // Total words in article
    termsExtracted: number;     // Cultural terms found
    termsMatched?: number;      // Existing terms incremented
    termsCreated?: number;      // New terms created
    citationsCreated: number;   // Bibliography entries
    readTimeMinutes: number;    // Estimated read time
    crossReferencesCreated?: number;  // Cross-refs created
    aiGeneratedTags?: boolean;  // Whether AI generated tags
    tagsCount?: number;         // Number of tags assigned
  };
  error?: string;               // Error message if failed
}
```

---

## 🧩 **Key Components**

### **1. YAML Frontmatter Parsing**

**Location**: `supabase/functions/markdown-to-article-import/index.ts` (lines 53-67)

**Pattern**:
```regex
/^---\s*\n([\s\S]*?)\n---/
```

**Handles**:
- Quoted strings with special characters (`"Ashoka–Mauryan Legacy"`)
- Diacritics (`Śāntideva`, `Nāgārjuna`)
- Arrays (`tags: ["tag1", "tag2"]`)
- Nested JSONB (`title: { en: "...", sa: "..." }`)

**Example Input**:
```yaml
---
title: "Reassessing Ashoka's Legacy"
author: "Dr. Jane Smith"
date: 2025-11-01
theme: "Ancient India"
tags: ["Buddhism", "Mauryan Empire", "Epigraphy"]
slug: "reassessing-ashoka-s-legacy"
---
```

**Parsed Output**:
```javascript
{
  title: "Reassessing Ashoka's Legacy",
  author: "Dr. Jane Smith",
  date: "2025-11-01",
  theme: "Ancient India",
  tags: ["Buddhism", "Mauryan Empire", "Epigraphy"],
  slug: "reassessing-ashoka-s-legacy"
}
```

---

### **2. Cultural Terms Extraction**

**Location**: `supabase/functions/markdown-to-article-import/index.ts` (lines 113-129)

**Regex Patterns**:
```typescript
// Pattern 1: Sanskrit diacritics
/\b\w*[āīūṛṝḷḹēōṃḥśṣṭḍṇ]\w*\b/gi

// Pattern 2: Devanagari script
/[\u0900-\u097F]+/g

// Pattern 3: Italic text (often used for Sanskrit/foreign terms)
/_([^_]+)_|\*([^*]+)\*/g  // Matches _term_ or *term*
```

**Validation Filters**:
- ❌ URLs: `/^https?:\/\//`
- ❌ Markdown syntax: `/[\[\]\(\)#`]/`
- ❌ Too long: `length > 50`
- ❌ Too short: `length < 3`
- ❌ Pure numbers: `/^\d+$/`

**Example**:
```markdown
The _stūpa_ at Sanchi represents Mauryan _Buddhist_ architecture.
Ashoka's _dhamma_ (धम्म) promoted _ahiṃsā_ across the empire.
```

**Extracted Terms**:
```javascript
["stūpa", "Buddhist", "dhamma", "धम्म", "ahiṃsā"]
```

**Database Storage**:
```sql
INSERT INTO srangam_cultural_terms (term, display_term, module, usage_count)
VALUES ('stūpa', 'stūpa', 'srangam', 1)
ON CONFLICT (term) DO UPDATE SET usage_count = usage_count + 1;
```

---

### **3. AI Tag Generation**

**Location**: `supabase/functions/markdown-to-article-import/index.ts` (lines ~244-260)

**Trigger Condition**:
```typescript
if (!frontmatter.tags || frontmatter.tags.length === 0) {
  // Call AI tag generation
}
```

**Edge Function Call**:
```typescript
const { data: aiTagsData, error: aiError } = await supabase.functions.invoke(
  'generate-article-tags',
  {
    body: {
      title: titleText,
      theme: frontmatter.theme || 'Ancient India',
      culturalTerms: culturalTerms.slice(0, 20),
      contentPreview: content.substring(0, 3000),
    }
  }
);

tags = aiTagsData.tags || [];
```

**See**: [AI_TAG_GENERATION.md](./AI_TAG_GENERATION.md) for full details

---

### **4. Cross-Reference Detection**

**Location**: `supabase/functions/markdown-to-article-import/index.ts` (lines ~470-580)

**Detection Methods**:

#### **A) Tag Similarity (Thematic)**
```typescript
const sharedTags = tags.filter(tag => other.tags?.includes(tag));

if (sharedTags.length >= 2) {
  const strength = Math.min(10, sharedTags.length * 2);
  
  crossRefsToCreate.push({
    source_article_id: articleId,
    target_article_id: other.id,
    reference_type: 'thematic',
    strength,
    bidirectional: true,
    context_description: {
      sharedTags,
      reason: `Shares ${sharedTags.length} topic tags: ${sharedTags.join(', ')}`,
      detectionMethod: 'tag_similarity'
    }
  });
}
```

**Example**:
- Article A: `["Buddhism", "Mauryan Empire", "Ashoka"]`
- Article B: `["Buddhism", "Mauryan Empire", "Kalinga"]`
- Shared tags: 2 → Strength: 4
- Creates bidirectional thematic reference

#### **B) Theme Matching**
```typescript
if (other.theme === theme && theme) {
  crossRefsToCreate.push({
    reference_type: 'same_theme',
    strength: 7,
    bidirectional: true,
    context_description: {
      theme,
      reason: `Both articles explore the theme: ${theme}`,
      detectionMethod: 'theme_matching'
    }
  });
}
```

**Example**:
- Article A: `theme: "Ancient India"`
- Article B: `theme: "Ancient India"`
- Creates bidirectional same_theme reference (strength: 7)

#### **C) Explicit Citation**
```typescript
const contentText = typeof content === 'string' ? content : content?.en;
const explicitRefs = contentText.match(/\(see:?\s+([a-z0-9-]+)\)/gi) || [];

for (const ref of explicitRefs) {
  const targetSlug = ref.match(/\(see:?\s+([a-z0-9-]+)\)/i)[1];
  const targetArticle = existingArticles.find(a => a.slug === targetSlug);
  
  if (targetArticle) {
    crossRefsToCreate.push({
      reference_type: 'explicit_citation',
      strength: 10,
      bidirectional: false,  // One-way citation
      context_description: {
        citationText: ref,
        reason: `Explicitly cited in text: "${ref}"`,
        detectionMethod: 'text_pattern_matching'
      }
    });
  }
}
```

**Example Markdown**:
```markdown
Ashoka's conversion to Buddhism (see: ashoka-buddhist-conversion) 
marked a turning point in Mauryan policy.
```

**Result**:
- Source: Current article
- Target: `ashoka-buddhist-conversion`
- Type: `explicit_citation`
- Strength: 10 (highest confidence)
- Bidirectional: false (citation is one-way)

---

## 🎯 **Expected Results**

### **After Importing 1 Article** (with empty tags)
```json
{
  "success": true,
  "articleId": "uuid-123",
  "slug": "reassessing-ashoka-s-legacy",
  "stats": {
    "wordCount": 2500,
    "termsExtracted": 35,
    "termsMatched": 0,      // First article, no existing terms
    "termsCreated": 35,
    "citationsCreated": 8,
    "readTimeMinutes": 12,
    "crossReferencesCreated": 0,  // No other articles to reference
    "aiGeneratedTags": true,
    "tagsCount": 6
  }
}
```

### **After Importing 4th Article** (with AI tags)
```json
{
  "success": true,
  "articleId": "uuid-456",
  "slug": "har-har-hari-hari",
  "stats": {
    "wordCount": 1800,
    "termsExtracted": 28,
    "termsMatched": 12,     // 12 terms already existed
    "termsCreated": 16,     // 16 new terms
    "citationsCreated": 5,
    "readTimeMinutes": 9,
    "crossReferencesCreated": 11,  // Links to 3 other articles
    "aiGeneratedTags": true,
    "tagsCount": 7
  }
}
```

**Cross-References Breakdown**:
- 3 × `same_theme` (shares "Ancient India" theme with 3 articles)
- 6 × `thematic` (shared tags with 3 articles, 2 tags each = 2 refs per article)
- 2 × `explicit_citation` (article explicitly cites 2 other articles)

---

## 🐛 **Common Issues & Solutions**

### **Issue**: "409 Conflict - Slug already exists"
**Cause**: Article with same slug exists in database  
**Solution**: Check "Overwrite if exists" checkbox before importing

### **Issue**: Tags show as `[]` in metadata
**Cause**: Frontmatter has empty tags array  
**Solution**: This is expected! UI shows "AI will generate them during import"

### **Issue**: No cultural terms extracted
**Cause**: Validation filtering is too aggressive  
**Solution**: Check edge function logs, adjust regex patterns if needed

### **Issue**: Cross-references not created
**Cause**: No shared tags or themes between articles  
**Solution**: Ensure articles have AI-generated tags, verify theme matching

### **Issue**: Markdown source not saved
**Cause**: Unique constraint violation on `article_id`  
**Solution**: Already fixed! Now uses `ON CONFLICT (article_id) DO UPDATE`

---

## 📚 **Related Documentation**
- [AI Tag Generation System](./AI_TAG_GENERATION.md)
- [Current Status](./CURRENT_STATUS.md)
- [Cross-Reference System](./CROSS_REFERENCE_SYSTEM.md) *(to be created)*

---

## Re-importing Articles Affected by ChatGPT-Export Artefacts (Phase H)

If an article was imported before Phase H and contains box-glyphs (□),
unrendered `flowchart TD …` text, or visible `citeturn…` tokens, re-run
the importer with the **same source markdown** and `overwrite=true`. The
new pipeline will sanitise PUA chars, strip cite placeholders, and
auto-fence mermaid diagrams.

Procedure:

1. Open Admin → Markdown Import.
2. Paste or upload the original `.md` source.
3. Tick **Overwrite existing**.
4. Submit. The pipeline runs `sanitizeEscapes → stripExportArtifacts →
   normalizeDiagrams` before `marked.parse`.
5. Reload the article page; diagrams now render through `<MermaidBlock>`.

### Authoring Mermaid Diagrams

Wrap diagrams in a fenced code block tagged `mermaid`:

    ```mermaid
    flowchart TD
      A[Start] --> B[Process]
      B --> C[End]
    ```

Supported diagram types: `flowchart`, `graph`, `sequenceDiagram`,
`classDiagram`, `stateDiagram(-v2)`, `erDiagram`, `journey`, `gantt`,
`pie`, `mindmap`, `timeline`, `quadrantChart`, `xychart-beta`.

Use `<br/>` (not `\n`) for line breaks inside node labels.

### ChatGPT / Deep-Research Source Caveats

Sources copied directly from ChatGPT may arrive **without** the ` ``` `
fences around diagrams. The Phase H pipeline auto-fences them, but you
can also restore fences manually before import for a cleaner audit trail.

## Auth Gate (Phase N)

`markdown-to-article-import`, `batch-import-from-github`, and
`scan-github-markdown` now require an admin JWT
(`_shared/auth-gate.ts → requireAdmin`). Non-admin or anonymous calls
receive 401 / 403 before any work is done.
