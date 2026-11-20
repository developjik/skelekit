/**
 * main.ts — SkeleKit demo index.
 *
 * Wires store + router to demonstrate every core module.
 * Run with: npm run dev
 */
import './theme.css';
import { createStore } from './core/store.js';
import { createRouter } from './core/router.js';
import { h, mount } from './core/ui.js';

// ── Visit counter (proves localStorage persistence) ───────────────────────
const visits = createStore('visits', 0);
visits.set(n => n + 1);

// ── Module catalogue ──────────────────────────────────────────────────────
interface ModuleInfo {
  name: string;
  file: string;
  summary: string;
  color: string;
}

const MODULES: ModuleInfo[] = [
  {
    name: 'store.ts',
    file: 'src/core/store.ts',
    summary: 'localStorage-backed reactive state. createStore<T>(key, initial) → { get, set, subscribe, reset }.',
    color: '#7c6af7',
  },
  {
    name: 'router.ts',
    file: 'src/core/router.ts',
    summary: 'Hash router with :param segments. createRouter({ routes }) → { start, navigate, current }.',
    color: '#5ba4cf',
  },
  {
    name: 'loop.ts',
    file: 'src/core/loop.ts',
    summary: 'Fixed-timestep rAF loop with spiral-of-death guard. createLoop({ stepMs, update, render }).',
    color: '#57c27c',
  },
  {
    name: 'ui.ts',
    file: 'src/core/ui.ts',
    summary: 'Minimal DOM helpers. h(tag, props, ...children), mount(node, target), clear(el).',
    color: '#e5a84b',
  },
  {
    name: 'assets.ts',
    file: 'src/core/assets.ts',
    summary: 'Preload images & audio. loadAssets(manifest, onProgress) → Promise<typed record>.',
    color: '#e05252',
  },
];

// ── Views ─────────────────────────────────────────────────────────────────

function moduleCard(mod: ModuleInfo): HTMLElement {
  return h('article', { class: 'module-card' },
    h('div', { class: 'card-accent', style: { background: mod.color } }),
    h('div', { class: 'card-body' },
      h('h2', {}, mod.name),
      h('code', { class: 'card-file' }, mod.file),
      h('p', { class: 'card-summary' }, mod.summary),
    ),
  );
}

function homeView(): HTMLElement {
  const visitCount = visits.get();

  const header = h('header', { class: 'site-header' },
    h('div', { class: 'header-skull' }, '💀'),
    h('div', {},
      h('h1', {}, 'SkeleKit'),
      h('p', { class: 'tagline' }, 'Zero-dependency TypeScript skeleton for Vite apps'),
    ),
  );

  const visitBadge = h('p', { class: 'visit-badge' },
    '👁 Visit ',
    h('strong', {}, String(visitCount)),
    visitCount === 1 ? ' — first time here!' : ' — welcome back.',
  );

  const grid = h('div', { class: 'module-grid' },
    ...MODULES.map(moduleCard),
  );

  const footer = h('footer', { class: 'site-footer' },
    'Spawn an app: copy ',
    h('code', {}, 'template/'),
    ' → ',
    h('code', {}, 'apps/<name>/'),
    ' and add your spec.',
  );

  return h('main', { class: 'site-main' }, header, visitBadge, grid, footer);
}

// ── Router ────────────────────────────────────────────────────────────────

const router = createRouter({
  routes: [
    { path: '#/', view: homeView },
  ],
});

const app = document.getElementById('app');
if (!app) throw new Error('Missing #app element');

router.start(app);

// ── Styles (injected so the demo is fully self-contained) ─────────────────
const style = document.createElement('style');
style.textContent = `
  .site-main {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  .site-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }
  .header-skull {
    font-size: 3rem;
    line-height: 1;
  }
  .site-header h1 {
    font-size: 2rem;
    color: var(--accent);
  }
  .tagline {
    color: var(--muted);
    font-size: 0.95rem;
  }
  .visit-badge {
    font-size: 0.9rem;
    color: var(--muted);
    border-left: 3px solid var(--accent);
    padding-left: var(--space-3);
  }
  .module-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--space-4);
  }
  .module-card {
    border: 1px solid #2a2a3a;
    border-radius: var(--radius);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .card-accent {
    height: 4px;
  }
  .card-body {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .card-body h2 {
    font-size: 1rem;
    font-family: var(--font-mono);
  }
  .card-file {
    font-size: 0.75rem;
    color: var(--muted);
  }
  .card-summary {
    font-size: 0.85rem;
    color: var(--fg);
    opacity: 0.8;
  }
  .site-footer {
    font-size: 0.85rem;
    color: var(--muted);
    border-top: 1px solid #2a2a3a;
    padding-top: var(--space-4);
  }
`;
document.head.appendChild(style);
