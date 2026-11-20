/**
 * physics.ts — pure hop physics helper (no DOM, no imports).
 * Exported for unit tests and consumed by player.ts.
 *
 * World: gravity = 2600 px/s², hop vy = -880 px/s, ground y = 0 (player feet).
 */

export const GRAVITY = 2600;    // px/s²
export const HOP_VY  = -880;    // px/s (negative = upward)
export const GROUND_Y = 0;      // feet position baseline (world coords, 0 = on ground)

export interface PhysicsState {
  y:  number;   // feet offset above ground (0 when grounded)
  vy: number;   // vertical velocity px/s
}

/**
 * Advance physics by dt seconds.
 * Returns the new state; does NOT mutate input.
 */
export function simulateStep(state: PhysicsState, dt: number): PhysicsState {
  let { y, vy } = state;
  vy += GRAVITY * dt;
  y  += vy * dt;
  if (y >= GROUND_Y) {
    y  = GROUND_Y;
    vy = 0;
  }
  return { y, vy };
}

/** Simulate a full hop from ground. Returns { apex, airtime }. */
export function simulateHop(dt: number): { apex: number; airtime: number } {
  let state: PhysicsState = { y: 0, vy: HOP_VY };
  let apex = 0;
  let airtime = 0;
  // 4-second ceiling — the hop lasts ~0.68s
  while (airtime < 4) {
    state = simulateStep(state, dt);
    airtime += dt;
    if (-state.y > apex) apex = -state.y;
    if (airtime > 0.01 && state.y >= GROUND_Y) break;
  }
  return { apex, airtime };
}
