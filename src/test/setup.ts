// Phase V — Vitest jsdom setup.
// Adds matchMedia stub, sets a mobile-default innerWidth (384), and installs a
// deterministic width shim so layout-sensitive tests can detect overflow
// regressions without a real layout engine.

import '@testing-library/jest-dom';

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

  // Deterministic width shim — see src/__tests__/responsive/article-dom-overflow.test.tsx
  // for usage. Intrinsic width is parsed from inline style + Tailwind `min-w-[NNNpx]`
  // / `w-[NNNpx]` class hints, which is exactly the regression class Phase K/P/U
  // fought (fixed-width children inside the prose well).
  const VIEWPORT = 384;
  const widthHintRe = /(?:^|\s)(?:min-)?w-\[(\d{2,4})px\]/g;

  function intrinsicMinWidth(el: Element): number {
    let max = 0;
    const html = el as HTMLElement;
    const inline = html.style?.minWidth || html.style?.width || '';
    const m = /^(\d+)px$/.exec(inline.trim());
    if (m) max = Math.max(max, parseInt(m[1], 10));
    const cls = (html.getAttribute?.('class') || '');
    let h: RegExpExecArray | null;
    widthHintRe.lastIndex = 0;
    while ((h = widthHintRe.exec(cls)) !== null) {
      max = Math.max(max, parseInt(h[1], 10));
    }
    return max;
  }

  function shimClientWidth(this: HTMLElement): number {
    // Root container width = VIEWPORT. Children inherit parent client width
    // unless they declare a smaller explicit width.
    let node: HTMLElement | null = this;
    while (node && node !== document.body && node !== document.documentElement) {
      const inline = node.style?.width || '';
      const m = /^(\d+)px$/.exec(inline.trim());
      if (m) return parseInt(m[1], 10);
      node = node.parentElement;
    }
    return VIEWPORT;
  }

  function shimScrollWidth(this: HTMLElement): number {
    const client = shimClientWidth.call(this);
    let widest = intrinsicMinWidth(this);
    // Walk descendants — but only those NOT inside a sanctioned scrollable wrapper.
    const stack: Element[] = Array.from(this.children);
    while (stack.length) {
      const child = stack.pop()!;
      const cls = child.getAttribute('class') || '';
      if (/\boverflow-(x-)?auto\b/.test(cls)) continue; // sanctioned wide wrapper
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
