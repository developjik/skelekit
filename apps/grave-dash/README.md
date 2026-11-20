# SkeleKit Template

A minimal, zero-runtime-dependency TypeScript skeleton for Vite web apps.
One copy of this directory is the entire foundation for a deployable application.

> **15-minute tour** — read this file top to bottom and you will understand everything SkeleKit provides.

---

## Directory tree

```
template/
├── index.html          Entry HTML — mounts #app, loads /src/main.ts
├── package.json        Scripts + devDependencies only (vite, typescript, tsx)
├── tsconfig.json       strict: true, ES2022, DOM lib
├── vite.config.ts      base: './' for GitHub Pages subpath deploy
├── src/
│   ├── theme.css       CSS custom properties — override per app
│   ├── main.ts         Demo shell: wires store + router, shows module cards
│   └── core/           ← copy verbatim into every spawned app; never edit in-app
│       ├── store.ts
│       ├── router.ts
│       ├── loop.ts
│       ├── ui.ts
│       └── assets.ts
└── README.md           ← you are here
```

---

## Core modules

| Module | Exports | One-liner |
|--------|---------|-----------|
| `store.ts` | `createStore<T>(key, initial)` | localStorage-backed reactive state |
| `router.ts` | `createRouter(config)`, `matchRoute(hash, routes)` | Hash router with `:param` segments |
| `loop.ts` | `createLoop(opts)` | Fixed-timestep rAF game loop |
| `ui.ts` | `h(tag, props, ...children)`, `mount`, `clear` | Type-safe DOM factory |
| `assets.ts` | `loadAssets(manifest, onProgress?)` | Preload images + audio |

### `store.ts`

```ts
const score = createStore('score', 0);

score.subscribe(v => console.log('score:', v));
score.set(n => n + 10);   // updater form
score.set(100);            // direct value
score.reset();             // back to 0
score.get();               // read current
```

Data is stored as JSON in `localStorage` under the key `skelekit:<key>`.
Storage failures (quota, private mode) degrade silently to in-memory.

### `router.ts`

```ts
const router = createRouter({
  routes: [
    { path: '#/',         view: ()        => homeView() },
    { path: '#/item/:id', view: ({ id })  => itemView(id) },
  ],
  onNavigate: r => console.log(r.path, r.params),
});

router.start(document.getElementById('app')!);
router.navigate('#/item/42');
router.current(); // → { route, params, path }
```

Unknown hashes fall back to the first route.

### `loop.ts`

```ts
const loop = createLoop({
  stepMs: 16,                          // ~60 Hz fixed update
  update(dt) { player.move(dt); },    // dt in seconds
  render(alpha, fps) { draw(alpha); },
});

loop.start();
loop.pause();
loop.resume();
loop.stop();
```

Accumulated debt is capped at 250 ms to prevent spiral-of-death on tab restore.

### `ui.ts`

```ts
const btn = h('button',
  { class: 'primary', onClick: () => doThing() },
  'Click me',
);

mount(btn, document.getElementById('app')!); // replaces children
clear(someEl);                                // removes all children
```

Event listeners use `on<EventName>` (camelCase after `on`).
Style accepts a partial `CSSStyleDeclaration`.

### `assets.ts`

```ts
const assets = await loadAssets({
  hero:  '/assets/hero.png',
  jump:  '/assets/jump.mp3',
}, (loaded, total) => updateBar(loaded / total));

// assets.hero → HTMLImageElement
// assets.jump → HTMLAudioElement
```

Rejects with the failing key's name if any asset fails. Apps that draw
procedurally can skip this module entirely.

---

## Theme system (`src/theme.css`)

The file defines CSS custom properties consumed everywhere in the app.
Override **only the token values** in your app's copy of `theme.css`.

```css
/* Token reference */
--bg        background colour
--fg        foreground / text
--accent    primary interactive colour
--danger    error / destructive actions
--muted     secondary / disabled text

--font      body typeface stack
--font-mono monospace stack

--radius-sm / --radius / --radius-lg   border radii
--space-1 … --space-8                  4-point spacing scale
```

---

## Spawn an app

1. Copy `template/` to `apps/<your-app>/`:
   ```sh
   cp -r template apps/my-app
   cd apps/my-app
   ```

2. Edit `package.json` — set `"name"` to your app name.

3. Replace `src/theme.css` token values to give your app its visual identity.

4. Replace `src/main.ts` with your app's entry point. Keep `import './theme.css'`
   and wire up the core modules your app uses.

5. Never edit files inside `src/core/`. If a core module needs to change,
   update it in `template/src/core/` and re-copy.

6. Run:
   ```sh
   npm install
   npm run dev      # local dev server
   npm test         # node:test suites
   npm run build    # → dist/ ready for GitHub Pages
   ```

---

## Rules (from the spec)

| Rule | Detail |
|------|--------|
| Zero runtime deps | `node_modules` holds only `vite`, `typescript`, `tsx`, `@types/node` |
| `src/core/` is read-only in apps | Copy verbatim; patch only in `template/` |
| `strict: true` | No `any` in core modules |
| Persistence via store | No direct `localStorage` calls in app code |
| Games use `loop.ts` | Dashboards use `router.ts` + `ui.ts` |
| Keyboard floor | Dashboard: keyboard-operable; Game: controls shown on-screen |

---

## Running the demo

```sh
cd template
npm install
npm run dev      # → http://localhost:5173
npm test
npm run build
```

The demo page renders a card for each core module and a visit counter backed by
`store.ts`, so you can verify localStorage persistence by refreshing the page.
