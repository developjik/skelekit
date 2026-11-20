# skelekit-core — Design

## Modules (template/src/core/)

### store.ts
```ts
createStore<T>(key: string, initial: T): Store<T>
interface Store<T> {
  get(): T
  set(next: T | ((cur: T) => T)): void
  subscribe(fn: (v: T) => void): () => void   // returns unsubscribe
  reset(): void
}
```
- Reads `localStorage['skelekit:'+key]` on creation (falls back to `initial` when absent/corrupt).
- Writes on every `set` (JSON). Subscribers are called synchronously on set.
- Storage failures (quota, disabled) must not throw: degrade to in-memory.

### router.ts
```ts
createRouter(config: { routes: Route[]; onNavigate?: (r: Resolved) => void }): Router
interface Route { path: string; view: (params: Record<string,string>) => HTMLElement }
interface Router { start(target: HTMLElement): void; navigate(path: string): void; current(): Resolved }
```
- Matching: exact segments; `:name` captures one segment. First match wins.
- Listens to `hashchange`. Unknown hash → first route.

### loop.ts
```ts
createLoop(opts: { stepMs: number; update(dt: number): void; render(alpha: number, fps: number): void }): Loop
interface Loop { start(): void; stop(): void; pause(): void; resume(): void; running(): boolean }
```
- Accumulator fixed-timestep; caps accumulated debt at 250ms (spiral-of-death guard).
- `dt` passed to update in **seconds**. `render` receives interpolation alpha and rolling FPS.

### ui.ts
- `h(tag, props?, ...children)` — props: `class`, `style` (partial), `dataset`, `on*` listeners,
  arbitrary attributes; children: Node | string | null | undefined (falsy skipped).
- `mount(node, target)` (replaces content), `clear(el)`.

### assets.ts
- `loadAssets<T extends Record<string, string>>(manifest: T): Promise<{ [K in keyof T]: HTMLImageElement | HTMLAudioElement }>`
  plus `onProgress(loaded, total)` hook. Failures reject with the failing key.

### theme.css + shell
- `:root` token block (bg, fg, accent, danger, muted, font, radius, spacing).
- `index.html` mounts `#app`; `main.ts` builds the demo index (module list + links to specs).

## Testing approach
- `store.test.ts`: set/get/subscribe/persist/reset; corrupt JSON falls back.
- `router.test.ts`: matching, params, fallback (jsdom-free — router logic is pure; DOM views
  stubbed with a fake element factory injected via `createRouterPure`? No — keep it simple:
  test only `matchRoute(path, routes)` which is exported and pure).
- `loop.test.ts`: fake rAF + fake clock drives 3 steps → update called 3 times with stepMs/1000.

## Trade-offs
- localStorage-on-every-set is O(payload) per write; acceptable for app-sized state (<100KB).
- Hash routing only (no History API) to keep static hosting trivial.
- No reactive DOM binding: apps re-render views on subscribe callbacks explicitly.
