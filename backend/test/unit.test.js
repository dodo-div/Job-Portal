const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { once } = require('node:events');
const createApp = require('../app');
const getConfig = require('../config/env');
const { isPdf } = require('../services/resumeStorage');
const searchPeople = require('../services/exa');
const { integer, isObjectId, string } = require('../middleware/validation');

const valid = { MONGO_URI: 'mongodb://127.0.0.1:1/example', JWT_SECRET: 'unit-test-signing-secret-for-local-use' };

test('configuration validates required secrets, ports, proxy hops, and exact origins', () => {
  assert.throws(() => getConfig({}), /MONGO_URI/);
  assert.throws(() => getConfig({ ...valid, JWT_SECRET: 'short' }), /JWT_SECRET/);
  assert.throws(() => getConfig({ ...valid, PORT: '70000' }), /PORT/);
  assert.throws(() => getConfig({ ...valid, TRUST_PROXY_HOPS: '-1' }), /TRUST_PROXY_HOPS/);
  assert.throws(() => getConfig({ ...valid, CORS_ORIGINS: 'https://example.com/path' }), /CORS_ORIGINS/);
  assert.equal(getConfig(valid).trustProxy, 0);
});

test('validation accepts scalar frontend inputs and PDF signatures', () => {
  assert.equal(integer('10', 'count', 1, 10), 10);
  assert.equal(string('  Developer ', 'title', 30), 'Developer');
  assert.throws(() => integer(['2'], 'count', 1, 10), /Invalid count/);
  assert.equal(isObjectId('0'.repeat(24)), true);
  assert.equal(isObjectId('nope'), false);
  assert.equal(isPdf(Buffer.from('%PDF-1.7\n%%EOF\n')), true);
  assert.equal(isPdf(Buffer.from('%PDF-1.7\ntruncated')), false);
});

test('Exa uses server configuration for search and handles provider errors safely', async t => {
  await assert.rejects(searchPeople('', 'query', 1), { status: 503 });
  const mockedFetch = t.mock.method(globalThis, 'fetch');
  for (const status of [401, 403, 402, 429, 500]) {
    mockedFetch.mock.mockImplementationOnce(async () => new Response('private upstream body', { status }));
    await assert.rejects(searchPeople('fixture', 'query', 1), error => {
      assert.equal(error.status, status === 500 ? 502 : 503);
      assert.match(error.message, new RegExp('HTTP ' + status));
      assert.doesNotMatch(error.message, /private upstream body|fixture/);
      return true;
    });
  }
  mockedFetch.mock.mockImplementationOnce(async () => { throw new DOMException('simulated timeout', 'TimeoutError'); });
  await assert.rejects(searchPeople('fixture', 'query', 1), { status: 504 });
  assert.equal(mockedFetch.mock.calls.length, 6);
  const [, options] = mockedFetch.mock.calls[0].arguments;
  assert.equal(options.redirect, 'error');
  assert.equal(JSON.parse(options.body).numResults, 1);

  const profile = { title: 'Example profile', url: 'https://example.test/profile' };
  mockedFetch.mock.mockImplementationOnce(async () => Response.json({ results: [profile] }));
  const config = getConfig({ ...valid, EXA_API_KEY: ' fixture ' });
  assert.deepEqual(await searchPeople(config.exaApiKey, 'developer', 1), [profile]);
  const [url, searchOptions] = mockedFetch.mock.calls.at(-1).arguments;
  assert.equal(url, 'https://api.exa.ai/search');
  assert.equal(searchOptions.method, 'POST');
  assert.equal(searchOptions.headers['x-api-key'], 'fixture');
  assert.deepEqual(JSON.parse(searchOptions.body), {
    query: 'developer', category: 'people', type: 'auto', numResults: 1, contents: { text: false },
  });
});

let server;
let base;
before(async () => {
  server = createApp(getConfig(valid)).listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = 'http://127.0.0.1:' + server.address().port;
});
after(() => new Promise(resolve => server.close(resolve)));

test('HTTP middleware applies headers, validates JSON, denies malformed tokens, and hides private uploads', async () => {
  const root = await fetch(base, { headers: { Origin: 'http://localhost:3000' } });
  assert.equal(root.status, 200);
  assert.equal(root.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  assert.equal(root.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(root.headers.get('x-powered-by'), null);
  assert.equal((await fetch(base, { headers: { Origin: 'https://example.com' } })).headers.get('access-control-allow-origin'), null);
  const bad = await fetch(base + '/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"secret":',
  });
  assert.equal(bad.status, 400);
  assert.deepEqual(await bad.json(), { message: 'Malformed request' });
  assert.equal(bad.headers.get('cache-control'), 'no-store');
  assert.ok(bad.headers.get('x-request-id'));
  assert.equal((await fetch(base + '/api/auth/me', { headers: { Authorization: 'Bearer invalid' } })).status, 401);
  assert.equal((await fetch(base + '/uploads/resume.pdf')).status, 404);
});

test('registration rejects admin and rate-limits repeated attempts', async () => {
  const call = () => fetch(base + '/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'tester@example.test', password: 'password', role: 'admin' }),
  });
  for (let i = 0; i < 10; i++) {
    const response = await call();
    assert.equal(response.status, 400);
    await response.arrayBuffer();
  }
  const limited = await call();
  assert.equal(limited.status, 429);
  assert.ok(limited.headers.get('retry-after'));
});
