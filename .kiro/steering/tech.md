# SkeleKit — Tech Steering

## Stack
- **Runtime:** vanilla TypeScript + DOM/Canvas. **Zero npm runtime dependencies.**
- **Build:** Vite (devDependency only). Static output to `dist/`.
- **Deploy:** GitHub Pages (project pages, subpath base `./`).
- **Tests:** `node:test` via `tsx` (devDependency) for `template/src/core/*`.

## Layout contract
```
template/            the skeleton (copied to spawn an app)
  src/core/          store.ts, router.ts, loop.ts, ui.ts, assets.ts  (never app-specific)
  src/main.ts        app entry (replaced per app)
  src/theme.css      CSS custom properties every app overrides ("costume")
apps/<name>/         an application generated from template/ by a Kiro spec
```

## Rules
1. `template/src/core/**` must stay app-agnostic. If a module needs to know about games or
   boards, it belongs in the app.
2. Each app overrides `src/theme.css` tokens only — it may not edit `core/`. If `core/` must
   change, the change is made once in `template/` and re-copied (documented in the spec).
3. TypeScript `strict: true`. No `any` in core modules.
4. Persistence goes through `store.ts` (localStorage adapter) — no direct `localStorage` calls
   in apps.
5. Games use `loop.ts` (fixed-timestep update, rAF render). Dashboards use `router.ts` +
   `ui.ts`. Both may use `store.ts` and `assets.ts`.
6. Accessibility floor: keyboard operability for the dashboard; the game states its controls
   on-screen.
