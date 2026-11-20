/**
 * store.ts — localStorage-backed reactive state store.
 *
 * Usage:
 *   const counter = createStore('counter', 0);
 *   counter.subscribe(v => console.log(v));
 *   counter.set(n => n + 1);
 */

export interface Store<T> {
  /** Return the current value. */
  get(): T;
  /** Replace the value (or pass an updater). Persists and notifies subscribers. */
  set(next: T | ((current: T) => T)): void;
  /** Register a listener; returns an unsubscribe function. */
  subscribe(fn: (value: T) => void): () => void;
  /** Restore initial value and persist. */
  reset(): void;
}

const PREFIX = 'skelekit:';

export function createStore<T>(key: string, initial: T): Store<T> {
  const storageKey = PREFIX + key;

  // --- hydrate from storage -------------------------------------------
  let current: T = initial;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw !== null) {
      current = JSON.parse(raw) as T;
    }
  } catch {
    // absent, corrupt, or storage disabled — stay with initial
  }

  const subscribers = new Set<(value: T) => void>();

  function persist(value: T): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // quota exceeded or storage disabled — degrade silently to in-memory
    }
  }

  function notify(value: T): void {
    subscribers.forEach(fn => fn(value));
  }

  return {
    get(): T {
      return current;
    },

    set(next: T | ((current: T) => T)): void {
      const nextValue =
        typeof next === 'function'
          ? (next as (c: T) => T)(current)
          : next;
      current = nextValue;
      persist(current);
      notify(current);
    },

    subscribe(fn: (value: T) => void): () => void {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },

    reset(): void {
      current = initial;
      persist(current);
      notify(current);
    },
  };
}
