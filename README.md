# Layout v2 exploration

A local exploration of Leandro Oriente's personal site. Eleventy builds Markdown posts and shared templates locally into static HTML. The site uses plain HTML and CSS, self-hosted fonts, and no browser JavaScript.

## Preview

From this directory, with Node.js 22 or later installed:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173/ in your browser.

To inspect the same output that will be uploaded to Cloudflare:

```sh
npm run build
npm run preview
```

The build recreates `dist/`; the preview serves that directory on the same address. Use one preview server at a time.

## Cloudflare deployment

Production deploys to https://site.leandrooriente.com using Cloudflare Workers Static Assets. Each feature gets its own Cloudflare Worker Preview on a `workers.dev` URL. Eleventy builds the site locally into `dist/` before Wrangler uploads the output. Cloudflare receives only the static HTML/CSS, configured public assets, and font licenses; the generator does not run on Cloudflare. Source notes, generation prompts, research files, and unused assets stay out of that directory.

From this directory, with Node.js 22 or later installed:

```sh
npx --yes wrangler@4.149.0 whoami
npx --yes wrangler@4.149.0 deploy --dry-run
```

If login is needed, run `npx --yes wrangler@4.149.0 login --scopes account:read user:read workers_scripts:write workers_routes:write zone:read`.

For a feature preview, run the following, replacing the example name with your feature branch. Reuse the name to update that feature's environment:

```sh
npx --yes wrangler@4.149.0 preview --name layout-v2-explore --ignore-base-config
```

Wrangler returns a URL for the latest version of that feature and a unique URL for the individual deployment. Production is published separately with `npx --yes wrangler@4.149.0 deploy`. Remove a completed feature preview with `npx --yes wrangler@4.149.0 preview delete --name <feature-name>`.

`wrangler.jsonc` controls the hostname and static page routing. Deploy builds from the saved working files, including uncommitted changes. Run `npm run build` to inspect the public files in `dist/` without deploying. `eleventy.config.js` lists the public assets copied into the output.

The repository skill [deploy-site](.agents/skills/deploy-site/SKILL.md) contains the full workflow, verification, and recovery steps. Invoke it in Codex with `$deploy-site`.

## Structure

- `src/index.njk`: Home, with an illustrated personal introduction, career, selected illustrated articles, and contact.
- `src/writing.njk`: an independent blog index.
- `src/posts/*.md`: article copy and metadata, including publication year and each article's existing URL.
- `src/_includes/layouts/`: shared base and article layouts.
- `src/_includes/`: shared page fragments for consistent navigation, headings, and article previews.
- `eleventy.config.js`: Markdown, collections, reading estimates, and public asset passthrough configuration.
- `scripts/build.mjs`: cleans the output and runs the local Eleventy build.
- `dist/`: generated static pages and public assets; this is the deployment output.
- `styles.css`: shared typography, palette, navigation, and responsive layouts.
- `assets/`: the supplied photo, fonts, licenses, and provenance. `assets/illustrations/` holds the original editorial artwork and its generation prompts.
- `assets/logos/`: sourced company marks for the career timeline, with original files and source/usage records in `SOURCES.json`.

Home and Writing are ordinary pages. There is no section-jump navigation or Personal projects section. Accessibility skip links are the only in-page anchors.

Individual articles use an editorial layout inspired by Henry Desroches's [gallery-wall article](https://henry.codes/writing/using-figma-to-design-gallery-walls/): regular-weight Newsreader titles and section headings, generous section spacing, and a centered 680px reading column. Titles use the available header width and wrap naturally, with the subtitle centered beneath. Illustrations keep their original proportions and fit within the reading column. Sections have no numbering; the shared header navigation and a bottom return link lead back to Writing.

A small serif caption below each article's subtitle shows its publication year and estimated reading time: “Published in 2026 — 3 minute read.” These articles use 2026, the year of this exploration. Reading estimates are calculated centrally during the build, rounded up at 200 words per minute, including the title, subtitle, section headings, body, and closing quotation. Editing the Markdown updates the article caption automatically. Article lists use the metadata in each post's front matter as their single source.

For new posts, copy an existing post's front matter and set its permalink explicitly. Lower numeric `order` values appear first in article lists. Keep article prose in Markdown and reuse the shared article layout. Change common page elements in the shared templates and styling so every page stays consistent. Public assets are copied intentionally by `eleventy.config.js`; add an asset there when a new page needs it. Run the build and inspect the generated page before publishing.

The editorial illustrations guide the visual language throughout the site: warm paper grain, dry forest-green ink in the work section, serif display type, and a fine ledger spine connecting the career entries. A small SVG foliage sprig carries that language into the shared header. The ink texture contributes lightness variation through a CSS luminosity blend and a muted forest glaze. Supporting accents use quieter gray-greens. The colored punctuation accent is reserved for the Home name. Static textures sit behind the content; article illustrations retain their original proportions. The reading surface uses only paper grain; coffee, water, paint marks, and the fold have been removed. Layout and surface treatments use CSS. Article previews show illustration, title, summary, and a Read article link, without tags or status labels.

The shared Newsreader typography follows a balanced hierarchy:

| Role | Desktop | Mobile |
| --- | --- | --- |
| Home name and Writing title | Fluid 56–80px | 56px |
| Career and featured-writing headings | 56px | 42px |
| Home introduction | 30px | 24px |
| Small leads: career introduction, Writing introduction, article subtitle | 24px, line-height 1.4 | 24px, line-height 1.4 |
| Article-card titles | 32px | 32px |
| Article subsection headings (`h3`) | 32px | 28px |
| Body prose: biography, career descriptions, card summaries, article body | 21px | 20px |

Instrument Sans remains the utility face. Newsreader regular and genuine italic are self-hosted as `assets/fonts/newsreader-400.woff` and `assets/fonts/newsreader-400-italic.woff`; the closing article question uses the italic face. Font sources and the retained SIL Open Font License are recorded in `assets/PROVENANCE.txt`. The shared palette, page layouts, illustration treatments, and varied career-entry pacing remain unchanged.

## Exploration status

This branch is published at https://site.leandrooriente.com. The articles discuss design intentions and questions, not a list of released features. Review that copy as the exploration develops.

The career uses white company logos in place of visible name headings, retaining accessible company names. Marks come from official company pages or kits and the user-supplied OLX/Storia Imóveis artwork. Peixe Urbano uses a later mark preserved by a third-party logo archive as a temporary exploration asset; Midas Software stays as text until the correct employer mark can be verified. Logo provenance and usage notes are in `assets/logos/SOURCES.json`.

The Home introduction pairs the approved copy with `assets/illustrations/leandro-family-grounded-editorial.png`. At desktop widths, the seated family appears beside the introduction, capped at 440px wide. Below 1024px, the portrait sits between the subtitle and biography, centered and capped at 320px wide. The original 1086 × 1448 RGBA PNG is used unchanged; CSS scales it proportionally, and its transparent surroundings blend into the shared paper surface. The modest grass patch, contact shadows and three autumn leaves anchor the family.

A pale sage radial wash sits behind the portrait as a CSS layer, with a 12px blur and color fading to transparency by 82% of the gradient radius. Below 1024px, both the image and wash are centered. This surface treatment uses the existing PNG without generating or editing artwork.

The introduction begins with the name and the subtitle “Staff frontend developer at Shopify, working on checkout and Shop Pay.” The biography opens with “Hey there,” followed by husband and parent, Rio de Janeiro, and Amsterdam. Its professional paragraph connects the Shopify role, JavaScript and TypeScript, mentoring, and clearer development processes. The next paragraph covers agentic development, processes and systems around it, and using agents to their full potential while shipping software to a high standard of quality. Hobbies close the biography in a separate paragraph. The text follows the shared left edge, with a comfortable line length and the shared body-prose size. Newsreader carries identity, introduction, and body copy at three distinct scales; Instrument Sans is reserved for utility text.

Each page includes the same static SVG filter, giving all page and section headings uneven ink coverage, subtly irregular edges, and a faint ink bleed. Dark headings blend into the paper; light headings on the career surface keep their original contrast. Titles remain ordinary selectable text, with a solid-text fallback in forced-color mode. No JavaScript is needed. Career chronology stays in the timeline.

The Shopify timeline description follows the prior site's checkout, mentoring, and development-process statements. Other career dates, roles, and contribution descriptions follow the supplied design reference. The LinkedIn profile requires sign-in, so no new profile-specific accomplishments, metrics, or responsibilities have been added. The visual composition has evolved from that reference for this exploration.
