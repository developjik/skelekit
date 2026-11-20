/**
 * router.ts — hash-based client-side router.
 *
 * Usage:
 *   const router = createRouter({
 *     routes: [
 *       { path: '#/', view: () => h('div', {}, 'Home') },
 *       { path: '#/item/:id', view: ({ id }) => h('div', {}, id) },
 *     ],
 *     onNavigate: r => console.log(r),
 *   });
 *   router.start(document.getElementById('app')!);
 */

export interface Route {
  path: string;
  view: (params: Record<string, string>) => HTMLElement;
}

export interface Resolved {
  route: Route;
  params: Record<string, string>;
  path: string;
}

export interface RouterConfig {
  routes: Route[];
  onNavigate?: (resolved: Resolved) => void;
}

export interface Router {
  /** Mount the router; renders the initial view and starts listening to hashchange. */
  start(target: HTMLElement): void;
  /** Navigate programmatically (updates window.location.hash). */
  navigate(path: string): void;
  /** Return the currently rendered route. */
  current(): Resolved;
}

// ── Pure matching helper (exported for tests) ─────────────────────────────

/**
 * Match `hash` against `routes`.
 * `hash` should be the full hash string, e.g. `#/item/42`.
 * Returns the first match, or `null`.
 */
export function matchRoute(
  hash: string,
  routes: Route[],
): { route: Route; params: Record<string, string> } | null {
  // Normalise: remove leading '#' so we compare path segments
  const incoming = hash.startsWith('#') ? hash.slice(1) : hash;
  const incomingParts = incoming.split('/').filter(Boolean);

  for (const route of routes) {
    const pattern = route.path.startsWith('#') ? route.path.slice(1) : route.path;
    const patternParts = pattern.split('/').filter(Boolean);

    if (patternParts.length !== incomingParts.length) continue;

    const params: Record<string, string> = {};
    let match = true;

    for (let i = 0; i < patternParts.length; i++) {
      const pp = patternParts[i];
      const ip = incomingParts[i];
      if (pp.startsWith(':')) {
        params[pp.slice(1)] = decodeURIComponent(ip);
      } else if (pp !== ip) {
        match = false;
        break;
      }
    }

    if (match) return { route, params };
  }

  return null;
}

// ── Router factory ────────────────────────────────────────────────────────

export function createRouter(config: RouterConfig): Router {
  const { routes, onNavigate } = config;

  if (routes.length === 0) {
    throw new Error('createRouter: at least one route is required');
  }

  let resolved: Resolved = resolveHash(window.location.hash);
  let mountTarget: HTMLElement | null = null;

  function resolveHash(hash: string): Resolved {
    const result = matchRoute(hash || '#/', routes);
    if (result) {
      return { ...result, path: hash };
    }
    // fallback to first route
    return { route: routes[0], params: {}, path: routes[0].path };
  }

  function render(): void {
    if (!mountTarget) return;
    const el = resolved.route.view(resolved.params);
    // Replace children without touching the target element itself
    mountTarget.replaceChildren(el);
    onNavigate?.(resolved);
  }

  function handleHashChange(): void {
    resolved = resolveHash(window.location.hash);
    render();
  }

  return {
    start(target: HTMLElement): void {
      mountTarget = target;
      window.addEventListener('hashchange', handleHashChange);
      resolved = resolveHash(window.location.hash);
      render();
    },

    navigate(path: string): void {
      // Ensure path starts with '#'
      window.location.hash = path.startsWith('#') ? path : '#' + path;
    },

    current(): Resolved {
      return resolved;
    },
  };
}
