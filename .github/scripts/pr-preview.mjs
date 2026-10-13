import { execFile } from 'node:child_process';
import { appendFile, lstat, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const account = 'fb873ce280424623e0e7c2733ec85d0c';
const worker = 'leandrooriente-site';
const marker = '<!-- cloudflare-pr-preview -->';
const execute = promisify(execFile);

export function previewOrigin(value, name) {
  const url = new URL(value);
  const hostname = new RegExp(`^${name}-${worker}\\.[a-z0-9][a-z0-9-]*\\.workers\\.dev$`);
  if (url.protocol !== 'https:' || !hostname.test(url.hostname) || url.port ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Cloudflare returned an unexpected preview origin.');
  }
  return url.origin;
}

function resourceOrigin(preview, name) {
  if (preview?.name !== name || !Array.isArray(preview.urls)) {
    throw new Error('Cloudflare returned an unexpected preview resource.');
  }
  for (const value of preview.urls) {
    try { return previewOrigin(value, name); } catch { /* Try the workers.dev URL. */ }
  }
  throw new Error('The preview has no expected workers.dev URL; enable Worker previews before retrying.');
}

export async function validateArtifact(directory, temporaryDirectory) {
  const root = resolve(directory);
  if (!root.startsWith(resolve(temporaryDirectory) + sep)) {
    throw new Error('The preview artifact must be inside the runner temporary directory.');
  }
  async function visit(path) {
    const stat = await lstat(path);
    if (stat.isSymbolicLink()) throw new Error('Preview artifacts cannot contain symbolic links.');
    if (stat.isDirectory()) {
      for (const entry of await readdir(path)) await visit(join(path, entry));
    } else if (!stat.isFile()) {
      throw new Error('Preview artifacts must contain only regular files and directories.');
    }
  }
  if (!(await lstat(root)).isDirectory()) throw new Error('The preview artifact is not a directory.');
  await visit(root);
  await readFile(join(root, 'index.html'));
  await readFile(join(root, 'writing', 'index.html'));
  return root;
}

export async function run(command, { env = process.env, fetchImpl = fetch, upload = execute, pause = delay } = {}) {
  if (!['prepare', 'publish', 'cleanup'].includes(command)) throw new Error('Use prepare, publish, or cleanup.');
  if (!env.GH_TOKEN || !env.CLOUDFLARE_API_TOKEN) {
    throw new Error('GitHub and CLOUDFLARE_API_TOKEN credentials are required for preview automation.');
  }
  if (!/^[\w.-]+\/[\w.-]+$/.test(env.GITHUB_REPOSITORY || '') || !/^\d+$/.test(env.GITHUB_RUN_ID || '')) {
    throw new Error('Missing or invalid GitHub run identity.');
  }
  const event = JSON.parse(await readFile(env.GITHUB_EVENT_PATH, 'utf8'));
  const number = event.pull_request?.number;
  if (!Number.isSafeInteger(number) || number < 1) throw new Error('Missing pull request number.');
  const name = `pr-${number}`;
  const githubPath = `/repos/${env.GITHUB_REPOSITORY}`;
  const cloudflarePath = `/accounts/${account}/workers/workers/${worker}/previews`;
  const runURL = `https://github.com/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`;

  async function request(service, path, { method = 'GET', body, allowMissing = false } = {}) {
    const cloudflare = service === 'Cloudflare';
    const origin = cloudflare ? 'https://api.cloudflare.com/client/v4' : 'https://api.github.com';
    let response;
    try {
      response = await fetchImpl(origin + path, {
        method,
        headers: {
          Authorization: `Bearer ${cloudflare ? env.CLOUDFLARE_API_TOKEN : env.GH_TOKEN}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(cloudflare ? {} : { 'X-GitHub-Api-Version': '2022-11-28' })
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(30000)
      });
    } catch {
      throw new Error(`${service} ${method} request failed before receiving a response.`);
    }
    let data;
    try { data = await response.json(); } catch { throw new Error(`${service} returned invalid JSON (${response.status}).`); }
    const codes = cloudflare ? (data.errors || []).map(error => error.code) : [];
    if (allowMissing && response.status === 404 && codes.includes(10025)) return null;
    if (!response.ok || (cloudflare && data.success !== true)) {
      throw new Error(`${service} ${method} rejected (${response.status}${codes.length ? `; codes ${codes.join(', ')}` : ''}).`);
    }
    return cloudflare ? data.result : data;
  }

  const github = (path, options) => request('GitHub', githubPath + path, options);
  const cloudflare = (path, options) => request('Cloudflare', cloudflarePath + path, options);
  const currentPR = () => github(`/pulls/${number}`);
  const permitted = pr => pr.head?.repo?.full_name === env.GITHUB_REPOSITORY &&
    pr.user?.login !== 'dependabot[bot]';

  async function comment(body, create) {
    let existing;
    for (let page = 1; ; page++) {
      const comments = await github(`/issues/${number}/comments?per_page=100&page=${page}`);
      existing = comments.find(item => item.user?.login === 'github-actions[bot]' &&
        item.user.type === 'Bot' && item.body?.startsWith(marker));
      if (existing || comments.length < 100) break;
    }
    if (existing) {
      await github(`/issues/comments/${existing.id}`, { method: 'PATCH', body: { body } });
    } else if (create) {
      await github(`/issues/${number}/comments`, { method: 'POST', body: { body } });
    }
  }

  async function cleanup() {
    await cloudflare(`/${name}`, { method: 'DELETE', allowMissing: true });
    await comment(`${marker}\n### Cloudflare preview\n\nPreview removed because this pull request is closed.\n\n[Workflow run](${runURL})`, false);
    console.log(`Removed preview ${name}, if present.`);
  }

  async function activePR(sha) {
    const pr = await currentPR();
    if (!permitted(pr)) return null;
    if (pr.state === 'closed') {
      await cleanup();
      return null;
    }
    if (pr.state !== 'open' || (sha && pr.head.sha !== sha)) return null;
    return pr;
  }

  async function output(values) {
    if (env.GITHUB_OUTPUT) {
      await appendFile(env.GITHUB_OUTPUT, Object.entries(values).map(([key, value]) => `${key}=${value}\n`).join(''));
    }
  }

  if (command === 'cleanup') {
    const pr = await currentPR();
    if (permitted(pr) && pr.state === 'closed') await cleanup();
    return;
  }

  if (command === 'prepare') {
    const pr = await activePR();
    if (!pr) return output({ active: false });
    if (!/^[a-f0-9]{40}$/.test(pr.head.sha)) throw new Error('GitHub returned an invalid commit SHA.');
    let preview = await cloudflare(`/${name}`, { allowMissing: true });
    if (!preview) {
      preview = await cloudflare('?ignore_base_config=true', { method: 'POST', body: { name } });
    }
    const url = resourceOrigin(preview, name);
    await output({ active: true, sha: pr.head.sha, url });
    console.log(`Prepared ${name}: ${url}`);
    return;
  }

  const sha = env.PREVIEW_SHA;
  if (!/^[a-f0-9]{40}$/.test(sha || '')) throw new Error('Missing or invalid prepared commit SHA.');
  const url = previewOrigin(env.PREVIEW_URL, name);
  if (!(await activePR(sha))) {
    console.log('Skipped an outdated or closed pull request build.');
    return;
  }
  const preview = await cloudflare(`/${name}`);
  if (resourceOrigin(preview, name) !== url) throw new Error('The prepared preview origin has changed.');
  const directory = await validateArtifact(env.PREVIEW_ARTIFACT_DIR, env.RUNNER_TEMP);
  const pages = await Promise.all(['/', '/writing/'].map(async path => {
    const expected = await readFile(join(directory, path === '/' ? 'index.html' : 'writing/index.html'), 'utf8');
    if (!expected.includes(`<link rel="canonical" href="${url}${path}"`)) {
      throw new Error('The build does not use the prepared preview origin.');
    }
    return { path, expected };
  }));
  const temporary = await mkdtemp(join(env.RUNNER_TEMP, 'pr-preview-deploy-'));
  const configPath = join(temporary, 'wrangler.jsonc');
  const outputPath = join(temporary, 'wrangler-output.jsonl');
  const userConfig = join(temporary, 'user.npmrc');
  const globalConfig = join(temporary, 'global.npmrc');
  await writeFile(userConfig, '');
  await writeFile(globalConfig, '');
  await writeFile(configPath, JSON.stringify({
    name: worker,
    account_id: account,
    compatibility_date: '2026-10-11',
    workers_dev: false,
    preview_urls: true,
    previews: {},
    assets: { directory, html_handling: 'auto-trailing-slash', not_found_handling: 'none' }
  }));
  if (!(await activePR(sha))) {
    console.log('Skipped uploading an outdated or closed pull request build.');
    return;
  }
  try {
    await upload('npx', ['--yes', 'wrangler@4.149.0', 'preview', '--config', configPath,
      '--name', name, '--ignore-base-config', '--json'], {
      cwd: temporary,
      env: {
        PATH: env.PATH,
        HOME: env.HOME,
        CI: 'true',
        CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN,
        WRANGLER_SEND_METRICS: 'false',
        WRANGLER_OUTPUT_FILE_PATH: outputPath,
        NPM_CONFIG_USERCONFIG: userConfig,
        NPM_CONFIG_GLOBALCONFIG: globalConfig
      },
      maxBuffer: 16 * 1024 * 1024,
      timeout: 5 * 60 * 1000
    });
  } catch {
    throw new Error('Wrangler failed to upload the native preview. Production was not deployed.');
  }
  const entries = (await readFile(outputPath, 'utf8')).trim().split('\n').map(line => JSON.parse(line));
  const deployed = entries.find(entry => entry.type === 'preview');
  if (deployed?.worker_name !== worker || deployed.preview_name !== name ||
      resourceOrigin({ name: deployed.preview_name, urls: deployed.preview_urls }, name) !== url) {
    throw new Error('Wrangler did not confirm the expected Worker preview and origin.');
  }

  for (let attempt = 1; ; attempt++) {
    try {
      for (const { path, expected } of pages) {
        const response = await fetchImpl(url + path, { redirect: 'error', signal: AbortSignal.timeout(30000) });
        if (response.status !== 200 || !(response.headers.get('content-type') || '').includes('text/html') ||
            await response.text() !== expected) {
          throw new Error(`The uploaded preview failed verification at ${path}.`);
        }
      }
      const missing = await fetchImpl(`${url}/__preview-missing-${env.GITHUB_RUN_ID}`, {
        redirect: 'error', signal: AbortSignal.timeout(30000)
      });
      if (missing.status !== 404) throw new Error('The preview did not return 404 for a nonexistent path.');
      break;
    } catch {
      if (attempt === 6) throw new Error('The uploaded preview failed verification after six attempts.');
      console.log(`Preview verification is pending; retrying in 5 seconds (attempt ${attempt}/6).`);
      await pause(5000);
    }
  }
  if (!(await activePR(sha))) {
    console.log('Skipped commenting on an outdated or closed pull request build.');
    return;
  }
  await comment(`${marker}\n### Cloudflare preview\n\nPreview: [${url}](${url})\n\nUpdated for commit \`${sha.slice(0, 7)}\`. [Workflow run](${runURL})`, true);
  console.log(`Published ${name} for ${sha}: ${url}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  run(process.argv[2]).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
