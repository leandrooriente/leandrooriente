---
layout: "layouts/article.njk"
permalink: "/writing/seeing-the-work-while-it-happens.html"
title: "Coach: keeping the work in view."
deck: "A workspace should help me follow the work and know where my judgment is needed."
description: "On shaping Coach around a stable view of each task, meaningful progress, and the decisions that deserve attention while coding agents are at work."
summary: "What should stay visible when several coding agents are working?"
publicationYear: 2026
order: 2
illustration: "/assets/illustrations/coach-editorial.png"
illustrationAlt: "A hand places a red marker among connected task sheets."
illustrationWidth: 1536
illustrationHeight: 1024
---

Work can continue while my attention is elsewhere. A coding agent may be reading a repository, changing a file, or checking an assumption. When I return, I need to understand how that activity relates to the task I gave it. A sequence of events can tell me what happened and still leave me piecing together where the work stands.

Coach is a workspace for coding agents. The question I want to explore with it is how to keep the work understandable as it changes. I keep returning to three things I need to see: the task, its progress, and the next decision that needs my attention.

## Give the task a stable place.

A task provides the context for everything that follows. Its purpose, important constraints, and conditions for review need to remain easy to find while the conversation grows. Without them, a new update arrives as another piece of text whose significance I have to reconstruct.

Keeping the task visible also makes it easier to notice a change in direction. An agent may discover that an assumption was wrong or that the requested change reaches further than expected. I want the workspace to make the connection clear: this discovery affects this part of the task, and here is the choice it raises.

## Show progress in terms of the work.

Activity alone gives an incomplete picture of progress. Reading more files may resolve an important question, or reveal a larger problem. A check may pass while the original behavior still needs review. An update should explain what the activity established and what remains open.

For Coach, I want updates to explain how a task has advanced: what changed, what the agent learned, and what it is doing next. A short account is useful when it makes the boundary between completed work and open questions clear. The detail behind that account should remain within reach when I need to inspect it.

## Make attention a deliberate choice.

When several agents are working, their updates compete for the same attention. I want to be able to leave a task running without wondering whether I have missed a decision. That requires a clear distinction between work that can continue and work that needs something from me.

Suppose a requested interface change turns out to affect a shared component. The choice may be to adjust that component for every screen or keep the change local. I want to see why the agent reached that point, what each option would affect, and which decision it needs from me. That context makes the pause useful. Once I choose, the task has a clear basis for continuing.

## Review the result in its context.

At review time, I need to bring the result back to the original request. A change can look reasonable in isolation and still leave a constraint unresolved. The task, the resulting changes, and the checks behind them need to be readable together. That is the path I want Coach to preserve as the work moves from activity into review.

Being able to step away matters here. When I return, the workspace should help me pick up the task where it stands, with enough context to make the next decision. I can then spend my attention on the choice itself, rather than rereading the conversation to discover why it is waiting.

<blockquote class="open-question"><p>What needs to remain in view so I can leave the work running and return ready to make a useful decision?</p></blockquote>
