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

interface ScanResult {
  new_files: GitHubFile[];
  updated_files: GitHubFile[];
  synced_files: GitHubFile[];
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

    // Categorize files
    const newFiles: GitHubFile[] = [];
    const updatedFiles: GitHubFile[] = [];
    const syncedFiles: GitHubFile[] = [];

    for (const file of markdownFiles) {
      const dbEntry = dbMap.get(file.path);
      
      if (!dbEntry) {
        // File exists in GitHub but not in database
        newFiles.push(file);
        console.log(`🆕 New file: ${file.name}`);
      } else if (dbEntry.git_commit_hash !== file.sha) {
        // File exists but hash changed (file was updated)
        updatedFiles.push(file);
        console.log(`🔄 Updated file: ${file.name} (hash changed)`);
      } else {
        // File is synced
        syncedFiles.push(file);
      }
    }

    const result: ScanResult = {
      new_files: newFiles,
      updated_files: updatedFiles,
      synced_files: syncedFiles,
      total_in_github: markdownFiles.length,
      total_in_db: dbSources?.length || 0,
      last_scan: new Date().toISOString()
    };

    console.log('📊 Scan Summary:');
    console.log(`   - New files: ${newFiles.length}`);
    console.log(`   - Updated files: ${updatedFiles.length}`);
    console.log(`   - Synced files: ${syncedFiles.length}`);
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
