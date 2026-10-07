import { describe, it, expect } from 'vitest';
import { splitDecoration } from '@/lib/corpusDisplay';

// READER_MARKS_2026_10_07 - "<decorative line>" is an ornament of the printed page, not text.
describe('splitDecoration', () => {
  it('drops the marker line and reports a rule', () => {
    const sa = '<decorative line>\n\u092f\u0926\u094d\u092f\u094b\u0917\u093f\u092d\u093f\u0903';
    expect(splitDecoration(sa)).toEqual({ text: '\u092f\u0926\u094d\u092f\u094b\u0917\u093f\u092d\u093f\u0903', rule: true });
    expect(splitDecoration('<decorative line>\nyadyogibhir')).toEqual({ text: 'yadyogibhir', rule: true });
    expect(splitDecoration('  <Decorative Line>  \nx\n<decorative line>')).toEqual({ text: 'x', rule: true });
  });

  it('leaves everything else exactly as published', () => {
    expect(splitDecoration('a\nb [ILLEGIBLE] c')).toEqual({ text: 'a\nb [ILLEGIBLE] c', rule: false });
    expect(splitDecoration('see the <decorative line> here')).toEqual({ text: 'see the <decorative line> here', rule: false });
    expect(splitDecoration(null)).toEqual({ text: '', rule: false });
    expect(splitDecoration(undefined)).toEqual({ text: '', rule: false });
  });

  it('a passage that is only the marker has no text left', () => {
    expect(splitDecoration('<decorative line>')).toEqual({ text: '', rule: true });
  });
});
