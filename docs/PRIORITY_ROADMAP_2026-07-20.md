# Estate Priority Roadmap — 2026-07-20
**Scope:** srangam-42267 import pipeline (per IMPORT_PIPELINE_CODE_AUDIT_2026-07-20.md) + sanskrit-automatonv2 translation quality and job hygiene.
**Ordering principle:** blast-radius × reversibility × effort. Data loss outranks everything because it is the only irreversible failure class; translation quality outranks performance because the corpus mission is the point and prompt changes are cheap and benchmarkable; performance last because nothing is currently slow enough to hurt a single admin operator.

**Sequencing constraint (automaton):** the JOBS registry is in-memory. Do NOT restart the Flask server while the smriti/upapurana/advance_pipeline jobs are running — let them drain first. The patched infer_mt.py (8192 budget + corrected finish-reason enum) only takes effect on restart.

---

## P0 — Data safety (this week; small diffs; irreversible-loss class)

**P0.1 — srangam I1: stop overwrite/merge destroying content.**
- Overwrite path: read existing `title/dek/content`, deep-merge `{...existing, [targetLang]: incoming}` before upsert (index.ts:667→688). Never write single-language JSONB over a multilingual row.
- Merge path: stop `srangam_markdown_sources` upsert-on-article_id from replacing the original-language markdown (index.ts:610-621). Interim surgical fix without migration: language-suffixed file_path + skip-if-different-language guard; proper fix: composite key (article_id, lang) migration, reviewed before applying.
- Gate: `npm run build` on Windows + [LIVE-VERIFY] against a scratch slug (`import-selftest-2026`) exercising: EN import → HI merge → EN overwrite → confirm HI survives and EN source markdown survives.

**P0.2 — Automaton: stop burning budget on untranslatable docs.**
- Dequeue/pause `nirukta` (lexicon fed through a verse prompt → gloss-pairs and empties) and `smriti_06yagyavalkya` (OCR sludge → err:32 on 82 passages). Zero code: cancel the jobs in the dashboard.
- These two account for the bulk of visible errors; nothing is wrong with the engine.

## P1 — Translation quality (the mission; cheap; fully benchmarkable)

**P1.1 — Verify MBh01 completeness before celebrating.**
- The export (`exports/MBh01_1-225.html`) shows ONE verse per page in the sampled range (pages 217–225). Expected ≈31 verses/page (6,957 across 225 adhyāyas). Verify: count translated passages in DB
  `sqlite3 data/context.db "SELECT count(*) FROM passages p JOIN docs d ON p.doc_id=d.id WHERE d.code='MBh01' AND p.translation IS NOT NULL AND p.translation!='';"`
  vs total. If far below 6,957 the likely culprit is the quality-score filter (GRETIL text scores ~0.52 because the scorer expects OCR daṇḍas) gating the translate queue — which makes P1.3 a prerequisite, not a nicety.

**P1.2 — Prompt v2 for verse fluency (Debroy-alignment), then re-benchmark.**
Evidence from the export (verse-level critique in the session log): content accuracy and epithet handling are already strong; the defects are all English-surface. Append to `_SYSTEM_PROMPT_BASE`:
  1. Render each complete verse as one or two fluent English sentences in natural English word order; never mirror pāda order at the cost of grammar.
  2. Omit purely emphatic particles (eva, hi, vai, ha, khalu, punar eva → "again indeed") unless the emphasis is semantically essential.
  3. Every clause must have an explicit grammatical subject; resolve absolutive constructions to their true agent (no "Those birds having seen…, then Jaritāri addressed…").
  4. Keep one consistent IAST spelling per proper noun for the whole document (Śārṅgaka, not Śārṅgaka/Śārṅga in alternation).
  5. Avoid demonstrative calques of tad/te ("that forest", "those birds") unless genuinely deictic.
- Apply AFTER running jobs drain and the server restarts (picks up the 8192/enum patch simultaneously).
- Then: `python scripts/benchmark_mbh01.py --doc MBh01 --n 30` — Flash pass largely served from cache, Pro pass runs to completion (10–20 min, do not Ctrl-C). Score both against Debroy manually in the sheet's editable column. Prompt v2 vs v1 delta becomes a measured fact, and the engine choice for the wisdomlib corpus follows from evidence.

**P1.3 — text_filters.py daṇḍa-calibration patch.**
- Clean e-texts (no daṇḍas) must not be penalized by the OCR-calibrated quality scorer. Small heuristic: if doc source is e-text (`engine='gretil-bori-etext'`), skip the daṇḍa term or floor the score.

**P1.4 — Lexicon-mode prompt (later).**
- A category-keyed prompt variant for nirukta-type docs: translate as headword → gloss dictionary entries preserving daṇḍa-separated structure. Until it exists, nirukta stays dequeued (P0.2). Smriti needs re-OCR or a better source scan — no prompt can fix "aud च स्वपणं… fad लिखितं".

## P2 — Honesty & observability

**P2.1 — srangam I2+I4: honest import results.** Per-step `response.steps[]`, stats from actual inserted counts (fix index.ts:980), amber "imported with warnings" in the UI, IMPORT-E00x codes. No polling infra needed — render the card from the response.
**P2.2 — Automaton job hygiene.** Startup reconciliation (jobs.jsonl entries left `running` → mark orphaned), per-doc advisory lock in JOBS (prevents duplicate-doc jobs paying double API cost), per-run (not cumulative) error attribution in log lines.

## P3 — Performance

**P3.1 — srangam I3: batch term writes.** One `SELECT in()`, bulk insert, atomic `usage_count = usage_count + 1` RPC. ~60 round-trips → 3; kills the increment race.
**P3.2 — Cross-ref idempotency.** Delete-then-insert for `source_article_id` on overwrite re-import; stops duplicate accumulation.

## P4 — Hygiene & documentation

**P4.1 — srangam I5 remainder:** CRLF normalization at pipeline entry (verify `_shared/markdown-pipeline.ts` first), honor or remove `sequenceNumber`, chapter-link upsert, wire or remove the two decorative checkboxes, tighten italics regex to matched delimiters.
**P4.2 — Doc sync:** IMPORT_WORKFLOW.md updated to the deployed extractor's actual behavior; automaton ARCHITECTURE.md gains the restart/orphan caveat and the P2.2 mechanisms once built.

---

## MBh01 quality verdict (AI-Debroy review of export pages 217–225, Khāṇḍava-daha / Śārṅgakopākhyāna)

**Holds up to the Debroy standard:** content fidelity (the six spared beings — Aśvasena, Maya, four Śārṅgakas — correctly enumerated, p219); epithets glossed in Debroy's own convention — "Havyavāhana (Carrier of Oblations)" p220, "Bharatarṣabha (Bull of the Bhāratas)" p225; frame speakers preserved ("Vaiśaṃpāyana said:"); IAST proper nouns throughout; verse boundaries intact.

**Falls short — all English-surface, all prompt-fixable (→ P1.2):**
- Pāda-order literalism breaking grammar: "That terrible forest became / with the roar of thunder" (p217) — became *what*? Debroy: "That terrible forest became filled with streams of flame, smoke and lightning, roaring like thunder."
- Particle calques: "again indeed were killed" (p218) for punar eva.
- Absolutive anacoluthon: "Those Śārṅgas, having seen the fire…, then Jaritāri addressed Pāvaka" (p222) — plural absolutive, singular main verb.
- Name inconsistency: Śārṅgakas (p219) vs Śārṅgas (p222).
- Stilted comparatives: "More desired than remaining is the abandonment of the body to fire" (p221).

Overall: a solid scholar's crib, not yet publishable prose. The gap to Debroy is style, not accuracy — exactly the cheap half of the problem.
