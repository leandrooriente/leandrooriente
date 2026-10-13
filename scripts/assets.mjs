import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const assetUrls = new Map();

// Hash the published bytes, including encoded images and the completed CSS.
export async function publishAsset(name, contents, directory = "static") {
  const { name: stem, ext } = path.parse(path.basename(name));
  const hash = createHash("sha256").update(contents).digest("hex").slice(0, 16);
  const filename = `${stem}.${hash}${ext}`;
  const outputDirectory = new URL(`dist/assets/${directory}/`, root);
  const outputPath = new URL(filename, outputDirectory);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, contents);
  return { filename, outputPath: fileURLToPath(outputPath), url: `/assets/${directory}/${filename}` };
}

export async function prepareAssets(sources) {
  // Refresh on every build so source edits are picked up by the dev watcher.
  assetUrls.clear();
  await Promise.all(sources.map(async (source) => {
    const contents = await readFile(new URL(source, root));
    const { url } = await publishAsset(source, contents);
    assetUrls.set(`/${source}`, url);
  }));
}

export function assetUrl(source) {
  const key = `/${source.replace(/^\//, "")}`;
  const url = assetUrls.get(key);
  if (!url) throw new Error(`Asset is not included in the build: ${source}`);
  return url;
}
