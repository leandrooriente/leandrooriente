import { readFile } from "node:fs/promises";
import { generateImage } from "./images.mjs";
import { assetUrl, publishAsset } from "./assets.mjs";

// Both textures repeat at 768 × 512 CSS pixels; preserve that scale at 1× and 2×.
const tileWidth = 768;
const textureNames = ["paper-grain", "olive-ink"];

function imageSet(metadata) {
  const candidates = Object.entries(metadata).flatMap(([format, images]) =>
    images.map(({ url, width }) =>
      `url("${url}") ${width / tileWidth}x type("image/${format}")`
    )
  );
  return `image-set(${candidates.join(", ")})`;
}

export async function buildStylesheet() {
  let css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  const textures = await Promise.all(textureNames.map((name) =>
    generateImage(`/assets/illustrations/${name}.png`, [tileWidth, tileWidth * 2])
  ));

  for (const [index, name] of textureNames.entries()) {
    css = css.replaceAll(
      `url("assets/illustrations/${name}.png")`,
      `url("${textures[index].webp[0].url}")`
    );
  }

  // Guard custom-property overrides: unsupported image-set syntax otherwise
  // invalidates the consuming background instead of using its WebP fallback.
  css += `\n@supports (background-image: image-set(url("") type("image/avif"))) {
  :root {
    --paper-texture: ${imageSet(textures[0])};
    --ink-texture: linear-gradient(var(--ink-glaze), var(--ink-glaze)), ${imageSet(textures[1])};
  }
}\n`;

  // Use absolute URLs after moving CSS; leave inline filters and image sets alone.
  css = css.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/g,
    (original, doubleQuoted, singleQuoted, unquoted) => {
      const source = doubleQuoted ?? singleQuoted ?? unquoted;
      return /^\/?assets\/(?!images\/)/.test(source)
        ? `url("${assetUrl(source)}")`
        : original;
    }
  );
  return (await publishAsset("styles.css", css)).url;
}
