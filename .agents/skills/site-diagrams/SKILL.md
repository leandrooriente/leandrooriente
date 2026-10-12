---
name: site-diagrams
description: "Build or refine animated architecture and data-flow diagrams in Leandro Oriente’s tactile editorial site style, with traceable request journeys and a separate static mobile composition. Use for diagrams embedded in websites and articles."
---

# Site Diagrams

Create diagrams that explain a system through recognizable objects and moving data, using the visual language established for the Mimir article. Adapt the architecture to the task, the example’s services and topology are not defaults for other systems.

## Establish the flow

Identify people, interfaces, systems, agents or harnesses, models, stores, and ingestion processes from the available source and the user’s explanation. Record request and return paths separately from background synchronization. Show actual storage boundaries and dependencies, including separate stores when appropriate. Resolve material ambiguity before drawing it as fact.

Compose the wide layout around a readable journey. Place ingestion beside the relevant stores so it can continue independently. Prefer SVG for objects, connectors, tokens, and animation. Reuse the site’s asset pipeline and typography when integrating into an existing page.

## Art direction

- Matte reduction print and cut-paper collage on warm uncoated stock. Use broad silhouettes, slightly irregular contours, two or three flat tones, sparse carved cream lines, fine dry ink, and small flattened shadows.
- Paper `#F3F1E8`, carbon `#22251F`, terracotta `#A3372D`, olive `#596046`, dark olive `#4C533E`. Pale olive `#C8CBB5` and restrained ochre `#916031` support secondary forms and distinct journeys.
- Give object types distinct silhouettes. Databases remain recognizable stores, systems use purposeful physical metaphors, people retain natural adult proportions, and an agent can use a restrained mechanical figure when it suits the subject. A harness and its model must remain distinct when the architecture makes them distinct.
- Keep illustrations editorial and shallow. Avoid glossy 3D, photographic rendering, cute mascot proportions, generic corporate boxes on desktop, neon, and heavy distress. A person can be a simplified waist-up portrait without a duplicate device. Preserve supplied logos exactly when requested.
- Keep labels outside illustrated objects and use only labels that clarify identity or behavior. Skip redundant legends and captions. Texture and motion must support the flow’s readability.

## Connections and motion

Use one path definition for each connector, active trace, and moving token. Give the request and return different ports and lanes. Stop paths short of silhouettes, allowing room for arrowheads and the whole token. Inspect curves at their endpoints for hooks, reversals, and crossings.

Keep one pigment throughout a full request journey, including model calls, tool calls, returned sources, and the final response. Change token shape to convey question, source, or answer without changing its identity color. Background documents use quieter cream and olive marks.

Desktop runs in a calm loop, with ingestion on independent cycles. Use `cubic-bezier(0.42, 0, 0.58, 1)` for travel and gentle arrivals. Timings explain behavior rather than claim actual latency. Read [motion-and-integration.md](references/motion-and-integration.md) when implementing or adapting the animation.

## Mobile and accessibility

Build a separate compact, static SVG, rather than shrinking the desktop scene. Retain the key systems, dependencies, stores, and arrows. Use modest pigment accents, cut contours, and a little dry ink. Remove elaborate illustrations and animations. Adjust the breakpoint to the page’s actual space.

Provide an accessible title and description for each SVG, unique IDs per figure and layout, and a keyboard-accessible desktop pause/play button. Start animations through the controller so no-JavaScript output is static. Honor reduced motion and suspend hidden, offscreen, and mobile desktop loops.

## Reuse and verify

For a working example and the relevant source locations, read [mimir-reference.md](references/mimir-reference.md). Its bundled renderer, controller, styles, portrait, and logo are self-contained. Reuse its mechanics and selected artwork, then adapt names, semantics, paths, and schedules together.

Verify a complete round trip and concurrent ingestion in a browser, including the loop boundary. Check arrow clearance, label collisions, pause/resume, and reduced motion. Verify the separate mobile layout at ordinary phone widths and 320px, with no overflow or animation. When multiple figures are supported, check their IDs and independent controls. Save a screenshot of the resulting page. Creating or updating a diagram does not imply authorization to deploy it.
