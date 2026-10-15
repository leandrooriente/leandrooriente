import { cleanPageUrl } from "./navigation-prefetch.mjs";

// JSON-LD is a raw-text script: HTML entities cannot escape its contents.
export function jsonLd(value) {
  return JSON.stringify(value).replace(/</gu, "\\u003c");
}

export function structuredData(data) {
  const { site, title, description, canonicalUrl, socialImage } = data;
  const home = new URL("/", site.url).href;
  const person = {
    "@type": "Person",
    "@id": `${home}#person`,
    name: site.author.name,
    url: home,
    jobTitle: site.author.jobTitle,
    sameAs: site.author.sameAs
  };
  const website = {
    "@type": "WebSite",
    "@id": `${home}#website`,
    url: home,
    name: site.name,
    inLanguage: site.language,
    publisher: { "@id": person["@id"] }
  };
  const isArticle = data.tags?.includes("posts");
  const page = {
    "@type": isArticle ? "WebPage" : canonicalUrl === home ? "ProfilePage" : "CollectionPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: site.language,
    isPartOf: { "@id": website["@id"] }
  };
  const graph = [website, person, page];

  if (canonicalUrl === home) page.mainEntity = { "@id": person["@id"] };
  if (isArticle) {
    const article = {
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      url: canonicalUrl,
      headline: title,
      description,
      inLanguage: site.language,
      author: { "@id": person["@id"] },
      mainEntityOfPage: { "@id": page["@id"] }
    };
    if (socialImage) {
      article.image = {
        "@type": "ImageObject",
        url: socialImage.url,
        width: socialImage.width,
        height: socialImage.height
      };
    }
    // Only editorially supplied dates describe publication, never build times.
    if (data.publishedOn) article.datePublished = data.publishedOn;
    if (data.updatedOn) article.dateModified = data.updatedOn;
    page.mainEntity = { "@id": article["@id"] };
    graph.push(article);
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export const sitemapPages = (pages) => pages.filter(({ url, data }) =>
  url && /(?:\.html|\/)$/u.test(url) && !data.draft && !data.noindex
).sort((a, b) => cleanPageUrl(a.url).localeCompare(cleanPageUrl(b.url)));

export function displayDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}
