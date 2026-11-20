# app-oppboard — Tasks

## 1. Spawn from skeleton
- [P] 1.1 Copy `template/` → `apps/oppboard/`; rename package; verify dev/build/test run.
- [P] 1.2 Override `src/theme.css` (board palette, mono numerals).
- [P] 1.3 Router shell: `#/board` (default) + `#/about`; header + nav.

## 2. Data
- [P] 2.1 Author `src/data/opportunities.json`: **copy the curated snapshot attachment
   `.kiro/specs/app-oppboard/data/opportunities.json` (40 real entries, Nov 2026 feed)
   verbatim** and add the `updatedAt` field (`2026-11-20`). Do not hand-edit entries.
- [P] 2.2 `loadOpportunities()` validator + `dday()` KST helper + tests (design Test section).

## 3. Board
- [P] 3.1 Stats strip (FR-6).
- [P] 3.2 Toolbar: type chips + search writing hash query (FR-3).
- [P] 3.3 Card list: pinned → open → closed sections (FR-2/FR-4), D-day chips (FR-5).
- [P] 3.4 Keyboard map `/`, ↑/↓, Enter, `p` (FR-8).
- [P] 3.5 `#/about` view (FR-7).

## 4. Verify
- [P] 4.1 `npm test` green (data + dday).
- [P] 4.2 `npm run build` smoke-open from subpath; hash filters shareable and restorable.
- [P] 4.3 Commit `feat(oppboard): App 2 from skelekit (spec: app-oppboard)`.
