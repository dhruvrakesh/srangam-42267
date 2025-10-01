#!/usr/bin/env node

/**
 * i18n Audit Script
 * Validates translation coverage and consistency across all languages
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'ta', 'te', 'kn', 'bn', 'as', 'pn', 'hi', 'pa'];
const COVERAGE_THRESHOLD = 99; // Minimum coverage to mark as "Available"

/**
 * Load JSON file
 */
function loadJSON(filepath) {
  try {
    const content = readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filepath}:`, error.message);
    return null;
  }
}

/**
 * Calculate coverage for a language
 */
function calculateCoverage(strings, baselineKeys) {
  const totalKeys = baselineKeys.length;
  const translatedKeys = baselineKeys.filter(key => {
    const value = strings[key];
    return value && value.trim().length > 0;
  }).length;
  
  const missingKeys = baselineKeys.filter(key => {
    const value = strings[key];
    return !value || value.trim().length === 0;
  });
  
  const percent = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;
  
  return { totalKeys, translatedKeys, missingKeys, percent };
}

/**
 * Audit article translations
 */
function auditArticle(articleSlug) {
  console.log(`\n📄 Auditing article: ${articleSlug}`);
  console.log('─'.repeat(80));
  
  const articleDir = join(rootDir, 'i18n', 'articles', articleSlug);
  
  if (!existsSync(articleDir)) {
    console.error(`❌ Article directory not found: ${articleDir}`);
    return { success: false, article: articleSlug };
  }
  
  // Load English baseline
  const enPath = join(articleDir, 'en.json');
  const enData = loadJSON(enPath);
  
  if (!enData || !enData.strings) {
    console.error(`❌ Invalid English baseline: ${enPath}`);
    return { success: false, article: articleSlug };
  }
  
  const baselineKeys = Object.keys(enData.strings);
  console.log(`📊 Baseline keys: ${baselineKeys.length}`);
  
  const results = {};
  const issues = [];
  
  // Check each language
  for (const lang of SUPPORTED_LANGUAGES) {
    const langPath = join(articleDir, `${lang}.json`);
    const langData = loadJSON(langPath);
    
    if (!langData || !langData.strings) {
      issues.push(`Missing or invalid file: ${langPath}`);
      results[lang] = { percent: 0, status: 'ERROR' };
      continue;
    }
    
    // Calculate coverage
    const coverage = calculateCoverage(langData.strings, baselineKeys);
    results[lang] = coverage;
    
    // Check for extra keys (not in baseline)
    const extraKeys = Object.keys(langData.strings).filter(
      key => !baselineKeys.includes(key)
    );
    
    if (extraKeys.length > 0) {
      issues.push(`${lang}: ${extraKeys.length} extra keys not in baseline`);
    }
    
    // Check coverage threshold
    const status = coverage.percent >= COVERAGE_THRESHOLD ? '✅ Available' : 
                   coverage.percent >= 70 ? '⚠️  In Progress' : 
                   '❌ Incomplete';
    
    console.log(`  ${lang}: ${status} (${coverage.percent}% - ${coverage.translatedKeys}/${coverage.totalKeys})`);
    
    if (coverage.missingKeys.length > 0 && coverage.percent < COVERAGE_THRESHOLD) {
      console.log(`       Missing: ${coverage.missingKeys.slice(0, 3).join(', ')}${coverage.missingKeys.length > 3 ? '...' : ''}`);
    }
  }
  
  // Print issues
  if (issues.length > 0) {
    console.log('\n⚠️  Issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  // Coverage summary
  const availableCount = Object.values(results).filter(r => r.percent >= COVERAGE_THRESHOLD).length;
  const totalLangs = SUPPORTED_LANGUAGES.length;
  
  console.log(`\n📈 Coverage Summary: ${availableCount}/${totalLangs} languages available (≥${COVERAGE_THRESHOLD}%)`);
  
  return {
    success: issues.length === 0 && availableCount === totalLangs,
    article: articleSlug,
    results,
    issues
  };
}

/**
 * Generate coverage table
 */
function generateCoverageTable(auditResults) {
  console.log('\n\n📊 COVERAGE TABLE');
  console.log('═'.repeat(100));
  
  const header = '| Article'.padEnd(30) + '|' + SUPPORTED_LANGUAGES.map(l => ` ${l} `.padEnd(8)).join('|') + '|';
  const separator = '|' + '─'.repeat(29) + '|' + SUPPORTED_LANGUAGES.map(() => '─'.repeat(8)).join('|') + '|';
  
  console.log(header);
  console.log(separator);
  
  for (const result of auditResults) {
    if (!result.results) continue;
    
    const row = `| ${result.article}`.padEnd(30) + '|' + 
      SUPPORTED_LANGUAGES.map(lang => {
        const coverage = result.results[lang];
        if (!coverage) return ' N/A '.padEnd(8);
        const icon = coverage.percent >= COVERAGE_THRESHOLD ? '✅' : 
                     coverage.percent >= 70 ? '⚠️ ' : '❌';
        return ` ${icon}${coverage.percent}%`.padEnd(8);
      }).join('|') + '|';
    
    console.log(row);
  }
  
  console.log('═'.repeat(100));
}

/**
 * Main audit function
 */
function main() {
  console.log('🔍 Srangam i18n Audit');
  console.log('═'.repeat(80));
  
  const articlesDir = join(rootDir, 'i18n', 'articles');
  
  if (!existsSync(articlesDir)) {
    console.error(`❌ Articles directory not found: ${articlesDir}`);
    process.exit(1);
  }
  
  const articles = readdirSync(articlesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`Found ${articles.length} article(s) to audit\n`);
  
  const auditResults = articles.map(article => auditArticle(article));
  
  // Generate coverage table
  generateCoverageTable(auditResults);
  
  // Final summary
  const failedArticles = auditResults.filter(r => !r.success);
  
  if (failedArticles.length > 0) {
    console.log('\n❌ AUDIT FAILED');
    console.log(`   ${failedArticles.length} article(s) do not meet quality standards\n`);
    process.exit(1);
  } else {
    console.log('\n✅ AUDIT PASSED');
    console.log('   All articles meet coverage and quality standards\n');
    process.exit(0);
  }
}

main();
