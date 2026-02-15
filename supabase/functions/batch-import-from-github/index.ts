import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { classifyError } from '../_shared/error-response.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  download_url: string;
}

interface ImportResult {
  file_path: string;
  file_name: string;
  success: boolean;
  article_slug?: string;
  article_id?: string;
  error?: string;
  stats?: any;
}

interface BatchImportRequest {
  files: GitHubFile[];
  overwrite_existing?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { files, overwrite_existing = false }: BatchImportRequest = await req.json();

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No files provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚀 Starting batch import of ${files.length} files...`);
    console.log(`⚙️ Overwrite mode: ${overwrite_existing}`);

    const results: ImportResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n📝 [${i + 1}/${files.length}] Processing: ${file.name}`);

      try {
        // Fetch raw markdown from GitHub
        console.log(`   Fetching from: ${file.download_url}`);
        const mdResponse = await fetch(file.download_url);
        
        if (!mdResponse.ok) {
          throw new Error(`Failed to fetch file: ${mdResponse.statusText}`);
        }

        const markdownContent = await mdResponse.text();
        console.log(`   ✓ Fetched ${markdownContent.length} characters`);

        // Check for duplicates before importing
        console.log(`   🔍 Checking for duplicates...`);
        const { data: duplicateCheck, error: dupError } = await supabase.functions.invoke(
          'detect-duplicate-articles',
          {
            body: {
              github_file: file,
              github_content: markdownContent
            }
          }
        );

        if (!dupError && duplicateCheck?.is_duplicate && duplicateCheck.confidence > 90 && !overwrite_existing) {
          console.log(`   ⏭️ Skipping - High confidence duplicate (${duplicateCheck.confidence.toFixed(1)}%)`);
          
          results.push({
            file_path: file.path,
            file_name: file.name,
            success: false,
            error: `Duplicate of existing article: "${duplicateCheck.matched_article?.title?.en || duplicateCheck.matched_article?.slug}" (${duplicateCheck.confidence.toFixed(1)}% confidence, ${duplicateCheck.method})`
          });
          
          failureCount++;
          continue; // Skip this file
        }

        // Call markdown-to-article-import function
        const { data: importData, error: importError } = await supabase.functions.invoke(
          'markdown-to-article-import',
          {
            body: {
              markdownContent,
              overwriteExisting: overwrite_existing,
              githubFilePath: file.path,
              githubCommitHash: file.sha,
            }
          }
        );

        if (importError) {
          throw importError;
        }

        if (!importData.success) {
          throw new Error(importData.error || 'Import failed');
        }

        console.log(`   ✅ Success: ${importData.slug}`);
        
        results.push({
          file_path: file.path,
          file_name: file.name,
          success: true,
          article_slug: importData.slug,
          article_id: importData.articleId,
          stats: importData.stats
        });
        
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        results.push({
          file_path: file.path,
          file_name: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        failureCount++;
      }

      // Rate limiting: wait 500ms between files to avoid throttling
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`\n🎉 Batch import complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📊 Total: ${files.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        total: files.length,
        succeeded: successCount,
        failed: failureCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Batch import error:', error);
    const detail = classifyError(error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: detail,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
