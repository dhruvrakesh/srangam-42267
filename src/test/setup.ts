// Phase V/W — Vitest jsdom setup.
// Adds matchMedia stub, sets a mobile-default innerWidth (384), and installs a
// deterministic width shim so layout-sensitive tests can detect overflow
// regressions without a real layout engine.

import '@testing-library/jest-dom';
import { SANCTIONED_OVERFLOW_RE, hasSanctionedInlineOverflowX } from './overflow-rules';

if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }

  try {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 384, writable: true });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844, writable: true });
  } catch {
    /* ignore */
  }

  // Deterministic width shim. Parses intrinsic width from:
  //   - inline `style="width:NNNpx"` / `style="min-width:NNNpx"`
  //   - Tailwind class hints `w-[NNNpx]` / `min-w-[NNNpx]`
  //   - `<img width="NNN">` attribute and `<img>` seeded `naturalWidth` hint
  // Sanctioned wrappers (overflow-x-auto/scroll/hidden/clip, embla, leaflet,
  // map-container, chart-scroll, carousel, snap-x, plus inline overflow-x)
  // truncate the walk — children inside them never count as offenders.
  const VIEWPORT = 384;
  const widthHintRe = /(?:^|\s)(?:min-)?w-\[(\d{2,4})px\]/g;
  const stylePxRe = /(?:^|;|\s)(min-width|width)\s*:\s*(\d+)px/gi;

  function isImgConstrained(el: HTMLElement): boolean {
    // Honor production rule `img { max-width: 100%; height: auto }`.
    // Tests opt-in by injecting a <style> tag containing `max-width:100%`.
    const styles = Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent || '')
      .join('\n');
    if (/img\s*\{[^}]*max-width\s*:\s*100%/i.test(styles)) return true;
    const inline = el.getAttribute('style') || '';
    return /max-width\s*:\s*100%/i.test(inline);
  }

  function intrinsicMinWidth(el: Element): number {
    let max = 0;
    const html = el as HTMLElement;
    const inline = html.getAttribute?.('style') || '';
    stylePxRe.lastIndex = 0;
    let s: RegExpExecArray | null;
    while ((s = stylePxRe.exec(inline)) !== null) {
      max = Math.max(max, parseInt(s[2], 10));
    }
    const cls = html.getAttribute?.('class') || '';
    let h: RegExpExecArray | null;
    widthHintRe.lastIndex = 0;
    while ((h = widthHintRe.exec(cls)) !== null) {
      max = Math.max(max, parseInt(h[1], 10));
    }
    // <img> intrinsic width
    if (html.tagName === 'IMG') {
      const w = html.getAttribute('width');
      const seeded = (html as HTMLImageElement).naturalWidth;
      const candidate = Math.max(
        w ? parseInt(w, 10) || 0 : 0,
        typeof seeded === 'number' ? seeded : 0,
      );
      if (candidate > 0 && !isImgConstrained(html)) {
        max = Math.max(max, candidate);
      }
    }
    return max;
  }

  function isSanctioned(el: Element): boolean {
    const cls = el.getAttribute('class') || '';
    return SANCTIONED_OVERFLOW_RE.test(cls) || hasSanctionedInlineOverflowX(el);
  }

  function shimClientWidth(this: HTMLElement): number {
    // Root container width = VIEWPORT. Children inherit parent client width
    // unless they declare a smaller explicit width.
    let node: HTMLElement | null = this;
    while (node && node !== document.body && node !== document.documentElement) {
      const inline = node.getAttribute('style') || '';
      const m = /(?:^|;|\s)width\s*:\s*(\d+)px/i.exec(inline);
      if (m) return parseInt(m[1], 10);
      node = node.parentElement;
    }
    return VIEWPORT;
  }

  function shimScrollWidth(this: HTMLElement): number {
    const client = shimClientWidth.call(this);
    let widest = intrinsicMinWidth(this);
    const stack: Element[] = Array.from(this.children);
    while (stack.length) {
      const child = stack.pop()!;
      if (isSanctioned(child)) continue; // sanctioned subtree, stop descending
      widest = Math.max(widest, intrinsicMinWidth(child));
      for (const c of Array.from(child.children)) stack.push(c);
    }
    return Math.max(client, widest);
  }

  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: shimClientWidth,
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: shimScrollWidth,
  });
}
