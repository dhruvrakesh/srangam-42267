// Phase W — Shared sanctioned-overflow allowlist.
// Used by jsdom shim (src/test/setup.ts) and Layer 2 walker
// (src/__tests__/responsive/article-dom-overflow.test.tsx).
// Layer 3 (e2e/_helpers/overflow.ts) re-declares the same regex literal so
// Playwright can ship it via page.evaluate without a bundler hop.

export const SANCTIONED_OVERFLOW_RE =
  /\b(overflow-(?:x-)?(?:auto|scroll|hidden|clip)|snap-x|carousel|leaflet-container|map-container|chart-scroll|embla)\b/;

export function hasSanctionedInlineOverflowX(el: Element): boolean {
  const style = (el as HTMLElement).getAttribute?.('style') || '';
  return /overflow-x\s*:\s*(auto|scroll|hidden|clip)/i.test(style);
}
