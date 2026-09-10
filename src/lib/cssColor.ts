/**
 * Resolving CSS custom properties for canvas.
 *
 * WHY THIS EXISTS
 * ---------------
 * src/pages/ResearchNetwork.tsx paints its graph on a 2D canvas and sets
 * colours like this:
 *
 *     const TYPE_COLORS = { same_theme: 'hsl(var(--peacock-blue))', ... };
 *     ctx.fillStyle = node.color;
 *     ctx.fillStyle = 'hsl(var(--foreground))';
 *
 * `var()` is resolved by the CSS cascade against an element. A canvas 2D
 * context has no element to cascade against, so `hsl(var(--peacock-blue))`
 * is not a parseable <color>. Per the HTML specification, assigning an
 * unparseable value to fillStyle or strokeStyle is IGNORED - the previous
 * value stays in effect.
 *
 * The consequence is not a wrong colour, it is no colour system at all:
 * every node keeps whatever fill was last set, and the label drawn straight
 * after the circle inherits the circle's own colour. Text the same colour as
 * the disc it sits on.
 *
 * This reads the variables off the document element, where the cascade HAS
 * resolved them, and hands back a concrete colour string a canvas accepts.
 */

const cache = new Map<string, string>();

/** Matches `hsl(var(--token))` and `var(--token)`, with optional fallback. */
const VAR_FORM = /^(?:hsl\(\s*)?var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)\s*\)?$/;

/**
 * Turn a possibly variable-bearing colour into something canvas can use.
 *
 * @param value    e.g. 'hsl(var(--peacock-blue))', 'var(--foreground)',
 *                 or an already-concrete '#1A365D' / 'hsl(235 84% 34%)'.
 * @param fallback returned when the variable is undefined or the DOM is not
 *                 available. Must itself be a concrete colour.
 */
export function resolveCssColor(value: string, fallback = '#666666'): string {
  if (!value) return fallback;

  const cached = cache.get(value);
  if (cached !== undefined) return cached;

  const match = VAR_FORM.exec(value.trim());
  if (!match) {
    // Already concrete - hand it back untouched.
    cache.set(value, value);
    return value;
  }

  const [, token, inlineFallback] = match;
  let resolved = '';

  if (typeof document !== 'undefined' && document.documentElement) {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim();
    if (raw) {
      // These tokens hold bare HSL components ("235 84% 34%"), which is why
      // the call sites wrap them in hsl(). Wrap only when they are not
      // already a complete colour.
      resolved = /^(#|rgb|hsl|hsla|rgba)/i.test(raw) ? raw : `hsl(${raw})`;
    }
  }

  if (!resolved && inlineFallback) resolved = inlineFallback.trim();
  if (!resolved) resolved = fallback;

  cache.set(value, resolved);
  return resolved;
}

/**
 * Drop every memoised value. The theme toggle rewrites the custom properties
 * on the document element, so a cache that outlived a theme change would
 * repaint the graph in the previous theme's colours.
 */
export function clearCssColorCache(): void {
  cache.clear();
}

/* ------------------------------------------------------------------------ *
 * THEME CHANGES
 *
 * Writing clearCssColorCache() and then calling it from nowhere is exactly
 * the failure this module was built to fix: a mechanism that reports itself
 * present while nothing invokes it. The cache above outlives a theme switch,
 * so on switching light/dark the labels kept the previous theme's foreground
 * colour - dark text on a dark ground - until a reload.
 *
 * Clearing the cache is necessary but NOT sufficient. ResearchNetwork resolves
 * node and link colours inside its graphData memo, so those concrete strings
 * are frozen into the graph objects; flushing the cache alone would refresh
 * the labels and leave every disc and edge in the old palette. Subscribers
 * therefore need a signal, not just an invalidation - hence a listener API
 * rather than an internal side effect.
 *
 * The app mounts <ThemeProvider attribute="class" defaultTheme="system"
 * enableSystem>, so next-themes flips a class on <html> for all three cases,
 * including an OS-level change while set to "system". Watching that attribute
 * covers every path today. The media-query listener is a second, cheap net
 * for a future palette driven purely by @media (prefers-color-scheme), which
 * would change the computed values without touching any attribute.
 * ------------------------------------------------------------------------ */

type ThemeListener = () => void;

const listeners = new Set<ThemeListener>();
let observer: MutationObserver | null = null;
let media: MediaQueryList | null = null;

function handleThemeChange(): void {
  cache.clear();
  // Copy first: a listener may unsubscribe itself while we are iterating.
  for (const listener of [...listeners]) {
    try {
      listener();
    } catch {
      // One bad subscriber must not stop the rest of the graph repainting.
    }
  }
}

function attach(): void {
  if (typeof document === 'undefined' || !document.documentElement) return;

  if (!observer && typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      // Only these two. Watching `style` as well would fire on every
      // scroll-lock and inline write, and the clear is not free.
      attributeFilter: ['class', 'data-theme'],
    });
  }

  if (!media && typeof window !== 'undefined' && window.matchMedia) {
    media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener?.('change', handleThemeChange);
  }
}

function detach(): void {
  observer?.disconnect();
  observer = null;
  media?.removeEventListener?.('change', handleThemeChange);
  media = null;
}

/**
 * Call `listener` whenever the resolved theme colours may have changed. The
 * cache is cleared before the listener runs, so anything it reads is fresh.
 *
 * @returns an unsubscribe function, suitable as a useEffect cleanup.
 */
export function onThemeColorsChanged(listener: ThemeListener): () => void {
  listeners.add(listener);
  attach();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) detach();
  };
}
