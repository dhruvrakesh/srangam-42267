// Phase Q/R/S — TA-01 + SR-01 + MC-01 source-scan regression net.
//
// jsdom does not run layout, so cross-browser tap-area / scroll-restore
// behaviour is verified manually (docs/RELIABILITY_AUDIT.md). These tests
// lock in the source invariants that make the runtime behaviour possible.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(process.cwd(), 'src');

describe('TA-01: cultural-term tooltip touch affordance', () => {
  const src = readFileSync(
    join(ROOT, 'components/language/CulturalTermTooltip.tsx'),
    'utf8'
  );

  it('uses a controlled Tooltip with open state', () => {
    expect(src).toMatch(/useState[\s\S]*open/);
    expect(src).toMatch(/<Tooltip\s+open=\{open\}\s+onOpenChange=\{setOpen\}/);
  });

  it('trigger is focusable and keyboard-operable', () => {
    expect(src).toMatch(/tabIndex=\{0\}/);
    expect(src).toMatch(/role="button"/);
    expect(src).toMatch(/aria-expanded=\{open\}/);
    expect(src).toMatch(/onKeyDown/);
    expect(src).toMatch(/'Enter'/);
    expect(src).toMatch(/'Escape'/);
  });

  it('trigger expands hit area for coarse pointers via ::before pseudo', () => {
    expect(src).toMatch(/before:absolute/);
    expect(src).toMatch(/before:inset-y-\[-/);
    expect(src).toMatch(/\(pointer:coarse\)\]:before:inset-/);
    expect(src).toMatch(/touch-manipulation/);
    expect(src).toMatch(/focus-visible:/);
  });

  it('trigger remains inline (MV-02 cross-check)', () => {
    const match = src.match(/<TooltipTrigger[\s\S]*?<\/TooltipTrigger>/);
    expect(match).toBeTruthy();
    const block = match![0];
    expect(block).not.toMatch(/\binline-block\b/);
    expect(block).toMatch(/"relative inline\b/);
  });
});

describe('SR-01: router-aware scroll restoration', () => {
  const src = readFileSync(join(ROOT, 'components/ScrollToTop.tsx'), 'utf8');

  it('imports useNavigationType from react-router-dom', () => {
    expect(src).toMatch(/useNavigationType/);
    expect(src).toMatch(/from\s+['"]react-router-dom['"]/);
  });

  it('restores per-history-entry scroll keyed by location.key', () => {
    expect(src).toMatch(/location\.key/);
    expect(src).toMatch(/sessionStorage\.(get|set)Item/);
  });

  it('handles POP navigations distinctly from PUSH/REPLACE', () => {
    expect(src).toMatch(/['"]POP['"]/);
  });

  it('opts out of browser native scroll restoration', () => {
    expect(src).toMatch(/history\.scrollRestoration\s*=\s*['"]manual['"]/);
  });

  it('dispatches a synthetic scroll event after restore (progress-bar fidelity)', () => {
    expect(src).toMatch(/dispatchEvent\(new Event\(['"]scroll['"]\)\)/);
  });
});

describe('SR-01 mount invariant: <ScrollToTop /> mounted exactly once in BrowserRouter', () => {
  const app = readFileSync(join(ROOT, 'App.tsx'), 'utf8');

  it('App.tsx imports and renders <ScrollToTop /> exactly once', () => {
    expect(app).toMatch(/from\s+['"]@\/components\/ScrollToTop['"]/);
    const mounts = app.match(/<ScrollToTop\s*\/>/g) || [];
    expect(mounts.length).toBe(1);
  });
});

describe('MC-01: mobile chrome safety', () => {
  it('mobile bottom tabs declare safe-area padding', () => {
    const src = readFileSync(
      join(ROOT, 'components/navigation/HeaderNav.tsx'),
      'utf8'
    );
    expect(src).toMatch(/pb-\[env\(safe-area-inset-bottom\)\]/);
  });

  it('dev TTS debug panel is capped to viewport width', () => {
    const src = readFileSync(
      join(ROOT, 'components/dev/NarrationDebugPanel.tsx'),
      'utf8'
    );
    expect(src).toMatch(/maxWidth:\s*['"]calc\(100vw\s*-\s*24px\)['"]/);
    // Sits above mobile bottom tabs.
    expect(src).toMatch(/safe-area-inset-bottom/);
  });

  it('header renders compact language switcher on mobile only', () => {
    const src = readFileSync(
      join(ROOT, 'components/navigation/HeaderNav.tsx'),
      'utf8'
    );
    expect(src).toMatch(
      /<EnhancedLanguageSwitcher\s+variant="compact"\s*\/>/
    );
  });
});
