/**
 * Phase 1 (Pin Healing) — robust error serialization.
 *
 * `String(e)` on a Supabase PostgrestError / generic object returns
 * `"[object Object]"`, which is what currently lands in
 * `srangam_admin_jobs.last_error` and makes operator debugging impossible.
 *
 * `serializeErr(e)` returns a short, human-readable string that includes
 * `message`, `code`, `details`, and `hint` whenever the error carries them
 * (Postgrest, Supabase auth, fetch Response-shaped errors, plain Error,
 * primitives, and unknown objects all flow through the same path).
 */

export function serializeErr(e: unknown): string {
  if (e == null) return 'unknown error';
  if (typeof e === 'string') return e;
  if (typeof e !== 'object') return String(e);

  const anyE = e as Record<string, unknown>;
  const parts: string[] = [];

  const msg =
    (typeof anyE.message === 'string' && anyE.message) ||
    (typeof anyE.error_description === 'string' && anyE.error_description) ||
    (typeof anyE.error === 'string' && anyE.error) ||
    '';
  if (msg) parts.push(msg);

  if (typeof anyE.code === 'string' || typeof anyE.code === 'number') {
    parts.push(`code=${anyE.code}`);
  }
  if (typeof anyE.status === 'number') {
    parts.push(`status=${anyE.status}`);
  }
  if (typeof anyE.details === 'string' && anyE.details) {
    parts.push(`details=${anyE.details}`);
  }
  if (typeof anyE.hint === 'string' && anyE.hint) {
    parts.push(`hint=${anyE.hint}`);
  }

  if (parts.length > 0) return parts.join(' | ').slice(0, 1000);

  try {
    return JSON.stringify(e).slice(0, 1000);
  } catch {
    return Object.prototype.toString.call(e);
  }
}
