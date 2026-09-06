/**
 * src/__tests__/research-stats-counts.test.ts
 *
 * Master Plan Q1 regression. (Q1_COUNTS_2026_09_06)
 *
 * The homepage figure labelled "Published Articles" rendered `totalArticles`,
 * which useResearchStats derived from `.select('theme, status')` with no status
 * filter — published PLUS drafts. The correct value was computed two lines away
 * and never passed. No test covered this hook, which is why a wrong public
 * number survived from at least 2026-07-12 to 2026-09-06.
 *
 * These tests pin the CONTRACT, not the implementation:
 *   1. publishedArticles counts only published rows.
 *   2. totalArticles counts every row.
 *   3. draftArticles is the difference.
 *   4. Neither total is derived from the grouped row array, because PostgREST
 *      caps that at 1000 rows — the failure mode is silent under-reporting at
 *      scale, and it is invisible at today's 49 articles.
 *
 * The Supabase client is mocked; no network, no live DB.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── mock the client before importing the hook ────────────────────────────────
const state = {
  publishedCount: 47,
  totalCount: 56,
  crossRefs: 1066,
  terms: 1699,
  // Deliberately SHORTER than totalCount: this is what a 1000-row PostgREST cap
  // looks like. If the hook derives its totals from this array, test 4 fails.
  themeRows: [] as Array<{ theme: string; status: string }>,
};

vi.mock('@/integrations/supabase/client', () => {
  const from = (table: string) => {
    const builder: any = {
      _table: table,
      _isHead: false,
      _eqStatus: null as string | null,
      select(_cols: string, opts?: { count?: string; head?: boolean }) {
        builder._isHead = !!opts?.head;
        return builder;
      },
      eq(col: string, val: string) {
        if (col === 'status') builder._eqStatus = val;
        return builder;
      },
      then(resolve: (v: any) => void) {
        if (table === 'srangam_cross_references') return resolve({ count: state.crossRefs, data: null });
        if (table === 'srangam_cultural_terms') return resolve({ count: state.terms, data: null });
        if (builder._isHead) {
          return resolve({
            count: builder._eqStatus === 'published' ? state.publishedCount : state.totalCount,
            data: null,
          });
        }
        return resolve({ count: null, data: state.themeRows });
      },
    };
    return builder;
  };
  return { supabase: { from } };
});

import { fetchResearchStats } from '@/hooks/useResearchStats';

function rows(published: number, draft: number) {
  const out: Array<{ theme: string; status: string }> = [];
  for (let i = 0; i < published; i++) out.push({ theme: 'ancient-india', status: 'published' });
  for (let i = 0; i < draft; i++) out.push({ theme: 'indian-ocean-world', status: 'draft' });
  return out;
}

describe('useResearchStats — Q1 counts', () => {
  beforeEach(() => {
    state.publishedCount = 47;
    state.totalCount = 56;
    state.themeRows = rows(47, 9);
  });

  it('publishedArticles counts only published rows', async () => {
    const s = await fetchResearchStats();
    expect(s.publishedArticles).toBe(47);
  });

  it('totalArticles counts every row, published and draft', async () => {
    const s = await fetchResearchStats();
    expect(s.totalArticles).toBe(56);
  });

  it('published and total are DIFFERENT when drafts exist — the original bug', async () => {
    const s = await fetchResearchStats();
    expect(s.publishedArticles).not.toBe(s.totalArticles);
    expect(s.draftArticles).toBe(9);
  });

  it('totals survive a PostgREST 1000-row cap on the grouped select', async () => {
    // The exact counts say 1,240 / 1,500; the grouped array is truncated to 1,000.
    state.publishedCount = 1240;
    state.totalCount = 1500;
    state.themeRows = rows(900, 100); // capped sample
    const s = await fetchResearchStats();
    expect(s.publishedArticles).toBe(1240);   // not 900
    expect(s.totalArticles).toBe(1500);       // not 1000
  });

  it('still returns the per-theme breakdown from the grouped select', async () => {
    const s = await fetchResearchStats();
    const ai = s.themes.find(t => t.theme === 'ancient-india');
    const io = s.themes.find(t => t.theme === 'indian-ocean-world');
    expect(ai?.count).toBe(47);
    expect(io?.count).toBe(0);
    expect(io?.draftCount).toBe(9);
  });

  it('passes through cross-reference and cultural-term counts', async () => {
    const s = await fetchResearchStats();
    expect(s.crossReferences).toBe(1066);
    expect(s.culturalTerms).toBe(1699);
  });
});
