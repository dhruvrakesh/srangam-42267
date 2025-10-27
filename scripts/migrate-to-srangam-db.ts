import { createClient } from '@supabase/supabase-js';
import { MULTILINGUAL_ARTICLES, ARTICLE_METADATA } from '../src/data/articles/index';
import { culturalTermsDatabase } from '../src/data/articles/cultural-terms';
import { enhancedCulturalTerms } from '../src/data/articles/enhanced-cultural-terms';

// Supabase client setup
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Module detection for cultural terms
function detectModule(term: string, sourceFile: string): string {
  if (sourceFile.includes('enhanced')) return 'vedic';
  if (sourceFile.includes('maritime')) return 'maritime';
  if (sourceFile.includes('cosmic')) return 'cosmology';
  if (sourceFile.includes('stone-purana')) return 'geology';
  if (sourceFile.includes('scripts')) return 'epigraphy';
  if (sourceFile.includes('jambudvipa')) return 'geography';
  return 'core';
}

// Extract etymology and context from translations
function extractMultilingualField(translations: any, field: 'etymology' | 'culturalContext'): any {
  const result: any = {};
  
  Object.entries(translations).forEach(([lang, data]: [string, any]) => {
    if (data && data[field]) {
      result[lang] = data[field];
    }
  });
  
  return Object.keys(result).length > 0 ? result : null;
}

async function migrateArticles() {
  console.log('\n📝 Migrating Articles...');
  console.log(`   Total articles to migrate: ${MULTILINGUAL_ARTICLES.length}`);
  
  const articlesToInsert = MULTILINGUAL_ARTICLES.map(article => {
    const metadata = ARTICLE_METADATA[article.id];
    
    return {
      slug: article.id,
      title: article.title,
      dek: article.dek,
      content: article.content,
      author: metadata?.author || 'Nartiang Foundation',
      published_date: metadata?.date || '2024-03-15',
      read_time_minutes: metadata?.readTime || 10,
      theme: metadata?.theme || 'Ancient India',
      tags: article.tags?.map((tag: any) => tag.en || tag) || [],
      status: 'published',
      featured: false,
      series_id: null,
      part_number: null
    };
  });
  
  // Batch insert articles
  const { data, error } = await supabase
    .from('srangam_articles')
    .insert(articlesToInsert)
    .select();
  
  if (error) {
    console.error('   ❌ Error migrating articles:', error.message);
    throw error;
  }
  
  console.log(`   ✅ Successfully migrated ${data?.length || 0} articles`);
  return data;
}

async function migrateCulturalTerms() {
  console.log('\n📚 Migrating Cultural Terms...');
  
  const termsToInsert: any[] = [];
  
  // Migrate main cultural terms database
  Object.entries(culturalTermsDatabase).forEach(([key, term]: [string, any]) => {
    termsToInsert.push({
      term: key.toLowerCase(),
      display_term: term.term,
      module: 'core',
      transliteration: term.translations?.en?.transliteration || null,
      translations: term.translations,
      etymology: extractMultilingualField(term.translations, 'etymology'),
      context: extractMultilingualField(term.translations, 'culturalContext'),
      synonyms: [],
      related_terms: [],
      usage_count: 0
    });
  });
  
  // Migrate enhanced cultural terms
  Object.entries(enhancedCulturalTerms).forEach(([key, term]: [string, any]) => {
    // Skip if already exists
    if (termsToInsert.some(t => t.term === key.toLowerCase())) {
      return;
    }
    
    termsToInsert.push({
      term: key.toLowerCase(),
      display_term: term.term,
      module: 'vedic',
      transliteration: term.translations?.en?.transliteration || null,
      translations: term.translations,
      etymology: extractMultilingualField(term.translations, 'etymology'),
      context: extractMultilingualField(term.translations, 'culturalContext'),
      synonyms: [],
      related_terms: [],
      usage_count: 0
    });
  });
  
  console.log(`   Total terms to migrate: ${termsToInsert.length}`);
  
  // Batch insert in chunks of 100
  const chunkSize = 100;
  let totalInserted = 0;
  
  for (let i = 0; i < termsToInsert.length; i += chunkSize) {
    const chunk = termsToInsert.slice(i, i + chunkSize);
    
    const { data, error } = await supabase
      .from('srangam_cultural_terms')
      .insert(chunk)
      .select();
    
    if (error) {
      console.error(`   ❌ Error migrating terms (chunk ${i / chunkSize + 1}):`, error.message);
      continue;
    }
    
    totalInserted += data?.length || 0;
    console.log(`   ⏳ Progress: ${totalInserted}/${termsToInsert.length} terms`);
  }
  
  console.log(`   ✅ Successfully migrated ${totalInserted} cultural terms`);
  return totalInserted;
}

async function verifyMigration() {
  console.log('\n🔍 Verifying Migration...');
  
  // Check articles count
  const { count: articlesCount, error: articlesError } = await supabase
    .from('srangam_articles')
    .select('*', { count: 'exact', head: true });
  
  if (articlesError) {
    console.error('   ❌ Error checking articles:', articlesError.message);
  } else {
    console.log(`   ✅ Articles in database: ${articlesCount}`);
  }
  
  // Check cultural terms count
  const { count: termsCount, error: termsError } = await supabase
    .from('srangam_cultural_terms')
    .select('*', { count: 'exact', head: true });
  
  if (termsError) {
    console.error('   ❌ Error checking terms:', termsError.message);
  } else {
    console.log(`   ✅ Cultural terms in database: ${termsCount}`);
  }
  
  // Sample article check
  const { data: sampleArticle, error: sampleError } = await supabase
    .from('srangam_articles')
    .select('slug, title, author, theme')
    .limit(1)
    .single();
  
  if (!sampleError && sampleArticle) {
    console.log('\n   📄 Sample Article:');
    console.log(`      Slug: ${sampleArticle.slug}`);
    console.log(`      Title (EN): ${sampleArticle.title.en}`);
    console.log(`      Author: ${sampleArticle.author}`);
    console.log(`      Theme: ${sampleArticle.theme}`);
  }
  
  // Sample term check
  const { data: sampleTerm, error: termSampleError } = await supabase
    .from('srangam_cultural_terms')
    .select('term, display_term, module, transliteration')
    .limit(1)
    .single();
  
  if (!termSampleError && sampleTerm) {
    console.log('\n   📖 Sample Cultural Term:');
    console.log(`      Term: ${sampleTerm.display_term}`);
    console.log(`      Transliteration: ${sampleTerm.transliteration}`);
    console.log(`      Module: ${sampleTerm.module}`);
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   🚀 SRANGAM DATABASE MIGRATION                      ║');
  console.log('║   Phase 3: Content Migration                         ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  
  try {
    // Step 1: Migrate Articles
    await migrateArticles();
    
    // Step 2: Migrate Cultural Terms
    await migrateCulturalTerms();
    
    // Step 3: Verify Migration
    await verifyMigration();
    
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   ✅ MIGRATION COMPLETE!                             ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
