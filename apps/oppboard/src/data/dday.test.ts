/**
 * dday.test.ts — KST boundary tests for dday(), ddayClass(), ddayLabel().
 * Run with: tsx --test src/data/dday.test.ts
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dday, ddayClass, ddayLabel } from './index.js';

// ── KST boundary: 2026-11-20T03:00:00Z = 2026-11-20T12:00:00+09 (noon KST Nov 20)
// that makes today_KST = "2026-11-20"
const NOW_KST_NOV20 = Date.parse('2026-11-20T03:00:00Z');

describe('dday() — KST boundary', () => {
  // Design spec test:
  // "deadline 2026-11-21T23:59:00+09:00 vs [now = KST 2026-11-20] → D-1"
  it('deadline on KST 2026-11-21, now on KST 2026-11-20 → D-1', () => {
    const d = dday('2026-11-21T23:59:00+09:00', NOW_KST_NOV20);
    assert.equal(d, 1, `Expected 1, got ${d}`);
  });

  it('same moment in UTC gives same D-day as +09:00 form', () => {
    // 2026-11-21T23:59:00+09:00 === 2026-11-21T14:59:00Z
    const d1 = dday('2026-11-21T23:59:00+09:00', NOW_KST_NOV20);
    const d2 = dday('2026-11-21T14:59:00Z', NOW_KST_NOV20);
    assert.equal(d1, d2, `UTC and +09:00 forms must give same result (${d1} vs ${d2})`);
  });

  it('deadline on same KST day as now → D-0', () => {
    // now = 2026-11-21T03:00:00Z = noon KST Nov 21
    const nowMs = Date.parse('2026-11-21T03:00:00Z');
    const d = dday('2026-11-21T23:59:00+09:00', nowMs);
    assert.equal(d, 0, `Expected 0 (D-0), got ${d}`);
  });

  it('past deadline returns negative', () => {
    // deadline = 2026-11-13, now = KST 2026-11-20 → D = 2026-11-13 - 2026-11-20 = -7
    const d = dday('2026-11-13', NOW_KST_NOV20);
    assert.equal(d, -7, `Expected -7, got ${d}`);
  });

  it('date-only deadline on day after now → D-1', () => {
    const d = dday('2026-11-21', NOW_KST_NOV20);
    assert.equal(d, 1, `Expected 1, got ${d}`);
  });
});

describe('ddayClass()', () => {
  it('D≥7 → calm', () => {
    assert.equal(ddayClass(7), 'calm');
    assert.equal(ddayClass(10), 'calm');
  });
  it('3≤D<7 → warn', () => {
    assert.equal(ddayClass(3), 'warn');
    assert.equal(ddayClass(6), 'warn');
  });
  it('0≤D<3 → danger', () => {
    assert.equal(ddayClass(0), 'danger');
    assert.equal(ddayClass(2), 'danger');
  });
  it('D<0 → closed', () => {
    assert.equal(ddayClass(-1), 'closed');
    assert.equal(ddayClass(-10), 'closed');
  });
});

describe('ddayLabel()', () => {
  it('formats D-N for open', () => {
    assert.equal(ddayLabel(9), 'D-9');
    assert.equal(ddayLabel(2), 'D-2');
    assert.equal(ddayLabel(0), 'D-0');
  });
  it('returns 마감 for past', () => {
    assert.equal(ddayLabel(-1), '마감');
    assert.equal(ddayLabel(-7), '마감');
  });
});
