// Phase V — Deterministic article fixture shared by Layer 2 DOM overflow specs.
// Intentionally small and self-contained so jsdom rendering is fast and stable.

import { BookOpen } from 'lucide-react';

export const FIXTURE_CONTENT_HTML = `
<h1>Reassessing the Ashokan Legacy</h1>
<h2>Executive summary</h2>
<p>This article surveys the epigraphic, archaeological, and textual evidence
that informs current scholarship on the Mauryan emperor's policies and the
diffusion of Buddhist ideas across South and Southeast Asia.</p>
<ul>
  <li>Rock and Pillar Edicts dated to the third century BCE.</li>
  <li>Greek and Aramaic bilingual inscriptions from Kandahar.</li>
  <li>Comparative readings of Pāli and Sanskrit chronicles.</li>
</ul>
<p>Beyond the inscriptions, the material record at Sanchi, Sarnath and
Vidisha provides corroborating evidence for the chronology and reach of
imperial patronage.</p>
<div class="overflow-x-auto">
  <table class="min-w-[900px]">
    <thead><tr><th>Site</th><th>Edict</th><th>Script</th></tr></thead>
    <tbody>
      <tr><td>Girnar</td><td>Major Rock 1–14</td><td>Brahmi</td></tr>
      <tr><td>Kandahar</td><td>Bilingual</td><td>Greek + Aramaic</td></tr>
    </tbody>
  </table>
</div>
<p>Modern reassessments draw on radiocarbon dates, palaeographic typology,
and renewed close-reading of the corpus to refine earlier consensus.</p>
`.trim();

export const articleFixture = {
  title: 'Reassessing the Ashokan Legacy',
  dek: 'Epigraphy, archaeology and chronology after a century of scholarship.',
  content: FIXTURE_CONTENT_HTML,
  tags: ['Mauryan', 'Epigraphy', 'Buddhism'],
  icon: BookOpen,
  readTime: 12,
  author: 'Srangam Editorial',
  date: '2026-05-28',
};
