# The working corpus for signed-in readers (2026-10-08)

Marker: CORPUS_READER_C5_2026_10_08.

The full design is in the automaton repository, `docs/CORPUS_MIRROR_2026-10-08.md`.

## What it is

The translation PC keeps a private mirror of its whole Sanskrit corpus in this project's database, in the schema `corpus`.
- **Contents.** 63 documents, 75,734 passages, the English and Hindi translations, entities, stories, and 21,931 passage vectors.
- **How it is kept current.** By `corpus_sync.py`, every two hours.
- **Who reads it.** Nothing in that schema is granted to the site's roles. Signed-in readers read it through six database functions, each of which checks the caller first.

| Page | What a reader sees |
|---|---|
| `/corpus` | Every document with its counts: passages, English, Hindi, stories. A link to `/texts/...` when the document is published. Search by words and by meaning. |
| `/corpus/:docCode` | 50 passages a page (`?p=3`, anchors `#p<page>-<idx>`): Devanagari, IAST, English and Hindi. "Similar passages", taken from stored vectors with no AI call. |

## Who may read

`corpus_reader_allowed()` decides, from `corpus.reader_access.mode`:
- **Admins** (`has_role(uid, 'admin')`) may always read.
- **`signed_in`** (the default): any signed-in user.
- **`readers`**: only users listed in `corpus.readers`.
- **`admins`**: admins only.
- **Not signed in**: refused, whatever the mode.

Sign-up on this site is open, so `signed_in` means anyone who makes an account. The pages say plainly that nothing is reviewed, and they are marked `noindex`.

## Code

- **`src/lib/corpusMirror.ts`**
  - It calls the RPCs `corpus_reader_docs`, `corpus_reader_page`, `corpus_reader_search` and `corpus_reader_similar`, and the edge function `search-corpus`.
  - It returns `{ ok, rows, error, refused }`, so a refusal is never shown as a loading failure, and a failure never as "nothing found".
- **`src/pages/corpus/CorpusHome.tsx`, `src/pages/corpus/CorpusDoc.tsx`**: lazy routes in `src/App.tsx`.
- **`src/components/corpus/CorpusGate.tsx`**
  - It invites a signed-out visitor to `/auth?next=...`.
  - `src/lib/safeNext.ts` follows only paths on this site.
- **`supabase/functions/search-corpus`**
  - It embeds the question as `search-texts` does (gemini-embedding-001, 1536 dimensions) and calls `corpus_reader_match` with the reader's own session.
  - It has no privilege of its own.
- **Tests.** `src/__tests__/corpus-mirror.test.tsx`.

## Database

The database side is these SQL files in the automaton repository, applied in the Lovable SQL editor:
- `docs/cloud/C4_corpus_mirror_2026-10-08.sql`
- `docs/cloud/C4b_mirror_digests_2026-10-08.sql`
- `docs/cloud/C5_corpus_reader_2026-10-08.sql`

No migration file is added here. No row is written to `supabase_migrations.schema_migrations`.
