import { generateImage, responsiveImage } from "./scripts/images.mjs";
import { buildStylesheet } from "./scripts/styles.mjs";
import { assetUrl, prepareAssets } from "./scripts/assets.mjs";
import { addNavigationPrefetch, cleanPageUrl } from "./scripts/navigation-prefetch.mjs";
import { phoneDemo } from "./scripts/phone-media.mjs";
import { mimirPipeline } from "./scripts/mimir-pipeline.mjs";
import { battlestationDiagram } from "./scripts/battlestation-diagrams.mjs";
import { prBreakdown } from "./scripts/pr-breakdown.mjs";
import { codemodBreakdown } from "./scripts/codemod-breakdown.mjs";
import { uploadApiRollout } from "./scripts/upload-api-rollout.mjs";

export default function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });
  // Only explicitly selected drafts appear in the local development server.
  // Regular builds keep drafts out of pages, listings, and artwork.
  eleventyConfig.addPreprocessor("drafts", "md,njk", (data) => {
    const previewDraft = process.env.ELEVENTY_RUN_MODE === "serve" && data.localPreview === true;
    if (data.draft && !previewDraft) return false;
  });
  eleventyConfig.setServerOptions({ port: 4173 });
  eleventyConfig.addNunjucksAsyncShortcode("responsiveImage", responsiveImage);
  eleventyConfig.addShortcode("phoneDemo", phoneDemo);
  eleventyConfig.addShortcode("mimirPipeline", mimirPipeline);
  eleventyConfig.addShortcode("battlestationDiagram", battlestationDiagram);
  eleventyConfig.addShortcode("prBreakdown", prBreakdown);
  eleventyConfig.addShortcode("codemodBreakdown", codemodBreakdown);
  eleventyConfig.addShortcode("uploadApiRollout", uploadApiRollout);
  eleventyConfig.addFilter("assetUrl", assetUrl);
  eleventyConfig.addFilter("cleanPageUrl", cleanPageUrl);
  eleventyConfig.addWatchTarget("assets/");
  eleventyConfig.addWatchTarget("scripts/battlestation-diagrams.mjs");
  eleventyConfig.addWatchTarget("scripts/pr-breakdown.mjs");
  eleventyConfig.addWatchTarget("scripts/codemod-breakdown.mjs");
  eleventyConfig.addWatchTarget("scripts/upload-api-rollout.mjs");
  eleventyConfig.addWatchTarget("scripts/pr-card-art.mjs");

  // Refresh the known routes on every build, including added or removed posts.
  let pageUrls = new Set();
  eleventyConfig.on("eleventy.contentMap", ({ urlToInputPath }) => {
    pageUrls = new Set(Object.keys(urlToInputPath).filter((url) => /(?:\.html|\/)$/u.test(url)));
  });
  eleventyConfig.addTransform("navigationPrefetch", function (html) {
    if (!(this.page.outputPath || "").endsWith(".html")) return html;
    return addNavigationPrefetch(html, this.page.url, pageUrls);
  });

  eleventyConfig.addCollection("posts", (collection) =>
    collection.getFilteredByTag("posts").sort((a, b) => a.data.order - b.data.order)
  );

  // Count the rendered prose, title, and subtitle at 200 words per minute.
  eleventyConfig.addFilter("readingMinutes", (html, title, deck) => {
    const text = `${title} ${deck} ${html}`
      .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, " ")
      .trim();
    return Math.max(1, Math.ceil(text.split(/\s+/u).length / 200));
  });

  // Publish only the public files; source notes and unused art stay local.
  const staticAssets = [
    "assets/forest-sprig.svg",
    "assets/favicon.svg",
    "assets/favicon.ico",
    "assets/apple-touch-icon.png",
    "assets/fonts/instrument-sans-400.woff2",
    "assets/fonts/instrument-sans-500.woff2",
    "assets/fonts/newsreader-400.woff2",
    "assets/fonts/newsreader-400-italic.woff2",
    "assets/logos/shopify.svg",
    "assets/logos/dazn.png",
    "assets/logos/travix.png",
    "assets/logos/olx.svg",
    "assets/logos/storia-imoveis-supplied.png",
    "assets/logos/vtex.svg",
    "assets/logos/peixe-urbano.png",
    "assets/logos/devmedia.svg",
    "assets/logos/pi-supplied.png",
    "assets/illustrations/phone-frame-matte-black.png",
    "assets/illustrations/mimir-demo-poster.jpg",
    "assets/illustrations/mimir-user-editorial.webp",
    "assets/videos/mimir-demo.mp4",
    "assets/scripts/mimir-pipeline.js",
    "assets/scripts/phone-media.js",
    "assets/scripts/pr-breakdown.js"
  ];

  // Prepare dependencies before hashing CSS, then render pages with current URLs.
  let stylesheetUrl;
  let footerArtworkUrl;
  eleventyConfig.on("eleventy.before", async () => {
    await prepareAssets(staticAssets);
    stylesheetUrl = await buildStylesheet();
    const footerArtwork = await generateImage("/assets/illustrations/forest-lookout-firewatch.png", [2172]);
    footerArtworkUrl = footerArtwork.webp[0].url;
  });
  eleventyConfig.addGlobalData("stylesheetUrl", () => stylesheetUrl);
  eleventyConfig.addGlobalData("footerArtworkUrl", () => footerArtworkUrl);
  eleventyConfig.addWatchTarget("styles.css");
  eleventyConfig.addPassthroughCopy("assets/fonts/*-OFL.txt");
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.addPassthroughCopy({ "assets/favicon.ico": "favicon.ico" });

  return {
    dir: { input: "src", includes: "_includes", output: "dist" },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: false
  };
}
