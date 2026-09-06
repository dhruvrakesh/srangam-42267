#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
split-sql-sections.py — one file in, one statement per file out.

WHY THIS EXISTS
The Supabase SQL editor displays only the LAST statement's result. Every
multi-section file written on 2026-09-06 hid the answer it was written to
produce:

  consolidate_01 §1 (the evidence table) was hidden behind §6 (a count)
  consolidate_03 §4 failed with 'relation does not exist' because §1, which
                    creates that table, was never run in the same paste
  consolidate_03 §6 (the Śarīra openings) was hidden behind §7
  consolidate_05 §1-§3 (the damage verdict) were hidden behind §4 (count 58)

Three lost round trips on the same mechanism. Telling someone "run one section
at a time" does not fix it; splitting the file does.

  python scripts/split-sql-sections.py consolidate_03_merge_duplicates.sql
  -> sql_parts/consolidate_03_merge_duplicates/01_audit_trail.sql
     sql_parts/consolidate_03_merge_duplicates/02_confirm_collisions.sql
     ...

Each part keeps the file's header comment, so a part read on its own still
says what it is and why. Statements inside BEGIN;...COMMIT; are kept together
in one part — splitting a transaction would be worse than the problem.

Writes UTF-8 with no BOM, explicitly. Never use a shell redirect for SQL: on
Windows PowerShell 5.1 `>` decodes stdout with the OEM code page and writes
UTF-16LE, which on 2026-09-06 turned "Purāṇa" into "Pur─üß╣ça" inside a file
that contained eight body UPDATEs.
"""
from __future__ import annotations
import io, os, re, sys

HEADER_END = re.compile(r'^\s*(?:WITH|SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|BEGIN|COMMENT)\b',
                        re.I | re.M)
SECTION = re.compile(r'^--\s*[═=]{2,}\s*(\d+)\s*[─-]{2,}\s*(.*?)\s*[═=─-]*\s*$', re.M)


def slugify(s: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '_', s.lower()).strip('_')
    return (s or 'part')[:48]


def split(path: str, outroot: str = 'sql_parts') -> list[str]:
    src = io.open(path, encoding='utf-8-sig').read()
    base = os.path.splitext(os.path.basename(path))[0]
    outdir = os.path.join(outroot, base)
    os.makedirs(outdir, exist_ok=True)

    m = HEADER_END.search(src)
    header = src[:m.start()] if m else ''
    header = '\n'.join(l for l in header.split('\n') if l.strip().startswith('--')).rstrip()

    marks = list(SECTION.finditer(src))
    if not marks:
        parts = [('01', 'whole_file', src)]
    else:
        parts = []
        for i, mk in enumerate(marks):
            start = mk.start()
            end = marks[i + 1].start() if i + 1 < len(marks) else len(src)
            parts.append((f'{int(mk.group(1)):02d}', slugify(mk.group(2)), src[start:end]))

    written = []
    for num, name, body in parts:
        body = body.rstrip()
        if not re.search(r'\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|COMMENT)\b', body, re.I):
            continue                                    # comment-only section
        n_stmt = len([s for s in body.split(';') if s.strip() and not
                      all(l.strip().startswith('--') or not l.strip() for l in s.split('\n'))])
        note = (f'-- This part contains {n_stmt} statements. The editor shows only the LAST\n'
                f'-- result, so run them one at a time if you need to see each.\n'
                if n_stmt > 1 else
                '-- One statement. Paste, Run, read the result.\n')
        fn = os.path.join(outdir, f'{num}_{name}.sql')
        io.open(fn, 'w', encoding='utf-8', newline='\n').write(
            f'-- {os.path.basename(fn)}  ·  split from {os.path.basename(path)}\n'
            f'{note}--\n{header}\n\n{body}\n')
        written.append(fn)
    return written


if __name__ == '__main__':
    if len(sys.argv) < 2:
        targets = sorted(f for f in os.listdir('.') if re.match(r'consolidate_\d+.*\.sql$', f))
        if not targets:
            sys.exit('usage: python scripts/split-sql-sections.py <file.sql> [more.sql ...]')
    else:
        targets = sys.argv[1:]
    total = 0
    for t in targets:
        w = split(t)
        total += len(w)
        print(f'{t}  ->  {len(w)} part(s)')
        for f in w:
            n = len(io.open(f, encoding='utf-8').read())
            print(f'    {f}  ({n} bytes, UTF-8, no BOM)')
    print(f'\n{total} runnable part(s). Run them in numeric order.')
