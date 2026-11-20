# app-oppboard — Design

## Spawn
Copy `template/` → `apps/oppboard/`; rename `skelekit-app-oppboard`; override `theme.css`
(dark slate board, mono numerals for D-days — the "anti-costume": calm, dense, readable).

## Data
`src/data/opportunities.json`: array of
`{ id, title, host, type: "hackathon"|"contest"|"job", url, prize, deadline: ISO8601, tags: string[] }`.
`src/data/index.ts` exports `loadOpportunities(): Opportunity[]` (validated, malformed rows
dropped, sorted by deadline) and `dday(deadline: string, now = Date.now()): number`
(KST-aware: compute date parts in Asia/Seoul via `toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })`
date-diff, so D-day matches what a Korean user sees).

## Views (router)
- `#/board` (default) — header (logo, stats strip), toolbar (type chips + search input),
  pinned section, open list, closed section (collapsed, `<details>`).
- `#/about` — static content.
Query state (`type`, `q`) parsed from hash after `?`; filter chips and search input write the
hash (single source of truth), router re-renders on hashchange.

## Rendering
- `ui.ts` h() builds the whole DOM; no innerHTML with data (safe by construction).
- Card component: `cardView(opp, pinned, focused)`; list re-rendered on store/hash change;
  focus preserved by `data-id` + `el.focus()` after render when a card was focused.
- D-day chip classes: `dday--calm|warn|danger|closed`.

## State
- `ob:pins` — `string[]` of ids (store-backed).
- Nothing else persisted; filters live in the hash.

## Keyboard map (FR-8)
Global keydown when `#/board`: `/` → focus search; in card list: ↑/↓ move focus, Enter opens
url in new tab (`rel=noopener`), `p` toggles pin on focused card.

## Tests
- `data.test.ts`: dataset validates (40±), sorted ascending, all urls https, deadlines parse.
- `dday.test.ts`: KST boundary — deadline `2026-11-21T23:59:00+09:00` vs `2026-11-20T21:00:00Z`
  → D-1; same moment expressed in UTC gives the same D-day.
