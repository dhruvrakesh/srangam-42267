# Markdown Frontmatter Guide for Article Imports

## Overview
This guide explains how to structure your markdown files for successful import into the Srangam Digital platform.

---

## Frontmatter Structure

Every markdown article **must** begin with YAML frontmatter enclosed in triple dashes (`---`). Here's the complete structure:

```yaml
---
title: "Your Article Title Here"
author: "Author Name"
date: "2025-11-09"
theme: "Ancient India"
tags: 
  - "Tag 1"
  - "Tag 2"
  - "Tag 3"
readTime: 15
slug: "optional-custom-slug"
---
```

---

## Required Fields

### `title` (Required)
The main title of your article. Use quotes if it contains special characters.

**Example:**
```yaml
title: "Reassessing Ashoka's Legacy: Buddhism, Politics, and Ancient Indian Sects"
```

### `author` (Required)
The author or research team name.

**Example:**
```yaml
author: "Nartiang Foundation Research Team"
```

### `theme` (Required)
The broad thematic category. Must match one of these:
- `Ancient India`
- `Maritime Studies`
- `Cultural Heritage`
- `Indigenous Knowledge`
- `Archaeological Research`

**Example:**
```yaml
theme: "Ancient India"
```

---

## Important Fields for Cross-References

### `tags` (Highly Recommended)
An array of topic tags that enable **automatic cross-reference detection**. Articles sharing 2+ tags will be automatically linked with a "thematic" relationship.

**Guidelines:**
- Use 5-8 descriptive tags per article
- Be specific (e.g., "Mauryan Empire" not just "India")
- Include key concepts, historical figures, time periods, and methodologies
- Capitalize proper nouns
- Use quotes for multi-word tags

**Example:**
```yaml
tags: 
  - "Buddhism"
  - "Mauryan Empire"
  - "Ashoka"
  - "Religious Politics"
  - "Kalinga War"
  - "Shunga Dynasty"
  - "Jainism"
  - "Nath Yogis"
```

**Effect on Cross-References:**
```
Article A tags: ["Buddhism", "Mauryan Empire", "Ashoka"]
Article B tags: ["Buddhism", "Mauryan Empire", "Gupta Empire"]
→ Auto-creates thematic cross-reference (2 shared tags, strength: 4)
```

---

## Optional Fields

### `date`
Publication or research date in `YYYY-MM-DD` format.

**Example:**
```yaml
date: "2025-11-09"
```

### `readTime`
Estimated reading time in minutes. If omitted, it's auto-calculated from word count.

**Example:**
```yaml
readTime: 21
```

### `slug`
Custom URL-friendly identifier. If omitted, auto-generated from title.

**Example:**
```yaml
slug: "ashoka-legacy-buddhism-politics"
```

---

## Complete Example: Ashoka Article

```yaml
---
title: "Reassessing Ashoka's Legacy: Buddhism, Politics, and Ancient Indian Sects"
author: "Nartiang Foundation Research Team"
date: "2025-11-09"
theme: "Ancient India"
tags: 
  - "Buddhism"
  - "Mauryan Empire"
  - "Ashoka"
  - "Religious Politics"
  - "Kalinga War"
  - "Shunga Dynasty"
  - "Pushyamitra"
  - "Jainism"
  - "Kharavela"
  - "Nath Yogis"
  - "Goraksha Nath"
  - "Tantric Buddhism"
readTime: 21
---

# Your Article Content Here

Your markdown content goes here...
```

---

## Tag Selection Strategy

### Good Tag Examples:

✅ **Specific Historical Figures:**
- "Ashoka"
- "Kharavela"
- "Pushyamitra Shunga"
- "Goraksha Nath"

✅ **Time Periods:**
- "Mauryan Empire"
- "Shunga Dynasty"
- "Post-Mauryan Era"

✅ **Religious/Philosophical Concepts:**
- "Buddhism"
- "Jainism"
- "Vedic Tradition"
- "Tantric Buddhism"

✅ **Geographic Regions:**
- "Kalinga"
- "Magadha"
- "Bodh Gaya"

✅ **Research Topics:**
- "Religious Politics"
- "State Patronage"
- "Sectarian Conflicts"
- "Yogic Traditions"

### Avoid These:

❌ **Too Generic:**
- "India"
- "History"
- "Ancient"

❌ **Too Narrow:**
- "Page 12 of Smith's book"
- "First footnote"

❌ **Duplicate Concepts:**
```yaml
# Bad - redundant
tags: ["Buddhism", "Buddhist", "Buddhist Philosophy", "Buddhist Tradition"]

# Good - distinct concepts
tags: ["Buddhism", "Mahayana", "Vajrayana", "Theravada"]
```

---

## Cross-Reference Detection Methods

The import system automatically detects relationships using:

### 1. **Tag Similarity** (Thematic References)
- **Trigger:** 2+ shared tags
- **Strength:** 2 points per shared tag (max 10)
- **Bidirectional:** Yes

**Example:**
```
Article A: ["Buddhism", "Ashoka", "Mauryan Empire"]
Article B: ["Buddhism", "Mauryan Empire", "Chandragupta"]
→ Creates: thematic reference, strength 4 (2 shared tags)
```

### 2. **Same Theme** (Theme-Based References)
- **Trigger:** Exact theme match
- **Strength:** 7
- **Bidirectional:** Yes

**Example:**
```
Article A: theme "Ancient India"
Article B: theme "Ancient India"
→ Creates: same_theme reference, strength 7
```

### 3. **Explicit Citations** (Manual Links)
- **Trigger:** Text pattern `(see: article-slug)` or `(See also: article-slug)`
- **Strength:** 10
- **Bidirectional:** No

**Example in article text:**
```markdown
For more on the Shunga reaction, (see: shunga-dynasty-revival).
```

---

## Cultural Terms Detection

The system automatically extracts **Sanskrit/Indic terms** from:
- Italicized text with diacritics: *śāstra*, *Aśoka*, *Nāth*
- Devanagari script: नाथ, अशोक
- Capitalized Indic terms: Dharma, Kalinga, Yupa

**Tips for better extraction:**
- Italicize cultural terms on first use: `*Dharma*`
- Use proper diacritics: `ā ī ū ṛ ṝ ḷ ḹ ē ō ṃ ḥ ṅ ñ ṭ ḍ ṇ ś ṣ`
- Capitalize proper nouns: `Magadha`, `Ashoka`

**What to avoid:**
- URLs in italics (filtered out)
- Long phrases >50 characters (filtered out)
- Markdown syntax in italics (filtered out)

---

## Import Process Checklist

Before importing, verify:

- [ ] Frontmatter starts and ends with `---`
- [ ] Title, author, and theme are provided
- [ ] 5-8 descriptive tags included
- [ ] Tags use proper capitalization and quotes
- [ ] Date in `YYYY-MM-DD` format (if provided)
- [ ] Cultural terms properly italicized
- [ ] Explicit cross-references use `(see: slug)` format

---

## Testing Your Frontmatter

Use a YAML validator before importing:
- https://www.yamllint.com/
- Look for syntax errors (missing quotes, indentation issues)

**Common Errors:**

❌ **Missing quotes for colons:**
```yaml
title: Ashoka's Legacy: A Study  # ERROR
```

✅ **Fixed:**
```yaml
title: "Ashoka's Legacy: A Study"
```

❌ **Incorrect tag array:**
```yaml
tags: "Buddhism, Mauryan Empire"  # ERROR - should be array
```

✅ **Fixed:**
```yaml
tags: 
  - "Buddhism"
  - "Mauryan Empire"
```

---

## Support

For questions about markdown formatting or import issues, contact:
research@nartiang.org

---

**Last Updated:** 2025-11-09
**Version:** 1.0
