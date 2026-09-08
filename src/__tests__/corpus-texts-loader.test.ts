import { describe, it, expect, vi, beforeEach } from 'vitest';

const state: { data: unknown; error: unknown; count: number | null } =
  { data: [], error: null, count: 0 };

vi.mock('@/integrations/supabase/client', () => {
  const chain: any = {};
  for (const m of ['select', 'eq', 'order', 'range']) chain[m] = () => chain;
  chain.maybeSingle = () => Promise.resolve({ data: state.data, error: state.error });
  chain.then = (res: any) =>
    Promise.resolve({ data: state.data, error: state.error, count: state.count }).then(res);
  return { supabase: { from: () => chain } };
});

import { listPublishedTexts, loadPassages } from '@/lib/corpusTexts';

beforeEach(() => { state.data = []; state.error = null; state.count = 0; });

describe('Track B3 - corpus loaders distinguish empty from failed', () => {
  it('an empty corpus is ok:true with no rows', async () => {
    const r = await listPublishedTexts();
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.rows).toEqual([]); expect(r.total).toBe(0); }
  });

  it('a FAILED query is ok:false - never an empty list', async () => {
    // The regression this file exists for. Returning [] here would make the
    // reader render "no texts" during an outage, asserting something false
    // about the corpus.
    state.error = { message: 'permission denied for table srangam_texts' };
    const r = await listPublishedTexts();
    // strictNullChecks is OFF here, so `if (!r.ok)` does not narrow a boolean
    // discriminant. Throwing on the positive branch narrows the rest of the flow
    // and says the intent more plainly: the failure IS the assertion.
    if (r.ok) throw new Error('expected ok:false, got ok:true');
    expect(r.error).toContain('permission denied');
  });

  it('maps text rows through unchanged', async () => {
    state.data = [{ id: 'a', doc_code: 'MBh01', title: 'Mahabharata I', category: 'mahabharata',
                    source_note: null, translation_engine: 'gemini', passage_count: 6957,
                    published: true }];
    state.count = 1;
    const r = await listPublishedTexts();
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.rows[0].doc_code).toBe('MBh01'); expect(r.rows[0].passage_count).toBe(6957); }
  });

  it('passages: a failed load is ok:false, and no textId is an honest empty', async () => {
    state.error = { message: 'timeout' };
    const bad = await loadPassages('some-id');
    expect(bad.ok).toBe(false);

    state.error = null;
    const none = await loadPassages(undefined);
    expect(none.ok).toBe(true);
    if (none.ok) expect(none.rows).toEqual([]);
  });
});