import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DomUtils, parseDocument } from "htmlparser2";
import site from "../src/_data/site.js";
import { cleanPageUrl } from "./navigation-prefetch.mjs";

const output = fileURLToPath(new URL("../dist/", import.meta.url));
const elements = (document, name) => DomUtils.getElementsByTagName(name, document);
const text = (element) => DomUtils.textContent(element).trim();

// Check rendered output, including shared templates, rather than front matter alone.
export async function checkSeo() {
  const files = (await readdir(output, { recursive: true })).filter((file) => file.endsWith(".html"));
  const titles = new Set();
  const descriptions = new Set();
  const indexable = new Set();

  for (const file of files) {
    const document = parseDocument(await readFile(path.join(output, file), "utf8"));
    const head = elements(document, "head")[0];
    const pageUrl = new URL(cleanPageUrl(`/${file.split(path.sep).join("/")}`), site.url).href;
    const label = `${file}: `;
    const meta = elements(head, "meta");
    const content = (name) => meta.find(({ attribs }) => attribs.name === name)?.attribs.content;
    const property = (name) => meta.find(({ attribs }) => attribs.property === name)?.attribs.content;
    const robots = content("robots") || "";
    const noindex = /\bnoindex\b/u.test(robots);
    if (site.isPreview) assert(noindex, label + "preview must be noindex");

    const titleElements = elements(head, "title");
    assert.equal(titleElements.length, 1, label + "one title required");
    const title = text(titleElements[0]);
    const description = content("description");
    assert(title && !titles.has(title), label + "title missing or duplicated");
    assert(description && !descriptions.has(description), label + "description missing or duplicated");
    titles.add(title);
    descriptions.add(description);
    assert.equal(elements(document, "h1").length, 1, label + "one H1 required");
    const canonicals = elements(document, "link").filter(({ attribs }) => attribs.rel === "canonical");
    assert.equal(canonicals.length, 1, label + "one canonical required");
    assert.equal(canonicals[0].attribs.href, pageUrl, label + "canonical URL mismatch");
    assert.equal(property("og:url"), pageUrl, label + "Open Graph URL mismatch");

    const scripts = elements(document, "script").filter(({ attribs }) => attribs.type === "application/ld+json");
    assert.equal(scripts.length, 1, label + "one JSON-LD graph required");
    const schema = JSON.parse(text(scripts[0]));
    assert.equal(schema["@context"], "https://schema.org", label + "schema context mismatch");
    const graph = schema["@graph"];
    const person = graph.find((node) => node["@type"] === "Person");
    assert.equal(person?.url, `${site.url}/`, label + "author URL mismatch");
    const article = graph.find((node) => node["@type"] === "BlogPosting");
    if (property("og:type") === "article") {
      assert(article?.headline, label + "article schema missing");
      assert.equal(article.url, pageUrl, label + "article URL mismatch");
      assert.equal(article.author["@id"], person["@id"], label + "article author missing");
      assert.equal(article.image.url, property("og:image"), label + "article image mismatch");
      const byline = elements(document, "a").find(({ attribs }) => attribs.rel === "author");
      assert(byline && text(byline) === site.author.name, label + "visible author missing");
      if (article.datePublished) {
        assert(elements(document, "time").some(({ attribs }) => attribs.datetime === article.datePublished),
          label + "visible and structured publication dates differ");
      }
    }

    for (const image of elements(document, "img")) {
      assert("alt" in image.attribs, label + "image alt attribute missing");
      assert(image.attribs.width && image.attribs.height, label + "image dimensions missing");
    }
    // Preview pages still belong in their own sitemap, but never in production's.
    if (!noindex || site.isPreview) indexable.add(pageUrl);
  }

  const sitemap = parseDocument(await readFile(path.join(output, "sitemap.xml"), "utf8"), { xmlMode: true });
  const locations = elements(sitemap, "loc").map(text);
  assert.equal(new Set(locations).size, locations.length, "Duplicate sitemap URLs");
  assert.deepEqual(new Set(locations), indexable, "Sitemap must contain exactly the public canonical HTML URLs");
  const robots = await readFile(path.join(output, "robots.txt"), "utf8");
  assert(robots.includes(`Sitemap: ${site.url}/sitemap.xml`), "robots.txt must advertise the current sitemap");
  assert(!/^Disallow:\s*\/\s*$/mu.test(robots), "robots.txt must allow crawling so preview noindex can be read");
  console.log(`SEO checks passed for ${files.length} pages and ${locations.length} sitemap URLs (${site.isPreview ? "preview" : "production"}).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await checkSeo();
