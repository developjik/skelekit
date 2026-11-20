/**
 * loop.test.ts
 * Uses a fake rAF + fake clock to drive the loop deterministically.
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createLoop } from './loop.js';

// ── Fake rAF / cAF ───────────────────────────────────────────────────────
let rafCallbacks: Array<(t: number) => void> = [];
let rafIdCounter = 0;

function fakeRaf(cb: (t: number) => void): number {
  rafCallbacks.push(cb);
  return ++rafIdCounter;
}

function fakeCaf(_id: number): void {
  // For simplicity, clear all pending callbacks (matches how stop() is called)
  rafCallbacks = [];
}

/** Advance the fake clock by `ms` milliseconds (triggers queued rAF callbacks). */
function tick(timeMs: number): void {
  const pending = rafCallbacks.slice();
  rafCallbacks = [];
  for (const cb of pending) cb(timeMs);
}

beforeEach(() => {
  rafCallbacks = [];
  rafIdCounter = 0;
  // Inject fakes
  Object.defineProperty(globalThis, 'requestAnimationFrame', {
    value: fakeRaf,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    value: fakeCaf,
    writable: true,
    configurable: true,
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('createLoop', () => {
  it('running() is false before start()', () => {
    const loop = createLoop({ stepMs: 16, update: () => {}, render: () => {} });
    assert.equal(loop.running(), false);
  });

  it('running() is true after start()', () => {
    const loop = createLoop({ stepMs: 16, update: () => {}, render: () => {} });
    loop.start();
    assert.equal(loop.running(), true);
    loop.stop();
  });

  it('running() is false after stop()', () => {
    const loop = createLoop({ stepMs: 16, update: () => {}, render: () => {} });
    loop.start();
    loop.stop();
    assert.equal(loop.running(), false);
  });

  it('calls update exactly N times for N steps worth of elapsed time', () => {
    const STEP = 16;
    let updateCount = 0;
    const loop = createLoop({
      stepMs: STEP,
      update: () => { updateCount++; },
      render: () => {},
    });

    loop.start();
    // Frame 1: t=0 (first tick just sets lastTime, no elapsed yet)
    tick(0);
    // Frame 2: t=48 → 48 ms elapsed → 3 steps
    tick(48);

    loop.stop();
    assert.equal(updateCount, 3);
  });

  it('passes dt in seconds (stepMs / 1000) to update', () => {
    const STEP = 100; // 0.1 s
    const dts: number[] = [];
    const loop = createLoop({
      stepMs: STEP,
      update: (dt) => { dts.push(dt); },
      render: () => {},
    });

    loop.start();
    tick(0);
    tick(200); // 200 ms → 2 steps
    loop.stop();

    assert.ok(dts.length >= 2);
    for (const dt of dts) {
      assert.ok(Math.abs(dt - 0.1) < 1e-9, `expected dt≈0.1, got ${dt}`);
    }
  });

  it('caps debt at 250 ms (spiral-of-death guard)', () => {
    const STEP = 16;
    let updateCount = 0;
    const loop = createLoop({
      stepMs: STEP,
      update: () => { updateCount++; },
      render: () => {},
    });

    loop.start();
    tick(0);
    // A massive 10-second stall — should be capped to 250 ms
    tick(10_000);
    loop.stop();

    // 250 / 16 = 15.625 → at most 15 updates
    assert.ok(updateCount <= 15, `expected ≤15 updates, got ${updateCount}`);
  });

  it('render receives alpha in [0, 1]', () => {
    const alphas: number[] = [];
    const loop = createLoop({
      stepMs: 16,
      update: () => {},
      render: (alpha) => { alphas.push(alpha); },
    });

    loop.start();
    tick(0);
    tick(24); // 24 ms → 1 full step (16ms) + 8ms remainder → alpha = 8/16 = 0.5
    loop.stop();

    for (const a of alphas) {
      assert.ok(a >= 0 && a <= 1, `alpha out of range: ${a}`);
    }
  });

  it('start() is idempotent (calling twice does not double-schedule)', () => {
    let renderCount = 0;
    const loop = createLoop({
      stepMs: 16,
      update: () => {},
      render: () => { renderCount++; },
    });

    loop.start();
    loop.start(); // second call should be a no-op
    tick(0);
    loop.stop();

    // Only one rAF callback should have fired
    assert.equal(renderCount, 1);
  });
});
