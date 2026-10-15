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
- `.github/workflows/deploy.yml`: automatic production deployment from `main`.
- `.github/workflows/preview.yml` and `.github/scripts/pr-preview.mjs`: per-PR preview deployment, comment updates, and cleanup.
- `wrangler.jsonc`: production static assets Worker; `wrangler.redirect.jsonc` and `scripts/redirect-domain.mjs`: the `www` hostname redirect.

## Articles and public URLs

Keep `.html` permalinks in source front matter. Public links use `/`, `/writing/`, and extensionless article paths without a trailing slash. The `cleanPageUrl` filter applies that convention to article cards, canonical metadata, and navigation prefetch. Cloudflare redirects the legacy `.html` URLs.

Copy an existing article's front matter when adding a post. Set its permalink, `title`, `deck`, `description`, `summary`, `publicationYear`, `order`, `illustration`, and `illustrationAlt`. Lower `order` values appear first in article lists. The shared layout calculates reading time at 200 words per minute, rounded up, and uses the article's publication year. Articles with Nunjucks shortcodes also need `templateEngineOverride: njk,md`.

Every article automatically includes a personal-opinion disclosure in its footer. The wording lives in `src/_includes/layouts/article.njk`; update it there rather than adding it to individual posts.

Set `draft: true` to retain an article's source while excluding its page, listing, and artwork from regular builds. Add `localPreview: true` to include that draft during `npm run dev`; its copy can be reviewed before adding an illustration. Remove `draft` or set it to `false` to include the article in the production build.

The current source builds Home, Writing, and these published articles:

- `/writing/one-battlestation-two-computers`
- `/writing/an-answer-should-be-easy-to-check`
- `/writing/avoiding-slop-grenades`

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

Use GitHub Actions for hosted deployments: commit and push a feature branch, open or update its pull request for a preview, and merge into protected `main` when production is authorized. Actions builds the pushed commit and uploads its generated static files to the assets-only `leandrooriente-site` Worker. Uncommitted local changes are not deployed. Local builds and development servers are for verification.

The canonical production origin is `https://leandrooriente.com`, configured in `src/_data/site.js`. Preview builds set `SITE_URL` to their returned test origin. Preview-only PRs stay open for testing until the user asks to close or merge them.

### Automatic production deployment

Merging a pull request into protected `main` starts [the production workflow](.github/workflows/deploy.yml). It uses Node.js 22, installs the locked dependencies with `npm ci`, and runs pinned Wrangler 4.149.0. Wrangler invokes the existing clean build before uploading the assets. Production runs are serialized, and an active deployment is allowed to finish.

Configure the GitHub `production` environment to allow only the `main` branch. Store the scoped Cloudflare API token as `CLOUDFLARE_API_TOKEN` in the repository secrets or the `production` environment secrets. The current setup uses a repository secret. The account ID is already in `wrangler.jsonc`; no account secret is needed. The workflow has read-only repository access and uses actions pinned to full commit hashes.

Create the token with **Account → Workers Scripts → Edit** and **Account → Account Settings → Read** limited to the configured Cloudflare account, plus **Zone → Workers Routes → Edit** and **Zone → Zone → Read** limited to `leandrooriente.com`. These cover the Worker deployment, Custom Domain, and zone lookup; the workflow does not need credentials for other Cloudflare products.

The workflow verifies published and draft page responses and the HTTP/HTTPS `www` redirects after deployment. It deploys the main assets Worker; the redirect Worker remains separately managed. For a manual rerun, select `main` under **Actions → Deploy production → Run workflow**, or use `gh workflow run deploy.yml --ref main`. Runs requested on other branches skip the deployment job.

### Automatic pull request previews

Opening or reopening a pull request from a branch in this repository starts [the preview workflow](.github/workflows/preview.yml). Every push to that branch updates the same Cloudflare environment, named `pr-<pull-request-number>`. Draft pull requests are included. Fork and Dependabot pull requests do not use the deployment credential.

After a successful deployment, GitHub Actions adds a **Cloudflare preview** comment with the stable test URL, deployed commit, and workflow link. Later deployments update that comment. Closing or merging the pull request deletes its preview and marks the comment as closed; reopening recreates the environment.

If a new build fails, the previous successful preview remains available. The commit shown in the comment identifies its deployed version. Before the first successful deployment, there is no preview-link comment; check the pull request's **Pull request preview** run for progress or errors.

Previews use the existing `CLOUDFLARE_API_TOKEN` repository secret. The build runs without deployment credentials, with `SITE_URL` set to the returned preview origin. A separate job uploads the generated static files using a fixed preview configuration, checks the live preview, and updates the comment. Runs are serialized per pull request and skip outdated commits.

### Deployment failures and manual operations

Inspect the failed GitHub Actions job, fix the relevant code or workflow through the PR, and push or retry through Actions. Local Cloudflare login is not needed for the automatic workflows. A failed preview does not authorize a local upload or production deployment.

Direct Wrangler publishing, provider administration, and rollback are reserved for explicit requests for those manual operations. They are not part of the standard site workflow.

### www redirect and recovery

The main Worker has a Custom Domain binding for `leandrooriente.com`. `www.leandrooriente.com` has a proxied CNAME pointing to the apex.

The `leandrooriente-site-redirect` Worker owns `www.leandrooriente.com/*`. That route takes precedence over static assets and returns permanent 301 redirects to the HTTPS apex, preserving paths and query strings. The production workflow deploys only the main assets Worker. Redirect Worker and DNS changes require separate infrastructure work with Actions support through a PR, or an explicitly requested manual operation. Keep them unchanged during ordinary site deployments.

The redirect configuration has no site build or assets. Verify `www.leandrooriente.com` redirects correctly for `/` and an article path with a query string.

The October 12, 2026 migration retained the four former GitHub Pages apex A records at `previous-site-origin.leandrooriente.com` as a DNS recovery backup. The apex record is now managed by the main Worker's Custom Domain.

The repository [deploy-site skill](.agents/skills/deploy-site/SKILL.md) contains the full deployment, verification, preview cleanup, and recovery workflow. Invoke it in Codex with `$deploy-site`.
