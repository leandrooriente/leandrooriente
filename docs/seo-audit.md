# SEO audit and action plan

Audit date: 15 October 2026. Site: https://leandrooriente.com. Production baseline: `2322904`.

The site has a sound technical foundation and three substantial, original articles. The clearest technical defect is that the HTTP apex serves duplicate pages rather than redirecting to HTTPS. The strongest immediate code improvements are clearer topic titles, explicit authorship and structured data, better loading of article images, and a sitemap. Search Console is the next source of evidence needed to decide which content investments will attract readers.

## Scope and evidence

The live crawl covered all five public HTML pages, 98 additional same-origin linked URLs and assets, internal fragments, responsive images, sharing images, URL variants, redirects, robots.txt, sitemap routes, drafts, and unknown routes. Source review covered Eleventy templates, article front matter, image generation, CSS, and hosting configuration.

Five Lighthouse 13.5.0 runs sampled the production homepage and Mimir article on mobile and desktop, plus the two-Mac article on mobile. Mobile used simulated slow 4G, 4× CPU slowdown, a 412 × 823 viewport, and device pixel ratio 1.75. These are single lab samples, not field Core Web Vitals or ranking measurements. The unauthenticated PageSpeed Insights API returned 429, so no field dataset was obtained. Search Console, backlink history, search volume, and actual Google index coverage were unavailable. A public `site:` query cannot establish index coverage.

Compact results are saved in [seo-evidence](seo-evidence/). Full local Lighthouse JSON and HTML reports are in `/tmp/leandro-seo-performance/` for this session.

## Prioritized findings

| Priority | Finding | Evidence and implication | Action and status |
| --- | --- | --- | --- |
| High | HTTP apex serves duplicate content | `http://leandrooriente.com/` and an article return 200. Canonicals point to HTTPS, but transport variants remain accessible. | Configure the scoped permanent redirect below. Requires a Cloudflare account change; the source PR does not apply it. |
| High | Search decisions lack first-party measurement | No verified impressions, clicks, queries, indexed pages, or backlinks were available. | Use Search Console to validate indexing and establish a query/page baseline before claiming traffic problems or choosing keywords by demand. |
| Medium | Mobile image loading can improve | Home LCP 3.45 s; Mimir 3.20 s. The first-viewport article illustration was lazy loaded; Mimir's frame PNG was 704 KiB. | Article hero is now eager/high priority. Frame is now lossless WebP, saving 301 KiB. Decorative loading remains a follow-up. |
| Medium | Titles underdescribe some subjects | “One battlestation, two computers” obscured the two-Mac, shared-monitor solution. Writing metadata was broad. | Titles and archive copy now name the real subjects. URLs are unchanged. |
| Medium | Article authorship and machine-readable identity are limited | No JSON-LD on any page, and article headers only displayed a year and reading time. | Added linked bylines and Person, WebSite, ProfilePage/CollectionPage/WebPage, and BlogPosting data. Added a verified full date for the new AI PR article. |
| Low | No sitemap declaration | `/sitemap.xml` returned 404. robots.txt returned 200 with Cloudflare comments, allowed crawling, and advertised no sitemap. | Added automatic canonical public-page sitemap and robots.txt declaration. |
| Low | Empty error pages and text-only non-article sharing | Unknown paths correctly return 404 but provide no navigation. Home/Writing have no social image. | Optional follow-up for reader experience and sharing. |

Missing a sitemap was not blocking crawlers: every public page was already linked from the homepage and writing archive. Google describes a sitemap as a discovery aid, not an indexing guarantee, and notes that small, comprehensively linked sites may not need one. The automatic sitemap gives this site a useful submission and monitoring endpoint. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).

## What already works

All five public pages returned 200 and have unique titles/descriptions, exactly one H1, correct self-referencing HTTPS canonicals, and matching Open Graph URLs. Main content and links are rendered in static HTML. No production noindex rule was found. All 98 additional checked internal URLs/assets returned 200, and no broken internal fragment was found.

The three article sharing images return 200 and have complete 1200 × 630 JPEG metadata. The Coach draft and nonexistent routes return actual 404 responses. HTTP and HTTPS `www` already redirect directly to the HTTPS apex. Cloudflare normalizes `.html` and slash variants; query-string variants retain a clean canonical. These are not priorities for a URL migration.

Image dimensions, responsive AVIF/WebP, local WOFF2 fonts, deferred scripts, reduced-motion behavior, and long-lived immutable caching are already in place. All lab samples had zero total blocking time and very low layout shift. All five samples scored 100 in Lighthouse's automated SEO, accessibility, and best-practices categories; these limited checks do not establish complete SEO or accessibility health.

## Performance measurements

| Production page | Device | Performance | First contentful paint | Largest contentful paint | Total blocking time | Layout shift | Transfer |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | Mobile | 91 | 1.00 s | 3.45 s | 0 ms | 0 | 707 KiB |
| Mimir | Mobile | 93 | 1.18 s | 3.20 s | 0 ms | 0.007 | 1,327 KiB |
| Two Macs | Mobile | 99 | 1.02 s | 2.22 s | 0 ms | 0.012 | 400 KiB |
| Home | Desktop | 100 | 0.35 s | 0.57 s | 0 ms | 0 | 542 KiB |
| Mimir | Desktop | 99 | 0.34 s | 1.02 s | 0 ms | 0.003 | 1,342 KiB |

Good field targets are LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1 at the 75th percentile, measured separately for mobile and desktop. The mobile LCP samples justify investigation; they do not establish a field failure. Lighthouse's page-load test does not measure real-user INP. [Web Vitals definitions](https://web.dev/articles/vitals).

The mobile homepage transferred roughly 496 KiB of olive texture, paper grain, and footer landscape, about 70% of its sampled initial transfer. The footer SVG fetches its artwork before the reader reaches it. Investigate deferring that fetch and carefully testing texture encodings while retaining the site's art direction. Lighthouse attributed LCP to an SVG pattern image with a zero-sized diagnostic rectangle; verify the actual visible candidate before attributing the 3.45-second result to footer painting.

The Mimir phone frame decreased from 720,730 to 412,466 bytes: **308,264 bytes saved, or 42.77%**. All 6,290,624 decoded RGBA bytes match, including transparency. Source art, dimensions, video, first-frame behavior, and playback controls are preserved. This is a verified asset-size reduction; no production LCP improvement is claimed before release and measurement.

## Implemented changes

- Generate `/sitemap.xml` from public canonical HTML routes, excluding drafts and pages explicitly marked noindex. Do not invent `lastmod` dates or sitemap priorities.
- Advertise the sitemap in `/robots.txt` while allowing crawling. Preview noindex remains readable by crawlers.
- Add a safely serialized JSON-LD graph with consistent author, website, page, and article identities. Article headline, description, image, and canonical URL match the page.
- Add “By Leandro Oriente” linked to the existing homepage biography.
- Add `publishedOn: "2026-10-15"` to the AI PR article, whose first production release is evidenced by the [successful deployment](https://github.com/leandrooriente/leandrooriente/actions/runs/38787698006). Keep year-only display on the older articles until original publication dates are confirmed; migration/build timestamps are not substituted.
- Enable large image previews with `max-image-preview:large`; reinforce preview and local-draft noindex in HTML alongside the hosted preview header.
- Change the two-Mac title to “Two Macs, one monitor: a USB switch and DDC” and its summary to describe the shared peripherals and automatic input switching.
- Describe AI-assisted development and local tools in Writing metadata and introduction.
- Load the top article illustration eagerly with high priority; retain lazy loading below it.
- Encode the approved phone frame as a pixel-identical lossless WebP through the existing image cache.
- Check rendered titles, descriptions, H1s, canonicals, sharing URLs, schema, authorship, date consistency, image attributes, sitemap coverage, and preview noindex during every production/preview build.

Structured data makes existing facts explicit and may improve search presentation; it does not guarantee a rich result or a ranking increase. [Google article guidance](https://developers.google.com/search/docs/appearance/structured-data/article). Date values should describe real publication or material updates and agree with visible dates. [Publication date guidance](https://developers.google.com/search/docs/appearance/publication-dates).

## Cloudflare redirect action

Create a Single Redirect Rule scoped to the apex HTTP hostname:

| Setting | Value |
| --- | --- |
| Incoming URL wildcard | `http://leandrooriente.com/*` |
| Target URL | `https://leandrooriente.com/${1}` |
| Status | `301` |
| Preserve query string | Enabled |

This leaves the existing direct `www` redirect and other hosts unchanged. Cloudflare's static-assets `_redirects` file does not support domain-level redirects; an unconditional path redirect back to the same HTTPS origin could loop. “Always Use HTTPS” is an alternative only when HTTPS should be enforced across the whole zone, including every subdomain. [Cloudflare HTTPS redirect example](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-admin-https/), [static redirect limits](https://developers.cloudflare.com/workers/static-assets/redirects/).

After applying the rule, verify that the homepage and an article with `?seo-check=1` return a single 301 from HTTP to the same HTTPS path/query. Recheck HTTP/HTTPS `www` behavior and normal HTTPS responses.

## Content and search intent

The site's strongest evidence is first-hand engineering experience: original systems, implementation diagrams, a working recording, and concrete decisions. Keep that advantage. The following query groups describe content fit; they are hypotheses, not validated search-volume or ranking claims.

| Page | Likely reader intent | Best next improvement |
| --- | --- | --- |
| Home | Leandro Oriente, frontend developer, Shopify career/profile | Keep role and biography accurate; use the existing homepage as the author identity rather than creating a thin duplicate profile. |
| AI PR article | Reviewing AI-generated pull requests, avoiding slop grenades, keeping agent changes reviewable | A reusable acceptance/review checklist and concrete before/after PR example could make a useful companion article. |
| Mimir | Local AI search for Proton Mail, private email/calendar assistant, hybrid email retrieval | Publish a reproducible evaluation with a defined question set, retrieval failures, latency, and hardware/model settings. |
| Two Macs | One monitor and two Macs, USB switching, automatic DDC/CI input switching | Add verified monitor/macOS compatibility and practical setup/configuration steps, linking to the existing helper repository. |
| Writing | Discovering the author's technical articles | Keep the topic description aligned with the actual archive; introduce topic hubs only when there is enough useful material. |

Descriptive titles should reflect the page accurately; they do not need an arbitrary character quota. Google may choose a different title in results. [Title guidance](https://developers.google.com/search/docs/appearance/title-link). Add contextual links when follow-up articles answer a natural next question. Current articles are fully discoverable without forcing links between loosely related topics. [Link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).

Keep the existing Mimir slug even though its wording predates the current title. A cosmetic slug change adds migration work with little demonstrated benefit. Do not create thin keyword pages, fabricated evaluation numbers, speculative FAQ markup, or a LocalBusiness identity for a personal site. Originality and useful detail matter more than producing a large archive quickly. [People-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## Release and measurement plan

1. Review the PR preview and merge when production publication is authorized. Verify the production Actions run and live metadata, sitemap, robots.txt, images, and draft 404 afterward.
2. Apply and verify the scoped HTTP redirect in Cloudflare.
3. Open the verified domain property in Search Console. Submit `https://leandrooriente.com/sitemap.xml`; inspect the homepage and all three article URLs for crawl permission, selected canonical, and indexing status. Use Rich Results Test to confirm article/profile markup interpretation after publication.
4. Export available Search Console performance data for queries and pages, split branded and non-branded discovery, and compare device/country segments. Prefer page/query pairs over sitewide averages when deciding whether to change a title. For this small archive, avoid treating a few impressions or a short observation period as a trend.
5. Confirm the original Mimir/two-Mac publication dates. Add exact dates consistently in visible metadata and schema, and record future material editorial updates explicitly.
6. Prioritize one substantial companion article using actual queries plus the author's experience. Promote it through relevant existing project documentation and human-selected professional channels; do not manufacture backlinks or automatically send outreach.
7. After roughly four weeks, review available indexing, impressions, clicks, CTR, and engaged reading together. Compare equivalent periods and record content releases. Reassess mobile performance with repeated lab runs and field data when available.

[Search Console workflow](https://developers.google.com/search/docs/monitor-debug/search-console-start).
