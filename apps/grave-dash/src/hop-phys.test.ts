/**
 * hop-phys.test.ts
 * Runs with: tsx --test src/hop-phys.test.ts
 *
 * Verifies that the hop physics helper produces the documented values:
 *   apex ≈ 148px, airtime ≈ 0.68s  (design.md)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { simulateHop, simulateStep, GRAVITY, HOP_VY } from './physics.js';

describe('hop physics', () => {
  it('simulateHop apex is approximately 148px (±12px)', () => {
    const { apex } = simulateHop(1 / 60);
    assert.ok(
      apex >= 136 && apex <= 160,
      `expected apex ~148px, got ${apex.toFixed(1)}px`,
    );
  });

  it('simulateHop airtime is approximately 0.68s (±0.06s)', () => {
    const { airtime } = simulateHop(1 / 60);
    assert.ok(
      airtime >= 0.62 && airtime <= 0.74,
      `expected airtime ~0.68s, got ${airtime.toFixed(3)}s`,
    );
  });

  it('simulateHop with 1ms dt produces consistent apex (within 10px of 60Hz result)', () => {
    const r60  = simulateHop(1 / 60);
    const r1ms = simulateHop(1 / 1000);
    assert.ok(
      Math.abs(r60.apex - r1ms.apex) < 10,
      `60Hz apex=${r60.apex.toFixed(1)} vs 1ms apex=${r1ms.apex.toFixed(1)} — drift too large`,
    );
  });

  it('grounded state: simulateStep with no initial velocity stays at ground', () => {
    const state = { y: 0, vy: 0 };
    const next  = simulateStep(state, 1 / 60);
    assert.equal(next.y, 0, 'should remain on ground');
    assert.equal(next.vy, 0, 'velocity should stay 0');
  });

  it('hop vy is negative (upward)', () => {
    assert.ok(HOP_VY < 0, 'HOP_VY must be negative');
  });

  it('gravity is positive (downward acceleration)', () => {
    assert.ok(GRAVITY > 0, 'GRAVITY must be positive');
  });

  it('player rises immediately after hop', () => {
    const state = { y: 0, vy: HOP_VY };
    const next  = simulateStep(state, 1 / 60);
    // y is feet-above-ground (0 = ground); a hop goes into negative y territory
    assert.ok(next.y < 0, `expected player to rise (y < 0), got ${next.y}`);
  });
});
