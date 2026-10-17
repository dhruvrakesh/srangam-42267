/**
 * TEST_WAIT_2026_10_16 - the suite's waits, set once: findBy* and waitFor wait up to 5 s (src/test/setup.ts), a test
 * may take 20 s (vitest.config.ts). On 16 Oct, on a busy computer, tests that render correctly failed at the old
 * waits (1 s and 5 s), a different one in each run. A test that needs more says why.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getConfig } from '@testing-library/react';

describe('the suite waits as a busy computer needs (TEST_WAIT_2026_10_16)', () => {
  it('findBy* and waitFor wait up to 5 s', () => {
    expect(getConfig().asyncUtilTimeout).toBe(5000);
  });

  it('a test may take 20 s', () => {
    const cfg = readFileSync(resolve(__dirname, '../../vitest.config.ts'), 'utf8');
    expect(cfg).toMatch(/testTimeout:\s*20000/);
  });
});
