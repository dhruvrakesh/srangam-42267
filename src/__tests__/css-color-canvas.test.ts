import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveCssColor, clearCssColorCache } from '@/lib/cssColor';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');

describe('resolveCssColor', () => {
  beforeEach(() => {
    clearCssColorCache();
    document.documentElement.style.setProperty('--peacock-blue', '199 89% 34%');
    document.documentElement.style.setProperty('--foreground', '222 47% 11%');
    document.documentElement.style.removeProperty('--never-defined');
  });

  it('resolves the hsl(var(--token)) form the graph actually uses', () => {
    expect(resolveCssColor('hsl(var(--peacock-blue))')).toBe('hsl(199 89% 34%)');
  });

  it('resolves a bare var(--token)', () => {
    expect(resolveCssColor('var(--foreground)')).toBe('hsl(222 47% 11%)');
  });

  it('leaves an already-concrete colour alone', () => {
    expect(resolveCssColor('#1A365D')).toBe('#1A365D');
    expect(resolveCssColor('hsl(199 89% 34%)')).toBe('hsl(199 89% 34%)');
  });

  it('falls back rather than returning something canvas will ignore', () => {
    expect(resolveCssColor('hsl(var(--never-defined))', '#123456')).toBe('#123456');
  });

  it('honours an inline var() fallback before the argument default', () => {
    expect(resolveCssColor('var(--never-defined, #abcdef)', '#123456')).toBe('#abcdef');
  });

  it('never returns a value still containing var(), which canvas would drop', () => {
    for (const input of [
      'hsl(var(--peacock-blue))',
      'var(--foreground)',
      'hsl(var(--never-defined))',
    ]) {
      expect(resolveCssColor(input)).not.toContain('var(');
    }
  });

  it('re-reads after the cache is cleared, so a theme change is picked up', () => {
    expect(resolveCssColor('hsl(var(--foreground))')).toBe('hsl(222 47% 11%)');
    document.documentElement.style.setProperty('--foreground', '0 0% 98%');
    // Still cached - this is the behaviour the toggle must clear.
    expect(resolveCssColor('hsl(var(--foreground))')).toBe('hsl(222 47% 11%)');
    clearCssColorCache();
    expect(resolveCssColor('hsl(var(--foreground))')).toBe('hsl(0 0% 98%)');
  });
});

/**
 * The regression that motivated all of the above. ResearchNetwork paints on a
 * 2D canvas, where `hsl(var(--x))` is not a parseable <color>; per the HTML
 * spec an unparseable fillStyle assignment is ignored and the previous value
 * persists. So every node kept the last fill set, and the label drawn
 * immediately after its circle inherited the circle's own colour.
 *
 * This asserts the source no longer hands raw custom properties to a canvas.
 * It is a static check because jsdom's canvas is a stub and cannot observe
 * the real parsing behaviour - the very reason the bug survived so long.
 */
describe('ResearchNetwork: no unresolved CSS variables reach the canvas', () => {
  const src = readFileSync(resolve(ROOT, 'src/pages/ResearchNetwork.tsx'), 'utf-8');

  it('does not assign a var()-bearing string to fillStyle or strokeStyle', () => {
    // Two things this must not trip on, both found by running the rule
    // against the corrected file before shipping it:
    //   - the explanatory comment, which quotes the old broken line;
    //   - the correct call itself, resolveCssColor('hsl(var(--foreground))'),
    //     where the token is an ARGUMENT to the resolver rather than the
    //     value handed to the canvas.
    // So: strip line comments first, then allow anything routed through the
    // resolver. What remains is a raw variable going straight to a canvas.
    const code = src
      .split('\n')
      .map((line) => line.replace(/\/\/.*$/, ''))
      .join('\n');

    const offenders = [...code.matchAll(/(fillStyle|strokeStyle)\s*=\s*([^;\n]+)/g)]
      .map((m) => `${m[1]} = ${m[2].trim()}`)
      .filter((line) => line.includes('var(--') && !line.includes('resolveCssColor('));

    expect(
      offenders,
      `A canvas 2D context cannot parse hsl(var(--token)); the assignment is ` +
        `ignored and the previous colour persists, so the shape keeps whatever ` +
        `fill came before it. Route these through resolveCssColor() from ` +
        `@/lib/cssColor. Found: ${offenders.join(' | ')}`,
    ).toEqual([]);
  });

  it('the rule can still see a genuine offender', () => {
    // A gate that cannot fail is decoration. This proves the matcher above
    // would catch the original line rather than passing on anything.
    const broken = "ctx.fillStyle = 'hsl(var(--foreground))';";
    const code = broken.replace(/\/\/.*$/, '');
    const offenders = [...code.matchAll(/(fillStyle|strokeStyle)\s*=\s*([^;\n]+)/g)]
      .map((m) => `${m[1]} = ${m[2].trim()}`)
      .filter((line) => line.includes('var(--') && !line.includes('resolveCssColor('));
    expect(offenders).toHaveLength(1);
  });

  it('imports the resolver it needs', () => {
    expect(src).toMatch(/from ['"]@\/lib\/cssColor['"]/);
  });
});
