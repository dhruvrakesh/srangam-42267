import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * QUERY_CEILING_2026_09_10 - the ratchet.
 *
 * PostgREST answers an unbounded select with at most `max-rows` (1000 on
 * Supabase by default). The client cannot distinguish a truncated page from
 * a complete one, so any figure derived from the returned array - a length,
 * a mean, a set of distinct values, a "no results" conclusion - is correct
 * only while the table stays under the ceiling, and silently wrong after.
 *
 * src/hooks/useResearchStats.ts recorded this on 2026-09-06:
 *
 *     "correct at 49 articles, silently wrong at 1001"
 *
 * and fixed one hook. /research-network kept the same defect for four more
 * days and shipped "Cross-References 1000, Reference Types 2" to production.
 * A one-off fix does not stop the next one; a baseline does.
 *
 * This does NOT demand that every query be bounded today - 50-odd of them
 * are not, and rewriting them all in one commit is exactly the kind of
 * change that kills a working project. It freezes the count. New unbounded
 * queries fail the suite; existing ones can be burned down one at a time and
 * the baseline regenerated downward.
 *
 * THE CORPUS IS WHY THIS MATTERS NOW. srangam_texts is still empty, and the
 * local pipeline holds 49,555 passages waiting to be ingested. On the day
 * that ingest runs, every unbounded query against it crosses the ceiling at
 * once. The ratchet needs to exist before then, not after.
 *
 * To regenerate after burning some down:
 *   QUERY_BOUNDS_WRITE_BASELINE=1 npx vitest run src/__tests__/query-bounds.test.ts
 * That run deliberately FAILS, so rewriting the expectations can never be
 * mistaken for meeting them.
 */

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const SRC = resolve(ROOT, 'src');
const BASELINE = resolve(here, 'query-bounds.baseline.json');

const FROM_CALL = /\.from\(\s*['"]([A-Za-z0-9_]+)['"]/g;
const BOUNDED = /\.limit\(|\.range\(|\.single\(\)|\.maybeSingle\(\)|head:\s*true/;

export interface Chain {
  table: string;
  bounded: boolean;
}

/** Every PostgREST chain in one source file, and whether it names a bound. */
export function chainsIn(source: string): Chain[] {
  const out: Chain[] = [];
  FROM_CALL.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = FROM_CALL.exec(source)) !== null) {
    // A chain runs to the statement terminator. Anything past that belongs
    // to the next statement and must not be credited to this one.
    const end = source.indexOf(';', m.index);
    const chain = source.slice(m.index, end === -1 ? m.index + 400 : end);
    out.push({ table: m[1], bounded: BOUNDED.test(chain) });
  }
  return out;
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      // The test directory is excluded: this very file contains example
      // chains, and a rule that counts its own fixtures is not a rule.
      if (entry === '__tests__' || entry === 'node_modules') continue;
      walk(full, acc);
    } else if (/\.tsx?$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

/** Keys of every unbounded chain in src/, as `path::table`, sorted. */
export function scanUnbounded(): string[] {
  const keys: string[] = [];
  for (const file of walk(SRC)) {
    const rel = relative(ROOT, file).split(sep).join('/');
    for (const c of chainsIn(readFileSync(file, 'utf-8'))) {
      if (!c.bounded) keys.push(`${rel}::${c.table}`);
    }
  }
  return [...new Set(keys)].sort();
}

describe('PostgREST row ceiling', () => {
  const found = scanUnbounded();

  if (process.env.QUERY_BOUNDS_WRITE_BASELINE) {
    it('rewrites the baseline and fails on purpose', () => {
      writeFileSync(
        BASELINE,
        JSON.stringify(
          {
            marker: 'QUERY_CEILING_2026_09_10',
            note:
              'Unbounded PostgREST selects, frozen so the count can only go ' +
              'down. Regenerate with QUERY_BOUNDS_WRITE_BASELINE=1; that run ' +
              'deliberately fails so a rewrite is never mistaken for a pass.',
            count: found.length,
            unbounded: found,
          },
          null,
          2,
        ) + '\n',
        'utf-8',
      );
      expect.fail(
        `Baseline rewritten with ${found.length} entries. This run is failed ` +
          `deliberately. Re-run without QUERY_BOUNDS_WRITE_BASELINE to verify.`,
      );
    });
    return;
  }

  it('has a baseline to measure against', () => {
    expect(existsSync(BASELINE), `missing ${BASELINE}`).toBe(true);
  });

  it('introduces no new unbounded query', () => {
    const baseline: { unbounded: string[] } = JSON.parse(
      readFileSync(BASELINE, 'utf-8'),
    );
    const known = new Set(baseline.unbounded);
    const added = found.filter((k) => !known.has(k));

    expect(
      added,
      'A select with no .limit(), .range(), .single(), .maybeSingle() or ' +
        'head:true is answered with at most 1000 rows and the client cannot ' +
        'tell. If the result is counted, averaged, or searched for absence, ' +
        'the answer is wrong once the table passes 1000. Declare a bound, or ' +
        'use head:true for a count. New: ' + added.join(', '),
    ).toEqual([]);
  });

  it('never grows the total', () => {
    const baseline: { unbounded: string[] } = JSON.parse(
      readFileSync(BASELINE, 'utf-8'),
    );
    expect(found.length).toBeLessThanOrEqual(baseline.unbounded.length);
  });

  it('the research network no longer reads cross-references unbounded', () => {
    // The specific defect that started this: 1000 edges, 2 reference types,
    // a mean over an arbitrary thousand rows.
    expect(found).not.toContain(
      'src/pages/ResearchNetwork.tsx::srangam_cross_references',
    );
  });

  it('the rule can still see a genuine offender', () => {
    // A gate that cannot fail is decoration.
    const bad = `const { data } = await supabase.from('srangam_texts').select('*');`;
    const good = `const { data } = await supabase.from('srangam_texts').select('*').limit(50);`;
    const counted = `const { count } = await supabase.from('srangam_texts').select('id', { count: 'exact', head: true });`;

    expect(chainsIn(bad).filter((c) => !c.bounded)).toHaveLength(1);
    expect(chainsIn(good).filter((c) => !c.bounded)).toHaveLength(0);
    expect(chainsIn(counted).filter((c) => !c.bounded)).toHaveLength(0);
  });

  it('does not let a later statement launder an earlier one', () => {
    // Two statements, the first unbounded. Reading past the semicolon would
    // credit the first with the second's .limit() and report nothing wrong.
    const two =
      `const a = await supabase.from('srangam_articles').select('*');\n` +
      `const b = await supabase.from('srangam_tags').select('*').limit(10);`;
    const unbounded = chainsIn(two).filter((c) => !c.bounded);
    expect(unbounded.map((c) => c.table)).toEqual(['srangam_articles']);
  });
});
