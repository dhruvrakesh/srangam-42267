#!/usr/bin/env node

/**
 * Cultural Terms Validation Script
 * 
 * This script:
 * 1. Extracts all {{cultural:term}} markers from article files
 * 2. Cross-references with the cultural terms database
 * 3. Generates coverage reports (JSON + Markdown)
 * 4. Creates priority matrix for missing terms
 * 
 * Usage:
 *   node scripts/validate_cultural_terms.mjs
 *   node scripts/validate_cultural_terms.mjs --quick (skip detailed output)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Article file paths
const ARTICLE_FILES = [
  'src/data/articles/cosmic-island-sacred-land.ts',
  'src/data/articles/jambudvipa-connected.ts',
  'src/data/articles/maritime-memories-south-india.ts',
  'src/data/articles/scripts-that-sailed.ts',
  'src/data/articles/riders-on-monsoon.ts',
  'src/data/articles/monsoon-trade-clock.ts',
  'src/data/articles/gondwana-to-himalaya.ts',
  'src/data/articles/indian-ocean-power-networks.ts',
  'src/data/articles/ashoka-kandahar-edicts.ts',
  'src/data/articles/kutai-yupa-borneo.ts',
  'src/data/articles/chola-naval-raid.ts',
  'src/data/articles/pepper-and-bullion.ts',
  'src/data/articles/earth-sea-sangam.ts'
];

// Database file paths
const DATABASE_FILES = [
  'src/data/articles/cultural-terms.ts',
  'src/data/articles/cultural-terms-jambudvipa.ts',
  'src/data/articles/enhanced-cultural-terms.ts'
];

/**
 * Extract {{cultural:term}} markers from article content
 */
function extractCulturalTerms(content) {
  const regex = /\{\{cultural:([a-zA-Z0-9\-_]+)\}\}/g;
  const terms = new Set();
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    terms.add(match[1].toLowerCase());
  }
  
  return Array.from(terms);
}

/**
 * Extract term keys from database files
 */
function extractDatabaseTerms(content, filename) {
  const terms = new Set();
  
  // Handle different database formats
  if (filename.includes('cultural-terms-jambudvipa')) {
    // Array format: { term: "xxx", translations: {...} }
    const termRegex = /{\s*term:\s*["']([^"']+)["']/g;
    let match;
    while ((match = termRegex.exec(content)) !== null) {
      terms.add(match[1].toLowerCase());
    }
  } else {
    // Record format: 'term-name': { term: "xxx", ... }
    const recordRegex = /["']([a-zA-Z0-9\-_]+)["']:\s*\{/g;
    let match;
    while ((match = recordRegex.exec(content)) !== null) {
      terms.add(match[1].toLowerCase());
    }
    
    // Also capture term: "xxx" format
    const termRegex = /term:\s*["']([^"']+)["']/g;
    while ((match = termRegex.exec(content)) !== null) {
      terms.add(match[1].toLowerCase());
    }
  }
  
  return Array.from(terms);
}

/**
 * Normalize term for comparison (handle hyphenation, case)
 */
function normalizeTerm(term) {
  return term
    .toLowerCase()
    .replace(/[-_\s]/g, '')
    .trim();
}

/**
 * Check if term exists in database (with normalization)
 */
function isTermInDatabase(term, databaseTerms) {
  const normalized = normalizeTerm(term);
  return databaseTerms.some(dbTerm => normalizeTerm(dbTerm) === normalized);
}

/**
 * Audit a single article
 */
function auditArticle(filePath, databaseTerms) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    return {
      slug: path.basename(filePath, '.ts'),
      error: 'File not found',
      totalTerms: 0,
      missingTerms: [],
      coverage: 0
    };
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const articleTerms = extractCulturalTerms(content);
  
  if (articleTerms.length === 0) {
    return {
      slug: path.basename(filePath, '.ts'),
      totalTerms: 0,
      missingTerms: [],
      coverage: 100,
      note: 'No cultural terms used'
    };
  }
  
  const missingTerms = articleTerms.filter(term => 
    !isTermInDatabase(term, databaseTerms)
  );
  
  const coverage = articleTerms.length > 0
    ? Math.round(((articleTerms.length - missingTerms.length) / articleTerms.length) * 100)
    : 100;
  
  return {
    slug: path.basename(filePath, '.ts'),
    totalTerms: articleTerms.length,
    foundTerms: articleTerms.length - missingTerms.length,
    missingTerms: missingTerms,
    coverage: coverage,
    allTerms: articleTerms
  };
}

/**
 * Load all database terms
 */
function loadDatabaseTerms() {
  const allTerms = new Set();
  
  DATABASE_FILES.forEach(dbFile => {
    const fullPath = path.join(ROOT_DIR, dbFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const terms = extractDatabaseTerms(content, dbFile);
      terms.forEach(term => allTerms.add(term));
    }
  });
  
  return Array.from(allTerms);
}

/**
 * Calculate priority for missing terms
 */
function calculatePriority(termFrequency) {
  const priorities = {
    high: [],    // Used >10 times
    medium: [],  // Used 5-10 times
    low: []      // Used <5 times
  };
  
  Object.entries(termFrequency).forEach(([term, count]) => {
    if (count >= 10) {
      priorities.high.push({ term, count });
    } else if (count >= 5) {
      priorities.medium.push({ term, count });
    } else {
      priorities.low.push({ term, count });
    }
  });
  
  // Sort by frequency
  priorities.high.sort((a, b) => b.count - a.count);
  priorities.medium.sort((a, b) => b.count - a.count);
  priorities.low.sort((a, b) => b.count - a.count);
  
  return priorities;
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(results, priorities, stats) {
  const timestamp = new Date().toISOString();
  
  let markdown = `# Cultural Terms Coverage Report\n\n`;
  markdown += `**Generated**: ${timestamp}\n\n`;
  markdown += `---\n\n`;
  
  // Overall Statistics
  markdown += `## Overall Statistics\n\n`;
  markdown += `- **Total Articles**: ${stats.totalArticles}\n`;
  markdown += `- **Articles with Cultural Terms**: ${stats.articlesWithTerms}\n`;
  markdown += `- **Total Unique Terms Site-Wide**: ${stats.totalUniqueTerms}\n`;
  markdown += `- **Terms in Database**: ${stats.databaseTerms}\n`;
  markdown += `- **Missing Terms**: ${stats.totalMissingTerms}\n`;
  markdown += `- **Average Coverage**: ${stats.averageCoverage}%\n\n`;
  
  // Per-Article Coverage
  markdown += `## Per-Article Coverage\n\n`;
  markdown += `| Article | Coverage | Total | Found | Missing |\n`;
  markdown += `|---------|----------|-------|-------|----------|\n`;
  
  results.forEach(result => {
    const slug = result.slug.length > 35 
      ? result.slug.substring(0, 32) + '...'
      : result.slug;
    const coverage = result.note ? 'N/A' : `${result.coverage}%`;
    const emoji = result.coverage >= 95 ? '✅' : result.coverage >= 80 ? '⚠️' : '❌';
    
    markdown += `| ${slug} | ${emoji} ${coverage} | ${result.totalTerms} | ${result.foundTerms || 0} | ${result.missingTerms.length} |\n`;
  });
  
  markdown += `\n`;
  
  // Priority Matrix
  markdown += `## Missing Terms Priority Matrix\n\n`;
  
  if (priorities.high.length > 0) {
    markdown += `### Priority 1: High-Frequency Terms (>10 uses)\n\n`;
    markdown += `**Count**: ${priorities.high.length} terms\n\n`;
    priorities.high.slice(0, 20).forEach(({ term, count }) => {
      markdown += `- \`${term}\` (${count} uses)\n`;
    });
    if (priorities.high.length > 20) {
      markdown += `\n... and ${priorities.high.length - 20} more\n`;
    }
    markdown += `\n`;
  }
  
  if (priorities.medium.length > 0) {
    markdown += `### Priority 2: Medium-Frequency Terms (5-10 uses)\n\n`;
    markdown += `**Count**: ${priorities.medium.length} terms\n\n`;
    priorities.medium.slice(0, 20).forEach(({ term, count }) => {
      markdown += `- \`${term}\` (${count} uses)\n`;
    });
    if (priorities.medium.length > 20) {
      markdown += `\n... and ${priorities.medium.length - 20} more\n`;
    }
    markdown += `\n`;
  }
  
  if (priorities.low.length > 0) {
    markdown += `### Priority 3: Low-Frequency Terms (<5 uses)\n\n`;
    markdown += `**Count**: ${priorities.low.length} terms\n\n`;
    priorities.low.slice(0, 30).forEach(({ term, count }) => {
      markdown += `- \`${term}\` (${count} uses)\n`;
    });
    if (priorities.low.length > 30) {
      markdown += `\n... and ${priorities.low.length - 30} more\n`;
    }
    markdown += `\n`;
  }
  
  // Detailed Missing Terms by Article
  markdown += `## Missing Terms by Article\n\n`;
  
  results
    .filter(r => r.missingTerms && r.missingTerms.length > 0)
    .sort((a, b) => b.missingTerms.length - a.missingTerms.length)
    .forEach(result => {
      markdown += `### ${result.slug}\n\n`;
      markdown += `**Missing**: ${result.missingTerms.length} terms\n\n`;
      result.missingTerms.slice(0, 50).forEach(term => {
        markdown += `- \`${term}\`\n`;
      });
      if (result.missingTerms.length > 50) {
        markdown += `\n... and ${result.missingTerms.length - 50} more\n`;
      }
      markdown += `\n`;
    });
  
  markdown += `---\n\n`;
  markdown += `*Report generated by \`scripts/validate_cultural_terms.mjs\`*\n`;
  
  return markdown;
}

/**
 * Main execution
 */
function main() {
  const isQuickMode = process.argv.includes('--quick');
  
  console.log('🔍 Cultural Terms Validation Script\n');
  console.log('Loading database terms...');
  
  const databaseTerms = loadDatabaseTerms();
  console.log(`✓ Found ${databaseTerms.length} terms in database\n`);
  
  console.log('Auditing articles...\n');
  
  const results = [];
  const allMissingTerms = new Set();
  const termFrequency = {};
  
  ARTICLE_FILES.forEach(filePath => {
    const result = auditArticle(filePath, databaseTerms);
    results.push(result);
    
    if (!isQuickMode) {
      const emoji = result.note ? '➖' : 
                    result.coverage >= 95 ? '✅' : 
                    result.coverage >= 80 ? '⚠️' : '❌';
      console.log(`${emoji} ${result.slug}`);
      console.log(`   Coverage: ${result.coverage}% (${result.foundTerms || 0}/${result.totalTerms} terms)`);
      if (result.missingTerms && result.missingTerms.length > 0) {
        console.log(`   Missing: ${result.missingTerms.length} terms`);
      }
      console.log('');
    }
    
    // Track missing terms and frequency
    if (result.missingTerms) {
      result.missingTerms.forEach(term => {
        allMissingTerms.add(term);
        termFrequency[term] = (termFrequency[term] || 0) + 1;
      });
    }
  });
  
  // Calculate statistics
  const articlesWithTerms = results.filter(r => r.totalTerms > 0).length;
  const totalCoverage = results
    .filter(r => r.totalTerms > 0)
    .reduce((sum, r) => sum + r.coverage, 0);
  const averageCoverage = articlesWithTerms > 0 
    ? Math.round(totalCoverage / articlesWithTerms)
    : 100;
  
  const allUniqueTerms = new Set();
  results.forEach(r => {
    if (r.allTerms) {
      r.allTerms.forEach(term => allUniqueTerms.add(term));
    }
  });
  
  const stats = {
    totalArticles: ARTICLE_FILES.length,
    articlesWithTerms,
    totalUniqueTerms: allUniqueTerms.size,
    databaseTerms: databaseTerms.length,
    totalMissingTerms: allMissingTerms.size,
    averageCoverage
  };
  
  const priorities = calculatePriority(termFrequency);
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60) + '\n');
  console.log(`Total Articles:               ${stats.totalArticles}`);
  console.log(`Articles with Cultural Terms: ${stats.articlesWithTerms}`);
  console.log(`Total Unique Terms:           ${stats.totalUniqueTerms}`);
  console.log(`Terms in Database:            ${stats.databaseTerms}`);
  console.log(`Missing Terms:                ${stats.totalMissingTerms}`);
  console.log(`Average Coverage:             ${stats.averageCoverage}%`);
  console.log('');
  console.log('Priority Breakdown:');
  console.log(`  High Priority (>10 uses):   ${priorities.high.length} terms`);
  console.log(`  Medium Priority (5-10):     ${priorities.medium.length} terms`);
  console.log(`  Low Priority (<5):          ${priorities.low.length} terms`);
  console.log('');
  
  // Generate reports
  const jsonReport = {
    timestamp: new Date().toISOString(),
    stats,
    results,
    priorities,
    allMissingTerms: Array.from(allMissingTerms)
  };
  
  const markdownReport = generateMarkdownReport(results, priorities, stats);
  
  // Write reports
  const reportsDir = path.join(ROOT_DIR, 'docs');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(reportsDir, 'CULTURAL_TERMS_COVERAGE.md'),
    markdownReport
  );
  
  fs.writeFileSync(
    path.join(reportsDir, 'cultural-terms-audit.json'),
    JSON.stringify(jsonReport, null, 2)
  );
  
  console.log('✓ Reports generated:');
  console.log('  - docs/CULTURAL_TERMS_COVERAGE.md');
  console.log('  - docs/cultural-terms-audit.json');
  console.log('');
  
  // Exit code
  const hasFailures = results.some(r => r.coverage < 90 && r.totalTerms > 0);
  if (hasFailures && !isQuickMode) {
    console.log('⚠️  Some articles below 90% coverage threshold');
    process.exit(1);
  } else {
    console.log('✅ Validation complete!');
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractCulturalTerms, extractDatabaseTerms, auditArticle, loadDatabaseTerms };
