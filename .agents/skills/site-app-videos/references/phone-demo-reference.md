# Phone demo reference

This package captures the approved Mimir presentation from 2026-10-12. It includes the exact frame, renderer, player, styles, and an example recording and poster.

## Files and local preview

Reusable component:

- [phone-demo.mjs](../assets/phone-demo/phone-demo.mjs): markup renderer and code-native play-button artwork.
- [player.js](../assets/phone-demo/player.js): decoded first-frame handling and preview/playback state.
- [phone-demo.css](../assets/phone-demo/phone-demo.css): fixed opening, responsive sizing, preview wash, and player transitions.
- [phone-frame-matte-black.png](../assets/phone-demo/phone-frame-matte-black.png): approved original RGBA frame, unchanged.

Reference content:

- [mimir-demo.mp4](../assets/mimir-reference/mimir-demo.mp4): optimized recording supplied by the user and already used in the article.
- [mimir-demo-poster.jpg](../assets/mimir-reference/mimir-demo-poster.jpg): exact first frame, 800 × 1739 pixels.

From the skill directory, render a portable preview into a new output directory:

```sh
node scripts/preview-example.mjs /tmp/site-app-videos-preview
```

Open its `index.html` in a browser, or serve that directory through the task’s usual local preview server. The example requires no packages or remote assets. The helper copies the frame and media byte-for-byte. It does not convert the clip or change the site.

The portable renderer replaces the site’s asset resolver with relative component URLs. Its styles include standalone variable fallbacks and reset horizontal figure margins normally handled by the page. The renderer, player, frame, screen geometry, and play-button artwork otherwise preserve the approved implementation.

## Geometry

The original frame is 866 × 1816 pixels. Its transparent opening is at x93, y172, with width685 and height1460. The video overlaps two artwork pixels beneath the rim, so neither seams nor an exposed background appear.

The screen and wash use identical geometry:

```css
.phone-demo-device {
  position: relative;
  width: min(100%, 330px);
  aspect-ratio: 866 / 1816;
}
.phone-demo-screen,
.phone-demo-wash {
  position: absolute;
  top: 9.3612%;
  left: 10.5081%;
  width: 79.5612%;
  height: 80.6167%;
}
```

The separate play button is centered at top49.66955% and left50.2887%, using `translate(-50%, -50%)`, with a 100 × 68px drawing. Do not independently stretch the frame, screen, poster, or wash. The transparent PNG sits above the video with `pointer-events: none`. Keep its alpha intact, no flattening against a paper or black background and no blend effect is required.

The screen opening is approximately 0.4692 width/height. Mimir’s clip is 804 × 1748, so the example’s `cover` fit trims a small amount at the top and bottom. Check the actual UI near every edge for a new recording. Padding or `contain` can preserve critical content while retaining the same frame.

## Player contract

Markup uses `[data-phone-demo]`, a native `video`, and `.phone-demo-play`. The controller sets `data-player-ready` and changes `data-player-state` between `preview` and `playing`. The CSS and renderer depend on these selectors. Update them together if namespacing the component.

The button begins hidden, leaving native video controls as the fallback. On enhancement the controller hides native controls and reveals the custom play button. `loadeddata` removes the fallback poster only once a decoded first frame is available. A pending play request disables repeat clicks without dismissing the preview. The `playing` event reveals native controls and fades the preview away. A rejected request restores the button, its focus, and native controls. The `ended` handler seeks back to0, hides native controls, and restores the preview. An ordinary pause retains the native player state.

The wash uses the paper pigment with opacity0.52. The button’s cream rim and triangle use paper, its main pigment uses terracotta, and hover uses carbon. The fade duration is180ms and becomes0ms under reduced motion. Use the site’s typeface and caption color through existing CSS variables.

## Existing portfolio integration

Repository: `/Users/oriente/projects/leandrooriente`.

- Renderer: `scripts/phone-media.mjs`
- Player: `assets/scripts/phone-media.js`
- Frame: `assets/illustrations/phone-frame-matte-black.png`
- Styling: phone-demo rules in `styles.css`
- Registration and public asset list: `eleventy.config.js`
- Provenance: `assets/illustrations/PHONE-FRAME.md`, `assets/illustrations/PROMPTS.md`, and `assets/PROVENANCE.txt`

The shortcode is registered already. For a Markdown post, use `templateEngineOverride: njk,md` in frontmatter. Add the new recording and poster to the public `staticAssets` list, then use:

```njk
{% phoneDemo "/assets/videos/example.mp4", "/assets/illustrations/example-poster.jpg", "Example app demo", "What the demonstration shows.", "example-demo" %}
```

Use a unique final ID for each player. The frame and shared player are already registered, so avoid duplicate implementations. The build fingerprints all four assets. Keep the source MOV and generation notes outside the public output.

Mimir’s original recording is `/Users/oriente/Documents/mimir-video.mov`. Its web version uses H.264, AAC, 30fps, and fast-start MP4 playback, with the source preserved. Its first-frame poster was extracted locally with AVFoundation and encoded as JPEG. For future demos, use an available local media tool to inspect and prepare the new recording, rather than depending on that original path or a particular installed converter.

Live example: [Mimir app demo](https://leandrooriente.com/writing/an-answer-should-be-easy-to-check#mimir-demo).
