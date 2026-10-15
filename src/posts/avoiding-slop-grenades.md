---
layout: "layouts/article.njk"
templateEngineOverride: njk,md
permalink: "/writing/avoiding-slop-grenades.html"
title: "Avoiding slop grenades in AI pull requests"
deck: "Keeping agent-generated changes reviewable in an established codebase."
description: "How to prepare AI-generated pull requests in established codebases, using focused changes, reliable checks, and shared context to respect reviewers’ time."
summary: "Keeping AI-generated pull requests focused, understandable, and verified before they reach your colleagues."
publicationYear: 2026
order: -1
illustration: "/assets/illustrations/slop-grenades-editorial-v2.png"
illustrationAlt: "A grenade explodes into a barrage of pages bearing AI filler phrases while a person shields their head in a trench."
---

You give an agent a feature specification. It implements the feature, fixes a bug it finds along the way, refactors some nearby code, and adds optimizations for scenarios you never asked it to support. You send the result for review: 75 files changed, 3,000 lines of code changed.

<figure class="fictional-pr-illustration" id="fictional-pr">{% responsiveImage "/assets/illustrations/slop-grenade-fictional-pr-v2.png", "Fictional PR titled ‘Do a bunch of stuff’. Its exaggerated AI-written description lists file changes, failed attempts, an unrelated bug fix, refactors, speculative scaling, and tests not run. Adds 2,300 lines, removes 700, and changes 75 files.", "article", { loading: "lazy", sizes: "(max-width: 607px) calc(100vw - 48px), 560px" } %}</figure>

Suppose you spent five minutes asking for that work. Your colleague now spends three hours figuring out what happened, which changes belong, and whether the feature works. Those hours are part of delivering the feature. You’ve handed them to someone else.

At work, we’ve started calling this kind of handoff a “[slop grenade](https://fortune.com/2026/09/17/shopify-tobias-lutke-ai-slop-grenades/)”: AI-generated content passed to another person without the author taking the time to read, refine, or verify it.

If you work on an established codebase where a team maintains a system with existing users, conventions, and years of decisions behind it, you might already have been a victim of a slop grenade.

The reality is that code is becoming cheap. The bottleneck has shifted from writing it to getting people aligned, whether that’s reviewing a PR, discussing a technical design, or coordinating a project across teams.

That makes optimizing for alignment an essential part of the work. Your job is to prepare each PR, document, or meeting with care, focus, and empathy for the people on the other end.

Let’s focus on how to use agents to prepare pull requests that are easier for your teammates to understand and review. These practices have helped me get agentic PRs merged and features shipped to production.

## If it doesn’t spark joy, toss it away

Code is cheap, but weak specs are not. Get your agent on the right track from the start. The more care you put into the specification, the better its chances of building what you actually need.

As agents become more capable and autonomous, they can carry a mistaken assumption through more of the work before you review it. An ambiguous or incomplete prompt can leave an entire feature built around an abstraction that doesn’t fit the problem.

Be explicit about what you’re building, who it’s for, and what belongs in the work. Define what is out of scope too. Leave that scope too broad, and a simple bug fix can become a major refactor PR you never wanted.

For example, a spec for a new internal upload API could look like this:

{% include "partials/upload-api-ticket.njk" %}

Once the agent has a first draft ready, it’s time to review and refine the changes.

As the author, you have the requirements, constraints, and reasons for the change fresh in your mind. It’s cheaper for you to catch inconsistencies now than for a reviewer who first has to build that context and understand why the PR exists.

Be your agent’s toughest reviewer. Challenge design decisions, new abstractions, and unrelated interface changes. If something feels out of place, decide whether it belongs in another PR or should be removed. Assume each change is unnecessary until you can justify keeping it.

Agents often optimize for scenarios that aren’t realistic for the software you’re building. You might be tempted to keep those additions as safeguards for the future, but every addition is more code to maintain, test, and change as your feature evolves. Complexity always comes at a cost.

Before asking for review, verify that the result meets the acceptance criteria. Read the tests as critically as the implementation. A passing test that checks the wrong behavior can be worse than no test at all. It can make an incorrect implementation look verified. Run the relevant checks, investigate failures, and be explicit about anything still failing or unverified.

## Turn the remaining work into smaller reviews

After removing unnecessary code, the diff can still contain several useful changes. The bug fix and refactor from the opening example may be worth keeping, but each asks the reviewer to understand something different.

If the feature depends on the bug fix, put the fix in a base PR and stack the feature on top. A prerequisite refactor can go in another PR. Work that can stand on its own can be reviewed in parallel. This lets the reviewer assess the fix or refactor on its own terms before looking at the product change that uses it.

{% prBreakdown "focused-prs" %}

The feature itself may still be too large for one review. Split it into modules across dependent or parallel PRs, then connect them in a later change. Each intermediate state needs to work and be testable. Keep unfinished behavior behind a feature flag where appropriate, preserve compatibility with existing callers, and maintain a shared explanation of how the pieces fit together.

{% uploadApiRollout "upload-api-rollout" %}

Your agent is more than capable of solving all these issues in a single PR, but remember what you’re optimizing for: alignment. Reviewers are more likely to understand and approve changes with a narrow scope.

The same principle helps with broad interface migrations. Changing the interface of a heavily used method might touch thousands of lines of code.

Introduce the new interface alongside the old one, keeping the old interface in place until every caller has migrated. Then add a codemod, a script that updates callers to use the new interface. Add tests covering both the interface and the transformation across real usage patterns.

{% codemodBreakdown "codemod-migration" %}

Once the transformation has been reviewed, apply it in manageable batches. Each batch applies the same reviewed transformation, with edge cases already tested in the codemod PR. CI should give reviewers enough confidence to approve. After all callers have migrated, remove the deprecated interface and the codemod.

## Build trust with your reviewers

You’ve prepared the code and spent time breaking it into focused, reviewable pieces. Now make sure you communicate that work well.

PR descriptions are a powerful tool, but agents without proper guidance often fill them with references to what changed and where. That information is already in the diff, so repeating it adds noise. Focus the description on raising reviewers’ confidence without overburdening them.

Test coverage shouldn’t be your only resource. A demo can save a reviewer from setting up an entire environment to try your feature. Stress test results prove it performs under load. A diagram can show how the feature interacts with the existing system. A supporting document captures prior alignment with leadership.

The effort you put into providing the right context shortens the feedback loop with your reviewers. Do this consistently and you build their trust in your work. They’re more likely to pick up your PRs, contribute to the discussion, and help move the change forward.

## Does this apply to you?

This article might not be for you. Maybe you’re working on a greenfield project where detailed specs guide a swarm of agents delivering hundreds of PRs a day, with little human review. Or you’re vibe coding an app with a few friends, and getting to market quickly is the priority. In those settings, you can ignore much of this advice.

But many of us still work in large codebases with established boundaries, where alignment is essential to getting changes shipped. That’s the context behind these practices, and where I hope you’ll find them useful.

With how quickly AI is changing, I might be doing parts of this differently in a few months. Right now, these practices are helping me get large refactors and complex features moving in a large organization, with agents involved throughout the workflow.
