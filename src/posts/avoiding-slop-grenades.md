---
layout: "layouts/article.njk"
templateEngineOverride: njk,md
permalink: "/writing/avoiding-slop-grenades.html"
title: "Avoiding slop grenades in AI pull requests"
deck: "Keeping agent-generated changes reviewable in an established codebase."
description: "How I prepare AI-generated pull requests in established codebases, using focused changes, reliable checks, and shared context to respect reviewers’ time."
summary: "Keeping AI-generated pull requests focused, understandable, and verified before they reach your colleagues."
publicationYear: 2026
order: -1
illustration: "/assets/illustrations/slop-grenades-editorial-v2.png"
illustrationAlt: "A grenade explodes into a barrage of pages bearing AI filler phrases while a person shields their head in a trench."
---

You give an agent a feature specification. It implements the feature, fixes a bug it finds along the way, refactors some nearby code, and adds optimizations for scenarios you never asked it to support. You send the result for review: 75 files changed, 3,000 lines of code changed.

<figure class="fictional-pr-illustration" id="fictional-pr">{% responsiveImage "/assets/illustrations/slop-grenade-fictional-pr.png", "Fictional pull request titled ‘Do a bunch of stuff’ with a vague description about a game-changing, seamless, future-proof solution. It adds 2,300 lines, removes 700 lines, and changes 75 files.", "article", { loading: "lazy", sizes: "(max-width: 607px) calc(100vw - 48px), 560px" } %}</figure>

Suppose you spent five minutes asking for that work. Your colleague now spends three hours figuring out what happened, which changes belong, and whether the feature works. Those hours are part of delivering the feature. You’ve handed them to someone else.

At work, we’ve started calling this kind of handoff a “[slop grenade](https://fortune.com/2026/09/17/shopify-tobias-lutke-ai-slop-grenades/)”: AI-generated content passed to another person without the author taking the time to read, refine, or verify it.

If you work on an established codebase where a team maintains a system with existing users, conventions, and years of decisions behind it, you might already have been a victim of a slop grenade.

The reality is that code is becoming cheap. The bottleneck has shifted from writing lines of code to getting people aligned, whether that’s reviewing a PR, discussing a technical design, or coordinating a project across teams.

That makes optimizing for alignment an essential part of the work. Your job is to prepare each PR, document, or meeting with care, focus, and empathy for the people on the other end.

These are the practices that have helped me get my PRs properly reviewed and merged, and my features shipped to production.

## Decide what belongs in the feature

I start with the behavior we actually need. The specification should make that scope clear, including the constraints and what is outside the work. Once the agent has produced a solution, I read the diff against those requirements.

For example, a spec for adding a status filter to an existing orders list could look like this:

> **Feature:** Add a status filter to the existing orders list.
>
> **Existing behavior:** Orders have `pending`, `completed`, or `cancelled` status. The list uses server-side pagination.
>
> **Required behavior:** Offer those statuses and “All,” which means no status filter and is the default. Changing the selection resets the list to page 1 and preserves the current sort order.
>
> **Constraints:** Use the existing list components and query conventions. Apply filtering before pagination, including the pagination totals. Preserve existing access checks.
>
> **Acceptance checks:** “All” preserves the current results. Each status returns only matching orders, including matches beyond the original first page, with correct totals. Switching filters resets the page without changing the sort. Users still see only orders they are allowed to access.
>
> **Out of scope:** New statuses, schema changes, a page redesign, or a new caching layer. Report unrelated bugs separately.

Reading the diff takes enough understanding to challenge the implementation. If I can’t explain why a piece of code is there, I need to investigate it. AI can help me trace unfamiliar parts of the codebase and walk through a proposed change, but I check those explanations against the code and tests. It’s also a way to build knowledge I’ll need to maintain the result.

With that context, I can question the additions. Does the application need this optimization? Can the edge case happen under our existing rules? An agent may uncover a real scenario I missed, and I want to understand it. An abstraction for a problem we don’t have, however, adds review work now and maintenance work later.

I remove those speculative additions. What remains should be the smallest complete implementation of the feature, with a reason for each change.

## Turn the remaining work into smaller reviews

After removing unnecessary code, the diff can still contain several useful changes. The bug fix and refactor from the opening example may be worth keeping, but each asks the reviewer to understand something different.

If the feature depends on the bug fix, I put the fix in a base PR and stack the feature on top. A prerequisite refactor can go in another PR. Work that can stand on its own can be reviewed in parallel. This lets the reviewer assess the fix or refactor on its own terms before looking at the product change that uses it.

{% prBreakdown "focused-prs" %}

The feature itself may still be too large for one review. I can split it into modules across dependent or parallel PRs, then connect them in a later change. Each intermediate state needs to work and be testable. Keep unfinished behavior behind a feature flag where appropriate, preserve compatibility with existing callers, and maintain a shared explanation of how the pieces fit together.

The same principle helps with broad interface migrations. I can introduce the new interface with compatibility for existing callers and a codemod, a script that updates them. Tests demonstrate the transformation across real usage patterns. Once that rule has been reviewed, I apply it in manageable batches, then remove the old interface and temporary compatibility code. Reviewers can understand the transformation before working through its application across thousands of files.

That might produce five or six PRs for one feature. Smaller reviews give people a manageable piece of work to understand, and let feedback and approvals arrive while the rest is still being built.

## Verify what you are handing over

Splitting the work makes it easier to follow. I still need evidence that it behaves as intended.

I check that the affected functionality has reliable coverage, add checks for the feature’s acceptance criteria, and validate both the intermediate changes and the assembled feature. Automating repeatable API and browser checks avoids making a colleague redo that work manually.

Formatting, linting, and CI can resolve other repeatable questions. Give the agent access to those checks so it can catch mistakes and iterate before review. I also check that the tests reflect the requirements, especially when the same agent wrote both the implementation and the tests.

By the time I request review, I can explain the change and show how I checked it. My colleague can bring another perspective, question the design, and catch things I missed, with a focused change and evidence to work from.

## Improve the starting point for the next agent

After preparing that PR, I want to understand why it needed so much untangling. If the agent chose an outdated pattern or invented an approach that doesn’t fit the codebase, the intended approach may not be clear or discoverable enough.

Architectural decisions, conventions, and workflows belong in repository documentation and reusable skills. During a migration, that guidance needs to distinguish the target pattern from the legacy one and explain intentional exceptions. An agent should be able to find the direction we’re moving in. If that foundation is missing, AI can help build it, with someone checking the result against the system before using it for future features.

Review feedback is another opportunity to improve that guidance. When a colleague explains a convention, update the docs or skills. When a repeatable mistake slips through, improve the checks. Small PRs that capture those lessons give the next agent a better chance to correct its work before another person has to.

Nobody likes to be on the receiving end of a slop grenade. The effort I put into preparing the handoff helps my colleagues spend their attention on moving the feature forward.
