/**
 * spawner.test.ts
 * Verifies spawn interval clamp and world speed for all tiers.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  spawnInterval,
  worldSpeed,
  BASE_SPEED, SPEED_STEP, SPEED_CAP,
} from './spawner.js';

describe('spawner bounds', () => {
  it('tier 0 interval is 1.6s', () => {
    assert.equal(spawnInterval(0), 1.6);
  });

  it('interval decreases with tier', () => {
    for (let t = 0; t < 5; t++) {
      assert.ok(
        spawnInterval(t + 1) <= spawnInterval(t),
        `tier ${t + 1} interval should be ≤ tier ${t}`,
      );
    }
  });

  it('interval never drops below 0.75s for tiers 0..6', () => {
    for (let t = 0; t <= 6; t++) {
      const iv = spawnInterval(t);
      assert.ok(
        iv >= 0.75,
        `tier ${t} interval ${iv.toFixed(3)} < 0.75s`,
      );
    }
  });

  it('interval never exceeds 1.6s for tiers 0..6', () => {
    for (let t = 0; t <= 6; t++) {
      const iv = spawnInterval(t);
      assert.ok(
        iv <= 1.6,
        `tier ${t} interval ${iv.toFixed(3)} > 1.6s`,
      );
    }
  });

  it('interval clamps at 0.75 for high tiers', () => {
    // tier 6: 1.6 - 6*0.15 = 0.70 → clamps to 0.75
    assert.equal(spawnInterval(6),  0.75);
    assert.equal(spawnInterval(10), 0.75);
    assert.equal(spawnInterval(100), 0.75);
  });

  it('world speed at tier 0 is BASE_SPEED', () => {
    assert.equal(worldSpeed(0), BASE_SPEED);
  });

  it('world speed increases by SPEED_STEP per tier until cap', () => {
    for (let t = 0; t <= 5; t++) {
      const expected = Math.min(BASE_SPEED + t * SPEED_STEP, SPEED_CAP);
      assert.equal(worldSpeed(t), expected, `tier ${t} speed mismatch`);
    }
  });

  it('world speed never exceeds SPEED_CAP', () => {
    for (let t = 0; t <= 20; t++) {
      assert.ok(
        worldSpeed(t) <= SPEED_CAP,
        `tier ${t} speed ${worldSpeed(t)} > cap ${SPEED_CAP}`,
      );
    }
  });

  it('world speed at tier 7 (beyond linear) is capped', () => {
    // 320 + 7*60 = 740 = cap
    assert.equal(worldSpeed(7), SPEED_CAP);
    assert.equal(worldSpeed(8), SPEED_CAP);
  });
});
