/**
 * TEXTS_READER_2026_09_27 - /texts and /texts/:docCode.
 * The loaders are mocked; what is tested is what a reader sees.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import {
  displayTranslation, isLowQuality, pageFromQuery, passageLabel, PASSAGES_PER_PAGE,
} from '@/lib/corpusDisplay';

const TEXT = {
  id: 'cd889e11', doc_code: 'AphorismsOfSandilya', title: 'Sandilya Bhakti Sutra',
  category: 'bhakti', source_note: 'Digitised and AI-assisted translation.',
  translation_engine: 'gemini:gemini-2.5-flash', passage_count: 439, published: true,
};
const mocks = vi.hoisted(() => ({
  list: vi.fn(), one: vi.fn(), passages: vi.fn(),
}));
vi.mock('@/lib/corpusTexts', () => ({
  listPublishedTexts: mocks.list,
  loadTextByDocCode: mocks.one,
  loadPassages: mocks.passages,
}));

import TextsIndex from '@/pages/texts/TextsIndex';
import TextReader from '@/pages/texts/TextReader';

function mount(path: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/texts" element={<TextsIndex />} />
            <Route path="/texts/:docCode" element={<TextReader />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  mocks.list.mockReset(); mocks.one.mockReset(); mocks.passages.mockReset();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

describe('display rules', () => {
  it('drops the verse-end mark and breaks lines at inner marks, nothing else', () => {
    expect(displayTranslation('Parameśvara triumphs. //')).toBe('Parameśvara triumphs.');
    expect(displayTranslation('One. // Two. //')).toBe('One.\nTwo.');
    expect(displayTranslation('No mark at all')).toBe('No mark at all');
    expect(displayTranslation(null)).toBe('');
    expect(displayTranslation('a/b and http://x')).toBe('a/b and http://x');
  });
  it('labels, quality and paging', () => {
    expect(passageLabel({ page_no: 12, idx: 3 })).toBe('p12.3');
    expect(passageLabel({ page_no: 12, idx: 3, verse_ref: '1.2' })).toContain('1.2');
    expect(isLowQuality(0.4)).toBe(true);
    expect(isLowQuality(0.8)).toBe(false);
    expect(isLowQuality(null)).toBe(false);
    expect(pageFromQuery('3', 439)).toBe(3);
    expect(pageFromQuery('99', 439)).toBe(Math.ceil(439 / PASSAGES_PER_PAGE));
    expect(pageFromQuery('x', 439)).toBe(1);
    expect(pageFromQuery(null, 0)).toBe(1);
  });
});

describe('/texts', () => {
  it('lists published texts with a link to each reader', async () => {
    mocks.list.mockResolvedValue({ ok: true, rows: [TEXT], total: 1, error: null });
    mount('/texts');
    const link = await screen.findByRole('link', { name: /Sandilya Bhakti Sutra/ });
    expect(link.getAttribute('href')).toBe('/texts/AphorismsOfSandilya');
    expect(screen.getByText(/439 passages/)).toBeTruthy();
  });
  it('a failed load is a failure, never "no texts"', async () => {
    mocks.list.mockResolvedValue({ ok: false, rows: [], total: 0, error: 'permission denied' });
    mount('/texts');
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText(/could not be loaded/)).toBeTruthy();
    expect(screen.queryByText(/No texts are published yet/)).toBeNull();
  });
});

describe('/texts/:docCode', () => {
  it('reads the page from ?p= and shows Sanskrit, IAST and English', async () => {
    mocks.one.mockResolvedValue({ ok: true, row: TEXT, error: null });
    mocks.passages.mockResolvedValue({
      ok: true, total: 439, error: null,
      rows: [{ id: 'x1', page_no: 7, idx: 2, sanskrit: 'SKT-LINE', iast: 'iast-line',
               translation: 'Paramesvara triumphs. //', verse_ref: null, quality_score: 0.42 }],
    });
    mount('/texts/AphorismsOfSandilya?p=2');
    expect(await screen.findByText('SKT-LINE')).toBeTruthy();
    expect(screen.getByText('iast-line')).toBeTruthy();
    expect(screen.getByText('Paramesvara triumphs.')).toBeTruthy();
    expect(screen.getByText('hard-to-read scan')).toBeTruthy();
    expect(mocks.one).toHaveBeenCalledWith('AphorismsOfSandilya');
    await waitFor(() => expect(mocks.passages).toHaveBeenCalledWith('cd889e11', { offset: 50, limit: 50 }));
    expect(screen.getAllByText(/Page 2 of 9/).length).toBeGreaterThan(0);
  });
  it('an unknown or unpublished code says so', async () => {
    mocks.one.mockResolvedValue({ ok: true, row: null, error: null });
    mount('/texts/Nope');
    expect(await screen.findByText('Text not found')).toBeTruthy();
    expect(mocks.passages).not.toHaveBeenCalled();
  });
  it('a failed text load is shown as a failure', async () => {
    mocks.one.mockResolvedValue({ ok: false, row: null, error: 'timed out' });
    mount('/texts/AphorismsOfSandilya');
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText(/timed out/)).toBeTruthy();
  });
});

describe('wiring', () => {
  const src = (f: string) => readFileSync(resolve(__dirname, '..', f), 'utf-8');
  it('the routes, the footer link and the site map entry exist', () => {
    const app = src('App.tsx');
    expect(app).toContain('path="/texts" element={<TextsIndex />}');
    expect(app).toContain('path="/texts/:docCode" element={<TextReader />}');
    expect(src('components/layout/Footer.tsx')).toContain('to="/texts"');
    expect(src('pages/Sitemap.tsx')).toContain('path: "/texts"');
  });
});
