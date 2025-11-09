# Cross-Reference System Architecture

This document describes the automatic cross-reference detection and relationship management system for Srangam articles.

## Database Schema

```mermaid
erDiagram
    srangam_articles ||--o{ srangam_cross_references : "source_article_id"
    srangam_articles ||--o{ srangam_cross_references : "target_article_id"
    
    srangam_articles {
        uuid id PK
        text slug UK
        jsonb title
        text[] tags
        text theme
        text status
        timestamp created_at
    }
    
    srangam_cross_references {
        uuid id PK
        uuid source_article_id FK
        uuid target_article_id FK
        text reference_type
        int strength
        boolean bidirectional
        jsonb context_description
        timestamp created_at
    }
```

## Reference Types

```mermaid
graph TD
    A[Cross-Reference Types] --> B[thematic]
    A --> C[same_theme]
    A --> D[explicit_citation]
    A --> E[temporal]
    A --> F[geographical]
    A --> G[author_network]
    
    B --> B1[Tag Similarity: 2+]
    C --> C1[Exact Theme Match]
    D --> D1[Text Pattern: see: slug]
    E --> E1[Same Time Period]
    F --> F1[Same Region]
    G --> G1[Same Author]
    
    style A fill:#e1f5ff
    style B fill:#d4edda
    style C fill:#d4edda
    style D fill:#fff3cd
    style E fill:#f8d7da
    style F fill:#f8d7da
    style G fill:#f8d7da
```

**Currently Implemented:**
- ✅ **thematic**: Tag similarity (2+ shared tags)
- ✅ **same_theme**: Exact theme match
- ✅ **explicit_citation**: `(see: article-slug)` pattern

**Future Implementation:**
- 🔜 **temporal**: Articles covering same time period
- 🔜 **geographical**: Articles about same region
- 🔜 **author_network**: Same author or research team

## Detection Algorithm

### Tag Similarity Scoring

```mermaid
flowchart TD
    A[Compare Tags] --> B{Count Shared Tags}
    B --> C{Shared >= 2?}
    C -->|Yes| D[Calculate Strength]
    C -->|No| E[Skip]
    D --> F[Strength = min 10, count × 2]
    F --> G[Create Reference]
    
    style A fill:#e1f5ff
    style G fill:#d4edda
    style E fill:#f8d7da
```

**Algorithm:**
```typescript
const sharedTags = articleTags.filter(tag => otherTags.includes(tag));
if (sharedTags.length >= 2) {
  const strength = Math.min(10, sharedTags.length * 2);
  // Create cross-reference
}
```

### Theme Matching

```mermaid
flowchart LR
    A[Article Theme] --> B{Exact Match?}
    B -->|Yes| C[Strength = 7]
    B -->|No| D[Skip]
    C --> E[Create Reference]
    
    style A fill:#e1f5ff
    style E fill:#d4edda
    style D fill:#f8d7da
```

### Explicit Citation Detection

```mermaid
flowchart TD
    A[Scan Content] --> B[Regex: see: slug]
    B --> C{Match Found?}
    C -->|Yes| D{Target Exists?}
    D -->|Yes| E[Strength = 10]
    D -->|No| F[Warn: Unknown Slug]
    C -->|No| G[Skip]
    E --> H[Create Unidirectional]
    
    style A fill:#e1f5ff
    style H fill:#d4edda
    style F fill:#fff3cd
    style G fill:#f8d7da
```

**Pattern:** `/\(see:?\s+([a-z0-9-]+)\)/gi`

**Examples:**
- `(see: vedic-ritual-reciprocity)`
- `(See: har-har-hari-hari)`
- `(see also: ancient-india-timeline)`

## Strength Scale

```mermaid
graph LR
    A[1-3: Weak] --> B[4-6: Moderate]
    B --> C[7-9: Strong]
    C --> D[10: Explicit]
    
    style A fill:#f8d7da
    style B fill:#fff3cd
    style C fill:#d4edda
    style D fill:#e1f5ff
```

**Strength Guidelines:**
- **10**: Explicit citation (manually linked)
- **7-9**: Same theme or 4+ shared tags
- **4-6**: 2-3 shared tags
- **1-3**: Weak similarity (future: AI embeddings)

## Bidirectional vs Unidirectional

```mermaid
graph LR
    A[Article A] -->|bidirectional: true| B[Article B]
    B -->|auto-created| A
    
    C[Article C] -->|bidirectional: false| D[Article D]
    
    style A fill:#d4edda
    style B fill:#d4edda
    style C fill:#e1f5ff
    style D fill:#fff3cd
```

**Bidirectional** (automatic reverse link):
- Tag similarity
- Same theme
- Temporal/geographical clustering

**Unidirectional** (one-way reference):
- Explicit citations
- "See also" suggestions
- User-curated recommendations

## Context Metadata

Each cross-reference includes a `context_description` JSONB field:

```json
{
  "sharedTags": ["vedic", "ritual", "reciprocity"],
  "reason": "Shares 3 topic tags: vedic, ritual, reciprocity",
  "detectedAt": "2025-11-09T14:23:45Z",
  "detectionMethod": "tag_similarity"
}
```

**Fields:**
- `sharedTags`: Array of overlapping tags
- `theme`: Common theme identifier
- `citationText`: Original citation pattern
- `reason`: Human-readable explanation
- `detectedAt`: ISO timestamp
- `detectionMethod`: Algorithm identifier

## Network Visualization

```mermaid
graph TD
    A[Har Har Hari Hari] -->|thematic: 6| B[Vedic Reciprocity]
    A -->|same_theme: 7| C[Ancient Rituals]
    B -->|explicit: 10| D[Soma Ceremony]
    C -->|thematic: 4| D
    D -->|thematic: 6| E[Fire Worship]
    
    style A fill:#e1f5ff
    style B fill:#d4edda
    style C fill:#d4edda
    style D fill:#fff3cd
    style E fill:#fff3cd
```

## UI Component Flow

```mermaid
sequenceDiagram
    participant U as User
    participant P as Article Page
    participant C as ArticleCrossReferences
    participant Q as React Query
    participant S as Supabase
    
    U->>P: View article
    P->>C: Render <ArticleCrossReferences>
    C->>Q: useQuery(['cross-references', id])
    Q->>S: SELECT with JOIN
    S-->>Q: crossRefs + target articles
    Q-->>C: Cached data
    C->>C: Group by reference_type
    C-->>P: Render grouped links
    U->>C: Click related article
    C->>P: Navigate to new article
```

## Performance Optimization

### Indexing Strategy

```sql
-- Composite index for fast cross-reference lookups
CREATE INDEX idx_xref_source_strength 
ON srangam_cross_references(source_article_id, strength DESC);

-- GIN index for tag similarity
CREATE INDEX idx_articles_tags 
ON srangam_articles USING GIN(tags);

-- B-tree index for theme filtering
CREATE INDEX idx_articles_theme 
ON srangam_articles(theme, status);
```

### Query Optimization

```sql
-- Efficient cross-reference query with JOIN
SELECT 
  sr.*,
  sa.slug, sa.title, sa.theme, sa.read_time_minutes
FROM srangam_cross_references sr
JOIN srangam_articles sa ON sr.target_article_id = sa.id
WHERE sr.source_article_id = $1
ORDER BY sr.strength DESC
LIMIT 20;
```

## Future Enhancements

### 1. AI-Powered Semantic Similarity

```mermaid
flowchart LR
    A[Article Content] --> B[Lovable AI Embeddings]
    B --> C[gemini-2.5-flash]
    C --> D[Vector Storage]
    D --> E[Cosine Similarity]
    E --> F[Weak Cross-Refs: 1-3]
    
    style A fill:#e1f5ff
    style C fill:#fff3cd
    style F fill:#d4edda
```

**Implementation:**
- Generate embeddings for article content
- Store in vector database (pgvector extension)
- Calculate cosine similarity > 0.7 threshold
- Create weak cross-references (strength: 1-3)

### 2. Topic Clustering

```mermaid
graph TD
    A[All Articles] --> B[K-Means Clustering]
    B --> C[Cluster 1: Vedic]
    B --> D[Cluster 2: Maritime]
    B --> E[Cluster 3: Epigraphy]
    
    C --> F[Auto-generate Theme Tags]
    D --> F
    E --> F
    
    style A fill:#e1f5ff
    style F fill:#d4edda
```

### 3. Manual Curation Tool

```mermaid
sequenceDiagram
    participant A as Admin
    participant UI as CrossReferenceManager
    participant DB as Database
    
    A->>UI: Search for two articles
    UI->>DB: Query by title/slug
    DB-->>UI: Matching articles
    A->>UI: Create custom link
    UI->>UI: Validate strength (1-10)
    UI->>DB: INSERT cross_reference
    DB-->>UI: Success
    UI->>A: Show updated network
```

### 4. Network Graph Visualization

**Tech Stack:**
- D3.js force-directed graph
- Node size = article importance (read count)
- Edge thickness = cross-reference strength
- Color = theme category
- Interactive zoom/pan
- Click to navigate

## Maintenance & Monitoring

### Health Checks

```sql
-- Orphaned cross-references (deleted articles)
SELECT COUNT(*) 
FROM srangam_cross_references sr
LEFT JOIN srangam_articles sa_source ON sr.source_article_id = sa_source.id
LEFT JOIN srangam_articles sa_target ON sr.target_article_id = sa_target.id
WHERE sa_source.id IS NULL OR sa_target.id IS NULL;

-- Self-references (should be 0)
SELECT COUNT(*) 
FROM srangam_cross_references
WHERE source_article_id = target_article_id;

-- Strength distribution
SELECT 
  reference_type,
  AVG(strength)::numeric(10,2) as avg_strength,
  COUNT(*) as count
FROM srangam_cross_references
GROUP BY reference_type;
```

### Cleanup Tasks

```sql
-- Remove weak auto-generated refs (strength < 4)
DELETE FROM srangam_cross_references
WHERE strength < 4 
AND created_at < NOW() - INTERVAL '30 days';

-- Recalculate tag similarity after article edits
-- (Trigger-based or scheduled job)
```
