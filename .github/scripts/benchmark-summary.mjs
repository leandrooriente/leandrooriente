import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const variants = [
  ["node22-npm", "Node 22 + npm"],
  ["node24-npm", "Node 24 + npm"],
  ["node22-npm-fast", "Node 22 + npm with install flags"],
  ["node22-bun", "Node 22 + Bun installer"],
  ["bun-bun", "Bun runtime + installer"],
  ["node22-pnpm", "Node 22 + pnpm"]
];
const collected = path.resolve("tmp/benchmark-collected");
const output = path.resolve("tmp/benchmark-report");
const fatalErrors = [];

function issue(record, message) {
  record.issues.push(message);
  fatalErrors.push(`${record.variant}: ${message}`);
}

async function json(record, filename) {
  try {
    return JSON.parse(await readFile(path.join(collected, record.variant, filename), "utf8"));
  } catch (error) {
    issue(record, `${filename} ${error.code === "ENOENT" ? "is missing" : `could not be read: ${error.message}`}`);
    return null;
  }
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validManifest(value) {
  return isObject(value) && Object.keys(value).length > 0 &&
    Object.entries(value).every(([name, hash]) => name.length > 0 && typeof hash === "string" && /^[a-f0-9]{64}$/u.test(hash));
}

function difference(expected, actual) {
  return {
    added: Object.keys(actual).filter(name => !Object.hasOwn(expected, name)).sort(),
    removed: Object.keys(expected).filter(name => !Object.hasOwn(actual, name)).sort(),
    changed: Object.keys(expected).filter(name => Object.hasOwn(actual, name) && actual[name] !== expected[name]).sort()
  };
}

function compare(expected, actual) {
  const differences = difference(expected, actual);
  return {
    matches: Object.values(differences).every(names => names.length === 0),
    files: Object.keys(actual).length,
    differences
  };
}

function statistics(samples) {
  const ordered = [...samples].sort((left, right) => left - right);
  if (!ordered.length) return null;
  const middle = Math.floor(ordered.length / 2);
  return {
    medianMs: ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2,
    minMs: ordered[0], maxMs: ordered.at(-1), n: ordered.length
  };
}

function installPhase(record, name, expectedCount) {
  const samples = record.install?.[name];
  if (!Array.isArray(samples)) {
    issue(record, `Missing ${name} install samples`);
    return null;
  }
  const successful = samples.filter(sample => sample?.success === true && Number.isFinite(sample.ms) && sample.ms >= 0);
  if (successful.length !== expectedCount || successful.length !== samples.length) {
    issue(record, `${name} install completed ${successful.length}/${expectedCount} successful trials`);
  }
  return statistics(successful.map(sample => sample.ms));
}

function buildPhase(record, name, expectedCount) {
  const phase = record.runtime?.[name];
  const warm = name === "warmBuild" || name === "referenceWarmBuild";
  if (!isObject(phase) || !Array.isArray(phase.trials)) {
    issue(record, `Missing ${name} build trials`);
    return null;
  }
  const successful = phase.trials.filter(trial => trial?.status === "passed" && trial.manifestMatches === true &&
    Number.isFinite(trial.wallMs) && trial.wallMs >= 0 && (!warm || trial.cacheUnchanged === true));
  if (phase.status !== "passed" || successful.length !== expectedCount || successful.length !== phase.trials.length) {
    issue(record, `${name} completed ${successful.length}/${expectedCount} successful trials with matching output${warm ? " and unchanged image cache" : ""}`);
  }
  return statistics(successful.map(trial => trial.wallMs));
}

function cell(value) {
  return String(value ?? "—").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll("|", "\\|").replace(/\r?\n/gu, " ");
}

function seconds(ms) {
  return Number.isFinite(ms) ? `${(ms / 1000).toFixed(3)} s` : "—";
}

function timing(stats) {
  return stats ? `${seconds(stats.medianMs)} (${seconds(stats.minMs)}–${seconds(stats.maxMs)}; n=${stats.n})` : "missing";
}

function status(value) {
  return value === "passed" ? "pass" : value === "failed" ? "FAIL" : value || "missing";
}

function description(value) {
  if (typeof value === "string") return value;
  if (isObject(value)) return [value.stage || value.label, value.message || value.error].filter(Boolean).join(": ") || JSON.stringify(value);
  return String(value);
}

function short(value) {
  const text = description(value).replace(/\s+/gu, " ");
  return text.length > 1000 ? `${text.slice(0, 997)}...` : text;
}

const results = [];
for (const [variant, label] of variants) {
  const record = { variant, label, issues: [], notes: [] };
  record.install = await json(record, "install.json");
  record.runtime = await json(record, "runtime.json");
  record.manifest = await json(record, "manifest.json");

  if (!isObject(record.install)) issue(record, "Install report is not an object");
  if (!isObject(record.runtime)) issue(record, "Runtime report is not an object");
  if (record.install?.variant !== variant) issue(record, "Install report variant does not match its artifact folder");
  if (record.runtime?.variant !== variant) issue(record, "Runtime report variant does not match its artifact folder");
  if (record.install?.ready !== true) issue(record, "Package installation did not finish successfully");
  record.timings = {
    coldInstall: installPhase(record, "cold", 3),
    warmInstall: installPhase(record, "warm", 5),
    warmBuild: buildPhase(record, "warmBuild", 7),
    referenceWarmBuild: record.runtime?.referenceWarmBuild ? buildPhase(record, "referenceWarmBuild", 7) : null,
    coldBuild: buildPhase(record, "coldBuild", ["node22-npm", "node24-npm", "bun-bun"].includes(variant) ? 3 : 1),
    referenceColdBuild: record.runtime?.referenceColdBuild && record.runtime.referenceColdBuild.status !== "skipped"
      ? buildPhase(record, "referenceColdBuild", 1) : null
  };
  const pairedReference = record.timings.referenceWarmBuild?.medianMs;
  const pairedCandidate = record.timings.warmBuild?.medianMs;
  record.pairedWarmComparison = pairedReference > 0 && pairedCandidate > 0 ? {
    referenceRuntime: "Node 22",
    referenceMedianMs: pairedReference,
    candidateMedianMs: pairedCandidate,
    candidateToReferenceTimeRatio: pairedCandidate / pairedReference,
    candidateSpeedup: pairedReference / pairedCandidate
  } : null;
  const coldReference = record.timings.referenceColdBuild?.medianMs;
  const coldCandidate = record.timings.coldBuild?.medianMs;
  record.pairedColdComparison = coldReference > 0 && coldCandidate > 0 ? {
    referenceRuntime: "Node 22",
    referenceMedianMs: coldReference,
    candidateMedianMs: coldCandidate,
    candidateToReferenceTimeRatio: coldCandidate / coldReference,
    candidateSpeedup: coldReference / coldCandidate
  } : null;
  if (!validManifest(record.manifest)) issue(record, "Final output manifest is missing, empty, or malformed");
  if (!validManifest(record.runtime?.referenceManifest)) issue(record, "Node reference output manifest is missing, empty, or malformed");

  record.compatibility = {};
  for (const [key, label] of [["imageTests", "Image cache tests"], ["productionImport", "Production import"]]) {
    const check = record.runtime?.[key];
    record.compatibility[key] = check?.status || "missing";
    if (!["passed", "failed"].includes(check?.status)) issue(record, `${label} result is missing or incomplete`);
    if (check?.status === "failed") record.notes.push(`${label} failed${check.error ? `: ${check.error}` : ""}; see ${check.log || `${key} diagnostics`} in the raw results`);
  }
  if (variant === "node22-pnpm" && record.compatibility.productionImport === "failed") {
    record.notes.push("The production verifier imports gray-matter without declaring it as a direct dependency. pnpm's isolated dependency layout requires that dependency to be declared before adoption.");
  }
  if (record.runtime?.warmUp?.performed) {
    record.notes.push(`An untimed candidate warm-up took ${seconds(record.runtime.warmUp.wallMs)}; image-cache additions during this preparation are reported in runtime.json.`);
  }
  for (const error of Array.isArray(record.install?.errors) ? record.install.errors : []) record.notes.push(`Install error: ${description(error)}`);
  if (record.install?.error) record.notes.push(`Install error: ${record.install.error}`);
  for (const error of Array.isArray(record.runtime?.errors) ? record.runtime.errors : []) {
    record.notes.push(`Runtime diagnostic: ${description(error)}`);
    if (!["image-tests", "production-import"].includes(error?.stage)) issue(record, `Runtime failed at ${error?.stage || "an unspecified stage"}: ${description(error)}`);
  }
  results.push(record);
}

const baseline = results.find(record => record.variant === "node22-npm");
const reference = validManifest(baseline?.runtime?.referenceManifest) ? baseline.runtime.referenceManifest : null;
for (const record of results) {
  if (!reference) {
    issue(record, "Cannot compare output without the Node 22 + npm reference manifest");
  } else {
    if (validManifest(record.runtime?.referenceManifest)) {
      record.referenceComparison = compare(reference, record.runtime.referenceManifest);
      if (!record.referenceComparison.matches) issue(record, "Node reference output differs from Node 22 + npm");
    }
    if (validManifest(record.manifest)) {
      record.outputComparison = compare(reference, record.manifest);
      if (!record.outputComparison.matches) issue(record, "Final output differs from Node 22 + npm");
    }
  }
  record.coreDataPassed = record.issues.length === 0;
  record.compatible = record.coreDataPassed && Object.values(record.compatibility).every(value => value === "passed");
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  run: { repository: process.env.GITHUB_REPOSITORY, id: process.env.GITHUB_RUN_ID, attempt: process.env.GITHUB_RUN_ATTEMPT, eventSha: process.env.GITHUB_SHA },
  referenceVariant: "node22-npm",
  referenceFiles: reference ? Object.keys(reference).length : null,
  status: fatalErrors.length ? "failed" : "passed",
  allVariantsCompatible: results.every(record => record.compatible),
  errors: fatalErrors,
  results
};

const markdown = [
  "# Build tools benchmark", "",
  "Each timing cell shows the median, minimum–maximum, and number of successful trials. All timings are wall-clock durations of the actual executable.", "",
  "| Variant | Cold install | Warm install | Warm build | Paired Node 22 warm build | Warm candidate / Node 22 time | Cold build | Paired Node 22 cold build | Cold candidate / Node 22 time | Output | Compatibility |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...results.map(record => {
    const comparison = record.outputComparison;
    const outputStatus = comparison ? `${comparison.files} files; ${comparison.matches ? "match" : "MISMATCH"}` : "missing";
    const compatibility = `Images: ${status(record.compatibility.imageTests)}; production: ${status(record.compatibility.productionImport)}`;
    const ratio = record.pairedWarmComparison ? `${record.pairedWarmComparison.candidateToReferenceTimeRatio.toFixed(3)}×` : "not measured";
    const coldRatio = record.pairedColdComparison ? `${record.pairedColdComparison.candidateToReferenceTimeRatio.toFixed(3)}×` : "not measured";
    return `| ${[record.label, timing(record.timings.coldInstall), timing(record.timings.warmInstall), timing(record.timings.warmBuild), timing(record.timings.referenceWarmBuild), ratio, timing(record.timings.coldBuild), timing(record.timings.referenceColdBuild), coldRatio, outputStatus, compatibility].map(cell).join(" | ")} |`;
  }), "",
  `Output comparison: ${report.referenceFiles === null ? "reference missing" : `${report.referenceFiles} files in the Node 22 + npm reference`}. ${report.status === "passed" ? "Every variant has complete timing data and matching output." : "Missing data, failed build checks, or differing output are listed below."}`, "",
  "Cold installs start with empty package stores; warm installs start with a populated store but a fresh node_modules directory. Warm builds retain generated image encodings and verify that no encodings were added or rewritten. Cold builds start without generated image encodings. The npm install-flags variant adds --prefer-offline, --no-audit, and --no-fund.", "",
  "Paired Node 22 timings use the same runner and installed dependency tree as the candidate. The candidate / Node 22 time ratio is below 1 when the candidate is faster; report.json also includes the reciprocal speedup. The Node 24 and Bun runtime rows have one additional Node 22 cold build to control for runner differences during image encoding; this single control sample has limited precision. Missing paired results and skipped cold controls are allowed for older benchmark artifacts and the other variants.", "",
  "Package-manager setup, cache restoration and transfer, lockfile migration, reference seeding, compatibility checks, and artifact upload/download are outside the inner install/build timings. The extra Node 22 setup used to create paired measurements is benchmark overhead, not an adoption cost. Use Actions step timelines to assess other overhead. Total benchmark job durations include repeated installs and builds and are not estimates of a single deployment.", "",
  "Node 24 includes a different npm version, so that row measures the combined Node/npm update. CPU and runner differences can affect comparisons between jobs. A variant is suitable for adoption only when its output, image tests, and production-import check all pass.", "",
  "## Versions and preparation", "",
  "| Variant | Node | npm | Installer | Runtime | Lockfile preparation | CPU / parallelism | Runner image |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ...results.map(record => {
    const versions = record.runtime?.versions || {};
    const machine = record.runtime?.machine || {};
    const installer = record.install ? `${record.install.manager || "unknown"} ${record.install.version || "unknown"}` : "missing";
    const candidate = versions.candidate?.versions;
    const runtime = record.runtime?.runtime === "bun" ? `Bun ${candidate?.bun || versions.bun || "unknown"}` : `Node ${candidate?.node || versions.node || record.install?.node || "unknown"}`;
    const migration = record.install?.migration;
    return `| ${[record.label, versions.node || record.install?.node, versions.npm, installer, runtime,
      migration ? `${seconds(migration.ms)} (${migration.success ? "pass" : "FAIL"})` : "not required",
      `${machine.cpu || record.install?.cpu || "unknown"} / ${machine.availableParallelism || record.install?.cores || "unknown"}`,
      [machine.runnerImage, machine.runnerImageVersion].filter(Boolean).join(" ") || "unknown"].map(cell).join(" | ")} |`;
  }), "",
  "## Diagnostics", ""
];
if (!results.some(record => record.issues.length || record.notes.length)) markdown.push("All build and compatibility checks passed.", "");
for (const record of results) {
  if (!record.issues.length && !record.notes.length) continue;
  markdown.push(`### ${record.label}`, "");
  for (const message of [...new Set([...record.issues, ...record.notes])]) markdown.push(`- ${cell(short(message))}`);
  for (const [label, comparison] of [["Reference output", record.referenceComparison], ["Final output", record.outputComparison]]) {
    if (!comparison || comparison.matches) continue;
    for (const [kind, filenames] of Object.entries(comparison.differences)) {
      if (filenames.length) markdown.push(`- ${label}, ${kind} (${filenames.length}): ${filenames.slice(0, 20).map(cell).join(", ")}${filenames.length > 20 ? ", … (full list in report.json)" : ""}`);
    }
  }
  markdown.push("");
}
markdown.push("The combined report.json preserves raw reports and complete output differences. Per-variant artifacts retain command logs.", "");
await mkdir(output, { recursive: true });
await writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
await writeFile(path.join(output, "report.md"), markdown.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) {
  try {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown.join("\n"));
  } catch (error) {
    console.error(`Could not append the Actions summary: ${error.message}. The report files were saved.`);
    process.exitCode = 1;
  }
}
console.log(`Benchmark report saved: ${results.length} variants; ${report.referenceFiles ?? "missing"} reference files; ${fatalErrors.length} core-data errors; ${results.filter(record => record.compatible).length} compatible variants.`);
if (fatalErrors.length) process.exitCode = 1;
