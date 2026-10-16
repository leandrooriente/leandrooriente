# Leandro Oriente's personal site

Source for [leandrooriente.com](https://leandrooriente.com), built with [Eleventy](https://www.11ty.dev/), Markdown, and Nunjucks, and hosted on Cloudflare Workers Static Assets.

## Local development

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open [localhost:4173](http://localhost:4173). To build the site or preview it with Cloudflare's URL handling and response headers:

```sh
npm run build    # Generate dist/
npm run preview  # Rebuild and serve at http://localhost:8787
```

## Source layout

- [`src/`](src/): pages, Markdown articles in `posts/`, shared templates in `_includes/`, and site metadata in `_data/`.
- [`styles.css`](styles.css): site styles.
- [`assets/`](assets/): artwork, fonts, logos, videos, and browser scripts.
- [`scripts/`](scripts/): build helpers, image processing, and article diagrams.
- [`eleventy.config.js`](eleventy.config.js): site configuration, collections, shortcodes, and public assets.

Articles use front matter for metadata and permalinks. Set `draft: true` to exclude an article from production; add `localPreview: true` to include it during local development.

See the [art guide](.agents/skills/site-art/SKILL.md) for visual direction, [asset provenance](assets/PROVENANCE.txt) for font sources, and [logo sources](assets/logos/SOURCES.json) for attribution and usage notes.

## Deployment

GitHub Actions deploys [pull request previews](.github/workflows/preview.yml) and [production updates from `main`](.github/workflows/deploy.yml). Successful previews get a stable URL in a pull request comment; closing or merging the pull request removes the preview.
