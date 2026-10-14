import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { previewOrigin, run, validateArtifact } from './pr-preview.mjs';

const sha = 'a'.repeat(40);
const url = 'https://pr-12.preview.leandrooriente.com';
const legacyURL = 'https://pr-12-leandrooriente-site.example.workers.dev';
const deploymentURL = 'https://deployment-pr-12.preview.leandrooriente.com';
const marker = '<!-- cloudflare-pr-preview -->';
const pr = { state: 'open', head: { sha, repo: { full_name: 'owner/site' } }, user: { type: 'User', login: 'owner' } };
const preview = { name: 'pr-12', urls: [legacyURL, deploymentURL, url] };
const domain = {
  hostname: 'preview.leandrooriente.com', service: 'leandrooriente-site',
  zone_name: 'leandrooriente.com', enabled: false, previews_enabled: true
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
const cf = result => json({ success: true, result });
const absent = () => json({ success: false, errors: [{ code: 10025 }] }, 404);

async function fixture(t) {
  const temporary = await mkdtemp(join(tmpdir(), 'pr-preview-test-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const artifact = join(temporary, 'artifact');
  await mkdir(join(artifact, 'writing'), { recursive: true });
  const pages = Object.fromEntries(['/', '/writing/'].map(path => [path,
    `<html><link rel="canonical" href="${url}${path}"><p>${path}</p></html>`]));
  await writeFile(join(artifact, 'index.html'), pages['/']);
  await writeFile(join(artifact, 'writing', 'index.html'), pages['/writing/']);
  const eventPath = join(temporary, 'event.json');
  await writeFile(eventPath, JSON.stringify({ pull_request: { number: 12 } }));
  const env = {
    GH_TOKEN: 'github-test-token', CLOUDFLARE_API_TOKEN: 'cloudflare-test-token',
    GITHUB_REPOSITORY: 'owner/site', GITHUB_RUN_ID: '123', GITHUB_EVENT_PATH: eventPath,
    GITHUB_OUTPUT: join(temporary, 'outputs'), RUNNER_TEMP: temporary,
    PREVIEW_ARTIFACT_DIR: artifact, PREVIEW_SHA: sha, PREVIEW_URL: url,
    PATH: process.env.PATH, HOME: process.env.HOME
  };
  const calls = [];
  const state = {
    pr, preview, domains: [domain], domainWrites: [], comments: [], prReads: 0,
    uploads: 0, posted: [], deleted: 0, noindex: true
  };
  const fetchImpl = async (value, options = {}) => {
    const endpoint = new URL(value);
    const method = options.method || 'GET';
    calls.push({ url: value, method, options });
    if (endpoint.hostname === 'api.github.com') {
      if (endpoint.pathname.endsWith('/pulls/12')) {
        state.prReads++;
        return json(typeof state.pr === 'function' ? state.pr(state.prReads) : state.pr);
      }
      if (method === 'GET' && endpoint.pathname.endsWith('/issues/12/comments')) {
        return json(state.comments[Number(endpoint.searchParams.get('page')) - 1] || []);
      }
      if (['PATCH', 'POST'].includes(method)) {
        state.posted.push({ path: endpoint.pathname, method, body: JSON.parse(options.body).body });
        return json({ id: 99 });
      }
    }
    if (endpoint.hostname === 'api.cloudflare.com') {
      if (endpoint.pathname.endsWith('/workers/domains')) {
        if (method === 'GET') {
          assert.equal(endpoint.searchParams.get('hostname'), domain.hostname);
          return cf(state.domains);
        }
        assert.equal(method, 'PUT');
        assert.deepEqual(JSON.parse(options.body), domain);
        state.domainWrites.push(JSON.parse(options.body));
        state.domains = [domain];
        return cf(state.createdDomain || domain);
      }
      if (method === 'DELETE') {
        state.deleted++;
        return state.preview ? cf(null) : absent();
      }
      if (method === 'POST') {
        assert.equal(endpoint.searchParams.get('ignore_base_config'), 'true');
        assert.deepEqual(JSON.parse(options.body), { name: 'pr-12' });
        state.preview = preview;
        return cf(preview);
      }
      return state.preview ? cf(state.preview) : absent();
    }
    assert.equal(endpoint.origin, url);
    assert.equal(options.headers, undefined, 'Public probes must not include credentials');
    return pages[endpoint.pathname]
      ? new Response(pages[endpoint.pathname], { headers: {
        'Content-Type': 'text/html', ...(state.noindex ? { 'X-Robots-Tag': 'noindex' } : {})
      } })
      : new Response('Missing', { status: 404 });
  };
  const upload = async (binary, args, options) => {
    state.uploads++;
    assert.equal(binary, 'npx');
    assert.deepEqual(args.slice(0, 3), ['--yes', 'wrangler@4.149.0', 'preview']);
    assert.equal(args.includes('deploy'), false);
    const config = JSON.parse(await readFile(args[args.indexOf('--config') + 1], 'utf8'));
    assert.equal(config.name, 'leandrooriente-site');
    assert.equal(config.account_id, 'fb873ce280424623e0e7c2733ec85d0c');
    assert.equal(config.workers_dev, false);
    assert.equal(config.preview_urls, true);
    assert.deepEqual(config.previews, {});
    assert.deepEqual(config.assets, { directory: artifact, html_handling: 'auto-trailing-slash', not_found_handling: 'none' });
    for (const field of ['build', 'main', 'routes', 'bindings', 'vars']) assert.equal(field in config, false);
    assert.ok(options.cwd.startsWith(temporary + '/'));
    assert.notEqual(options.cwd, artifact);
    assert.equal(options.env.GH_TOKEN, undefined);
    assert.notEqual(options.env.NPM_CONFIG_USERCONFIG, options.env.NPM_CONFIG_GLOBALCONFIG);
    assert.equal(await readFile(options.env.NPM_CONFIG_USERCONFIG, 'utf8'), '');
    assert.equal(await readFile(options.env.NPM_CONFIG_GLOBALCONFIG, 'utf8'), '');
    assert.match(await readFile(join(artifact, '_headers'), 'utf8'), /\/\*\n  X-Robots-Tag: noindex\n/);
    await writeFile(options.env.WRANGLER_OUTPUT_FILE_PATH, JSON.stringify({
      type: 'preview', worker_name: 'leandrooriente-site', preview_name: 'pr-12', preview_urls: preview.urls,
      deployment_urls: ['https://upload-leandrooriente-site.example.workers.dev']
    }) + '\n');
  };
  return { env, state, calls, fetchImpl, upload, artifact, temporary, pages };
}

test('prepare creates metadata once and retains the stable URL on updates', async t => {
  const f = await fixture(t);
  f.state.preview = null;
  await run('prepare', f);
  await run('prepare', f);
  assert.equal(f.calls.filter(call => call.method === 'POST').length, 1);
  assert.match(await readFile(f.env.GITHUB_OUTPUT, 'utf8'), new RegExp(`active=true\\nsha=${sha}\\nurl=${url}`));
  assert.equal(f.state.domainWrites.length, 0);
  assert.equal(f.state.uploads, 0);
});

test('prepare creates the preview-only domain once before preview metadata', async t => {
  const f = await fixture(t);
  f.state.domains = [];
  f.state.preview = null;
  await run('prepare', f);
  await run('prepare', f);
  assert.deepEqual(f.state.domainWrites, [domain]);
  const mutations = f.calls.filter(call => ['POST', 'PUT'].includes(call.method));
  assert.deepEqual(mutations.map(call => call.method), ['PUT', 'POST']);
  assert.ok(mutations[0].url.endsWith('/workers/domains'));
  assert.match(await readFile(f.env.GITHUB_OUTPUT, 'utf8'), /url=https:\/\/pr-12\.preview\.leandrooriente\.com\n/);
});

test('prepare accepts an existing production preview-only domain without changing it', async t => {
  const f = await fixture(t);
  f.state.domains = [{ ...domain, environment: 'production' }];
  await run('prepare', f);
  assert.equal(f.state.domainWrites.length, 0);
});

test('prepare never overwrites conflicting domain ownership or traffic settings', async t => {
  for (const conflict of [
    { service: 'another-worker' }, { zone_name: 'example.com' }, { environment: 'staging' },
    { enabled: true }, { previews_enabled: false }, { enabled: undefined }, { previews_enabled: undefined }
  ]) {
    const f = await fixture(t);
    f.state.domains = [{ ...domain, ...conflict }];
    f.state.preview = null;
    await assert.rejects(() => run('prepare', f), /domain/i);
    assert.equal(f.state.domainWrites.length, 0);
    assert.equal(f.calls.some(call => call.method === 'POST'), false);
  }
});

test('prepare rejects ambiguous or unexpected domain lookup results', async t => {
  for (const domains of [[domain, domain], [{ ...domain, hostname: 'elsewhere.leandrooriente.com' }], {}]) {
    const f = await fixture(t);
    f.state.domains = domains;
    await assert.rejects(() => run('prepare', f), /domain/i);
    assert.equal(f.state.domainWrites.length, 0);
  }
});

test('prepare verifies a newly registered domain before creating preview metadata', async t => {
  const f = await fixture(t);
  f.state.domains = [];
  f.state.preview = null;
  f.state.createdDomain = { ...domain, enabled: true };
  await assert.rejects(() => run('prepare', f), /domain/i);
  assert.equal(f.state.domainWrites.length, 1);
  assert.equal(f.calls.some(call => call.method === 'POST'), false);
});

test('prepare fails when the preview has only legacy or deployment-specific URLs', async t => {
  const f = await fixture(t);
  f.state.preview = { ...preview, urls: [legacyURL, deploymentURL] };
  await assert.rejects(() => run('prepare', f), /custom|expected|preview\.leandrooriente\.com/i);
});

test('fork and Dependabot pull requests never use the Cloudflare API', async t => {
  for (const denied of [
    { ...pr, head: { ...pr.head, repo: { full_name: 'fork/site' } } },
    { ...pr, user: { type: 'Bot', login: 'dependabot[bot]' } }
  ]) {
    const f = await fixture(t);
    f.state.pr = denied;
    await run('prepare', f);
    assert.equal(f.calls.some(call => call.url.includes('api.cloudflare.com')), false);
    assert.equal(await readFile(f.env.GITHUB_OUTPUT, 'utf8'), 'active=false\n');
  }
});

test('same-repository pull requests from other bots can receive previews', async t => {
  const f = await fixture(t);
  f.state.pr = { ...pr, user: { type: 'Bot', login: 'repository-app[bot]' } };
  await run('prepare', f);
  assert.match(await readFile(f.env.GITHUB_OUTPUT, 'utf8'), /active=true/);
});

test('closed prepare is idempotent and does not create a comment before any deployment', async t => {
  const f = await fixture(t);
  f.state.pr = { ...pr, state: 'closed' };
  f.state.preview = null;
  await run('prepare', f);
  assert.equal(f.state.deleted, 1);
  assert.equal(f.state.posted.length, 0);
  assert.equal(await readFile(f.env.GITHUB_OUTPUT, 'utf8'), 'active=false\n');
});

test('cleanup for a reopened pull request leaves its preview intact', async t => {
  const f = await fixture(t);
  await run('cleanup', f);
  assert.equal(f.state.deleted, 0);
  assert.equal(f.state.posted.length, 0);
});

test('outdated builds cannot upload or comment', async t => {
  const f = await fixture(t);
  f.state.pr = { ...pr, head: { ...pr.head, sha: 'b'.repeat(40) } };
  await run('publish', f);
  assert.equal(f.state.uploads, 0);
  assert.equal(f.state.posted.length, 0);
});

test('a head change during preparation prevents uploading', async t => {
  const f = await fixture(t);
  f.state.pr = read => read === 1 ? pr : { ...pr, head: { ...pr.head, sha: 'b'.repeat(40) } };
  await run('publish', f);
  assert.equal(f.state.uploads, 0);
});

test('publish uploads only assets and creates one verified preview comment', async t => {
  const f = await fixture(t);
  await writeFile(join(f.artifact, '_headers'), '/assets/*\n  Cache-Control: public, max-age=31536000\n');
  await run('publish', f);
  assert.match(await readFile(join(f.artifact, '_headers'), 'utf8'), /^\/assets\/\*\n  Cache-Control: public, max-age=31536000\n/);
  assert.equal(f.state.uploads, 1);
  assert.equal(f.state.posted.length, 1);
  assert.equal(f.state.posted[0].method, 'POST');
  assert.match(f.state.posted[0].body, /commit `aaaaaaa`/);
  assert.match(f.state.posted[0].body, /### Cloudflare preview/);
  assert.ok(f.state.posted[0].body.startsWith(marker));
});

test('verification retries propagation failures without uploading twice', async t => {
  const f = await fixture(t);
  const pauses = [];
  let rootRequests = 0;
  const fetchImpl = (value, options) => value === url + '/' && ++rootRequests === 1
    ? Promise.resolve(new Response('Not propagated', { status: 503 }))
    : f.fetchImpl(value, options);
  await run('publish', { ...f, fetchImpl, pause: async milliseconds => pauses.push(milliseconds) });
  assert.equal(rootRequests, 2);
  assert.deepEqual(pauses, [10000]);
  assert.equal(f.state.uploads, 1);
  assert.equal(f.state.posted.length, 1);
});

test('publish requires noindex on every verified page before commenting', async t => {
  const f = await fixture(t);
  const pauses = [];
  const fetchImpl = async (value, options) => {
    const response = await f.fetchImpl(value, options);
    if (value === url + '/writing/') response.headers.delete('X-Robots-Tag');
    return response;
  };
  await assert.rejects(() => run('publish', {
    ...f, fetchImpl, pause: async milliseconds => pauses.push(milliseconds)
  }), /verification/i);
  assert.deepEqual(pauses, Array(11).fill(10000));
  assert.equal(f.state.uploads, 1);
  assert.equal(f.state.posted.length, 0);
});

test('comment updates paginate and require the Actions bot plus the exact marker', async t => {
  const f = await fixture(t);
  f.state.comments = [Array.from({ length: 100 }, (_, id) => ({
    id, body: marker, user: { login: 'owner', type: 'User' }
  })), [{ id: 777, body: marker + '\nOld preview', user: { login: 'github-actions[bot]', type: 'Bot' } }]];
  await run('publish', f);
  assert.deepEqual(f.state.posted.map(item => [item.method, item.path]), [['PATCH', '/repos/owner/site/issues/comments/777']]);
});

test('closing during an upload deletes the preview and edits its existing comment', async t => {
  const f = await fixture(t);
  f.state.pr = read => read < 3 ? pr : { ...pr, state: 'closed' };
  f.state.comments = [[{ id: 42, body: marker, user: { login: 'github-actions[bot]', type: 'Bot' } }]];
  await run('publish', f);
  assert.equal(f.state.uploads, 1);
  assert.equal(f.state.deleted, 1);
  assert.equal(f.state.posted[0].method, 'PATCH');
  assert.match(f.state.posted[0].body, /Preview removed/);
});

test('a new push during an upload prevents an obsolete comment update', async t => {
  const f = await fixture(t);
  f.state.pr = read => read < 3 ? pr : { ...pr, head: { ...pr.head, sha: 'b'.repeat(40) } };
  await run('publish', f);
  assert.equal(f.state.uploads, 1);
  assert.equal(f.state.posted.length, 0);
});

test('a build with the production origin cannot upload', async t => {
  const f = await fixture(t);
  await writeFile(join(f.artifact, 'index.html'), '<link rel="canonical" href="https://leandrooriente.com/">');
  await assert.rejects(() => run('publish', f), /prepared preview origin/);
  assert.equal(f.state.uploads, 0);
});

test('bad origins and artifact links are rejected before uploading', async t => {
  for (const bad of ['https://leandrooriente.com', url + '/other', url + '?q=1',
    url + '#fragment', url.replace('pr-12.', 'pr-13.'), url.replace('https:', 'http:'),
    url.replace('https://', 'https://user@'), url.replace('.com', '.com:8443'),
    url.replace('.com', '.com.evil.example'), legacyURL, deploymentURL]) {
    assert.throws(() => previewOrigin(bad, 'pr-12'));
  }
  assert.equal(previewOrigin(url, 'pr-12'), url);
  const f = await fixture(t);
  await symlink(join(f.temporary, 'event.json'), join(f.artifact, 'linked.json'));
  await assert.rejects(() => run('publish', f), /symbolic links/);
  await assert.rejects(() => validateArtifact(f.temporary, f.temporary), /temporary directory/);
  assert.equal(f.state.uploads, 0);
});

test('Cloudflare authorization failures never become preview creation', async t => {
  const f = await fixture(t);
  const fetchImpl = (value, options) => value.includes('api.cloudflare.com')
    ? Promise.resolve(json({ success: false, errors: [{ code: 10000 }] }, 403))
    : f.fetchImpl(value, options);
  await assert.rejects(() => run('prepare', { ...f, fetchImpl }), /403; codes 10000/);
  assert.equal(f.calls.some(call => call.method === 'POST'), false);
});
