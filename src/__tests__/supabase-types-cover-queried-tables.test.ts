/**
 * The generated Supabase types are a build input, not documentation.
 *
 * On 2026-09-08 two commits overwrote src/integrations/supabase/types.ts with a
 * Supabase CLI access-token error; Lovable restored it from 7acddbd. While it was
 * broken, every typed query in the app had lost its types and nothing failed.
 *
 * This makes that state un-committable. It follows meta-freshness.test.ts: assert
 * a generated file still describes what the code depends on.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(here, '../integrations/supabase/types.ts'), 'utf8');

// Tables the application actually queries. Add a row when you add a query.
const REQUIRED = [
  'srangam_articles',
  'srangam_article_pins',
  'srangam_texts',
  'srangam_text_passages',
];

describe('generated Supabase types', () => {
  it('is a real generated types file, not a truncated error', () => {
    expect(src).toContain('export type Database');
    expect(src.length).toBeGreaterThan(10000);
  });

  for (const table of REQUIRED) {
    it('declares ' + table, () => {
      expect(src).toContain(table + ': {');
    });
  }
});