---
name: deploy-site
description: Deploy this repository to production at leandrooriente.com or to an isolated Cloudflare Workers preview for each feature; verify deployments and clean up feature previews.
---

# Deploy the site

Use Cloudflare Workers Static Assets for this repository. Production is
`leandrooriente.com`; feature testing uses native Worker Previews, each with
its own `workers.dev` URL. Use a feature preview when no target is specified.
Deploy production when the user requests production or `leandrooriente.com`.

Normal production changes are published by merging a pull request into protected
`main` and following the resulting GitHub Actions deployment. Branches with open
pull requests receive automatic feature previews. The local commands below remain
available for features without a pull request and explicitly requested local
production deployments.

## Repository setup

Run commands from the repository root. Read `wrangler.jsonc`,
`wrangler.redirect.jsonc`, `scripts/redirect-domain.mjs`,
`eleventy.config.js`, `scripts/build.mjs`, `scripts/assets.mjs`, `scripts/images.mjs`, `scripts/styles.mjs`,
and the working-tree status before deploying.

Read `.github/workflows/deploy.yml` when working on automatic production
deployments.
Read `.github/workflows/preview.yml` and `.github/scripts/pr-preview.mjs` when
working on automatic pull request previews.

- Worker: `leandrooriente-site`.
- Redirect Worker: `leandrooriente-site-redirect`, configured separately in
  `wrangler.redirect.jsonc` with `scripts/redirect-domain.mjs` as its entrypoint.
- Account: `fb873ce280424623e0e7c2733ec85d0c`.
- CLI: `npx --yes wrangler@4.149.0` (Node.js 22 or later required).
- Top-level configuration controls production; `previews: {}` enables the
  feature workflow. Static assets and the custom build stay at the top level.
- `workers_dev: false` keeps the production Worker on its custom domain.
  `preview_urls: true` allows feature URLs on `workers.dev`.
- Eleventy builds the site locally. Install its pinned dependencies with `npm ci`
  before building when they are not already installed.
- The main site is assets-only: no Worker entrypoint, database, or deployment
  secrets are needed. Cloudflare receives the generated output only.
- The main Worker retains the Custom Domain for `leandrooriente.com`.
  The redirect Worker owns `www.leandrooriente.com/*`; `www` has a proxied
  CNAME to the apex.
- `www.leandrooriente.com` redirects to the HTTPS apex with status 301,
  preserving paths and query strings. The redirect configuration has no assets
  or build.
- `src/_data/site.js` sets the canonical production origin to
  `https://leandrooriente.com`. Ensure `SITE_URL` does not override this origin
  for a production build; feature previews set it to their returned origin.

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
Eleventy templates in `src/`. The public fonts, logos, SVGs, and generated CSS
are fingerprinted under `dist/assets/static/`; font licenses retain their public paths.
The stylesheet is generated locally by `scripts/styles.mjs` with optimized textures
and masks, then hashed after updating all dependency URLs. Illustrations, textures,
and masks are generated locally by `scripts/images.mjs` as AVIF/WebP files in
`dist/assets/images/`, with filenames hashing the final encoded bytes; only current
derivatives are published from the local image cache. `src/_headers` is copied
to `dist/_headers` for immutable browser caching of these fingerprinted directories.
Source notes, generation
prompts, unused assets, and the skill itself stay out of it. Do not upload the
repository root or reuse stale output. Resolve build or dry-run failures before
uploading.

## Deploy a feature preview

### Automatic pull request previews

For a branch with an open pull request in this repository, use the existing
GitHub Actions preview instead of creating a second environment. The preview
workflow runs when the pull request is opened, reopened, or updated by a push,
including draft pull requests. Fork and Dependabot pull requests are excluded.
It uses the native preview name `pr-<pull-request-number>` under
`leandrooriente-site`.

The prepare job obtains the preview's returned `workers.dev` origin before
building. The build checks out the exact pull request head commit and runs
without Cloudflare credentials or a writable GitHub token. Its generated files
are uploaded as an artifact. The publishing job uses a fixed assets-only preview
configuration with no custom build, Worker entrypoint, bindings, or production
routes. It never runs the branch's build scripts with deployment credentials.
Canonical metadata and sharing images use the preview origin through `SITE_URL`.

After verifying a successful deployment, the workflow creates or updates one
Actions-authored **Cloudflare preview** comment with the stable URL, deployed
commit, and workflow link. Use that URL to test. Runs are serialized per pull
request; stale commits are skipped. Closing or merging the pull request removes
its preview and marks the existing comment as closed. Reopening recreates it.
Use the existing repository `CLOUDFLARE_API_TOKEN` secret, not the `production`
environment, whose branch policy permits only `main`.

When changing this automation, verify preview creation and the comment, a later
push updating the same URL and comment, and cleanup on close. Compare production
Worker versions and domain/route settings around preview operations. A successful
preview must leave production and the separate `www` redirect unchanged.

### Local feature previews

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

### GitHub Actions

`.github/workflows/deploy.yml` runs on pushes to `main`, including pull request
merges, and supports manual dispatch only for `main`. The deployment job uses the
GitHub `production` environment at `https://leandrooriente.com`; its deployment
branch policy must allow only `main`. Keep `CLOUDFLARE_API_TOKEN` in the repository
secrets or that environment's secrets; the current setup uses a repository secret.
The account ID comes from `wrangler.jsonc`, so no account-ID
secret is needed. Token setup requires a scoped Cloudflare API token; local
Wrangler OAuth credentials are not used by GitHub Actions.

Scope the token to the configured account with Workers Scripts Edit and Account
Settings Read, and to the `leandrooriente.com` zone with Workers Routes Edit and
Zone Read. These cover Worker deployment, Custom Domains, and zone lookup;
unrelated Cloudflare product permissions are not required.

The workflow uses commit-pinned checkout and Node setup actions with read-only
repository permissions, Node.js 22, `npm ci`, and pinned Wrangler 4.149.0. Wrangler
invokes the configured clean build before deploying the main assets Worker.
Runs share a production concurrency group with `cancel-in-progress: false`.
The verification step checks published and draft page responses and direct
HTTP/HTTPS `www` redirects, including an article query string. The redirect Worker
remains separately managed.

After a merge, inspect the **Deploy production** run and its verification result.
To rerun manually, use `gh workflow run deploy.yml --ref main`, then follow the
resulting run. A dispatch from another branch skips the deployment job. Report
the workflow run URL and deployment result; a successful merge alone does not
confirm a successful production deployment.

### Local production deployment

When explicitly requested, wait for any active automatic deployment to finish.
After preparation succeeds, publish the intended production checkout:

```sh
npx --yes wrangler@4.149.0 deployments status --json
npx --yes wrangler@4.149.0 deploy
```

Record the previously active version before uploading so a requested recovery can
target it. Confirm the deployment output names `leandrooriente-site` and
`leandrooriente.com`. Production publishes the local files; it does not
promote a preview automatically.

When creating or changing the redirect Worker, deploy it separately:

```sh
npx --yes wrangler@4.149.0 deploy --config wrangler.redirect.jsonc --dry-run
npx --yes wrangler@4.149.0 deploy --config wrangler.redirect.jsonc
```

Confirm it is named `leandrooriente-site-redirect` and owns only
`www.leandrooriente.com/*`. Its deployment does not rebuild or replace the main
site's assets.

The October 12, 2026 domain migration retained the four former GitHub Pages
apex A records at `previous-site-origin.leandrooriente.com` as a recoverable DNS
backup. The new apex record is managed by the main Worker's Custom Domain.
Do not retarget these backup records during an ordinary site deployment.
DNS changes require a dashboard session or credentials with DNS permissions;
the Wrangler OAuth scopes above cover the Workers and their routes.

## Verify and report

On the returned feature URL or production URL, check:

- `/` and `/writing/` return the intended HTML.
- `/writing/an-answer-should-be-easy-to-check` loads, allowing normal HTML
  redirects. `seeing-the-work-while-it-happens.md` currently has `draft: true`;
  its extensionless and `.html` URLs must return 404 until it is published.
- Canonical URLs, `og:url`, and absolute sharing-image URLs use the requested
  origin: the apex for production or the returned origin for a feature preview.
- The fingerprinted stylesheet URL in the HTML, generated image URLs in `src` and
  `srcset`, and referenced fonts return their
  expected content types and match the prepared public files.
- Fingerprinted CSS, fonts, and images send `Cache-Control: public, max-age=31536000, immutable`;
  HTML retains revalidation rather than a long browser-cache lifetime.
- A nonexistent path returns 404, consistent with `not_found_handling: "none"`.
- For production, HTTP and HTTPS requests to `www.leandrooriente.com` return
  301 directly to the HTTPS apex. Verify a root path and an article path with a
  query string, preserving both exactly.

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
