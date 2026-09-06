#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_parity_canonical.py — the parity gate's two REMAINING blind spots.
(2026-09-06)

Applies after patch_parity_rls.py and patch_parity_offline.py.

──────────────────────────────────────────────────────────────────────────────
DEFECT 1 — the gate ignores the repo's own slug map.
──────────────────────────────────────────────────────────────────────────────
src/data/articles/canonicalSlugMap.ts exists, is hand-verified ("Each pair
below was confirmed by matching the registry article's English title against
the live DB inventory"), and holds 11 registry-id → DB-slug pairs. The list
page uses it to collapse duplicate cards. The PARITY SCRIPT DOES NOT USE IT:
its lookup is `bySlug.get(art.id)` over slug and slug_alias only.

MEASURED against the privileged 58-row SQL-editor inventory (2026-09-06):
of the 24 registry articles the report calls "MISSING IN DB",

     9  exist as DRAFTS, found by exact slug   -> the RLS defect, already fixed
    10  exist PUBLISHED under a different slug -> THIS defect
     5  are genuinely absent
    --
    24

So 19 of 24 "missing" articles are in the database right now. The report's
stated remedy is "import via Admin → Markdown Import". Following it would
create 19 duplicate rows — precisely what Master Plan Q3 is cleaning up.

──────────────────────────────────────────────────────────────────────────────
DEFECT 2 — the gate counts placeholder text as translated content.
──────────────────────────────────────────────────────────────────────────────
    const nonEmptyLangs = (content) => ... .filter(v => v.trim().length > 0)

It measures PRESENCE, not SUBSTANCE. Measured over the 28 registered articles:

    non-English bodies total            : 141
      stub   (< 10% of the English body):  69   <-- counted as real today
      short  (10–60%)                   :  67
      full   (>= 60%)                   :   5

    src/data/articles/stone-purana.ts line 523:
      hi: '...[Professional Hindi translation required - 6,500 words]'
    janajati-oral-traditions: 71,299 English chars; all 8 "translations" are
    32 characters long.

Consequence: the report tells you "CONTENT GAP — DB missing languages:
as,bn,hi,kn,pa,pn,ta,te" for jambudvipa-connected and sacred-tree-harvest-
rhythms. The DB is not missing content there. The registry is holding eight
placeholders each, and acting on that line would push placeholder text onto
the live public site.

This is the same shape as every other defect found in this codebase this
session: a quality gate that scores the OUTPUT and never asks whether the
INPUT was real.

──────────────────────────────────────────────────────────────────────────────
THE FIX — additive, no behaviour removed
──────────────────────────────────────────────────────────────────────────────
  1. Build canonicalSlugMap.ts alongside the registry; when art.id misses,
     retry through CANONICAL_SLUG_MAP and report
     '🔗 ALIASED (published under a different slug)' — never MISSING.
  2. Classify each non-English body as full / short / stub, where
     stub  = < STUB_RATIO of the English body AND < STUB_ABS characters.
     Stubs are excluded from the language count and reported separately, so
     CONTENT GAP fires only on content that actually exists.
  3. Both thresholds are constants at the top of the generated block, and the
     report prints them, so the number is auditable rather than magic.

RLS is not touched. No row is written. The gate only ever reports.

  python patch_parity_canonical.py            # dry run (checks anchors)
  python patch_parity_canonical.py --apply
  node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv
"""
from __future__ import annotations
import argparse, io, os, shutil, sys, time

MARKER = "PARITY_CANONICAL_2026_09_06"
JS = os.path.join("scripts", "registry-parity-check.mjs")

EDITS = [
    # 1 ── build the canonical slug map next to the registry
    ("""async function loadStaticRegistry() {
  await build({
    entryPoints: ['src/data/articles/index.ts'],
    bundle: true, format: 'esm', platform: 'node',
    outfile: 'node_modules/.parity-registry.mjs',
    alias: { '@': ROOT + '/src' }, logLevel: 'error',
  });
  const mod = await import(pathToFileURL(ROOT + '/node_modules/.parity-registry.mjs'));
  return mod.MULTILINGUAL_ARTICLES;
}""",
     """async function loadStaticRegistry() {
  await build({
    entryPoints: ['src/data/articles/index.ts'],
    bundle: true, format: 'esm', platform: 'node',
    outfile: 'node_modules/.parity-registry.mjs',
    alias: { '@': ROOT + '/src' }, logLevel: 'error',
  });
  const mod = await import(pathToFileURL(ROOT + '/node_modules/.parity-registry.mjs'));
  return mod.MULTILINGUAL_ARTICLES;
}

// PARITY_CANONICAL_2026_09_06
// The repo already knows that some registry ids live in the DB under another
// slug — src/data/articles/canonicalSlugMap.ts, hand-verified 2026-07-12 and
// used by the list-page merge. This gate never consulted it, so it reported
// 10 published articles as "MISSING IN DB" and advised importing them.
async function loadCanonicalMap() {
  try {
    await build({
      entryPoints: ['src/data/articles/canonicalSlugMap.ts'],
      bundle: true, format: 'esm', platform: 'node',
      outfile: 'node_modules/.parity-canonical.mjs',
      alias: { '@': ROOT + '/src' }, logLevel: 'error',
    });
    const m = await import(pathToFileURL(ROOT + '/node_modules/.parity-canonical.mjs'));
    return m.CANONICAL_SLUG_MAP || {};
  } catch (err) {
    console.warn(`canonicalSlugMap.ts could not be loaded (${err.message}); aliased articles will read as MISSING.`);
    return {};
  }
}

// A language body counts only if it is real. Registry "translations" are often
// placeholders — stone-purana.ts carries
//   hi: '...[Professional Hindi translation required - 6,500 words]'
// and janajati-oral-traditions has 71,299 English characters against eight
// 32-character "translations". Measured 2026-09-06 over the 28 registered
// articles: 69 of 141 non-English bodies are stubs by the rule below.
const STUB_RATIO = 0.10;   // shorter than 10% of the English body ...
const STUB_ABS   = 500;    // ... AND shorter than 500 characters
const isStub = (content, lang) => {
  if (lang === 'en') return false;
  const v = (content?.[lang] || '').trim();
  const en = (content?.en || '').trim().length;
  if (!v.length) return true;
  return v.length < STUB_ABS && (en > 0 ? v.length < en * STUB_RATIO : false);
};
const stubLangs = (content) =>
  Object.keys(content || {}).filter((l) => (content[l] || '').trim().length > 0 && isStub(content, l)).sort();"""),

    # 2 ── substance, not presence
    ("""const nonEmptyLangs = (content) =>
  Object.entries(content || {})
    .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
    .map(([k]) => k).sort();""",
     """// PARITY_CANONICAL_2026_09_06 — was: any non-blank string counted as a
// language. That counted placeholders as translations. Now a stub is excluded
// from the language set and surfaced separately.
const nonEmptyLangs = (content) =>
  Object.entries(content || {})
    .filter(([k, v]) => typeof v === 'string' && v.trim().length > 0 && !isStub(content, k))
    .map(([k]) => k).sort();"""),

    # 3 ── load the map
    ("""const registry = await loadStaticRegistry();""",
     """const registry = await loadStaticRegistry();
const CANONICAL_SLUG_MAP = await loadCanonicalMap();   // PARITY_CANONICAL_2026_09_06"""),

    # 4 ── use the map before ever saying MISSING
    ("""for (const art of registry) {
  const db = bySlug.get(art.id);
  const staticLangs = nonEmptyLangs(art.content);
  if (!db) {""",
     """for (const art of registry) {
  // PARITY_CANONICAL_2026_09_06 — try the id, then the repo's own canonical map.
  let db = bySlug.get(art.id);
  let viaCanonical = null;
  if (!db) {
    const canon = CANONICAL_SLUG_MAP[art.id];
    if (canon && bySlug.get(canon)) { db = bySlug.get(canon); viaCanonical = canon; }
  }
  const staticLangs = nonEmptyLangs(art.content);
  const staticStubs = stubLangs(art.content);
  if (db && viaCanonical && db.status === 'published') {
    rows.push({
      slug: art.id, kind: 'registry', status: '🔗 ALIASED (published under a different slug)',
      detail: `canonicalSlugMap: '${art.id}' -> '${viaCanonical}' (DB slug '${db.slug}'). Present and published — DO NOT IMPORT.`
        + (staticStubs.length ? ` Registry placeholder langs (ignored): ${staticStubs.join(',')}` : ''),
    });
    continue;
  }
  if (!db) {"""),

    # 5 ── name the placeholders in the OK/gap detail line
    ("""  if (bad) gaps++;
  rows.push({ slug: art.id, kind: 'registry', status: bad ? '⚠️ CONTENT GAP' : '✅ OK', detail: details.join('; ') || `langs ${dbLangs.join(',')}` });""",
     """  if (staticStubs.length) details.push(`registry placeholder langs IGNORED (not real translations): ${staticStubs.join(',')}`);
  if (bad) gaps++;
  rows.push({ slug: art.id, kind: 'registry', status: bad ? '⚠️ CONTENT GAP' : '✅ OK', detail: details.join('; ') || `langs ${dbLangs.join(',')}` });"""),

    # 6 ── make the report say what it now knows
    ("""- **MISSING IN DB (registry)** → import via Admin → Markdown Import (or \\`markdown-to-article-import\\`), then re-run.""",
     """- **MISSING IN DB (registry)** → genuinely absent. Import via Admin → Markdown Import (or \\`markdown-to-article-import\\`), then re-run.
- **ALIASED** → already published under a different slug (\\`canonicalSlugMap.ts\\`). **Never import these.**
- **DRAFT** → the row exists but is unpublished. **Publish it; never import.**
- Language counts ignore placeholder bodies (shorter than ${Math.round(STUB_RATIO * 100)}% of the English body AND under ${STUB_ABS} characters). Measured 2026-09-06: 69 of the registry's 141 non-English bodies are placeholders, so a CONTENT GAP on those languages was never real."""),
]


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(JS):
        sys.exit(f"not found: {JS} - run from the srangam repo root")
    s = io.open(JS, encoding="utf-8").read()
    if MARKER in s:
        print("Already applied (marker found). Nothing to do."); return
    for req in ("PARITY_RLS_2026_09_06", "PARITY_OFFLINE_2026_09_06"):
        if req not in s:
            sys.exit(f"Run the earlier patch first - {req} not present.")

    bad = False
    for i, (old, _new) in enumerate(EDITS, 1):
        n = s.count(old)
        print(f"  edit {i}: {n} match(es) (need exactly 1)")
        if n != 1:
            bad = True
    if bad:
        sys.exit("\nABORTED - nothing written.")
    if not args.apply:
        print("\nAnchors OK (6/6). Re-run with --apply.")
        return

    os.makedirs("backups", exist_ok=True)
    b = os.path.join("backups", f"registry-parity-check.mjs.preCanonical.{time.strftime('%Y%m%d_%H%M%S')}")
    shutil.copy2(JS, b)
    print(f"  backup: {b}")
    try:
        for old, new in EDITS:
            assert s.count(old) == 1
            s = s.replace(old, new, 1)
        s = s.replace("// PARITY_RLS_2026_09_06\n",
                      f"// PARITY_RLS_2026_09_06\n// {MARKER}\n", 1)
        io.open(JS, "w", encoding="utf-8", newline="\n").write(s)
    except Exception as exc:
        shutil.copy2(b, JS)
        sys.exit(f"FAILED ({exc}) - restored from backup.")

    print("\nApplied. Expected effect on the report, from the measured inventory:")
    print("   24 MISSING  ->   5 MISSING + 10 ALIASED + 9 DRAFT")
    print("    2 CONTENT GAP -> 0 (both were placeholder languages)")
    print("\n  node scripts/registry-parity-check.mjs --inventory docs/db_inventory.csv")


if __name__ == "__main__":
    main()
