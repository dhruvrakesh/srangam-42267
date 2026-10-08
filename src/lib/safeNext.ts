/**
 * Where to go after signing in - CORPUS_READER_C5_2026_10_08.
 * /auth?next=/corpus/markandeya_purana?p=3 brings a reader back to that page. Only a path on this
 * site is followed: "//elsewhere.com", "https://...", "javascript:..." and anything with spaces,
 * angle brackets or backslashes give null, and the caller keeps its usual destination.
 */
export function safeNext(v: string | null | undefined): string | null {
  if (!v || v.length > 300) return null;
  if (!v.startsWith('/') || v.startsWith('//')) return null;
  if (/[\s<>\\]/.test(v)) return null;
  return v;
}
