#!/usr/bin/env node
/**
 * refresh-sitemap.mjs — regenerate public/sitemap.xml from the DB-driven
 * generate-sitemap edge function, so the static copy never goes stale again.
 *
 * Part of SEO plan S1-b (docs/SEO_DISCOVERY_AUDIT_AND_PLAN_2026-07-19.md).
 * Same family as scripts/registry-parity-check.mjs — run from the repo root:
 *
 *   node scripts/refresh-sitemap.mjs            # fetch, validate, write
 *   node scripts/refresh-sitemap.mjs --check    # fetch, validate, write nothing
 *
 * Guards (the file is NOT overwritten unless ALL pass):
 *   - HTTP 200 from the edge function
 *   - response parses as a <urlset> sitemap
 *   - >= 60 <url> entries (edge sitemap serves ~92; static had 28)
 *   - contains /articles/ URLs (the whole point of the refresh)
 *
 * Run before deploys and after publishing articles. On failure the existing
 * public/sitemap.xml is left untouched and the process exits non-zero.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const EDGE_URL = process.env.SITEMAP_SOURCE_URL ||
  'https://xjaizfjcpkjcqbyobcsh.supabase.co/functions/v1/generate-sitemap';
const OUT = 'public/sitemap.xml';
const MIN_URLS = 60;
const checkOnly = process.argv.includes('--check');

function fail(msg) {
  console.error(`✖ refresh-sitemap: ${msg} — ${OUT} left untouched.`);
  process.exit(1);
}

const res = await fetch(EDGE_URL).catch(e => fail(`fetch failed: ${e.message}`));
if (!res || res.status !== 200) fail(`HTTP ${res && res.status} from edge function`);
const xml = await res.text();

if (!xml.includes('<urlset')) fail('response is not a <urlset> sitemap');
const urlCount = (xml.match(/<url>/g) || []).length;
if (urlCount < MIN_URLS) fail(`only ${urlCount} <url> entries (< ${MIN_URLS})`);
const articleCount = (xml.match(/\/articles\//g) || []).length;
if (articleCount === 0) fail('no /articles/ URLs present');

const before = existsSync(OUT)
  ? (readFileSync(OUT, 'utf8').match(/<url>/g) || []).length
  : 0;

console.log(`✓ edge sitemap OK: ${urlCount} URLs (${articleCount} article refs); static currently ${before}.`);

if (checkOnly) {
  console.log('--check: not writing.');
} else {
  writeFileSync(OUT, xml);
  console.log(`✓ wrote ${OUT}: ${before} → ${urlCount} URLs.`);
  console.log('Next: commit the refreshed sitemap, deploy, and re-submit in GSC if counts changed a lot.');
}
