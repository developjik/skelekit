# app-grave-dash — Requirements

## Overview
**Grave Dash** — a spooky one-button arcade web game, App 1 grown from the SkeleKit skeleton
(Kiroween 2026, Skeleton Crew). A ghost sprints through a graveyard; one input makes it hop.
Survive, collect skulls, chase the high score.

## Functional requirements
1. **FR-1 One-button control** — Space / click / tap = hop. The only input in the game.
2. **FR-2 Core loop** — the ghost auto-runs; gravestones and gates spawn as obstacles;
   collision ends the run. Hop height is fixed; timing is the whole game.
3. **FR-3 Skulls & score** — floating skulls appear in hoppable arcs; collecting one adds
   +50. Score ticks up with distance (10 per second of survival).
4. **FR-4 Speed ramp** — world speed increases every 15s up to a cap; a brief screen flash
   announces each tier.
5. **FR-5 High score** — persisted via the skeleton store; shown on the title and game-over
   screens ("Best").
6. **FR-6 Screens** — Title (title art, "press space / tap to start", best score) → Run →
   Game over (score, best, restart hint). All rendering is procedural canvas — no image assets.
7. **FR-7 Spooky costume** — the app's `theme.css` override turns the skeleton neutral into a
   Halloween night palette (deep purple sky, moon, fog parallax layers, orange accent); fonts
   via system stack with a spooky weight/letter-spacing treatment.
8. **FR-8 Pause & focus** — pressing `P` or blurring the tab pauses; on-screen hint states
   controls (accessibility floor per tech steering).
9. **FR-9 Audio (stretch)** — tiny WebAudio bleeps for hop/collect/death, generated
   procedurally; starts muted-by-default with an `M` toggle remembered in the store.

## Non-functional
- NFR-1 Runs from `dist/` on GitHub Pages subpath; 60fps on a 2018 laptop; canvas letterboxed
  to a fixed 16:9 logical resolution (960×540) scaled to viewport.
- NFR-2 Uses ONLY `loop.ts`, `store.ts`, `ui.ts` from core; router used for screens
  (`#/title`, `#/run`, `#/over`) so the dashboard-style screens remain shareable URLs.
- NFR-3 No `core/` modifications. If blocked, escalate per tech steering rule 2.
- NFR-4 Full run video-game feel with zero image/audio asset files.

## Out of scope
Multiplayer, accounts, levels beyond speed tiers, mobile-native packaging.
