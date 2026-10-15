import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rename, stat, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

const variants = new Set([
  "node22-npm", "node24-npm", "node22-bun", "bun-bun", "node22-pnpm", "node22-npm-fast"
]);
const variant = process.env.BENCH_VARIANT;
const runtime = process.env.BENCH_RUNTIME;
const referenceRuntime = process.env.BENCH_REFERENCE_NODE || "node";
const resultsDirectory = path.resolve("tmp/benchmark-results", variants.has(variant) ? variant : "invalid");
const siteDirectory = path.resolve("tmp/build-tools", variants.has(variant) ? variant : "invalid", "site");
const cacheDirectory = path.join(siteDirectory, "tmp/image-cache");
const sentinel = new Date("2000-01-01T00:00:00Z");
const errors = [];
const report = {
  variant,
  runtime,
  referenceExecutable: referenceRuntime,
  versions: {},
  machine: {
    platform: os.platform(), arch: os.arch(), release: os.release(),
    cpu: os.cpus()[0]?.model, logicalCpus: os.cpus().length,
    availableParallelism: os.availableParallelism(), totalMemoryBytes: os.totalmem(),
    runnerOs: process.env.RUNNER_OS, runnerArch: process.env.RUNNER_ARCH,
    runnerImage: process.env.ImageOS, runnerImageVersion: process.env.ImageVersion
  },
  referenceManifest: null,
  referenceWarmBuild: { status: "skipped", samplesMs: [], trials: [] },
  warmBuild: { status: "skipped", samplesMs: [], trials: [] },
  coldBuild: { status: "skipped", samplesMs: [], trials: [] },
  imageTests: { status: "skipped" },
  productionImport: { status: "skipped" }
};

function fail(stage, error) {
  const message = error instanceof Error ? error.message : String(error);
  errors.push({ stage, message });
  return message;
}

function milliseconds(value) {
  return Number(value.toFixed(3));
}

async function writeJson(filename, value) {
  await writeFile(path.join(resultsDirectory, filename), JSON.stringify(value, null, 2) + "\n");
}

// Time only the actual executable, from spawning it until its output streams close.
async function command(executable, args, label, { cwd = siteDirectory, timeoutMs = 180000 } = {}) {
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const result = await new Promise(resolve => {
    let child;
    try {
      child = spawn(executable, args, {
        cwd, env: { ...process.env, SITE_URL: "https://benchmark.invalid", NO_COLOR: "1" },
        stdio: ["ignore", "pipe", "pipe"]
      });
    } catch (error) {
      resolve({ exitCode: null, signal: null, stdout: "", stderr: "", error: error.message,
        wallMs: milliseconds(performance.now() - started) });
      return;
    }
    let stdout = "";
    let stderr = "";
    let spawnError;
    let timedOut = false;
    child.stdout.on("data", data => { stdout += data; });
    child.stderr.on("data", data => { stderr += data; });
    child.on("error", error => { spawnError = error.message; });
    const timeout = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, timeoutMs);
    child.on("close", (exitCode, signal) => {
      clearTimeout(timeout);
      resolve({ exitCode, signal, stdout, stderr,
        error: timedOut ? `Timed out after ${timeoutMs}ms` : spawnError,
        wallMs: milliseconds(performance.now() - started) });
    });
  });
  const log = `${label}.log`;
  await writeFile(path.join(resultsDirectory, log), [
    `Started: ${startedAt}`, `Command: ${JSON.stringify([executable, ...args])}`, `Directory: ${cwd}`,
    `Wall time: ${result.wallMs}ms`, `Exit code: ${result.exitCode}; signal: ${result.signal}`,
    result.error ? `Error: ${result.error}` : "", "", "STDOUT", result.stdout, "STDERR", result.stderr
  ].join("\n"));
  return { ...result, log, status: result.exitCode === 0 && !result.error ? "passed" : "failed" };
}

function compact(result) {
  const { stdout, stderr, ...details } = result;
  return details;
}

async function files(directory, prefix = "") {
  const entries = await readdir(path.join(directory, prefix), { withFileTypes: true });
  const found = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) found.push(...await files(directory, relative));
    else if (entry.isFile()) found.push(relative);
    else throw new Error(`Unexpected non-file in benchmark output: ${relative}`);
  }
  return found;
}

async function manifest() {
  const directory = path.join(siteDirectory, "dist");
  const names = await files(directory);
  if (!names.length) throw new Error("The site build produced no public files");
  return Object.fromEntries(await Promise.all(names.map(async name => [
    name, createHash("sha256").update(await readFile(path.join(directory, name))).digest("hex")
  ])));
}

function manifestDifference(actual) {
  const expected = report.referenceManifest;
  return {
    added: Object.keys(actual).filter(name => !(name in expected)),
    removed: Object.keys(expected).filter(name => !(name in actual)),
    changed: Object.keys(expected).filter(name => name in actual && expected[name] !== actual[name])
  };
}

async function verifyManifest(details, label) {
  try {
    const actual = await manifest();
    details.outputFiles = Object.keys(actual).length;
    const difference = manifestDifference(actual);
    details.manifestMatches = Object.values(difference).every(names => names.length === 0);
    if (!details.manifestMatches) {
      details.manifestDifference = difference;
      details.status = "failed";
      fail(label, "Generated files differ from the Node reference");
    }
  } catch (error) {
    details.manifestMatches = false;
    details.status = "failed";
    details.manifestError = fail(label, error);
  }
}

async function cacheSnapshot(mark = false) {
  const names = await files(cacheDirectory);
  return Object.fromEntries(await Promise.all(names.map(async name => {
    const filename = path.join(cacheDirectory, name);
    if (mark) await utimes(filename, sentinel, sentinel);
    const information = await stat(filename);
    return [name, { mtimeMs: information.mtimeMs, size: information.size }];
  })));
}

async function copyRestoredCache() {
  const restoredDirectory = path.resolve("tmp/image-cache");
  report.restoredCache = { available: false, source: "tmp/image-cache", files: 0 };
  try {
    if (!(await stat(restoredDirectory)).isDirectory()) throw new Error("Restored image cache is not a directory");
    await mkdir(path.dirname(cacheDirectory), { recursive: true });
    await cp(restoredDirectory, cacheDirectory, { recursive: true });
    report.restoredCache.available = true;
    report.restoredCache.files = Object.keys(await cacheSnapshot()).length;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function cacheDifference(before, after) {
  return {
    added: Object.keys(after).filter(name => !(name in before)),
    removed: Object.keys(before).filter(name => !(name in after)),
    rewritten: Object.keys(before).filter(name => name in after && (
      before[name].mtimeMs !== after[name].mtimeMs || before[name].size !== after[name].size
    ))
  };
}

function summarize(phase) {
  const ordered = [...phase.samplesMs].sort((left, right) => left - right);
  phase.medianMs = ordered.length ? milliseconds(ordered.length % 2
    ? ordered[(ordered.length - 1) / 2]
    : (ordered[ordered.length / 2 - 1] + ordered[ordered.length / 2]) / 2) : null;
  phase.minMs = ordered.length ? ordered[0] : null;
  phase.maxMs = ordered.length ? ordered.at(-1) : null;
  phase.status = phase.trials.length && phase.trials.every(trial => trial.status === "passed") ? "passed" : "failed";
}

async function build(label, executable = runtime) {
  const result = await command(executable, ["scripts/build.mjs"], label);
  const details = compact(result);
  if (result.status !== "passed") fail(label, result.error || `Build exited with code ${result.exitCode}; see ${result.log}`);
  return details;
}

async function versions() {
  for (const executable of ["node", "npm", "bun", "pnpm"]) {
    const result = await command(executable, ["--version"], `version-${executable}`, { timeoutMs: 30000 });
    report.versions[executable] = result.status === "passed" ? result.stdout.trim() : null;
  }
  const source = "console.log(JSON.stringify({execPath:process.execPath,versions:process.versions}))";
  const referenceVersion = await command(referenceRuntime, ["--version"], "version-reference-node", { timeoutMs: 30000 });
  report.versions.referenceNode = referenceVersion.status === "passed" ? referenceVersion.stdout.trim() : null;
  for (const [name, executable] of [["reference", referenceRuntime], ["candidate", runtime]]) {
    const result = await command(executable, ["--eval", source], `version-${name}`, { timeoutMs: 30000 });
    if (result.status === "passed") report.versions[name] = JSON.parse(result.stdout);
    else report.versions[name] = { error: result.error || `Exit code ${result.exitCode}`, log: result.log };
  }
}

async function benchmarkWarm(phase, executable, prefix) {
  const baseline = await cacheSnapshot(true);
  if (!Object.keys(baseline).length) throw new Error("The reference build did not create any image encodings");
  phase.cacheBaseline = baseline;
  for (let index = 1; index <= 7; index++) {
    const label = `${prefix}-${index}`;
    const trial = await build(label, executable);
    phase.samplesMs.push(trial.wallMs);
    await verifyManifest(trial, label);
    try {
      trial.cacheChanges = cacheDifference(baseline, await cacheSnapshot());
      trial.cacheUnchanged = Object.values(trial.cacheChanges).every(names => names.length === 0);
      if (!trial.cacheUnchanged) {
        trial.status = "failed";
        fail(label, "A warm trial created, removed, or rewrote image encodings");
      }
    } catch (error) {
      trial.status = "failed";
      trial.cacheUnchanged = false;
      trial.cacheError = fail(label, error);
    }
    phase.trials.push(trial);
  }
  summarize(phase);
  phase.encodingsUnchanged = phase.trials.every(trial => trial.cacheUnchanged);
}

async function benchmarkBuilds() {
  let seedCacheBefore;
  try { seedCacheBefore = await cacheSnapshot(); } catch (error) {
    if (error.code !== "ENOENT") throw error;
    seedCacheBefore = {};
  }
  report.referenceSeed = await build("reference-seed", referenceRuntime);
  if (report.referenceSeed.status !== "passed") return;
  report.referenceSeed.cacheChanges = cacheDifference(seedCacheBefore, await cacheSnapshot());
  report.referenceManifest = await manifest();
  report.referenceSeed.outputFiles = Object.keys(report.referenceManifest).length;
  await writeJson("reference-manifest.json", report.referenceManifest);
  await benchmarkWarm(report.referenceWarmBuild, referenceRuntime, "reference-warm");

  report.warmUp = { performed: false, reason: "The Node reference already seeded this runtime's cache" };
  if (runtime === "bun" || report.versions.reference?.versions?.node !== report.versions.candidate?.versions?.node) {
    // Function.toString() can differ between runtimes, so allow one explicitly reported warm-up.
    const before = await cacheSnapshot();
    report.warmUp = { performed: true, ...await build("candidate-warm-up") };
    await verifyManifest(report.warmUp, "candidate-warm-up");
    report.warmUp.cacheChanges = cacheDifference(before, await cacheSnapshot());
  }

  await benchmarkWarm(report.warmBuild, runtime, "warm");

  const coldCount = ["node22-npm", "node24-npm", "bun-bun"].includes(variant) ? 3 : 1;
  for (let index = 1; index <= coldCount; index++) {
    const label = `cold-${index}`;
    const retainedCache = `tmp/image-cache-retained-${Date.now()}-${process.pid}-${index}`;
    let retained = null;
    try {
      await rename(cacheDirectory, path.join(siteDirectory, retainedCache));
      retained = retainedCache;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const trial = { ...await build(label), retainedCache: retained };
    report.coldBuild.samplesMs.push(trial.wallMs);
    await verifyManifest(trial, label);
    report.coldBuild.trials.push(trial);
  }
  summarize(report.coldBuild);
}

async function compatibility() {
  try {
    const args = runtime === "bun" ? ["test", "./scripts/images.test.mjs"] : ["--test", "scripts/images.test.mjs"];
    const result = await command(runtime, args, "image-tests", { timeoutMs: 60000 });
    report.imageTests = compact(result);
    if (result.status !== "passed") fail("image-tests", result.error || `Image cache tests exited with code ${result.exitCode}; see ${result.log}`);
  } catch (error) {
    report.imageTests = { status: "failed", error: fail("image-tests", error) };
  }
  try {
    const smokePath = "scripts/benchmark-production-import.mjs";
    await writeFile(path.join(siteDirectory, smokePath), [
      'import matter from "gray-matter";',
      'const input = ["---", "title: benchmark", "---", "body"].join(String.fromCharCode(10));',
      'const { data } = matter(input);',
      'if (data.title !== "benchmark") throw new Error("gray-matter did not parse front matter");',
      'console.log("Production gray-matter import passed");', ""
    ].join("\n"));
    const result = await command(runtime, [smokePath], "production-import", { timeoutMs: 30000 });
    report.productionImport = compact(result);
    if (result.status !== "passed") fail("production-import", result.error || `Production import exited with code ${result.exitCode}; see ${result.log}`);
  } catch (error) {
    report.productionImport = { status: "failed", error: fail("production-import", error) };
  }
}

await mkdir(resultsDirectory, { recursive: true });
try {
  if (!variants.has(variant)) throw new Error("BENCH_VARIANT must name a supported benchmark variant");
  if (!["node", "bun"].includes(runtime)) throw new Error("BENCH_RUNTIME must be node or bun");
  if (runtime !== (variant === "bun-bun" ? "bun" : "node")) throw new Error("BENCH_RUNTIME does not match BENCH_VARIANT");
  await stat(path.join(siteDirectory, "node_modules"));
  await copyRestoredCache();
  await versions();
  try { await benchmarkBuilds(); } catch (error) { fail("build-benchmarks", error); }
  await compatibility();
  try { await writeJson("manifest.json", await manifest()); } catch (error) { fail("final-manifest", error); }
} catch (error) {
  fail("setup", error);
} finally {
  report.errors = errors;
  report.status = errors.length ? "failed" : "passed";
  if (errors.length) report.error = errors.map(({ stage, message }) => `${stage}: ${message}`).join("; ");
  await writeJson("runtime.json", report);
  console.log(`${variant}: reference warm ${report.referenceWarmBuild.medianMs ?? "n/a"}ms, candidate warm ${report.warmBuild.medianMs ?? "n/a"}ms, cold ${report.coldBuild.medianMs ?? "n/a"}ms; output checks ${report.status}; image tests ${report.imageTests.status}; production import ${report.productionImport.status}`);
  if (errors.length) process.exitCode = 1;
}
