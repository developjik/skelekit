/**
 * data.test.ts — validates loadOpportunities() output shape and dataset invariants.
 * Run with: tsx --test src/data/data.test.ts
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadOpportunities } from './index.js';

describe('loadOpportunities()', () => {
  const opps = loadOpportunities();

  it('returns approximately 40 entries (40±2)', () => {
    assert.ok(opps.length >= 38 && opps.length <= 42,
      `Expected ~40 entries, got ${opps.length}`);
  });

  it('all entries have required fields', () => {
    for (const o of opps) {
      assert.ok(o.id.length > 0,        `id missing on ${JSON.stringify(o)}`);
      assert.ok(o.title.length > 0,     `title missing on ${o.id}`);
      assert.ok(o.host.length > 0,      `host missing on ${o.id}`);
      assert.ok(['hackathon','contest','job'].includes(o.type),
        `invalid type "${o.type}" on ${o.id}`);
      assert.ok(o.url.startsWith('https://'), `url not https on ${o.id}`);
      assert.ok(typeof o.prize === 'string',  `prize missing on ${o.id}`);
      assert.ok(Array.isArray(o.regions),     `regions not array on ${o.id}`);
    }
  });

  it('all deadlines are valid ISO dates', () => {
    for (const o of opps) {
      const ms = Date.parse(o.deadline);
      assert.ok(!isNaN(ms), `invalid deadline "${o.deadline}" on ${o.id}`);
    }
  });

  it('all urls are https', () => {
    for (const o of opps) {
      assert.ok(o.url.startsWith('https://'), `non-https url on ${o.id}: ${o.url}`);
    }
  });

  it('entries are sorted ascending by deadline', () => {
    for (let i = 1; i < opps.length; i++) {
      assert.ok(
        opps[i].deadline >= opps[i - 1].deadline,
        `Out of order: ${opps[i - 1].id} (${opps[i-1].deadline}) before ${opps[i].id} (${opps[i].deadline})`,
      );
    }
  });
});
