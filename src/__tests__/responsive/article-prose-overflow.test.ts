// Phase P / MV-02 — Mobile prose overflow regression net.
//
// Complements MV-01 (table/wide-child overflow). MV-02 covers the prose
// overflow class: <article> must declare overflow-x-clip + min-w-0;
// .article-content mobile typography must use overflow-wrap: anywhere;
// cultural-term chips must render inline (not inline-block).
//
// jsdom does not run layout, so these are honest source-scan invariants.
// The authoritative cross-browser check lives in docs/RELIABILITY_AUDIT.md
// (Phase P, MV-02 manual sweep at 320/360/390/414 px).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(process.cwd(), 'src');

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

describe('MV-02: mobile prose overflow guard', () => {
  it.each([
    ['ArticlePage', 'components/articles/ArticlePage.tsx'],
    ['OceanicArticlePage', 'components/oceanic/OceanicArticlePage.tsx'],
  ])('%s <article data-testid="article-body"> declares overflow-x-clip and min-w-0', (_name, rel) => {
    const src = readFileSync(join(ROOT, rel), 'utf8');
    // Match the <article ...> opening tag containing data-testid="article-body".
    const match = src.match(/<article[^>]*data-testid="article-body"[^>]*>/s)
      ?? src.match(/<article[\s\S]{0,400}?data-testid="article-body"[\s\S]{0,400}?>/);
    expect(match, 'article-body opening tag not found').toBeTruthy();
    const block = match![0];
    expect(block).toMatch(/overflow-x-clip/);
    expect(block).toMatch(/min-w-0/);
  });



  it('index.css mobile block applies safe overflow-wrap (break-word|anywhere) + hyphens:auto to .article-content', () => {
    const css = readFileSync(join(ROOT, 'index.css'), 'utf8');
    expect(css).toMatch(/@media\s*\(max-width:\s*640px\)/);
    const mobileBlockMatch = css.match(/@media\s*\(max-width:\s*640px\)\s*\{[\s\S]*?\n\s*\}\s*\n/);
    expect(mobileBlockMatch, 'mobile media query block not found').toBeTruthy();
    const block = mobileBlockMatch![0];
    expect(block).toMatch(/\.article-content/);
    // Phase U: break-word (preferred) or anywhere both satisfy MV-02 wrap safety.
    expect(block).toMatch(/overflow-wrap:\s*(break-word|anywhere)/);
    expect(block).toMatch(/hyphens:\s*auto/);
  });


  it('CulturalTermTooltip trigger renders inline (never inline-block)', () => {
    const src = readFileSync(join(ROOT, 'components/language/CulturalTermTooltip.tsx'), 'utf8');
    // Locate the trigger className block: starts at <TooltipTrigger and ends at </TooltipTrigger>.
    const match = src.match(/<TooltipTrigger[\s\S]*?<\/TooltipTrigger>/);
    expect(match, '<TooltipTrigger> block not found').toBeTruthy();
    const block = match![0];
    expect(block).not.toMatch(/\binline-block\b/);
    expect(block).toMatch(/"relative inline\b/);
  });

  it('no article component pairs inline-block with px-* without max-w-full', () => {
    // Allowlist: decorative, non-text-flow elements.
    const ALLOW = new Set<string>([
      'src/components/articles/MagadhaReligiousTimeline.tsx', // event badge inside a grid card
      'src/components/articles/ArticleMiniMap.tsx',           // legend dot, 2.5x2.5
    ]);
    const offenders: string[] = [];
    const files = walk(join(ROOT, 'components/articles'));
    for (const file of files) {
      const rel = file.replace(process.cwd() + '/', '');
      if (ALLOW.has(rel)) continue;
      const src = readFileSync(file, 'utf8');
      // Scan className string literals (single- or double-quoted, plus template strings).
      const classRe = /class(?:Name)?\s*=\s*(?:`([^`]*)`|"([^"]*)"|'([^']*)')/g;
      let m: RegExpExecArray | null;
      while ((m = classRe.exec(src)) !== null) {
        const cls = m[1] ?? m[2] ?? m[3] ?? '';
        if (/\binline-block\b/.test(cls) && /\bpx-/.test(cls) && !/\bmax-w-full\b/.test(cls)) {
          offenders.push(`${rel} :: ${cls}`);
        }
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});
