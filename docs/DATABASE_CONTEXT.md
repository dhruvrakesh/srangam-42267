# Database Context & AI Retention Guide

## Purpose

This document ensures **AI assistants** (including future Lovable sessions) understand the Srangam database architecture and can make informed decisions about schema changes, queries, and data management.

**Critical**: Read this document **before** making any database modifications.

---

## Core Principles

### 1. **"srangam_" Namespace**
All tables use the `srangam_` prefix to:
- Maintain clear brand identity (Srangam Digital)
- Avoid naming conflicts with Supabase system tables
- Enable easy identification of project-specific data

**Rule**: Never create tables without this prefix.

### 2. **Multilingual JSONB Architecture**
Content is stored as JSONB objects with language codes as keys:

```json
{
  "en": "Maritime Memories of South India",
  "ta": "தென்னிந்திய கடல்சார் நினைவுகள்",
  "te": "దక్షిణ భారత సముద్ర జ్ఞాపకాలు",
  "kn": "ದಕ್ಷಿಣ ಭಾರತದ ಸಮುದ್ರ ನೆನಪುಗಳು",
  "bn": "দক্ষিণ ভারতের সামুদ্রিক স্মৃতি",
  "as": "দক্ষিণ ভাৰতৰ সামুদ্ৰিক স্মৃতি",
  "pn": "U Shynrang Samudra ha South India",
  "hi": "दक्षिण भारत की समुद्री स्मृतियाँ",
  "pa": "ਦੱਖਣੀ ਭਾਰਤ ਦੀਆਂ ਸਮੁੰਦਰੀ ਯਾਦਾਂ"
}
```

**Supported Languages**:
- English (`en`) - Source of truth
- Tamil (`ta`), Telugu (`te`), Kannada (`kn`)
- Bengali (`bn`), Assamese (`as`)
- Pnar (`pn`) - Indigenous Meghalayan language
- Hindi (`hi`), Punjabi (`pa`)

**Why JSONB?**:
- Flexible schema (add languages without ALTER TABLE)
- Efficient JSON operators (`->`, `->>`, `@>`)
- Indexable with GIN indexes if needed

### 3. **Public Research Access**
Row Level Security (RLS) policies enforce:
- **Published content = public** (open scholarship model)
- **Drafts = authenticated only** (content creation workflow)
- **Analytics/versions = authenticated only** (operational data)

**Philosophy**: Academic research should be accessible to all. RLS ensures security without paywalls.

### 4. **Cultural Authenticity**
The `srangam_cultural_terms` table preserves dharmic concepts with:
- **Proper transliteration** (IAST standard)
- **Etymological context** (root meanings)
- **Usage tracking** (measure cultural density)

**Example**:
```json
{
  "term": "dharmashala",
  "display_term": "Dharmaśālā",
  "transliteration": "dharmaśālā",
  "translations": {
    "en": "Rest house for pilgrims, charity lodge",
    "ta": "பயணிகளுக்கான தங்குமிடம்"
  },
  "etymology": {
    "en": "dharma (righteous duty) + śālā (hall/house)",
    "ta": "தருமம் (நல்லொழுக்கம்) + சாலை (இல்லம்)"
  },
  "usage_count": 23
}
```

---

## Table Purposes

### Content Management

#### `srangam_articles` - Primary Content
- **49 research articles** (40 published, 9 draft — verified Feb 2026)
- Stores both **JSONB multilingual content** and **markdown file paths**
- Each article has `slug` (URL identifier), `theme`, `tags[]`, `status`
- `series_id` + `part_number` enable multi-part articles (e.g., Sacred Ecology series)

**Key Point**: Content exists in **two forms**:
1. **Markdown files** in Storage bucket (`content_markdown_path`)
2. **JSONB structured data** in database (for queries/indexing)

#### `srangam_article_metadata` - AI Insights
- **One-to-one with articles** (FK to `srangam_articles.id`)
- AI-generated summaries, keywords, themes
- **Vector embeddings** (`vector(1536)`) for semantic search
- Cultural density score (% of cultural terms in text)

**Use Case**: "Find articles similar to X" using `srangam_search_articles_semantic()`

#### `srangam_article_versions` - Version Control
- Snapshots of content at each save
- Tracks `changed_by` and `change_summary`
- Enables rollback and audit trail

---

### Knowledge Database

#### `srangam_cultural_terms` - Dharmic Concepts
- **1,699 terms** from across Indian Ocean cultures (verified Feb 2026)
- Organized by `module`: `core`, `vedic`, `maritime`, `indigenous`, etc.
- `usage_count` tracks cross-article references
- `related_terms[]` creates semantic network

**Critical**: Terms are **protected during translation** (not translated, only explained)

#### `srangam_correlation_matrix` - Evidence Links (0 rows — scaffolded, unused)
- **Designed for** 69-point correlation system linking textual/archaeological/geographic evidence
- Each correlation has `coordinates` (PostGIS geography point)
- `confidence_level`: `high`, `medium`, `low`, `approximate`
- Powers interactive map pins on theme pages

**Example**: Linking Sangam literature references to actual port sites

#### `srangam_inscriptions` - Epigraphy Specialization (0 rows — scaffolded, unused)
- Detailed inscription data (scripts, translations, dating)
- `script_types[]`: `brahmic`, `greek`, `aramaic`, `khmer`, etc.
- Supports multi-script inscriptions (e.g., Kandahar edicts)

---

### Operational

#### `srangam_article_analytics` - Usage Tracking
- Daily aggregates per article
- Tracks `views`, `unique_visitors`, `completion_rate`
- `language_breakdown` (which languages are most viewed)
- `cultural_term_interactions` (tooltip clicks)

#### `srangam_translation_queue` - Workflow Management
- Tracks pending translations
- `priority`: `high` (featured articles), `medium`, `low`
- `status`: `pending` → `in_progress` → `review` → `completed`

---

## Common Patterns

### Multilingual Content Access

**TypeScript Query**:
```typescript
const { data } = await supabase
  .from('srangam_articles')
  .select('id, slug, title, dek, content')
  .eq('slug', 'maritime-memories-south-india')
  .single();

// Access specific language
const titleInTamil = data.title['ta'];
const contentInEnglish = data.content['en'];
```

**SQL Query with JSONB Operators**:
```sql
-- Get all Tamil titles
SELECT 
  slug,
  title->>'ta' as tamil_title,
  title->>'en' as english_title
FROM srangam_articles
WHERE title ? 'ta'  -- Check if 'ta' key exists
  AND status = 'published';
```

### Vector Similarity Search

```typescript
// 1. Get query embedding from AI
const queryVector = await generateEmbedding("Indian Ocean trade routes");

// 2. Search similar articles
const { data } = await supabase.rpc('srangam_search_articles_semantic', {
  query_embedding: queryVector,
  match_threshold: 0.75,  // 75% similarity
  match_count: 5
});

// Returns: [{article_id, slug, title, similarity}]
```

### Geographic Queries (PostGIS)

```typescript
// Find correlations within 50km of Chennai
const { data } = await supabase.rpc('find_nearby_correlations', {
  lat: 13.0827,
  lng: 80.2707,
  radius_meters: 50000
});
```

### Cultural Term Usage Tracking

```typescript
// In article rendering component
useEffect(() => {
  // When user hovers over cultural term tooltip
  const handleTermInteraction = async (term: string) => {
    await supabase.rpc('srangam_increment_term_usage', {
      term_key: term.toLowerCase()
    });
  };
}, []);
```

---

## Migration Guidelines

### Safe Schema Changes

✅ **Safe Operations** (non-breaking):
- Adding nullable columns
- Adding new tables
- Creating indexes
- Adding RLS policies
- Creating functions/triggers

❌ **Risky Operations** (breaking):
- Dropping columns (use deprecation cycle)
- Changing column types (migrate data first)
- Removing RLS policies (security risk)
- Altering foreign keys (check dependencies)

### Migration Checklist

Before running migrations:
1. **Check existing data** - Will it break?
2. **Review RLS policies** - Does new column need policies?
3. **Update indexes** - Will queries slow down?
4. **Test with sample data** - Insert/update works?
5. **Document in `DATABASE_SCHEMA.md`** - Update table definitions

### Example: Adding New Column

```sql
-- Step 1: Add nullable column
ALTER TABLE srangam_articles 
ADD COLUMN featured_image_url text;

-- Step 2: Add index if queried
CREATE INDEX idx_srangam_articles_featured_image 
ON srangam_articles(featured_image_url)
WHERE featured_image_url IS NOT NULL;

-- Step 3: Update RLS policies (if needed)
-- No change needed - inherits from table-level policies
```

### Example: Adding New Language

```typescript
// No migration needed! JSONB is flexible
await supabase
  .from('srangam_articles')
  .update({
    title: {
      ...article.title,
      or: 'ଭାରତୀୟ ସମୁଦ୍ର ସ୍ମୃତି'  // Odia language
    }
  })
  .eq('id', articleId);
```

---

## AI Integration Strategy

### Lovable AI Gateway

Srangam uses **Lovable AI** for:
1. **Content Analysis** (`srangam-analyze-article` edge function)
   - Model: `google/gemini-2.5-pro`
   - Generates: Summaries, keywords, themes
   - Stores: `srangam_article_metadata`

2. **Semantic Search** (`srangam-generate-embeddings` edge function)
   - Model: OpenAI-compatible embeddings
   - Generates: 1536-dimension vectors
   - Stores: `srangam_article_metadata.embeddings`

3. **Translation Assistance** (planned)
   - Model: `google/gemini-2.5-flash`
   - Preserves: Cultural terms (using protected terms list)

### No API Keys Required
All AI operations use **Lovable AI Gateway** (LOVABLE_API_KEY auto-provisioned).

---

## Query Optimization Tips

### 1. Use Indexes
```typescript
// ✅ Fast: Uses idx_srangam_articles_slug
.eq('slug', 'article-slug')

// ✅ Fast: Uses idx_srangam_articles_theme
.eq('theme', 'maritime')

// ❌ Slow: Full table scan
.ilike('content->en', '%keyword%')  // JSONB text search
```

### 2. Limit Columns
```typescript
// ✅ Good: Only fetch needed data
.select('id, slug, title, dek')

// ❌ Bad: Fetches entire JSONB content
.select('*')
```

### 3. Pagination
```typescript
// ✅ Good: Use range-based pagination
.range(0, 9)  // First 10 articles

// ❌ Bad: Fetching all articles at once
.select('*')  // No limit
```

### 4. JSONB Indexing
```sql
-- If frequent queries on specific JSONB paths
CREATE INDEX idx_articles_english_title 
ON srangam_articles ((title->>'en'));
```

---

## Storage Patterns

### Markdown Files in `srangam-articles` Bucket

**Structure**:
```
srangam-articles/
├── en/
│   └── maritime-memories-south-india.md
├── ta/
│   └── maritime-memories-south-india.md
└── metadata/
    └── article-index.json
```

**Upload Pattern**:
```typescript
// 1. Upload markdown to Storage
const { data: fileData } = await supabase.storage
  .from('srangam-articles')
  .upload(`en/${slug}.md`, markdownFile);

// 2. Store path in database
const { data: articleData } = await supabase
  .from('srangam_articles')
  .insert({
    slug,
    title: { en: 'Article Title' },
    content: parsedContent,  // JSONB structured
    content_markdown_path: `en/${slug}.md`
  });
```

**Why Both?**:
- **Markdown**: Human-readable, version-controllable, portable
- **JSONB**: Queryable, indexable, fast retrieval

---

## Security Best Practices

### 1. Always Enable RLS
```sql
-- Every new table must have RLS
ALTER TABLE srangam_new_table ENABLE ROW LEVEL SECURITY;
```

### 2. Explicit Policies
```sql
-- Be specific about who can do what
CREATE POLICY "Public read published only"
  ON srangam_articles FOR SELECT
  USING (status = 'published');

-- Not just: USING (true);  -- Too permissive!
```

### 3. Function Security
```sql
-- Set search_path for security
CREATE FUNCTION my_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Prevent SQL injection
AS $$ ... $$;
```

### 4. Validate Input
```typescript
// Always validate user input before DB operations
const slugRegex = /^[a-z0-9-]+$/;
if (!slugRegex.test(userInputSlug)) {
  throw new Error('Invalid slug format');
}
```

---

## Troubleshooting

### Common Issues

#### Issue: "RLS policy preventing insert"
**Solution**: Check if user is authenticated and policy allows INSERT
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // User not logged in - INSERT will fail
}
```

#### Issue: "Vector index not used in similarity search"
**Solution**: Ensure embeddings column is not null
```sql
WHERE m.embeddings IS NOT NULL  -- Required for index
```

#### Issue: "JSONB key not found"
**Solution**: Use safe navigation
```typescript
const title = article.title?.['ta'] ?? article.title?.['en'] ?? 'Untitled';
```

#### Issue: "Geographic query slow"
**Solution**: Check if GIST index exists
```sql
CREATE INDEX IF NOT EXISTS idx_correlation_coords 
ON srangam_correlation_matrix USING GIST (coordinates);
```

---

## Future Enhancements

### Planned Features
1. **Full-text search** - GIN index on `to_tsvector(content->>'en')`
2. **GraphQL API** - PostgREST automatic API generation
3. **Real-time subscriptions** - Supabase Realtime for live analytics
4. **Edge caching** - Cloudflare Workers for static content

### Scalability Considerations
- **Current**: 49 articles, 1,699 terms, 1,066 cross-refs → Well within Postgres limits
- **Future**: 1000+ articles → Consider partitioning by `theme`
- **Vector search**: IVFFlat index scales to 100K+ vectors

---

## Maintenance Schedule

### Weekly
- Review slow query logs in Lovable Cloud dashboard
- Check storage bucket usage

### Monthly
- Analyze unused indexes (`pg_stat_user_indexes`)
- Review RLS policy performance
- Update cultural terms usage stats

### Quarterly
- Vacuum analyze all tables
- Review and archive old article versions
- Update database documentation

---

## Related Documentation

- **Schema Reference**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **Project Overview**: [SRANGAM_PROJECT.md](../SRANGAM_PROJECT.md)
- **Oceanic System**: [OCEANIC_BHARAT_SYSTEM.md](../OCEANIC_BHARAT_SYSTEM.md)
- **Main README**: [README.md](../README.md)

---

## Contact for Database Questions

For schema changes or database architecture decisions, consult:
1. **This document** (first stop)
2. **DATABASE_SCHEMA.md** (technical reference)
3. **SRANGAM_PROJECT.md** (project context)

**Remember**: The database is the foundation of Srangam Digital's scholarly mission. Every decision impacts research accessibility, cultural preservation, and academic integrity.
