# skelekit-core — Requirements

## Overview
The SkeleKit template: a minimal, zero-runtime-dependency TypeScript web app skeleton that any
Kiro spec can spawn an application from.

## Functional requirements
1. **FR-1 State store** — `createStore<T>(key, initial)` returns `{ get, set, subscribe, reset }`
   and transparently persists to `localStorage` under `skelekit:<key>`.
2. **FR-2 Hash router** — `createRouter(routes)` maps `#/path` to registered views, supports
   `:params`, exposes `navigate()` and fires `onNavigate` listeners. Falls back to the first route.
3. **FR-3 Fixed-timestep loop** — `createLoop({ update, render, stepMs })` runs `update` at a
   fixed step (accumulator pattern) and `render` on every animation frame; supports
   start/stop/pause and reports FPS.
4. **FR-4 DOM helpers** — `h(tag, props, ...children)` element factory plus `mount(el, target)`
   and a `clear(el)` helper. Type-safe props (event listeners, styles, attributes).
5. **FR-5 Asset loader** — `loadAssets(manifest)` preloads images/audio with a progress
   callback; returns typed records. (Apps may stub it out if they draw procedurally.)
6. **FR-6 Theme system** — `theme.css` defines CSS custom properties (`--bg`, `--fg`, `--accent`,
   `--danger`, `--font`, radii, spacing). The template ships a neutral theme; apps override it.
7. **FR-7 App shell** — `index.html` + `src/main.ts` wires store+router and renders a demo
   index view listing the skeleton's modules. `npm run dev` shows it.

## Non-functional requirements
- NFR-1 Zero runtime npm dependencies; devDependencies only (vite, typescript, tsx).
- NFR-2 `tsc --noEmit` clean under `strict: true`; no `any` in `src/core/`.
- NFR-3 `npm test` runs `node:test` suites for store, router, loop (headless, DOM-free tests
   where possible; loop uses a fake clock).
- NFR-4 A developer unfamiliar with the repo understands the skeleton from `template/README.md`
   in ~15 minutes.
- NFR-5 `npm run build` emits a self-contained `dist/` that works when opened from a subpath
   (GitHub Pages), i.e. `base: './'`.

## Out of scope
- App-specific features (they live in app specs).
- SSR, i18n, component frameworks.
