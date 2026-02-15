import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { classifyError } from '../_shared/error-response.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubFile {
  name: string;
  path: string;
  download_url: string;
}

interface DuplicateCheckResult {
  is_duplicate: boolean;
  confidence: number;
  method: 'exact' | 'title' | 'content_hash' | 'ai_semantic' | 'none' | 'error';
  matched_article?: any;
  reasoning?: string;
}

// Normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[–—_\-]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate Levenshtein distance for title similarity
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function calculateTitleSimilarity(title1: string, title2: string): number {
  const norm1 = normalizeText(title1);
  const norm2 = normalizeText(title2);
  
  const distance = levenshteinDistance(norm1, norm2);
  const maxLength = Math.max(norm1.length, norm2.length);
  
  return maxLength === 0 ? 100 : ((1 - distance / maxLength) * 100);
}

// Extract first N words from markdown content
function extractExcerpt(markdown: string, wordCount: number = 500): string {
  const words = markdown
    .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/[#*_`]/g, '') // Remove markdown formatting
    .split(/\s+/)
    .filter(w => w.length > 0);
  
  return words.slice(0, wordCount).join(' ');
}

// Calculate content hash
async function calculateContentHash(content: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// AI semantic comparison using Lovable AI
async function checkSemanticSimilarity(
  githubExcerpt: string,
  dbExcerpt: string
): Promise<{ similarity_score: number; reasoning: string; is_duplicate: boolean }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.warn('LOVABLE_API_KEY not configured, skipping AI comparison');
    return { similarity_score: 0, reasoning: 'AI not available', is_duplicate: false };
  }

  const prompt = `Compare these two article excerpts and determine if they are the same article or different articles.

Article A (GitHub):
${githubExcerpt.substring(0, 1000)}

Article B (Database):
${dbExcerpt.substring(0, 1000)}

Analyze if these are:
1. The same article (possibly with minor edits)
2. Different articles on similar topics
3. Completely different articles

Return a JSON object with:
- similarity_score (0-100): How similar the content is
- reasoning: Brief explanation of your analysis
- is_duplicate: true if same article, false if different

Focus on content substance, not formatting differences.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert at comparing academic articles. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return { similarity_score: 0, reasoning: 'AI API error', is_duplicate: false };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    
    const result = JSON.parse(jsonStr);
    return {
      similarity_score: result.similarity_score || 0,
      reasoning: result.reasoning || 'No reasoning provided',
      is_duplicate: result.is_duplicate || false
    };
  } catch (error) {
    console.error('AI semantic comparison error:', error);
    return { similarity_score: 0, reasoning: 'Error during AI analysis', is_duplicate: false };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { github_file, github_content }: { github_file: GitHubFile; github_content?: string } = await req.json();

    console.log(`🔍 Checking for duplicates: ${github_file.name}`);

    // Extract title from filename
    const githubTitle = github_file.name.replace(/\.md$/, '');

    // Fetch all articles from database
    const { data: articles, error: articlesError } = await supabase
      .from('srangam_articles')
      .select('id, slug, title, content, content_markdown_path')
      .eq('status', 'published');

    if (articlesError) throw articlesError;

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({
          is_duplicate: false,
          confidence: 0,
          method: 'none',
          reasoning: 'No articles in database to compare'
        } as DuplicateCheckResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Level 1: Title Similarity Check
    console.log('   Level 1: Title similarity check...');
    let bestTitleMatch: { article: any; similarity: number } | null = null;

    for (const article of articles) {
      const dbTitle = typeof article.title === 'object' ? (article.title as any).en : article.title;
      const similarity = calculateTitleSimilarity(githubTitle, dbTitle);
      
      if (!bestTitleMatch || similarity > bestTitleMatch.similarity) {
        bestTitleMatch = { article, similarity };
      }
    }

    // High confidence title match (>85%)
    if (bestTitleMatch && bestTitleMatch.similarity > 85) {
      console.log(`   ✅ High title similarity: ${bestTitleMatch.similarity.toFixed(1)}%`);
      return new Response(
        JSON.stringify({
          is_duplicate: true,
          confidence: bestTitleMatch.similarity,
          method: 'title',
          matched_article: bestTitleMatch.article,
          reasoning: `Title similarity: ${bestTitleMatch.similarity.toFixed(1)}%`
        } as DuplicateCheckResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Level 2: Content Hash Check (if content provided)
    if (github_content && bestTitleMatch && bestTitleMatch.similarity > 60) {
      console.log('   Level 2: Content hash check...');
      
      const githubExcerpt = extractExcerpt(github_content, 500);
      const githubHash = await calculateContentHash(githubExcerpt);

      const dbContent = bestTitleMatch.article.content;
      const dbText = typeof dbContent === 'object' ? (dbContent as any).en : dbContent;
      const dbExcerpt = extractExcerpt(dbText || '', 500);
      const dbHash = await calculateContentHash(dbExcerpt);

      if (githubHash === dbHash) {
        console.log('   ✅ Exact content hash match');
        return new Response(
          JSON.stringify({
            is_duplicate: true,
            confidence: 100,
            method: 'content_hash',
            matched_article: bestTitleMatch.article,
            reasoning: 'Identical content detected (exact hash match)'
          } as DuplicateCheckResult),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Level 3: AI Semantic Similarity (for uncertain matches)
      if (bestTitleMatch.similarity > 60) {
        console.log('   Level 3: AI semantic analysis...');
        
        const aiResult = await checkSemanticSimilarity(githubExcerpt, dbExcerpt);
        
        if (aiResult.is_duplicate) {
          console.log(`   ✅ AI confirmed duplicate: ${aiResult.similarity_score}%`);
          return new Response(
            JSON.stringify({
              is_duplicate: true,
              confidence: aiResult.similarity_score,
              method: 'ai_semantic',
              matched_article: bestTitleMatch.article,
              reasoning: aiResult.reasoning
            } as DuplicateCheckResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // No duplicate found
    console.log('   ✅ No duplicate detected - safe to import');
    return new Response(
      JSON.stringify({
        is_duplicate: false,
        confidence: bestTitleMatch?.similarity || 0,
        method: 'none',
        reasoning: `No significant match found (best title similarity: ${bestTitleMatch?.similarity.toFixed(1) || 0}%)`
      } as DuplicateCheckResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Duplicate detection error:', error);
    const detail = classifyError(error);
    return new Response(
      JSON.stringify({
        is_duplicate: false,
        confidence: 0,
        method: 'error',
        reasoning: detail.message,
        error: detail,
      } as DuplicateCheckResult & { error: any }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
