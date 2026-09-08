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

import { listPublishedTexts, loadPassages, loadTextByDocCode } from '@/lib/corpusTexts';

beforeEach(() => { state.data = []; state.error = null; state.count = 0; });

describe('Track B3 - corpus loaders distinguish empty from failed', () => {
  it('an empty corpus is ok:true, no rows, no error', async () => {
    const r = await listPublishedTexts();
    expect(r.ok).toBe(true);
    expect(r.rows).toEqual([]);
    expect(r.total).toBe(0);
    expect(r.error).toBeNull();
  });

  it('a FAILED query is ok:false WITH an error - not a silent empty list', async () => {
    // The regression this file exists for. Without the ok/error pair, a reader
    // renders "no texts" during an outage and asserts something false.
    state.error = { message: 'permission denied for table srangam_texts' };
    const r = await listPublishedTexts();
    expect(r.ok).toBe(false);
    expect(r.error).toContain('permission denied');
  });

  it('holds the invariant: error is non-null exactly when ok is false', async () => {
    state.error = null;
    const good = await listPublishedTexts();
    expect(good.ok === false).toBe(good.error !== null);

    state.error = { message: 'boom' };
    const bad = await listPublishedTexts();
    expect(bad.ok === false).toBe(bad.error !== null);
  });

  it('maps text rows through unchanged', async () => {
    state.data = [{ id: 'a', doc_code: 'MBh01', title: 'Mahabharata I', category: 'mahabharata',
                    source_note: null, translation_engine: 'gemini', passage_count: 6957,
                    published: true }];
    state.count = 1;
    const r = await listPublishedTexts();
    expect(r.ok).toBe(true);
    expect(r.rows[0].doc_code).toBe('MBh01');
    expect(r.rows[0].passage_count).toBe(6957);
  });

  it('passages: failure carries an error; no textId is an honest empty', async () => {
    state.error = { message: 'timeout' };
    const bad = await loadPassages('some-id');
    expect(bad.ok).toBe(false);
    expect(bad.error).toContain('timeout');

    state.error = null;
    const none = await loadPassages(undefined);
    expect(none.ok).toBe(true);
    expect(none.rows).toEqual([]);
    expect(none.error).toBeNull();
  });

  it('single text: a missing doc_code is ok with row null, not an error', async () => {
    const r = await loadTextByDocCode(undefined);
    expect(r.ok).toBe(true);
    expect(r.row).toBeNull();
    expect(r.error).toBeNull();
  });
});