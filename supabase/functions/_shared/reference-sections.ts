/**
 * REFERENCE_HEADINGS_2026_09_09
 *
 * Finding the reference section of a markdown article.
 *
 * WHY THIS EXISTS
 * ---------------
 * Both markdown-to-article-import and backfill-bibliography looked for a
 * reference list with one regex:
 *
 *     /##\s*(?:Bibliography|References|Works\s+Cited|Sources)\s*\n/i
 *
 * Measured against the 33 source documents in data/, that regex matched
 * exactly ONE file. It produced 63 candidate lines, of which parseMLA9Entry()
 * would accept ZERO. That is the whole reason srangam_bibliography_entries
 * has not grown since 2026-06-02: the regex path yields nothing from this
 * corpus, so every run has been a no-op that reported success.
 *
 * The headings in the corpus fail it for three separate reasons, all real:
 *
 *   1. HEADING LEVEL.  "### **Works Cited**", "#### **Works cited**".
 *      `##` matches the first two hashes, then `\s*` must match the third,
 *      and `#` is not whitespace. Seven files lost this way, including one
 *      with 141 entries.
 *
 *   2. BOLD WRAPPER.  "## **Works Cited (MLA)**", "## **Sources (primary,
 *      Devanāgarī-first)**", "## **Notes (commentary footnotes)**".
 *      After `##\s*` the pattern needs a letter and finds an asterisk.
 *
 *   3. TRAILING QUALIFIER.  "## Works Cited (MLA 9)", "## Bibliography &
 *      sources (select; primary and peer-reviewed first)".
 *      The pattern demands `\s*\n` immediately after the heading word, and
 *      finds " (MLA 9)". This is the cruellest of the three, because the
 *      heading is at the right level and unadorned - it just says a little
 *      more than the regex allowed.
 *
 * With levels h2-h4, an optional bold wrapper and trailing text permitted,
 * the same 33 files yield 15 matches, 608 candidate lines and roughly 114
 * author-shaped entries. Same corpus, same parser, one regex.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 * ----------------------------------
 * It does not try to find inline citations. 36 published articles carry no
 * reference section at all but hold about 3,455 URLs, 157 parenthetical
 * years and 148 page references in their prose. Those need the AI pass,
 * which is a separate decision with a separate budget - not a regex.
 */

/**
 * Heading levels 2 to 4, optional bold wrapper, any trailing qualifier.
 *
 * `Notes` is included because two files title their apparatus
 * "## **Notes (commentary footnotes)**". Commentary prose that is not a
 * citation is rejected downstream by parseMLA9Entry(), which requires an
 * author-shaped opening, so widening here does not lower the bar there.
 */
export const REFERENCE_HEADING =
  /^(#{2,4})[ \t]*\**[ \t]*(Bibliography|References|Works\s+Cited|Works\s+Consulted|Sources|Further\s+Reading|Notes)\b[^\n]*$/gim;

/**
 * Every reference section in the document, as raw text.
 *
 * A section runs from the end of its heading line to the next heading of the
 * SAME or a HIGHER level - so a "### Works Cited" is not cut short by a
 * "#### Primary sources" nested inside it, but does end at the next "##".
 *
 * Returns an empty array when the document has no reference section, which
 * is a real and common answer: many articles cite entirely inline.
 */
export function collectReferenceSections(markdown: string): string[] {
  const sections: string[] = [];
  if (!markdown) return sections;

  // Module-level regexes with /g carry lastIndex between calls. Resetting is
  // not optional here: without it the second document processed in a batch
  // would start scanning from wherever the first one stopped.
  REFERENCE_HEADING.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = REFERENCE_HEADING.exec(markdown)) !== null) {
    const level = match[1].length;
    const bodyStart = match.index + match[0].length;
    const rest = markdown.slice(bodyStart);
    const closer = new RegExp(`^#{1,${level}}[ \\t]`, 'm').exec(rest);
    sections.push(closer ? rest.slice(0, closer.index) : rest);

    // Guard against a zero-width match looping forever.
    if (REFERENCE_HEADING.lastIndex === match.index) REFERENCE_HEADING.lastIndex++;
  }
  return sections;
}

/**
 * Candidate entry lines from every reference section.
 *
 * @param minLength  Drop lines shorter than this. backfill-bibliography uses
 *                   20 to skip list bullets and stray words; the import
 *                   function counts everything and passes 1.
 */
export function collectReferenceLines(markdown: string, minLength = 1): string[] {
  return collectReferenceSections(markdown)
    .flatMap((section) => section.split('\n'))
    .map((line) => line.trim())
    .filter((line) => line.length >= minLength && !line.startsWith('#'));
}
