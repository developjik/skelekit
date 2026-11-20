# app-grave-dash — Tasks

## 1. Spawn from skeleton
- [D] 1.1 Copy `template/` → `apps/grave-dash/`; rename package; verify dev/build/test run.
- [D] 1.2 Override `src/theme.css` with Halloween palette (FR-7) and title typography.
- [D] 1.3 Replace `main.ts` demo with router shell: `#/title`, `#/run`, `#/over` (FR-6).

## 2. Game core
- [D] 2.1 Canvas stage: letterbox scaling of 960×540 to viewport; resize handling.
- [D] 2.2 Player ghost + hop physics + squash animation (FR-1/FR-2), pure physics helper
  exported for tests.
- [D] 2.3 Parallax background (fog/trees/moon/ground) drawn procedurally (FR-7).
- [D] 2.4 Obstacle spawner (gravestones + gates) with speed-tier scaling (FR-2/FR-4).
- [D] 2.5 Skull pickups + score system + HUD (FR-3).
- [D] 2.6 Collision → death sequence → `#/over`; best-score persistence (FR-5).
- [D] 2.7 Title & game-over screens with best score and one-button restart (FR-6).

## 3. Feel & polish
- [D] 3.1 Tier-up flash + gentle screen shake on death.
- [D] 3.2 Pause on `P`/blur with on-screen hint (FR-8).
- [D] 3.3 Audio bleeps with mute toggle persisted (FR-9, drop cleanly if time-boxed).
- [D] 3.4 Touch/mouse: full game playable on a phone (buttons big enough, no zoom on tap).

## 4. Verify
- [D] 4.1 `hop-phys.test.ts` + spawner bounds test pass in `npm test`.
- [D] 4.2 `npm run build` → smoke-open `dist/index.html`; hash routes work from subpath.
- [D] 4.3 Commit `feat(grave-dash): App 1 from skelekit (spec: app-grave-dash)`.
