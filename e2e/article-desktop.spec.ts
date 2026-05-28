// Phase W Layer 3 — Desktop article E2E.
// Sweeps 1024 / 1280 / 1440 / 1920 and asserts:
//   1) no page-level horizontal scroll
//   2) article body renders (>500 chars)
//   3) no descendant inside [data-testid="article-body"] reports overflow
//      (shared walker in e2e/_helpers/overflow.ts)

import { test, expect, Page } from '@playwright/test';
import { collectOffenders } from './_helpers/overflow';

const SLUG = process.env.E2E_ARTICLE_SLUG ?? 'reassessing-ashoka-legacy';
const VIEWPORTS: Array<{ w: number; h: number }> = [
  { w: 1024, h: 768 },
  { w: 1280, h: 800 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 },
];

async function gotoArticle(page: Page) {
  await page.goto(`/articles/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="article-body"]', { state: 'visible', timeout: 20_000 });
}

test.describe('Phase W Layer 3 — desktop article rendering', () => {
  for (const vp of VIEWPORTS) {
    test(`viewport ${vp.w}x${vp.h}: no horizontal scroll, no body overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await gotoArticle(page);

      const docScroll = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(docScroll, `page-level horizontal scroll @ ${vp.w}px`).toBeLessThanOrEqual(vp.w + 1);

      const text = await page.locator('[data-testid="article-body"]').innerText();
      expect(text.length, 'article body text length').toBeGreaterThan(500);

      const offenders = await collectOffenders(page);
      expect(offenders, `Offenders @ ${vp.w}px:\n${offenders.join('\n')}`).toEqual([]);
    });
  }
});
