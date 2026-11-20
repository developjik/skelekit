/**
 * main.ts — OppBoard entry point.
 * Wires router (store.ts + router.ts + ui.ts) to build the deadline board.
 * No canvas or loop — proves those core modules are optional.
 */
import './theme.css';
import './app.css';
import { createRouter } from './core/router.js';
import { boardView } from './views/board.js';
import { aboutView } from './views/about.js';

// ── App shell ─────────────────────────────────────────────────────────────

const app = document.getElementById('app');
if (!app) throw new Error('Missing #app element');

const router = createRouter({
  routes: [
    { path: '#/board', view: boardView },
    { path: '#/about', view: aboutView },
  ],
  onNavigate: () => {
    // Sync nav link active states after each navigation
    document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach(a => {
      const href = a.getAttribute('href') ?? '';
      const hash = window.location.hash.split('?')[0];
      a.classList.toggle('nav-link--active', href === hash || (hash === '' && href === '#/board'));
    });
  },
});

// Redirect bare hash to #/board
if (!window.location.hash || window.location.hash === '#') {
  window.location.hash = '#/board';
}

router.start(app);
