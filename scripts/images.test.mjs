import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, symlink, utimes, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const imageRequire = createRequire(import.meta.resolve("@11ty/eleventy-img"));
const sharp = imageRequire("sharp");
const run = promisify(execFile);
const sentinel = new Date("2000-01-01T00:00:00Z");
const webpOptions = { formats: ["webp"], sharpWebpOptions: { quality: 50 } };

async function fixture(t) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "site-image-cache-test-")));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "scripts"));
  await mkdir(path.join(root, "assets"));
  await Promise.all(["images.mjs", "assets.mjs", "image-cache.mjs"].map(name =>
    copyFile(path.join(projectRoot, "scripts", name), path.join(root, "scripts", name))
  ));
  await symlink(path.join(projectRoot, "node_modules"), path.join(root, "node_modules"), "dir");
  const moduleUrl = pathToFileURL(path.join(root, "scripts/images.mjs")).href;
  return { root, moduleUrl, ...(await import(moduleUrl)) };
}

async function png(seed = 0, alpha = 255) {
  const pixels = Buffer.alloc(48 * 32 * 4);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 48; x++) {
    const offset = (y * 48 + x) * 4;
    pixels[offset] = (x * 11 + seed) % 256;
    pixels[offset + 1] = (y * 17 + seed) % 256;
    pixels[offset + 2] = (x * 7 + y * 13 + seed) % 256;
    pixels[offset + 3] = alpha;
  }
  return sharp(pixels, { raw: { width: 48, height: 32, channels: 4 } })
    .png({ compressionLevel: 0, adaptiveFiltering: false }).toBuffer();
}

async function cacheSnapshot(root, mark = false) {
  const directory = path.join(root, "tmp/image-cache");
  const names = (await readdir(directory)).sort();
  return Object.fromEntries(await Promise.all(names.map(async name => {
    const filename = path.join(directory, name);
    if (mark) await utimes(filename, sentinel, sentinel);
    return [name, (await stat(filename)).mtimeMs];
  })));
}

function assertOnlyAdded(before, after, count) {
  for (const [name, mtime] of Object.entries(before)) {
    assert.equal(after[name], mtime, `Existing encoding was rewritten: ${name}`);
  }
  assert.equal(Object.keys(after).length - Object.keys(before).length, count);
}

async function generateInFreshProcess(site, src, widths, options) {
  const { stdout } = await run(process.execPath, ["--input-type=module", "--eval", `
    const { generateImage } = await import(${JSON.stringify(site.moduleUrl)});
    const metadata = await generateImage(${JSON.stringify(src)}, ${JSON.stringify(widths)}, ${JSON.stringify(options)});
    console.log(JSON.stringify(metadata));
  `], { cwd: site.root });
  return JSON.parse(stdout);
}

test("matching content and settings reuse disk encodings after clean output", async t => {
  const site = await fixture(t);
  await writeFile(path.join(site.root, "assets/source.png"), await png());
  const first = await site.generateImage("/assets/source.png", [16], webpOptions);
  assert.ok(first.webp[0].outputPath.startsWith(site.root + path.sep));
  const before = await cacheSnapshot(site.root, true);
  await rm(path.join(site.root, "dist"), { recursive: true });

  // A fresh process proves disk reuse rather than the library's memory cache.
  await generateInFreshProcess(site, "/assets/source.png", [16], webpOptions);

  assert.deepEqual(await cacheSnapshot(site.root), before);
  assert.ok((await stat(first.webp[0].outputPath)).size > 0, "Clean output was republished");
});

test("same-size source edits regenerate only that image and restored bytes reuse its original encoding", async t => {
  const site = await fixture(t);
  const original = await png();
  const changed = await png(127);
  assert.equal(changed.length, original.length, "The edit must preserve source size");
  await writeFile(path.join(site.root, "assets/first.png"), original);
  await writeFile(path.join(site.root, "assets/second.png"), await png(64));
  const first = await site.generateImage("/assets/first.png", [16], webpOptions);
  const second = await site.generateImage("/assets/second.png", [16], webpOptions);
  const before = await cacheSnapshot(site.root, true);

  await writeFile(path.join(site.root, "assets/first.png"), changed);
  const edited = await site.generateImage("/assets/first.png", [16], webpOptions);
  const untouched = await site.generateImage("/assets/second.png", [16], webpOptions);
  assert.notEqual(edited.webp[0].url, first.webp[0].url);
  assert.equal(untouched.webp[0].url, second.webp[0].url);
  const after = await cacheSnapshot(site.root);
  assertOnlyAdded(before, after, 1);

  await writeFile(path.join(site.root, "assets/first.png"), original);
  const restored = await site.generateImage("/assets/first.png", [16], webpOptions);
  assert.equal(restored.webp[0].url, first.webp[0].url);
  assert.deepEqual(await cacheSnapshot(site.root), after);
});

test("width, format, and quality changes generate missing encodings without rewriting existing ones", async t => {
  const site = await fixture(t);
  await writeFile(path.join(site.root, "assets/source.png"), await png());
  const first = await site.generateImage("/assets/source.png", [16], webpOptions);
  let before = await cacheSnapshot(site.root, true);

  const wider = await generateInFreshProcess(site, "/assets/source.png", [16, 24], webpOptions);
  assert.deepEqual(wider.webp.map(image => image.width), [16, 24]);
  assert.equal(wider.webp[0].url, first.webp[0].url);
  let after = await cacheSnapshot(site.root);
  assertOnlyAdded(before, after, 1);
  before = after;

  const higherQuality = await site.generateImage("/assets/source.png", [16], {
    formats: ["webp"], sharpWebpOptions: { quality: 95 }
  });
  assert.notEqual(higherQuality.webp[0].url, first.webp[0].url);
  after = await cacheSnapshot(site.root);
  assertOnlyAdded(before, after, 1);
  before = after;

  const jpeg = await site.generateImage("/assets/source.png", [16], { formats: ["jpeg"] });
  assert.equal(jpeg.jpeg[0].format, "jpeg");
  assertOnlyAdded(before, await cacheSnapshot(site.root), 1);
});

test("transform parameters and callback source each invalidate the affected encoding", async t => {
  const site = await fixture(t);
  await writeFile(path.join(site.root, "assets/source.png"), await png(0, 128));
  const flatten = background => image => image.flatten({ background });
  const options = background => ({
    formats: ["png"], manualCacheKey: { background }, transform: flatten(background)
  });
  const first = await site.generateImage("/assets/source.png", [16], options("white"));
  let before = await cacheSnapshot(site.root, true);

  const differentParameters = await site.generateImage("/assets/source.png", [16], options("black"));
  assert.notEqual(differentParameters.png[0].url, first.png[0].url);
  let after = await cacheSnapshot(site.root);
  assertOnlyAdded(before, after, 1);
  before = after;

  const differentSource = await site.generateImage("/assets/source.png", [16], {
    ...options("white"),
    transform: image => image.flatten({ background: "white" }).grayscale()
  });
  assert.notEqual(differentSource.png[0].url, first.png[0].url);
  after = await cacheSnapshot(site.root);
  assertOnlyAdded(before, after, 1);
  await site.generateImage("/assets/source.png", [16], options("white"));
  assert.deepEqual(await cacheSnapshot(site.root), after);
});

test("an encoder fingerprint change regenerates cached encodings even when published bytes stay identical", async t => {
  const site = await fixture(t);
  await writeFile(path.join(site.root, "assets/source.png"), await png());
  const first = await site.generateImage("/assets/source.png", [16], webpOptions);
  const before = await cacheSnapshot(site.root, true);
  const source = await readFile(path.join(site.root, "scripts/images.mjs"), "utf8");
  const alternate = source.replace('from "./image-cache.mjs"', 'from "./image-cache-other.mjs"');
  assert.notEqual(alternate, source, "The fixture must replace the encoder dependency");
  await writeFile(path.join(site.root, "scripts/image-cache-other.mjs"),
    'export const imageEncoderFingerprint = "different-test-encoder";\n');
  await writeFile(path.join(site.root, "scripts/images-other.mjs"), alternate);
  const { generateImage } = await import(pathToFileURL(path.join(site.root, "scripts/images-other.mjs")));

  const regenerated = await generateImage("/assets/source.png", [16], webpOptions);
  assert.equal(regenerated.webp[0].url, first.webp[0].url, "Published URLs still hash encoded bytes");
  const after = await cacheSnapshot(site.root);
  assertOnlyAdded(before, after, 1);
  await generateImage("/assets/source.png", [16], webpOptions);
  assert.deepEqual(await cacheSnapshot(site.root), after);
});
