---
name: deploy-site
description: Deploy this repository to production at site.leandrooriente.com or to an isolated Cloudflare Workers preview for each feature; verify deployments and clean up feature previews.
---

# Deploy the site

Use Cloudflare Workers Static Assets for this repository. Production is
`site.leandrooriente.com`; feature testing uses native Worker Previews, each with
its own `workers.dev` URL. Use a feature preview when no target is specified.
Deploy production when the user requests production or `site.leandrooriente.com`.

## Repository setup

Run commands from the repository root. Read `wrangler.jsonc`,
`eleventy.config.js`, `scripts/build.mjs`, and the working-tree status before deploying.

- Worker: `leandrooriente-site`.
- Account: `fb873ce280424623e0e7c2733ec85d0c`.
- CLI: `npx --yes wrangler@4.149.0` (Node.js 22 or later required).
- Top-level configuration controls production; `previews: {}` enables the
  feature workflow. Static assets and the custom build stay at the top level.
- `workers_dev: false` keeps the production Worker on its custom domain.
  `preview_urls: true` allows feature URLs on `workers.dev`.
- Eleventy builds the site locally. Install its pinned dependencies with `npm ci`
  before building when they are not already installed.
- This is an assets-only site: no Worker entrypoint, database, or deployment
  secrets are needed. Cloudflare receives the generated output only.

Deployments upload saved working files, including uncommitted changes. Preserve
unrelated changes and check that the intended checkout is being published. The
deployment request does not itself require a commit, merge, or push.

## Authenticate and prepare

Check existing authentication first:

```sh
npx --yes wrangler@4.149.0 whoami
```

If authentication is absent or the required permissions fail, use:

```sh
npx --yes wrangler@4.149.0 login --scopes account:read user:read workers_scripts:write workers_routes:write zone:read
```

Confirm access to the configured account. Wrangler may warn about scopes for
unrelated products; do not expand permissions merely to silence that warning.
If login requires browser interaction, report the concrete step to the user.

```sh
npm ci
npm run build
npx --yes wrangler@4.149.0 deploy --dry-run
```

The build clears and regenerates `dist/` from the Markdown posts and shared
Eleventy templates in `src/`. The public CSS, images, fonts, and licenses listed
in `eleventy.config.js` are copied into that output. Source notes, generation
prompts, unused assets, and the skill itself stay out of it. Do not upload the
repository root or reuse stale output. Resolve build or dry-run failures before
uploading.

## Deploy a feature preview

Use the current feature branch as the preview name; reuse that name on later
deployments. An explicit feature name also works for detached checkouts. Confirm
the feature identity before choosing a name on `main` or another shared branch.
`--name` names the environment; it does not switch branches or select source
files. If a request names another branch, use that checkout while preserving
uncommitted work before uploading.

```sh
git branch --show-current
npx --yes wrangler@4.149.0 deployments status --json
npx --yes wrangler@4.149.0 preview --name <feature-name> --ignore-base-config
npx --yes wrangler@4.149.0 deployments status --json
```

Replace `<feature-name>` with the actual branch or agreed feature identifier,
quoted when needed. For example, the `layout-v2-explore` branch uses
`--name layout-v2-explore`; a branch named `codex/portrait-polish` uses
`--name 'codex/portrait-polish'`. `--ignore-base-config` prevents inheritance from
dashboard base settings when creating a preview. Existing previews retain their
own settings unless updated. Add `--json` when machine-readable deployment output
is useful. Compare the production status snapshots; investigate a changed version
before claiming that production stayed unchanged.

`preview` creates or updates only that feature environment. Capture the returned
Preview URL, which follows later updates to that feature, and the unique
Deployment URL, which identifies this upload. Use returned URLs rather than
guessing the account subdomain. There is no `preview --dry-run`; the preparation
and `deploy --dry-run` above validate the shared build without publishing.

If Wrangler reports that the preview has no active URLs, `preview_urls` must be
enabled remotely as well as locally. Enable just that setting using a temporary
config containing this Worker name and account, `workers_dev: false`,
`preview_urls: true`, and `routes: []`, with no build, assets, or triggers.
Run `npx --yes wrangler@4.149.0 triggers deploy --config <settings-file> --dry-run`,
then the same command without `--dry-run`. Compare `deployments status --json`
before and after to confirm the active production version stayed unchanged.
Do not publish feature code to production to enable previews.

Use `preview`, rather than `deploy --temporary`: the latter is the unauthenticated
temporary-account claim flow. Do not create a shared staging hostname or retarget
the production route for feature work. A failed preview must not fall back to a
production deploy; correct the reported problem or report the blocker.

## Deploy production

After preparation succeeds, publish the intended production checkout:

```sh
npx --yes wrangler@4.149.0 deployments status --json
npx --yes wrangler@4.149.0 deploy
```

Record the previously active version before uploading so a requested recovery can
target it. Confirm the deployment output names `leandrooriente-site` and
`site.leandrooriente.com`. Production publishes the local files; it does not
promote a preview automatically.

## Verify and report

On the returned feature URL or production URL, check:

- `/` and `/writing/` return the intended HTML.
- `/writing/an-answer-should-be-easy-to-check` and
  `/writing/seeing-the-work-while-it-happens` load, allowing normal HTML redirects.
- `/styles.css`, the family illustration, and referenced fonts return their
  expected content types and match the prepared public files.
- A nonexistent path returns 404, consistent with `not_found_handling: "none"`.

Check a browser rendering when page content or styling changed. Report the
deployment target, usable URL, version or deployment identifier, and checks
performed. If upload succeeds but verification fails, report that state precisely.

## Cleanup and recovery

When the user requests removal of a completed feature environment:

```sh
npx --yes wrangler@4.149.0 preview delete --name <feature-name> --skip-confirmation
```

This removes that preview and its deployment history. Do not use `wrangler delete`
for preview cleanup: it targets the production Worker.

For a requested production rollback, select the recorded healthy version, run
`npx --yes wrangler@4.149.0 rollback <version-id>`, and repeat verification.

Primary references: [Worker Previews](https://developers.cloudflare.com/workers/previews/),
[preview configuration](https://developers.cloudflare.com/workers/previews/configuration/),
and [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/).
