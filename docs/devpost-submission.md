# Devpost submission draft — SkeleKit (Kiroween 2026 · Skeleton Crew)

> 제출 폼에 그대로 붙여 넣을 수 있는 영문 초안. `[ ]` 항목은 제출 시점에 채우기.
> 마감: 2026-12-04 (D-13) · https://kiroween.devpost.com/

## Links

| Field | Value |
|---|---|
| GitHub repo | https://github.com/developjik/skelekit |
| Demo (landing) | https://developjik.github.io/skelekit/ |
| Demo — Grave Dash | https://developjik.github.io/skelekit/grave-dash/ |
| Demo — OppBoard | https://developjik.github.io/skelekit/oppboard/ |
| Video | `[x] 완성 — 무음+자막 1:54 · mp4: [Release demo-video-v1](https://github.com/developjik/skelekit/releases/tag/demo-video-v1) · 자막: docs/demo-subtitles.srt → YouTube 업로드만 남음 |

## Title / Tagline

- **Title:** SkeleKit — one skeleton, very different apps
- **Tagline:** A spec-driven skeleton template where Kiro agents spawn a canvas game and a data dashboard from the same untouched core.

## Description (paste into Devpost)

### Inspiration

Every project starts the same way: copy last year's skeleton, then hack it until nothing is recognizable. The skeleton rots, and the "conventions" live only in one person's head. For the *Skeleton Crew* category we asked the opposite question: **what if the skeleton is the product, and the apps are just proofs?**

A skeleton works only if very different apps can grow from it *without touching it*. So we picked the two most different apps we could imagine — a one-button canvas arcade game and a deadline-tracking data dashboard — and required them to share one byte-identical core.

### What it does

SkeleKit is a spec-driven skeleton template for shipping deployable web apps with **Kiro**:

- **`template/`** — a zero-runtime-dependency skeleton (Vite + vanilla TypeScript) with five app-agnostic core modules: `store` (typed reactive state), `router` (hash routes + query), `loop` (fixed-timestep rAF loop), `ui` (DOM builder), `assets` (loader with cache).
- **App 1 — Grave Dash:** a spooky one-button arcade game (canvas renderer, physics, parallax, audio, touch) built on `loop`.
- **App 2 — OppBoard:** a developer-opportunity deadline board (hash-router filters, D-day logic, pin persistence, keyboard nav, a curated dataset of ~40 real entries) built on `store`/`router`/`ui` — it never imports `loop`.

Both apps were **generated entirely by Kiro agents executing spec packs** under `.kiro/specs/`. No application code was hand-written. After both builds, `diff -r template/src/core apps/*/src/core` reports **byte-identical core modules** — neither app patched the skeleton. That diff is the submission.

### How we built it

```
steering docs ──► spec packs (.kiro/specs/*) ──► Kiro agents execute tasks ──► apps + template
   (3 files)      requirements/design/tasks       (all code, tests, builds)      (committed)
```

1. **Steering first.** `.kiro/steering/{product,tech,structure}.md` define the stack and one hard layout contract: `src/core/` is app-agnostic; an app may only override `src/theme.css`.
2. **Specs, not code.** Three hand-authored spec packs (the product thinking): `skelekit-core`, `app-grave-dash`, `app-oppboard`.
3. **Kiro executed every task.** Each `tasks.md` ran through `kiro-cli chat --no-interactive` with one instruction set: read steering + spec, execute tasks in order, flip `[P]→[D]` markers, keep install/test/build green, commit. The agent produced the template (commit `e1ea29f`), the game (`f4e63c9`), and the board (`1f47435`) — 27 core unit tests plus 43 per app, all green, `tsc` strict.
4. **Verification was adversarial.** We played the game, filtered/pinned/refreshed the board, and diffed the cores byte-for-byte. The flipped `[D]` markers in every `tasks.md` are the agent's own breadcrumbs.

### Challenges we ran into

- **Making "don't touch the core" enforceable, not aspirational.** The spec had to be precise enough that a game and a dashboard both fit `store`/`router`/`loop`/`ui` unchanged — byte-identical diff or the thesis fails.
- **Spec-writing discipline.** The dataset spec (102 raw feed entries → ~40 curated rows with parsed deadlines, prizes, AI-policy) took as long as a typical implementation, because the agent only ever knows what the spec says.
- **One loop, two very different consumers.** The game needs a fixed-timestep loop; the board must never boot it. Keeping `loop.ts` optional-but-core shaped the whole module API.

### Accomplishments we're proud of

- `diff -r template/src/core apps/*/src/core` → **0 differences**, twice.
- 113 automated tests green (core 27, each app 43) with zero runtime dependencies.
- Both apps deployed and manually verified end-to-end: gameplay → death → best-score persistence; filter → shareable hash URL → pin → refresh persistence.

### What we learned

A skeleton succeeds when its contract is explicit enough for an agent to obey blindly. Handing implementation to Kiro pushed all the design decisions into the specs — which is exactly where they should live. The specs became clearer *because* there was no "I'll just fix it in code" escape hatch.

### What's next for SkeleKit

- A third spawn (a form/CRUD app) to stress the `store` module's third use case.
- Template consumability: `template/README.md` as a 15-minute tour, `degit`-style scaffolding.
- A CI check that fails if any app's `src/core/` drifts from the template.

### Built with

`typescript` `vite` `javascript` `html` `css` `kiro` `node.js` `github-pages`

## Submission checklist

- [ ] Team: solo (본인 계정) — 팀원 추가 필요 없음
- [ ] Opt-ins: "Additional prize categories" 해당 시만 체크
- [ ] Upload 5 screenshots (`docs/screenshots/`) — 순서: landing → game title → game over → board → filter
- [x] 데모 영상 제작 (무음+자막, 1:54 1080p) — [mp4 릴리스](https://github.com/developjik/skelekit/releases/tag/demo-video-v1), 자막 `docs/demo-subtitles.srt`
- [ ] YouTube 업로드 후 Links에 반영 (Devpost 임베드용; 업로드 없이 mp4 직접 링크도 가능)
- [x] 제출 전 최종 배포 확인 — Pages 3본 200 (landing/grave-dash/oppboard) + 릴리스 mp4 200 · 2026-11-21
- [ ] Submit 누른 뒤 이메일/대시보드에서 "Submitted" 확인

## Screenshots (docs/screenshots/)

| File | Shot |
|---|---|
| `01-landing.png` | SkeleKit 랜딩 — 두 앱 카드 |
| `02-grave-dash-title.png` | 게임 타이틀 화면 |
| `03-grave-dash-gameover.png` | 게임오버 + NEW BEST (점수 저장 증명) |
| `04-oppboard-board.png` | 보드 전체 — 통계/필터/D-day |
| `05-oppboard-filter-hackathon.png` | 해커톤 필터 + pressed 칩 (해시 URL 공유) |
