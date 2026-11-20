/**
 * renderer.ts — procedural canvas drawing for Grave Dash.
 * All coordinates are in the 960×540 logical space.
 */

import {
  LOGICAL_W, LOGICAL_H, GROUND_Y_L,
  GRAVESTONE_W, GRAVESTONE_H, GATE_W, GATE_H, SKULL_R,
  type Obstacle, type Skull,
} from './spawner.js';

export const PLAYER_X   = 180;
export const PLAYER_BOX_W = 34;
export const PLAYER_BOX_H = 40;

// ── Parallax layers ───────────────────────────────────────────────────────

interface FogLayer {
  offset: number;
  speed: number;    // multiplier of world speed
  alpha: number;
}

export interface BgState {
  fog1: FogLayer;   // far fog
  fog2: FogLayer;   // mid fog / silhouette trees
  groundOffset: number;
}

export function makeBgState(): BgState {
  return {
    fog1:        { offset: 0, speed: 0.2, alpha: 0.35 },
    fog2:        { offset: 0, speed: 0.5, alpha: 0.25 },
    groundOffset: 0,
  };
}

export function updateBg(bg: BgState, worldSpeed: number, dt: number): void {
  bg.fog1.offset        = (bg.fog1.offset        + worldSpeed * bg.fog1.speed * dt) % LOGICAL_W;
  bg.fog2.offset        = (bg.fog2.offset        + worldSpeed * bg.fog2.speed * dt) % LOGICAL_W;
  bg.groundOffset       = (bg.groundOffset        + worldSpeed * dt)                % LOGICAL_W;
}

// ── Main draw ─────────────────────────────────────────────────────────────

export interface DrawState {
  bg: BgState;
  playerY: number;        // feet offset above ground (positive = up, 0 = grounded)
  playerVy: number;       // used for squash/stretch
  squashTimer: number;    // countdown in seconds
  obstacles: Obstacle[];
  skulls: Skull[];
  score: number;
  best: number;
  tier: number;
  flashTimer: number;     // tier-up flash countdown (seconds)
  shakeTimer: number;     // death shake countdown
  shakeAmt: number;       // pixels
  paused: boolean;
  time: number;           // total elapsed play seconds (for skull bob)
  muted: boolean;
}

export function draw(ctx: CanvasRenderingContext2D, s: DrawState): void {
  const W = LOGICAL_W;
  const H = LOGICAL_H;

  // Screen shake transform
  let shakeX = 0, shakeY = 0;
  if (s.shakeTimer > 0) {
    shakeX = (Math.random() - 0.5) * s.shakeAmt * 2;
    shakeY = (Math.random() - 0.5) * s.shakeAmt * 2;
  }

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // ── Sky gradient ────────────────────────────────────────────────────────
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y_L);
  skyGrad.addColorStop(0,   '#060412');
  skyGrad.addColorStop(0.5, '#0d0a1a');
  skyGrad.addColorStop(1,   '#1a1030');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Moon ────────────────────────────────────────────────────────────────
  drawMoon(ctx, 820, 70, 46);

  // ── Stars ───────────────────────────────────────────────────────────────
  drawStars(ctx, s.time);

  // ── Far fog layer ───────────────────────────────────────────────────────
  drawFog(ctx, s.bg.fog1.offset, 1, 0.18, W, H);

  // ── Tree silhouettes (mid layer) ────────────────────────────────────────
  drawTrees(ctx, s.bg.fog2.offset, W);

  // ── Ground ──────────────────────────────────────────────────────────────
  drawGround(ctx, s.bg.groundOffset, W, H);

  // ── Obstacles ───────────────────────────────────────────────────────────
  for (const obs of s.obstacles) {
    if (obs.kind === 'gravestone') {
      drawGravestone(ctx, obs.x, obs.w, obs.h);
    } else {
      drawGate(ctx, obs.x, obs.w, obs.h);
    }
  }

  // ── Skull pickups ───────────────────────────────────────────────────────
  for (const skull of s.skulls) {
    const bobY = Math.sin(s.time * 3 + skull.phase) * 6;
    drawSkull(ctx, skull.x, GROUND_Y_L - skull.y + bobY, skull.r);
  }

  // ── Player ghost ────────────────────────────────────────────────────────
  const playerDrawY = GROUND_Y_L - s.playerY;
  const squash = s.squashTimer > 0 ? 1 + 0.3 * (s.squashTimer / 0.12) : 1;
  drawGhost(ctx, PLAYER_X, playerDrawY, squash);

  // ── HUD ─────────────────────────────────────────────────────────────────
  drawHUD(ctx, s.score, s.best, s.tier, s.muted, W);

  // ── Tier-up flash ───────────────────────────────────────────────────────
  if (s.flashTimer > 0) {
    const alpha = (s.flashTimer / 0.3) * 0.25;
    ctx.fillStyle = `rgba(255, 119, 0, ${alpha})`;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = `rgba(255, 240, 200, ${alpha * 2.5})`;
    ctx.font = 'bold 36px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SPEED UP!  Tier ${s.tier + 1}`, W / 2, H / 2 - 20);
  }

  // ── Pause overlay ───────────────────────────────────────────────────────
  if (s.paused) {
    ctx.fillStyle = 'rgba(13, 10, 26, 0.72)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#f0e6d3';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', W / 2, H / 2 - 20);

    ctx.fillStyle = '#5a4a6a';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('Press P to resume  •  Space / Tap to hop', W / 2, H / 2 + 28);
  }

  ctx.restore();
}

// ── Drawing helpers ───────────────────────────────────────────────────────

function drawMoon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.save();
  ctx.shadowColor = '#fffde0';
  ctx.shadowBlur  = 24;
  ctx.fillStyle   = '#fffde0';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // crescent shadow
  ctx.fillStyle = '#10090d';
  ctx.beginPath();
  ctx.arc(x + 14, y - 8, r - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Deterministic "random" stars using a fixed seed pattern
function drawStars(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.save();
  const positions: [number, number, number, number][] = [
    // x, y, r, twinkle-phase
    [120, 40, 1.5, 0.0],  [220, 80, 1.0, 1.1],  [340, 30, 1.8, 0.7],
    [480, 60, 1.2, 2.3],  [580, 25, 1.5, 0.4],  [660, 90, 1.0, 1.9],
    [730, 45, 1.8, 3.1],  [150, 110, 1.2, 0.9], [390, 95, 1.5, 2.6],
    [510, 15, 1.0, 1.4],  [690, 130, 1.2, 0.2], [760, 70, 1.6, 2.0],
    [870, 50, 1.4, 1.7],  [910, 100, 1.0, 0.5], [50,  60, 1.3, 2.8],
    [290, 50, 1.1, 1.3],  [440, 130, 1.4, 0.6], [820, 130, 1.1, 2.1],
    [100, 150, 1.0, 1.0], [600, 150, 1.5, 0.3],
  ];
  for (const [x, y, r, phase] of positions) {
    const brightness = 0.6 + 0.4 * Math.sin(time * 1.5 + phase);
    ctx.fillStyle = `rgba(240, 230, 210, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFog(
  ctx: CanvasRenderingContext2D,
  offset: number,
  layer: number,
  alpha: number,
  W: number,
  H: number,
): void {
  const y = GROUND_Y_L - 80 - layer * 20;
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = -1; i <= 2; i++) {
    const x = (i * W - offset % W);
    const grad = ctx.createLinearGradient(0, y - 60, 0, y + 80);
    grad.addColorStop(0,   'rgba(60,40,90,0)');
    grad.addColorStop(0.4, 'rgba(60,40,90,0.6)');
    grad.addColorStop(1,   'rgba(30,20,50,0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y - 60, W, 140);
  }
  ctx.restore();
}

function drawTrees(ctx: CanvasRenderingContext2D, offset: number, W: number): void {
  ctx.save();
  ctx.fillStyle = '#0e0918';
  // Tree silhouette pattern — repeating sequence of trees
  const trees: [number, number, number][] = [
    // relX, h, w
    [0,   120, 24], [60,  90, 20], [130, 140, 28], [200, 100, 22],
    [260, 130, 26], [340,  80, 18], [390, 115, 24], [460, 135, 28],
    [530, 95, 20],  [600, 125, 26], [660,  85, 18], [720, 140, 30],
    [790, 100, 22], [850, 115, 24], [910, 130, 26],
  ];
  for (let i = -1; i <= 2; i++) {
    const baseX = i * W - (offset % W);
    for (const [tx, th, tw] of trees) {
      const x = baseX + tx;
      const y = GROUND_Y_L;
      // Trunk
      ctx.fillRect(x + tw / 2 - 3, y - th * 0.3, 6, th * 0.3);
      // Triangle crown
      ctx.beginPath();
      ctx.moveTo(x + tw / 2, y - th);
      ctx.lineTo(x, y - th * 0.3);
      ctx.lineTo(x + tw, y - th * 0.3);
      ctx.closePath();
      ctx.fill();
      // Second tier
      ctx.beginPath();
      ctx.moveTo(x + tw / 2, y - th * 0.75);
      ctx.lineTo(x + 3, y - th * 0.3 - th * 0.15);
      ctx.lineTo(x + tw - 3, y - th * 0.3 - th * 0.15);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawGround(ctx: CanvasRenderingContext2D, offset: number, W: number, H: number): void {
  // Ground fill
  ctx.fillStyle = '#1a1210';
  ctx.fillRect(0, GROUND_Y_L, W, H - GROUND_Y_L);

  // Grass strip
  ctx.fillStyle = '#2a4a1a';
  ctx.fillRect(0, GROUND_Y_L, W, 6);

  // Animated dirt cracks
  ctx.save();
  ctx.strokeStyle = '#251a14';
  ctx.lineWidth = 1;
  const crackPositions = [40, 160, 280, 400, 520, 640, 760, 880];
  for (const cp of crackPositions) {
    const x = ((cp - offset % W) + W * 2) % W;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y_L + 8);
    ctx.lineTo(x + 12, GROUND_Y_L + 16);
    ctx.lineTo(x + 6, GROUND_Y_L + 22);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGravestone(ctx: CanvasRenderingContext2D, x: number, w: number, h: number): void {
  const groundY = GROUND_Y_L;
  const top = groundY - h;

  ctx.save();
  ctx.fillStyle = '#3a3250';
  ctx.strokeStyle = '#5a4a7a';
  ctx.lineWidth = 2;

  // Body
  ctx.beginPath();
  ctx.roundRect(x, top + 10, w, h - 10, [4]);
  ctx.fill();
  ctx.stroke();

  // Rounded top
  ctx.beginPath();
  ctx.arc(x + w / 2, top + 10, w / 2, Math.PI, 0);
  ctx.fill();
  ctx.stroke();

  // RIP text
  ctx.fillStyle = '#6a5a8a';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('R.I.P', x + w / 2, top + h * 0.55);

  // Cross
  ctx.strokeStyle = '#5a4a7a';
  ctx.lineWidth = 2;
  const cx = x + w / 2;
  const cy = top + 18;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8);
  ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
  ctx.stroke();

  ctx.restore();
}

function drawGate(ctx: CanvasRenderingContext2D, x: number, w: number, h: number): void {
  const groundY = GROUND_Y_L;

  ctx.save();
  ctx.fillStyle   = '#2a2040';
  ctx.strokeStyle = '#4a3a60';
  ctx.lineWidth   = 3;

  // Left post
  ctx.fillRect(x,         groundY - h - 30, 8, h + 30);
  ctx.strokeRect(x,       groundY - h - 30, 8, h + 30);
  // Right post
  ctx.fillRect(x + w - 8, groundY - h - 30, 8, h + 30);
  ctx.strokeRect(x + w - 8, groundY - h - 30, 8, h + 30);

  // Top bar
  ctx.fillRect(x, groundY - h - 30, w, 10);
  ctx.strokeRect(x, groundY - h - 30, w, 10);

  // Spikes
  ctx.fillStyle = '#6a5a7a';
  const spikeCount = 5;
  const spikeSpacing = (w - 16) / (spikeCount + 1);
  for (let i = 1; i <= spikeCount; i++) {
    const sx = x + 8 + spikeSpacing * i;
    ctx.beginPath();
    ctx.moveTo(sx, groundY - h - 44);
    ctx.lineTo(sx - 4, groundY - h - 30);
    ctx.lineTo(sx + 4, groundY - h - 30);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawSkull(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.save();

  // Glow
  ctx.shadowColor = 'rgba(255, 240, 150, 0.6)';
  ctx.shadowBlur  = 12;

  // Skull circle
  ctx.fillStyle = '#fffde0';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Eyes
  ctx.fillStyle = '#0a0820';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.32, y - r * 0.1, r * 0.22, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.32, y - r * 0.1, r * 0.22, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Teeth
  ctx.fillStyle = '#0a0820';
  const toothW = r * 0.18;
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(x + i * toothW * 1.3 - toothW / 2, y + r * 0.35, toothW, r * 0.3);
  }

  ctx.restore();
}

function drawGhost(ctx: CanvasRenderingContext2D, x: number, footY: number, squash: number): void {
  const bodyH = PLAYER_BOX_H * squash;
  const bodyW = PLAYER_BOX_W * (squash > 1 ? 2 - squash + 0.3 : 1); // widen when squash
  const bodyTop = footY - bodyH;

  ctx.save();

  // Ghost glow
  ctx.shadowColor = 'rgba(200, 230, 255, 0.5)';
  ctx.shadowBlur  = 16;

  // Body
  ctx.fillStyle = '#d0e8ff';
  ctx.beginPath();
  ctx.moveTo(x - bodyW / 2, footY);
  // Wavy skirt bottom
  const segments = 4;
  const segW = bodyW / segments;
  for (let i = 0; i < segments; i++) {
    const sx = x - bodyW / 2 + i * segW;
    const cp = i % 2 === 0 ? footY + 8 : footY - 4;
    ctx.quadraticCurveTo(sx + segW / 2, cp, sx + segW, footY);
  }
  ctx.lineTo(x + bodyW / 2, bodyTop + bodyH * 0.4);
  // Rounded top
  ctx.arc(x, bodyTop + bodyH * 0.4, bodyW / 2, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;

  // Eyes
  ctx.fillStyle = '#0a0820';
  ctx.beginPath();
  ctx.ellipse(x - bodyW * 0.22, bodyTop + bodyH * 0.42, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + bodyW * 0.22, bodyTop + bodyH * 0.42, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (squiggly line)
  ctx.strokeStyle = '#0a0820';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 7, bodyTop + bodyH * 0.6);
  ctx.quadraticCurveTo(x, bodyTop + bodyH * 0.66, x + 7, bodyTop + bodyH * 0.6);
  ctx.stroke();

  ctx.restore();
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  score: number,
  best: number,
  tier: number,
  muted: boolean,
  W: number,
): void {
  ctx.save();

  // Semi-transparent HUD bar
  ctx.fillStyle = 'rgba(13, 10, 26, 0.65)';
  ctx.fillRect(0, 0, W, 44);

  // Score
  ctx.fillStyle = '#f0e6d3';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${Math.floor(score)}`, 16, 30);

  // Best
  ctx.fillStyle = '#ff7700';
  ctx.font = '16px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Best: ${Math.floor(best)}`, W / 2, 28);

  // Tier indicator
  ctx.fillStyle = '#5a4a6a';
  ctx.font = '14px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Tier ${tier + 1}  ${muted ? '🔇' : '🔊'}  P=Pause`, W - 12, 28);

  ctx.restore();
}
