# Markdown Article Import Pipeline

This document describes the complete flow of importing a markdown article into the Srangam database.

## Pipeline Overview

```mermaid
flowchart TD
    A[Upload Markdown File] --> B[Extract Frontmatter YAML]
    B --> C{Valid Frontmatter?}
    C -->|No| D[Generate Template]
    D --> B
    C -->|Yes| E[Convert MD to HTML]
    E --> F[Calculate Metadata]
    F --> G[Extract Citations]
    G --> H[Extract Cultural Terms]
    H --> I{Overwrite Mode?}
    I -->|Yes| J{Article Exists?}
    J -->|Yes| K[Update Article]
    J -->|No| L[Insert Article]
    I -->|No| L
    K --> M[Save Markdown Source]
    L --> M
    M --> N[Detect Cross-References]
    N --> O[Process Cultural Terms]
    O --> P{Assign to Chapter?}
    P -->|Yes| Q[Link to Chapter]
    P -->|No| R[Return Success]
    Q --> R
    
    style A fill:#e1f5ff
    style R fill:#d4edda
    style N fill:#fff3cd
    style O fill:#fff3cd
```

## Data Flow Diagram

```mermaid
graph LR
    MD[Markdown File] --> EF[Edge Function]
    EF --> SA[srangam_articles]
    EF --> MS[srangam_markdown_sources]
    EF --> CT[srangam_cultural_terms]
    EF --> XR[srangam_cross_references]
    EF --> AC[srangam_article_chapters]
    
    style MD fill:#e1f5ff
    style EF fill:#fff3cd
    style SA fill:#d4edda
    style MS fill:#d4edda
    style CT fill:#d4edda
    style XR fill:#f8d7da
    style AC fill:#d4edda
```

## Step-by-Step Process

### 1. Frontmatter Extraction
- Parse YAML frontmatter between `---` delimiters
- Extract: title, author, date, tags, theme, slug, dek
- Validate required fields

### 2. Content Processing
- Convert markdown to HTML using `marked.js`
- Calculate word count and read time (200 words/min)
- Preserve formatting and special characters

### 3. Metadata Extraction

#### Citations
- **Inline MLA9**: `(Author, Title)`
- **Numbered**: `[[1]](url)`
- **Bibliography**: Parse `## Bibliography` section

#### Cultural Terms
- **Italics**: `*dharma*` or `_karma_`
- **Diacritics**: IAST transliteration (ā, ī, ū, ṛ, etc.)
- **Devanagari**: Unicode range `\u0900-\u097F`

### 4. Cross-Reference Detection

```mermaid
flowchart LR
    A[New Article] --> B{Compare with Existing}
    B --> C[Tag Similarity]
    B --> D[Same Theme]
    B --> E[Explicit Citations]
    C --> F[Calculate Strength]
    D --> F
    E --> F
    F --> G[Insert srangam_cross_references]
    
    style A fill:#e1f5ff
    style G fill:#d4edda
```

**Detection Methods:**
- **Tag Similarity**: 2+ shared tags = thematic link (strength: 2 × tag count)
- **Same Theme**: Exact theme match (strength: 7)
- **Explicit**: Text pattern `(see: article-slug)` (strength: 10)

### 5. Cultural Terms Processing

```mermaid
flowchart TD
    A[Extract Term] --> B{Already Exists?}
    B -->|Yes| C[Increment usage_count]
    B -->|No| D[Create New Term]
    C --> E[termsMatched++]
    D --> F[termsCreated++]
    
    style A fill:#e1f5ff
    style E fill:#d4edda
    style F fill:#fff3cd
```

### 6. Database Operations

```mermaid
sequenceDiagram
    participant UI as Admin UI
    participant EF as Edge Function
    participant DB as Supabase DB
    
    UI->>EF: POST /markdown-to-article-import
    EF->>DB: UPSERT srangam_articles
    DB-->>EF: article_id
    EF->>DB: UPSERT srangam_markdown_sources
    EF->>DB: SELECT existing articles
    DB-->>EF: articles[]
    EF->>EF: Calculate cross-references
    EF->>DB: INSERT srangam_cross_references
    loop For each cultural term
        EF->>DB: SELECT term
        alt Term exists
            EF->>DB: UPDATE usage_count++
        else New term
            EF->>DB: INSERT term
        end
    end
    EF-->>UI: Success response + stats
```

## Success Response Schema

```typescript
{
  success: true,
  articleId: "uuid",
  slug: "article-slug",
  stats: {
    wordCount: 2500,
    termsExtracted: 47,
    termsMatched: 35,
    termsCreated: 12,
    citationsCreated: 8,
    readTimeMinutes: 13,
    crossReferencesCreated: 5,
    markdownSourceSaved: true
  }
}
```

## Error Handling

```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Type?}
    B -->|YAML Parse| C[Return Frontmatter Template]
    B -->|Duplicate Slug| D[Return 409 Conflict]
    B -->|Database| E[Return 500 + Details]
    B -->|Missing Fields| F[Return 400 + Validation]
    
    style A fill:#f8d7da
    style C fill:#fff3cd
    style D fill:#fff3cd
    style E fill:#f8d7da
    style F fill:#fff3cd
```

## Performance Considerations

- **Batch Operations**: Cultural terms processed sequentially (intentional for accuracy)
- **Cross-Reference Deduplication**: Filter duplicate source+target+type combinations
- **Lazy Loading**: Markdown source saved with `upsert` (non-blocking)
- **Indexing**: Ensure indexes on `slug`, `tags`, `theme` for fast cross-reference queries

## Step 12: Bibliography Extraction & Storage (NEW - Phase 7)

```mermaid
flowchart TD
    A[Markdown Content] --> B{Has Bibliography Section?}
    B -->|Yes| C[Parse MLA9 Citations]
    B -->|No| D[Skip Bibliography]
    C --> E[Extract Author/Title/Year/Publisher]
    E --> F[Generate citation_key]
    F --> G[UPSERT srangam_bibliography_entries]
    G --> H[INSERT srangam_article_bibliography]
    
    style A fill:#e1f5ff
    style G fill:#d4edda
    style H fill:#d4edda
```

**MLA9 Parsing Rules**:
- Pattern: `Author Last, First. *Title*. Publisher, Year.`
- Citation key: `lastname_year` (e.g., `olivelle_2013`)
- Deduplicate by `citation_key` (increment `citation_count` if exists)

**Source Quality Detection**:
- Primary: Inscriptions, manuscripts, Akhbarat
- Secondary: Modern scholarship, historical analysis
- Tradition: Oral history, folklore

## Step 13: Evidence Table Data Extraction (NEW - Phase 7)

```mermaid
flowchart TD
    A[HTML Content] --> B{Has 6-Column Table?}
    B -->|Yes| C[Detect Scholarly Headers]
    C --> D{Headers Match Pattern?}
    D -->|Yes| E[Parse Table Rows]
    D -->|No| F[Skip Table]
    E --> G[Extract Date/Place/Actors/Event/Meaning/Evidence]
    G --> H[INSERT srangam_article_evidence]
    
    style A fill:#e1f5ff
    style H fill:#d4edda
```

**Scholarly Table Headers**:
- English: Date | Place | Actors | Event | Meaning | Evidence
- Hindi: तिथि | स्थान | मुख्य पात्र | घटना | महत्व | साक्ष्य-स्थिति

## Future Enhancements

1. **AI Embeddings**: Semantic similarity using Lovable AI (gemini-2.5-flash)
2. **Topic Clustering**: ML-based theme detection
3. **Citation Extraction**: NLP for complex bibliography formats
4. **Version Control**: Track markdown source changes with git-like commits
5. **Conflict Resolution**: UI for resolving duplicate slug conflicts
6. **Geocoding**: Auto-geocode place names from evidence tables
7. **Bibliography Export**: BibTeX/RIS export for citation managers
