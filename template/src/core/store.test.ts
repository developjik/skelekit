/**
 * store.test.ts
 * Runs with: tsx --test src/core/store.test.ts
 */
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ── Minimal localStorage stub ─────────────────────────────────────────────
class FakeStorage {
  private data: Record<string, string> = {};
  getItem(k: string): string | null { return this.data[k] ?? null; }
  setItem(k: string, v: string): void { this.data[k] = v; }
  removeItem(k: string): void { delete this.data[k]; }
  clear(): void { this.data = {}; }
}

const fakeStorage = new FakeStorage();

// Inject before importing store (Node has no globalThis.localStorage)
before(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: fakeStorage,
    writable: true,
    configurable: true,
  });
});

// Lazy import AFTER the global is set up
let createStore: typeof import('./store.js').createStore;
before(async () => {
  ({ createStore } = await import('./store.js'));
});

beforeEach(() => fakeStorage.clear());

// ─────────────────────────────────────────────────────────────────────────
describe('createStore', () => {
  it('returns the initial value', () => {
    const s = createStore('test', 42);
    assert.equal(s.get(), 42);
  });

  it('set() with a plain value', () => {
    const s = createStore('test', 0);
    s.set(7);
    assert.equal(s.get(), 7);
  });

  it('set() with an updater function', () => {
    const s = createStore('test', 10);
    s.set(n => n + 5);
    assert.equal(s.get(), 15);
  });

  it('notifies subscribers synchronously on set()', () => {
    const s = createStore('test', 'a');
    const log: string[] = [];
    s.subscribe(v => log.push(v));
    s.set('b');
    s.set('c');
    assert.deepEqual(log, ['b', 'c']);
  });

  it('unsubscribe stops notifications', () => {
    const s = createStore('test', 0);
    const log: number[] = [];
    const unsub = s.subscribe(v => log.push(v));
    s.set(1);
    unsub();
    s.set(2);
    assert.deepEqual(log, [1]);
  });

  it('persists to localStorage under skelekit:<key>', () => {
    const s = createStore('visits', 0);
    s.set(3);
    const raw = fakeStorage.getItem('skelekit:visits');
    assert.equal(raw, '3');
  });

  it('hydrates from existing localStorage value', () => {
    fakeStorage.setItem('skelekit:saved', '{"x":99}');
    const s = createStore('saved', { x: 0 });
    assert.deepEqual(s.get(), { x: 99 });
  });

  it('falls back to initial when stored JSON is corrupt', () => {
    fakeStorage.setItem('skelekit:bad', 'NOT_JSON{{{');
    const s = createStore('bad', 'fallback');
    assert.equal(s.get(), 'fallback');
  });

  it('reset() restores initial and notifies', () => {
    const s = createStore('test', 5);
    const log: number[] = [];
    s.subscribe(v => log.push(v));
    s.set(99);
    s.reset();
    assert.equal(s.get(), 5);
    assert.deepEqual(log, [99, 5]);
  });

  it('reset() persists the initial value', () => {
    const s = createStore('resetkey', 0);
    s.set(42);
    s.reset();
    const raw = fakeStorage.getItem('skelekit:resetkey');
    assert.equal(raw, '0');
  });
});
