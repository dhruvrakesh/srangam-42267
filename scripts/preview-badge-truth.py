#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
preview-badge-truth.py — what regenerating meta.ts will do to every card badge.

Regenerating src/data/articles/meta.ts with the placeholder floor changes the
n/9 badge on cards across the live site. Numbers will go DOWN. That is the
point — they are currently counting placeholder strings as translations — but
nobody should be surprised by it after the fact. This prints the exact change
for all 28 registered articles BEFORE anything is regenerated.

Reads the .ts sources directly (no esbuild), so it runs anywhere.
  python scripts/preview-badge-truth.py
Reads only. Writes nothing.
"""
import io, os, re, sys

D = 'src/data/articles'
LANGS = ('en','hi','ta','te','kn','bn','as','pa','pn')
STUB_RATIO, SHORT_SOURCE, STUB_ABS = 0.10, 2000, 100   # mirrors scripts/lib/substance.mjs

def scan(path):
    s = io.open(path, encoding='utf-8').read()
    m = re.search(r'\bcontent\s*:\s*\{', s)
    if not m: return None
    i, depth, out = m.end(), 1, {}
    while i < len(s) and depth > 0:
        ch = s[i]
        if ch == '{': depth += 1; i += 1; continue
        if ch == '}': depth -= 1; i += 1; continue
        km = re.match(r"\s*['\"]?(" + '|'.join(LANGS) + r")['\"]?\s*:\s*", s[i:])
        if km and depth == 1:
            i += km.end(); q = s[i]
            if q not in '`\'"': continue
            i += 1; start = i
            while i < len(s):
                if s[i] == '\\': i += 2; continue
                if s[i] == q: break
                if q == '`' and s[i] == '$' and s[i+1:i+2] == '{':
                    d2 = 1; i += 2
                    while i < len(s) and d2:
                        if s[i] == '{': d2 += 1
                        elif s[i] == '}': d2 -= 1
                        i += 1
                    continue
                i += 1
            out[km.group(1)] = i - start; i += 1
            continue
        i += 1
    return out

def is_stub(lang, n, en):
    if lang == 'en': return False
    if n == 0: return True
    return n < en * STUB_RATIO if en >= SHORT_SOURCE else n < STUB_ABS

idx = io.open(os.path.join(D, 'index.ts'), encoding='utf-8').read()
mods = re.findall(r"^import \{[^}]+\} from '\./([^']+)';", idx, re.M)

rows, changed = [], 0
for mod in mods:
    p = os.path.join(D, mod + '.ts')
    if not os.path.exists(p): continue
    r = scan(p)
    if not r: continue
    aid = re.search(r"\bid\s*:\s*'([^']+)'", io.open(p, encoding='utf-8').read()).group(1)
    en = r.get('en', 0)
    now = sorted(k for k, v in r.items() if v > 0)
    real = sorted(k for k, v in r.items() if v > 0 and not is_stub(k, v, en))
    stubs = [k for k in now if k not in real]
    if len(real) != len(now): changed += 1
    rows.append((aid, en, len(now), len(real), stubs))

# --check: is the GENERATED meta.ts in sync with its sources?
# This exists because generate-registry-meta.mjs could never run on Windows
# (it wrote intermediates to '/tmp/...'), so meta.ts silently drifted from the
# modules it is generated from. On 2026-09-06 a patch to the generator was
# committed with the message "badges: count real translations" while meta.ts
# was untouched — the patch landed, the effect did not. This check makes that
# state visible without needing esbuild, so it can run anywhere.
if '--check' in sys.argv:
    import json as _json
    meta_path = os.path.join(D, 'meta.ts')
    meta = io.open(meta_path, encoding='utf-8').read()
    drift = []
    for aid, en, n_now, n_real, stubs in rows:
        m = re.search(r'"id":\s*"' + re.escape(aid) + r'".*?"contentLanguages":\s*(\[[^\]]*\])',
                      meta, re.S)
        if not m:
            drift.append((aid, 'ABSENT from meta.ts', '')); continue
        have = sorted(_json.loads(m.group(1)))
        want = sorted(k for k, v in scan(os.path.join(D, [x for x in mods
                      if re.search(r"\bid\s*:\s*'" + re.escape(aid) + r"'",
                      io.open(os.path.join(D, x + '.ts'), encoding='utf-8').read())
                      if os.path.exists(os.path.join(D, x + '.ts'))][0] + '.ts')).items()
                      if v > 0 and not is_stub(k, v, en))
        if have != want:
            drift.append((aid, ','.join(have), ','.join(want)))
    if drift:
        print(f"meta.ts is STALE — {len(drift)} article(s) disagree with their source modules:\n")
        for aid, have, want in drift:
            print(f"  {aid:<38} meta.ts: {have or '-':<28} sources: {want or '-'}")
        print("\n  Regenerate:  node scripts/generate-registry-meta.mjs")
        print("  Then re-run: python scripts/preview-badge-truth.py --check")
        sys.exit(1)
    print(f"meta.ts is in sync with all {len(rows)} source modules.")
    sys.exit(0)

print(f"{'article':<38} {'en chars':>9}  badge now -> truthful   placeholders removed")
print('-' * 100)
for aid, en, n_now, n_real, stubs in sorted(rows, key=lambda x: (x[3] - x[2], -x[1])):
    arrow = f"{n_now}/9 -> {n_real}/9"
    mark = '   ' if n_now == n_real else '  *'
    print(f"{mark}{aid[:36]:<36} {en:>9}  {arrow:<16} {','.join(stubs) if stubs else '-'}")
print('-' * 100)
print(f"  {changed} of {len(rows)} cards change; {len(rows)-changed} are already truthful.")
print(f"  rule: body >= {SHORT_SOURCE} chars -> placeholder if under {int(STUB_RATIO*100)}% of English;")
print(f"        shorter source -> placeholder if under {STUB_ABS} chars.")
print("\n  Badges go DOWN. They are currently counting placeholder strings as")
print("  translations. The new numbers are also the translation backlog, in priority order.")
