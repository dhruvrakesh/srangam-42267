# Srangam System Flowcharts

This document contains all system architecture and data flow diagrams for the Srangam Digital Archive platform. These diagrams provide a visual reference for understanding system components, workflows, and data relationships.

## Table of Contents
- [Complete System Architecture](#complete-system-architecture)
- [Markdown Import Pipeline](#markdown-import-pipeline)
- [AI Tag Generation Workflow](#ai-tag-generation-workflow)
- [Cross-Reference Network](#cross-reference-network)
- [Admin Component Hierarchy](#admin-component-hierarchy)
- [Database Schema](#database-schema)
- [Tag Categorization Process](#tag-categorization-process)
- [Network Graph Data Flow](#network-graph-data-flow)

---

## Complete System Architecture

Three-layer architecture showing frontend (React), backend (Supabase), and AI integration (Lovable AI).

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
        L[(srangam_articles<br/>5 articles)] --> M[(srangam_tags<br/>11 tags)]
        L --> N[(srangam_cross_references<br/>11 connections)]
        L --> O[(srangam_cultural_terms<br/>49 terms)]
        
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

---

## Markdown Import Pipeline

Complete sequence diagram showing all phases of article import from upload to database persistence.

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

---

## AI Tag Generation Workflow

Detailed flowchart of the AI-powered tag generation and normalization process.

```mermaid
graph TB
    A[Article Import] --> B{Has Existing Tags?}
    B -->|Yes| C[Skip Generation]
    B -->|No| D[generate-article-tags Function]
    
    D --> E[Fetch Context]
    E --> E1[Top 100 Existing Tags]
    E --> E2[Article Metadata]
    E --> E3[Cultural Terms]
    
    E1 --> F[Build AI Prompt]
    E2 --> F
    E3 --> F
    
    F --> G[System Prompt<br/>Taxonomy Rules]
    F --> H[User Prompt<br/>Article Data]
    
    G --> I[OpenAI API]
    H --> I
    
    I --> J[GPT-4o-mini<br/>Temperature: 0.3]
    
    J --> K{Parse Response}
    K -->|Success| L[Extract Tags Array]
    K -->|Error| M[Retry or Fallback]
    
    L --> N[Normalization Loop]
    
    N --> O{For Each Tag}
    O --> P{Exact Match?}
    P -->|Yes| Q[Use Existing Tag]
    P -->|No| R{Fuzzy Match?}
    
    R -->|Yes| S[Use Close Variant]
    R -->|No| T[Create New Tag]
    
    Q --> U[Final Tag List<br/>5-8 unique tags]
    S --> U
    T --> U
    
    U --> V[Update Article]
    U --> W[Update Tag Registry<br/>Increment usage_count]
    
    style I fill:#00acc1,color:#fff
    style J fill:#4285f4,color:#fff
    style U fill:#4caf50,color:#fff
```

---

## Cross-Reference Network

Current network topology showing 5 articles and 11 cross-references.

```mermaid
graph LR
    A[Ocean as Archive<br/>4 outgoing] -->|same_theme<br/>strength: 7| B[Maritime Networks]
    A -->|same_theme<br/>strength: 7| C[Vedic Preservation]
    A -->|thematic<br/>strength: 6| D[Sanskrit Diaspora]
    
    B -->|same_theme<br/>strength: 7| C
    B -->|same_theme<br/>strength: 7| E[Kashmir Sources]
    
    C -->|same_theme<br/>strength: 7| D
    C -->|same_theme<br/>strength: 7| E
    
    D -->|same_theme<br/>strength: 7| E
    
    E -->|same_theme<br/>strength: 7| A
    E -->|same_theme<br/>strength: 7| B
    E -->|same_theme<br/>strength: 7| D
    
    style A fill:#64b5f6
    style B fill:#64b5f6
    style C fill:#64b5f6
    style D fill:#64b5f6
    style E fill:#64b5f6
```

**Network Statistics**:
- Total Nodes: 5 articles
- Total Edges: 11 cross-references
- Average Degree: 4.4 connections per article
- Network Density: 55%
- Average Strength: 6.91/10

---

## Admin Component Hierarchy

Complete component tree for the admin dashboard.

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

---

## Database Schema

Entity-Relationship Diagram showing key admin tables and relationships.

```mermaid
erDiagram
    srangam_articles ||--o{ srangam_cross_references : "source"
    srangam_articles ||--o{ srangam_cross_references : "target"
    srangam_articles }o--|| srangam_tags : "uses"
    srangam_articles }o--|| srangam_cultural_terms : "contains"
    
    srangam_articles {
        uuid id PK
        text slug UK
        jsonb title
        text theme
        text[] tags
        int read_time_minutes
        timestamp created_at
        timestamp updated_at
    }
    
    srangam_tags {
        uuid id PK
        text tag_name UK
        text category
        int usage_count
        jsonb related_tags
        timestamp last_used
    }
    
    srangam_cross_references {
        uuid id PK
        uuid source_article_id FK
        uuid target_article_id FK
        text reference_type
        int strength
        jsonb context_description
        timestamp created_at
    }
    
    srangam_cultural_terms {
        uuid id PK
        text term UK
        text display_term
        jsonb translations
        int usage_count
        text module
        timestamp created_at
    }
```

---

## Tag Categorization Process

Decision tree for assigning tags to semantic categories.

```mermaid
graph TB
    A[Tag: 'Sanskrit Literature'] --> B{Period?}
    B -->|Historical timeframe?| C[No]
    
    C --> D{Concept?}
    D -->|Abstract idea?| E[No]
    
    E --> F{Location?}
    F -->|Geographic?| G[No]
    
    G --> H{Subject?}
    H -->|Academic discipline?| I[✓ YES]
    
    I --> J[Category: Subject]
    
    K[Tag: 'Ancient India'] --> L{Period?}
    L -->|Historical timeframe?| M[✓ YES]
    M --> N[Category: Period]
    
    O[Tag: 'Kashmir'] --> P{Location?}
    P -->|Geographic?| Q[✓ YES]
    Q --> R[Category: Location]
    
    S[Tag: 'Geomythology'] --> T{Methodology?}
    T -->|Research approach?| U[✓ YES]
    U --> V[Category: Methodology]
    
    W[Tag: 'Cultural Continuity'] --> X{Concept?}
    X -->|Abstract idea?| Y[✓ YES]
    Y --> Z[Category: Concept]
    
    style J fill:#4caf50,color:#fff
    style N fill:#4caf50,color:#fff
    style R fill:#4caf50,color:#fff
    style V fill:#4caf50,color:#fff
    style Z fill:#4caf50,color:#fff
```

**Category Distribution**:
- **Subject**: 36% (4 tags)
- **Location**: 27% (3 tags)
- **Methodology**: 18% (2 tags)
- **Period**: 9% (1 tag)
- **Concept**: 9% (1 tag)

---

## Network Graph Data Flow

User interaction flow in the Cross-Reference Browser.

```mermaid
sequenceDiagram
    participant User
    participant Graph as ForceGraph2D
    participant State as React State
    participant Panel as Detail Panel
    participant Table as Reference Table
    
    User->>Graph: Click node
    Graph->>State: setSelectedNode(nodeId)
    State->>Panel: Open with article details
    State->>Table: Filter to show connections
    
    User->>Graph: Hover node
    Graph->>Graph: Show tooltip (title)
    Graph->>Graph: Highlight connected edges
    
    User->>Graph: Drag node
    Graph->>Graph: Update position
    Graph->>Graph: Fix node (prevent drift)
    
    User->>Graph: Zoom/Pan
    Graph->>Graph: Update camera transform
    
    User->>Table: Click reference row
    Table->>State: setSelectedNode(targetId)
    State->>Graph: Center on node
    State->>Panel: Update details
```

---

## Tag Normalization Algorithm

Flowchart showing fuzzy matching logic for tag deduplication.

```mermaid
graph TB
    A[AI Generated Tag:<br/>'sanskrit literature'] --> B{Exact Match?}
    
    B -->|Yes| C[Use: 'sanskrit literature'<br/>Increment usage_count]
    
    B -->|No| D{Lowercase Match?}
    D -->|Yes<br/>'Sanskrit Literature'| E[Use: 'Sanskrit Literature'<br/>Preserve existing case]
    
    D -->|No| F{Substring Match?}
    F -->|Yes<br/>'Sanskrit Lit'| G[Use: 'Sanskrit Literature'<br/>Full variant]
    
    F -->|No| H{Synonym Match?}
    H -->|Yes<br/>from related_tags| I[Use: Existing synonym]
    
    H -->|No| J[Create New Tag:<br/>'sanskrit literature'<br/>usage_count = 1]
    
    C --> K[Final Tag List]
    E --> K
    G --> K
    I --> K
    J --> K
    
    style C fill:#4caf50,color:#fff
    style E fill:#81c784
    style G fill:#81c784
    style I fill:#81c784
    style J fill:#ffb74d
```

**Normalization Success Rate**: 73% (exact + fuzzy matches)

---

## Summary

This collection of flowcharts and diagrams provides a comprehensive visual reference for:

1. **System Architecture**: Understanding the three-layer structure
2. **Data Flow**: Following data from user input to database storage
3. **AI Integration**: Visualizing the tag generation and normalization process
4. **Network Topology**: Exploring article interconnections
5. **Component Structure**: Navigating the admin dashboard hierarchy
6. **Database Relationships**: Understanding table connections and foreign keys

These diagrams are maintained alongside the codebase and updated when system architecture changes.

For detailed explanations of each component, refer to:
- [Admin Dashboard Architecture](./ADMIN_DASHBOARD_ARCHITECTURE.md)
- [AI Tag Generation System](./AI_TAG_GENERATION_SYSTEM.md)
- [Network Visualization Guide](./NETWORK_VISUALIZATION_GUIDE.md)
- [Database Schema Documentation](./DATABASE_SCHEMA_ADMIN.md)
