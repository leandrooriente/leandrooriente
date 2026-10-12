import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export default function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });
  eleventyConfig.setServerOptions({ port: 4173 });

  eleventyConfig.addCollection("posts", (collection) =>
    collection.getFilteredByTag("posts").sort((a, b) => a.data.order - b.data.order)
  );

  // Count the rendered prose, title, and subtitle at 200 words per minute.
  eleventyConfig.addFilter("readingMinutes", (html, title, deck) => {
    const text = `${title} ${deck} ${html}`
      .replace(/<[^>]*>/g, " ")
      .replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, " ")
      .trim();
    return Math.max(1, Math.ceil(text.split(/\s+/u).length / 200));
  });

  // Keep cache busting automatic without changing the stylesheet's public URL.
  eleventyConfig.addGlobalData("stylesheetVersion", () =>
    createHash("sha256").update(readFileSync("styles.css")).digest("hex").slice(0, 12)
  );
  eleventyConfig.addWatchTarget("styles.css");

  // Publish only the existing public files; source notes and unused art stay local.
  for (const file of [
    "styles.css",
    "assets/forest-sprig.svg",
    "assets/fonts/*.woff",
    "assets/fonts/*-OFL.txt",
    "assets/illustrations/leandro-family-grounded-editorial.png",
    "assets/illustrations/mimir-editorial.png",
    "assets/illustrations/coach-editorial.png",
    "assets/illustrations/olive-ink.png",
    "assets/illustrations/paper-grain.png",
    "assets/logos/shopify.svg",
    "assets/logos/dazn.png",
    "assets/logos/travix.png",
    "assets/logos/olx.svg",
    "assets/logos/storia-imoveis-supplied.png",
    "assets/logos/vtex.svg",
    "assets/logos/peixe-urbano.png",
    "assets/logos/devmedia.svg"
  ]) {
    eleventyConfig.addPassthroughCopy(file);
  }

  return {
    dir: { input: "src", includes: "_includes", output: "dist" },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: false
  };
}
