(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wideLayout = window.matchMedia("(min-width: 821px)");

  document.querySelectorAll("[data-pr-breakdown]").forEach((figure) => {
    if (figure.dataset.prBreakdownReady) return;
    const button = figure.querySelector("[data-pr-breakdown-toggle]");
    const layouts = [
      { drawing: figure.querySelector("svg.pr-breakdown-desktop"), wide: true, initialized: false },
      { drawing: figure.querySelector("svg.pr-breakdown-mobile"), wide: false, initialized: false }
    ].filter(({ drawing }) => drawing && typeof drawing.pauseAnimations === "function");
    if (!button || !layouts.length) return;
    figure.dataset.prBreakdownReady = "true";

    let visible = !window.IntersectionObserver;
    let manualPause;
    layouts.forEach(({ drawing }) => drawing.pauseAnimations());

    function update() {
      const paused = manualPause ?? reducedMotion.matches;
      const active = layouts.find(({ wide }) => wide === wideLayout.matches);
      const canPlay = Boolean(active) && !paused && visible && !document.hidden;

      layouts.forEach((layout) => {
        const { drawing } = layout;
        const playing = layout === active && canPlay;
        if (playing && !layout.initialized) {
          // Leave each static drawing intact until its visible layout can play.
          drawing.setCurrentTime(0);
          drawing.querySelectorAll("animate, animateMotion, animateTransform, set").forEach((animation) => {
            animation.beginElement();
          });
          layout.initialized = true;
        }

        if (playing) drawing.unpauseAnimations();
        else drawing.pauseAnimations();
      });

      figure.dataset.motion = !active?.initialized ? "static" : (paused ? "paused" : (canPlay ? "playing" : "suspended"));
      button.hidden = !active;
      button.textContent = paused ? "Play animation" : "Pause animation";
      button.setAttribute("aria-pressed", String(paused));
    }

    button.addEventListener("click", () => {
      manualPause = !(manualPause ?? reducedMotion.matches);
      update();
    });
    reducedMotion.addEventListener("change", () => {
      manualPause = undefined;
      update();
    });
    wideLayout.addEventListener("change", () => window.requestAnimationFrame(update));
    document.addEventListener("visibilitychange", update);

    if (window.IntersectionObserver) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        update();
      }).observe(figure);
    }

    update();
  });
})();
