# Leandro Oriente's personal site

Source for [leandrooriente.com](https://leandrooriente.com). Eleventy builds Markdown articles and shared Nunjucks templates into static HTML for Cloudflare Workers Static Assets. The repository's default branch is `main`.

Changes to `main` require a pull request with all review conversations resolved. Direct pushes, force pushes, and branch deletion are blocked for everyone, including administrators. No approving review is required.

## Local development

Use Node.js 22 or later. The build dependencies are pinned in `package.json` and `package-lock.json`: Eleventy 3.1.6, Eleventy Image 7.0.0, and htmlparser2 12.0.0. Preview and deployment commands use Wrangler 4.149.0.

```sh
npm ci
npm run dev
```

The development server is available at http://127.0.0.1:4173/. To inspect the production build with Cloudflare's URL handling and response headers:

```sh
npm run build
npm run preview
```

`build` clears and recreates `dist/`. `preview` rebuilds and serves the site locally at http://127.0.0.1:8787/ without uploading it. Use `npm run preview -- --port 4173` to change its port, and run one preview server at a time. Generated output, image caches, local verification files, and dependencies belong in the ignored `dist/`, `tmp/`, `output/`, and `node_modules/` directories.

## Repository structure

- `src/index.njk` and `src/writing.njk`: Home and Writing pages.
- `src/posts/*.md`: article prose, metadata, and explicit permalinks.
- `src/_includes/`: shared layouts, navigation, footer, and article previews.
- `src/_data/`: site identity, canonical URLs, and article sharing metadata.
- `styles.css`: source stylesheet; edit this file rather than the generated copy.
- `eleventy.config.js`: collections, draft handling, reading estimates, shortcodes, and the public asset list.
- `scripts/`: clean builds, asset fingerprinting, image and stylesheet generation, navigation prefetch, and article diagrams and video markup.
- `assets/`: active source artwork, fonts, logos, videos, browser scripts, and provenance records.
- `src/_headers`: cache rules copied into the public output.
- `wrangler.jsonc`: production static assets Worker; `wrangler.redirect.jsonc` and `scripts/redirect-domain.mjs`: the `www` hostname redirect.

## Articles and public URLs

Keep `.html` permalinks in source front matter. Public links use `/`, `/writing/`, and extensionless article paths without a trailing slash. The `cleanPageUrl` filter applies that convention to article cards, canonical metadata, and navigation prefetch. Cloudflare redirects the legacy `.html` URLs.

Copy an existing article's front matter when adding a post. Set its permalink, `title`, `deck`, `description`, `summary`, `publicationYear`, `order`, `illustration`, and `illustrationAlt`. Lower `order` values appear first in article lists. The shared layout calculates reading time at 200 words per minute, rounded up, and uses the article's publication year. Articles with Nunjucks shortcodes also need `templateEngineOverride: njk,md`.

Set `draft: true` to retain an article's source while excluding its page, listing, and artwork from regular builds. Add `localPreview: true` to include that draft during `npm run dev`; its copy can be reviewed before adding an illustration. Remove `draft` or set it to `false` to include the article in the production build.

The current source builds Home, Writing, and these published articles:

- `/writing/one-battlestation-two-computers`
- `/writing/an-answer-should-be-easy-to-check`

`seeing-the-work-while-it-happens.md` remains a draft. Its extensionless and `.html` URLs should return 404 in a regular build. Front matter is the authority for publication status.

## Assets, images, and caching

Add ordinary public assets to `staticAssets` in `eleventy.config.js`, then resolve their URLs with the `assetUrl` filter, for example `{{ '/assets/logos/shopify.svg' | assetUrl }}`. CSS asset URLs are rewritten during the build. Only configured public assets, generated images, and font licenses enter `dist/`; source notes and generation prompts stay in the repository.

Portraits and article illustrations use the `responsiveImage` shortcode with a source path, alt text, and the `portrait`, `card`, or `article` profile. It generates responsive AVIF sources and WebP fallbacks with intrinsic dimensions and layout-specific `sizes`. Article layouts use the `illustration` and `illustrationAlt` front matter automatically. Follow [the site art guide](.agents/skills/site-art/SKILL.md) when creating or changing graphics.

Generated images are cached in `tmp/image-cache/` and published to `dist/assets/images/` with filenames hashing their encoded contents. Stop the development server before clearing the cache; the next build regenerates it. The image pipeline also produces centered 1200 × 630 JPEG article sharing images, flattening transparency onto warm paper. Article sharing requires `title`, `description`, `illustration`, and `illustrationAlt`.

`scripts/styles.mjs` generates responsive AVIF/WebP paper and ink texture tiles and builds the stylesheet. Fonts, logos, browser scripts, other configured files, and the completed CSS receive content hashes under `dist/assets/static/`. CSS is hashed after its dependency URLs are replaced, so a changed font or texture also updates the stylesheet URL.

`src/_headers` gives `/assets/static/*` and `/assets/images/*` one-year immutable browser caching. HTML and font licenses retain Cloudflare's default revalidation policy. These headers apply to Wrangler previews and hosted deployments; the Eleventy development server does not apply them.

Navigation prefetch rules are generated from links to pages present in the current build. In supporting browsers, a small inline script enables document prefetch after the window loads and the browser is idle. The Mimir diagram and video player use the separate scripts in `assets/scripts/`.

### Fonts and provenance

The site publishes four self-hosted WOFF2 faces: Instrument Sans 400/500 and Newsreader 400 regular/italic. Keep the original WOFF sources and SIL Open Font Licenses in `assets/fonts/`. The licenses are also copied to the public output. Font sources and conversion details are recorded in [assets/PROVENANCE.txt](assets/PROVENANCE.txt); company logo sources and usage notes are in [assets/logos/SOURCES.json](assets/logos/SOURCES.json).

WOFF2 conversion is a preparation step when a font changes, not part of the normal build. The current files were converted with FontTools 4.66.1 and Brotli 1.2.0. To regenerate a face in a separate environment with `fonttools[woff]` installed, run `python -m fontTools.ttLib.woff2 compress assets/fonts/newsreader-400.woff -o assets/fonts/newsreader-400.woff2`.

## Cloudflare deployment

The canonical origin is `https://leandrooriente.com`, configured in `src/_data/site.js`. `wrangler.jsonc` builds the saved working files, including uncommitted changes, before uploading `dist/` to the assets-only `leandrooriente-site` Worker. The generator runs locally.

Check account access and validate the build and configuration:

```sh
npx --yes wrangler@4.149.0 whoami
npx --yes wrangler@4.149.0 deploy --dry-run
```

If authentication is needed, run `npx --yes wrangler@4.149.0 login --scopes account:read user:read workers_scripts:write workers_routes:write zone:read`.

Create or update a feature preview with `npx --yes wrangler@4.149.0 preview --name <feature-name> --ignore-base-config`, using a stable name for that feature.

Use the URL returned by Wrangler. Set `SITE_URL` to that preview's origin when rebuilding or updating it so canonical URLs and sharing images point to the preview. Production builds use the canonical origin when `SITE_URL` is unset. Remove a completed preview with `npx --yes wrangler@4.149.0 preview delete --name <feature-name> --skip-confirmation`.

Publish production separately with `npx --yes wrangler@4.149.0 deploy`.

### www redirect and recovery

The main Worker has a Custom Domain binding for `leandrooriente.com`. `www.leandrooriente.com` has a proxied CNAME pointing to the apex.

The `leandrooriente-site-redirect` Worker owns `www.leandrooriente.com/*`. That route takes precedence over static assets and returns permanent 301 redirects to the HTTPS apex, preserving paths and query strings. Deploy that Worker separately when its code or routes change:

```sh
npx --yes wrangler@4.149.0 deploy --config wrangler.redirect.jsonc --dry-run
npx --yes wrangler@4.149.0 deploy --config wrangler.redirect.jsonc
```

Its configuration has no site build or assets. Verify `www.leandrooriente.com` redirects correctly for `/` and an article path with a query string.

The October 12, 2026 migration retained the four former GitHub Pages apex A records at `previous-site-origin.leandrooriente.com` as a DNS recovery backup. The apex record is now managed by the main Worker's Custom Domain.

The repository [deploy-site skill](.agents/skills/deploy-site/SKILL.md) contains the full deployment, verification, preview cleanup, and recovery workflow. Invoke it in Codex with `$deploy-site`.
