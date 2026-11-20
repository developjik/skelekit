/**
 * board.ts — #/board view.
 *
 * FR-2 card list sorted by deadline, with pinned / open / closed sections.
 * FR-3 type chips + search box, state in hash.
 * FR-4 pins persisted via store (ob:pins).
 * FR-5 D-day chips with KST-aware computation.
 * FR-6 stats strip.
 * FR-8 keyboard map: / ↑↓ Enter p.
 */
import { h } from '../core/ui.js';
import { createStore } from '../core/store.js';
import { loadOpportunities, dday, ddayClass, ddayLabel } from '../data/index.js';
import type { Opportunity, OppType } from '../data/index.js';
import { renderHeader } from './header.js';

// ── Pins store ────────────────────────────────────────────────────────────

const pinsStore = createStore<string[]>('ob:pins', []);

function isPinned(id: string): boolean {
  return pinsStore.get().includes(id);
}

function togglePin(id: string): void {
  pinsStore.set(pins =>
    pins.includes(id) ? pins.filter(p => p !== id) : [...pins, id],
  );
}

// ── Hash query helpers ────────────────────────────────────────────────────

interface BoardQuery {
  type: OppType | 'all';
  q: string;
}

function parseQuery(): BoardQuery {
  const hash = window.location.hash; // e.g. "#/board?type=hackathon&q=AI"
  const qIdx = hash.indexOf('?');
  if (qIdx === -1) return { type: 'all', q: '' };
  const params = new URLSearchParams(hash.slice(qIdx + 1));
  const type = params.get('type') ?? 'all';
  const validType = (['hackathon', 'contest', 'job', 'all'] as string[]).includes(type)
    ? (type as OppType | 'all')
    : 'all';
  return { type: validType, q: params.get('q') ?? '' };
}

function buildHash(query: Partial<BoardQuery>): string {
  const current = parseQuery();
  const merged = { ...current, ...query };
  const params = new URLSearchParams();
  if (merged.type !== 'all') params.set('type', merged.type);
  if (merged.q) params.set('q', merged.q);
  const qs = params.toString();
  return '#/board' + (qs ? '?' + qs : '');
}

// ── Filter logic ──────────────────────────────────────────────────────────

function filterOpportunities(opps: Opportunity[], query: BoardQuery): Opportunity[] {
  return opps.filter(o => {
    if (query.type !== 'all' && o.type !== query.type) return false;
    if (query.q) {
      const needle = query.q.toLowerCase();
      if (
        !o.title.toLowerCase().includes(needle) &&
        !o.host.toLowerCase().includes(needle)
      ) return false;
    }
    return true;
  });
}

// ── Stats strip ───────────────────────────────────────────────────────────

function renderStats(opps: Opportunity[]): HTMLElement {
  const counts: Record<OppType, number> = { hackathon: 0, contest: 0, job: 0 };
  let nearestDeadline: string | null = null;
  const now = Date.now();

  for (const o of opps) {
    counts[o.type]++;
    const d = dday(o.deadline, now);
    if (d >= 0) {
      if (nearestDeadline === null || o.deadline < nearestDeadline) {
        nearestDeadline = o.deadline;
      }
    }
  }

  const pinCount = pinsStore.get().filter(id => opps.some(o => o.id === id)).length;

  const stat = (label: string, value: string): HTMLElement =>
    h('span', { class: 'stats-item' },
      h('span', { class: 'stats-label' }, label + '\u00a0'),
      h('span', { class: 'stats-value' }, value),
    );

  return h('div', { class: 'stats-strip', role: 'status', 'aria-live': 'polite' },
    stat('Hackathons', String(counts.hackathon)),
    stat('Contests', String(counts.contest)),
    stat('Jobs', String(counts.job)),
    stat('Nearest', nearestDeadline ?? '—'),
    stat('Pinned', String(pinCount)),
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────

function renderToolbar(query: BoardQuery, onRerender: () => void): HTMLElement {
  const types: Array<{ label: string; value: OppType | 'all' }> = [
    { label: 'All', value: 'all' },
    { label: 'Hackathon', value: 'hackathon' },
    { label: 'Contest', value: 'contest' },
    { label: 'Job', value: 'job' },
  ];

  const chips = types.map(t =>
    h('button', {
      class: `filter-chip${query.type === t.value ? ' filter-chip--active' : ''}`,
      onClick: () => {
        window.location.hash = buildHash({ type: t.value });
        onRerender();
      },
      'aria-pressed': String(query.type === t.value),
      type: 'button',
    }, t.label),
  );

  const searchInput = h('input', {
    class: 'search-input',
    type: 'search',
    placeholder: 'Search title or host… (/)',
    value: query.q,
    'aria-label': 'Search opportunities',
    id: 'opp-search',
  });

  searchInput.addEventListener('input', () => {
    window.location.hash = buildHash({ q: searchInput.value });
    onRerender();
  });

  searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      window.location.hash = buildHash({ q: '' });
      onRerender();
      searchInput.blur();
    }
  });

  return h('div', { class: 'toolbar', role: 'toolbar', 'aria-label': 'Filter opportunities' },
    h('div', { class: 'type-filters', role: 'group', 'aria-label': 'Filter by type' }, ...chips),
    h('div', { class: 'search-wrap' },
      h('span', { class: 'search-icon', 'aria-hidden': 'true' }, '🔍'),
      searchInput,
    ),
  );
}

// ── Card component ────────────────────────────────────────────────────────

function cardView(
  opp: Opportunity,
  pinned: boolean,
  onTogglePin: (id: string) => void,
  onOpenLink: (url: string) => void,
): HTMLElement {
  const d = dday(opp.deadline);
  const cls = ddayClass(d);
  const label = ddayLabel(d);
  const isClosed = d < 0;

  const pinBtn = h('button', {
    class: `pin-btn${pinned ? ' pin-btn--active' : ''}`,
    type: 'button',
    'aria-label': pinned ? `Unpin ${opp.title}` : `Pin ${opp.title}`,
    'aria-pressed': String(pinned),
    onClick: (e: MouseEvent) => {
      e.stopPropagation();
      onTogglePin(opp.id);
    },
  }, pinned ? '★' : '☆');

  const typeChip = h('span', {
    class: `type-chip type--${opp.type}`,
    'aria-label': `Type: ${opp.type}`,
  }, opp.type);

  const ddayChipEl = h('span', {
    class: `dday-chip dday--${cls}`,
    'aria-label': `Deadline: ${label}`,
  }, label);

  const linkEl = h('a', {
    class: 'opp-card-link',
    href: opp.url,
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': `Open ${opp.title}`,
    onClick: (e: MouseEvent) => e.stopPropagation(),
  }, '↗');

  // Build meta children — conditionally include prize
  const metaChildren: Array<HTMLElement | string | null | undefined | false> = [
    typeChip,
    h('span', { class: 'opp-card-host' }, opp.host),
  ];
  if (opp.prize && opp.prize !== '—') {
    metaChildren.push(h('span', { class: 'opp-card-prize' }, opp.prize));
  }

  const card = h('div', {
    class: [
      'opp-card',
      pinned ? 'opp-card--pinned' : '',
      isClosed ? 'opp-card--closed' : '',
    ].filter(Boolean).join(' '),
    role: 'article',
    tabindex: '0',
    'data-id': opp.id,
    'data-url': opp.url,
    'aria-label': `${opp.title}, ${opp.host}, ${opp.type}, deadline ${label}`,
    onClick: () => onOpenLink(opp.url),
  },
    pinBtn,
    h('div', { class: 'opp-card-body' },
      h('div', { class: 'opp-card-top' },
        h('span', { class: 'opp-card-title', title: opp.title }, opp.title),
      ),
      h('div', { class: 'opp-card-meta' },
        ...metaChildren,
      ),
    ),
    h('div', { class: 'opp-card-end' },
      ddayChipEl,
      linkEl,
    ),
  );

  return card;
}

// ── Board state container ─────────────────────────────────────────────────

interface BoardState {
  focusedId: string | null;
  contentWrapper: HTMLElement | null;
}

// ── Board view ────────────────────────────────────────────────────────────

export function boardView(): HTMLElement {
  const allOpps = loadOpportunities();
  const now = Date.now();

  const state: BoardState = {
    focusedId: null,
    contentWrapper: null,
  };

  // ── Re-render callback ────────────────────────────────────────────────
  function renderContent(): HTMLElement {
    const query = parseQuery();
    const filtered = filterOpportunities(allOpps, query);
    const pins = pinsStore.get();

    const pinnedOpps = filtered.filter(o => pins.includes(o.id));
    const openOpps = filtered.filter(o => !pins.includes(o.id) && dday(o.deadline, now) >= 0);
    const closedOpps = filtered.filter(o => !pins.includes(o.id) && dday(o.deadline, now) < 0);

    function onTogglePin(id: string): void {
      state.focusedId = id;
      togglePin(id);
      swap();
    }

    function onOpenLink(url: string): void {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    function makeCard(o: Opportunity): HTMLElement {
      return cardView(o, isPinned(o.id), onTogglePin, onOpenLink);
    }

    const sections: HTMLElement[] = [];

    // Stats strip
    sections.push(renderStats(allOpps));

    // Toolbar
    sections.push(renderToolbar(query, swap));

    // Pinned section
    if (pinnedOpps.length > 0) {
      sections.push(h('div', { class: 'card-section-label' }, `📌 Pinned (${pinnedOpps.length})`));
      sections.push(h('div', { class: 'card-list', role: 'list' }, ...pinnedOpps.map(makeCard)));
    }

    // Open section
    if (openOpps.length > 0) {
      if (pinnedOpps.length > 0) {
        sections.push(h('div', { class: 'card-section-label' }, `Open (${openOpps.length})`));
      }
      sections.push(h('div', { class: 'card-list', role: 'list' }, ...openOpps.map(makeCard)));
    }

    // Empty state
    if (pinnedOpps.length === 0 && openOpps.length === 0 && closedOpps.length === 0) {
      sections.push(h('p', { class: 'empty-message' }, 'No opportunities match your filters.'));
    }

    // Closed section (collapsed <details>)
    if (closedOpps.length > 0) {
      const closedList = h('div', {
        class: 'card-list',
        role: 'list',
        style: { marginTop: '8px' },
      }, ...closedOpps.map(makeCard));
      const details = h('details', { class: 'closed-details' },
        h('summary', { class: 'closed-summary' }, `Closed (${closedOpps.length})`),
        closedList,
      );
      sections.push(details);
    }

    return h('div', {}, ...sections);
  }

  function swap(): void {
    const wrapper = state.contentWrapper;
    if (!wrapper) return;
    wrapper.replaceChildren(renderContent());

    // Restore focus after re-render
    if (state.focusedId) {
      const el = wrapper.querySelector<HTMLElement>(`[data-id="${state.focusedId}"]`);
      if (el) {
        el.focus();
      } else {
        state.focusedId = null;
      }
    }
  }

  // ── Keyboard handler ──────────────────────────────────────────────────
  function handleKeydown(e: KeyboardEvent): void {
    const wrapper = state.contentWrapper;
    if (!wrapper) return;

    // Only active when board is in DOM
    if (!document.body.contains(wrapper)) return;

    const hash = window.location.hash.split('?')[0];
    if (hash !== '#/board' && hash !== '' && hash !== '#') return;

    const target = e.target as HTMLElement;
    const inSearch = target.id === 'opp-search';

    // '/' — focus search
    if (e.key === '/' && !inSearch) {
      e.preventDefault();
      const search = document.getElementById('opp-search') as HTMLInputElement | null;
      if (search) search.focus();
      return;
    }

    // Arrow navigation
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !inSearch) {
      e.preventDefault();
      const cards = Array.from(wrapper.querySelectorAll<HTMLElement>('.opp-card'));
      if (cards.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const idx = active ? cards.indexOf(active) : -1;

      let next: HTMLElement;
      if (e.key === 'ArrowDown') {
        next = cards[idx + 1] ?? cards[0];
      } else {
        next = cards[idx - 1] ?? cards[cards.length - 1];
      }
      state.focusedId = next.dataset['id'] ?? null;
      next.focus();
      return;
    }

    // 'p' — toggle pin on focused card
    if (e.key === 'p' && !inSearch) {
      const active = document.activeElement as HTMLElement | null;
      if (active?.classList.contains('opp-card')) {
        const id = active.dataset['id'];
        if (id) {
          state.focusedId = id;
          togglePin(id);
          swap();
        }
      }
      return;
    }

    // 'Enter' — open focused card
    if (e.key === 'Enter' && !inSearch) {
      const active = document.activeElement as HTMLElement | null;
      if (active?.classList.contains('opp-card')) {
        const url = active.dataset['url'];
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  }

  // ── Hash change listener ──────────────────────────────────────────────
  function handleHashChange(): void {
    const hash = window.location.hash.split('?')[0];
    if (hash === '#/board' || hash === '' || hash === '#') {
      swap();
    }
  }

  // ── Mount + cleanup ───────────────────────────────────────────────────
  const contentEl = renderContent();
  state.contentWrapper = h('div', { class: 'board-content' }, contentEl);

  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('hashchange', handleHashChange);

  // Clean up listeners when this view is replaced in the DOM
  const cleanup = (): void => {
    if (state.contentWrapper && !document.body.contains(state.contentWrapper)) {
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('hashchange', handleHashChange);
      observer.disconnect();
    }
  };

  const observer = new MutationObserver(cleanup);

  // Start observing after element is in the DOM
  requestAnimationFrame(() => {
    observer.observe(document.body, { childList: true, subtree: true });
  });

  return h('div', {},
    renderHeader(),
    h('main', { class: 'page-content', id: 'main-content' }, state.contentWrapper),
  );
}
