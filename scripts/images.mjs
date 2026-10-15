import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Image from "@11ty/eleventy-img";
import { publishAsset } from "./assets.mjs";
import { imageEncoderFingerprint } from "./image-cache.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const imageDirectory = "assets/images";
const illustrationWidths = [360, 640, 720, 960, 1280, 1440, 1536];

// Match the rendered widths in styles.css, including its gutter breakpoints.
const profiles = {
  portrait: {
    widths: [320, 440, 640, 880, 1086],
    sizes: "(max-width: 368px) calc(100vw - 48px), (max-width: 1023px) 320px, (max-width: 1196px) calc(40vw - 38.4px), 440px"
  },
  card: {
    widths: illustrationWidths,
    sizes: "(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) calc(50vw - 64px), (max-width: 1376px) calc(50vw - 72px), 616px"
  },
  article: {
    widths: illustrationWidths,
    sizes: "(max-width: 767px) calc(100vw - 48px), (max-width: 1056px) calc(100vw - 96px), 960px"
  }
};

export async function generateImage(src, widths, options = {}) {
  const inputPath = path.join(root, src.replace(/^\//, ""));
  const input = await readFile(inputPath);
  // Keep same-size edits fresh without serializing a large Buffer for each lookup.
  const sourceHash = createHash("sha256").update(input).digest("hex");
  const metadata = await Image(inputPath, {
    widths,
    formats: ["avif", "webp"],
    // The faster preset keeps fine grain close to the previous quality 65/effort 4 output.
    sharpAvifOptions: { quality: 66, effort: 3 },
    sharpWebpOptions: { quality: 85 },
    ...options,
    // Eleventy keys widths, formats, and Sharp options itself. Add the inputs it omits.
    manualCacheKey: {
      sourceHash,
      encoder: imageEncoderFingerprint,
      transform: options.manualCacheKey ?? null,
      transformSource: options.transform?.toString() ?? null
    },
    outputDir: path.join(root, "tmp/image-cache"),
    urlPath: `/${imageDirectory}/`
  });

  // Clone cached metadata and hash the final encoding, including encoder changes.
  // srcset is consumed directly by Image.generateHTML, so update it with the URL.
  const stem = path.basename(src, path.extname(src));
  return Object.fromEntries(await Promise.all(Object.entries(metadata).map(async ([format, images]) => [
    format,
    await Promise.all(images.map(async (image) => {
      const contents = await readFile(image.outputPath);
      const published = await publishAsset(`${stem}-${image.width}.${format}`, contents, "images");
      return { ...image, ...published, srcset: `${published.url} ${image.width}w` };
    }))
  ])));
}

export async function generateSocialImage(src) {
  const resize = { width: 1200, height: 630, fit: "cover", position: "centre" };
  const background = "#F3F1E8";
  const metadata = await generateImage(src, [resize.width], {
    formats: ["jpeg"],
    sharpJpegOptions: { quality: 90, chromaSubsampling: "4:4:4" },
    // Eleventy Image does not include transform callbacks in its disk cache key.
    manualCacheKey: { resize, background },
    transform: (image) => image.flatten({ background }).resize(resize)
  });
  // Cached transforms can report the source proportions; the crop is always fixed.
  return { ...metadata.jpeg[0], width: resize.width, height: resize.height };
}

export async function responsiveImage(src, alt, profile, attributes = {}) {
  const { widths, sizes } = profiles[profile];
  const metadata = await generateImage(src, widths);
  return Image.generateHTML(metadata, { alt, sizes, decoding: "async", ...attributes });
}
