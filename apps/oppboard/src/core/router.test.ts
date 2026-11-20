/**
 * router.test.ts
 * Tests the pure matchRoute helper — no DOM required.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { matchRoute } from './router.js';
import type { Route } from './router.js';

function fakeRoute(path: string): Route {
  return { path, view: () => ({ tagName: 'DIV' } as unknown as HTMLElement) };
}

describe('matchRoute', () => {
  it('matches exact path', () => {
    const routes = [fakeRoute('#/'), fakeRoute('#/about')];
    const result = matchRoute('#/about', routes);
    assert.ok(result);
    assert.equal(result.route.path, '#/about');
    assert.deepEqual(result.params, {});
  });

  it('matches root hash #/', () => {
    const routes = [fakeRoute('#/'), fakeRoute('#/other')];
    const result = matchRoute('#/', routes);
    assert.ok(result);
    assert.equal(result.route.path, '#/');
  });

  it('extracts a single :param', () => {
    const routes = [fakeRoute('#/item/:id')];
    const result = matchRoute('#/item/42', routes);
    assert.ok(result);
    assert.deepEqual(result.params, { id: '42' });
  });

  it('extracts multiple :params', () => {
    const routes = [fakeRoute('#/user/:uid/post/:pid')];
    const result = matchRoute('#/user/7/post/99', routes);
    assert.ok(result);
    assert.deepEqual(result.params, { uid: '7', pid: '99' });
  });

  it('returns null for no match', () => {
    const routes = [fakeRoute('#/home'), fakeRoute('#/about')];
    const result = matchRoute('#/missing', routes);
    assert.equal(result, null);
  });

  it('returns null when segment counts differ', () => {
    const routes = [fakeRoute('#/a/b')];
    const result = matchRoute('#/a', routes);
    assert.equal(result, null);
  });

  it('first route wins when multiple match', () => {
    const routes = [fakeRoute('#/item/:id'), fakeRoute('#/item/special')];
    const result = matchRoute('#/item/special', routes);
    assert.ok(result);
    assert.equal(result.route.path, '#/item/:id');
  });

  it('decodes URI-encoded params', () => {
    const routes = [fakeRoute('#/search/:q')];
    const result = matchRoute('#/search/hello%20world', routes);
    assert.ok(result);
    assert.equal(result.params.q, 'hello world');
  });

  it('handles hash without leading # gracefully', () => {
    const routes = [fakeRoute('#/about')];
    const result = matchRoute('/about', routes);
    assert.ok(result);
    assert.equal(result.route.path, '#/about');
  });
});
