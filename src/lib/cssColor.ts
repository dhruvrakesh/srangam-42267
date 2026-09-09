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
