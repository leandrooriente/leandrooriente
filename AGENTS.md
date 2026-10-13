# Site graphics

Use `.agents/skills/site-art/SKILL.md` for the art direction of graphical assets in this site. It defines the style directly; existing artwork is not required as a reference.

Copy-only edits do not require it.

# Publishing

Load `.agents/skills/deploy-site/SKILL.md` when publishing, previewing a branch, or changing deployment automation.

Use GitHub Actions for hosted deployments: open or update a pull request for its preview, and merge into protected `main` when production is authorized. Follow the resulting workflow and verify the live deployment. Local builds and development servers are for verification; direct Wrangler publishing is only for an explicitly requested manual operation.

Preview-only test PRs stay open unless the user asks to merge or close them. Closing or merging a PR triggers automatic preview cleanup. Reuse the workflow's stable preview URL and PR comment.
