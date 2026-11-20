# app-grave-dash — Design

## Spawn
Copy `template/` → `apps/grave-dash/` (core copied verbatim), rename package
`skelekit-app-grave-dash`, override `src/theme.css`.

## World model (logical 960×540, ground y=470)
- **Ghost player** x=180, on ground; `vy` in px/s; gravity 2600 px/s²; hop vy=-880 (fixed).
  Drawn procedurally: rounded body, wavy skirt, eyes; squash on landing.
- **Obstacles** — gravestone (w 46, h 64) and low gate (w 90, h 40, must hop through gap above).
  Spawn timer scales with world speed: interval = clamp(1.6 − tier*0.15, 0.75, 1.6)s.
- **Skulls** — spawn in arcs above obstacle gaps; r=14; +50 on collect; bob sinusoidally.
- **Ground/fog parallax** — 3 layers (far fog 0.2×, mid trees 0.5×, ground 1×); moon fixed.
- **Speed** — starts 320 px/s; +60 every 15s; cap 740. Tier-up flash 300ms.

## Collision
AABB vs player box (34×40, inset 6px). Death → freeze frame 400ms → `#/over`.

## Screens (router views; canvas swapped for DOM screens via ui.ts)
- `#/title` — DOM: logo text, best score (store `gd:best`), "Space / Tap to start", mute hint.
- `#/run` — canvas element; loop started on enter, stopped on leave/death.
- `#/over` — DOM: score, best (updated), "Space / Tap to restart" → `#/run`.
Global keydown/touch/pointer handler routes the one-button input by current screen.

## State (store keys)
- `gd:best` number — high score.
- `gd:muted` boolean — audio toggle (FR-9).

## Audio (stretch, FR-9)
WebAudio osc envelopes: hop (square 300→420Hz 80ms), collect (sine 660→990 120ms),
death (saw 220→60 400ms). Created lazily on first user gesture.

## Test additions
- `hop-phys.test.ts`: gravity/hop math is pure (`simulateHop(dt)`) — apex ≈ 148px, airtime ≈ 0.68s.
- Spawner bounds: interval within clamp for tiers 0..6.
