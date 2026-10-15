import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rename, stat, symlink, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const script = fileURLToPath(import.meta.url);
const root = process.cwd();
const workspace = path.resolve("tmp/image-build-benchmark");
const results = path.join(workspace, "results");
const baseSource = path.resolve(process.env.BENCH_BASE_DIRECTORY || "tmp/base");
const diagnostics = process.env.BENCH_IMAGE_DIAGNOSTICS !== "false";
const allowAvifChanges = process.env.BENCH_ALLOW_AVIF_CHANGES === "true";
const sourceFiles = ["assets", "src", "scripts", "styles.css", "eleventy.config.js", "package.json", "package-lock.json"];
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const json = (filename, value) => writeFile(filename, JSON.stringify(value, null, 2) + "\n");
const runFile = promisify(execFile);

async function profileChild() {
  // Sharp's ESM adapter and its CJS export have distinct wrappers: patch the one Eleventy uses.
  const { default: sharp } = await import(pathToFileURL(path.join(root, "node_modules/@11ty/eleventy-img/src/adapters/sharp.js")));
  if (process.env.PROFILE_SHARP_THREADS) sharp.concurrency(Number(process.env.PROFILE_SHARP_THREADS));
  const originalAvif = sharp.prototype.avif;
  const originalToFile = sharp.prototype.toFile;
  sharp.prototype.avif = function (options = {}) {
    return originalAvif.call(this, {
      ...options,
      ...(process.env.PROFILE_AVIF_EFFORT ? { effort: Number(process.env.PROFILE_AVIF_EFFORT) } : {}),
      ...(process.env.PROFILE_AVIF_QUALITY ? { quality: Number(process.env.PROFILE_AVIF_QUALITY) } : {})
    });
  };
  const jobs = [];
  let buildStarted;
  sharp.prototype.toFile = function (filename, ...args) {
    const started = performance.now();
    const format = path.extname(filename).slice(1);
    const job = {
      input: this.options.input?.file ? path.relative(root, this.options.input.file) : null,
      output: path.relative(root, filename), format,
      effort: format === "avif" ? this.options.heifEffort : format === "webp" ? this.options.webpEffort : null,
      quality: format === "avif" ? this.options.heifQuality : format === "webp" ? this.options.webpQuality : this.options.jpegQuality,
      threads: sharp.concurrency(), startMs: started - buildStarted
    };
    jobs.push(job);
    return originalToFile.call(this, filename, ...args).then(info => {
      Object.assign(job, { wallMs: performance.now() - started, bytes: info.size, width: info.width, height: info.height });
      return info;
    }, error => {
      Object.assign(job, { wallMs: performance.now() - started, error: error.message });
      throw error;
    });
  };
  const profile = {
    node: process.version, sharpVersions: sharp.versions, sharpThreads: sharp.concurrency(),
    uvThreads: process.env.UV_THREADPOOL_SIZE || "default",
    avifEffort: process.env.PROFILE_AVIF_EFFORT || "default",
    avifQuality: process.env.PROFILE_AVIF_QUALITY || "site default", jobs
  };
  buildStarted = performance.now();
  try {
    await import(pathToFileURL(path.join(root, "scripts/build.mjs")));
  } catch (error) {
    profile.error = error.stack || error.message;
    process.exitCode = 1;
  } finally {
    profile.buildMs = performance.now() - buildStarted;
    await json(process.env.PROFILE_OUTPUT, profile);
    console.log(`Profile: ${jobs.length} encodings, ${profile.buildMs.toFixed(1)}ms, Sharp threads ${profile.sharpThreads}`);
  }
}

async function files(directory, prefix = "") {
  const entries = await readdir(path.join(directory, prefix), { withFileTypes: true });
  const found = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) found.push(...await files(directory, name));
    else if (entry.isFile()) found.push(name);
    else throw new Error(`Unexpected non-file: ${name}`);
  }
  return found;
}

async function manifest(site) {
  const directory = path.join(site, "dist");
  const names = await files(directory);
  if (!names.length) throw new Error("No public files were generated");
  return Object.fromEntries(await Promise.all(names.map(async name => [name, hash(await readFile(path.join(directory, name)))])));
}

async function logicalManifest(site, actual) {
  const logical = {};
  for (const [filename, digest] of Object.entries(actual)) {
    const name = filename.replace(/\.[a-f0-9]{16}(?=\.[^./]+$)/u, "");
    if (Object.hasOwn(logical, name)) throw new Error(`Duplicate logical output name: ${name}`);
    const text = /\.(?:html|css)$/u.test(name)
      ? await readFile(path.join(site, "dist", filename), "utf8") : null;
    if (text !== null) for (const match of text.matchAll(/\/assets\/[A-Za-z0-9/_.%-]+/gu)) {
      const reference = match[0].slice(1);
      if (!reference.endsWith("/") && !Object.hasOwn(actual, reference)) {
        throw new Error(`Missing referenced asset in ${filename}: ${reference}`);
      }
    }
    logical[name] = text === null ? digest : hash(text.replace(/\.[a-f0-9]{16}(?=\.[a-z0-9]+)/gu, ""));
  }
  return logical;
}

function difference(expected, actual) {
  return {
    added: Object.keys(actual).filter(name => !(name in expected)),
    removed: Object.keys(expected).filter(name => !(name in actual)),
    changed: Object.keys(expected).filter(name => name in actual && expected[name] !== actual[name])
  };
}

const emptyDifference = delta => Object.values(delta).every(names => names.length === 0);
const unusedFooter = /^assets\/images\/forest-lookout-firewatch-2172\.[\da-f]{16}\.avif$/;

async function cacheSnapshot(site, mark = false) {
  const directory = path.join(site, "tmp/image-cache");
  const names = await files(directory);
  return Object.fromEntries(await Promise.all(names.map(async name => {
    const filename = path.join(directory, name);
    if (mark) await utimes(filename, new Date("2000-01-01T00:00:00Z"), new Date("2000-01-01T00:00:00Z"));
    const information = await stat(filename);
    return [name, `${information.mtimeMs}:${information.size}`];
  })));
}

function statistics(trials) {
  const samplesMs = trials.map(trial => trial.wallMs);
  const ordered = [...samplesMs].sort((a, b) => a - b);
  return {
    status: trials.every(trial => trial.status === "passed") ? "passed" : "failed",
    samplesMs, medianMs: ordered.length ? ordered[Math.floor(ordered.length / 2)] : null,
    minMs: ordered[0] ?? null, maxMs: ordered.at(-1) ?? null, trials
  };
}

async function fixture(name, source, settings = {}) {
  const site = path.join(workspace, "cases", name, "site");
  await mkdir(site, { recursive: true });
  for (const filename of sourceFiles) await cp(path.join(source, filename), path.join(site, filename), { recursive: true });
  await symlink(path.join(root, "node_modules"), path.join(site, "node_modules"), "dir");
  return { name, site, settings, cold: [], warm: [] };
}

async function buildTrial(subject, label, cold) {
  if (cold) {
    try {
      await rename(path.join(subject.site, "tmp/image-cache"), path.join(subject.site, `tmp/image-cache-retained-${label}`));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  const env = { ...process.env, SITE_URL: "https://benchmark.invalid", PROFILE_CHILD: "1", PROFILE_OUTPUT: path.join(results, `${label}.profile.json`) };
  for (const key of ["PROFILE_SHARP_THREADS", "PROFILE_AVIF_EFFORT", "PROFILE_AVIF_QUALITY", "UV_THREADPOOL_SIZE"]) delete env[key];
  if (subject.settings.threads) env.PROFILE_SHARP_THREADS = String(subject.settings.threads);
  if (subject.settings.uv) env.UV_THREADPOOL_SIZE = String(subject.settings.uv);
  if (subject.settings.effort) env.PROFILE_AVIF_EFFORT = String(subject.settings.effort);
  if (subject.settings.quality) env.PROFILE_AVIF_QUALITY = String(subject.settings.quality);
  const started = performance.now();
  const result = await new Promise(resolve => {
    const child = spawn(process.execPath, [script], { cwd: subject.site, env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    let error;
    child.stdout.on("data", chunk => { output += chunk; });
    child.stderr.on("data", chunk => { output += chunk; });
    child.on("error", failure => { error = failure.message; });
    const timeout = setTimeout(() => { error = "Build exceeded 180 seconds"; child.kill("SIGKILL"); }, 180000);
    child.on("close", (exitCode, signal) => {
      clearTimeout(timeout);
      resolve({ exitCode, signal, error, wallMs: performance.now() - started, output });
    });
  });
  await writeFile(path.join(results, `${label}.log`), `Command: ${process.execPath} ${script}\nDirectory: ${subject.site}\n${result.output}`);
  const trial = {
    wallMs: result.wallMs, exitCode: result.exitCode, signal: result.signal,
    status: result.exitCode === 0 && !result.error ? "passed" : "failed",
    log: `${label}.log`, profile: `${label}.profile.json`, error: result.error
  };
  try {
    const profile = JSON.parse(await readFile(env.PROFILE_OUTPUT, "utf8"));
    trial.encodings = profile.jobs.length;
    trial.buildMs = profile.buildMs;
    trial.outputManifest = await manifest(subject.site);
    trial.logicalManifest = await logicalManifest(subject.site, trial.outputManifest);
    trial.outputFiles = Object.keys(trial.outputManifest).length;
    await json(path.join(results, `${label}.manifest.json`), trial.outputManifest);
    if (profile.error) { trial.status = "failed"; trial.error = profile.error; }
  } catch (error) {
    trial.status = "failed";
    trial.error = error.message;
  }
  return trial;
}

async function benchmark() {
  // A fresh run directory also permits re-running the harness without deleting retained caches.
  const runDirectory = path.join(workspace, "runs", `${Date.now()}-${process.pid}`);
  await mkdir(runDirectory, { recursive: true });
  const report = {
    node: process.version, base: null, head: null,
    machine: { cpu: os.cpus()[0]?.model, parallelism: os.availableParallelism(), platform: os.platform(), arch: os.arch(), release: os.release() },
    diagnosticsEnabled: diagnostics, allowAvifChanges, cases: {}, errors: []
  };
  const markFailure = (label, error) => report.errors.push({ label, error: error.message || String(error) });
  const check = (trial, expected, allowFooter = false, expectedLogical = null) => {
    if (!trial.outputManifest || !expected) { trial.status = "failed"; return; }
    trial.outputDifference = difference(expected, trial.outputManifest);
    trial.outputMatches = emptyDifference(trial.outputDifference) || (allowFooter &&
      trial.outputDifference.added.length === 0 && trial.outputDifference.changed.length === 0 &&
      trial.outputDifference.removed.length <= 1 && trial.outputDifference.removed.every(name => unusedFooter.test(name)));
    if (allowFooter && allowAvifChanges && expectedLogical && trial.logicalManifest) {
      trial.logicalDifference = difference(expectedLogical, trial.logicalManifest);
      trial.outputMatches = trial.logicalDifference.added.length === 0 &&
        trial.logicalDifference.removed.length <= 1 &&
        trial.logicalDifference.removed.every(name => name === "assets/images/forest-lookout-firewatch-2172.avif") &&
        trial.logicalDifference.changed.every(name => name.endsWith(".avif"));
    }
    if (!trial.outputMatches) { trial.status = "failed"; trial.error = "Published output comparison failed"; }
  };
  try {
    [report.base, report.head] = await Promise.all([baseSource, root].map(async cwd =>
      (await runFile("git", ["rev-parse", "HEAD"], { cwd })).stdout.trim()
    ));
    const locks = await Promise.all([baseSource, root].map(async source => hash(await readFile(path.join(source, "package-lock.json")))));
    report.lockfileSha256 = { baseline: locks[0], candidate: locks[1] };
    if (locks[0] !== locks[1]) throw new Error("Baseline and candidate package-lock.json differ; refusing an unfair dependency comparison");
    const prefix = path.relative(path.join(workspace, "cases"), runDirectory);
    const baseline = await fixture(path.join(prefix, "baseline"), baseSource);
    const candidate = await fixture(path.join(prefix, "candidate"), root);
    let baselineManifest;
    let baselineLogical;
    let candidateManifest;
    let candidateLogical;
    for (let round = 1; round <= 3; round++) {
      for (const subject of round % 2 ? [baseline, candidate] : [candidate, baseline]) {
        const label = `cold-${path.basename(subject.name)}-${round}`;
        const trial = await buildTrial(subject, label, true);
        if (subject === baseline && !baselineManifest && trial.status === "passed") {
          baselineManifest = trial.outputManifest;
          baselineLogical = trial.logicalManifest;
        }
        if (subject === candidate && !candidateManifest) check(trial, baselineManifest, true, baselineLogical);
        else check(trial, subject === baseline ? baselineManifest : candidateManifest);
        if (subject === candidate && !candidateManifest && trial.status === "passed") {
          candidateManifest = trial.outputManifest;
          candidateLogical = trial.logicalManifest;
        }
        subject.cold.push(trial);
      }
    }
    report.referenceManifest = baselineManifest;
    report.candidateManifest = candidateManifest;
    report.referenceLogicalManifest = baselineLogical;
    report.candidateLogicalManifest = candidateLogical;
    const snapshots = new Map();
    for (const subject of [baseline, candidate]) snapshots.set(subject, await cacheSnapshot(subject.site, true));
    for (let round = 1; round <= 3; round++) {
      for (const subject of round % 2 ? [baseline, candidate] : [candidate, baseline]) {
        const trial = await buildTrial(subject, `warm-${path.basename(subject.name)}-${round}`, false);
        check(trial, subject === baseline ? baselineManifest : candidateManifest);
        trial.cacheDifference = difference(snapshots.get(subject), await cacheSnapshot(subject.site));
        trial.cacheUnchanged = emptyDifference(trial.cacheDifference) && trial.encodings === 0;
        if (!trial.cacheUnchanged) { trial.status = "failed"; trial.error = "A warm build created or rewrote image encodings"; }
        subject.warm.push(trial);
      }
    }
    for (const [name, subject] of [["baseline", baseline], ["candidate", candidate]]) {
      report.cases[name] = { settings: subject.settings, cold: statistics(subject.cold), warm: statistics(subject.warm) };
    }
    if (diagnostics) {
      const settings = {
        "threads-2": { threads: 2 }, "threads-4": { threads: 4 },
        "uv1-threads4": { uv: 1, threads: 4 }, "uv2-threads2": { uv: 2, threads: 2 },
        "effort-3": { effort: 3 }, "effort-2": { effort: 2 },
        "effort3-q66": { effort: 3, quality: 66 }, "effort3-q67": { effort: 3, quality: 67 }
      };
      for (const [name, configuration] of Object.entries(settings)) {
        const subject = await fixture(path.join(prefix, name), root, configuration);
        const trial = await buildTrial(subject, `diagnostic-${name}`, true);
        if (trial.outputManifest && candidateManifest) trial.outputDifference = difference(candidateManifest, trial.outputManifest);
        if (trial.logicalManifest && candidateLogical) trial.logicalDifference = difference(candidateLogical, trial.logicalManifest);
        report.cases[name] = { diagnostic: true, settings: configuration, cold: statistics([trial]) };
      }
    }
    for (const [name, subject] of Object.entries(report.cases)) {
      for (const trial of [...subject.cold.trials, ...(subject.warm?.trials || [])]) {
        if (trial.status !== "passed") markFailure(name, trial.error || `Build exited with code ${trial.exitCode}; see ${trial.log}`);
      }
    }
  } catch (error) { markFailure("benchmark", error); }
  report.status = report.errors.length ? "failed" : "passed";
  await json(path.join(results, "report.json"), report);
  const summary = [
    "| Case | Cold median | Samples | Warm median | Output |", "| --- | ---: | ---: | ---: | --- |",
    ...Object.entries(report.cases).map(([name, subject]) => `| ${name} | ${(subject.cold.medianMs / 1000).toFixed(3)}s | ${subject.cold.samplesMs.length} | ${subject.warm ? (subject.warm.medianMs / 1000).toFixed(3) + "s" : "—"} | ${subject.cold.status} |`),
    "", `Baseline and candidate alternate on one machine. AVIF changes allowed: ${allowAvifChanges}. When enabled, all non-AVIF binaries must remain byte-identical and HTML/CSS may differ only in asset fingerprints; only the unused footer AVIF may be removed. Repeated builds remain fully byte-identical within each variant. Cold trials start with an empty image cache; warm trials must encode zero images and preserve cache names/mtimes. Diagnostic codec changes may change encoded bytes. Per-encoding times overlap and include native queue wait.`, ""
  ].join("\n");
  await writeFile(path.join(results, "summary.md"), summary);
  console.log(summary);
  console.log(`Image benchmark ${report.status}: ${report.errors.length} errors; reports in ${results}`);
  if (report.errors.length) process.exitCode = 1;
}

if (process.env.PROFILE_CHILD === "1") {
  await profileChild();
} else {
  await mkdir(results, { recursive: true });
  await benchmark();
}
