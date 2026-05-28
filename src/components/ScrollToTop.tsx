import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop — Phase S (SR-01) router-aware scroll restoration.
 *
 * Behaviour:
 *  - PUSH / REPLACE navigations  → instant scroll to top (previous behaviour).
 *  - POP (back/forward)          → restore the scroll position saved for that
 *                                  history entry, keyed by `location.key` in
 *                                  sessionStorage. Bounded rAF loop waits up
 *                                  to ~1s for article content to hydrate so we
 *                                  don't snap to a position that doesn't
 *                                  exist yet.
 *  - After restoring, a synthetic `scroll` event is dispatched so
 *    `useReadingProgress` (ArticleContext) updates the progress bar on the
 *    next paint instead of flashing 0 until the user nudges.
 *
 * Browser scrollRestoration is set to 'manual' so the native heuristic does
 * not fight this controller. sessionStorage writes are throttled with rAF
 * and wrapped in try/catch (privacy mode / quota safe).
 *
 * Filename intentionally preserved for zero import churn across the app.
 */

const STORAGE_KEY = (key: string) => `scroll:${key}`;
const MAX_RESTORE_FRAMES = 60; // ≈1s at 60fps — bounded so we never block.

export function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();
  const rafId = useRef<number | null>(null);

  // Persist scrollY for the active history entry (throttled to one rAF tick).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    let scheduled = false;
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        try {
          sessionStorage.setItem(STORAGE_KEY(location.key), String(window.scrollY));
        } catch {
          /* quota / privacy mode — best-effort only */
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.key]);

  // On route change, restore on POP and scroll-to-top on PUSH/REPLACE.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    if (navType === 'POP') {
      let saved: string | null = null;
      try {
        saved = sessionStorage.getItem(STORAGE_KEY(location.key));
      } catch {
        saved = null;
      }
      const y = saved ? parseInt(saved, 10) : 0;
      if (!Number.isFinite(y) || y <= 0) {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        return;
      }
      let frames = 0;
      const tryRestore = () => {
        const ready =
          document.documentElement.scrollHeight >= y + window.innerHeight - 1;
        if (ready || frames++ >= MAX_RESTORE_FRAMES) {
          window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
          // Kick the progress bar + any scroll-derived UI immediately.
          window.dispatchEvent(new Event('scroll'));
          rafId.current = null;
        } else {
          rafId.current = requestAnimationFrame(tryRestore);
        }
      };
      rafId.current = requestAnimationFrame(tryRestore);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [location.key, navType]);

  return null;
}
