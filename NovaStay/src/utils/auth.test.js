import test from 'node:test';
import assert from 'node:assert/strict';
import { refreshToken, setupFetchInterceptor } from './auth.js';

test('refresh requests share failures, respect Retry-After and preserve the session', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  try {
    values.set('ns_account', JSON.stringify({ refreshToken: 'test-refresh-one' }));
    values.set('ns_dashboard', 'resident');
    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return new Response('{}', { status: 429, headers: { 'Retry-After': '30' } });
    };
    const results = await Promise.allSettled([refreshToken(), refreshToken(), refreshToken()]);
    assert.equal(calls, 1);
    assert.ok(results.every(result => result.status === 'rejected' && result.reason.status === 429));
    await assert.rejects(refreshToken(), error => error.status === 429);
    assert.equal(calls, 1);
    assert.ok(values.has('ns_account'));
    assert.equal(values.get('ns_dashboard'), 'resident');

    // A different session is not blocked by the previous token's cooldown.
    values.set('ns_account', JSON.stringify({ refreshToken: 'test-refresh-two' }));
    globalThis.fetch = async () => { throw new Error('offline'); };
    const offline = await Promise.allSettled([refreshToken(), refreshToken()]);
    assert.ok(offline.every(result => result.status === 'rejected'));
    assert.ok(values.has('ns_account'));

    globalThis.fetch = async () => new Response('{}', { status: 401 });
    await assert.rejects(refreshToken());
    assert.equal(values.has('ns_account'), false);
    assert.equal(values.has('ns_dashboard'), false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalStorage;
  }
});

test('a late refresh cannot restore a signed-out session', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  const values = new Map([['ns_account', JSON.stringify({ refreshToken: 'test-late-refresh' })]]);
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  try {
    let respond;
    globalThis.fetch = () => new Promise(resolve => { respond = resolve; });
    const pending = refreshToken();
    values.delete('ns_account');
    respond(new Response(JSON.stringify({ accessToken: 'test-access' }), { status: 200 }));
    await assert.rejects(pending, /Session changed/);
    assert.equal(values.has('ns_account'), false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalStorage;
  }
});

test('an intercepted request receives 429 instead of sending an expired access token', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  const originalWindow = globalThis.window;
  const values = new Map([['ns_account', JSON.stringify({ refreshToken: 'test-interceptor',
    accessToken: 'test-expired', accessTokenExpiresAt: '2000-01-01T00:00:00Z' })]]);
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  try {
    let protectedCalls = 0;
    globalThis.fetch = async () => new Response('{}', { status: 429, headers: { 'Retry-After': '15' } });
    globalThis.window = { fetch: async () => { protectedCalls++; return new Response('{}'); } };
    setupFetchInterceptor();
    const response = await window.fetch('/api/billing/invoices', { headers: { Authorization: 'Bearer test-expired' } });
    assert.equal(response.status, 429);
    assert.equal(response.headers.get('Retry-After'), '15');
    assert.equal(protectedCalls, 0);
    assert.ok(values.has('ns_account'));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalStorage;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});
