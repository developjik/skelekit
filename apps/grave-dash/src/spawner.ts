/**
 * spawner.ts — obstacle and skull spawn logic.
 * Pure: no DOM, no canvas.
 */

/** World speed at tier 0 is 320 px/s; +60 per tier; cap 740. */
export const BASE_SPEED  = 320;
export const SPEED_STEP  = 60;
export const SPEED_CAP   = 740;
export const TIER_SECS   = 15;   // seconds per tier

/** Spawn interval clamp: 1.6 − tier*0.15, clamped [0.75, 1.6] */
export function spawnInterval(tier: number): number {
  const raw = 1.6 - tier * 0.15;
  return Math.max(0.75, Math.min(1.6, raw));
}

export function worldSpeed(tier: number): number {
  return Math.min(BASE_SPEED + tier * SPEED_STEP, SPEED_CAP);
}

export type ObstacleKind = 'gravestone' | 'gate';

export interface Obstacle {
  kind: ObstacleKind;
  x: number;
  w: number;
  h: number;
}

export interface Skull {
  x: number;
  y: number;      // logical Y above ground (positive = up)
  r: number;
  phase: number;  // sin phase for bobbing
}

export const LOGICAL_W  = 960;
export const LOGICAL_H  = 540;
export const GROUND_Y_L = 470;  // y of ground surface in logical coords

// Obstacle dimensions
export const GRAVESTONE_W = 46;
export const GRAVESTONE_H = 64;
export const GATE_W       = 90;
export const GATE_H       = 40;
export const SKULL_R      = 14;

/** Spawn a new obstacle off-screen right. */
export function makeObstacle(kind: ObstacleKind): Obstacle {
  return {
    kind,
    x: LOGICAL_W + 20,
    w: kind === 'gravestone' ? GRAVESTONE_W : GATE_W,
    h: kind === 'gravestone' ? GRAVESTONE_H : GATE_H,
  };
}

/** Spawn a skull in a floating arc above an obstacle position. */
export function makeSkull(obstacleX: number): Skull {
  // Place skull above the gap — midair at ~100-140px above ground
  const arcHeight = 110 + Math.random() * 40;
  return {
    x: obstacleX + GRAVESTONE_W * 0.5 + Math.random() * 60 - 30,
    y: arcHeight,
    r: SKULL_R,
    phase: Math.random() * Math.PI * 2,
  };
}
