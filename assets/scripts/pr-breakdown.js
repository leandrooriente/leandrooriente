(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wideLayout = window.matchMedia("(min-width: 821px)");

  document.querySelectorAll("[data-pr-breakdown]").forEach((figure) => {
    if (figure.dataset.prBreakdownReady) return;
    const drawing = figure.querySelector("svg.pr-breakdown-desktop");
    const button = figure.querySelector("[data-pr-breakdown-toggle]");
    if (!drawing || !button || typeof drawing.pauseAnimations !== "function") return;
    figure.dataset.prBreakdownReady = "true";

    let visible = !window.IntersectionObserver;
    let manualPause;
    let initialized = false;
    drawing.pauseAnimations();

    function update() {
      const paused = manualPause ?? reducedMotion.matches;
      const desktop = wideLayout.matches;
      const canPlay = desktop && !paused && visible && !document.hidden;

      if (canPlay && !initialized) {
        // Leave the static drawing intact until a visible desktop loop can play.
        drawing.setCurrentTime(0);
        drawing.querySelectorAll("animate, animateMotion, animateTransform, set").forEach((animation) => {
          animation.beginElement();
        });
        initialized = true;
      }

      if (canPlay) drawing.unpauseAnimations();
      else drawing.pauseAnimations();

      figure.dataset.motion = !desktop || !initialized ? "static" : (paused ? "paused" : (canPlay ? "playing" : "suspended"));
      button.hidden = !desktop;
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
