# Mimir reference

This is a portable snapshot of the approved diagram deployed on 2026-10-12. It preserves the final style and mechanics, not a prescribed architecture for future diagrams.

## Open the example

From this skill directory, run:

```sh
node scripts/preview-example.mjs /tmp/site-diagrams-preview
```

Use a new output directory. The helper copies the reference assets and renders `index.html`, without modifying the site or making network requests. Open that file in a browser, or serve the directory through the task’s usual local preview server. It has no package dependencies or remote font requests. The fallback fonts differ from the portfolio’s installed Instrument Sans and Newsreader, so judge exact typography in the target page.

## Bundled files

- [pipeline.mjs](../assets/mimir-reference/pipeline.mjs): native SVG renderer, illustrations, layout paths, token symbols, motion helpers, journey sequences, and a separate static mobile renderer.
- [controller.js](../assets/mimir-reference/controller.js): visibility, breakpoint, reduced motion, and pause/play handling.
- [diagram.css](../assets/mimir-reference/diagram.css): extracted component styles with standalone variable fallbacks.
- [user.webp](../assets/mimir-reference/user.webp): approved transparent waist-up editorial person.
- [pi-logo.png](../assets/mimir-reference/pi-logo.png): user-supplied Pi logo used unchanged on the agent harness robot’s chest.

The portrait can be reused where appropriate. The Pi logo belongs on a diagram that actually involves Pi, rather than serving as a generic agent mark. Other service illustrations are SVG contours within the renderer.

The renderer’s only portability adjustment is replacing the site’s `assetUrl` import with a resolver for these bundled files. The style snapshot adds fallback values for the four page variables and resets the browser’s default horizontal figure margins, which the site normally handles globally. Service names, positions, request timings, and visible labels otherwise match the approved diagram.

## Example semantics

The main journey is user → Mimir → Pi → local model → Pi → Hermes → store, followed by sources → Hermes → Pi → local model → Pi → Mimir → user. Pi is the harness that runs the agent and invokes Hermes’s tools. The model is a separate node.

Hermes searches email in SQLite with text and vector indexes. Proton Mail Bridge provides mail to synchronization, which extracts text and builds local embeddings. Calendar synchronization updates separate ICS mirrors. Calendar entries do not enter the email vector index. The two request classes alternate while both ingestion paths keep looping independently.

The home lab boundary encloses the relevant local systems and stores. This is specific to Mimir. On other diagrams, derive boundary placement from the system being explained.

## Source locations

Original site repository: `/Users/oriente/projects/leandrooriente`.

- `scripts/mimir-pipeline.mjs`
- `assets/scripts/mimir-pipeline.js`
- Pipeline rules in `styles.css`
- `assets/illustrations/MIMIR-PIPELINE.md`
- `assets/illustrations/MIMIR-USER.md`
- Nunjucks registration and controller asset publication in `eleventy.config.js`
- `{% mimirPipeline "unique-figure-id" %}` in a Nunjucks-enabled post

Live article: [Why I built Mimir for my Proton email and calendar](https://leandrooriente.com/writing/an-answer-should-be-easy-to-check#mimir-architecture).

Use the bundled files when that checkout is unavailable. Inspect the current repository when editing the existing Mimir diagram, because it may have evolved after this snapshot. Keep future changes narrowly scoped to the requested diagram.
