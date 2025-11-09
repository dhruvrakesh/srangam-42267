# Srangam System Architecture

High-level architecture of the Srangam digital archive platform.

## Stack Overview

```mermaid
graph TB
    subgraph Frontend
        A[React 18 + TypeScript]
        B[TailwindCSS + shadcn/ui]
        C[React Router v6]
        D[TanStack Query]
    end
    
    subgraph Backend
        E[Supabase Edge Functions]
        F[PostgreSQL Database]
        G[Row Level Security]
    end
    
    subgraph Services
        H[Lovable AI Models]
        I[Markdown Processing]
        J[File Storage]
    end
    
    A --> D
    D --> E
    E --> F
    E --> H
    F --> G
    E --> I
    E --> J
    
    style A fill:#e1f5ff
    style E fill:#fff3cd
    style F fill:#d4edda
```

## Data Architecture

```mermaid
erDiagram
    srangam_articles ||--o{ srangam_article_chapters : "article_id"
    srangam_articles ||--o{ srangam_markdown_sources : "article_id"
    srangam_articles ||--o{ srangam_cross_references : "source_article_id"
    srangam_articles ||--o{ srangam_cross_references : "target_article_id"
    
    srangam_book_chapters ||--o{ srangam_article_chapters : "chapter_id"
    
    srangam_cultural_terms ||--o{ article_term_usage : "term_id"
    srangam_articles ||--o{ article_term_usage : "article_id"
    
    srangam_articles {
        uuid id PK
        text slug UK
        jsonb title
        jsonb content
        text author
        date published_date
        text theme
        text[] tags
        int read_time_minutes
        text status
        boolean featured
        timestamp created_at
    }
    
    srangam_markdown_sources {
        uuid id PK
        uuid article_id FK UK
        text markdown_content
        text file_path
        text sync_status
        timestamp last_sync_at
    }
    
    srangam_cross_references {
        uuid id PK
        uuid source_article_id FK
        uuid target_article_id FK
        text reference_type
        int strength
        boolean bidirectional
        jsonb context_description
    }
    
    srangam_cultural_terms {
        uuid id PK
        text term UK
        jsonb translations
        jsonb etymology
        jsonb cultural_context
        int usage_count
        text module
    }
    
    srangam_book_chapters {
        uuid id PK
        text chapter_id UK
        int volume
        int chapter_number
        text title
        text description
    }
```

## Request Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant R as React App
    participant Q as React Query
    participant S as Supabase Client
    participant E as Edge Function
    participant D as PostgreSQL
    
    U->>R: Visit /admin/import
    R->>R: Render MarkdownImport
    U->>R: Upload markdown file
    R->>R: Extract frontmatter
    R->>U: Show preview
    U->>R: Click "Import"
    R->>S: supabase.functions.invoke()
    S->>E: POST /markdown-to-article-import
    E->>E: Parse YAML
    E->>E: Convert MD → HTML
    E->>E: Extract terms & citations
    E->>D: UPSERT srangam_articles
    D-->>E: article_id
    E->>D: UPSERT markdown_sources
    E->>D: SELECT existing articles
    D-->>E: articles[]
    E->>E: Calculate cross-references
    E->>D: INSERT cross_references
    loop Each cultural term
        E->>D: SELECT/UPDATE/INSERT term
    end
    E-->>S: Success response
    S-->>R: JSON data
    R->>Q: Invalidate queries
    R->>U: Toast notification
```

## Module Structure

```
src/
├── components/
│   ├── academic/
│   │   ├── ArticleCrossReferences.tsx
│   │   ├── CrossReferencePanel.tsx
│   │   └── CulturalTermsPanel.tsx
│   └── ui/                     # shadcn components
├── pages/
│   ├── admin/
│   │   ├── MarkdownImport.tsx
│   │   └── CrossReferenceManager.tsx (future)
│   └── articles/
│       └── [slug].tsx
├── integrations/
│   └── supabase/
│       ├── client.ts           # Auto-generated
│       └── types.ts            # Auto-generated
└── hooks/
    └── use-toast.ts

supabase/
└── functions/
    └── markdown-to-article-import/
        └── index.ts

docs/
└── architecture/
    ├── IMPORT_PIPELINE.md
    ├── CROSS_REFERENCE_SYSTEM.md
    ├── SYSTEM_ARCHITECTURE.md
    └── IMPLEMENTATION_ROADMAP.md
```

## Security Architecture

```mermaid
graph TD
    A[Public User] --> B{Authenticated?}
    B -->|No| C[Read Published Articles]
    B -->|Yes| D[User Profile Access]
    D --> E[RLS Policies]
    
    F[Admin User] --> G{Role Check?}
    G -->|Admin| H[Full CRUD Access]
    G -->|Editor| I[Create/Edit Articles]
    G -->|Reader| C
    
    H --> J[Service Role Key]
    J --> K[Bypass RLS]
    
    style A fill:#e1f5ff
    style F fill:#fff3cd
    style K fill:#f8d7da
```

**Row Level Security (RLS):**
- ✅ `srangam_articles`: Published articles visible to all
- ✅ `srangam_cultural_terms`: Read-only for public
- ✅ `srangam_cross_references`: Read-only for public
- 🔐 `srangam_markdown_sources`: Admin only
- 🔐 Edge functions: Service role key for write operations

## Performance Optimization

### Caching Strategy

```mermaid
graph LR
    A[Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached]
    B -->|No| D[Fetch from DB]
    D --> E[Cache Result]
    E --> F[Return Data]
    
    style C fill:#d4edda
    style F fill:#fff3cd
```

**React Query Configuration:**
```typescript
{
  staleTime: 5 * 60 * 1000,    // 5 minutes
  cacheTime: 30 * 60 * 1000,   // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false
}
```

### Database Indexing

```sql
-- Articles table
CREATE INDEX idx_articles_slug ON srangam_articles(slug);
CREATE INDEX idx_articles_status ON srangam_articles(status);
CREATE INDEX idx_articles_tags ON srangam_articles USING GIN(tags);
CREATE INDEX idx_articles_theme ON srangam_articles(theme);

-- Cross-references
CREATE INDEX idx_xref_source ON srangam_cross_references(source_article_id);
CREATE INDEX idx_xref_target ON srangam_cross_references(target_article_id);
CREATE INDEX idx_xref_strength ON srangam_cross_references(strength DESC);

-- Cultural terms
CREATE INDEX idx_terms_usage ON srangam_cultural_terms(usage_count DESC);
CREATE INDEX idx_terms_module ON srangam_cultural_terms(module);

-- Markdown sources
CREATE UNIQUE INDEX idx_markdown_article ON srangam_markdown_sources(article_id);
```

## Deployment Flow

```mermaid
graph LR
    A[Git Push] --> B[Lovable Build]
    B --> C[Deploy Frontend]
    B --> D[Deploy Edge Functions]
    D --> E[Supabase Project]
    C --> F[CDN Distribution]
    E --> G[Database Migration]
    
    style A fill:#e1f5ff
    style F fill:#d4edda
    style G fill:#fff3cd
```

**Automatic Deployment:**
1. Push to GitHub
2. Lovable detects changes
3. Build React app (Vite)
4. Deploy edge functions to Supabase
5. Run pending database migrations
6. Invalidate CDN cache
7. Update type definitions

## Monitoring & Observability

```mermaid
graph TD
    A[Application Logs] --> B[Edge Function Logs]
    A --> C[Client-Side Errors]
    A --> D[Database Queries]
    
    B --> E[Supabase Dashboard]
    C --> F[React Error Boundary]
    D --> G[Query Performance]
    
    E --> H[Alert on 500 Errors]
    F --> I[Log to Monitoring]
    G --> J[Slow Query Alert]
    
    style A fill:#e1f5ff
    style H fill:#f8d7da
    style I fill:#f8d7da
    style J fill:#fff3cd
```

**Key Metrics:**
- Edge function invocation count
- Average response time
- Failed import rate
- Cross-reference creation rate
- Cultural term extraction accuracy
- Database query performance

## Scalability Considerations

### Horizontal Scaling

```mermaid
graph LR
    A[Load Balancer] --> B[Edge Function 1]
    A --> C[Edge Function 2]
    A --> D[Edge Function N]
    
    B --> E[PostgreSQL]
    C --> E
    D --> E
    
    style A fill:#e1f5ff
    style E fill:#d4edda
```

**Supabase Auto-Scaling:**
- Edge functions scale automatically
- Database connection pooling (PgBouncer)
- Read replicas for heavy queries (future)

### Data Partitioning (Future)

```sql
-- Partition articles by publication year
CREATE TABLE srangam_articles_2024 
PARTITION OF srangam_articles
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE srangam_articles_2025
PARTITION OF srangam_articles
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

## Disaster Recovery

```mermaid
graph TD
    A[Daily Backups] --> B[Point-in-Time Recovery]
    A --> C[Automated Snapshots]
    
    B --> D[Restore to Last Good State]
    C --> E[30-Day Retention]
    
    F[Database Migration Rollback] --> G[Down Migration Scripts]
    
    style A fill:#d4edda
    style D fill:#fff3cd
    style G fill:#f8d7da
```

**Backup Strategy:**
- **Database**: Automated daily backups (30-day retention)
- **Markdown Sources**: Version controlled in Git
- **Edge Functions**: Deployed from source control
- **Frontend**: CDN cached + Git repository

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript | UI components |
| Styling | TailwindCSS + shadcn/ui | Design system |
| State | TanStack Query | Server state caching |
| Routing | React Router v6 | Client-side routing |
| Backend | Supabase Edge Functions | Serverless compute |
| Database | PostgreSQL 15 | Relational data |
| Auth | Supabase Auth | User management |
| Storage | Supabase Storage | File uploads |
| AI | Lovable AI (Gemini 2.5) | Future embeddings |
| Markdown | marked.js | MD → HTML |
| YAML | Deno std/yaml | Frontmatter parsing |
| Build | Vite | Fast bundling |
| Deploy | Lovable Cloud | Automatic CD |
