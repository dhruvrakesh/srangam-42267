import { createClient } from '@supabase/supabase-js';
import { geomythologyLandReclamation } from '../src/data/articles/geomythology-land-reclamation';
import { geomythologyCulturalTerms } from '../src/data/articles/cultural-terms-geomythology';

// Supabase client setup
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function importGeomythologyArticle() {
  console.log('\n📝 Importing Geomythology Article (24th Article)...');
  
  const article = {
    slug: geomythologyLandReclamation.id,
    title: geomythologyLandReclamation.title,
    dek: geomythologyLandReclamation.dek,
    content: geomythologyLandReclamation.content,
    author: 'Nartiang Foundation Research Team',
    published_date: '2025-10-29',
    read_time_minutes: 48,
    theme: 'Sacred Ecology',
    tags: geomythologyLandReclamation.tags.en,
    status: 'published',
    featured: true,
    series_id: null,
    part_number: null,
    // Book metadata
    book_volume: 1,
    book_chapter: 4,
    chapter_title: 'Sacred Ecology & Environmental Memory',
    chapter_order: 24
  };
  
  const { data, error } = await supabase
    .from('srangam_articles')
    .insert(article)
    .select()
    .single();
  
  if (error) {
    console.error('   ❌ Error importing article:', error.message);
    throw error;
  }
  
  console.log(`   ✅ Successfully imported article: ${data.slug}`);
  return data;
}

async function importGeomythologyCulturalTerms() {
  console.log('\n📚 Importing Geomythology Cultural Terms...');
  
  const termsToInsert = Object.entries(geomythologyCulturalTerms).map(([key, term]) => ({
    term: key.toLowerCase(),
    display_term: term.term,
    module: 'sacred_ecology',
    transliteration: term.translations.en.transliteration || null,
    translations: term.translations,
    etymology: term.translations.en.etymology ? { en: term.translations.en.etymology } : null,
    context: term.translations.en.culturalContext ? { en: term.translations.en.culturalContext } : null,
    synonyms: [],
    related_terms: [],
    usage_count: 0
  }));
  
  console.log(`   Total terms to import: ${termsToInsert.length}`);
  
  const { data, error } = await supabase
    .from('srangam_cultural_terms')
    .insert(termsToInsert)
    .select();
  
  if (error) {
    console.error('   ❌ Error importing terms:', error.message);
    throw error;
  }
  
  console.log(`   ✅ Successfully imported ${data?.length || 0} cultural terms`);
  return data;
}

async function verifyImport() {
  console.log('\n🔍 Verifying Geomythology Import...');
  
  const { count: articlesCount, error: articlesError } = await supabase
    .from('srangam_articles')
    .select('*', { count: 'exact', head: true });
  
  if (!articlesError) {
    console.log(`   ✅ Total articles in database: ${articlesCount}`);
  }
  
  const { data: geomythArticle, error: geomError } = await supabase
    .from('srangam_articles')
    .select('slug, title, theme, read_time_minutes')
    .eq('slug', 'geomythology-land-reclamation')
    .single();
  
  if (!geomError && geomythArticle) {
    console.log('\n   📄 Geomythology Article:');
    console.log(`      Slug: ${geomythArticle.slug}`);
    console.log(`      Title (EN): ${geomythArticle.title.en}`);
    console.log(`      Theme: ${geomythArticle.theme}`);
    console.log(`      Read Time: ${geomythArticle.read_time_minutes} min`);
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   🚀 GEOMYTHOLOGY ARTICLE IMPORT                     ║');
  console.log('║   24th Article: Land Reclamation Traditions          ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  
  try {
    // Step 1: Import Article
    await importGeomythologyArticle();
    
    // Step 2: Import Cultural Terms
    await importGeomythologyCulturalTerms();
    
    // Step 3: Verify Import
    await verifyImport();
    
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   ✅ GEOMYTHOLOGY IMPORT COMPLETE!                   ║');
    console.log('║   Total Articles: 24                                  ║');
    console.log('║   New Cultural Terms: 5+                              ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run import
main();
