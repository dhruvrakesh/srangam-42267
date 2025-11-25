# Admin Dashboard Architecture

## Table of Contents
- [System Overview](#system-overview)
- [Component Hierarchy](#component-hierarchy)
- [Data Flow](#data-flow)
- [Backend Integration](#backend-integration)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)

## System Overview

The Srangam Admin Dashboard is a comprehensive content management system for scholarly articles about South Asian history and culture. It provides AI-powered content enrichment, network visualization, and multilingual content management.

### Architecture Layers

```mermaid
graph TB
    subgraph "Frontend Layer - React + TypeScript + Vite"
        A[Public Routes] --> B[Home Page]
        A --> C[Article Display]
        A --> D[Oceanic Router]
        
        E[Admin Routes] --> F[Dashboard]
        E --> G[Markdown Import]
        E --> H[Tag Management]
        E --> I[Cultural Terms Explorer]
        E --> J[Import Analytics]
        E --> K[Cross-Reference Browser]
    end
    
    subgraph "Backend Layer - Lovable Cloud Supabase"
        L[(srangam_articles)] --> M[(srangam_tags)]
        L --> N[(srangam_cross_references)]
        L --> O[(srangam_cultural_terms)]
        
        M --> P[Tag Registry<br/>Usage Tracking]
        N --> Q[Network Graph<br/>Strength Scoring]
        O --> R[Term Database<br/>Translation Index]
    end
    
    subgraph "Edge Functions - Deno Runtime"
        S[markdown-to-article-import] --> T[generate-article-tags]
        T --> U[OpenAI API]
        U --> V[GPT-4o-mini<br/>Temperature 0.3]
        
        S --> W[analyze-tag-relationships]
        S --> X[Extract Cultural Terms<br/>Regex Pattern Matching]
    end
    
    G -->|POST /functions/v1/| S
    S -->|Creates| L
    T -->|Generates| M
    W -->|Creates| N
    X -->|Extracts| O
    
    H -->|Queries| M
    I -->|Queries| O
    J -->|Analyzes| L
    K -->|Visualizes| N
    
    style F fill:#81c784
    style G fill:#81c784
    style H fill:#81c784
    style I fill:#81c784
    style J fill:#81c784
    style K fill:#81c784
    style U fill:#00acc1,color:#fff
    style V fill:#4285f4,color:#fff
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Component-based UI |
| **Build Tool** | Vite | Fast development & bundling |
| **UI Framework** | Shadcn/UI + Radix UI | Accessible components |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Charts** | Recharts | Data visualization |
| **Network Viz** | react-force-graph-2d | Interactive graphs |
| **Backend** | Supabase PostgreSQL | Database & auth |
| **Edge Functions** | Deno Runtime | Serverless logic |
| **AI** | OpenAI API | GPT-4o-mini integration |

## Component Hierarchy

```mermaid
graph TB
    A[AdminLayout] --> B[Sidebar Navigation]
    A --> C[Content Outlet]
    A --> D[ErrorBoundary]
    
    C --> E[Dashboard]
    C --> F[MarkdownImport]
    C --> G[TagManagement]
    C --> H[CrossReferencesBrowser]
    C --> I[CulturalTermsExplorer]
    C --> J[ImportAnalytics]
    
    E --> E1[StatsCards]
    E --> E2[RecentImportsTable]
    E --> E3[TagGrowthChart]
    
    F --> F1[FileUpload]
    F --> F2[MarkdownPreview]
    F --> F3[ProcessButton]
    
    G --> G1[TagTable]
    G --> G2[EditDialog]
    G --> G3[DeleteDialog]
    G --> G4[CategoryPieChart]
    G --> G5[Top20BarChart]
    
    H --> H1[ForceGraph2D]
    H --> H2[ReferenceListTable]
    H --> H3[ArticleDetailSheet]
    H --> H4[FilterControls]
    
    I --> I1[TermsTable]
    I --> I2[UsageBarChart]
    I --> I3[ModulePieChart]
    
    J --> J1[ImportTimeline]
    J --> J2[ReadTimeDistribution]
    J --> J3[TopAuthorsTable]
    
    style A fill:#4caf50,color:#fff
    style E fill:#81c784
    style F fill:#81c784
    style G fill:#81c784
    style H fill:#81c784
    style I fill:#81c784
    style J fill:#81c784
```

### Routing Structure

```typescript
// Admin routes in App.tsx
/admin
  ├── /admin (Dashboard)
  ├── /admin/import (Markdown Import)
  ├── /admin/tags (Tag Management)
  ├── /admin/cross-references (Network Browser)
  ├── /admin/cultural-terms (Terms Explorer)
  └── /admin/analytics (Import Analytics)
```

## Data Flow

### Markdown Import Pipeline

```mermaid
sequenceDiagram
    participant User
    participant UI as Admin UI
    participant Edge as markdown-to-article-import
    participant AI as Lovable AI
    participant TagEngine as generate-article-tags
    participant DB as Supabase Database
    
    User->>UI: Upload markdown file
    UI->>Edge: POST /functions/v1/markdown-to-article-import
    
    rect rgba(100, 181, 246, 0.1)
        Note over Edge: Phase 1: Parse & Store
        Edge->>Edge: Extract frontmatter metadata
        Edge->>Edge: Parse markdown to HTML
        Edge->>DB: INSERT INTO srangam_articles
        DB-->>Edge: Return article_id
    end
    
    rect rgba(255, 183, 77, 0.1)
        Note over Edge,TagEngine: Phase 2: AI Tag Generation
        Edge->>TagEngine: Invoke with article metadata
        TagEngine->>DB: Fetch existing tags (top 100)
        DB-->>TagEngine: Return tag list
        
        TagEngine->>AI: POST /v1/chat/completions
        Note over AI: Model: google/gemini-2.5-flash<br/>Temperature: 0.3
        AI-->>TagEngine: Return 5-8 tags + reasoning
        
        TagEngine->>TagEngine: Normalize tags (fuzzy match)
        TagEngine->>DB: UPDATE article SET tags
        TagEngine->>DB: UPSERT srangam_tags
        TagEngine-->>Edge: Return generated tags
    end
    
    rect rgba(129, 199, 132, 0.1)
        Note over Edge: Phase 3: Extract Cultural Terms
        Edge->>Edge: Regex pattern matching
        Edge->>DB: INSERT INTO srangam_cultural_terms
    end
    
    rect rgba(186, 104, 200, 0.1)
        Note over Edge: Phase 4: Analyze Cross-References
        Edge->>Edge: Compare with all articles
        Edge->>Edge: Calculate similarity scores
        Edge->>DB: INSERT INTO srangam_cross_references
    end
    
    Edge-->>UI: Success response
    UI-->>User: Show success toast + article preview
```

### Tag Generation Workflow

```mermaid
graph TB
    A[New Article Imported] --> B{Already has tags?}
    B -->|Yes| C[Skip tag generation]
    B -->|No| D[Call generate-article-tags]
    
    D --> E[Fetch existing tags<br/>Top 100 by usage_count]
    E --> F[Build AI prompt]
    
    F --> G[System Prompt:<br/>Expert taxonomy rules]
    F --> H[User Prompt:<br/>Article metadata]
    
    G --> I[OpenAI API]
    H --> I
    
    I --> J[GPT-4o-mini<br/>Temperature: 0.3]
    
    J --> K[Parse JSON response:<br/>tags + reasoning]
    
    K --> L{Normalize each tag}
    
    L --> M{Exact match?}
    M -->|Yes| N[Use existing tag]
    M -->|No| O{Fuzzy match?}
    
    O -->|Yes<br/>lowercase/substring| P[Use close variant]
    O -->|No| Q[Create new tag]
    
    N --> R[Final tag list<br/>5-8 unique tags]
    P --> R
    Q --> R
    
    R --> S[Update article.tags array]
    R --> T[UPSERT srangam_tags<br/>Increment usage_count]
    
    style I fill:#00acc1,color:#fff
    style J fill:#4285f4,color:#fff
    style R fill:#4caf50,color:#fff
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App as React App
    participant Supabase as Supabase Auth
    participant DB as Database
    
    User->>App: Navigate to /admin
    App->>Supabase: Check session
    
    alt Not authenticated
        Supabase-->>App: No session
        App->>User: Redirect to /login
        User->>App: Submit credentials
        App->>Supabase: signInWithPassword()
        Supabase-->>App: Return session
        App->>User: Redirect to /admin
    else Already authenticated
        Supabase-->>App: Return session
        App->>DB: Fetch admin data (RLS enforced)
        DB-->>App: Return data
        App->>User: Display dashboard
    end
```

## Backend Integration

### Edge Functions

#### 1. markdown-to-article-import

**Purpose**: Process uploaded markdown files and create article records with enrichment

**Endpoint**: `POST /functions/v1/markdown-to-article-import`

**Request Body**:
```typescript
{
  markdownContent: string;
  fileName: string;
  autoGenerateTags?: boolean; // default: true
}
```

**Response**:
```typescript
{
  success: boolean;
  article_id: string;
  slug: string;
  stats: {
    tags_generated: number;
    cultural_terms_extracted: number;
    cross_references_created: number;
  }
}
```

**Process**:
1. Parse frontmatter (YAML)
2. Convert markdown to HTML
3. Insert article record
4. Invoke tag generation (if enabled)
5. Extract cultural terms via regex
6. Analyze cross-references
7. Return summary

---

#### 2. generate-article-tags

**Purpose**: Generate 5-8 semantic tags using AI

**Invoked by**: `markdown-to-article-import`

**Parameters**:
```typescript
{
  title: string;
  theme: string;
  culturalTerms: string[];
  contentPreview: string;
}
```

**AI Model**: OpenAI GPT-4o-mini

**Temperature**: 0.3 (for consistency)

**Response**:
```typescript
{
  success: boolean;
  tags: string[];
  confidence: number;
  message: string;
}
```

---

#### 3. analyze-tag-relationships

**Purpose**: Compute tag co-occurrence matrix for smart suggestions

**Endpoint**: `POST /functions/v1/analyze-tag-relationships`

**Process**:
1. Query all articles with tags
2. Calculate co-occurrence scores
3. Update `related_tags` field in srangam_tags
4. Return statistics

**Scheduled**: Run weekly or after bulk imports

## Security Architecture

### Row Level Security (RLS) Policies

#### srangam_articles

```sql
-- Public read access for published articles
CREATE POLICY "Public read published articles"
ON srangam_articles FOR SELECT
USING (status = 'published');

-- Authenticated users can manage all articles
CREATE POLICY "Authenticated manage articles"
ON srangam_articles FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

#### srangam_tags

```sql
-- Everyone can view tags
CREATE POLICY "Tags are viewable by everyone"
ON srangam_tags FOR SELECT
USING (true);

-- Authenticated users can insert/update tags
CREATE POLICY "Authenticated users can insert tags"
ON srangam_tags FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags"
ON srangam_tags FOR UPDATE
USING (true);
```

#### srangam_cross_references

```sql
-- Public read access
CREATE POLICY "Public read cross references"
ON srangam_cross_references FOR SELECT
USING (true);

-- Authenticated users can manage
CREATE POLICY "Authenticated manage cross references"
ON srangam_cross_references FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

### Edge Function Security

- **Service Role Key**: Edge functions use service role for database access
- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: Implemented at Supabase project level
- **CORS**: Configured for admin domain only

## Performance Considerations

### Query Optimization

#### Database Indexes

```sql
-- Article lookups
CREATE INDEX idx_articles_slug ON srangam_articles(slug);
CREATE INDEX idx_articles_theme ON srangam_articles(theme);
CREATE INDEX idx_articles_status ON srangam_articles(status);

-- Tag queries
CREATE INDEX idx_tags_usage ON srangam_tags(usage_count DESC);
CREATE INDEX idx_tags_category ON srangam_tags(category);

-- Cross-reference network
CREATE INDEX idx_cross_refs_source ON srangam_cross_references(source_article_id);
CREATE INDEX idx_cross_refs_target ON srangam_cross_references(target_article_id);
CREATE INDEX idx_cross_refs_strength ON srangam_cross_references(strength DESC);
```

### React Query Caching

```typescript
// Default staleTime: 5 minutes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Cached Queries**:
- Article list: 5 min
- Tag list: 10 min
- Cross-references: 5 min
- Cultural terms: 10 min

### Loading States

All admin pages implement:
1. **Skeleton loaders** during initial data fetch
2. **Optimistic updates** for mutations
3. **Error boundaries** for graceful degradation
4. **Toast notifications** for user feedback

### Bundle Optimization

- **Code splitting** by route (React.lazy)
- **Tree shaking** via Vite
- **Minification** in production build
- **Lazy loading** of charts and network graph

## Monitoring & Debugging

### Edge Function Logs

Access via Lovable Cloud:
```
Settings → Cloud → Edge Functions → View Logs
```

Key metrics:
- Execution time
- Error rate
- AI API usage
- Database query count

### Database Performance

Monitor via Supabase dashboard:
- Query execution time
- Index usage
- Connection pool stats

### Frontend Debugging

```typescript
// Enable React Query DevTools in development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

## Future Enhancements

1. **Real-time Collaboration**: WebSocket-based multi-user editing
2. **Version Control**: Article revision history with diff viewer
3. **Advanced Search**: Full-text search with Postgres FTS
4. **Bulk Operations**: CSV import/export for tags and terms
5. **Analytics Dashboard**: User engagement metrics
6. **Email Notifications**: Alert on new articles or comments
