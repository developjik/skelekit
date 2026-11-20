/**
 * header.ts — shared site header with logo and nav links.
 */
import { h } from '../core/ui.js';

export function renderHeader(): HTMLElement {
  const hash = window.location.hash.split('?')[0] || '#/board';

  const nav = h('nav', { class: 'site-nav', 'aria-label': 'Main navigation' },
    h('a', {
      href: '#/board',
      class: `nav-link${hash === '#/board' || hash === '' ? ' nav-link--active' : ''}`,
    }, 'Board'),
    h('a', {
      href: '#/about',
      class: `nav-link${hash === '#/about' ? ' nav-link--active' : ''}`,
    }, 'About'),
  );

  return h('header', { class: 'site-header', role: 'banner' },
    h('a', { href: '#/board', class: 'site-logo', 'aria-label': 'OppBoard home' },
      h('span', { class: 'site-logo-icon', 'aria-hidden': 'true' }, '📋'),
      h('span', {}, 'OppBoard'),
    ),
    nav,
  );
}
