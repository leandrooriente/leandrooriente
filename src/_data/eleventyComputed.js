import { generateSocialImage } from "../../scripts/images.mjs";
import { cleanPageUrl } from "../../scripts/navigation-prefetch.mjs";

export default {
  canonicalUrl: ({ page, site }) => new URL(cleanPageUrl(page.url), site.url).href,
  socialImage: async (data) => {
    if (!data.tags?.includes("posts")) return null;
    // Copy can be reviewed locally before a draft has its artwork.
    if (data.draft && data.localPreview === true &&
        process.env.ELEVENTY_RUN_MODE === "serve" && !data.illustration) return null;

    // Every article must supply a complete preview; use the same fields as the page.
    for (const field of ["title", "description", "illustration", "illustrationAlt"]) {
      if (typeof data[field] !== "string" || !data[field].trim()) {
        throw new Error(`Missing article sharing metadata: ${field} in ${data.page.inputPath}`);
      }
    }

    const image = await generateSocialImage(data.illustration);
    return {
      url: new URL(image.url, data.site.url).href,
      width: image.width,
      height: image.height,
      type: image.sourceType,
      alt: data.illustrationAlt
    };
  }
};
