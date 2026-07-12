/**
 * Phase 2.0 (Enterprise Roadmap 2026-07-12) — static-vs-database parity check.
 *
 * Compares every statically-registered article (28 registry modules + 8
 * oceanic JSON cards) against the live `srangam_articles` table and writes
 * a report to docs/PARITY_REPORT.md.
 *
 * Run locally from the repo root (uses VITE_SUPABASE_* from .env):
 *   node scripts/registry-parity-check.mjs
 *
 * What it checks per slug:
 *   - DB row exists (by slug OR slug_alias) and is published
 *   - Which languages have non-empty body content in DB vs static
 *   - Content length delta per language (large negative delta = DB stale)
 *   - Pin counts: srangam_article_pins vs JSON-card pins
 *
 * Exit code 0 = full parity (safe to proceed to roadmap 2.6 retirement
 * decisions), 1 = gaps found (see report), 2 = configuration/network error.
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'url';

const ROOT = process.cwd();

// ---------- config ----------
function loadEnv() {
  const env = {};
  try {
    for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
      if (m) env[m[1]] = m[2];
    }
  } catch { /* fall through */ }
  return {
    url: process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

const { url: SUPABASE_URL, key: ANON_KEY } = loadEnv();
if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY (.env or env vars).');
  process.exit(2);
}

async function rest(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

// ---------- load static sources ----------
async function loadStaticRegistry() {
  await build({
    entryPoints: ['src/data/articles/index.ts'],
    bundle: true, format: 'esm', platform: 'node',
    outfile: 'node_modules/.parity-registry.mjs',
    alias: { '@': ROOT + '/src' }, logLevel: 'error',
  });
  const mod = await import(pathToFileURL(ROOT + '/node_modules/.parity-registry.mjs'));
  return mod.MULTILINGUAL_ARTICLES;
}

const jsonCards = JSON.parse(readFileSync('src/data/oceanic_bharat/oceanic_cards_8.json', 'utf8')).cards;

const nonEmptyLangs = (content) =>
  Object.entries(content || {})
    .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
    .map(([k]) => k).sort();

// ---------- main ----------
const registry = await loadStaticRegistry();
console.log(`Static sources: ${registry.length} registry articles, ${jsonCards.length} JSON cards`);

// Fetch all published articles once (49 rows — well under any limit)
const dbArticles = await rest(
  'srangam_articles?select=id,slug,slug_alias,status,title,content,updated_at&status=eq.published&limit=1000',
);
console.log(`Database: ${dbArticles.length} published articles`);

const bySlug = new Map();
for (const a of dbArticles) {
  bySlug.set(a.slug, a);
  if (a.slug_alias) bySlug.set(a.slug_alias, a);
}

const rows = [];
let gaps = 0;

// -- registry articles (full content comparison)
for (const art of registry) {
  const db = bySlug.get(art.id);
  const staticLangs = nonEmptyLangs(art.content);
  if (!db) {
    gaps++;
    rows.push({ slug: art.id, kind: 'registry', status: '❌ MISSING IN DB', detail: `static languages: ${staticLangs.join(',')}` });
    continue;
  }
  const dbLangs = nonEmptyLangs(db.content);
  const missingLangs = staticLangs.filter((l) => !dbLangs.includes(l));
  const details = [];
  let bad = false;
  if (missingLangs.length) { bad = true; details.push(`DB missing languages: ${missingLangs.join(',')}`); }
  for (const l of staticLangs) {
    const sLen = (art.content?.[l] || '').length;
    const dLen = (db.content?.[l] || '').length;
    if (dLen > 0 && dLen < sLen * 0.9) { bad = true; details.push(`${l}: DB ${dLen} chars vs static ${sLen} (−${Math.round((1 - dLen / sLen) * 100)}%)`); }
  }
  if (bad) gaps++;
  rows.push({ slug: art.id, kind: 'registry', status: bad ? '⚠️ CONTENT GAP' : '✅ OK', detail: details.join('; ') || `langs ${dbLangs.join(',')}` });
}

// -- JSON cards (existence + pins comparison)
let pinRows;
try {
  pinRows = await rest('srangam_article_pins?select=article_id&limit=10000');
} catch { pinRows = null; }
const pinCount = new Map();
if (pinRows) for (const p of pinRows) pinCount.set(p.article_id, (pinCount.get(p.article_id) || 0) + 1);

for (const card of jsonCards) {
  const db = bySlug.get(card.slug);
  if (!db) {
    gaps++;
    rows.push({ slug: card.slug, kind: 'json_card', status: '❌ MISSING IN DB', detail: `card has ${card.pins?.length || 0} pins, ${card.mla_refs?.length || 0} MLA refs — served by fallback only` });
    continue;
  }
  const dbPins = pinRows ? (pinCount.get(db.id) || 0) : 'unknown';
  const cardPins = card.pins?.length || 0;
  const bad = pinRows && dbPins === 0 && cardPins > 0;
  rows.push({ slug: card.slug, kind: 'json_card', status: bad ? '⚠️ PINS ONLY IN CARD' : '✅ OK', detail: `DB pins: ${dbPins}, card pins: ${cardPins} (resolver enriches from card when DB=0)` });
}

// ---------- report ----------
const now = new Date().toISOString();
const md = `# Static ↔ Database Parity Report

**Generated**: ${now} by \`scripts/registry-parity-check.mjs\` (roadmap Phase 2.0)
**Database**: ${SUPABASE_URL} — ${dbArticles.length} published articles
**Result**: ${gaps === 0 ? '✅ FULL PARITY' : `⚠️ ${gaps} gap(s) found`}

| Slug | Source | Status | Detail |
|---|---|---|---|
${rows.map((r) => `| ${r.slug} | ${r.kind} | ${r.status} | ${r.detail || ''} |`).join('\n')}

## How to act on gaps

- **MISSING IN DB (registry)** → import via Admin → Markdown Import (or \`markdown-to-article-import\`), then re-run.
- **CONTENT GAP** → DB body is shorter than the static registry version for that language; re-import that language's content.
- **PINS ONLY IN CARD** → run \`backfill-article-pins\` for that article, or keep relying on the resolver's card-pin enrichment (Phase 2.1) until backfilled.
- Re-run until ✅ FULL PARITY, then proceed to roadmap 2.6 (registry retirement) after 2+ weeks of zero \`static_fallback_serve\` events.
`;

writeFileSync('docs/PARITY_REPORT.md', md);
console.log(`\nWrote docs/PARITY_REPORT.md — ${gaps === 0 ? 'FULL PARITY ✅' : gaps + ' gap(s) ⚠️'}`);
process.exit(gaps === 0 ? 0 : 1);
