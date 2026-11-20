/**
 * ui.ts — lightweight DOM helpers.
 *
 * Usage:
 *   const btn = h('button', { class: 'primary', onClick: () => alert('hi') }, 'Click me');
 *   mount(btn, document.getElementById('app')!);
 */

// ── Types ─────────────────────────────────────────────────────────────────

type EventMap = HTMLElementEventMap;
type OnListeners = {
  [K in keyof EventMap as `on${Capitalize<string & K>}`]?: (e: EventMap[K]) => void;
};

export type Props = OnListeners & {
  class?: string;
  style?: Partial<CSSStyleDeclaration>;
  dataset?: Record<string, string>;
  [attr: string]: unknown;
};

export type Child = Node | string | null | undefined | false;

// ── h() ───────────────────────────────────────────────────────────────────

/**
 * Create a typed HTML element.
 *
 * @param tag   Any valid HTML tag name.
 * @param props Optional props: class, style, dataset, on* listeners, or arbitrary attributes.
 * @param children Node | string | null | undefined | false — falsy values are skipped.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Props | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined) continue;

      if (key === 'class') {
        el.className = value as string;
      } else if (key === 'style') {
        Object.assign(el.style, value);
      } else if (key === 'dataset') {
        for (const [dk, dv] of Object.entries(value as Record<string, string>)) {
          el.dataset[dk] = dv;
        }
      } else if (/^on[A-Z]/.test(key)) {
        // e.g. onClick → click
        const event = key[2].toLowerCase() + key.slice(3) as keyof EventMap;
        el.addEventListener(event, value as EventListener);
      } else {
        el.setAttribute(key, String(value));
      }
    }
  }

  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }

  return el;
}

// ── mount() ───────────────────────────────────────────────────────────────

/**
 * Replace all children of `target` with `node`.
 */
export function mount(node: Node, target: HTMLElement): void {
  target.replaceChildren(node);
}

// ── clear() ───────────────────────────────────────────────────────────────

/**
 * Remove all children from `el`.
 */
export function clear(el: HTMLElement): void {
  el.replaceChildren();
}
