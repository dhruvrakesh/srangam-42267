/**
 * Imaging Handoff — Srangam ↔ maps.sankyo.in (project: ima-imaging)
 *
 * Shared types + URL builder for the cross-app deep-link bridge.
 * The actual signing happens server-side in the `imaging-handoff-token`
 * edge function so that `IMAGING_HANDOFF_SECRET` never leaves the backend.
 *
 * Imaging app routes we deep-link into (all auth-gated on the other side):
 *   - /viewer            Map Explorer (satellite imagery)
 *   - /sky               Planetarium
 *   - /astronomy-lab     Preset astronomical-dating challenges
 *   - /srangam           Srangam Dating Lab hub
 */

/** Default base URL for the imaging app. Override via VITE_IMAGING_BASE_URL. */
export const IMAGING_BASE_URL: string =
  (import.meta.env.VITE_IMAGING_BASE_URL as string | undefined) ||
  'https://maps.sankyo.in';

export type ImagingTargetKind =
  | 'viewer'
  | 'planetarium'
  | 'astronomy-lab'
  | 'dating-lab';

export interface ImagingTarget {
  kind: ImagingTargetKind;
  /** Human-readable label rendered on the launching button. */
  label?: string;
  params?: {
    /** Latitude (decimal degrees). */
    lat?: number;
    /** Longitude (decimal degrees). */
    lon?: number;
    /** Map zoom (Leaflet style). */
    zoom?: number;
    /** ISO date for the planetarium (YYYY-MM-DD). */
    date?: string;
    /** Seed challenge ID for /astronomy-lab. */
    challenge?: string;
    /** Free-form context tag passed through for analytics on the other side. */
    ref?: string;
  };
}

/**
 * Strip control characters and any leading path/protocol-like prefix from a
 * pass-through `ref` value before it lands in the signed `next` URL. The
 * imaging-side verifier rejects anything resembling an absolute URL, so we
 * scrub on this side too as defence in depth.
 */
function sanitiseRef(ref: string): string {
  return ref
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/^[\s/\\:]+/, '')
    .slice(0, 120);
}

/**
 * Build the path + query for a given target on the imaging app, without the
 * handoff token. Used both for signed handoffs (we append `?handoff=`) and
 * for the unauthenticated fallback link.
 */
export function buildImagingPath(target: ImagingTarget): string {
  const p = target.params ?? {};
  const qs = new URLSearchParams();
  const safeRef = p.ref ? sanitiseRef(p.ref) : undefined;

  switch (target.kind) {
    case 'viewer': {
      if (p.lat != null) qs.set('lat', p.lat.toFixed(5));
      if (p.lon != null) qs.set('lon', p.lon.toFixed(5));
      if (p.zoom != null) qs.set('zoom', String(p.zoom));
      if (safeRef) qs.set("ref", safeRef);
      const q = qs.toString();
      return q ? `/viewer?${q}` : '/viewer';
    }
    case 'planetarium': {
      if (p.lat != null) qs.set('lat', p.lat.toFixed(5));
      if (p.lon != null) qs.set('lon', p.lon.toFixed(5));
      if (p.date) qs.set('date', p.date);
      if (safeRef) qs.set("ref", safeRef);
      const q = qs.toString();
      return q ? `/sky?${q}` : '/sky';
    }
    case 'astronomy-lab': {
      if (p.challenge) qs.set('challenge', p.challenge);
      if (safeRef) qs.set("ref", safeRef);
      const q = qs.toString();
      return q ? `/astronomy-lab?${q}` : '/astronomy-lab';
    }
    case 'dating-lab':
    default:
      return '/srangam';
  }
}

/** Full URL without auth handoff (anonymous fallback / "open in new tab"). */
export function buildImagingPublicUrl(target: ImagingTarget): string {
  return IMAGING_BASE_URL.replace(/\/+$/, '') + buildImagingPath(target);
}

/**
 * Build the signed-handoff URL once the edge function returns a token.
 * The imaging app's /auth route reads `?handoff=` + `?next=` to verify
 * the HMAC, mint a session, and redirect.
 */
export function buildImagingHandoffUrl(target: ImagingTarget, token: string): string {
  const next = buildImagingPath(target);
  const u = new URL('/auth', IMAGING_BASE_URL);
  u.searchParams.set('handoff', token);
  u.searchParams.set('next', next);
  return u.toString();
}
