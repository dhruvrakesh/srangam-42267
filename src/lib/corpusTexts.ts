/**
 * Corpus text loaders — Track B3.
 *
 * Reads srangam_texts / srangam_text_passages (migration 20260718120000).
 *
 * WHY A FLAT RESULT AND NOT A DISCRIMINATED UNION
 * The first version returned `{ok:true;rows}|{ok:false;error}`. That is better
 * TypeScript and it does not work here: tsconfig sets strictNullChecks:false, so
 * the compiler will not narrow a boolean discriminant — neither `if (!r.ok)` nor
 * `if (r.ok) throw` narrows, and every consumer would have to cast. A flat shape
 * needs no narrowing and keeps the property that matters.
 *
 * THE PROPERTY THAT MATTERS
 * A failed query must never be indistinguishable from an empty corpus.
 * articlePins.ts returns [] on failure, which suits a resolver splicing optional
 * data; a reader must not, because "no texts" would then assert something false.
 * Contract: check `ok` FIRST. `error` is non-null exactly when ok is false.
 */
import { supabase } from '@/integrations/supabase/client';

const CORPUS_TIMEOUT_MS = 6000;

export interface CorpusText {
  id: string;
  doc_code: string;
  title: string;
  category: string | null;
  source_note: string | null;
  translation_engine: string | null;
  passage_count: number;
  published: boolean;
}

export interface CorpusPassage {
  id: string;
  page_no: number;
  idx: number;
  sanskrit: string;
  iast: string | null;
  translation: string;
  verse_ref: string | null;
  quality_score: number | null;
}

export interface Loaded<T> {
  ok: boolean;
  rows: T[];
  total: number;
  /** Non-null exactly when ok === false. */
  error: string | null;
}

export interface LoadedOne<T> {
  ok: boolean;
  row: T | null;
  error: string | null;
}

const okRows = <T>(rows: T[], total: number): Loaded<T> => ({ ok: true, rows, total, error: null });
const failRows = <T>(error: string): Loaded<T> => ({ ok: false, rows: [], total: 0, error });
const okRow = <T>(row: T | null): LoadedOne<T> => ({ ok: true, row, error: null });
const failRow = <T>(error: string): LoadedOne<T> => ({ ok: false, row: null, error });

function withTimeout(p: PromiseLike<unknown>, label: string): Promise<any> {
  const timeout = new Promise<any>((resolve) =>
    setTimeout(
      () => resolve({ __timeout: label + ' timed out after ' + CORPUS_TIMEOUT_MS + 'ms' }),
      CORPUS_TIMEOUT_MS,
    ),
  );
  return Promise.race([Promise.resolve(p), timeout]);
}

/** Published texts only. RLS enforces this too; the filter makes it explicit. */
export async function listPublishedTexts(): Promise<Loaded<CorpusText>> {
  const sb = supabase as any;
  const res = await withTimeout(
    sb.from('srangam_texts')
      .select('id, doc_code, title, category, source_note, translation_engine, passage_count, published',
        { count: 'exact' })
      .eq('published', true)
      .order('category', { ascending: true, nullsFirst: false })
      .order('title', { ascending: true }),
    'listPublishedTexts',
  );
  if (res && res.__timeout) return failRows<CorpusText>(res.__timeout);
  if (res && res.error) return failRows<CorpusText>(res.error.message ?? String(res.error));
  const rows = (res?.data ?? []) as CorpusText[];
  return okRows<CorpusText>(rows, res?.count ?? rows.length);
}

export async function loadTextByDocCode(docCode: string | undefined): Promise<LoadedOne<CorpusText>> {
  if (!docCode) return okRow<CorpusText>(null);
  const sb = supabase as any;
  const res = await withTimeout(
    sb.from('srangam_texts')
      .select('id, doc_code, title, category, source_note, translation_engine, passage_count, published')
      .eq('doc_code', docCode)
      .eq('published', true)
      .maybeSingle(),
    'loadTextByDocCode',
  );
  if (res && res.__timeout) return failRow<CorpusText>(res.__timeout);
  if (res && res.error) return failRow<CorpusText>(res.error.message ?? String(res.error));
  return okRow<CorpusText>((res?.data ?? null) as CorpusText | null);
}

export async function loadPassages(
  textId: string | undefined,
  opts: { offset?: number; limit?: number } = {},
): Promise<Loaded<CorpusPassage>> {
  if (!textId) return okRows<CorpusPassage>([], 0);
  const offset = opts.offset ?? 0;
  const limit = opts.limit ?? 50;
  const sb = supabase as any;
  const res = await withTimeout(
    sb.from('srangam_text_passages')
      .select('id, page_no, idx, sanskrit, iast, translation, verse_ref, quality_score',
        { count: 'exact' })
      .eq('text_id', textId)
      .order('page_no', { ascending: true })
      .order('idx', { ascending: true })
      .range(offset, offset + limit - 1),
    'loadPassages',
  );
  if (res && res.__timeout) return failRows<CorpusPassage>(res.__timeout);
  if (res && res.error) return failRows<CorpusPassage>(res.error.message ?? String(res.error));
  const rows = (res?.data ?? []) as CorpusPassage[];
  return okRows<CorpusPassage>(rows, res?.count ?? 0);
}