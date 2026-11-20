# skelekit-core — Tasks

## 1. Scaffold
- [D] 1.1 Create `template/package.json` (name skelekit-template, type module, scripts:
  dev/build/preview/test; devDeps: vite, typescript, tsx, @types/node) — pin caret versions.
- [D] 1.2 Create `template/tsconfig.json` (strict, ES2022, DOM lib, noEmit for check) and
  `template/index.html` (title SkeleKit, `#app`, `/src/main.ts` module script).
- [D] 1.3 Create `template/vite.config.ts` with `base: './'`.
- [D] 1.4 Create `template/src/theme.css` neutral token set + minimal base styles.

## 2. Core modules
- [D] 2.1 Implement `src/core/store.ts` per design (FR-1) + `store.test.ts`.
- [D] 2.2 Implement `src/core/router.ts` per design (FR-2), export pure `matchRoute`,
  + `router.test.ts`.
- [D] 2.3 Implement `src/core/loop.ts` per design (FR-3) + `loop.test.ts` with fake rAF.
- [D] 2.4 Implement `src/core/ui.ts` (FR-4).
- [D] 2.5 Implement `src/core/assets.ts` (FR-5).

## 3. Shell & docs
- [D] 3.1 Implement `src/main.ts` demo index: renders module cards (name + one-liner),
  uses router with `#/` only, store-backed visit counter to prove persistence.
- [D] 3.2 Write `template/README.md`: 15-minute tour (tree, module table, spawn-an-app steps).

## 4. Verify
- [D] 4.1 `npm install && npm test && npm run build` green inside `template/`.
- [D] 4.2 `tsc --noEmit` clean; no `any` in core.
- [D] 4.3 Commit with message `feat(template): skelekit core skeleton (spec: skelekit-core)`.
