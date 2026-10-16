---
layout: "layouts/article.njk"
templateEngineOverride: njk,md
permalink: "/writing/an-answer-should-be-easy-to-check.html"
title: "Why I built Mimir for my Proton email and calendar"
deck: "Building a local AI assistant to make my Proton email and calendars easier to search."
description: "How Proton’s privacy protections shaped its search, and why I built Mimir and Hermes to search my email and calendars locally."
summary: "Why Proton’s privacy constraints led me to build a local assistant for searching my email and calendars."
publicationYear: 2026
publicationMonth: "2026-10"
order: 1
illustration: "/assets/illustrations/mimir-editorial.png"
illustrationAlt: "A magnifying lens reveals a red thread connecting correspondence and a calendar."
---

Recently, I moved my email and calendars from Gmail and Google Calendar to Proton for more control over my private information. The move also made it harder to search my email effectively.

The reason is part of Proton’s privacy design. Proton Mail encrypts stored emails so that even Proton cannot read their contents. That prevents it from searching those contents on its servers. In the web app, [content search instead downloads and indexes messages locally](https://proton.me/support/search-message-content), with a separate index for each browser on each device.

For years of email history, that meant finding information depended on what the browser I was using had downloaded and indexed.

So Proton wasn’t giving me the search I wanted, and I wasn’t going to move back to a provider that didn’t put privacy first. The only option was to build something myself.

That’s where Mimir and Hermes come in.

## Mimir and Hermes

**Mimir** is the progressive web app where I ask questions and read answers. **Hermes** synchronizes my Proton email and calendars, builds local search indexes, and provides the assistant’s read-only tools.

Mimir sends requests to **Pi**, the harness that runs the local agent. The agent uses the local model to decide how to search, calls Hermes’s tools to inspect the data, and returns an answer with source links through Mimir.

This separation lets me improve the interface and retrieval independently. Synchronization and indexing run outside the conversation, and the agent’s access stays limited to the operations exposed by Hermes.

{% mimirPipeline "mimir-architecture" %}

## Inside Mimir

I can describe what I’m looking for:

> Find the email with the document from the notary’s office in Brazil, from around 2015.

The assistant searches, examines candidates, and returns the relevant sources. Sometimes one email contains everything I need, and other times it brings together several messages. I can refine the request in the same conversation.

Each result gives me a way back to the original email. On my iPhone, the Open in Proton Mail button opens the exact message so I can check it myself.

{% phoneDemo "/assets/videos/mimir-demo.mp4", "/assets/illustrations/mimir-demo-poster.jpg", "Mimir app demo", "Searching for a Wikipedia donation and opening the original email in Proton Mail.", "mimir-demo" %}

Mimir’s server manages assistant sessions and streams responses to the browser. It starts or resumes a Pi session through an RPC interface. Mimir stores conversation history in its own SQLite database, while Hermes keeps the emails and search indexes.

### Pi and the local model

Pi runs the agent loop with Hermes’s instructions and read-only tools. It sends the conversation to the local model, executes the tool calls the model requests, and feeds the results back so the model can inspect sources and produce an answer. Its built-in coding tools are disabled, which keeps the agent’s access limited to Hermes’s operations.

I run **Qwen3.5 9B** locally through llama.cpp, using the Q5_K_M quantized version, on an **[NVIDIA GeForce RTX 5060 Ti with 16 GB of VRAM](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/)**.

## Inside Hermes

Email enters Hermes through Proton Mail Bridge, which provides local IMAP access. Hermes reads messages without changing them, saves the originals as `.eml` files, and extracts text from their bodies and supported attachments into SQLite.

Keeping the original files means the indexes can be rebuilt. Before returning source text, Hermes verifies that the original email still matches its indexed hash, so the assistant’s evidence stays tied to the source.

Calendar data follows a separate path: Hermes mirrors Proton Calendar ICS feeds and queries the local copies, including recurring events. Both integrations expose read-only tools to the assistant.

### Why I added semantic search

The first version used SQLite’s built-in full-text search, FTS5, with filters such as date and sender. That gave me a simple starting point, but search depended too much on the wording I could remember. Broader requests missed relevant messages.

That was when I added a vector index. Hermes splits email and attachment text into overlapping passages, then uses a local multilingual E5 model to turn those passages into numerical representations, or embeddings. Comparing them with an embedded query helps find related content even when the words differ.

Search now combines keyword and semantic results. Keywords remain useful for names and exact terms, while semantic search helps with descriptions and meaning. Each passage retains its source location, so a match leads back to the original email or attachment. Only changed messages need to be reprocessed during synchronization.

I kept the vector index in SQLite using sqlite-vec. For a single-user home lab, that adds semantic search without another database service to maintain.

## Accessing it away from home

With the search running in my home lab, I also needed a way to reach Mimir when I was out.

[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/setup/secure-private-apps/private-web-app/) connects the application to a hostname on my domain without opening inbound ports on my home router. [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/) checks my identity before forwarding requests to Mimir.

The hostname is reachable over the internet, with Access controlling entry. The model, local email copies, and search indexes stay inside my home lab, while browser requests and responses pass through Cloudflare.

## Where are we?

Mimir finds what I’m looking for about 70% of the time. That’s a rough estimate from my own use. Results often take more than 30 seconds to arrive, and sometimes I need a few follow-up requests before it finds the right information.

Processing the data takes a long time, and I suspect the GPU is one of the bottlenecks. I’m planning three improvements to make searches faster and more reliable.

The first is to add a classification model that assesses the results returned by the database and identifies which ones are useful for answering the request. The goal is to make that selection faster and reduce how much the main model needs to work through.

The second is to fine-tune Qwen for email search, helping it make better search decisions and use Hermes’s existing tools more effectively. The third is to optimize the vector index so retrieving relevant passages takes less time.

Mimir already helps me find information in my email and calendars. Now I want to make it dependable enough for everyday use, with faster answers and fewer follow-up requests to reach the source I need.
