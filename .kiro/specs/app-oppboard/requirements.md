# app-oppboard — Requirements

## Overview
**OppBoard** — a deadline board for developer opportunities (hackathons, contests, jobs),
App 2 grown from the SkeleKit skeleton. Same bones as the arcade game, opposite personality:
keyboard-first productivity UI. Data is a bundled snapshot of a public opportunity feed.

## Functional requirements
1. **FR-1 Dataset** — `src/data/opportunities.json` ships ~40 real entries (title, host, type
   `hackathon|contest|job`, url, prize string, deadline ISO, region tags). Loader validates
   shape and drops malformed rows at build/test time (not at runtime).
2. **FR-2 Board view (`#/board`)** — cards sorted by deadline ascending; each card: title,
   host, type chip, D-day chip (D-9 / D-2 / "마감"), prize line, external link. Past deadlines
   collapse into a dimmed "Closed" section at the bottom.
3. **FR-3 Filters (`#/board?type=&q=`)** — type filter chips (All/Hackathon/Contest/Job) and a
   search box over title+host; both reflected in the hash so views are shareable.
4. **FR-4 Pins** — star any card; pinned items float to top. Persisted via store (`ob:pins`).
5. **FR-5 Deadline sort & countdown** — D-day computed in KST (Asia/Seoul) from ISO deadline;
   chip colors: D≥7 calm, 3≤D<7 warning, D<3 danger, past muted.
6. **FR-6 Stats strip** — counts by type, nearest deadline, pinned count.
7. **FR-7 About view (`#/about`)** — one screen: what this is, data source note, Kiro spec link.
8. **FR-8 Keyboard** — `/` focuses search, arrow keys move card focus, Enter opens link,
   `p` pins the focused card. Focus ring visible.

## Non-functional
- NFR-1 Uses ONLY `store.ts`, `router.ts`, `ui.ts` from core (no canvas/loop use — proving the
  modules are optional, not mandatory).
- NFR-2 Zero runtime deps; renders full dataset (40 rows) without virtualization jank.
- NFR-3 Works from GitHub Pages subpath; Korean data strings render as-is, UI labels English.
- NFR-4 No `core/` modifications (tech steering rule 2).

## Out of scope
Live refresh (it's a snapshot), auth, multi-user, i18n framework.
