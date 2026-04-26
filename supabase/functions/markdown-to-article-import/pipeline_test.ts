// Phase H.1 — Pure-function tests for the markdown import pipeline.
// Run via: supabase--test_edge_functions { functions: ["markdown-to-article-import"] }
//
// Tests cover:
//   - Mermaid auto-fencing (flowchart, graph, sequenceDiagram)
//   - Block boundary detection (heading, prose, blank line)
//   - Literal `\n` -> <br/> in node labels
//   - PUA-wrapped + bare `citeturn…` artefact stripping
//   - Stray PUA char sweep
//   - "Suggested caption:" downgrade
//   - Trailing footnote-anchor digit removal
//   - Idempotency
//   - Real-world Jakhbar fixture
//   - Legitimate code fences (```ts, ```bash) preserved

import {
  assertEquals,
  assert,
  assertStringIncludes,
} from 'https://deno.land/std@0.224.0/assert/mod.ts';

import {
  sanitizeEscapes,
  stripExportArtifacts,
  normalizeDiagrams,
  runImportPipeline,
} from '../_shared/markdown-pipeline.ts';

import {
  sanitizeSnippet,
  stripExportArtifacts as edgeStrip,
} from '../_shared/text-sanitizer.ts';

// ───────────────── 1. Already-fenced mermaid passes through ─────────────────
Deno.test('normalizeDiagrams: already-fenced mermaid is unchanged', () => {
  const src = '```mermaid\nflowchart TD\n  A --> B\n```\n';
  assertEquals(normalizeDiagrams(src), src);
});

// ───────────────── 2. Unfenced flowchart TD gets wrapped ─────────────────
Deno.test('normalizeDiagrams: unfenced flowchart TD gets wrapped', () => {
  const src = 'Intro paragraph.\n\nflowchart TD\n  A --> B\n  B --> C\n\nNext paragraph follows here.';
  const out = normalizeDiagrams(src);
  assertStringIncludes(out, '```mermaid\nflowchart TD');
  assertStringIncludes(out, '  B --> C\n```');
});

// ───────────────── 3. Unfenced graph LR gets wrapped ─────────────────
Deno.test('normalizeDiagrams: unfenced graph LR gets wrapped', () => {
  const src = 'graph LR\n  X --> Y\n';
  const out = normalizeDiagrams(src);
  assertStringIncludes(out, '```mermaid\ngraph LR');
});

// ───────────────── 4. Unfenced sequenceDiagram gets wrapped ─────────────────
Deno.test('normalizeDiagrams: unfenced sequenceDiagram gets wrapped', () => {
  const src = 'sequenceDiagram\n  Alice->>Bob: hi\n';
  const out = normalizeDiagrams(src);
  assertStringIncludes(out, '```mermaid\nsequenceDiagram');
});

// ───────────────── 5. Block ends at next heading ─────────────────
Deno.test('normalizeDiagrams: block ends at markdown heading', () => {
  const src = 'flowchart TD\n  A --> B\n## Next Section\nProse here.';
  const out = normalizeDiagrams(src);
  assertStringIncludes(out, '```mermaid\nflowchart TD\n  A --> B\n```');
  assertStringIncludes(out, '## Next Section');
  // Heading must NOT be inside the fence
  assert(!out.includes('## Next Section\n```'), 'heading should be outside fence');
});

// ───────────────── 6. Block ends at prose paragraph after blank line ─────
Deno.test('normalizeDiagrams: block ends at prose after blank line', () => {
  const src =
    'flowchart TD\n  A --> B\n\nThe diagram above shows the flow of data through the system.';
  const out = normalizeDiagrams(src);
  assertStringIncludes(out, '```mermaid\nflowchart TD\n  A --> B\n```');
  assertStringIncludes(out, 'The diagram above shows');
});

// ───────────────── 7. Literal \n inside node label → <br/> ─────────────────
Deno.test('normalizeDiagrams: literal \\n in node label becomes <br/>', () => {
  const src = 'flowchart TD\n  Local["Local node\\nJakhbar"] --> Regional["Regional"]\n';
  const out = normalizeDiagrams(src);
  assertStringIncludes(out, 'Local["Local node<br/>Jakhbar"]');
  assert(!out.includes('\\n'), 'no literal \\n should remain inside diagram');
});

// ───────────────── 8. PUA-wrapped citeturn run is removed ─────────────────
Deno.test('stripExportArtifacts: PUA-wrapped cite run is removed', () => {
  const src = 'On the ground.\uE200cite\uE201turn17view0\uE201turn26view0\uE202 The next sentence.';
  const out = stripExportArtifacts(src);
  assertEquals(out, 'On the ground. The next sentence.');
});

// ───────────────── 9. Bare citeturn token is removed ─────────────────
Deno.test('stripExportArtifacts: bare citeturn26view0 token removed', () => {
  const src = 'See evidence citeturn26view0 in the appendix.';
  const out = stripExportArtifacts(src);
  assertEquals(out, 'See evidence  in the appendix.');
});

// ───────────────── 10. Stray PUA chars removed ─────────────────
Deno.test('stripExportArtifacts: stray PUA chars are swept', () => {
  const src = 'Plain text \uE100 with junk \uE200\uE201.';
  const out = stripExportArtifacts(src);
  assertEquals(out, 'Plain text  with junk .');
});

// ───────────────── 11. Suggested caption downgrade ─────────────────
Deno.test('stripExportArtifacts: Suggested caption is downgraded', () => {
  const src = 'Suggested caption: **How sacred networks became infrastructure.** This shows the flow.';
  const out = stripExportArtifacts(src);
  assertStringIncludes(out, '*Caption:* **How sacred networks became infrastructure.**');
});

// ───────────────── 12. Trailing footnote digit removed ─────────────────
Deno.test('stripExportArtifacts: trailing footnote-anchor digit removed', () => {
  const src = 'A line with a hanging anchor   1\nNext line';
  const out = stripExportArtifacts(src);
  assertEquals(out, 'A line with a hanging anchor\nNext line');
});

// ───────────────── 13. Full pipeline idempotent ─────────────────
Deno.test('runImportPipeline: idempotent', () => {
  const src =
    'flowchart TD\n  A --> B\n\nProse here \uE200cite\uE201turn1view0\uE202 done.\n\n## Heading\n```mermaid\nsequenceDiagram\n  X->>Y: hi\n```\n';
  const once = runImportPipeline(src);
  const twice = runImportPipeline(once);
  assertEquals(twice, once, 'pipeline must be idempotent');
});

// ───────────────── 14. Real Jakhbar excerpt cleans correctly ─────────────────
Deno.test('runImportPipeline: cleans the Jakhbar excerpt end-to-end', () => {
  // Reproduces the screenshot: bare flowchart + PUA cite tokens + caption.
  const jakhbar =
    'For the Srangam Project, this is the real payoff of the trilogy.\uE200cite\uE201turn17view0\uE201turn26view0\uE201turn18view0\uE201turn1view0\uE202\n\n' +
    'flowchart TD\n' +
    '  Local["Local node\\nJakhbar / village society"] --> Regional["Regional sacred field\\nJalandhara Pīṭha"]\n' +
    '  Regional --> Subcontinental["Subcontinental sacred geography\\nTīrthas, pīṭhas, pilgrimage circuits"]\n' +
    '  Local --> Agrarian["Agrarian-revenue network\\nmadad-i-maʿash, boundary settlements"]\n' +
    '  Local --> Legal["Legal-mediation network\\narbitration, qāzī, village headmen"]\n' +
    '  Regional --> Route["Route network\\nPathankot approaches, Ravi corridor"]\n' +
    '  Route --> State["Imperial and state power\\nMughals, hill chiefs, Sikh rulers"]\n' +
    '  State --> Local\n\n' +
    'Suggested caption: **How sacred networks became political infrastructure.** The diagram shows Jakhbar as a local node embedded simultaneously in sacred, agrarian, legal, and route-based systems.\uE200cite\uE201turn17view0\uE201turn26view0\uE201turn1view0\uE201turn35view0\uE202\n';

  const cleaned = runImportPipeline(jakhbar);

  // Cite tokens & PUA glyphs must be gone.
  assert(!/\uE000-\uF8FF/.test(cleaned), 'no PUA chars should remain');
  assert(!cleaned.includes('citeturn'), 'no citeturn tokens should remain');

  // Diagram must be fenced.
  assertStringIncludes(cleaned, '```mermaid\nflowchart TD');
  assertStringIncludes(cleaned, 'Local["Local node<br/>Jakhbar');

  // Closing fence present.
  const fenceCount = (cleaned.match(/^```/gm) || []).length;
  assertEquals(fenceCount, 2, 'exactly one open + close fence');

  // Caption preserved as italic, not as instruction.
  assertStringIncludes(cleaned, '*Caption:* **How sacred networks became political infrastructure.**');
});

// ───────────────── 15. Legitimate code fences are preserved ─────────────────
Deno.test('normalizeDiagrams: does not touch ```ts or ```bash fences', () => {
  const src =
    '```ts\nconst x = 1;\n```\n\n```bash\necho hello\n```\n\nflowchart TD\n  A --> B\n';
  const out = normalizeDiagrams(src);
  assertStringIncludes(out, '```ts\nconst x = 1;\n```');
  assertStringIncludes(out, '```bash\necho hello\n```');
  assertStringIncludes(out, '```mermaid\nflowchart TD');
});

// ───────────────── 16. Edge-side text-sanitizer parity ─────────────────
Deno.test('text-sanitizer: edge re-export matches pipeline impl', () => {
  const dirty = 'foo \uE200cite\uE201turn1view0\uE202 bar';
  assertEquals(edgeStrip(dirty), stripExportArtifacts(dirty));
});

// ───────────────── 17. sanitizeSnippet strips tags + truncates ─────────────────
Deno.test('text-sanitizer: sanitizeSnippet strips tags + truncates', () => {
  const html = '<p>Long article body \uE200cite\uE201turn1view0\uE202 with <strong>markup</strong> and many many words to force truncation past the configured limit value here.</p>';
  const out = sanitizeSnippet(html, 60);
  assert(out.length <= 60, `expected ≤60 chars, got ${out.length}`);
  assert(!out.includes('<'), 'tags must be stripped');
  assert(!out.includes('cite'), 'artefacts must be stripped');
  assert(out.endsWith('…'), 'truncated output ends with ellipsis');
});

// ───────────────── 18. sanitizeEscapes still works (regression) ─────────────────
Deno.test('sanitizeEscapes: backslash-escaped markdown is unescaped', () => {
  const src = '\\# Heading\n\\* item\n\\_underscore\\_';
  assertEquals(sanitizeEscapes(src), '# Heading\n* item\n_underscore_');
});
