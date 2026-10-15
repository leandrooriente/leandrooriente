import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile, appendFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";

const execute = promisify(execFile);
const variant = process.env.BENCH_VARIANT;
const manager = process.env.BENCH_MANAGER;
if (!/^[a-z0-9-]+$/.test(variant || "") || !["npm", "bun", "pnpm"].includes(manager)) {
  throw new Error("Missing benchmark variant or package manager.");
}
const root = process.cwd();
const work = path.resolve("tmp/build-tools", variant);
const site = path.join(work, "site");
const output = path.resolve("tmp/benchmark-results", variant);
await mkdir(site, { recursive: true });
await mkdir(output, { recursive: true });
const ignored = new Set([".git", "node_modules", "tmp", "dist", "output", ".wrangler"]);
for (const entry of await readdir(root)) {
  if (!ignored.has(entry)) await cp(path.join(root, entry), path.join(site, entry), { recursive: true });
}

const result = {
  variant, manager, node: process.version, platform: process.platform, arch: process.arch,
  cpu: os.cpus()[0]?.model, cores: os.availableParallelism(),
  cold: [], warm: [], errors: [], commands: []
};
const lockHash = () => readFile(path.join(site, "package-lock.json")).then(data => createHash("sha256").update(data).digest("hex"));
const originalLock = await lockHash();

async function invoke(label, command, args, cache) {
  await mkdir(cache, { recursive: true });
  const env = {
    ...process.env,
    NPM_CONFIG_CACHE: path.join(cache, "npm"),
    BUN_INSTALL_CACHE_DIR: path.join(cache, "bun"),
    XDG_CACHE_HOME: path.join(cache, "xdg-cache"),
    XDG_DATA_HOME: path.join(cache, "xdg-data"),
    PNPM_HOME: path.join(cache, "pnpm-home"),
    COREPACK_ENABLE_PROJECT_SPEC: "0"
  };
  const start = performance.now();
  let success = true, text = "", error;
  try {
    const response = await execute(command, args, { cwd: site, env, maxBuffer: 16 * 1024 * 1024, timeout: 180000 });
    text = response.stdout + response.stderr;
  } catch (failure) {
    success = false;
    text = (failure.stdout || "") + (failure.stderr || "");
    error = failure.message;
  }
  const ms = performance.now() - start;
  await writeFile(path.join(output, `${label}.log`), text);
  const sample = { ms, success, error, log: `${label}.log` };
  result.commands.push({ label, command, args });
  console.log(`${label}: ${(ms / 1000).toFixed(3)}s ${success ? "ok" : "FAILED"}`);
  if (!success) result.errors.push({ label, error });
  return sample;
}

function installArgs(cache) {
  if (manager === "npm") return ["ci", ...(variant.endsWith("-fast") ? ["--prefer-offline", "--no-audit", "--no-fund"] : [])];
  if (manager === "bun") return ["install", "--frozen-lockfile", "--cache-dir", path.join(cache, "bun")];
  return ["install", "--frozen-lockfile", "--store-dir", path.join(cache, "pnpm-store"), "--state-dir", path.join(cache, "pnpm-state"), "--reporter=append-only"];
}

try {
  result.version = (await execute(manager, ["--version"], { cwd: site })).stdout.trim();
  const migrationCache = path.join(work, "migration-cache");
  if (manager === "bun") {
    result.migration = await invoke("lock-migration", "bun", ["install", "--lockfile-only", "--cache-dir", path.join(migrationCache, "bun")], migrationCache);
  } else if (manager === "pnpm") {
    result.migration = await invoke("lock-migration", "pnpm", ["import", "--store-dir", path.join(migrationCache, "pnpm-store"), "--state-dir", path.join(migrationCache, "pnpm-state")], migrationCache);
  }
  if (result.migration && !result.migration.success) throw new Error("Lock migration failed.");
  for (let index = 0; index < 3; index++) {
    await rm(path.join(site, "node_modules"), { recursive: true, force: true });
    const cache = path.join(work, `cold-cache-${index}`);
    const sample = await invoke(`cold-install-${index + 1}`, manager, installArgs(cache), cache);
    result.cold.push(sample);
    if (!sample.success) throw new Error("Cold install failed.");
  }
  // The final cold install populated this store; node_modules remains fresh per trial.
  const warmCache = path.join(work, "cold-cache-2");
  for (let index = 0; index < 5; index++) {
    await rm(path.join(site, "node_modules"), { recursive: true, force: true });
    const sample = await invoke(`warm-install-${index + 1}`, manager, installArgs(warmCache), warmCache);
    result.warm.push(sample);
    if (!sample.success) throw new Error("Warm install failed.");
  }
  if (await lockHash() !== originalLock) throw new Error("The npm source lock changed during the benchmark.");
  result.ready = true;
} catch (error) {
  result.error = error.message;
  result.ready = false;
}

for (const name of ["cold", "warm"]) {
  const values = result[name].filter(row => row.success).map(row => row.ms).sort((a, b) => a - b);
  result[`${name}Stats`] = values.length ? {
    medianMs: values[Math.floor(values.length / 2)], minMs: values[0], maxMs: values.at(-1), n: values.length
  } : null;
}
await writeFile(path.join(output, "install.json"), JSON.stringify(result, null, 2));
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `ready=${result.ready}\n`);
if (!result.ready) process.exitCode = 1;
