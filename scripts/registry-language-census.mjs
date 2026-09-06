/**
 * registry-language-census.mjs — how much CONTENT would be lost if the static
 * TS registry were retired (Enterprise Roadmap 2.6).
 *
 * Context (2026-09-06): the privileged SQL-editor inventory shows the DB holds
 * 58 rows, of which only 3 carry more than one language. The static registry
 * carries full multilingual bodies. Retiring the registry before those bodies
 * are in the DB would delete the multilingual corpus. This script measures the
 * exact exposure so 2.6 is decided on a number, not an impression.
 *
 *   node scripts/registry-language-census.mjs
 *   node scripts/registry-language-census.mjs --json
 *
 * Reads only. Writes nothing.
 */
import { build } from 'esbuild';
import { pathToFileURL } from 'url';

const ROOT = process.cwd();
await build({
  entryPoints: ['src/data/articles/index.ts'], bundle: true, format: 'esm',
  platform: 'node', outfile: 'node_modules/.census.mjs',
  alias: { '@': ROOT + '/src' }, logLevel: 'error',
});
const { MULTILINGUAL_ARTICLES: R } =
  await import(pathToFileURL(ROOT + '/node_modules/.census.mjs'));

const langsOf = (c) => Object.entries(c || {})
  .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
  .map(([k]) => k).sort();

let bodies = 0, nonEn = 0, chars = 0, nonEnChars = 0;
const per = [];
for (const a of R) {
  const L = langsOf(a.content);
  bodies += L.length; nonEn += L.filter((l) => l !== 'en').length;
  let c = 0;
  for (const l of L) { const n = (a.content[l] || '').length; c += n; chars += n; if (l !== 'en') nonEnChars += n; }
  per.push({ id: a.id, langs: L, n: L.length, chars: c });
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ articles: R.length, bodies, nonEn, chars, nonEnChars, per }, null, 2));
} else {
  console.log(`registry articles       : ${R.length}`);
  console.log(`language bodies total   : ${bodies}`);
  console.log(`  of which non-English  : ${nonEn}`);
  console.log(`characters total        : ${chars.toLocaleString()}`);
  console.log(`  non-English characters: ${nonEnChars.toLocaleString()} (${(100 * nonEnChars / chars).toFixed(1)}%)`);
  console.log('\nlangs  chars    article');
  for (const p of per.sort((x, y) => y.n - x.n || y.chars - x.chars)) {
    console.log(`  ${String(p.n).padStart(2)}  ${String(p.chars).padStart(8)}  ${p.id.padEnd(38)} ${p.langs.join(',')}`);
  }
}
