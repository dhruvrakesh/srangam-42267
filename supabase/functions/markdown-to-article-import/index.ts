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
    citationsCreated: number;
    readTimeMinutes: number;
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

// Extract citations from markdown
function extractCitations(markdown: string): Array<{ text: string; url?: string; number?: number }> {
  const citations: Array<{ text: string; url?: string; number?: number }> = [];
  
  // Pattern: [[1]](url) or [Author Year] or (Author, Year)
  const citationPatterns = [
    /\[\[(\d+)\]\]\(([^)]+)\)/g,  // [[1]](url)
    /\[([^\]]+\s+\d{4}[a-z]?)\]/g, // [Author 2020]
    /\(([^)]+,\s*\d{4}[a-z]?)\)/g, // (Author, 2020)
  ];

  citationPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(markdown)) !== null) {
      if (match[2]) {
        // Numbered citation with URL
        citations.push({
          text: match[0],
          url: match[2],
          number: parseInt(match[1])
        });
      } else {
        // Author-year citation
        citations.push({
          text: match[1],
        });
      }
    }
  });

  return citations;
}

// Extract cultural terms (terms in italics or with diacritics)
function extractCulturalTerms(markdown: string): string[] {
  const terms = new Set<string>();
  
  // Pattern: *Term* or _Term_ (italics in markdown)
  const italicPattern = /[*_]([^*_]+)[*_]/g;
  let match;
  
  while ((match = italicPattern.exec(markdown)) !== null) {
    const term = match[1].trim();
    // Only include if it contains Sanskrit/Indic characters or diacritics
    if (term.length > 2 && /[āīūṛṝḷḹēōṁḥṇṭḍśṣ]/i.test(term)) {
      terms.add(term);
    }
  }

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
      theme: frontmatter.theme || 'Ancient India',
      tags: frontmatter.tags || [],
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
      console.error('Error saving markdown source:', markdownError);
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

    // Step 10: Match and increment cultural terms
    let termsMatched = 0;
    for (const term of culturalTerms) {
      const normalizedTerm = term.toLowerCase();
      const { data: existingTerm } = await supabase
        .from('srangam_cultural_terms')
        .select('id')
        .ilike('term', normalizedTerm)
        .single();

      if (existingTerm) {
        await supabase.rpc('srangam_increment_term_usage', { term_key: normalizedTerm });
        termsMatched++;
      }
    }

    console.log(`Matched ${termsMatched} existing cultural terms`);

    // Step 11: Return success response
    const response: ImportResponse = {
      success: true,
      articleId,
      slug,
      stats: {
        wordCount,
        termsExtracted: culturalTerms.length,
        citationsCreated: citations.length,
        readTimeMinutes,
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
