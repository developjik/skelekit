/**
 * main.ts — Grave Dash app entry.
 * Router shell: #/title → #/run → #/over (→ #/run)
 */
import './theme.css';
import { createRouter }  from './core/router.js';
import { h }             from './core/ui.js';
import { bestStore, mutedStore, startGame } from './game.js';

// ── App element ───────────────────────────────────────────────────────────
const app = document.getElementById('app');
if (!app) throw new Error('Missing #app element');

// ── State shared across screens ───────────────────────────────────────────
let lastScore = 0;
let stopCurrentGame: (() => void) | null = null;

// ── Title screen ──────────────────────────────────────────────────────────
function titleView(): HTMLElement {
  const best = bestStore.get();
  const muted = mutedStore.get();

  const screen = h('div', { class: 'gd-screen' },
    h('div', { class: 'gd-title' }, '👻 Grave Dash'),
    h('p',   { class: 'gd-subtitle' }, 'Sprint through the graveyard. Time your hops. Collect skulls.'),
    best > 0
      ? h('div', { class: 'gd-score-block' },
          h('span', { class: 'gd-score-label' }, 'Best'),
          h('span', { class: 'gd-best-value' },  String(best)),
        )
      : h('p', { class: 'gd-hint' }, 'No record yet — be the first ghost to run!'),
    h('p', { class: 'gd-cta' }, '🕹  Space / Click / Tap to start'),
    h('p', { class: 'gd-hint' },
      `P = Pause  •  M = Mute  •  ${muted ? '🔇 Muted' : '🔊 Sound on'}`,
    ),
    h('p', { class: 'gd-hint' },
      'Controls shown on screen  •  Works on mobile',
    ),
  );

  function startRun(): void {
    router.navigate('#/run');
  }

  screen.addEventListener('pointerdown', startRun);
  screen.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      startRun();
    }
    if (e.code === 'KeyM') {
      mutedStore.set(m => !m);
    }
  });

  // Also listen globally for Space on this screen
  const globalKey = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      globalKey && document.removeEventListener('keydown', globalKey);
      startRun();
    }
    if (e.code === 'KeyM') {
      mutedStore.set(m => !m);
    }
  };
  document.addEventListener('keydown', globalKey);

  // Clean up listener when navigating away (view is replaced)
  const obs = new MutationObserver(() => {
    if (!document.contains(screen)) {
      document.removeEventListener('keydown', globalKey);
      obs.disconnect();
    }
  });
  obs.observe(app!, { childList: true, subtree: true });

  return screen;
}

// ── Run screen ─────────────────────────────────────────────────────────────
function runView(): HTMLElement {
  // Container — game.ts will replaceChildren(wrapper) on the app element.
  // We hand back a placeholder; startGame takes appEl directly.
  const placeholder = h('div', { class: 'gd-canvas-wrapper' });

  // Kick off the game on the next microtask (after the router mounts this element)
  Promise.resolve().then(() => {
    if (stopCurrentGame) {
      stopCurrentGame();
      stopCurrentGame = null;
    }
    stopCurrentGame = startGame(app!, (score: number) => {
      lastScore = score;
      router.navigate('#/over');
    });
  });

  return placeholder;
}

// ── Game-over screen ───────────────────────────────────────────────────────
function overView(): HTMLElement {
  if (stopCurrentGame) {
    stopCurrentGame();
    stopCurrentGame = null;
  }

  const best  = bestStore.get();
  const score = lastScore;
  const isNewBest = score > 0 && score >= best;

  const screen = h('div', { class: 'gd-screen' },
    h('div', { class: 'gd-title', style: { color: '#cc2244' } }, '💀 Game Over'),
    h('div', { class: 'gd-score-block' },
      h('span', { class: 'gd-score-label' }, 'Score'),
      h('span', { class: 'gd-score-value' }, String(score)),
    ),
    h('div', { class: 'gd-score-block' },
      h('span', { class: 'gd-score-label' }, isNewBest ? '🏆 New Best!' : 'Best'),
      h('span', { class: 'gd-best-value' },  String(best)),
    ),
    h('p', { class: 'gd-cta' }, '🕹  Space / Click / Tap to try again'),
    h('p', { class: 'gd-hint' }, 'P = Pause  •  M = Mute'),
  );

  function restartRun(): void {
    router.navigate('#/run');
  }

  screen.addEventListener('pointerdown', restartRun);

  const globalKey = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      document.removeEventListener('keydown', globalKey);
      restartRun();
    }
    if (e.code === 'KeyM') {
      mutedStore.set(m => !m);
    }
  };
  document.addEventListener('keydown', globalKey);

  const obs = new MutationObserver(() => {
    if (!document.contains(screen)) {
      document.removeEventListener('keydown', globalKey);
      obs.disconnect();
    }
  });
  obs.observe(app!, { childList: true, subtree: true });

  return screen;
}

// ── Router ────────────────────────────────────────────────────────────────
const router = createRouter({
  routes: [
    { path: '#/title', view: titleView },
    { path: '#/run',   view: runView   },
    { path: '#/over',  view: overView  },
  ],
  onNavigate: (resolved) => {
    // Stop game when leaving #/run to a non-run screen
    if (resolved.path !== '#/run' && resolved.path !== '#/run/' && stopCurrentGame) {
      // Don't stop here — handled by overView and runView
    }
  },
});

// Default to title
if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
  window.location.hash = '#/title';
}

router.start(app);
