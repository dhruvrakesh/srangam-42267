/**
 * MermaidBlock — Phase H
 *
 * Lazy, theme-aware, CLS-safe mermaid renderer modelled on Docusaurus'
 * `@docusaurus/theme-mermaid` (PR #9305 informed the async-render path).
 *
 *   - `mermaid` is dynamic-imported on first mount only — articles
 *     without diagrams pay zero bundle cost.
 *   - `securityLevel: 'strict'` blocks foreignObject/script vectors.
 *   - `min-h` reserves space → no Cumulative Layout Shift while the
 *     ~600 KB mermaid chunk loads.
 *   - Re-renders on light/dark theme change via a MutationObserver
 *     on <html class="dark">.
 *   - On parse error, falls back to a readable <pre><code> block
 *     plus an inline "Diagram preview unavailable" notice.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MermaidBlockProps {
  chart: string;
  caption?: string;
  className?: string;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function MermaidBlock({ chart, caption, className }: MermaidBlockProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDark = useIsDark();

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setSvg(null);

    import('mermaid')
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'neutral',
          securityLevel: 'strict',
          fontFamily: 'inherit',
        });
        return mermaid.render(`mermaid-${id}`, chart);
      })
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('[MermaidBlock] render failed:', msg);
          setError(msg);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, isDark, id]);

  if (error) {
    return (
      <figure
        className={cn(
          'my-6 overflow-x-auto rounded-lg border border-border bg-muted/30 p-4',
          className,
        )}
        role="img"
        aria-label={caption || 'Diagram source (preview unavailable)'}
      >
        <div className="mb-2 text-xs italic text-muted-foreground">
          Diagram preview unavailable — showing source.
        </div>
        <pre className="overflow-x-auto text-sm">
          <code>{chart}</code>
        </pre>
        {caption && (
          <figcaption className="mt-3 text-sm italic text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure
      className={cn(
        'my-6 overflow-x-auto rounded-lg border border-border bg-card p-4',
        className,
      )}
      role="img"
      aria-label={caption || 'Diagram'}
    >
      <div
        ref={containerRef}
        className="mermaid-container flex min-h-[180px] items-center justify-center"
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      >
        {svg ? null : (
          <div
            className="h-[160px] w-full animate-pulse rounded bg-muted/40"
            aria-hidden
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm italic text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default MermaidBlock;
