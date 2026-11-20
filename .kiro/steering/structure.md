# SkeleKit — Structure Steering

## Repository map
```
.kiro/
  steering/          product.md, tech.md, structure.md (this file)
  specs/
    skelekit-core/   the skeleton itself: requirements.md, design.md, tasks.md
    app-grave-dash/  App 1 spec pack
    app-oppboard/    App 2 spec pack
  hooks/             Kiro automation hooks
template/            the skeleton code (single source for core/)
apps/
  grave-dash/        App 1 — spooky one-button arcade game
  oppboard/          App 2 — opportunity deadline board
docs/                write-ups (Kiro usage story for the submission)
```

## Conventions
- App directories are self-contained Vite projects (`index.html`, `src/`, `package.json`).
- Shared code lives in `template/src/core/` and is **copied verbatim** into each app's
  `src/core/` at spawn time; afterwards apps never patch it (see tech.md rule 2).
- Spec numbering: `1.x` scaffold, `2.x` core features, `3.x` polish, `4.x` verify/deploy.
- Every task in `tasks.md` uses `[P]` (planned) / `[I]` (in progress) / `[D]` (done) markers;
  Kiro updates them as it works.
