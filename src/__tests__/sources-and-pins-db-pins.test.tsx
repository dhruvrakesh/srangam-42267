/**
 * PINS_SCOPE_FIX_2026_09_07 — regression test for the "Sources & Pins" panel.
 *
 * Two defects this file exists to catch, both shipped in da87f24 and both
 * invisible to the 43 tests that passed alongside them:
 *
 *  1. `dbPins` was referenced inside SourcesAndPinsContent, a module-scope
 *     component that never received it as a prop -> ReferenceError at runtime
 *     on the legacy branch. `tsc --noEmit` missed it because tsconfig.json
 *     declares "files": [] and only references sub-projects, so the root
 *     invocation typechecks nothing and exits 0.
 *
 *  2. The pins block sat in the legacy branch, which only runs when
 *     hasDbData is false — but pins are part of hasDbData, so the branch that
 *     rendered pins was unreachable whenever pins existed.
 *
 * Case 1 below fails on defect 2 (no pins rendered).
 * Case 3 below fails on defect 1 (ReferenceError).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ArticlePin } from '@/lib/articlePins';

const LEGACY_EMPTY_NOTICE =
  'No structured evidence or bibliography rows are stored for this article in the database yet';

const bibResult = { data: undefined as unknown[] | undefined, isLoading: false };
const evidenceResult = { data: undefined as unknown[] | undefined, isLoading: false };
const pinsResult = { data: undefined as ArticlePin[] | undefined, isLoading: false };

vi.mock('@/hooks/useArticleBibliography', () => ({
  useArticleBibliographyBySlug: () => bibResult,
}));
vi.mock('@/hooks/useArticleEvidence', () => ({
  useArticleEvidenceBySlug: () => evidenceResult,
}));
vi.mock('@/hooks/useArticlePins', () => ({
  useArticlePinsBySlug: () => pinsResult,
}));
vi.mock('@/components/language/LanguageProvider', () => ({
  useLanguage: () => ({ currentLanguage: 'en' }),
}));
vi.mock('@/lib/correlationEngine', () => ({
  correlationEngine: {
    getSourcesAndPins: () => ({
      claims: [],
      pins: [],
      primary_sources: [],
      archaeology_evidence: [],
      mla_citations: [],
    }),
  },
}));

import { SourcesAndPins } from '@/components/oceanic/SourcesAndPins';

/** custodians-unfinished-time, measured 2026-09-07: 3 pins, 0 bibliography,
 *  0 evidence — the exact corpus shape that displayed the empty state. */
const THREE_PINS: ArticlePin[] = [
  { name: 'Kurukshetra', lat: 29.9695, lon: 76.8783, confidence: 'B' },
  { name: 'Dvaraka', lat: 22.2394, lon: 68.9678, approximate: true },
  { name: 'Gandhamadana', lat: 30.7333, lon: 79.0667, confidence: 'C', approximate: true },
];

beforeEach(() => {
  bibResult.data = [];
  bibResult.isLoading = false;
  evidenceResult.data = [];
  evidenceResult.isLoading = false;
  pinsResult.data = [];
  pinsResult.isLoading = false;
});

describe('Sources & Pins — pins are database data', () => {
  it('renders the pins when an article has pins and nothing else', () => {
    pinsResult.data = THREE_PINS;

    render(<SourcesAndPins pageOrCard="chiranjeevi" articleSlug="custodians-unfinished-time" />);

    // The panel must show the pins it is named after.
    expect(screen.getByText(/Geographical Pins \(3\)/)).toBeInTheDocument();
    expect(screen.getByText('Kurukshetra')).toBeInTheDocument();
    expect(screen.getByText('Dvaraka')).toBeInTheDocument();
    expect(screen.getByText('Gandhamadana')).toBeInTheDocument();
  });

  it('does not claim the database is empty when pins exist', () => {
    pinsResult.data = THREE_PINS;

    const { container } = render(
      <SourcesAndPins pageOrCard="chiranjeevi" articleSlug="custodians-unfinished-time" />,
    );

    expect(container.textContent).not.toContain(LEGACY_EMPTY_NOTICE);
  });

  it('renders the legacy notice, and does not throw, when nothing is in the database', () => {
    // Defect 1 lived here: `dbPins` was an undeclared identifier on this path,
    // and optional chaining does not guard an undeclared identifier.
    expect(() =>
      render(<SourcesAndPins pageOrCard="chiranjeevi" articleSlug="some-article" />),
    ).not.toThrow();

    expect(screen.getByText(new RegExp(LEGACY_EMPTY_NOTICE))).toBeInTheDocument();
    expect(screen.queryByText(/Geographical Pins/)).toBeNull();
  });

  it('counts pins in the compact badge alongside bibliography and evidence', () => {
    pinsResult.data = THREE_PINS;
    bibResult.data = [{ id: 'b1' }];

    const { container } = render(
      <SourcesAndPins pageOrCard="chiranjeevi" articleSlug="custodians-unfinished-time" compact />,
    );

    // 1 bibliography + 0 evidence + 3 pins = 4
    expect(container.textContent).toContain('4');
  });
});
