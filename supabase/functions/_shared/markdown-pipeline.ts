/**
 * Markdown Import Pipeline — Phase H
 *
 * Pure-function filter chain modelled on Pandoc/Quarto Lua filters.
 * Each step is independently testable and idempotent. Order matters:
 * artefact removal must precede diagram normalisation, which must
 * precede frontmatter extraction and `marked.parse`.
 *
 * Reference invariant (docs/RELIABILITY_AUDIT.md):
 *   PUA chars and unfenced mermaid blocks MUST NOT reach `marked.parse`.
 */

/**
 * Step 1 — Sanitise backslash-escaped markdown characters that show up
 * in Notion / Obsidian / Google Docs exports and break YAML parsing.
 * (Migrated verbatim from the legacy importer; behaviour preserved.)
 */
export function sanitizeEscapes(text: string): string {
  return text
    .replace(/\\#/g, '#')
    .replace(/\\-/g, '-')
    .replace(/\\\*/g, '*')
    .replace(/\\_/g, '_')
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\`/g, '`');
}

/**
 * Step 2 — Strip ChatGPT / OpenAI Deep-Research export artefacts.
 *
 * These exports leak Private-Use-Area glyphs (U+E000–U+F8FF) wrapped
 * around `citeturnNviewN` / `citeturnNsearchN` tokens, instructional
 * "Suggested caption:" lines under diagrams, and lone-digit superscripts
 * that survive citation removal. They render as box-glyphs (□) in the
 * UI and pollute search/SEO output.
 *
 * Idempotent — safe to run repeatedly.
 */
export function stripExportArtifacts(text: string): string {
  let out = text;

  // 2a. PUA-wrapped citation runs (the common case: "□cite□turn17view0□…")
  // Greedy across PUA + cite/turn/view tokens until we hit a non-PUA, non-token char.
  out = out.replace(
    /[\uE000-\uF8FF]*cite(?:[\uE000-\uF8FF]|turn\d+(?:view|search|news|image)\d+)+[\uE000-\uF8FF]*/g,
    '',
  );

  // 2b. Bare cite tokens that escaped the PUA wrapper.
  out = out.replace(/\bcite(?:turn\d+(?:view|search|news|image)\d+)+\b/g, '');

  // 2c. Stray PUA chars anywhere (defensive sweep).
  out = out.replace(/[\uE000-\uF8FF]/g, '');

  // 2d. ChatGPT's "Suggested caption: **X.**" instructional lines under diagrams.
  // Downgrade to a normal italic caption rather than delete (preserve meaning).
  out = out.replace(
    /^\s*Suggested caption:\s*\*\*(.+?)\*\*\s*(.*)$/gm,
    '*Caption:* **$1** $2',
  );

  // 2e. Lone-digit superscripts left dangling at end of line after cite removal.
  // Only collapse when preceded by ≥2 spaces (residual footnote anchor signature).
  out = out.replace(/[ \t]{2,}\d{1,2}[ \t]*$/gm, '');

  // 2f. Collapse 3+ consecutive blank lines that artefact removal may have created.
  out = out.replace(/\n{3,}/g, '\n\n');

  return out;
}

/**
 * Step 3 — Normalise diagram blocks.
 *
 * ChatGPT / Deep-Research exports frequently strip the ``` fences around
 * mermaid diagrams, leaving the diagram body as bare paragraph text. This
 * step detects unfenced diagram blocks and wraps them in ```mermaid fences
 * so `marked.parse` produces `<pre><code class="language-mermaid">` and the
 * frontend `<MermaidBlock>` can render them.
 *
 * Also normalises literal `\n` inside mermaid node labels to `<br/>`
 * (mermaid's accepted line-break form).
 *
 * Idempotent — already-fenced blocks are left untouched.
 */
const DIAGRAM_OPENERS = [
  /^flowchart\s+(?:TD|LR|TB|RL|BT)\b/,
  /^graph\s+(?:TD|LR|TB|RL|BT)\b/,
  /^sequenceDiagram\b/,
  /^classDiagram\b/,
  /^stateDiagram(?:-v2)?\b/,
  /^erDiagram\b/,
  /^journey\b/,
  /^gantt\b/,
  /^pie\b/,
  /^mindmap\b/,
  /^timeline\b/,
  /^quadrantChart\b/,
  /^xychart-beta\b/,
];

function isDiagramOpener(line: string): boolean {
  const trimmed = line.trim();
  return DIAGRAM_OPENERS.some((re) => re.test(trimmed));
}

export function normalizeDiagrams(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = line.match(/^\s*```/);

    if (fenceMatch) {
      inFence = !inFence;
      out.push(line);
      continue;
    }

    if (!inFence && isDiagramOpener(line)) {
      // Walk forward until block boundary.
      const block: string[] = [line];
      let j = i + 1;
      let blankRun = 0;

      while (j < lines.length) {
        const next = lines[j];

        // Hard stops.
        if (/^\s*```/.test(next)) break; // entering an explicit fence
        if (/^#{1,6}\s/.test(next)) break; // markdown heading
        if (next.startsWith('---')) break; // hr / frontmatter

        if (next.trim() === '') {
          blankRun++;
          // Allow a single blank line inside a diagram, but break on a
          // blank line followed by clearly non-mermaid prose.
          if (blankRun >= 1) {
            const peek = lines[j + 1];
            if (
              peek === undefined ||
              /^[A-Z][a-z].* [a-z]/.test(peek.trim()) || // looks like prose
              /^\s*[-*]\s/.test(peek) || // list
              /^>/.test(peek) // blockquote
            ) {
              break;
            }
          }
          block.push(next);
          j++;
          continue;
        }

        blankRun = 0;
        block.push(next);
        j++;
      }

      // Trim trailing blanks from the captured block.
      while (block.length && block[block.length - 1].trim() === '') {
        block.pop();
      }

      // Replace literal `\n` inside node-label strings with mermaid's <br/>.
      const normalised = block
        .map((l) => l.replace(/\\n/g, '<br/>'))
        .join('\n');

      out.push('```mermaid');
      out.push(normalised);
      out.push('```');
      i = j - 1; // continue after the captured block
      continue;
    }

    out.push(line);
  }

  return out.join('\n');
}

/**
 * Composed import-time pipeline.
 *
 * Run this once at the top of the importer, *before* frontmatter
 * extraction and `marked.parse`. The output is markdown — still
 * `marked`-compatible — with all known export artefacts neutralised
 * and all diagrams properly fenced.
 */
export function runImportPipeline(raw: string): string {
  return normalizeDiagrams(stripExportArtifacts(sanitizeEscapes(raw)));
}
