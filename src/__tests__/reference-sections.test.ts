import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectReferenceSections,
  collectReferenceLines,
  REFERENCE_HEADING,
} from '../../supabase/functions/_shared/reference-sections.ts';

/**
 * Every fixture below is a heading shape that exists in data/*.md today and
 * that the previous regex silently skipped. The old pattern was
 *
 *     /##\s*(?:Bibliography|References|Works\s+Cited|Sources)\s*\n/i
 *
 * and across those 33 files it matched one document and produced zero
 * parseable entries. These cases are the reasons why.
 */

const OLD = /##\s*(?:Bibliography|References|Works\s+Cited|Sources)\s*\n([\s\S]+?)(?=\n##|$)/i;

const ENTRY = 'Sharma, Ram. The Sacred Geography of Bharata. Delhi UP, 1998.';

describe('reference sections: the three shapes the old regex lost', () => {
  it('h3 and h4 headings, not just h2', () => {
    for (const hashes of ['###', '####']) {
      const md = `# T\n\nBody.\n\n${hashes} **Works Cited**\n\n${ENTRY}\n`;
      expect(OLD.test(md), 'fixture should defeat the old regex').toBe(false);
      expect(collectReferenceLines(md, 20)).toContain(ENTRY);
    }
  });

  it('bold-wrapped heading text', () => {
    const md = `# T\n\nBody.\n\n## **Sources (primary, Devanāgarī-first)**\n\n${ENTRY}\n`;
    expect(OLD.test(md)).toBe(false);
    expect(collectReferenceLines(md, 20)).toContain(ENTRY);
  });

  it('a qualifier after the heading word', () => {
    // "## Works Cited (MLA 9)" is at the right level and unadorned; the old
    // pattern required a newline immediately after "Cited".
    const md = `# T\n\nBody.\n\n## Works Cited (MLA 9)\n\n${ENTRY}\n`;
    expect(OLD.test(md)).toBe(false);
    expect(collectReferenceLines(md, 20)).toContain(ENTRY);
  });

  it('still finds the plain shape the old regex did handle', () => {
    const md = `# T\n\nBody.\n\n## References\n\n${ENTRY}\n`;
    expect(OLD.test(md)).toBe(true);
    expect(collectReferenceLines(md, 20)).toContain(ENTRY);
  });
});

describe('reference sections: Notes is deliberately NOT a reference heading', () => {
  /**
   * NOTES_DROPPED_2026_09_09. Measured on the live corpus, including `Notes`
   * reached six more articles and 103 more candidate lines and produced zero
   * additional parseable entries. Everything it added was rejected by
   * parseMLA9Entry, so the only outcome available to it was a false positive.
   *
   * This is a decision, not an oversight, and it is easy to undo by accident.
   */
  it('does not treat a Notes heading as a reference section', () => {
    const commentary =
      'These notes are interpretive and source-critical; full bibliographic ' +
      'detail appears in the Works Cited below.';
    const md = `# T\n\n## Notes\n\n${commentary}\n`;
    expect(collectReferenceSections(md)).toEqual([]);
    expect(collectReferenceLines(md, 20)).toEqual([]);
  });

  it('still reads the real Works Cited in an article that has both', () => {
    const md = [
      '# T', '',
      '## Notes', '',
      'These notes are interpretive and source-critical, see below.', '',
      '## Works Cited', '', ENTRY, '',
    ].join('\n');
    const lines = collectReferenceLines(md, 20);
    expect(lines).toContain(ENTRY);
    expect(lines.some((l) => l.startsWith('These notes'))).toBe(false);
  });
});

describe('reference sections: boundaries', () => {
  it('a section ends at the next heading of the same or a higher level', () => {
    const md = [
      '## Works Cited', '', ENTRY, '',
      '## Appendix', '', 'Not a citation at all, but a long enough line to pass.', '',
    ].join('\n');
    const lines = collectReferenceLines(md, 20);
    expect(lines).toContain(ENTRY);
    expect(lines.some((l) => l.startsWith('Not a citation'))).toBe(false);
  });

  it('a nested deeper heading does NOT end the section', () => {
    const md = [
      '### Works Cited', '',
      '#### Primary sources', '', ENTRY, '',
      '## Next chapter', '', 'Chapter prose that is definitely long enough.', '',
    ].join('\n');
    const lines = collectReferenceLines(md, 20);
    expect(lines).toContain(ENTRY);
    expect(lines.some((l) => l.startsWith('Chapter prose'))).toBe(false);
  });

  it('collects every reference section, not only the first', () => {
    const second = 'Iyer, Meena. Coastal Epigraphy. Chennai UP, 2004.';
    const md = [
      '## Works Cited', '', ENTRY, '',
      '## Discussion', '', 'Some prose here that is long enough to survive.', '',
      '### **References (selection, by section)**', '', second, '',
    ].join('\n');
    const lines = collectReferenceLines(md, 20);
    expect(lines).toContain(ENTRY);
    expect(lines).toContain(second);
  });

  it('returns nothing when the article cites only inline', () => {
    const md = '# T\n\nAs Sharma et al. (1998) showed, see https://example.org/a.\n';
    expect(collectReferenceSections(md)).toEqual([]);
    expect(collectReferenceLines(md, 20)).toEqual([]);
  });
});

describe('reference sections: the global-regex trap', () => {
  it('does not carry lastIndex between documents', () => {
    // REFERENCE_HEADING is module-level and carries /g. Without an explicit
    // reset, the second document in a batch would be scanned starting from
    // wherever the first one stopped - so the same input would return
    // different answers depending on what ran before it. backfill-bibliography
    // loops over every markdown source in one invocation, so this is the
    // exact shape of a bug that would corrupt a whole batch run.
    const md = `## Works Cited\n\n${ENTRY}\n`;
    const first = collectReferenceLines(md, 20);
    const second = collectReferenceLines(md, 20);
    const third = collectReferenceLines(md, 20);
    expect(second).toEqual(first);
    expect(third).toEqual(first);
    expect(first).toContain(ENTRY);
  });

  it('exposes the pattern with the flags the loop depends on', () => {
    expect(REFERENCE_HEADING.flags).toContain('g');
    expect(REFERENCE_HEADING.flags).toContain('m');
    expect(REFERENCE_HEADING.flags).toContain('i');
  });
});

describe('reference sections: minLength gate matches each caller', () => {
  it('honours the 20-character floor backfill-bibliography uses', () => {
    const md = '## Works Cited\n\n- ibid.\n' + ENTRY + '\n';
    expect(collectReferenceLines(md, 20)).not.toContain('- ibid.');
    expect(collectReferenceLines(md, 1)).toContain('- ibid.');
  });
});

/**
 * The fixtures above prove the matcher is correct. This proves it MATTERS,
 * against the documents this project actually holds.
 *
 * Measured 2026-09-09 over the 33 files in data/:
 *     old regex     1 file,   63 candidate lines,   0 author-shaped
 *     this module  15 files, 609 candidate lines, 112 author-shaped
 *
 * The floors below sit well under those figures so that adding or removing a
 * document does not fail the build. What they catch is the thing that
 * actually happened: a heading pattern quietly narrowed until it matched
 * almost nothing, while every run still reported success.
 *
 * Skips when data/ is absent, so CI without the corpus stays green.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(HERE, '../../data');
const CORPUS = existsSync(DATA_DIR)
  ? readdirSync(DATA_DIR).filter((f) => f.endsWith('.md'))
  : [];

describe.skipIf(CORPUS.length === 0)('reference sections: against the real corpus', () => {
  const OLD_REGEX =
    /##\s*(?:Bibliography|References|Works\s+Cited|Sources)\s*\n([\s\S]+?)(?=\n##|$)/i;

  const measure = () => {
    let oldFiles = 0, oldLines = 0, newFiles = 0, newLines = 0;
    for (const name of CORPUS) {
      const md = readFileSync(join(DATA_DIR, name), 'utf-8');
      const m = OLD_REGEX.exec(md);
      const oldHit = m
        ? m[1].split('\n').map((l) => l.trim())
             .filter((l) => l.length > 20 && !l.startsWith('#'))
        : [];
      const newHit = collectReferenceLines(md, 20);
      if (oldHit.length) oldFiles++;
      if (newHit.length) newFiles++;
      oldLines += oldHit.length;
      newLines += newHit.length;
    }
    return { oldFiles, oldLines, newFiles, newLines };
  };

  it('reaches far more of the corpus than the pattern it replaced', () => {
    const r = measure();
    expect(
      r.newFiles,
      `only ${r.newFiles} of ${CORPUS.length} documents yielded a reference ` +
        `section (old pattern reached ${r.oldFiles}). Measured 15 on ` +
        `2026-09-09. If a heading pattern was narrowed, this is the symptom.`,
    ).toBeGreaterThanOrEqual(10);
    expect(r.newFiles).toBeGreaterThan(r.oldFiles);
  });

  it('yields enough candidate lines for parseMLA9Entry to work on', () => {
    const r = measure();
    expect(
      r.newLines,
      `${r.newLines} candidate lines across the corpus (old pattern found ` +
        `${r.oldLines}). Measured 609 on 2026-09-09.`,
    ).toBeGreaterThanOrEqual(400);
  });
});
