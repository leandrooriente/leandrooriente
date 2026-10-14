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

Now that writing code is no longer the bottleneck, we need to spend more time getting the agent on the right track before it starts. The more care we put into the specification, the better its chances of building what we actually need.

As agents become more capable and autonomous, they can carry a mistaken assumption through more of the work before we review it. An ambiguous or incomplete prompt can leave an entire feature built around an abstraction that doesn’t fit the problem.

Be explicit about what you’re building, who it’s for, and what belongs in the work. Define what is out of scope too. Leave that scope too broad, and a simple bug fix can become a major refactor PR you never wanted.

For example, a spec for a new internal upload API could look like this:

{% include "partials/upload-api-ticket.njk" %}

Once the agent has a first draft ready, it’s time to review and refine the changes.

As the author, you have the requirements, constraints, and reasons for the change fresh in your mind. This initial review is where you should catch anything that doesn’t belong, while that context is still fresh.

Be your agent’s toughest reviewer. Challenge every design decision, new abstraction, and interface change. If something feels odd, it’s on you to understand why it exists and whether it makes sense to keep it.

Agents often optimize for scenarios that aren’t realistic for the software you’re building. You might be tempted to keep those additions as safeguards for the future, but every addition is more code to maintain, test, and change as your feature evolves. Complexity always comes at a cost.

## Turn the remaining work into smaller reviews

After removing unnecessary code, the diff can still contain several useful changes. The bug fix and refactor from the opening example may be worth keeping, but each asks the reviewer to understand something different.

If the feature depends on the bug fix, I put the fix in a base PR and stack the feature on top. A prerequisite refactor can go in another PR. Work that can stand on its own can be reviewed in parallel. This lets the reviewer assess the fix or refactor on its own terms before looking at the product change that uses it.

{% prBreakdown "focused-prs" %}

The feature itself may still be too large for one review. I can split it into modules across dependent or parallel PRs, then connect them in a later change. Each intermediate state needs to work and be testable. Keep unfinished behavior behind a feature flag where appropriate, preserve compatibility with existing callers, and maintain a shared explanation of how the pieces fit together.

Your agent is more than capable of solving all these issues in a single PR, but remember that we’re optimizing for our current bottleneck: alignment. Reviewers are more likely to understand and approve changes with a narrow scope.

The same principle helps with broad interface migrations. Changing the interface of a heavily used method might touch 700 files and 30,000 lines. I can introduce the new interface alongside the old one, which stays in place until every caller has migrated. Then I add a codemod, a script that updates callers to use the new interface. Tests cover both the interface and the transformation across real usage patterns.

{% codemodBreakdown "codemod-migration" %}

Once the transformation has been reviewed, I apply it in manageable batches. Each batch applies the same reviewed transformation, so reviewers can focus on its application and any exceptions. After all callers have migrated, I remove the deprecated interface and the codemod.

## Give reviewers confidence in the change

Agents often fill PR descriptions with generic praise or a detailed narration of the diff. Read the description before requesting review and strip that out. Use the space for context the reviewer would otherwise have to investigate.

Say what you exercised, how you checked it, and what you observed. Show which behaviors your unit, integration, E2E, or contract tests cover and link the relevant results. Add a demo and, where useful, a diagram or supporting document. Make anything still unverified clear.

For the upload API, “tests passed” tells the reviewer very little. Point to the checks for PDF restrictions, size limits, authentication, and the legacy transport. A load or stress test report should include the workload and measurements against the internal SLO.

Doing this consistently builds a trust battery with your reviewers. With one focused problem and evidence they can inspect, they can spend more attention on whether we’re solving the right problem and using the right abstractions. We can move forward when we agree, or reassess the solution together.

A good chunk of the alignment work is already done.
