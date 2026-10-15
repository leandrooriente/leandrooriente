import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Resolve Sharp from Eleventy Image so this describes the encoder it actually uses.
const imageRequire = createRequire(import.meta.resolve("@11ty/eleventy-img"));
const sharpVersions = imageRequire("sharp").versions;
const encoderVersions = {
  eleventyImage: imageRequire("./package.json").version,
  sharp: Object.fromEntries(Object.keys(sharpVersions).sort().map(key => [key, sharpVersions[key]]))
};

export const imageEncoderFingerprint = createHash("sha256")
  .update(JSON.stringify(encoderVersions))
  .digest("hex");

// The workflows use the same encoder identity as the individual image cache keys.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(`fingerprint=${imageEncoderFingerprint}`);
}
