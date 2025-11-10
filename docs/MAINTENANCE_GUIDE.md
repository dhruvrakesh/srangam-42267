# Maintenance Guide

## Table of Contents
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Data Cleanup](#data-cleanup)
- [Backup & Restore](#backup--restore)
- [Monitoring](#monitoring)
- [Performance Tuning](#performance-tuning)

## Common Tasks

### Re-importing Legacy Articles

**Problem**: Articles imported before AI tag generation have empty `tags` arrays.

**Solution**: Re-upload articles through the admin import interface.

**Steps**:
1. Navigate to `/admin/import`
2. Locate original markdown files
3. Upload each file (system detects duplicates by slug)
4. Verify tags were generated in Tag Management

**Bulk Re-import** (if you have many files):
```typescript
// Admin script (run in browser console)
const legacyArticles = await supabase
  .from('srangam_articles')
  .select('slug, content_markdown_path')
  .is('tags', null);

for (const article of legacyArticles) {
  console.log(`Re-importing: ${article.slug}`);
  // Fetch markdown from storage and re-upload
  // Tags will be auto-generated
}
```

---

### Bulk Tag Categorization

**Problem**: All tags have `category = NULL` after initial import.

**Quick Fix (SQL)**:
```sql
-- Categorize Period tags
UPDATE srangam_tags 
SET category = 'Period' 
WHERE tag_name IN ('Ancient India', 'Mauryan Empire', 'Vedic Period');

-- Categorize Subject tags
UPDATE srangam_tags 
SET category = 'Subject' 
WHERE tag_name IN ('Sanskrit Literature', 'Maritime History', 'Diaspora Studies', 'Puranic Literature');

-- Categorize Location tags
UPDATE srangam_tags 
SET category = 'Location' 
WHERE tag_name IN ('Kashmir', 'Kerala', 'Indian Ocean', 'Southeast Asia');

-- Categorize Methodology tags
UPDATE srangam_tags 
SET category = 'Methodology' 
WHERE tag_name IN ('Geomythology', 'Literary Criticism', 'Archaeology', 'Philology');

-- Categorize Concept tags
UPDATE srangam_tags 
SET category = 'Concept' 
WHERE tag_name IN ('Cultural Continuity', 'Buddhism', 'Trade Networks');
```

**Manual Assignment (UI)**:
1. Go to `/admin/tags`
2. Click "Edit" on each tag
3. Select category from dropdown
4. Save changes

---

### Merging Duplicate Tags

**Problem**: AI occasionally creates similar tags (e.g., "Sanskrit Lit" and "Sanskrit Literature").

**Steps**:
1. **Identify Duplicates**:
```sql
SELECT 
  tag_name,
  category,
  usage_count
FROM srangam_tags
WHERE LOWER(tag_name) IN (
  SELECT LOWER(tag_name)
  FROM srangam_tags
  GROUP BY LOWER(tag_name)
  HAVING COUNT(*) > 1
)
ORDER BY LOWER(tag_name);
```

2. **Choose Canonical Tag**: Keep the most used or properly formatted variant

3. **Update Articles**:
```sql
-- Replace 'Sanskrit Lit' with 'Sanskrit Literature' in all articles
UPDATE srangam_articles
SET tags = ARRAY_REPLACE(tags, 'Sanskrit Lit', 'Sanskrit Literature')
WHERE 'Sanskrit Lit' = ANY(tags);
```

4. **Delete Duplicate**:
```sql
DELETE FROM srangam_tags WHERE tag_name = 'Sanskrit Lit';
```

5. **Update Usage Count**:
```sql
UPDATE srangam_tags
SET usage_count = (
  SELECT COUNT(*) FROM srangam_articles 
  WHERE 'Sanskrit Literature' = ANY(tags)
)
WHERE tag_name = 'Sanskrit Literature';
```

---

### Cleaning Orphaned Cross-References

**Problem**: Cross-references pointing to deleted articles.

**Detection**:
```sql
-- Find references with missing source articles
SELECT id, source_article_id, target_article_id
FROM srangam_cross_references
WHERE source_article_id NOT IN (SELECT id FROM srangam_articles);

-- Find references with missing target articles
SELECT id, source_article_id, target_article_id
FROM srangam_cross_references
WHERE target_article_id NOT IN (SELECT id FROM srangam_articles);
```

**Cleanup**:
```sql
-- Delete orphaned references
DELETE FROM srangam_cross_references
WHERE source_article_id NOT IN (SELECT id FROM srangam_articles)
   OR target_article_id NOT IN (SELECT id FROM srangam_articles);
```

**Prevention**: Ensure foreign keys have `ON DELETE CASCADE` (already configured).

---

### Updating Cultural Terms Module

**Problem**: All 49 terms are in `module = 'general'`, should be categorized.

**Categorization**:
```sql
-- Vedic terms
UPDATE srangam_cultural_terms
SET module = 'vedic'
WHERE term IN ('veda', 'upanishad', 'yajna', 'soma');

-- Puranic terms
UPDATE srangam_cultural_terms
SET module = 'puranic'
WHERE term IN ('purana', 'avatar', 'lila');

-- Buddhist terms
UPDATE srangam_cultural_terms
SET module = 'buddhist'
WHERE term IN ('dharma', 'sangha', 'vihara', 'stupa');

-- Jain terms
UPDATE srangam_cultural_terms
SET module = 'jain'
WHERE term IN ('tirthankara', 'ahimsa', 'jina');
```

---

## Troubleshooting

### Import Failures

**Symptom**: Article upload shows error toast, no article created.

**Check Edge Function Logs**:
1. Open Lovable Cloud settings
2. Navigate to Edge Functions → `markdown-to-article-import`
3. Click "View Logs"
4. Look for error messages

**Common Errors**:

#### 1. YAML Parse Error
```
Error: Invalid YAML frontmatter
```

**Cause**: Malformed frontmatter metadata  
**Fix**: Ensure frontmatter is valid YAML:
```yaml
---
title: Valid Title
theme: Ancient India
author: Dr. Name
---
```

#### 2. Duplicate Slug
```
Error: duplicate key value violates unique constraint "srangam_articles_slug_key"
```

**Cause**: Article with same slug already exists  
**Fix**: Change slug in frontmatter or delete existing article

#### 3. AI Quota Exceeded
```
Error: Lovable AI quota exceeded
```

**Cause**: Monthly AI usage limit reached  
**Fix**: Wait for quota reset or upgrade plan

---

### Tag Generation Not Working

**Symptom**: Articles imported but `tags` array is empty.

**Checks**:
1. **Verify Edge Function Invocation**:
```typescript
// Check if generate-article-tags was called
// Look for this in markdown-to-article-import logs
console.log('Calling generate-article-tags...');
```

2. **Check AI Response**:
```typescript
// Look for AI response in logs
console.log('AI response:', aiResponse);
```

3. **Verify Lovable AI Key**:
```bash
# Check environment variable exists
echo $LOVABLE_AI_KEY
```

**Fix**: If key is missing, contact Lovable support.

---

### Network Graph Blank

**Symptom**: Cross-Reference Browser shows empty graph.

**Debugging Steps**:

1. **Check Data Exists**:
```sql
SELECT COUNT(*) FROM srangam_articles;
SELECT COUNT(*) FROM srangam_cross_references;
```

2. **Check Console Errors**:
   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Common: `Cannot read property 'id' of undefined`

3. **Verify react-force-graph-2d Installation**:
```bash
npm list react-force-graph-2d
# Should show: react-force-graph-2d@1.29.0
```

4. **Check Filter State**:
   - Ensure at least one reference type is checked
   - Verify strength range includes existing refs (6-7)

---

## Data Cleanup

### Export All Admin Data

**Backup Before Cleanup**:

```typescript
// Export articles
const { data: articles } = await supabase
  .from('srangam_articles')
  .select('*');
fs.writeFileSync('backup-articles.json', JSON.stringify(articles, null, 2));

// Export tags
const { data: tags } = await supabase
  .from('srangam_tags')
  .select('*');
fs.writeFileSync('backup-tags.json', JSON.stringify(tags, null, 2));

// Export cross-references
const { data: refs } = await supabase
  .from('srangam_cross_references')
  .select('*');
fs.writeFileSync('backup-refs.json', JSON.stringify(refs, null, 2));

// Export cultural terms
const { data: terms } = await supabase
  .from('srangam_cultural_terms')
  .select('*');
fs.writeFileSync('backup-terms.json', JSON.stringify(terms, null, 2));
```

---

### Reset All Data (Nuclear Option)

**⚠️ WARNING**: This deletes ALL admin data. Only use for testing.

```sql
-- Delete all data (cascade deletes cross-references)
DELETE FROM srangam_articles;
DELETE FROM srangam_tags;
DELETE FROM srangam_cultural_terms;

-- Reset auto-increment sequences (if needed)
-- Not applicable for UUID primary keys
```

---

## Backup & Restore

### Automated Backup (Recommended)

**Schedule Daily Backups**:

1. Create edge function `backup-admin-data`:
```typescript
// supabase/functions/backup-admin-data/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(/* ... */);
  
  // Fetch all data
  const articles = await supabase.from('srangam_articles').select('*');
  const tags = await supabase.from('srangam_tags').select('*');
  // ... etc
  
  // Upload to storage
  const backup = {
    timestamp: new Date().toISOString(),
    articles: articles.data,
    tags: tags.data,
    // ... etc
  };
  
  await supabase.storage
    .from('backups')
    .upload(`admin-backup-${Date.now()}.json`, JSON.stringify(backup));
  
  return new Response('Backup complete');
});
```

2. Schedule via cron (external service like GitHub Actions):
```yaml
# .github/workflows/backup.yml
name: Daily Backup
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger backup
        run: curl -X POST https://your-project.supabase.co/functions/v1/backup-admin-data
```

---

### Restore From Backup

```typescript
// Restore from JSON backup
const backup = JSON.parse(fs.readFileSync('backup-articles.json', 'utf8'));

for (const article of backup) {
  await supabase
    .from('srangam_articles')
    .upsert(article, { onConflict: 'slug' });
}
```

---

## Monitoring

### Key Metrics to Track

1. **Article Growth**:
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as articles_created
FROM srangam_articles
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

2. **Tag Usage Distribution**:
```sql
SELECT 
  usage_count,
  COUNT(*) as tags_with_count
FROM srangam_tags
GROUP BY usage_count
ORDER BY usage_count;
```

3. **Cross-Reference Network Density**:
```sql
SELECT 
  COUNT(*) as total_refs,
  COUNT(DISTINCT source_article_id) as unique_sources,
  COUNT(DISTINCT target_article_id) as unique_targets,
  AVG(strength) as avg_strength
FROM srangam_cross_references;
```

4. **Edge Function Performance**:
   - Check Lovable Cloud → Edge Functions → Metrics
   - Monitor execution time (target: <5s)
   - Watch error rate (target: <1%)

---

## Performance Tuning

### Slow Tag Management Page

**Problem**: Page takes >2 seconds to load with 100+ tags.

**Solutions**:

1. **Add Pagination**:
```typescript
const TAGS_PER_PAGE = 50;

const { data: tags } = await supabase
  .from('srangam_tags')
  .select('*')
  .order('usage_count', { ascending: false })
  .range(page * TAGS_PER_PAGE, (page + 1) * TAGS_PER_PAGE - 1);
```

2. **Enable React Query Caching**:
```typescript
const { data: tags } = useQuery({
  queryKey: ['tags'],
  queryFn: fetchTags,
  staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  cacheTime: 30 * 60 * 1000,
});
```

3. **Lazy Load Charts**:
```typescript
import { lazy, Suspense } from 'react';

const CategoryPieChart = lazy(() => import('./CategoryPieChart'));

<Suspense fallback={<Skeleton className="h-[300px]" />}>
  <CategoryPieChart data={tags} />
</Suspense>
```

---

### Network Graph Lag

**Problem**: Force-directed graph is slow with 50+ nodes.

**Solutions**:

1. **Reduce Simulation Ticks**:
```typescript
<ForceGraph2D
  cooldownTicks={50}  // Default: 100
  d3AlphaDecay={0.05} // Faster convergence
/>
```

2. **Implement Clustering**:
```typescript
// Group articles by theme before rendering
const clusters = groupBy(articles, 'theme');
```

3. **Use Canvas Rendering** (already enabled):
```typescript
// react-force-graph-2d uses Canvas by default (good!)
```

---

### Database Query Optimization

**Slow Cross-Reference Query**:

**Before**:
```sql
SELECT * FROM srangam_cross_references; -- Full table scan
```

**After**:
```sql
-- Use indexes
SELECT * FROM srangam_cross_references
WHERE source_article_id = '...'  -- Uses idx_cross_refs_source
ORDER BY strength DESC;          -- Uses idx_cross_refs_strength
```

**Analyze Query Performance**:
```sql
EXPLAIN ANALYZE
SELECT sr.*, sa.title
FROM srangam_cross_references sr
JOIN srangam_articles sa ON sr.target_article_id = sa.id
WHERE sr.strength >= 7;
```

Look for "Index Scan" (good) vs "Seq Scan" (slow).

---

## Scheduled Maintenance

### Weekly Tasks
- [ ] Review tag categories, assign to uncategorized tags
- [ ] Check for duplicate tags, merge if found
- [ ] Verify cross-reference network has no orphans
- [ ] Export backup of all admin data

### Monthly Tasks
- [ ] Analyze tag usage, deprecate unused tags
- [ ] Re-run `analyze-tag-relationships` to update `related_tags`
- [ ] Review edge function logs for errors
- [ ] Check database query performance

### Quarterly Tasks
- [ ] Re-import legacy articles to add AI tags
- [ ] Audit cultural terms, categorize by module
- [ ] Performance test network graph with full dataset
- [ ] Update documentation with new features
