import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { Marked } from 'https://esm.sh/marked@11.1.1';

const marked = new Marked({ async: false, gfm: true, breaks: false });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Parse MLA9 bibliography entry
 * Example: Singh, Ganda. Ahmad Shah Durrani: Father of Modern Afghanistan. Asia Publishing House, 1959.
 */
interface BibliographyEntry {
  citation_key: string;
  entry_type: string;
  authors: { first: string; last: string }[];
  title: string;
  year: number | null;
  publisher?: string;
  full_citation_mla: string;
  tags: string[];
}

function parseMLA9Entry(entry: string): BibliographyEntry | null {
  const trimmed = entry.trim();
  if (trimmed.length < 20) return null;
  
  // Skip list markers
  const cleanEntry = trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
  
  // Pattern: Author Last, First. Title. Publisher, Year.
  // Try to extract author(s) - look for pattern ending with period before title
  const authorMatch = cleanEntry.match(/^([A-Z][a-zāīūṛḷṁṃḥṇṭḍśṣñ]+(?:\s+(?:and|&)\s+[A-Z][a-zāīūṛḷṁṃḥṇṭḍśṣñ]+)*),?\s+([A-Z][a-zāīūṛḷṁṃḥṇṭḍśṣñ.]+(?:\s+[A-Z]\.)?)\.\s*/i);
  
  let authors: { first: string; last: string }[] = [];
  let remaining = cleanEntry;
  
  if (authorMatch) {
    authors.push({ last: authorMatch[1], first: authorMatch[2] });
    remaining = cleanEntry.slice(authorMatch[0].length);
  }
  
  // Extract year (look for 4-digit number)
  const yearMatch = cleanEntry.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;
  
  // Extract title (usually in italics or before publisher)
  const titleMatch = remaining.match(/^([^.]+)\./);
  const title = titleMatch ? titleMatch[1].replace(/[*_]/g, '').trim() : remaining.slice(0, 100);
  
  // Generate citation key: lastname_year
  const lastName = authors[0]?.last?.toLowerCase().replace(/[^a-z]/g, '') || 'unknown';
  const citation_key = year ? `${lastName}_${year}` : `${lastName}_${Date.now()}`;
  
  // Detect entry type
  let entry_type = 'book';
  if (/journal|proceedings|vol\.|issue/i.test(cleanEntry)) entry_type = 'article';
  if (/inscription|epigraph|copper plate/i.test(cleanEntry)) entry_type = 'inscription';
  if (/manuscript|ms\./i.test(cleanEntry)) entry_type = 'manuscript';
  
  return {
    citation_key,
    entry_type,
    authors,
    title,
    year,
    publisher: undefined,
    full_citation_mla: cleanEntry,
    tags: [],
  };
}

/**
 * Extract bibliography section from markdown
 */
function extractBibliography(markdown: string): BibliographyEntry[] {
  const entries: BibliographyEntry[] = [];
  
  // Find bibliography section
  const biblioMatch = markdown.match(/##\s*(?:Bibliography|References|Works\s+Cited|Sources)\s*\n([\s\S]+?)(?=\n##|$)/i);
  
  if (!biblioMatch) {
    console.log('No bibliography section found');
    return entries;
  }
  
  const biblioText = biblioMatch[1];
  const lines = biblioText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 20 && !line.startsWith('#'));
  
  console.log(`Found ${lines.length} potential bibliography entries`);
  
  for (const line of lines) {
    const entry = parseMLA9Entry(line);
    if (entry) {
      entries.push(entry);
    }
  }
  
  return entries;
}

/**
 * Extract evidence table data from HTML content
 */
interface EvidenceEntry {
  date_approx: string | null;
  place: string | null;
  actors: string[];
  event_description: string | null;
  significance: string | null;
  source_quality: 'primary' | 'secondary' | 'tradition';
}

function extractEvidenceTableData(htmlContent: string): EvidenceEntry[] {
  const entries: EvidenceEntry[] = [];
  
  // Find all tables
  const tableMatches = htmlContent.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  
  for (const tableMatch of tableMatches) {
    const tableHtml = tableMatch[1];
    
    // Check for scholarly headers (multilingual: English, Hindi, Punjabi, Tamil)
    const hasScholarlyHeaders = 
      // English patterns
      /(?:Date|Sl\.?\s*#?).*(?:Place|Location).*(?:Event|Actor)/i.test(tableHtml) ||
      // Hindi patterns (तिथि = Date, स्थान = Place, घटना = Event)
      /(?:तिथि|Date).*(?:स्थान|Place).*(?:घटना|Event)/i.test(tableHtml) ||
      // Punjabi patterns (ਤਾਰੀਖ = Date, ਥਾਂ = Place, ਘਟਨਾ = Event)
      /(?:ਤਾਰੀਖ|ਮਿਤੀ).*(?:ਥਾਂ|ਸਥਾਨ).*(?:ਘਟਨਾ|ਵਾਕਿਆ)/i.test(tableHtml) ||
      // Tamil patterns (தேதி = Date, இடம் = Place, நிகழ்வு = Event)
      /(?:தேதி).*(?:இடம்).*(?:நிகழ்வு)/i.test(tableHtml) ||
      // Generic: 6+ column scholarly table with source quality indicators
      /(?:Primary|Secondary|Tradition|ਸਬੂਤ|ਪ੍ਰਮਾਣ|प्राथमिक|द्वितीयक|प्रमाण)/i.test(tableHtml) ||
      // Fallback: Table with Evidence/Conf. column header
      /<th[^>]*>(?:Evidence|ਪ੍ਰਮਾਣ|प्रमाण|Conf\.?|Source\s*Quality)/i.test(tableHtml);
    
    if (!hasScholarlyHeaders) continue;
    
    console.log('Found scholarly evidence table (multilingual pattern matched)');
    
    // Extract rows
    const rowMatches = tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    let isHeader = true;
    
    for (const rowMatch of rowMatches) {
      if (isHeader) {
        isHeader = false;
        continue;
      }
      
      // Extract cells
      const cellMatches = [...rowMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)];
      const cells = cellMatches.map(m => m[1].replace(/<[^>]+>/g, '').trim());
      
      if (cells.length >= 5) {
        // Detect source quality from last column
        const evidenceCol = cells[cells.length - 1]?.toLowerCase() || '';
        let source_quality: 'primary' | 'secondary' | 'tradition' = 'secondary';
        
        if (/primary|inscription|akhbarat|manuscript|epigraphy/i.test(evidenceCol)) {
          source_quality = 'primary';
        } else if (/oral|tradition|folklore|memory|legend/i.test(evidenceCol)) {
          source_quality = 'tradition';
        }
        
        entries.push({
          date_approx: cells[0] || null,
          place: cells[1] || null,
          actors: cells[2] ? cells[2].split(/[;,]/).map(a => a.trim()).filter(Boolean) : [],
          event_description: cells[3] || null,
          significance: cells[4] || null,
          source_quality,
        });
      }
    }
  }
  
  console.log(`Extracted ${entries.length} evidence entries`);
  return entries;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { articleId, dryRun = false } = await req.json().catch(() => ({}));

    console.log('Starting bibliography backfill...', { articleId, dryRun });

    // Fetch markdown sources
    let query = supabase
      .from('srangam_markdown_sources')
      .select('id, article_id, markdown_content, file_path')
      .not('markdown_content', 'is', null);
    
    if (articleId) {
      query = query.eq('article_id', articleId);
    }
    
    const { data: sources, error: sourcesError } = await query;
    
    if (sourcesError) throw sourcesError;
    
    console.log(`Found ${sources?.length || 0} markdown sources to process`);
    
    const stats = {
      articlesProcessed: 0,
      bibliographyEntriesCreated: 0,
      articleBibliographyLinksCreated: 0,
      evidenceEntriesCreated: 0,
      errors: [] as string[],
    };
    
    for (const source of sources || []) {
      try {
        console.log(`\nProcessing article: ${source.file_path}`);
        
        // Extract bibliography
        const bibliography = extractBibliography(source.markdown_content);
        console.log(`  - Found ${bibliography.length} bibliography entries`);
        
        // Convert markdown to HTML for evidence extraction
        const htmlContent = marked.parse(source.markdown_content) as string;
        
        // Debug: Verify table conversion
        const markdownTableCount = (source.markdown_content.match(/\|[^\n]+\n\|[-:| ]+\n/g) || []).length;
        const htmlTableCount = (htmlContent.match(/<table/gi) || []).length;
        console.log(`  - Markdown tables: ${markdownTableCount}, HTML tables: ${htmlTableCount}`);
        
        if (markdownTableCount > htmlTableCount) {
          console.log('  ⚠️ WARNING: Some markdown tables not converted to HTML');
        }
        
        const evidence = extractEvidenceTableData(htmlContent);
        console.log(`  - Found ${evidence.length} evidence entries`);
        
        if (dryRun) {
          stats.articlesProcessed++;
          stats.bibliographyEntriesCreated += bibliography.length;
          stats.evidenceEntriesCreated += evidence.length;
          continue;
        }
        
        // Insert bibliography entries
        for (const entry of bibliography) {
          // Check if citation already exists
          const { data: existing } = await supabase
            .from('srangam_bibliography_entries')
            .select('id')
            .eq('citation_key', entry.citation_key)
            .maybeSingle();
          
          let bibliographyId: string;
          
          if (existing) {
            bibliographyId = existing.id;
            // Increment citation count
            await supabase
              .from('srangam_bibliography_entries')
              .update({ citation_count: supabase.rpc('increment', { x: 1 }) })
              .eq('id', existing.id);
          } else {
            // Insert new entry
            const { data: newEntry, error: insertError } = await supabase
              .from('srangam_bibliography_entries')
              .insert({
                citation_key: entry.citation_key,
                entry_type: entry.entry_type,
                authors: entry.authors,
                title: { en: entry.title },
                year: entry.year,
                full_citation_mla: entry.full_citation_mla,
                tags: entry.tags,
              })
              .select('id')
              .single();
            
            if (insertError) {
              console.error(`  - Error inserting bibliography: ${insertError.message}`);
              stats.errors.push(`${source.file_path}: ${insertError.message}`);
              continue;
            }
            
            bibliographyId = newEntry.id;
            stats.bibliographyEntriesCreated++;
          }
          
          // Link article to bibliography
          const { error: linkError } = await supabase
            .from('srangam_article_bibliography')
            .upsert({
              article_id: source.article_id,
              bibliography_id: bibliographyId,
              is_primary_source: entry.entry_type === 'inscription' || entry.entry_type === 'manuscript',
            }, {
              onConflict: 'article_id,bibliography_id',
              ignoreDuplicates: true,
            });
          
          if (!linkError) {
            stats.articleBibliographyLinksCreated++;
          }
        }
        
        // Insert evidence entries
        for (const entry of evidence) {
          const { error: evidenceError } = await supabase
            .from('srangam_article_evidence')
            .insert({
              article_id: source.article_id,
              date_approx: entry.date_approx,
              place: entry.place,
              actors: entry.actors,
              event_description: entry.event_description,
              significance: entry.significance,
              source_quality: entry.source_quality,
            });
          
          if (!evidenceError) {
            stats.evidenceEntriesCreated++;
          } else {
            console.error(`  - Error inserting evidence: ${evidenceError.message}`);
          }
        }
        
        stats.articlesProcessed++;
        
      } catch (articleError) {
        const msg = articleError instanceof Error ? articleError.message : String(articleError);
        console.error(`Error processing ${source.file_path}:`, msg);
        stats.errors.push(`${source.file_path}: ${msg}`);
      }
    }
    
    console.log('\n📊 Backfill Summary:', stats);
    
    return new Response(JSON.stringify({
      success: true,
      dryRun,
      stats,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Backfill error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
