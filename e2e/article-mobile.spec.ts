// Phase V Layer 3 — Mobile article E2E.
// Loads a stable article slug at 384x844 (and a viewport sweep) and asserts:
//   1) no page-level horizontal scroll
//   2) article body actually renders (>500 chars of text)
//   3) no descendant inside [data-testid="article-body"] reports
//      scrollWidth > clientWidth + 1 (excluding sanctioned .overflow-x-auto wrappers)

import { test, expect, Page } from '@playwright/test';
import { collectOffenders } from './_helpers/overflow';

const SLUG = process.env.E2E_ARTICLE_SLUG ?? 'reassessing-ashoka-legacy';
const VIEWPORTS: Array<{ w: number; h: number }> = [
  { w: 320, h: 568 },
  { w: 360, h: 640 },
  { w: 384, h: 844 },
  { w: 390, h: 844 },
  { w: 414, h: 896 },
];

async function gotoArticle(page: Page) {
  await page.goto(`/articles/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="article-body"]', { state: 'visible', timeout: 20_000 });
}


test.describe('Phase V Layer 3 — mobile article rendering', () => {
  test('renders at 384x844 with no horizontal scroll and full content', async ({ page }) => {
    await page.setViewportSize({ width: 384, height: 844 });
    await gotoArticle(page);

    const docScroll = await page.evaluate(() => document.documentElement.scrollWidth);
    const docClient = await page.evaluate(() => document.documentElement.clientWidth);
    expect(docScroll, 'page-level horizontal scroll').toBeLessThanOrEqual(docClient + 1);

    const text = await page.locator('[data-testid="article-body"]').innerText();
    expect(text.length, 'article body text length').toBeGreaterThan(500);

    const offenders = await collectOffenders(page);
    expect(offenders, `Overflow offenders inside article body:\n${offenders.join('\n')}`).toEqual([]);
  });

  for (const vp of VIEWPORTS) {
    test(`viewport sweep ${vp.w}x${vp.h}: no overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await gotoArticle(page);
      const docScroll = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(docScroll).toBeLessThanOrEqual(vp.w + 1);
      const offenders = await collectOffenders(page);
      expect(offenders, `Offenders @ ${vp.w}px:\n${offenders.join('\n')}`).toEqual([]);
    });
  }
});
