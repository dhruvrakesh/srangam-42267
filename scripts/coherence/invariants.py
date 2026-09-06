#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
invariants.py — what an editing pass is FORBIDDEN to change.

THE PROBLEM THIS SOLVES
Every quality gate in this estate has scored the OUTPUT and never asked whether
the INPUT survived. tr_qa scored an inverted verse (तं न पश्यति -> तत्र
पश्यन्त्य) at 1.0. The parity gate counted a 69-character placeholder as a
Hindi translation. A prose-fluency score behaves exactly the same way: it will
happily reward a rewrite that smoothed away a date, a citation, or a diacritic,
because fluent text scores well whether or not it is still true.

So a coherence editor cannot be built on a quality score. It has to be built on
a CONSTRAINT: extract everything that carries fact from the source, edit, then
prove that every one of those things is still present, unchanged, in the output.
Not "mostly present". Present. A single missing footnote marker rejects the edit.

WHAT COUNTS AS AN INVARIANT
  numbers      1500 BCE, 10,552, 3.7%, 14th-century  (with their units/suffixes)
  years/dates  2026-09-06, 1691-1765, c. 1200 CE
  citations    footnote markers, (Author Year), [12], MLA/DOI fragments
  terms        IAST and Devanagari tokens — Śarīra, ṛṣi, अनुक्रमणी. These carry
               the scholarship; a "smoothed" diacritic is a factual error.
  quotes       anything inside " " or “ ” or <q>/<blockquote>
  urls         href targets and bare URLs
  structure    heading count and text, table dimensions, list item counts
  entities     Capitalised multiword names (Sāyaṇāchārya, Ṛgveda-bhāṣya)

An edit may reorder sentences, split or join paragraphs, replace connectives,
fix tense and agreement, and cut redundancy. It may not touch anything above.
"""
from __future__ import annotations
import re, unicodedata, html
from collections import Counter
from dataclasses import dataclass, field

# ── token classes ──────────────────────────────────────────────────────────
NUM     = re.compile(r'(?<![\w.])\d[\d,]*(?:\.\d+)?\s*(?:%|BCE|CE|BC|AD|th|st|nd|rd)?', re.I)
YEAR    = re.compile(r'\b(?:c\.\s*)?\d{3,4}\s*(?:BCE|CE|BC|AD)?\s*(?:[-–—]\s*\d{3,4})?\b')
FOOTNOTE= re.compile(r'(?<=[a-zA-Z\).,;:”"])\d{1,3}(?=[\s<.,;:]|$)')   # trailing marker: "...revelation.1"
BRACKET = re.compile(r'\[\d{1,3}\]|\((?:[A-Z][a-zA-Z\-]+,?\s*)+\d{4}[a-z]?\)')
URL     = re.compile(r'https?://[^\s<>"\')]+|doi:\s*\S+', re.I)
QUOTED  = re.compile(r'[“"]([^”"]{4,200})[”"]')
HEADING = re.compile(r'<h([1-6])[^>]*>(.*?)</h\1>', re.S | re.I)
TAG     = re.compile(r'<[^>]+>')
LI      = re.compile(r'<li\b', re.I)
TR      = re.compile(r'<tr\b', re.I)
TD      = re.compile(r'<t[dh]\b', re.I)

def _has_diacritic(w: str) -> bool:
    return any(unicodedata.combining(c) for c in unicodedata.normalize('NFD', w))

def _is_indic(w: str) -> bool:
    return any('ऀ' <= c <= 'ॿ' or 'ঀ' <= c <= '෿' for c in w)

TERM = re.compile(r'[^\W\d_]+', re.UNICODE)

BLOCK = re.compile(r'</?(?:h[1-6]|p|div|li|ul|ol|tr|td|th|table|blockquote|section|br)\b[^>]*>', re.I)

def _strip(text: str) -> str:
    # Block tags become NEWLINES, not spaces. With a plain space, a heading and
    # the paragraph after it merge into one run and the entity extractor invents
    # names that span the boundary ("Bhasya of Sayanacharya Introduction The
    # Vedic"). Inline tags still collapse to a space so "<em>x</em>y" does not
    # become "xy".
    return html.unescape(TAG.sub(' ', BLOCK.sub('\n', text)))


@dataclass
class Invariants:
    numbers:   Counter = field(default_factory=Counter)
    years:     Counter = field(default_factory=Counter)
    footnotes: Counter = field(default_factory=Counter)
    citations: Counter = field(default_factory=Counter)
    urls:      Counter = field(default_factory=Counter)
    quotes:    Counter = field(default_factory=Counter)
    terms:     Counter = field(default_factory=Counter)   # IAST / Devanagari
    entities:  Counter = field(default_factory=Counter)   # Capitalised names
    headings:  list    = field(default_factory=list)
    counts:    dict    = field(default_factory=dict)

    def as_dict(self):
        return {k: dict(v) if isinstance(v, Counter) else v for k, v in self.__dict__.items()}


def extract(text: str) -> Invariants:
    inv = Invariants()
    raw, plain = text, _strip(text)

    for m in NUM.finditer(plain):     inv.numbers[m.group().strip()] += 1
    for m in YEAR.finditer(plain):    inv.years[m.group().strip()] += 1
    for m in FOOTNOTE.finditer(plain):inv.footnotes[m.group()] += 1
    for m in BRACKET.finditer(plain): inv.citations[m.group()] += 1
    for m in URL.finditer(raw):       inv.urls[m.group()] += 1
    for m in QUOTED.finditer(plain):  inv.quotes[' '.join(m.group(1).split())] += 1

    for m in TERM.finditer(plain):
        w = m.group()
        if _is_indic(w) or (_has_diacritic(w) and len(w) > 1):
            inv.terms[w] += 1

    # Capitalised multi-word names. This class BLOCKS an edit, so the extractor
    # is deliberately conservative: a gate that cries wolf gets switched off,
    # which is worse than no gate. Sentence openers, bare articles and single
    # words are excluded; only runs of two or more capitalised words survive,
    # with whitespace collapsed so a line break cannot invent a new 'entity'.
    OPENERS = {'The','A','An','As','In','On','At','This','That','These','Those',
               'It','Its','Their','His','Her','But','And','For','From','By','With'}
    _CAPW = r'[A-ZĀĪŪṚṜḶṄÑṆṬḌŚṢḤṀ]' + r"[\w\u0300-\u036f\-\u2019']*"
    _JOIN = r'(?:[^\S\n]+(?:of|the|and|de|in)[^\S\n]+|[^\S\n]+)'   # never crosses a newline
    for m in re.finditer(_CAPW + _JOIN + _CAPW + '(?:' + _JOIN + _CAPW + ')*', plain):
        s = ' '.join(m.group().split())
        parts = s.split()
        if parts and parts[0] in OPENERS:
            parts = parts[1:]
        s = ' '.join(parts)
        if len(parts) >= 2 and len(s) > 6:
            inv.entities[s] += 1

    inv.headings = [' '.join(_strip(h[1]).split()) for h in HEADING.findall(raw)]
    inv.counts = {
        'headings': len(inv.headings),
        'list_items': len(LI.findall(raw)),
        'table_rows': len(TR.findall(raw)),
        'table_cells': len(TD.findall(raw)),
    }
    return inv


@dataclass
class Verdict:
    ok: bool
    losses: dict
    changes: dict
    note: str = ''

    def report(self) -> str:
        if self.ok:
            return 'PASS — every invariant survived the edit.'
        out = ['REJECTED — the edit altered protected content.\n']
        for cls, items in self.losses.items():
            if items:
                out.append(f'  {cls} MISSING from the edit ({len(items)}):')
                for k, n in list(items.items())[:12]:
                    out.append(f'      {n}x  {k!r}')
                if len(items) > 12: out.append(f'      … and {len(items)-12} more')
        for cls, d in self.changes.items():
            if d:
                out.append(f'  {cls} COUNT CHANGED:')
                for k, (a, b) in list(d.items())[:12]:
                    out.append(f'      {k}: {a} -> {b}')
        return '\n'.join(out)


def verify(source: str, edited: str, *, allow_footnote_drift=False) -> Verdict:
    """Binary gate. Any invariant that is missing, or whose count fell, rejects."""
    a, b = extract(source), extract(edited)
    losses, changes = {}, {}
    for cls in ('numbers','years','citations','urls','quotes','terms','entities','footnotes'):
        if cls == 'footnotes' and allow_footnote_drift:
            continue
        ca, cb = getattr(a, cls), getattr(b, cls)
        missing = Counter()
        for k, n in ca.items():
            if cb[k] < n:
                missing[k] = n - cb[k]
        losses[cls] = dict(missing)
    for k, v in a.counts.items():
        if b.counts.get(k, 0) != v:
            changes.setdefault('structure', {})[k] = (v, b.counts.get(k, 0))
    if a.headings != b.headings:
        lost = [h for h in a.headings if h not in b.headings]
        if lost:
            losses['headings'] = {h: 1 for h in lost}
    ok = not any(losses.values()) and not any(changes.values())
    return Verdict(ok=ok, losses=losses, changes=changes)
