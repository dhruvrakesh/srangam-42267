import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// LOAD_W8_2026_10_07 - keep the first download small: the hero preload only on the home page, and
// the admin shell out of the entry bundle.
const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const html = readFileSync(resolve(ROOT, 'index.html'), 'utf-8');
const app = readFileSync(resolve(ROOT, 'src/App.tsx'), 'utf-8');
const HERO = '/images/hero_indian-ocean_aerial_21x9_v1.webp';

function runHeadScript(pathname: string) {
  const code = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
  const added: any[] = [];
  const doc = {
    createElement: () => {
      const el: any = {};
      Object.defineProperty(el, 'setAttribute', { value: (k: string, v: string) => { el[k] = v; } });
      return el;
    },
    head: { appendChild: (el: any) => { added.push(el); } },
  };
  new Function('location', 'document', code)({ pathname }, doc);
  return added;
}

describe('first download', () => {
  it('no static preload of the hero picture is left in the shell', () => {
    expect(html).not.toMatch(/<link[^>]*rel="preload"[^>]*hero_indian-ocean/);
  });

  it('the home page still preloads it, at high priority', () => {
    const added = runHeadScript('/');
    expect(added.length).toBe(1);
    expect(added[0]).toMatchObject({ rel: 'preload', as: 'image', type: 'image/webp', href: HERO, fetchpriority: 'high' });
  });

  it('other pages do not', () => {
    for (const p of ['/texts', '/texts/markandeya_purana', '/articles/x', '/admin']) {
      expect(runHeadScript(p)).toEqual([]);
    }
  });

  it('the admin layout is loaded lazily', () => {
    expect(app).not.toMatch(/^import \{ AdminLayout \}/m);
    expect(app).toMatch(/const AdminLayout = lazy\(/);
  });
});
