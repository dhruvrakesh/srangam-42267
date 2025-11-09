import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { parse as parseYaml } from 'https://deno.land/std@0.208.0/yaml/mod.ts';
import { Marked } from 'https://esm.sh/marked@11.1.1';

// Configure marked for synchronous parsing
const marked = new Marked({
  async: false,
  gfm: true,
  breaks: false,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FrontMatter {
  title: string | Record<string, string>;
  author?: string;
  date?: string;
  tags?: string[];
  theme?: string;
  readTime?: number;
  volume?: number;
  chapter?: number;
  slug?: string;
  dek?: string | Record<string, string>;
  [key: string]: any;
}

interface ImportRequest {
  markdownContent: string;
  overwriteExisting?: boolean;
  assignToChapter?: string;
}

interface ImportResponse {
  success: boolean;
  articleId?: string;
  slug?: string;
  stats?: {
    wordCount: number;
    termsExtracted: number;
    termsMatched?: number;
    termsCreated?: number;
    citationsCreated: number;
    readTimeMinutes: number;
    crossReferencesCreated?: number;
    markdownSourceSaved?: boolean;
  };
  error?: string;
}

// Extract frontmatter from markdown
function extractFrontmatter(markdown: string): { frontmatter: FrontMatter | null; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: null, content: markdown };
  }

  try {
    const frontmatter = parseYaml(match[1]) as FrontMatter;
    const content = match[2];
    return { frontmatter, content };
  } catch (error) {
    console.error('Error parsing frontmatter:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `YAML parsing failed. Make sure titles and other text fields are wrapped in quotes.\n\n` +
      `Example:\n` +
      `---\n` +
      `title: "Your Article Title Here"\n` +
      `author: "Author Name"\n` +
      `theme: "Ancient India"\n` +
      `---\n\n` +
      `Error details: ${errorMessage}`
    );
  }
}

// Extract citations from markdown (improved MLA9 format support)
function extractCitations(markdown: string): Array<{ text: string; url?: string; number?: number }> {
  const citations: Array<{ text: string; url?: string; number?: number }> = [];
  
  // Pattern 1: Inline MLA9 format - (Author, Title)
  const inlinePattern = /\(([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+([^)]+)\)/g;
  let match;
  
  while ((match = inlinePattern.exec(markdown)) !== null) {
    const author = match[1];
    const title = match[2];
    citations.push({
      text: `${author}, ${title}`,
    });
  }
  
  // Pattern 2: Numbered citations - [[1]](url)
  const numberedPattern = /\[\[(\d+)\]\]\(([^)]+)\)/g;
  while ((match = numberedPattern.exec(markdown)) !== null) {
    citations.push({
      text: match[0],
      url: match[2],
      number: parseInt(match[1])
    });
  }
  
  // Pattern 3: Bibliography section
  const bibliographyMatch = markdown.match(/##\s*(?:Bibliography|References|Works\s+Cited)\s*\n([\s\S]+?)(?=\n##|$)/i);
  
  if (bibliographyMatch) {
    const biblioText = bibliographyMatch[1];
    const entries = biblioText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
    
    entries.forEach(entry => citations.push({ text: entry }));
  }
  
  console.log(`Extracted ${citations.length} citations`);
  return citations;
}

// Extract cultural terms (terms in italics or with diacritics)
function extractCulturalTerms(markdown: string): string[] {
  const terms = new Set<string>();
  
  console.log('Starting cultural terms extraction...');
  
  // Enhanced pattern: *Term* or _Term_ (italics in markdown)
  const italicPattern = /[*_]([^*_\n]+)[*_]/g;
  let match;
  let totalMatches = 0;
  
  while ((match = italicPattern.exec(markdown)) !== null) {
    totalMatches++;
    const term = match[1].trim();
    
    // Comprehensive Sanskrit/Indic diacritics detection
    // Covers: IAST, Devanagari, and common transliteration patterns
    const hasSanskritDiacritics = /[āīūṛṝḷḹēōṁṃḥṇṭḍśṣñḻṅ]/i.test(term);
    const hasDevanagari = /[\u0900-\u097F]/i.test(term);
    const hasCommonSanskritWords = /\b(veda|purana|dharma|karma|bhakti|yoga|tantra|mantra|shastra|sutra)\b/i.test(term);
    
    const isSanskritTerm = term.length > 2 && (hasSanskritDiacritics || hasDevanagari || hasCommonSanskritWords);
    
    if (isSanskritTerm) {
      terms.add(term);
      console.log(`✓ Extracted term: "${term}" (diacritics: ${hasSanskritDiacritics}, devanagari: ${hasDevanagari})`);
    } else {
      console.log(`✗ Skipped: "${term}" (no Sanskrit markers)`);
    }
  }
  
  console.log(`Total italic patterns found: ${totalMatches}, Sanskrit terms extracted: ${terms.size}`);
  return Array.from(terms);
}

// Calculate word count
function calculateWordCount(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[āĀ]/g, 'a')
    .replace(/[īĪ]/g, 'i')
    .replace(/[ūŪ]/g, 'u')
    .replace(/[ṛṚṝṜ]/g, 'r')
    .replace(/[ḷḶḹḸ]/g, 'l')
    .replace(/[ṁṀ]/g, 'm')
    .replace(/[ḥḤ]/g, 'h')
    .replace(/[ṇṆ]/g, 'n')
    .replace(/[ṭṬḍḌ]/g, 't')
    .replace(/[śŚṣṢ]/g, 's')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { markdownContent, overwriteExisting = false, assignToChapter }: ImportRequest = await req.json();

    if (!markdownContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'markdownContent is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting markdown import...');

    // Step 1: Extract frontmatter
    const { frontmatter, content } = extractFrontmatter(markdownContent);
    
    if (!frontmatter) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No frontmatter found. Please add YAML frontmatter at the top of your markdown:\n\n---\ntitle: Your Article Title\nauthor: Author Name\ndate: 2025-11-09\ntheme: Ancient India\ntags: []\n---\n\nOr use the "Generate Frontmatter" button in the UI.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Frontmatter extracted:', frontmatter);

    // Step 2: Convert markdown to HTML
    const htmlContent = marked.parse(content);
    
    // Step 3: Calculate metadata
    const wordCount = calculateWordCount(content);
    const readTimeMinutes = Math.ceil(wordCount / 200);

    // Step 4: Extract citations
    const citations = extractCitations(content);
    console.log(`Extracted ${citations.length} citations`);

    // Step 5: Extract cultural terms
    const culturalTerms = extractCulturalTerms(content);
    console.log(`Extracted ${culturalTerms.length} cultural terms:`, culturalTerms);

    // Step 6: Prepare article data
    const titleText = typeof frontmatter.title === 'string' 
      ? frontmatter.title 
      : frontmatter.title?.en || 'Untitled';
    
    const slug = frontmatter.slug || generateSlug(titleText);
    
    // Extract tags and theme for use in cross-reference detection
    const tags = frontmatter.tags || [];
    const theme = frontmatter.theme || 'Ancient India';

    const articleData = {
      slug,
      title: typeof frontmatter.title === 'string' 
        ? { en: frontmatter.title }
        : frontmatter.title,
      dek: frontmatter.dek 
        ? (typeof frontmatter.dek === 'string' ? { en: frontmatter.dek } : frontmatter.dek)
        : null,
      content: { en: htmlContent },
      author: frontmatter.author || 'Nartiang Foundation Research Team',
      published_date: frontmatter.date || new Date().toISOString().split('T')[0],
      theme: theme,
      tags: tags,
      read_time_minutes: frontmatter.readTime || readTimeMinutes,
      status: 'published',
      featured: false,
    };

    console.log('Article data prepared:', { slug, title: articleData.title });

    // Step 7: Check if article exists
    let articleId: string;
    
    if (overwriteExisting) {
      const { data: existing } = await supabase
        .from('srangam_articles')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        // Update existing article
        const { error: updateError } = await supabase
          .from('srangam_articles')
          .update(articleData)
          .eq('id', existing.id);

        if (updateError) throw updateError;
        articleId = existing.id;
        console.log('Updated existing article:', articleId);
      } else {
        // Insert new article
        const { data: newArticle, error: insertError } = await supabase
          .from('srangam_articles')
          .insert(articleData)
          .select('id')
          .single();

        if (insertError) throw insertError;
        articleId = newArticle.id;
        console.log('Inserted new article:', articleId);
      }
    } else {
      // Insert new article
      const { data: newArticle, error: insertError } = await supabase
        .from('srangam_articles')
        .insert(articleData)
        .select('id')
        .single();

      if (insertError) throw insertError;
      articleId = newArticle.id;
      console.log('Inserted new article:', articleId);
    }

    // Step 8: Save original markdown source
    console.log('Saving markdown source for article:', articleId);
    
    const { error: markdownError } = await supabase
      .from('srangam_markdown_sources')
      .upsert({
        article_id: articleId,
        markdown_content: markdownContent,
        file_path: `${slug}.md`,
        sync_status: 'synced',
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'article_id'
      });

    if (markdownError) {
      console.error('❌ Error saving markdown source:', markdownError);
      console.error('Error code:', markdownError.code);
      console.error('Error details:', markdownError.details);
      console.error('Error hint:', markdownError.hint);
    } else {
      console.log('✅ Markdown source saved successfully');
    }

    // Step 9: Link to chapter if specified
    if (assignToChapter) {
      const { data: chapter } = await supabase
        .from('srangam_book_chapters')
        .select('id')
        .eq('chapter_id', assignToChapter)
        .single();

      if (chapter) {
        await supabase
          .from('srangam_article_chapters')
          .insert({
            article_id: articleId,
            chapter_id: chapter.id,
            sequence_number: 1,
          });
        console.log('Linked to chapter:', assignToChapter);
      }
    }

    // Step 10: Save cultural terms to database
    console.log(`Processing ${culturalTerms.length} cultural terms...`);
    let termsMatched = 0;
    let termsCreated = 0;
    const termsSaved: string[] = [];
    
    for (const term of culturalTerms) {
      const normalizedTerm = term.toLowerCase().trim();
      
      // Check if term already exists
      const { data: existingTerm, error: lookupError } = await supabase
        .from('srangam_cultural_terms')
        .select('id, term, usage_count')
        .ilike('term', normalizedTerm)
        .maybeSingle();

      if (lookupError) {
        console.error(`Error looking up term "${term}":`, lookupError);
        continue;
      }

      if (existingTerm) {
        // Increment usage count for existing term
        const { error: updateError } = await supabase
          .from('srangam_cultural_terms')
          .update({ usage_count: existingTerm.usage_count + 1 })
          .eq('id', existingTerm.id);
        
        if (!updateError) {
          termsMatched++;
          termsSaved.push(`${term} (matched, count: ${existingTerm.usage_count + 1})`);
          console.log(`✓ Incremented existing term: "${term}" → count: ${existingTerm.usage_count + 1}`);
        } else {
          console.error(`✗ Failed to increment term "${term}":`, updateError);
        }
      } else {
        // Create new term with basic metadata
        const { error: insertError } = await supabase
          .from('srangam_cultural_terms')
          .insert({
            term: normalizedTerm,
            translations: {
              en: term, // Original term as English entry
            },
            usage_count: 1,
            created_at: new Date().toISOString(),
          });

        if (!insertError) {
          termsCreated++;
          termsSaved.push(`${term} (new)`);
          console.log(`✓ Created new term: "${term}"`);
        } else {
          console.error(`✗ Failed to create term "${term}":`, insertError);
        }
      }
    }

    console.log(`\n📊 Cultural Terms Summary:`);
    console.log(`   - Total extracted: ${culturalTerms.length}`);
    console.log(`   - Matched existing: ${termsMatched}`);
    console.log(`   - Created new: ${termsCreated}`);
    console.log(`   - Successfully saved: ${termsSaved.length}`);
    console.log(`\n📝 Terms saved:`, termsSaved.slice(0, 10).join(', ') + (termsSaved.length > 10 ? '...' : ''));

    // ==========================================
    // STEP 11: GENERATE CROSS-REFERENCES
    // ==========================================
    console.log('\n🔗 Detecting cross-references...');

    const crossRefsToCreate = [];

    // Query existing PUBLISHED articles (exclude current article)
    const { data: existingArticles, error: articlesError } = await supabase
      .from('srangam_articles')
      .select('id, slug, tags, theme, title')
      .eq('status', 'published')
      .neq('id', articleId);

    if (articlesError) {
      console.error('Error querying articles for cross-references:', articlesError);
    } else if (existingArticles && existingArticles.length > 0) {
      console.log(`Analyzing ${existingArticles.length} existing articles...`);

      for (const other of existingArticles) {
        // A) TAG SIMILARITY SCORING
        const sharedTags = tags.filter(tag => other.tags?.includes(tag)) || [];
        
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
              detectedAt: new Date().toISOString(),
              detectionMethod: 'tag_similarity'
            }
          });
          console.log(`  ✓ Thematic link with "${other.title?.en || other.slug}" (${sharedTags.length} tags, strength: ${strength})`);
        }
        
        // B) SAME THEME MATCHING
        if (other.theme === theme && theme) {
          crossRefsToCreate.push({
            source_article_id: articleId,
            target_article_id: other.id,
            reference_type: 'same_theme',
            strength: 7,
            bidirectional: true,
            context_description: {
              theme,
              reason: `Both articles explore the theme: ${theme}`,
              detectedAt: new Date().toISOString(),
              detectionMethod: 'theme_matching'
            }
          });
          console.log(`  ✓ Theme link with "${other.title?.en || other.slug}" (theme: ${theme})`);
        }
      }
      
      // C) EXPLICIT TEXT REFERENCE DETECTION
      // Pattern: (see: article-slug) or (See: article-slug) or (See also: article-slug)
      const contentText = typeof articleData.content === 'string' 
        ? articleData.content 
        : (articleData.content && typeof articleData.content === 'object' && 'en' in articleData.content 
          ? String(articleData.content.en) 
          : JSON.stringify(articleData.content));
      
      const explicitRefs = contentText.match(/\(see:?\s+([a-z0-9-]+)\)/gi) || [];
      
      for (const ref of explicitRefs) {
        const match = ref.match(/\(see:?\s+([a-z0-9-]+)\)/i);
        if (match) {
          const targetSlug = match[1];
          const targetArticle = existingArticles.find(a => a.slug === targetSlug);
          
          if (targetArticle) {
            crossRefsToCreate.push({
              source_article_id: articleId,
              target_article_id: targetArticle.id,
              reference_type: 'explicit_citation',
              strength: 10,
              bidirectional: false,
              context_description: {
                citationText: ref,
                reason: `Explicitly cited in text: "${ref}"`,
                detectedAt: new Date().toISOString(),
                detectionMethod: 'text_pattern_matching'
              }
            });
            console.log(`  ✓ Explicit citation to "${targetArticle.title?.en || targetSlug}"`);
          } else {
            console.warn(`  ⚠️  Citation to unknown slug: "${targetSlug}"`);
          }
        }
      }
      
      // BULK INSERT CROSS-REFERENCES
      if (crossRefsToCreate.length > 0) {
        // Remove duplicates (same source + target + type)
        const uniqueRefs = crossRefsToCreate.filter((ref, index, self) =>
          index === self.findIndex(r => 
            r.source_article_id === ref.source_article_id &&
            r.target_article_id === ref.target_article_id &&
            r.reference_type === ref.reference_type
          )
        );
        
        const { error: xrefError } = await supabase
          .from('srangam_cross_references')
          .insert(uniqueRefs);
        
        if (xrefError) {
          console.error('❌ Error creating cross-references:', xrefError);
        } else {
          console.log(`✅ Created ${uniqueRefs.length} cross-references`);
        }
      } else {
        console.log('ℹ️  No cross-references detected');
      }
    } else {
      console.log('ℹ️  No existing articles to cross-reference');
    }

    // Step 12: Return success response
    const response: ImportResponse = {
      success: true,
      articleId,
      slug,
      stats: {
        wordCount,
        termsExtracted: culturalTerms.length,
        termsMatched,
        termsCreated,
        citationsCreated: citations.length,
        readTimeMinutes,
        crossReferencesCreated: crossRefsToCreate.length,
        markdownSourceSaved: !markdownError,
      },
    };

    console.log('Import complete:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in markdown import:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
