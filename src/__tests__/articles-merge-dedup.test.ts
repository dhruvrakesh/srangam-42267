import { describe, it, expect } from 'vitest';
import { mergeArticleSources, filterUnifiedArticles } from '@/lib/unifiedArticleUtils';
import type { DisplayArticle } from '@/hooks/useArticles';

const dbRow = (over: Partial<DisplayArticle> = {}): DisplayArticle => ({
  id: 'db-1',
  title: { en: 'Maritime Memories' },
  excerpt: { en: '' },
  slug: '/articles/maritime-memories-complete',
  slugAlias: 'maritime-memories-complete',
  rawSlug: 'maritime-memories-south-india-complete-v1',
  theme: 'Indian Ocean World',
  tags: [],
  readTime: 18,
  author: 'Srangam',
  date: '2026-05-27',
  source: 'database',
  bodyLanguages: ['en'],
  ...over,
});

const jsonRow = (over: any = {}): any => ({
  id: 'maritime-memories-south-india',
  title: { en: 'Maritime Memories', ta: 'கடல் நினைவுகள்' },
  excerpt: { en: 'desc' },
  slug: '/maritime-memories-south-india',
  theme: 'Indian Ocean World',
  tags: [],
  readTime: 18,
  author: 'Legacy',
  date: '2024-03-15',
  ...over,
});

describe('Phase AB — cross-source merge dedup', () => {
  it('collapses JSON row whose id matches DB slug_alias variant via SLUG_TO_ID_MAP', () => {
    const merged = mergeArticleSources(
      [jsonRow({ id: 'maritime-memories-south-india' })],
      [dbRow({ slugAlias: 'maritime-memories-south-india', rawSlug: 'maritime-memories-south-india' })],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe('database');
  });

  it('keeps unrelated JSON rows', () => {
    const merged = mergeArticleSources(
      [jsonRow({ id: 'something-else', slug: '/something-else' })],
      [dbRow()],
    );
    expect(merged).toHaveLength(2);
  });

  it('attaches bodyLanguages=["en"] to JSON rows without coverage data', () => {
    const merged = mergeArticleSources(
      [jsonRow({ id: 'unique-json-row', slug: '/unique-json-row' })],
      [],
    );
    expect(merged[0].bodyLanguages).toEqual(['en']);
  });
});

describe('Phase AB — sort tie-break prefers DB on equal date', () => {
  it('puts database row above json row when dates tie', () => {
    const sameDate = '2025-10-29';
    const sorted = filterUnifiedArticles(
      [
        jsonRow({ id: 'j', slug: '/j', date: sameDate, source: 'json' } as any),
        dbRow({ id: 'd', date: sameDate }),
      ] as DisplayArticle[],
      { sortBy: 'recent' },
    );
    expect(sorted[0].source).toBe('database');
  });
});
