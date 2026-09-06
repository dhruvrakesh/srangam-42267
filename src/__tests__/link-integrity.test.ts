import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';

/**
 * LINK_INTEGRITY_2026_09_06
 *
 * A <Link to="..."> is a string. TypeScript cannot check it, the bundler
 * cannot check it, and a broken one renders NotFound in silence.
 *
 * On 2026-09-06 four were live at once, including one in the site-wide footer
 * and one that had "/sarira-atman-vedic-preservation" where App.tsx declares
 * "/sarira-and-atman-vedic-preservation" — a single missing "and-".
 *
 * scripts/link-integrity-check.mjs resolves every internal link against the
 * declared routes, the static registry, canonicalSlugMap.ts and the live DB
 * inventory, and exits non-zero if any link resolves to nothing. This test is
 * that script, wired into `npm run test` so the next one cannot ship.
 */
describe('internal link integrity', () => {
  it('every <Link to> / href in src/ resolves to a real route or article', () => {
    let out = '';
    let failed = false;
    try {
      out = execFileSync('node', ['scripts/link-integrity-check.mjs'], {
        encoding: 'utf8', cwd: process.cwd(),
      });
    } catch (err: any) {
      failed = true;
      out = (err.stdout || '') + (err.stderr || '');
    }
    if (failed) {
      throw new Error(
        'Broken internal link(s). Each line below is a <Link to>/href that '
        + 'matches no route, registry article, canonical alias or DB slug:\n\n' + out,
      );
    }
    expect(out).toContain('every internal link resolves');
  }, 60_000);
});
