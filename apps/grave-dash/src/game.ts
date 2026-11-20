/**
 * game.ts — the run screen: canvas stage, game loop, all game state.
 * Instantiated fresh each time the player starts a run.
 */

import { createLoop }  from './core/loop.js';
import { createStore } from './core/store.js';
import {
  GRAVITY, HOP_VY, GROUND_Y,
  simulateStep, type PhysicsState,
} from './physics.js';
import {
  spawnInterval, worldSpeed, makeObstacle, makeSkull,
  LOGICAL_W, LOGICAL_H, GROUND_Y_L, TIER_SECS,
  type Obstacle, type Skull,
} from './spawner.js';
import {
  draw, makeBgState, updateBg,
  PLAYER_X, PLAYER_BOX_W, PLAYER_BOX_H,
  type DrawState, type BgState,
} from './renderer.js';
import { playHop, playCollect, playDeath, playTierUp } from './audio.js';

// ── Stores ────────────────────────────────────────────────────────────────
export const bestStore  = createStore<number>('gd:best', 0);
export const mutedStore = createStore<boolean>('gd:muted', true);

// ── Canvas stage ─────────────────────────────────────────────────────────

const LOGICAL_RATIO = LOGICAL_W / LOGICAL_H;

export function createCanvas(): {
  wrapper: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  resize(): void;
} {
  const wrapper = document.createElement('div');
  wrapper.className = 'gd-canvas-wrapper';

  const canvas = document.createElement('canvas');
  canvas.width  = LOGICAL_W;
  canvas.height = LOGICAL_H;
  canvas.setAttribute('aria-label', 'Grave Dash game canvas');
  wrapper.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;

  function resize(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / LOGICAL_W, vh / LOGICAL_H);
    canvas.style.width  = `${LOGICAL_W * scale}px`;
    canvas.style.height = `${LOGICAL_H * scale}px`;
  }

  resize();
  return { wrapper, canvas, ctx, resize };
}

// ── Game state ────────────────────────────────────────────────────────────

interface GameState {
  phys:          PhysicsState;
  onGround:      boolean;
  bg:            BgState;
  obstacles:     Obstacle[];
  skulls:        Skull[];
  score:         number;
  tier:          number;
  tierTime:      number;    // seconds in current tier
  spawnTimer:    number;
  speed:         number;
  flashTimer:    number;
  shakeTimer:    number;
  squashTimer:   number;
  time:          number;    // total elapsed seconds
  dead:          boolean;
  deathTimer:    number;    // freeze countdown
  paused:        boolean;
  hopQueued:     boolean;   // input buffering
}

function makeGameState(): GameState {
  return {
    phys:        { y: GROUND_Y, vy: 0 },
    onGround:    true,
    bg:          makeBgState(),
    obstacles:   [],
    skulls:      [],
    score:       0,
    tier:        0,
    tierTime:    0,
    spawnTimer:  spawnInterval(0),
    speed:       worldSpeed(0),
    flashTimer:  0,
    shakeTimer:  0,
    squashTimer: 0,
    time:        0,
    dead:        false,
    deathTimer:  0,
    paused:      false,
    hopQueued:   false,
  };
}

// ── Collision helper ──────────────────────────────────────────────────────

const INSET = 6;

function collides(state: GameState, obs: Obstacle): boolean {
  // Player AABB (inset by 6px each side)
  const px1 = PLAYER_X - PLAYER_BOX_W / 2 + INSET;
  const px2 = PLAYER_X + PLAYER_BOX_W / 2 - INSET;
  const py1 = GROUND_Y_L - state.phys.y - PLAYER_BOX_H + INSET;
  const py2 = GROUND_Y_L - state.phys.y - INSET;

  // Obstacle AABB
  let ox1: number, ox2: number, oy1: number, oy2: number;

  if (obs.kind === 'gravestone') {
    ox1 = obs.x;
    ox2 = obs.x + obs.w;
    oy1 = GROUND_Y_L - obs.h;
    oy2 = GROUND_Y_L;
  } else {
    // Gate: solid at top bar + posts; gap in middle (player must hop through)
    // Top bar occupies oy1 = GROUND_Y_L - obs.h - 30, height 10
    // Posts from oy1+10 to GROUND_Y_L — but gate has a gap the player can pass through
    // Treat gate as two hitboxes: top-bar and foot-posts
    // Check top bar
    ox1 = obs.x;
    ox2 = obs.x + obs.w;

    // Top bar
    const topBarY1 = GROUND_Y_L - obs.h - 30;
    const topBarY2 = topBarY1 + 10;
    if (px2 > ox1 && px1 < ox2 && py2 > topBarY1 && py1 < topBarY2) return true;

    // Left post
    const postH = obs.h + 30;
    const leftPostX2 = obs.x + 8;
    if (px2 > obs.x && px1 < leftPostX2 && py2 > GROUND_Y_L - postH && py1 < GROUND_Y_L) return true;

    // Right post
    const rightPostX1 = obs.x + obs.w - 8;
    if (px2 > rightPostX1 && px1 < ox2 && py2 > GROUND_Y_L - postH && py1 < GROUND_Y_L) return true;

    return false;
  }

  return px2 > ox1 && px1 < ox2 && py2 > oy1 && py1 < oy2;
}

// ── Main game factory ─────────────────────────────────────────────────────

export function startGame(
  appEl: HTMLElement,
  onDeath: (score: number) => void,
): () => void {
  const { wrapper, canvas, ctx, resize } = createCanvas();
  appEl.replaceChildren(wrapper);

  const resizeHandler = (): void => resize();
  window.addEventListener('resize', resizeHandler);

  const gs = makeGameState();

  // ── Input ──────────────────────────────────────────────────────────────

  function triggerHop(): void {
    if (gs.dead || gs.paused) return;
    gs.hopQueued = true;
  }

  function triggerPause(): void {
    if (gs.dead) return;
    gs.paused = !gs.paused;
    if (gs.paused) loop.pause(); else loop.resume();
  }

  function handleKey(e: KeyboardEvent): void {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      triggerHop();
    } else if (e.code === 'KeyP') {
      e.preventDefault();
      triggerPause();
    } else if (e.code === 'KeyM') {
      mutedStore.set(m => !m);
    }
  }

  function handlePointer(_e: Event): void {
    triggerHop();
  }

  document.addEventListener('keydown', handleKey);
  canvas.addEventListener('pointerdown', handlePointer);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); triggerHop(); }, { passive: false });

  // Blur pauses
  function handleBlur(): void {
    if (!gs.dead && !gs.paused) {
      gs.paused = true;
      loop.pause();
    }
  }
  window.addEventListener('blur', handleBlur);

  // ── Loop ───────────────────────────────────────────────────────────────

  const STEP_MS = 16;

  const loop = createLoop({
    stepMs: STEP_MS,
    update(dt: number): void {
      if (gs.dead) {
        gs.deathTimer -= dt;
        if (gs.deathTimer <= 0) {
          const finalScore = Math.floor(gs.score);
          if (finalScore > bestStore.get()) {
            bestStore.set(finalScore);
          }
          cleanup();
          onDeath(finalScore);
        }
        return;
      }

      gs.time += dt;

      // Hop
      if (gs.hopQueued && gs.onGround) {
        gs.phys = { y: gs.phys.y, vy: HOP_VY };
        gs.onGround = false;
        gs.hopQueued = false;
        playHop(mutedStore.get());
      } else {
        gs.hopQueued = false;
      }

      // Physics
      const wasAboveGround = gs.phys.y < 0;
      gs.phys = simulateStep(gs.phys, dt);

      if (gs.phys.y >= GROUND_Y && !gs.onGround) {
        gs.onGround = true;
        gs.squashTimer = 0.12;  // squash on landing
      }
      if (gs.squashTimer > 0) gs.squashTimer -= dt;

      // Tier / speed
      gs.tierTime += dt;
      if (gs.tierTime >= TIER_SECS && gs.speed < 740) {
        gs.tierTime  = 0;
        gs.tier     += 1;
        gs.speed     = worldSpeed(gs.tier);
        gs.flashTimer = 0.3;
        playTierUp(mutedStore.get());
      }
      if (gs.flashTimer > 0) gs.flashTimer -= dt;
      if (gs.shakeTimer > 0) gs.shakeTimer -= dt;

      // Background
      updateBg(gs.bg, gs.speed, dt);

      // Score: 10 points/sec + 50 for skulls
      gs.score += 10 * dt;

      // Spawn
      gs.spawnTimer -= dt;
      if (gs.spawnTimer <= 0) {
        const kind = Math.random() < 0.5 ? 'gravestone' : 'gate';
        const obs  = makeObstacle(kind);
        gs.obstacles.push(obs);
        // 40% chance of a skull near this obstacle
        if (Math.random() < 0.4) {
          gs.skulls.push(makeSkull(obs.x));
        }
        gs.spawnTimer = spawnInterval(gs.tier) + (Math.random() - 0.5) * 0.2;
      }

      // Move obstacles & skulls
      for (const obs of gs.obstacles) obs.x -= gs.speed * dt;
      for (const sk  of gs.skulls)   sk.x  -= gs.speed * dt;

      // Cull off-screen
      gs.obstacles = gs.obstacles.filter(o => o.x + o.w > -20);
      gs.skulls    = gs.skulls.filter(s => s.x + s.r > -20);

      // Skull collection
      const px  = PLAYER_X;
      const py  = GROUND_Y_L - gs.phys.y - PLAYER_BOX_H / 2;
      gs.skulls = gs.skulls.filter(sk => {
        const dx = sk.x - px;
        const dy = (GROUND_Y_L - sk.y) - py;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < (sk.r + PLAYER_BOX_W / 2) * (sk.r + PLAYER_BOX_W / 2)) {
          gs.score += 50;
          playCollect(mutedStore.get());
          return false;
        }
        return true;
      });

      // Collision
      for (const obs of gs.obstacles) {
        if (collides(gs, obs)) {
          gs.dead      = true;
          gs.deathTimer = 0.4;
          gs.shakeTimer = 0.4;
          playDeath(mutedStore.get());
          return;
        }
      }
    },

    render(_alpha: number, _fps: number): void {
      const drawState: DrawState = {
        bg:          gs.bg,
        playerY:     -gs.phys.y,   // convert: phys.y <=0 means above ground
        playerVy:    gs.phys.vy,
        squashTimer: gs.squashTimer,
        obstacles:   gs.obstacles,
        skulls:      gs.skulls,
        score:       gs.score,
        best:        bestStore.get(),
        tier:        gs.tier,
        flashTimer:  gs.flashTimer,
        shakeTimer:  gs.shakeTimer,
        shakeAmt:    gs.shakeTimer > 0 ? 6 : 0,
        paused:      gs.paused,
        time:        gs.time,
        muted:       mutedStore.get(),
      };
      draw(ctx, drawState);
    },
  });

  loop.start();

  function cleanup(): void {
    loop.stop();
    document.removeEventListener('keydown', handleKey);
    canvas.removeEventListener('pointerdown', handlePointer);
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('blur', handleBlur);
  }

  // Return a stop handle (called if navigating away)
  return cleanup;
}
