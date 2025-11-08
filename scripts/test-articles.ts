#!/usr/bin/env tsx
/**
 * Automated Article Testing Script
 * 
 * Tests all articles with UniversalNarrator integration for:
 * - Page load without errors
 * - Narrator visibility and functionality
 * - Visualization rendering
 * - Console error detection
 * - Performance metrics
 * 
 * Usage:
 *   npm run test:articles              # Test all articles
 *   npm run test:article -- --article=monsoon-trade-clock  # Test single article
 */

import { chromium, Browser, Page } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Article inventory with metadata
const ARTICLES = [
  // Simple Articles
  { slug: 'ashoka-kandahar-edicts', name: 'Ashoka Kandahar Edicts', category: 'simple', visualizations: 0 },
  { slug: 'chola-naval-raid', name: 'Chola Naval Raid', category: 'simple', visualizations: 0 },
  { slug: 'earth-sea-sangam', name: 'Earth Sea Sangam', category: 'simple', visualizations: 0 },
  { slug: 'gondwana-to-himalaya', name: 'Gondwana to Himalaya', category: 'simple', visualizations: 0 },
  { slug: 'kutai-yupa-borneo', name: 'Kutai Yupa Borneo', category: 'simple', visualizations: 0 },
  { slug: 'monsoon-trade-clock', name: 'Monsoon Trade Clock', category: 'simple', visualizations: 2 },
  { slug: 'pepper-and-bullion', name: 'Pepper and Bullion', category: 'simple', visualizations: 0 },
  { slug: 'reassessing-ashoka-legacy', name: 'Reassessing Ashoka Legacy', category: 'simple', visualizations: 4 },
  { slug: 'scripts-that-sailed', name: 'Scripts That Sailed', category: 'simple', visualizations: 5 },
  
  // Complex Visualizations
  { slug: 'geomythology-land-reclamation', name: 'Geomythology Land Reclamation', category: 'complex', visualizations: 3 },
  { slug: 'indian-ocean-power-networks', name: 'Indian Ocean Power Networks', category: 'complex', visualizations: 6 },
  { slug: 'riders-on-monsoon', name: 'Riders on Monsoon', category: 'complex', visualizations: 60 },
  { slug: 'sacred-tree-harvest-rhythms', name: 'Sacred Tree Harvest Rhythms', category: 'complex', visualizations: 7 },
  { slug: 'scripts-that-sailed-ii', name: 'Scripts That Sailed II', category: 'complex', visualizations: 5 },
  { slug: 'stone-purana', name: 'Stone Purana', category: 'complex', visualizations: 9 },
  { slug: 'stone-song-and-sea', name: 'Stone Song and Sea', category: 'complex', visualizations: 11 },
  
  // i18n Articles
  { slug: 'cosmic-island-sacred-land', name: 'Cosmic Island Sacred Land', category: 'i18n', visualizations: 4 },
  { slug: 'janajati-oral-traditions', name: 'Janajati Oral Traditions', category: 'i18n', visualizations: 3 },
  { slug: 'maritime-memories-south-india', name: 'Maritime Memories South India', category: 'i18n', visualizations: 2 },
];

interface TestResult {
  slug: string;
  name: string;
  category: string;
  timestamp: string;
  status: 'pass' | 'fail' | 'warning';
  pageLoadTime: number;
  narratorFound: boolean;
  visualizationsRendered: number;
  consoleErrors: string[];
  consoleWarnings: string[];
  issues: string[];
  screenshot?: string;
}

const BASE_URL = process.env.TEST_URL || 'http://localhost:8080';
const RESULTS_DIR = 'test-results';
const SCREENSHOTS_DIR = join(RESULTS_DIR, 'screenshots');

// Ensure directories exist
mkdirSync(RESULTS_DIR, { recursive: true });
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function testArticle(browser: Browser, article: typeof ARTICLES[0]): Promise<TestResult> {
  const page = await browser.newPage();
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const issues: string[] = [];
  
  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      consoleErrors.push(text);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    consoleErrors.push(`Page error: ${error.message}`);
  });
  
  const startTime = Date.now();
  let narratorFound = false;
  let visualizationsRendered = 0;
  let status: 'pass' | 'fail' | 'warning' = 'pass';
  
  try {
    // Navigate to article
    await page.goto(`${BASE_URL}/articles/${article.slug}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const pageLoadTime = Date.now() - startTime;
    
    // Check for UniversalNarrator
    narratorFound = await page.locator('[data-testid="universal-narrator"], .narration-controls').count() > 0;
    
    if (!narratorFound) {
      issues.push('UniversalNarrator controls not found');
      status = 'fail';
    }
    
    // Check for visualizations (if article has any)
    if (article.visualizations > 0) {
      // Wait a bit for lazy-loaded components
      await page.waitForTimeout(2000);
      
      const vizCount = await page.locator('[data-testid*="visualization"], .leaflet-container, canvas, svg[class*="chart"]').count();
      visualizationsRendered = vizCount;
      
      if (vizCount < article.visualizations) {
        issues.push(`Expected ${article.visualizations} visualizations, found ${vizCount}`);
        status = status === 'pass' ? 'warning' : status;
      }
    }
    
    // Check for critical errors
    const hasCriticalError = consoleErrors.some(err => 
      err.includes('render2 is not a function') ||
      err.includes('Cannot read properties of undefined') ||
      err.includes('is not defined')
    );
    
    if (hasCriticalError) {
      status = 'fail';
    }
    
    // Performance check
    if (pageLoadTime > 4000) {
      issues.push(`Slow load time: ${pageLoadTime}ms`);
      status = status === 'pass' ? 'warning' : status;
    }
    
    // Take screenshot
    const screenshotPath = join(SCREENSHOTS_DIR, `${article.slug}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    return {
      slug: article.slug,
      name: article.name,
      category: article.category,
      timestamp: new Date().toISOString(),
      status,
      pageLoadTime,
      narratorFound,
      visualizationsRendered,
      consoleErrors,
      consoleWarnings,
      issues,
      screenshot: screenshotPath
    };
    
  } catch (error) {
    return {
      slug: article.slug,
      name: article.name,
      category: article.category,
      timestamp: new Date().toISOString(),
      status: 'fail',
      pageLoadTime: Date.now() - startTime,
      narratorFound,
      visualizationsRendered,
      consoleErrors: [...consoleErrors, `Test error: ${error}`],
      consoleWarnings,
      issues: [...issues, `Failed to test: ${error}`],
    };
  } finally {
    await page.close();
  }
}

async function runTests() {
  console.log('🚀 Starting article testing...\n');
  
  const browser = await chromium.launch({ headless: true });
  const results: TestResult[] = [];
  
  // Check if testing single article
  const singleArticleSlug = process.argv.find(arg => arg.startsWith('--article='))?.split('=')[1];
  const articlesToTest = singleArticleSlug
    ? ARTICLES.filter(a => a.slug === singleArticleSlug)
    : ARTICLES;
  
  if (articlesToTest.length === 0) {
    console.error(`❌ Article "${singleArticleSlug}" not found`);
    process.exit(1);
  }
  
  console.log(`Testing ${articlesToTest.length} article(s)...\n`);
  
  for (const article of articlesToTest) {
    console.log(`📄 Testing: ${article.name} (${article.slug})`);
    const result = await testArticle(browser, article);
    results.push(result);
    
    const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`   ${statusIcon} ${result.status.toUpperCase()} - ${result.pageLoadTime}ms - Narrator: ${result.narratorFound ? '✓' : '✗'}`);
    
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`      ⚠️  ${issue}`));
    }
    console.log('');
  }
  
  await browser.close();
  
  // Generate summary
  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / results.length) * 100)}%\n`);
  
  // Save detailed results
  const resultsPath = join(RESULTS_DIR, `article-test-results-${Date.now()}.json`);
  writeFileSync(resultsPath, JSON.stringify({
    summary: { passed, warnings, failed, total: results.length },
    testDate: new Date().toISOString(),
    baseUrl: BASE_URL,
    results
  }, null, 2));
  
  console.log(`💾 Detailed results saved to: ${resultsPath}`);
  console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}\n`);
  
  // Exit with error code if any tests failed
  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
