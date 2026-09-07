# Incident — the Sources & Pins fix shipped broken (da87f24 → this commit)

**Date:** 2026-09-07
**Severity:** every article page rendered a broken "Sources & Pins" panel.
**Detected by:** writing the regression test that the previous commit promised
and did not include.

## What was wrong

Commit `da87f24` set out to fix a real defect: the panel named "Sources & Pins"
never queried pins. `hasDbData` tested bibliography and evidence only, and only
`legacyData.pins` was rendered, so 46 of 59 articles with pins showed an empty
state. That diagnosis was correct. The patch was not.

### Defect 1 — `dbPins` out of scope (runtime ReferenceError)

The pins render block was inserted into `SourcesAndPinsContent`, which is a
**module-scope** component. `dbPins` is declared inside `SourcesAndPins` and was
never passed down. Four references were unresolved identifiers:

```
src/components/oceanic/SourcesAndPins.tsx(432,9):  error TS2304: Cannot find name 'dbPins'.
src/components/oceanic/SourcesAndPins.tsx(435,33): error TS2304: Cannot find name 'dbPins'.
src/components/oceanic/SourcesAndPins.tsx(439,14): error TS2304: Cannot find name 'dbPins'.
src/components/oceanic/SourcesAndPins.tsx(454,9):  error TS2304: Cannot find name 'dbPins'.
```

Optional chaining (`dbPins?.length`) does **not** protect an undeclared
identifier — it still throws `ReferenceError`. Vite/esbuild strips types without
checking them, so the build succeeded and deployed. Reproduced under vitest:

```
AssertionError: expected [Function] to not throw an error
  but 'ReferenceError: dbPins is not defined' was thrown
```

### Defect 2 — the pins block sat in the branch pins make unreachable

`hasDbData` now includes `dbPins`. So an article **with** pins takes the
database branch. The pins block was placed only in the **legacy** branch, which
runs when `hasDbData` is false — that is, when there are no pins. The two
conditions are mutually exclusive: the pins could never render.

`custodians-unfinished-time` (3 pins, 0 bibliography, 0 evidence — measured
2026-09-07) would have shown "No structured bibliography rows for this article
yet" and still no pins. The stated fix did not fix the stated bug.

## Why nothing caught it

**`npm test` does not typecheck, and `npx tsc --noEmit` typechecks nothing.**

`tsconfig.json` declares `"files": []` with two project references. The root
invocation therefore compiles zero files and exits 0 — on any code, valid or
not. Verified against the broken tree:

```
npx tsc --noEmit                 -> exit 0   (passes broken code)
npm run typecheck                -> exit 2   (four TS2304 errors)
```

This is the same failure mode catalogued repeatedly in this project: a
measurement that cannot fail, reported as a pass. The 43 tests that passed
alongside `da87f24` did not touch the component.

## Fixes in this commit

1. `dbPins` threaded through as a declared prop of `SourcesAndPinsContent`.
2. The pins render hoisted into one `DatabasePinsBlock` component, rendered in
   **both** branches — pins are neither bibliography nor evidence, so in the
   database branch they render under whichever view is active rather than
   behind the Bibliography/Evidence toggle.
3. The download payload now includes pins; the badge already counted them.
4. `src/__tests__/sources-and-pins-db-pins.test.tsx` — 4 cases. Two of them fail
   against `da87f24` (verified by running them against a clean clone of that
   commit before applying the fix); all 4 pass after.
5. `npm run typecheck` added, targeting the referenced projects directly.

Verification performed on a clean `git clone` of `da87f24`, not on the working
tree: test fails → patch applied → `tsc` clean → 47/47 tests pass.

## Open item, not changed here

`src/components/theme/SourcesAndPins.tsx` (157 lines) has **zero importers**
anywhere in `src/`. It is a different component — page-keyed, delegating to
`InteractivePinCards` / `QACorrelationTable` — and does not share this defect,
because it has no database query and no empty state. It is dead code. Left in
place; removal is a separate decision.

## Standing rule

Run `npm run typecheck` before every push. `npm test` alone is not sufficient:
it exercises behaviour, not types, and this defect was a type error that only
manifested at runtime on a path no test covered.
