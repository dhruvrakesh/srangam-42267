import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The import summary read `importResult.stats.citationsCreated`. The edge
 * function had been corrected to return `citationsExtracted` instead. Nothing
 * failed: React renders undefined as nothing, so the box went blank and an
 * editor checking whether their citations were picked up saw an empty
 * rectangle. No error, no warning, no test.
 *
 * This asserts the CLASS of the bug rather than the instance: every stat key
 * the admin UI reads must either be produced by the SUCCESS path of the edge
 * function, or carry its own fallback.
 *
 * A note on why the extraction below is fussy. The first version of this test
 * collected keys from every `stats: {` literal in the file. It passed on the
 * broken code, because `citationsCreated` still appeared in the ImportResponse
 * *interface* and in the *merge* branch - just never in the success response
 * the UI actually receives. A union of every block is not the contract; the
 * one block that answers a fresh import is. Reading the wrong region is how a
 * test comes out green on a defect it was written to catch.
 *
 * It is deliberately static. Rendering the admin page would need a router, a
 * query client and a Supabase mock, and would still not catch a key that is
 * merely absent - which is exactly what went wrong.
 */

// Same idiom as supabase-types-cover-queried-tables.test.ts: this suite runs
// as ESM, where __dirname does not exist.
const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const UI_PATH = resolve(ROOT, 'src/pages/admin/MarkdownImport.tsx');
const FN_PATH = resolve(
  ROOT,
  'supabase/functions/markdown-to-article-import/index.ts',
);

/** Body of the brace-balanced `stats: { ... }` that follows `after`. */
function statsBlockAfter(src: string, after: string): string {
  const from = src.indexOf(after);
  if (from === -1) return '';
  const start = src.indexOf('stats: {', from);
  if (start === -1) return '';
  const open = src.indexOf('{', start);
  let depth = 0;
  let i = open;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return src.slice(open + 1, i);
}

function keysIn(block: string): Set<string> {
  const out = new Set<string>();
  for (const raw of block.split('\n')) {
    const line = raw.replace(/\/\/.*$/, '').trim();
    const m = line.match(/^([A-Za-z_$][\w$]*)\s*[:,]/);
    if (m) out.add(m[1]);
  }
  return out;
}

/**
 * Keys DECLARED in MarkdownImport.tsx's own `interface ImportResult` mirror.
 *
 * The client keeps its own copy of the response shape. On 2026-09-09 a patch
 * updated the edge function's ImportResponse and the UI's usage but not this
 * local mirror, and `tsc` failed with four TS2551 errors while this suite
 * passed 75/75 - vitest does not typecheck. Same shape of mistake as the
 * defect being repaired: one side of a contract moved, the other did not.
 */
function declaredStatsKeys(src: string): Set<string> {
  const iface = src.indexOf('interface ImportResult');
  if (iface === -1) return new Set<string>();
  const marker = src.indexOf('stats?: {', iface);
  if (marker === -1) return new Set<string>();
  const open = src.indexOf('{', marker);
  let depth = 0;
  let i = open;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  const out = new Set<string>();
  for (const raw of src.slice(open + 1, i).split('\n')) {
    const line = raw.replace(/\/\/.*$/, '').trim();
    // Interface members may be optional: "citationsPersisted?: number;"
    const m = line.match(/^([A-Za-z_$][\w$]*)\??\s*:/);
    if (m) out.add(m[1]);
  }
  return out;
}

/** Keys the UI reads off importResult.stats, and whether each is guarded. */
function readUiStatKeys(src: string): Map<string, boolean> {
  const keys = new Map<string, boolean>();
  const re = /importResult\.stats\.([A-Za-z_$][\w$]*)([^\n]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const guarded = /^\s*(\?\?|\|\||\?\.)/.test(m[2]);
    keys.set(m[1], (keys.get(m[1]) ?? false) || guarded);
  }
  return keys;
}

describe('markdown import: the UI and the edge function agree on stat keys', () => {
  const ui = readFileSync(UI_PATH, 'utf-8');
  const fn = readFileSync(FN_PATH, 'utf-8');

  // The response a fresh import actually receives.
  const successKeys = keysIn(statsBlockAfter(fn, 'const response: ImportResponse'));
  // The response a translation merge receives.
  const mergeKeys = keysIn(statsBlockAfter(fn, 'merged: true'));
  const uiKeys = readUiStatKeys(ui);

  it('locates both response blocks and the UI reads (no silently empty test)', () => {
    expect(successKeys.size, 'could not find the success stats block').toBeGreaterThan(3);
    expect(mergeKeys.size, 'could not find the merge stats block').toBeGreaterThan(2);
    expect(uiKeys.size, 'UI reads no stat keys at all').toBeGreaterThan(0);
  });

  it('every unguarded key the UI reads is returned by the SUCCESS path', () => {
    const orphans = [...uiKeys.entries()]
      .filter(([key, guarded]) => !guarded && !successKeys.has(key))
      .map(([key]) => key);

    expect(
      orphans,
      `MarkdownImport.tsx reads importResult.stats.${orphans.join(', ')} with no ` +
        `?? / || fallback, but the success response of markdown-to-article-import ` +
        `does not include ${orphans.length === 1 ? 'that key' : 'those keys'}. ` +
        `React renders undefined as an empty box, so this ships as a blank ` +
        `number with no error. Either return the key or give the UI a fallback. ` +
        `Success path returns: ${[...successKeys].sort().join(', ')}`,
    ).toEqual([]);
  });

  it('every key the UI reads is declared in its own ImportResult mirror', () => {
    const declared = declaredStatsKeys(ui);
    expect(declared.size, 'could not find ImportResult stats block').toBeGreaterThan(3);

    const undeclared = [...uiKeys.keys()].filter((k) => !declared.has(k));
    expect(
      undeclared,
      `MarkdownImport.tsx reads importResult.stats.${undeclared.join(', ')} but ` +
        `its own interface ImportResult does not declare ` +
        `${undeclared.length === 1 ? 'it' : 'them'}. tsc reports this as TS2551 ` +
        `"Did you mean ...?" - but only tsc: this suite would pass, because ` +
        `vitest does not typecheck. Declares: ${[...declared].sort().join(', ')}`,
    ).toEqual([]);
  });

  it('the citations figures that carry the panel meaning are still produced', () => {
    // What was parsed, what was stored, and whether the backfill has run.
    // Losing any of them quietly is how this bug happened the first time.
    for (const key of ['citationsExtracted', 'citationsPersisted', 'bibliographyBackfillRun']) {
      expect(
        successKeys.has(key),
        `the success response no longer returns stats.${key}`,
      ).toBe(true);
    }
  });

  it('the merge path speaks the same vocabulary as the fresh-import path', () => {
    // The merge branch used to return only the old citationsCreated key, so a
    // merge rendered "0" while a fresh import rendered blank: two paths, two
    // key names, one UI.
    for (const key of ['citationsExtracted', 'citationsPersisted']) {
      expect(
        mergeKeys.has(key),
        `the merge response does not return stats.${key}; it returns ` +
          `${[...mergeKeys].sort().join(', ')}`,
      ).toBe(true);
    }
  });
});
