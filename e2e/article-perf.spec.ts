// Phase V Layer 4 — Performance budget for the article view.
// Measures (a) time-to-first-paint of [data-testid="article-body"] and
// (b) LCP under throttled Fast-3G + 4x CPU. Fails if either exceeds the
// thresholds. Thresholds are calibrated from the first green run and then
// frozen in docs/RELIABILITY_AUDIT.md (Phase V).
//
// Tunables: override via env vars E2E_ARTICLE_BODY_BUDGET_MS / E2E_LCP_BUDGET_MS.

import { test, expect } from '@playwright/test';

const SLUG = process.env.E2E_ARTICLE_SLUG ?? 'reassessing-ashoka-legacy';
const ARTICLE_BODY_VISIBLE_MS = Number(process.env.E2E_ARTICLE_BODY_BUDGET_MS ?? 2500);
const LCP_MS = Number(process.env.E2E_LCP_BUDGET_MS ?? 3000);

test('Phase V Layer 4 — article-body first paint + LCP under budget', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  // Chromium-only throttling via CDP.
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8, // Fast 3G
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.addInitScript(() => {
    (window as any).__lcp = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as any;
      if (last?.startTime) (window as any).__lcp = last.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true } as any);

    const stamp = () => {
      if (document.querySelector('[data-testid="article-body"]')) {
        performance.mark('article-body-visible');
        obs.disconnect();
      }
    };
    const obs = new MutationObserver(stamp);
    obs.observe(document.documentElement, { childList: true, subtree: true });
    stamp();
  });

  await page.goto(`/articles/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="article-body"]', { state: 'visible', timeout: 30_000 });
  // small settle for LCP candidate
  await page.waitForTimeout(500);

  const firstPaint = await page.evaluate(() => {
    const e = performance.getEntriesByName('article-body-visible')[0];
    return e ? e.startTime : -1;
  });
  const lcp = await page.evaluate(() => (window as any).__lcp as number);

  // Surface for trend tracking even when green.
  console.log(`[perf] article-body-visible=${firstPaint.toFixed(0)}ms  lcp=${lcp.toFixed(0)}ms`);

  expect(firstPaint, 'article-body first-paint').toBeGreaterThan(0);
  expect(firstPaint, `article-body first-paint exceeded ${ARTICLE_BODY_VISIBLE_MS}ms budget`).toBeLessThanOrEqual(ARTICLE_BODY_VISIBLE_MS);
  expect(lcp, `LCP exceeded ${LCP_MS}ms budget`).toBeLessThanOrEqual(LCP_MS);
});
