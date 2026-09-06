import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';

/**
 * META_FRESHNESS_2026_09_06
 *
 * src/data/articles/meta.ts is GENERATED. It drives the n/9 language badge on
 * every article card, and for months it drifted from its source modules
 * because generate-registry-meta.mjs wrote its intermediates to '/tmp/...'
 * and therefore could not run on Windows — the only machine this repo is
 * maintained from.
 *
 * On 2026-09-06 two commits (189a270, 3545bd8) claimed the badges had been
 * corrected while meta.ts was untouched: the generator failed, the failure
 * scrolled past, and the message was written from intent rather than result.
 *
 * This test compares meta.ts against its sources on every `npm run test`, so
 * a stale generated file cannot be committed with a message saying otherwise.
 */
function runCheck(): { ok: boolean; out: string; ran: boolean } {
  for (const exe of ['python', 'python3']) {
    try {
      const out = execFileSync(exe, ['scripts/preview-badge-truth.py', '--check'], {
        encoding: 'utf8', cwd: process.cwd(),
      });
      return { ok: true, out, ran: true };
    } catch (err: any) {
      // ENOENT = this interpreter is absent; try the next name.
      if (err?.code === 'ENOENT') continue;
      return { ok: false, out: (err.stdout || '') + (err.stderr || ''), ran: true };
    }
  }
  return { ok: false, out: '', ran: false };
}

describe('generated meta.ts freshness', () => {
  it('meta.ts matches the article modules it is generated from', () => {
    const r = runCheck();
    if (!r.ran) {
      throw new Error(
        'Could not run the meta.ts freshness guard: no `python` or `python3` on PATH.\n'
        + 'This check is not optional — meta.ts drives the language badge on every card '
        + 'and has silently drifted before. Install Python, or run it manually:\n'
        + '  python scripts/preview-badge-truth.py --check',
      );
    }
    if (!r.ok) {
      throw new Error(
        'src/data/articles/meta.ts is STALE.\n\n' + r.out
        + '\nRegenerate it and commit the result:\n'
        + '  node scripts/generate-registry-meta.mjs',
      );
    }
    expect(r.out).toContain('in sync');
  }, 60_000);
});
