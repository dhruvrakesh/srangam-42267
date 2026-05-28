// Phase V Layer 2 — DOM overflow regression net (jsdom).
//
// Complements MV-01/MV-02 source scans by actually mounting article markup
// and asserting no descendant inside [data-testid="article-body"] reports
// scrollWidth > clientWidth + 1 under the deterministic width shim in
// src/test/setup.ts.
//
// Scope honesty:
// - ArticlePage is rendered for real (props-driven, light deps).
// - OceanicArticlePage's wrapper chain is exercised via a structural shell
//   that mirrors the Phase U class contract (min-w-0 w-full max-w-full on
//   grid → column → Card → CardContent). Full OceanicArticlePage rendering
//   pulls 30+ heavy deps; the real-browser layout check for it lives in
//   Layer 3 (e2e/article-mobile.spec.ts).

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import parse from 'html-react-parser';

import { TooltipProvider } from '@/components/ui/tooltip';

import { ArticlePage } from '@/components/articles/ArticlePage';
import { articleFixture, FIXTURE_CONTENT_HTML } from '@/__tests__/fixtures/articleFixture';

const VIEWPORT = 384;
const SANCTIONED_SCROLL_RE = /\boverflow-(x-)?auto\b/;

interface Offender {
  path: string;
  client: number;
  scroll: number;
}

function describeNode(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const cls = (el.getAttribute('class') || '').slice(0, 60);
  const testid = el.getAttribute('data-testid');
  return `${tag}${cls ? '.' + cls.replace(/\s+/g, '.') : ''}${testid ? `[data-testid="${testid}"]` : ''}`;
}

function findOverflowOffenders(root: Element): Offender[] {
  const offenders: Offender[] = [];
  const walk = (el: Element, inSanctioned: boolean) => {
    const cls = el.getAttribute('class') || '';
    const sanctioned = inSanctioned || SANCTIONED_SCROLL_RE.test(cls);
    if (!sanctioned && el instanceof HTMLElement) {
      const client = el.clientWidth;
      const scroll = el.scrollWidth;
      if (scroll > client + 1) {
        offenders.push({ path: describeNode(el), client, scroll });
      }
    }
    for (const child of Array.from(el.children)) walk(child, sanctioned);
  };
  walk(root, false);
  return offenders;
}

function renderInProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={qc}>
        <TooltipProvider>
          <MemoryRouter initialEntries={['/articles/reassessing-ashoka-legacy']}>
            <div style={{ width: `${VIEWPORT}px` }}>{ui}</div>
          </MemoryRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

describe('Phase V Layer 2 — DOM overflow inside [data-testid="article-body"]', () => {
  it('ArticlePage: no unsanctioned descendant exceeds container width at 384px', () => {
    const { container } = renderInProviders(
      <ArticlePage
        title={articleFixture.title}
        dek={articleFixture.dek}
        content={articleFixture.content}
        tags={articleFixture.tags}
        icon={articleFixture.icon as unknown as React.ComponentType<{ className?: string; size?: number }>}
        readTime={articleFixture.readTime}
        author={articleFixture.author}
        date={articleFixture.date}
      />
    );
    const body = container.querySelector('[data-testid="article-body"]');
    expect(body, 'article-body anchor missing').toBeTruthy();
    const offenders = findOverflowOffenders(body!);
    const report = offenders.map(o => `  - ${o.path} :: client=${o.client} scroll=${o.scroll}`).join('\n');
    expect(offenders, `Unsanctioned overflow offenders:\n${report}`).toEqual([]);
  });

  it('OceanicArticlePage structural shell (Phase U class contract): no overflow', () => {
    // Mirrors the wrapper chain that OceanicArticlePage enforces post-Phase U.
    // This is the architectural invariant we want to lock — full component
    // rendering is covered by Layer 3 in a real browser.
    const { container } = renderInProviders(
      <article
        data-testid="article-body"
        className="overflow-x-clip min-w-0 w-full max-w-full"
      >
        <div className="grid min-w-0 w-full max-w-full">
          <div className="min-w-0 w-full max-w-full">
            <div className="rounded-lg border bg-card min-w-0 w-full max-w-full">
              <div className="px-4 py-5 sm:px-6 sm:py-6 min-w-0 w-full max-w-full">
                <div className="prose prose-lg sm:prose-xl max-w-none article-content min-w-0 max-w-full">
                  {parse(FIXTURE_CONTENT_HTML)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
    const body = container.querySelector('[data-testid="article-body"]');
    expect(body).toBeTruthy();
    const offenders = findOverflowOffenders(body!);
    const report = offenders.map(o => `  - ${o.path} :: client=${o.client} scroll=${o.scroll}`).join('\n');
    expect(offenders, `Unsanctioned overflow offenders:\n${report}`).toEqual([]);
  });

  it('shim sanity: a fixed-width child OUTSIDE overflow-x-auto IS flagged', () => {
    // Negative control — proves the shim and walker actually detect regressions.
    const { container } = renderInProviders(
      <article data-testid="article-body" className="min-w-0 w-full">
        <div className="min-w-[900px]">wide unsanctioned child</div>
      </article>
    );
    const offenders = findOverflowOffenders(container.querySelector('[data-testid="article-body"]')!);
    expect(offenders.length).toBeGreaterThan(0);
    expect(offenders[0].scroll).toBeGreaterThanOrEqual(900);
  });
});
