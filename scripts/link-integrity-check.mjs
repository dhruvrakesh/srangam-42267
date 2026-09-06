/**
 * link-integrity-check.mjs — every internal link in the UI must resolve.
 *
 * WHY THIS EXISTS
 * /themes/scripts-inscriptions carried
 *     <Link to="/sarira-atman-vedic-preservation">
 * for an unknown period. The correct legacy path is
 *     /sarira-and-atman-vedic-preservation   (App.tsx:183)
 * — one missing "and-". No route matched, so the link fell through to the
 * catch-all and rendered NotFound. Nothing in the build, the type-checker or
 * the test suite could see it, because a <Link to> is just a string.
 *
 * This script resolves every internal link literal in src/ against:
 *   1. the <Route path=...> declarations in src/App.tsx (including nesting)
 *   2. the static registry article ids  (src/data/articles/index.ts)
 *   3. canonicalSlugMap.ts registry-id -> DB-slug pairs
 *   4. the live DB slugs and aliases    (docs/db_inventory.csv, when present)
 *
 * A link is BROKEN only when it matches none of the four.
 *
 *   node scripts/link-integrity-check.mjs
 *   node scripts/link-integrity-check.mjs --json
 *
 * Exit 0 = every link resolves. Exit 1 = at least one broken link.
 * Reads only. Writes nothing.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

// ---------- collect source files ----------
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) { if (e !== 'node_modules' && e !== '__tests__') walk(p, out); }
    else if (/\.(tsx?|jsx?)$/.test(e)) out.push(p);
  }
  return out;
}
const files = walk(SRC);

// ---------- 1. declared routes ----------
const app = readFileSync(join(SRC, 'App.tsx'), 'utf8');
const routePaths = new Set();
for (const m of app.matchAll(/<Route\s+[^>]*path=["'`]([^"'`]+)["'`]/g)) routePaths.add(m[1]);
// nested admin routes: <Route path="/admin" ...> with children <Route path="x">
const adminChildren = [...app.matchAll(/<Route\s+path=["']([a-z0-9-/:]+)["']\s+element/g)]
  .map((m) => m[1]).filter((p) => !p.startsWith('/'));
for (const c of adminChildren) routePaths.add('/admin/' + c);
routePaths.add('/admin');

const staticRoutes = new Set([...routePaths].filter((p) => !p.includes(':') && !p.endsWith('/*')));
const prefixRoutes = [...routePaths].filter((p) => p.endsWith('/*')).map((p) => p.slice(0, -2));

// ---------- 2/3. registry ids + canonical map ----------
const idx = readFileSync(join(SRC, 'data/articles/index.ts'), 'utf8');
const modules = [...idx.matchAll(/from '\.\/([a-z0-9-]+)'/g)].map((m) => m[1]);
const registryIds = new Set();
for (const mod of modules) {
  const p = join(SRC, 'data/articles', mod + '.ts');
  if (!existsSync(p)) continue;
  const m = readFileSync(p, 'utf8').match(/\bid\s*:\s*'([^']+)'/);
  if (m) registryIds.add(m[1]);
}
const cmapSrc = existsSync(join(SRC, 'data/articles/canonicalSlugMap.ts'))
  ? readFileSync(join(SRC, 'data/articles/canonicalSlugMap.ts'), 'utf8') : '';
const canonical = new Map(
  [...cmapSrc.split('CANONICAL_SLUG_MAP').pop().matchAll(/'([a-z0-9-]+)'\s*:\s*'([a-z0-9-]+)'/g)]
    .map((m) => [m[1], m[2]]));

// ---------- 4. live DB slugs ----------
const dbSlugs = new Set(); const dbStatus = new Map();
const invPath = join(ROOT, 'docs/db_inventory.csv');
let haveInventory = false;
if (existsSync(invPath)) {
  haveInventory = true;
  const lines = readFileSync(invPath, 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const head = lines[0].replace(/^﻿/, '');
  const d = (head.match(/;/g) || []).length >= (head.match(/,/g) || []).length ? ';' : ',';
  const cols = head.split(d);
  const iSlug = cols.indexOf('slug'), iAlias = cols.indexOf('slug_alias'), iSt = cols.indexOf('status');
  for (const line of lines.slice(1)) {
    const c = line.split(d);
    if (c[iSlug]) { dbSlugs.add(c[iSlug].trim()); dbStatus.set(c[iSlug].trim(), c[iSt]?.trim()); }
    if (c[iAlias]?.trim()) { dbSlugs.add(c[iAlias].trim()); dbStatus.set(c[iAlias].trim(), c[iSt]?.trim()); }
  }
}

// ---------- collect link literals ----------
const LINK = /(?:<Link\s+[^>]*?to|<NavLink\s+[^>]*?to|href|navigate\()\s*=?\s*[({]?\s*["'`](\/[^"'`\s${}]*)["'`]/g;
const links = [];
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  const rel = relative(ROOT, f).replace(/\\/g, '/');
  const lineOf = (i) => s.slice(0, i).split('\n').length;
  for (const m of s.matchAll(LINK)) {
    const url = m[1].split('#')[0].split('?')[0];
    if (url === '/' || url.startsWith('//')) continue;
    links.push({ file: rel, line: lineOf(m.index), url });
  }
}

// ---------- resolve ----------
const ARTICLE_PREFIXES = ['/articles/', '/oceanic/'];
function resolve(url) {
  if (staticRoutes.has(url)) return { ok: true, how: 'static route' };
  for (const p of prefixRoutes) {
    if (url === p || url.startsWith(p + '/')) {
      const slug = url.slice(p.length + 1);
      if (!slug) return { ok: true, how: `route ${p}/*` };
      if (registryIds.has(slug)) return { ok: true, how: 'registry article' };
      if (dbSlugs.has(slug)) return { ok: true, how: `DB row (${dbStatus.get(slug)})` };
      if (canonical.has(slug) && dbSlugs.has(canonical.get(slug)))
        return { ok: true, how: `canonicalSlugMap -> ${canonical.get(slug)}` };
      if (!haveInventory) return { ok: true, how: `under ${p}/* (no inventory to verify)`, weak: true };
      return { ok: false, why: `no registry article, DB slug or alias named '${slug}'` };
    }
  }
  // a bare /slug that is not a declared route
  const bare = url.slice(1);
  if (registryIds.has(bare) || dbSlugs.has(bare)) {
    return { ok: false, why: `'${bare}' is a real article, but there is no <Route path="${url}"> — `
      + `App.tsx declares legacy redirects one by one and this one is missing. Link to /articles/${bare}.` };
  }
  return { ok: false, why: `no <Route path="${url}"> in App.tsx` };
}

const broken = [], weak = [];
for (const l of links) {
  const r = resolve(l.url);
  if (!r.ok) broken.push({ ...l, why: r.why });
  else if (r.weak) weak.push(l);
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ scanned: links.length, broken }, null, 2));
} else {
  console.log(`files scanned      : ${files.length}`);
  console.log(`internal links     : ${links.length} (${new Set(links.map((l) => l.url)).size} distinct)`);
  console.log(`declared routes    : ${staticRoutes.size} static + ${prefixRoutes.length} prefix`);
  console.log(`registry articles  : ${registryIds.size}`);
  console.log(`DB slugs + aliases : ${haveInventory ? dbSlugs.size : 'NOT LOADED — run parity_inventory.sql and export to docs/db_inventory.csv'}`);
  console.log('');
  if (!broken.length) console.log('✅ every internal link resolves.');
  else {
    console.log(`❌ ${broken.length} BROKEN LINK(S)\n`);
    for (const b of broken) {
      console.log(`  ${b.file}:${b.line}`);
      console.log(`     -> ${b.url}`);
      console.log(`        ${b.why}\n`);
    }
  }
  if (weak.length) console.log(`(${weak.length} link(s) under a prefix route could not be verified without the inventory)`);
}
process.exit(broken.length ? 1 : 0);
