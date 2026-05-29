import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LanguageAvailabilityBadge } from '@/components/language/LanguageAvailabilityBadge';

describe('Phase AA — language badge body truth', () => {
  it('reads 1/9 when only English body content is available', () => {
    const { container } = render(
      <LanguageAvailabilityBadge
        content={{ en: 'Title', ta: 'த', hi: 'हि', bn: 'বা' }}
        currentLanguage="en"
        availableLanguagesOverride={['en']}
      />,
    );
    expect(container.textContent).toContain('1/9');
  });

  it('reads 3/9 when three body languages are available', () => {
    const { container } = render(
      <LanguageAvailabilityBadge
        content={{ en: 'Title' }}
        currentLanguage="en"
        availableLanguagesOverride={['en', 'ta', 'hi']}
      />,
    );
    expect(container.textContent).toContain('3/9');
  });

  it('falls back to title-keys when no override or body is provided', () => {
    const { container } = render(
      <LanguageAvailabilityBadge
        content={{ en: 'a', ta: 'b' }}
        currentLanguage="en"
      />,
    );
    expect(container.textContent).toContain('2/9');
  });
});
