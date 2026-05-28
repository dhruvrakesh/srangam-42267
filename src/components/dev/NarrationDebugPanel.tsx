// Phase L.1 — Dev-only TTS telemetry panel.
//
// Mount once at app root, gated by `import.meta.env.DEV`. Vite statically
// removes both the import and the JSX branch from production bundles, so
// this file ships zero bytes in `vite build` output.
import { useEffect, useState } from 'react';
import {
  getLastTelemetry,
  getTelemetryHistory,
  subscribe,
  type TtsTelemetry,
} from '@/services/narration/telemetry';

export function NarrationDebugPanel() {
  const [, setTick] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);

  const last: TtsTelemetry | null = getLastTelemetry();
  const history = getTelemetryHistory();

  if (!last) {
    return (
      <div
        style={panelStyle}
        onClick={() => setCollapsed((c) => !c)}
        title="TTS debug — no plays yet"
      >
        <span style={{ opacity: 0.6 }}>TTS debug · idle</span>
      </div>
    );
  }

  const originColor = last.origin === 'cache' ? '#10b981' : '#f59e0b';

  return (
    <div style={panelStyle}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span style={{ ...badgeStyle, background: originColor }}>{last.origin}</span>
        <strong style={{ fontSize: 11 }}>{last.provider}</strong>
        <span style={{ opacity: 0.7, fontSize: 10 }}>{last.voice}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: 10 }}>
          {collapsed ? '▸' : '▾'}
        </span>
      </div>
      {!collapsed && (
        <>
          <div style={metaRow}>hash {last.contentHashPrefix}</div>
          {last.articleSlug && (
            <div style={metaRow} title={last.articleSlug}>
              slug {truncate(last.articleSlug, 28)}
            </div>
          )}
          {last.timings.firstPlayMs !== undefined && (
            <div style={metaRow}>
              firstPlay {Math.round(last.timings.firstPlayMs)} ms{' '}
              <span
                style={{
                  color: last.timings.firstPlayMs > 3000 ? '#ef4444' : '#10b981',
                }}
              >
                ({last.timings.firstPlayMs > 3000 ? 'over' : 'under'} 3s)
              </span>
            </div>
          )}
          {last.slowest && (
            <div style={metaRow}>slowest: {last.slowest}</div>
          )}
          {history.length > 1 && (
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #333' }}>
              <div style={{ opacity: 0.6, fontSize: 10, marginBottom: 2 }}>recent</div>
              {history.slice(0, 4).map((r, i) => (
                <div key={i} style={{ ...metaRow, opacity: i === 0 ? 1 : 0.6 }}>
                  {r.origin} · {r.timings.firstPlayMs !== undefined
                    ? `${Math.round(r.timings.firstPlayMs)}ms`
                    : '—'}{' '}
                  · {r.slowest || '—'}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  // Phase Q / MC-01: sit above the mobile bottom tab bar (h-16 + safe-area)
  // in dev preview, and cap width so it never causes horizontal page scroll.
  bottom: 'calc(env(safe-area-inset-bottom) + 76px)',
  left: 12,
  zIndex: 99999,
  background: 'rgba(17,17,17,0.92)',
  color: '#fff',
  padding: '8px 10px',
  borderRadius: 6,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11,
  lineHeight: 1.4,
  minWidth: 0,
  maxWidth: 'calc(100vw - 24px)',
  width: 'max-content',
  boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
  pointerEvents: 'auto',
  border: '1px solid #2a2a2a',
};

const badgeStyle: React.CSSProperties = {
  fontSize: 10,
  padding: '1px 6px',
  borderRadius: 4,
  color: '#000',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
};

const metaRow: React.CSSProperties = {
  fontSize: 10.5,
  opacity: 0.9,
};

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
