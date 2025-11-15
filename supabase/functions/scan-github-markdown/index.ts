import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string;
  type: string;
}

interface DuplicateMatch {
  github_file: GitHubFile;
  matched_article: any;
  confidence: number;
  method: string;
  reasoning?: string;
}

interface ScanResult {
  new_files: GitHubFile[];
  updated_files: GitHubFile[];
  synced_files: GitHubFile[];
  confirmed_duplicates: DuplicateMatch[];
  potential_duplicates: DuplicateMatch[];
  total_in_github: number;
  total_in_db: number;
  last_scan: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Scanning GitHub repository for markdown files...');

    // GitHub API endpoint for the data folder
    const githubApiUrl = 'https://api.github.com/repos/dhruvrakesh/srangam-42267/contents/data';
    
    const response = await fetch(githubApiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Srangam-Article-Sync'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const files: GitHubFile[] = await response.json();
    
    // Filter for markdown files only
    const markdownFiles = files.filter(f => 
      f.type === 'file' && 
      (f.name.endsWith('.md') || f.name.endsWith('.markdown'))
    );

    console.log(`📄 Found ${markdownFiles.length} markdown files in GitHub`);

    // Get all markdown sources from database
    const { data: dbSources, error: dbError } = await supabase
      .from('srangam_markdown_sources')
      .select('file_path, git_commit_hash, article_id, srangam_articles(slug, title)');

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log(`💾 Found ${dbSources?.length || 0} articles in database`);

    // Create map of file paths to database entries
    const dbMap = new Map(
      (dbSources || []).map(s => [s.file_path, s])
    );

    // Categorize files with duplicate detection
    const newFiles: GitHubFile[] = [];
    const updatedFiles: GitHubFile[] = [];
    const syncedFiles: GitHubFile[] = [];
    const confirmedDuplicates: DuplicateMatch[] = [];
    const potentialDuplicates: DuplicateMatch[] = [];

    console.log('🔍 Starting duplicate detection analysis...');

    for (const file of markdownFiles) {
      const dbEntry = dbMap.get(file.path);
      
      if (dbEntry && dbEntry.git_commit_hash === file.sha) {
        // Exact match - file is synced
        syncedFiles.push(file);
        continue;
      } else if (dbEntry && dbEntry.git_commit_hash !== file.sha) {
        // File exists but hash changed (file was updated)
        updatedFiles.push(file);
        console.log(`🔄 Updated file: ${file.name} (hash changed)`);
        continue;
      }

      // File not in database by path - check for duplicates
      try {
        // Fetch markdown content for duplicate detection
        const mdResponse = await fetch(file.download_url);
        let githubContent = '';
        
        if (mdResponse.ok) {
          githubContent = await mdResponse.text();
        }

        // Call duplicate detection function
        const { data: duplicateCheck, error: dupError } = await supabase.functions.invoke(
          'detect-duplicate-articles',
          {
            body: {
              github_file: file,
              github_content: githubContent
            }
          }
        );

        if (dupError) {
          console.error(`Error checking duplicates for ${file.name}:`, dupError);
          newFiles.push(file);
          continue;
        }

        if (duplicateCheck.is_duplicate) {
          const duplicateMatch: DuplicateMatch = {
            github_file: file,
            matched_article: duplicateCheck.matched_article,
            confidence: duplicateCheck.confidence,
            method: duplicateCheck.method,
            reasoning: duplicateCheck.reasoning
          };

          // High confidence duplicates (>90%)
          if (duplicateCheck.confidence > 90) {
            confirmedDuplicates.push(duplicateMatch);
            console.log(`🔴 Confirmed duplicate: ${file.name} (${duplicateCheck.confidence.toFixed(1)}%)`);
          } else {
            // Medium confidence (60-90%)
            potentialDuplicates.push(duplicateMatch);
            console.log(`🟡 Potential duplicate: ${file.name} (${duplicateCheck.confidence.toFixed(1)}%)`);
          }
        } else {
          // Not a duplicate - genuinely new file
          newFiles.push(file);
          console.log(`🆕 New file: ${file.name}`);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        newFiles.push(file); // Default to treating as new if error
      }

      // Rate limiting: wait 300ms between files to avoid API throttling
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const result: ScanResult = {
      new_files: newFiles,
      updated_files: updatedFiles,
      synced_files: syncedFiles,
      confirmed_duplicates: confirmedDuplicates,
      potential_duplicates: potentialDuplicates,
      total_in_github: markdownFiles.length,
      total_in_db: dbSources?.length || 0,
      last_scan: new Date().toISOString()
    };

    console.log('📊 Scan Summary:');
    console.log(`   - New files: ${newFiles.length}`);
    console.log(`   - Updated files: ${updatedFiles.length}`);
    console.log(`   - Synced files: ${syncedFiles.length}`);
    console.log(`   - Confirmed duplicates: ${confirmedDuplicates.length}`);
    console.log(`   - Potential duplicates: ${potentialDuplicates.length}`);
    console.log(`   - Total in GitHub: ${markdownFiles.length}`);
    console.log(`   - Total in DB: ${dbSources?.length || 0}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scanning GitHub repository:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
