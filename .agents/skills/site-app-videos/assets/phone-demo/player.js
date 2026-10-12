(() => {
  for (const demo of document.querySelectorAll("[data-phone-demo]")) {
    if (demo.dataset.playerReady) continue;
    const video = demo.querySelector("video");
    const playButton = demo.querySelector(".phone-demo-play");
    if (!video || !playButton) continue;
    demo.dataset.playerReady = "true";

    // Replace the fallback poster only after the video has a decoded first frame.
    const showFirstFrame = () => {
      if (video.readyState >= 2) video.removeAttribute("poster");
    };
    video.addEventListener("loadeddata", showFirstFrame, { once: true });
    showFirstFrame();

    video.controls = false;
    playButton.hidden = false;
    demo.dataset.playerState = "preview";
    let starting = false;
    playButton.addEventListener("click", async () => {
      if (starting) return;
      starting = true;
      playButton.disabled = true;
      try {
        await video.play();
        video.focus({ preventScroll: true });
      } catch {
        // Leave native controls available if the browser cannot start playback.
        demo.dataset.playerState = "preview";
        video.controls = true;
        playButton.disabled = false;
        playButton.hidden = false;
        playButton.focus({ preventScroll: true });
      } finally {
        starting = false;
      }
    });
    // Begin the fade with actual playback, keeping the preview intact if buffering.
    video.addEventListener("playing", () => {
      demo.dataset.playerState = "playing";
      video.controls = true;
      playButton.disabled = true;
    });
    video.addEventListener("ended", () => {
      video.currentTime = 0;
      video.controls = false;
      demo.dataset.playerState = "preview";
      playButton.disabled = false;
      playButton.hidden = false;
    });
  }
})();
