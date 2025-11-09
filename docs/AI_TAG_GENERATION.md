# AI-Powered Tag Generation System

**Deployed**: 2025-11-09  
**Model**: Lovable AI (Google Gemini 2.5 Flash)  
**Edge Function**: `supabase/functions/generate-article-tags/index.ts`

---

## 📋 **Overview**

The AI tag generation system automatically creates 5-8 contextually relevant tags for scholarly articles when no tags are provided in the frontmatter. It uses Lovable AI to analyze article content and intelligently merges suggestions with the existing tag taxonomy to ensure consistency.

---

## 🔄 **How It Works**

### **1. Trigger Condition**
```typescript
// In markdown-to-article-import/index.ts (line ~244)
let tags = frontmatter.tags || [];

if (tags.length === 0) {
  console.log('🤖 No tags found in frontmatter, generating with AI...');
  
  const { data: aiTagsData } = await supabase.functions.invoke(
    'generate-article-tags',
    { body: { title, theme, culturalTerms, contentPreview } }
  );
  
  tags = aiTagsData.tags || [];
}
```

**Triggers when**:
- Frontmatter has `tags: []`
- Frontmatter has no `tags` field at all
- Frontmatter has `tags: null`

**Does NOT trigger when**:
- Frontmatter has `tags: ["Buddhism", "Ancient India"]` (uses provided tags)

---

### **2. AI Analysis Process**

#### **Input Data Sent to AI**
```typescript
{
  title: "Reassessing Ashoka's Legacy in Light of Recent Archaeological Findings",
  theme: "Ancient India",
  culturalTerms: ["Buddhism", "Mauryan", "Kalinga", "stūpa", "dhamma", ...],
  contentPreview: "<!-- First 1000 characters of article -->"
}
```

#### **AI Prompt Structure**
```
SYSTEM PROMPT:
You are an expert in Indian Ocean history, South Asian studies, and academic taxonomy.
Your task is to generate 5-8 highly relevant tags for scholarly articles.

EXISTING TAG TAXONOMY (top 100 most used):
[List of existing tags, e.g., "Mauryan Empire", "Buddhism", "Temple Architecture", ...]

TAG CATEGORIES:
- Period: e.g., "Mauryan Empire", "Chola Dynasty", "Medieval Period"
- Concept: e.g., "Maritime Trade", "Temple Architecture", "Ritual Practices"
- Location: e.g., "Tamil Nadu", "Kerala", "Indian Ocean"
- Methodology: e.g., "Epigraphy", "Archaeological Survey", "Textual Analysis"
- Subject: e.g., "Buddhism", "Sanskrit Literature", "Geomythology"

RULES:
1. Generate 5-8 tags that are specific and academically precise
2. PREFER existing tags when appropriate (normalize capitalization/spelling)
3. When creating new tags, follow the naming patterns of existing tags
4. Mix specific tags (dynasties, locations) with broader concepts
5. Include the theme if it's not already covered by other tags
6. Use proper capitalization for proper nouns
7. Avoid overly generic tags like "History" or "India" unless highly relevant

Return ONLY a JSON object:
{
  "tags": ["Tag 1", "Tag 2", "Tag 3", ...],
  "reasoning": "Brief explanation of tag choices"
}
```

#### **AI Model Configuration**
```typescript
{
  model: 'google/gemini-2.5-flash',
  temperature: 0.3,  // Lower = more consistent, focused tagging
}
```

**Why Gemini 2.5 Flash?**
- Fast processing (~1-2 seconds per article)
- Excellent at structured output (JSON)
- Strong multilingual support (Sanskrit, Pali, Tamil terms)
- Cost-effective for high-volume tagging

---

### **3. Fuzzy Matching & Normalization**

After AI generates tags, the system performs fuzzy matching to prevent duplicates:

```typescript
const normalizedTags = generatedTags.map((tag: string) => {
  const lowerTag = tag.toLowerCase();
  
  // Check for exact match (case-insensitive)
  const exactMatch = existingTags.find(et => et.toLowerCase() === lowerTag);
  if (exactMatch) return exactMatch;
  
  // Check for close variants (simple fuzzy matching)
  const closeMatch = existingTags.find(et => {
    const lowerExisting = et.toLowerCase();
    return lowerExisting.includes(lowerTag) || lowerTag.includes(lowerExisting);
  });
  
  if (closeMatch) {
    console.log(`🔄 Normalized "${tag}" → "${closeMatch}"`);
    return closeMatch;
  }
  
  return tag; // Keep as new tag
});
```

**Examples**:
- AI generates `"Mauryan empire"` → Normalized to existing `"Mauryan Empire"`
- AI generates `"Mauryans"` → Normalized to existing `"Mauryan Empire"`
- AI generates `"Ashoka the Great"` → Kept as new tag (no close match)

---

### **4. Tag Registry (`srangam_tags` table)**

Every tag is tracked in a central registry:

```sql
CREATE TABLE srangam_tags (
  id UUID PRIMARY KEY,
  tag TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT,  -- 'historical_period' | 'person' | 'concept' | 'location' | 'methodology' | 'subject'
  usage_count INTEGER DEFAULT 0,
  related_tags TEXT[],  -- Tags that frequently co-occur
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used TIMESTAMPTZ DEFAULT now()
);
```

#### **Automatic Usage Tracking**
```sql
-- Trigger automatically updates usage_count when article is saved
CREATE TRIGGER update_tag_stats
AFTER INSERT OR UPDATE OF tags ON srangam_articles
FOR EACH ROW
EXECUTE FUNCTION update_tag_usage();
```

**What this does**:
- Increments `usage_count` for each tag used
- Updates `last_used` timestamp
- Enables "trending tags" analytics
- Powers tag suggestions based on popularity

---

## 📊 **Example Output**

### **Article**: "Reassessing Ashoka's Legacy..."

**AI Generated Tags** (6 tags):
```json
{
  "tags": [
    "Mauryan Empire",      // Period (existing tag, normalized)
    "Ashoka",              // Person (new tag, created)
    "Buddhism",            // Subject (existing tag)
    "Ancient India",       // Location (existing tag, matches theme)
    "Epigraphy",           // Methodology (existing tag)
    "Political History"    // Concept (new tag, created)
  ],
  "reasoning": "Article focuses on Mauryan political history, specifically Ashoka's Buddhist policies. Epigraphy tag added due to reliance on rock edicts. Political History captures the reassessment theme."
}
```

**Database Updates**:
```sql
-- srangam_articles table
UPDATE srangam_articles 
SET tags = '{"Mauryan Empire", "Ashoka", "Buddhism", "Ancient India", "Epigraphy", "Political History"}'
WHERE slug = 'reassessing-ashoka-s-legacy';

-- srangam_tags table (auto-incremented via trigger)
UPDATE srangam_tags SET usage_count = usage_count + 1 WHERE tag = 'Mauryan Empire';
UPDATE srangam_tags SET usage_count = usage_count + 1 WHERE tag = 'Buddhism';
UPDATE srangam_tags SET usage_count = usage_count + 1 WHERE tag = 'Ancient India';
UPDATE srangam_tags SET usage_count = usage_count + 1 WHERE tag = 'Epigraphy';

-- New tags created
INSERT INTO srangam_tags (tag, display_name, category, usage_count) VALUES
  ('Ashoka', 'Ashoka', 'person', 1),
  ('Political History', 'Political History', 'concept', 1);
```

---

## 🧠 **Self-Improvement System**

### **Phase 4: Tag Relationship Analyzer**
**Edge Function**: `supabase/functions/analyze-tag-relationships/index.ts`

**Runs**: 
- Manually via `/admin/analytics` (future feature)
- Automatically every 100 article imports (future feature)
- Nightly cron job (future feature)

**Purpose**: Analyze tag co-occurrence and update `related_tags` field

**Algorithm**:
```typescript
// Find tags that frequently appear together
const tagPairs = await supabase.rpc('find_tag_cooccurrence', { min_count: 3 });

// Example result:
// tag_a: "Buddhism", tag_b: "Mauryan Empire", co_occurrence_count: 8

// Update related_tags
UPDATE srangam_tags
SET related_tags = ARRAY['Mauryan Empire', 'Ashoka', 'Ancient India', 'Kalinga War']
WHERE tag = 'Buddhism';
```

**Benefits**:
1. **Smarter AI prompts**: AI sees related tags in context, suggests more relevant combinations
2. **Tag suggestions**: When user types "Buddhism", suggest related tags like "Mauryan Empire"
3. **Clustering**: Identify topic clusters for book chapter compilation
4. **Anomaly detection**: Find articles with unusual tag combinations (possible misclassification)

---

## 🎯 **Success Metrics**

### **Quality Indicators**
- **Tag Consistency**: % of AI tags that match existing taxonomy (target: >60%)
- **Tag Diversity**: Avg tags per article (target: 5-8)
- **Cross-Reference Creation**: Avg cross-refs per article (target: 3-5)
- **User Edits**: % of AI tags manually changed (target: <20%)

### **Performance Metrics**
- **Generation Time**: <3 seconds per article (Gemini 2.5 Flash)
- **Cost**: ~$0.0001 per tag generation (Lovable AI free tier)
- **Success Rate**: >95% (valid JSON returned)

---

## 🔧 **Customization Options**

### **Adjust AI Temperature**
```typescript
// supabase/functions/generate-article-tags/index.ts (line ~119)
temperature: 0.3  // Lower = consistent, Higher = creative

// 0.1 = Very consistent (good for established taxonomy)
// 0.3 = Balanced (default, recommended)
// 0.5 = More creative (good for diverse content)
// 0.7 = Very creative (may create many new tags)
```

### **Change Tag Count**
```typescript
// System prompt (line ~76)
"Generate 5-8 tags..."  // Can change to 3-5, 8-12, etc.
```

### **Add Custom Rules**
```typescript
// Add to system prompt:
"8. Avoid political or controversial tags (e.g., 'Colonialism', 'Nationalism')"
"9. Always include at least one geographical tag"
"10. Prioritize Sanskrit terms when detected in cultural terms"
```

---

## 🐛 **Troubleshooting**

### **Issue**: AI returns empty tags array
**Cause**: Rate limit or API error  
**Solution**: Check edge function logs, verify LOVABLE_API_KEY is set

### **Issue**: Too many new tags created (not using existing tags)
**Cause**: Fuzzy matching threshold too strict  
**Solution**: Adjust matching algorithm to be more permissive

### **Issue**: Tags too generic ("History", "India")
**Cause**: AI prompt not specific enough  
**Solution**: Update system prompt with stricter rules, provide better examples

### **Issue**: AI generates non-English tags
**Cause**: Article has non-English title/content  
**Solution**: Add language detection, force English output in prompt

---

## 📚 **Related Documentation**
- [Import Workflow](./IMPORT_WORKFLOW.md)
- [Cross-Reference System](./CROSS_REFERENCE_SYSTEM.md) *(to be created)*
- [Tag Management UI Guide](./TAG_MANAGEMENT.md) *(to be created)*
