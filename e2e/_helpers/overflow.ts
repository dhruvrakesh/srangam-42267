// Phase W — Shared overflow walker for Playwright (mobile + desktop).
// Mirrors src/test/overflow-rules.ts SANCTIONED_OVERFLOW_RE; kept as a literal
// inside page.evaluate so it ships cleanly across the CDP boundary.

import type { Page } from '@playwright/test';

export async function collectOffenders(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const SANCTIONED =
      /\b(overflow-(?:x-)?(?:auto|scroll|hidden|clip)|snap-x|carousel|leaflet-container|map-container|chart-scroll|embla)\b/;
    const root = document.querySelector('[data-testid="article-body"]');
    if (!root) return ['NO_ARTICLE_BODY'];
    const offenders: string[] = [];
    const walk = (el: Element, inSanctioned: boolean) => {
      const cls = el.getAttribute('class') || '';
      const style = (el as HTMLElement).getAttribute('style') || '';
      const computedOverflowX = (el instanceof HTMLElement)
        ? getComputedStyle(el).overflowX
        : '';
      const sanctioned =
        inSanctioned ||
        SANCTIONED.test(cls) ||
        /overflow-x\s*:\s*(auto|scroll|hidden|clip)/i.test(style) ||
        /^(auto|scroll|hidden|clip)$/.test(computedOverflowX);
      if (!sanctioned && el instanceof HTMLElement) {
        if (el.scrollWidth > el.clientWidth + 1) {
          const tag = el.tagName.toLowerCase();
          const tid = el.getAttribute('data-testid');
          offenders.push(
            `${tag}${cls ? '.' + cls.slice(0, 50).replace(/\s+/g, '.') : ''}${tid ? `[data-testid="${tid}"]` : ''} (c=${el.clientWidth} s=${el.scrollWidth})`,
          );
        }
      }
      for (const c of Array.from(el.children)) walk(c, sanctioned);
    };
    walk(root, false);
    return offenders;
  });
}
