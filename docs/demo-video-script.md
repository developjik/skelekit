# Demo video script — SkeleKit (target 2:15–2:30)

> 3막 구성. 화면(녹화 지점) + 내레이션(읽는 대본). 모든 화면은 배포된 URL에서.
> 권장 녹화: QuickTime 화면녹화 1920×1080 · 브라우저 창만 · 마우스는 천천히.

## Act 1 — The thesis (0:00–0:35)

| Time | Screen | Narration |
|---|---|---|
| 0:00 | `developjik.github.io/skelekit/` 랜딩 | "Every hackathon starts with a skeleton. SkeleKit asks: what if the skeleton *is* the product?" |
| 0:08 | 랜딩에서 두 앱 카드 위로 마우스 이동 | "One template — and two apps as different as they get: a canvas arcade game, and a deadline dashboard." |
| 0:18 | Grave Dash 타이틀 화면 클릭 → 게임 오버까지 플레이 | "A one-button game — physics, parallax, audio, best-score persistence…" |
| 0:28 | 탭 전환 → OppBoard 보드 | "…and a data board — real deadlines, D-day counts, shareable filter URLs, pinned entries. Same bones." |

## Act 2 — How: specs in, Kiro out (0:35–1:25)

| Time | Screen | Narration |
|---|---|---|
| 0:35 | GitHub repo — `.kiro/steering/` 3개 파일 스크롤 | "It starts with steering docs: what the skeleton is, and one hard rule — apps may override `theme.css` only, never `core/`." |
| 0:47 | `.kiro/specs/` 폴더 → `app-grave-dash/requirements.md` 스크롤 | "Each app is a three-file spec pack: requirements, design, tasks. This is the only thing we wrote by hand." |
| 0:59 | `tasks.md` — `[D]` 마커 몇 개 보여주기 | "Kiro executed every task — the flipped markers are the agent's own breadcrumbs, and every feature commit references its spec." |
| 1:10 | 터미널: `diff -r template/src/core apps/oppboard/src/core` → 무출력, `echo $?` → `0` | "The proof: after both apps were built, the core modules are byte-identical. Zero drift. Neither app patched the skeleton." |
| 1:20 | 터미널: `npm test` (template) → `pass 27` 스크롤 | "Twenty-seven core tests, forty-three more in each app — all green, strict TypeScript, zero runtime dependencies." |

## Act 3 — The apps, live (1:25–2:15)

| Time | Screen | Narration |
|---|---|---|
| 1:25 | Grave Dash 플레이 (점프 2–3회, 죽음, NEW BEST) | "Grave Dash uses the skeleton's fixed-timestep loop for deterministic physics…" |
| 1:40 | OppBoard: 해커톤 필터 클릭 → 주소창 `#/board?type=hackathon` 확대 | "…while OppBoard never boots the loop at all. Its filters write to the hash — so this URL is a shareable, pre-filtered view." |
| 1:55 | 카드 하나 Pin → 새로고침 → 핀 유지 | "Pins survive refresh through the typed store — same module the game uses for its best score." |
| 2:05 | 랜딩 복귀 → 슬로우 스크롤 | "One skeleton. Two very different bodies. Copy the template, write a spec pack, and let Kiro spawn your app." |
| 2:12 | 엔드카드 (정지화면): 타이틀 + github.com/developjik/skelekit + 데모 URL | (내레이션 없음, 3초 유지) |

## Recording notes

- 게임 플레이 구간(0:18, 1:25)은 미리 2–3번 연습 — 한 번에 죽어도 괜찮음(그 자체가 best-score 저장 데모가 됨)
- 터미널 폰트 최소 16pt, 다크 테마 권장
- 내레이션은 총 ~300 단어 (2:15 @ 천천히 읽는 속도)
- 무음 화면녹화 + 자막으로 대체해도 무방 (Devpost 자동자막 활용)
