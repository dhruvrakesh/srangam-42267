// Phase L.3 — MV-01 regression net.
//
// jsdom does not run real layout, so a runtime scrollWidth assertion would
// be misleading. The honest enterprise net is a source scan: for every
// `min-w-[NNNNpx]` Tailwind className in src/, assert the same source file
// contains an `overflow-x-auto` (or `overflow-auto`) wrapper. This catches
// the exact regression class that caused Phase K — a fixed-width child
// rendered into an article body without a horizontal scroll container.
//
// The authoritative cross-browser check (iOS Safari 17, Android Chrome 124,
// Samsung Internet 24 at 360 px) lives in docs/RELIABILITY_AUDIT.md MV-01.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(process.cwd(), 'src');
const MIN_W_RE = /min-w-\[(\d{3,})px\]/g;
const OVERFLOW_RE = /\boverflow-(x-)?auto\b/;

// Files where a wide min-w is intentional and externally wrapped, or where
// the value is below the MV-01 threshold of concern (< 360 px is fine).
const ALLOWLIST = new Set<string>([
  // Add justified exceptions here with a comment explaining the wrapper.
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (name === 'node_modules' || name === '__tests__' || name.startsWith('.')) continue;
      walk(full, out);
    } else if (/\.(tsx?|jsx?)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe('MV-01: mobile viewport overflow guard', () => {
  it('every min-w-[>=360px] sits in a file that also declares overflow-x-auto/overflow-auto', () => {
    const offenders: string[] = [];
    const files = walk(ROOT);

    for (const file of files) {
      if (ALLOWLIST.has(file)) continue;
      const src = readFileSync(file, 'utf8');
      MIN_W_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = MIN_W_RE.exec(src)) !== null) {
        const px = parseInt(m[1], 10);
        if (px < 360) continue; // below mobile threshold — irrelevant to MV-01
        if (!OVERFLOW_RE.test(src)) {
          offenders.push(`${file.replace(ROOT, 'src')} :: min-w-[${px}px] without overflow-x-auto`);
        }
      }
    }

    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('ArticlePage exposes a stable [data-testid="article-body"] anchor', () => {
    const src = readFileSync(join(ROOT, 'components/articles/ArticlePage.tsx'), 'utf8');
    expect(src).toMatch(/data-testid=["']article-body["']/);
  });
});
