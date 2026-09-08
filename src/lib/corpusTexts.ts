/**
 * Corpus text loaders — Track B3.
 *
 * Reads srangam_texts / srangam_text_passages, created by migration
 * 20260718120000. Both tables are absent from the generated Database type
 * because the migration was applied through the SQL editor rather than
 * Lovable's migration flow, so types.ts has not been regenerated.
 *
 * The cast is confined to ONE place here, matching the existing precedent in
 * src/hooks/useCorpusCorrelations.ts (`const sb = supabase as any`). When
 * Lovable regenerates types, delete the cast and nothing else changes: every
 * export below is already fully typed outward.
 *
 * WHY A DISCRIMINATED RESULT AND NOT AN EMPTY ARRAY
 * articlePins.ts returns [] on failure, which suits a resolver splicing in
 * optional data. A reader must not do that: a failed query rendering "no texts"
 * is indistinguishable from a corpus that is genuinely empty, and the reader
 * would then assert something false about the data. Callers must handle
 * ok:false explicitly.
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

export type Loaded<T> =
  | { ok: true; rows: T[]; total: number }
  | { ok: false; error: string };

export type LoadedOne<T> =
  | { ok: true; row: T | null }
  | { ok: false; error: string };

function withTimeout<T>(p: PromiseLike<T>, label: string): Promise<T | { __timeout: string }> {
  const timeout = new Promise<{ __timeout: string }>((resolve) =>
    setTimeout(() => resolve({ __timeout: label + ' timed out after ' + CORPUS_TIMEOUT_MS + 'ms' }),
      CORPUS_TIMEOUT_MS),
  );
  return Promise.race([Promise.resolve(p), timeout]) as Promise<T | { __timeout: string }>;
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
  if ((res as any).__timeout) return { ok: false, error: (res as any).__timeout };
  const { data, error, count } = res as any;
  if (error) return { ok: false, error: error.message ?? String(error) };
  return { ok: true, rows: (data ?? []) as CorpusText[], total: count ?? (data?.length ?? 0) };
}

export async function loadTextByDocCode(docCode: string | undefined): Promise<LoadedOne<CorpusText>> {
  if (!docCode) return { ok: true, row: null };
  const sb = supabase as any;
  const res = await withTimeout(
    sb.from('srangam_texts')
      .select('id, doc_code, title, category, source_note, translation_engine, passage_count, published')
      .eq('doc_code', docCode)
      .eq('published', true)
      .maybeSingle(),
    'loadTextByDocCode',
  );
  if ((res as any).__timeout) return { ok: false, error: (res as any).__timeout };
  const { data, error } = res as any;
  if (error) return { ok: false, error: error.message ?? String(error) };
  return { ok: true, row: (data ?? null) as CorpusText | null };
}

export async function loadPassages(
  textId: string | undefined,
  opts: { offset?: number; limit?: number } = {},
): Promise<Loaded<CorpusPassage>> {
  if (!textId) return { ok: true, rows: [], total: 0 };
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
  if ((res as any).__timeout) return { ok: false, error: (res as any).__timeout };
  const { data, error, count } = res as any;
  if (error) return { ok: false, error: error.message ?? String(error) };
  return { ok: true, rows: (data ?? []) as CorpusPassage[], total: count ?? 0 };
}