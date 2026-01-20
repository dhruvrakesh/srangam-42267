import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * 
 * Automatically scrolls to the top of the page on route changes.
 * React Router doesn't reset scroll position by default, so this
 * component ensures users see the top of each new page.
 * 
 * Place this component inside BrowserRouter but outside Routes.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use instant scroll for navigation (smooth can feel sluggish)
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
