# Motion and integration

The bundled example uses dependency-free SVG SMIL, a small browser controller, and scoped component styles. These mechanics can be adapted to another web stack without adopting the Mimir architecture.

## One source for routes and sequence

Keep layout coordinates and named paths together. Request and response connections are separate entries. Use those same path strings for baseline arrows, active traces, and `animateMotion`, so changing a route updates all three.

Represent a journey as steps such as `[path, symbol, startSeconds, endSeconds]`. Generate its trace and particle from the same step. The example’s `requestGroup` sets `--journey-ink` for an entire journey. Symbols change as data becomes a question, source document, or answer, but all keep that pigment. Synchronization tokens are a separate layer and use their own schedules.

Render layers in this order: background or boundary, subdued baseline connectors, active traces, objects, labels, moving tokens. Keep decorative animation groups out of the accessibility tree.

## SVG timing

The reference renderer contains reusable `splines`, `visibilityAnimation`, `particle`, and `trace` helpers. Adapt these instead of reconstructing the timing from scratch.

For a token active from `start` to `end` within cycle `duration`, use normalized keyframes:

```js
const movement = [[0, 0]];
if (start > 0) movement.push([start / duration, 0]);
movement.push([end / duration, 1]);
if (end < duration) movement.push([1, 1]);
```

The pairs are `[keyTime, keyPoint]`. Use `calcMode="spline"`, with exactly one `keySplines` entry per interval. Travel uses `0.42 0 0.58 1`, a stationary hold uses `0 0 1 1`. Keep key times strictly increasing, including when an interval touches 0 or 1. Require `0 <= start < end <= duration`.

Opacity fades use the same normalized cycle. The reference limits the fade to the smaller of 0.16 seconds and one fifth of travel time. Tokens are initially `opacity="0"`. `begin="indefinite"` lets the controller start every animation together, including opacity, traces, and any store activity. Do not start them automatically in markup, that would animate a hidden desktop diagram on mobile and defeat the static fallback.

The Mimir example uses a 28-second request loop, divided into two 14-second journeys. Mail and calendar ingestion use independent 11-second loops. Calendar ingestion travels from 2.5 to 8 seconds of that loop. These are illustration timings, not observed system timings. Adjust for the new architecture while leaving time to follow each handoff.

The easing comes from Apple’s Core Animation `easeInEaseOut` timing function. Sources: [Apple timing guide](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/Animation_Types_Timing/Articles/Timing.html), [SVG keySplines](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/keySplines).

## Geometry and clarity

Use gentle quadratic or cubic curves with distinct ports for opposite directions. Curves should approach the receiving object cleanly. Check the final control point and tangent when an arrow develops a hook or appears to reverse. Route both lanes without crossing each other or unrelated labels.

Allow roughly 12–20 rendered pixels of clear air as a starting point around illustrated objects. Check the actual visible artwork, not just its nominal box. Include marker size and token scale in this check, the example’s request tokens are scaled to 1.2. Long paths still need a readable travel duration, rather than abruptly accelerating to fit a short slot.

Use muted base arrows so the topology remains readable while idle. Overlay the active path with the current journey pigment. Color strengthens continuity but is not the only explanation, direction, shape, system labels, and the accessible description also communicate the flow.

## Controller contract

The example controller expects:

- `[data-mimir-pipeline]` on each figure.
- `svg.pipeline-desktop` for the animated drawing.
- `[data-flow-toggle]` for its desktop button.
- `.pipeline-mobile` for the separate static drawing.

When adapting the namespace, update the markup, controller, and CSS together. The controller is safe to load more than once because it marks initialized figures. It starts all desktop animations once, then pauses or resumes the SVG timeline based on viewport width, user preference, visibility, and manual pause state.

Match its `min-width: 821px` query with the example CSS’s `max-width: 820px` query, or change both together. The pause button is initially hidden and revealed only for the desktop layout. It uses `aria-pressed` for manual or preference pause, and `aria-controls` points to the drawing wrapper. An offscreen pause conserves resources without pretending the user pressed Pause.

For reduced motion, default to static. If an explicit Play button is provided, it may let the viewer opt in, and a preference change should restore the system default. A mobile SVG contains no `animate` or `animateMotion` elements, and its hidden desktop timeline remains paused.

## Integration

Give every figure a unique simple ID. Prefix its SVG definition, title, description, marker, and symbol IDs with both figure ID and layout name. Avoid global marker IDs that collide across articles or multiple diagrams.

Resolve portrait, logo, and controller URLs through the target site’s existing asset system. The portable example uses relative URLs only for local viewing. Its CSS expects `--gutter`, `--sans`, `--serif`, and `--rule`, with standalone fallbacks. Use the surrounding page’s typography when available. Scope the component when integrating with other SVG components.

Confirm the fallback remains useful without JavaScript: the wide layout shows static topology, the phone layout shows the compact overview, and the hidden control stays hidden. Do not require a legend or an accompanying paragraph to repair a diagram whose basic flow is unclear.
