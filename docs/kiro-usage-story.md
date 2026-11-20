# How SkeleKit was built with Kiro

This repo is the submission for **Kiroween 2026 — Skeleton Crew**: build one skeleton
template and spawn two different apps from it to prove the skeleton's versatility.
Everything below is the actual story of how Kiro produced this repository — no step was
hand-written application code.

## The workflow

```
steering docs ──► spec packs (.kiro/specs/*) ──► Kiro agents execute tasks ──► apps + template
   (3 files)         requirements/design/tasks        (all code, tests, builds)      (committed)
```

1. **Steering first.** `.kiro/steering/{product,tech,structure}.md` define what the skeleton
   is, the stack (vanilla TS, zero runtime deps), and one hard layout contract:
   `template/src/core/` is app-agnostic and apps may only override `src/theme.css`.

2. **Specs, not code.** Three spec packs were authored by hand on purpose — they are the
   product thinking:
   - `skelekit-core` — the skeleton itself (store / router / loop / ui / assets + tests)
   - `app-grave-dash` — App 1, a canvas arcade game
   - `app-oppboard` — App 2, a DOM deadline dashboard

3. **Kiro executed every task.** Each pack's `tasks.md` was handed to a Kiro agent
   (`kiro-cli chat --no-interactive`) with exactly one instruction set: *read the steering
   docs and the spec pack, execute tasks in order, flip `[P]→[D]` markers as you finish,
   run install/test/build until green, commit.* The agent:
   - scaffolded `template/` and implemented all five core modules with 27 unit tests
     (`store` 10, `router` 9, `loop` 8) — commit `e1ea29f`;
   - spawned `apps/grave-dash/` from the template and built the full game (physics,
     parallax renderer, spawner, audio, touch support, its own tests) — commit `f4e63c9`;
   - spawned `apps/oppboard/` and built the board (dataset validator, KST D-day logic,
     hash-query filters, pin persistence, keyboard map, its own tests) — commit `1f47435`.

4. **The rule that proves it.** After both app builds, `diff -r template/src/core
   apps/*/src/core` reports byte-identical core modules: neither app patched the skeleton.
   Each app's personality lives only in its own files and `theme.css` costume. The game uses
   `loop.ts`; the dashboard never touches it — one skeleton, two very different bodies.

## Where Kiro is visible

- Every `tasks.md` in `.kiro/specs/` carries `[D]` markers flipped by the agent as it worked.
- Each feature commit message references the spec that produced it.
- `docs/` (this file) and the two spec packs are the only hand-authored prose; the apps'
  `src/` directories are entirely agent output executed against those specs.

## Try the pattern yourself

Read `template/README.md` (a 15-minute tour), copy `template/`, write a three-file spec
pack, and let Kiro run it. If a game and a job board can both grow from the same bones
without touching them, your app can too.
