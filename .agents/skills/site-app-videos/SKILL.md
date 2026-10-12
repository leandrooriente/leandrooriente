---
name: site-app-videos
description: "Present phone app video demos in Leandro Oriente’s websites and articles using the approved Mimir matte black illustrated phone frame, first-frame preview, and accessible inline player. Use when adding or refining portrait app recordings."
---

# Site App Videos

For phone app demos, use the exact frame and presentation approved for Mimir. Keep the frame reusable and the app’s recording separate from it.

## The approved presentation

- Reuse [phone-frame-matte-black.png](assets/phone-demo/phone-frame-matte-black.png) unchanged. This is the shared 866 × 1816 PNG with genuine transparency outside the phone and inside its screen. Do not regenerate it, recolor it, or substitute a realistic 3D device unless the user asks to change the frame.
- Keep the recording’s real interface inside the opening. The surrounding phone is flat matte print artwork, consistent with the site’s warm paper, carbon, terracotta, dry ink, and hand-cut shapes. Do not redraw or stylize the recorded app UI.
- Use the recording’s exact first displayed frame at 0.0 seconds as its poster. Keep the app content, aspect ratio, and preview aligned with playback. Do not substitute Mimir’s poster for another app.
- Retain the translucent paper wash and centered terracotta play button with a cream rim, slightly crooked outline, hand-drawn triangle, and sparse ink flecks. These are separate layers rather than baked into the poster or recording.
- Use a concise caption describing the action demonstrated. Avoid an automatic duration preface. The example’s maximum phone width is 330px, shrinking to the available page width.

## Playback behavior

Use the bundled renderer, player, and styles as the starting point. The video uses native controls as its no-JavaScript fallback, `playsinline`, and no autoplay. The short Mimir example uses `preload="auto"` so its first frame can decode behind the preview.

With JavaScript, the centered button starts playback and reveals native controls. Keep the wash and button visible while the play request is buffering. Fade them only on actual `playing`, over 180ms, with no fade for reduced motion. Keep native controls during playback and ordinary pause. After the video ends, return to the first frame and preview state. If playback fails, leave native controls usable and restore the preview button.

The frame and wash must not intercept video controls. Keep the button keyboard accessible, preserve an app-specific accessible label, and connect the player to its caption. Give each player a unique ID. The controller supports independent players and repeated script inclusion.

## Prepare and integrate

Preserve the source recording and produce a separate web asset when conversion is needed. Use H.264 in an MP4 with fast-start playback and retain audio when present. Inspect the recording’s dimensions and orientation before fitting it to the fixed opening. The current player uses `object-fit: cover` for closely matching portrait media. If another recording differs, use deliberate fitting or padding rather than silently losing important UI.

Extract a first-frame poster from that web recording. Resolve the video, poster, shared frame, and player through the site’s asset pipeline. Keep geometry and player selectors consistent across markup, CSS, and JavaScript. Read [phone-demo-reference.md](references/phone-demo-reference.md) for exact screen bounds, source locations, and the portable working example.

For the existing portfolio, reuse its `phoneDemo` shortcode instead of adding a second player implementation. For another site, adapt the bundled component to that framework while preserving the frame and behavior.

## Verify

Check the poster and recorded UI fit beneath the rim on desktop and phone widths, including 320px. Verify there is no overflow or distorted aspect ratio, the play button works by keyboard, native controls remain accessible, playback stays inline where the browser supports it, and ending restores the preview. Verify playback failure, reduced motion, and static native-control fallback. A new recording needs its own media checks even though the shared frame is unchanged.

The bundled Mimir clip is a working reference, not default content for other apps. Creating a player or skill does not imply authorization to publish a new recording or deploy a site.
