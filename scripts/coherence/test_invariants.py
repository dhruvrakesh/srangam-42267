#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Negative controls. Each case is a rewrite that a fluency score would REWARD
and that must be REJECTED. Source text is the real opening of
sarira-and-atman-the-preservation-of-the-vedas-… (id 75672e10), exported
2026-09-06 20:51."""
import sys
from invariants import extract, verify

SRC = """<h1><em><strong>Śarīra and Ātman: The Preservation of the Vedas through the Anukramaṇīs and the Bhāṣya of Sāyaṇāchārya</strong></em></h1>
<h2><strong>Introduction</strong></h2>
<p>The Vedic corpus, the foundational scripture of Hindu Dharma, is traditionally held to be <em>apauruṣeya</em>&mdash;"not of human origin," a timeless, authorless, and superhuman revelation.1 As <em>Śruti</em>, meaning "that which is heard," its sanctity and efficacy are believed to reside not only in its profound semantic content but, crucially, in its precise phonetic and metrical form. The great 14th-century commentator Sāyaṇāchārya, in his introduction to the Ṛgveda-bhāṣya, defines the Veda as the sole means by which the transcendental goals of humanity (<em>puruṣārtha</em>) can be known, a realm of knowledge inaccessible through empirical methods such as direct perception (<em>pratyakṣa</em>) or inference (<em>anumāna</em>).4 This sacred status engendered a civilizational imperative for its perfect and unaltered preservation across millennia, an effort executed with unparalleled intellectual rigor.5</p>"""

CASES = [
  ("A. legitimate flow edit — split a long sentence, swap a connective",
   SRC.replace(
     "The great 14th-century commentator Sāyaṇāchārya, in his introduction to the Ṛgveda-bhāṣya, defines the Veda as the sole means by which the transcendental goals of humanity (<em>puruṣārtha</em>) can be known, a realm of knowledge inaccessible through empirical methods such as direct perception (<em>pratyakṣa</em>) or inference (<em>anumāna</em>).4",
     "In his introduction to the Ṛgveda-bhāṣya, the great 14th-century commentator Sāyaṇāchārya defines the Veda as the sole means of knowing the transcendental goals of humanity (<em>puruṣārtha</em>). That realm is inaccessible through empirical methods such as direct perception (<em>pratyakṣa</em>) or inference (<em>anumāna</em>).4"),
   True),

  ("B. diacritics 'normalised' — Sāyaṇāchārya -> Sayanacharya",
   SRC.replace("Sāyaṇāchārya", "Sayanacharya").replace("Ṛgveda", "Rigveda"), False),

  ("C. footnote markers dropped as 'stray digits'",
   SRC.replace("revelation.1", "revelation.").replace("anumāna</em>).4", "anumāna</em>).").replace("rigor.5", "rigor."), False),

  ("D. century silently changed 14th -> 13th",
   SRC.replace("14th-century", "13th-century"), False),

  ("E. Sanskrit gloss removed for 'readability'",
   SRC.replace(" (<em>pratyakṣa</em>)", "").replace(" (<em>anumāna</em>)", ""), False),

  ("F. quoted definition paraphrased",
   SRC.replace('"not of human origin,"', 'meaning it has no human author,'), False),

  ("G. heading demoted h2 -> p",
   SRC.replace("<h2><strong>Introduction</strong></h2>", "<p><strong>Introduction</strong></p>"), False),
]

print("=" * 78)
print("INVARIANTS EXTRACTED FROM THE SOURCE")
print("=" * 78)
inv = extract(SRC)
for k in ('terms','entities','footnotes','numbers','quotes'):
    v = getattr(inv, k)
    print(f"  {k:<10} {len(v):>3} distinct : {', '.join(list(v)[:9])}")
print(f"  structure     {inv.counts}")
print(f"  headings      {inv.headings}")

print("\n" + "=" * 78)
print("NEGATIVE CONTROLS — every case except A must be REJECTED")
print("=" * 78)
fails = 0
for name, edited, should_pass in CASES:
    v = verify(SRC, edited)
    good = (v.ok == should_pass)
    if not good: fails += 1
    print(f"\n{'✓' if good else '✗ DETECTOR FAILED'}  {name}")
    print(f"     expected {'PASS' if should_pass else 'REJECT'}, got {'PASS' if v.ok else 'REJECT'}")
    if not v.ok:
        first = v.report().split('\n')
        for ln in first[1:6]:
            if ln.strip(): print(f"     {ln.strip()}")
print("\n" + "-" * 78)
print(f"  detector correct on {len(CASES)-fails}/{len(CASES)} cases")
sys.exit(1 if fails else 0)
