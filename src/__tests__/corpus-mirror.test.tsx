/**
 * CORPUS_READER_C5_2026_10_08 - /corpus and /corpus/:docCode, the working corpus for signed-in readers.
 * The client contract (ok / refused / failed) against a mocked supabase, then the pages with the
 * loaders and the auth context mocked: what a signed-out visitor, a refused reader and a reader see.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

const sb = vi.hoisted(() => ({ rpcRes: null as any, byFn: {} as Record<string, any>, fnRes: null as any, calls: [] as any[] }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: (fn: string, args: any) => { sb.calls.push({ fn, args }); return Promise.resolve(sb.byFn[fn] ?? sb.rpcRes); },
    functions: { invoke: (name: string, opts: any) => { sb.calls.push({ name, opts }); return Promise.resolve(sb.fnRes); } },
  },
}));
const auth = vi.hoisted(() => ({ value: { user: null as any, isLoading: false } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth.value }));

import * as mirror from '@/lib/corpusMirror';
import { safeNext } from '@/lib/safeNext';
import CorpusHome from '@/pages/corpus/CorpusHome';
import CorpusDoc from '@/pages/corpus/CorpusDoc';

const DOC = {
  doc_code: 'markandeya_purana', title: 'Markandeya Purana', category: 'purana', passages: 1222, english: 1219,
  hindi: 1216, vectors: 1258, stories: 13, published: true, synced_at: '2026-10-08T10:09:41Z',
};
const PASSAGE = {
  ord: 1, page_no: 60, idx: 10, verse_ref: '60.10', chapter: '60', text_type: 'mula', sanskrit: 'shloka',
  iast: 'sloka', translation: 'The king sold his wife. //', hindi: 'raja ne patni bechi', quality_score: 0.9,
  translation_qa: 0.8, engine: 'gemini', translated_at: '2026-10-01',
};

function mount(path: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/corpus" element={<CorpusHome />} />
            <Route path="/corpus/:docCode" element={<CorpusDoc />} />
            <Route path="/auth" element={<p>auth page</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  sb.rpcRes = { data: [], error: null }; sb.byFn = {}; sb.fnRes = { data: { results: [] }, error: null }; sb.calls = [];
  auth.value = { user: { id: 'u1' }, isLoading: false };
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
});

describe('the client', () => {
  it('rows are ok; a refusal is refused, not a failure; a failure is not empty', async () => {
    sb.rpcRes = { data: [DOC], error: null };
    expect(await mirror.listMirrorDocs()).toEqual({ ok: true, rows: [DOC], error: null, refused: false });
    expect(sb.calls[0]).toEqual({ fn: 'corpus_reader_docs', args: {} });
    sb.rpcRes = { data: null, error: { code: '42501', message: 'The working corpus is open to signed-in readers only.' } };
    const r = await mirror.listMirrorDocs();
    expect(r.ok).toBe(false); expect(r.refused).toBe(true);
    sb.rpcRes = { data: null, error: { code: '57014', message: 'canceling statement due to statement timeout' } };
    const f = await mirror.listMirrorDocs();
    expect(f).toMatchObject({ ok: false, refused: false, rows: [] });
    expect(f.error).toContain('statement timeout');
    sb.rpcRes = { data: { not: 'a list' }, error: null };
    expect((await mirror.listMirrorDocs()).ok).toBe(false);
  });

  it('pages ask for 50 passages at the right offset; word search is bounded', async () => {
    await mirror.loadMirrorPage('markandeya_purana', 3);
    expect(sb.calls.at(-1)).toEqual({ fn: 'corpus_reader_page', args: { p_doc: 'markandeya_purana', p_offset: 100, p_limit: 50 } });
    expect((await mirror.searchMirrorWords(' a ')).ok).toBe(false);
    await mirror.searchMirrorWords('  cremation   ground ');
    expect(sb.calls.at(-1)).toEqual({ fn: 'corpus_reader_search', args: { q: 'cremation ground', k: 30, p_doc: null } });
  });

  it('meaning search: results, a function not yet deployed, and a refusal', async () => {
    sb.fnRes = { data: { results: [{ doc_code: 'd', title: 'T', page_no: 1, idx: 2, verse_ref: null, ord: 2, similarity: 0.9, snippet: 's' }] }, error: null };
    const ok = await mirror.searchMirrorMeaning('why did the king sell his wife');
    expect(ok.ok).toBe(true);
    expect(sb.calls.at(-1)).toMatchObject({ name: 'search-corpus', opts: { body: { q: 'why did the king sell his wife', k: 12 } } });
    sb.fnRes = { data: null, error: { message: 'non-2xx', context: { status: 404, json: () => Promise.resolve({}) } } };
    expect((await mirror.searchMirrorMeaning('dharma')).error).toMatch(/not switched on yet/);
    sb.fnRes = { data: null, error: { message: 'non-2xx', context: { status: 403, json: () => Promise.resolve({ error: 'x' }) } } };
    expect((await mirror.searchMirrorMeaning('dharma')).refused).toBe(true);
  });

  it('links, snippets and the sign-in return path', () => {
    expect(mirror.mirrorHref({ doc_code: 'd', page_no: 60, idx: 10, ord: 51 })).toBe('/corpus/d?p=2#p60-10');
    expect(mirror.mirrorHref({ doc_code: 'd', page_no: 1, idx: 2, ord: 2 })).toBe('/corpus/d#p1-2');
    expect(mirror.snippetParts('a [[king]] sold [[his]] wife')).toEqual([
      { text: 'a ', mark: false }, { text: 'king', mark: true }, { text: ' sold ', mark: false },
      { text: 'his', mark: true }, { text: ' wife', mark: false }]);
    expect(mirror.snippetParts('<b>x</b>')).toEqual([{ text: '<b>x</b>', mark: false }]);
    expect(mirror.share(1219, 1222)).toBe('100%');
    expect(mirror.share(0, 0)).toBe('-');
    expect(safeNext('/corpus/markandeya_purana?p=3')).toBe('/corpus/markandeya_purana?p=3');
    for (const bad of ['//evil.com', 'https://evil.com', 'javascript:alert(1)', '/a b', '/x\\y', '', null]) {
      expect(safeNext(bad as any)).toBeNull();
    }
  });
});

describe('/corpus', () => {
  it('signed out: an invitation to sign in that comes back here', async () => {
    auth.value = { user: null, isLoading: false };
    mount('/corpus');
    const link = await screen.findByRole('link', { name: /Sign in to read it/ });
    expect(link.getAttribute('href')).toBe('/auth?next=%2Fcorpus');
    expect(sb.calls).toEqual([]);
  });

  it('signed in: every document with its counts, a link to read it, and search', async () => {
    sb.rpcRes = { data: [DOC], error: null };
    mount('/corpus');
    const links = await screen.findAllByRole('link', { name: /Markandeya Purana/ });
    expect(links[0].getAttribute('href')).toBe('/corpus/markandeya_purana');
    expect(screen.getByText(/1,222 passages/, { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByText(/Nothing here has been reviewed/)).toBeInTheDocument();
  });

  it('a refused reader sees a refusal, not "could not be loaded"', async () => {
    sb.rpcRes = { data: null, error: { code: '42501', message: 'The working corpus is open to signed-in readers only.' } };
    mount('/corpus');
    expect(await screen.findByText(/not on the reader list/)).toBeInTheDocument();
    expect(screen.queryByText(/could not be loaded/)).toBeNull();
  });

  it('word search shows marked snippets with links into the corpus reader', async () => {
    sb.rpcRes = { data: [DOC], error: null };
    mount('/corpus');
    await screen.findAllByRole('link', { name: /Markandeya Purana/ });
    sb.rpcRes = { data: [{ doc_code: 'markandeya_purana', title: 'Markandeya Purana', page_no: 60, idx: 10, verse_ref: '60.10', ord: 51, score: 0.3, snippet: 'the [[cremation]] ground' }], error: null };
    fireEvent.change(screen.getByLabelText('Search the working corpus'), { target: { value: 'cremation' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/ }));
    const mark = await screen.findByText('cremation', { selector: 'mark' });
    expect(mark).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Read it in the corpus/ }).getAttribute('href')).toBe('/corpus/markandeya_purana?p=2#p60-10');
  });
});

describe('/corpus/:docCode', () => {
  it('shows Sanskrit, IAST, English and Hindi, and similar passages on request', async () => {
    sb.byFn = {
      corpus_reader_docs: { data: [DOC], error: null },
      corpus_reader_page: { data: [PASSAGE], error: null },
      corpus_reader_similar: { data: [{ doc_code: 'nilamata_seg', title: 'Nilamata', page_no: 4, idx: 1, verse_ref: null, ord: 9, similarity: 0.81, snippet: 'A king in distress.' }], error: null },
    };
    mount('/corpus/markandeya_purana');
    expect(await screen.findByText('The king sold his wife.')).toBeInTheDocument();
    expect(screen.getByText('shloka')).toBeInTheDocument();
    expect(screen.getByText('raja ne patni bechi')).toBeInTheDocument();
    expect(sb.calls.find((c) => c.fn === 'corpus_reader_page')?.args).toEqual({ p_doc: 'markandeya_purana', p_offset: 0, p_limit: 50 });
    fireEvent.click(screen.getByLabelText('Show the Hindi'));
    expect(screen.queryByText('raja ne patni bechi')).toBeNull();
    expect(sb.calls.some((c) => c.fn === 'corpus_reader_similar')).toBe(false);   // only on request
    fireEvent.click(screen.getByRole('button', { name: /Similar passages in the corpus/ }));
    const near = await screen.findByRole('link', { name: /Nilamata/ });
    expect(near.getAttribute('href')).toBe('/corpus/nilamata_seg#p4-1');
  });

  it('an unknown document says so', async () => {
    sb.byFn = { corpus_reader_docs: { data: [], error: null } };
    mount('/corpus/nope');
    expect(await screen.findByText('Text not found')).toBeInTheDocument();
  });
});

describe('wiring', () => {
  it('the routes are lazy, so nothing enters the entry bundle', () => {
    const app = readFileSync(resolve(__dirname, '../App.tsx'), 'utf8');
    expect(app).toContain('const CorpusHome = lazy(() => import("./pages/corpus/CorpusHome"));');
    expect(app).toContain('<Route path="/corpus/:docCode" element={<CorpusDoc />} />');
    expect(app).not.toMatch(/import CorpusHome from/);
  });
});
