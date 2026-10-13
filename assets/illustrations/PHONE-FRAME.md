# Illustrated phone demos

`phone-frame-matte-black.png` is the shared, flat print-style phone bezel.
Its screen opening and outside background have genuine alpha transparency.
Keep the original PNG unchanged; it is independent of Mimir and can surround
other videos or images. The matte black is part of the artwork, not a CSS tint.

The `phoneDemo` shortcode supplies the screen separately, with native playback
controls, no autoplay, inline playback on phones, and a caption. The poster is
shown before playback with a centered play button. Clicking it starts the video,
replaces the button with native controls, and keeps the recording's original UI.
The button uses a slightly crooked rounded rectangle with a cream rim, a
hand-drawn play triangle, and sparse ink flecks. A translucent paper-colored wash
softens the preview beneath the bezel. The video preloads behind it, replacing
the fallback poster once its first
frame is decoded. When actual playback starts, the wash and button fade out
together over 180 ms. They stay visible while a play request is buffering.
Reduced-motion preferences remove the fade. Without JavaScript, native controls
remain available. After the recording ends, the player returns to its first frame.

Mimir's active poster, `mimir-demo-poster.jpg`, is the recording's first frame at
0.0 seconds, extracted locally and encoded at 800 × 1739 pixels. Use a first-frame
poster for other demos so the preview and playback share the same screen.

For a Markdown post, add `templateEngineOverride: njk,md` to its front matter,
register its video and poster in `staticAssets` in `eleventy.config.js`, then use:

```njk
{% phoneDemo "/assets/videos/example.mp4", "/assets/illustrations/example-poster.jpg", "Example app demo", "A short description of the demo.", "example-demo" %}
```

Use a unique final id for each player. Portrait media close to the screen's
685:1460 aspect ratio works best. The screen bounds are documented alongside
the component's CSS; update those bounds if the frame artwork is replaced.
The build fingerprints the frame, media, poster, and shared player script for
safe long-term caching.

Generation prompts and source paths are recorded in `PROMPTS.md`, with media
provenance in `../PROVENANCE.txt`.
