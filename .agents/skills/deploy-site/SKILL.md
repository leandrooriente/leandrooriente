---
name: deploy-site
description: Publish this repository through GitHub Actions using pull request previews and authorized merges into main; verify deployments and automatic preview cleanup.
---

# Deploy the site through GitHub Actions

Use the repository's GitHub Actions workflows for hosted deployments. Feature
branches publish through an open pull request; production publishes after an
authorized merge into protected `main`. Local builds and development servers are
for verification only. Ordinary deployment does not require local Cloudflare
login or a local Wrangler upload.

## Select the target

- If no target is specified, use a pull request preview.
- A preview or test request leaves the PR open. Do not merge or close it unless
  the user requests that action; preserve a request to let the user close it.
- A request to publish to production or `leandrooriente.com` uses an authorized
  merge into `main`, followed by the production deployment.
- Reuse an open PR for the intended changes. Start unrelated work from current
  `origin/main` so an unmerged test branch does not enter another release.

Check the working tree, branch, intended diff, and PR state before committing or
pushing. Preserve unrelated work. Hosted deployments build pushed commits;
uncommitted local changes are not part of an Actions deployment.

## Pull request preview

1. Commit and push the intended changes on a feature branch, and open a PR into
   `main` if one does not already exist. Draft PRs are supported. Fork and
   Dependabot PRs are excluded from credentialed previews.
2. Follow **Pull request preview** in GitHub Actions for the current PR head SHA.
   Opening, reopening, and each subsequent push trigger the workflow. A push
   without an open PR does not create a hosted preview.
3. After a successful run, read the Actions-authored **Cloudflare preview**
   comment. Use its returned URL and confirm its commit matches the intended
   head. Do not guess the account subdomain or create a second environment.
4. Verify the live changes and report the PR and preview links. Keep preview-only
   PRs open for testing. Later pushes update the same URL and comment.

The native environment is `pr-<pull-request-number>` under the
`leandrooriente-site` Worker. Its stable URL is
`https://pr-<pull-request-number>.preview.leandrooriente.com` and follows
successful updates. The Actions helper ensures the shared preview-only Custom
Domain before building; Cloudflare manages its wildcard DNS and SSL, so individual
PR or deployment hostnames need no DNS registration. A failed build leaves the
previous deployed preview available; the comment records the last verified
deployment. Before the first successful run, there is no preview-link comment.

When the user closes a PR, or an authorized merge closes it, follow that PR's
cleanup run. The workflow deletes its native preview and updates the existing
comment to say it was removed. Reopening recreates the preview. Use this lifecycle
for ordinary cleanup instead of manually deleting Cloudflare resources.

## Production

Review the PR's current head and validation results, and resolve required review
conversations. Merge through GitHub using the existing production authorization.
Do not push directly to `main` or bypass its protection. Leave preview-only tests
unmerged unless the user later authorizes their merge or production publication.

Follow **Deploy production** for the resulting `main` commit. A successful merge
alone does not establish that deployment succeeded. The job builds the committed
site and verifies published pages, draft 404 responses, and HTTP/HTTPS `www`
redirects. Report the workflow run and the live production URL after verification.

For a retry of an authorized production deployment, rerun the failed Actions job
or dispatch `deploy.yml` on `main` using GitHub. Dispatches on other branches skip
production. Avoid starting a competing local deployment.

For a requested recovery, normally open a PR reverting the unwanted source change
and use the same authorized merge and verification process. A direct Cloudflare
rollback or upload is an exception for an explicit request for that operation.

## Verification

On the returned preview URL or production origin:

- Confirm the intended content at `/`, `/writing/`, and the affected article
  paths. Draft source remains unpublished until its front matter permits it.
- Check canonical URLs, `og:url`, and sharing images use that deployment's origin.
- For previews, confirm the stable custom hostname and `X-Robots-Tag: noindex`
  response header. Production must remain indexable.
- Check the referenced stylesheet, generated images, and fonts load. Fingerprinted
  assets use immutable caching; HTML retains revalidation.
- Check a nonexistent path returns 404.
- Check a browser rendering when visible content or styling changed.
- For production, verify direct 301 redirects from HTTP and HTTPS `www` to the
  HTTPS apex, preserving an article path and its query string.

When changing workflow or helper behavior, also verify PR creation and a later
push using one stable URL and one bot comment. Verify cleanup when an authorized
close or merge is available; otherwise report that check as pending and keep the
test PR open. Preview operations must preserve production and the separately
managed `www` redirect. Compare Worker
versions and domain/route settings when access is available; distinguish verified
facts from checks that were unavailable.

## Workflow maintenance and failures

Read `.github/workflows/preview.yml`, `.github/scripts/pr-preview.mjs`, and
`.github/workflows/deploy.yml` before changing automation. Read `wrangler.jsonc`
and the relevant build scripts when changing build or hosting behavior.

Both workflows use Node.js 22 and pinned Wrangler 4.149.0 on the runner. Previews
build the exact PR head without deployment credentials, then upload only generated
static files from the same run with a fixed preview configuration. Production
builds the merged `main` commit. Preserve per-PR serialization, current-head/state
checks, and the bot comment update behavior.

Both build workflows persist generated image encodings in `tmp/image-cache`,
separate from the clean `dist` output. Cache keys isolate the runner OS and
architecture, Node major, dependency lockfile, and image-processing configuration.
Restore prefixes must retain that complete namespace so encoder or transform
changes cannot reuse stale encodings. The final asset and template fingerprint
lets new image selections save their derivatives while reusing unchanged images.
Update the Node component of both cache keys when changing the build runtime.

Preview preparation registers or verifies `preview.leandrooriente.com` through
the Custom Domains API without uploading a production Worker version. Keep that
domain preview-only (`previews_enabled: true`, `enabled: false`) in
`wrangler.jsonc`. Builds, canonical URLs, verification, and the bot comment use
only the stable custom preview URL. The generated preview `_headers` supplies
`X-Robots-Tag: noindex`; do not add that header to production output.

Use the existing repository `CLOUDFLARE_API_TOKEN` secret. The GitHub `production`
environment allows only `main`; do not use it for feature previews. The token needs
Workers Scripts Edit and Account Settings Read for the configured account, plus
Workers Routes Edit and Zone Read for `leandrooriente.com`. Local Wrangler OAuth
is separate and is not used by either workflow.

If a run fails, inspect its job logs, fix the relevant code or workflow through the
PR, and push or retry through GitHub Actions. Report the actual blocking error if
it requires user input. Do not fall back to a local upload, another preview, or a
production deployment to work around a failed preview.

## Hosting boundaries

- Main assets Worker: `leandrooriente-site`.
- Cloudflare account: `fb873ce280424623e0e7c2733ec85d0c`.
- Production: `https://leandrooriente.com`; `SITE_URL` supplies the preview origin
  in preview builds. `workers_dev: false` keeps the Worker off its ordinary
  `workers.dev` hostname. Keep `preview_urls: true` for deployment debugging.
- Preview-only Custom Domain: `preview.leandrooriente.com`, managed by the
  Actions preview helper and shared by native PR environments. Cleanup deletes
  each closed PR's environment, preserving this shared domain.
- Redirect Worker: `leandrooriente-site-redirect`, configured by
  `wrangler.redirect.jsonc` and `scripts/redirect-domain.mjs`. It owns only
  `www.leandrooriente.com/*` and returns direct 301 redirects to the HTTPS apex.

The production workflow currently deploys the main assets Worker and its declared
Custom Domains. The preview helper also ensures the shared preview-only domain.
Redirect Worker and other DNS or route changes are separate infrastructure work;
do not assume a normal site merge publishes them. Extend the appropriate Actions
workflow through a PR when such work is requested, or follow an explicit request
for a manual operation. Do not change these settings during an ordinary site
deployment.

For an explicitly requested manual Cloudflare operation, load the Wrangler skill
and current provider documentation for the required commands. Manual publishing,
provider administration, and rollback are exceptions, not alternative defaults.
