(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wideLayout = window.matchMedia("(min-width: 821px)");

  document.querySelectorAll("[data-mimir-pipeline]").forEach((figure) => {
    if (figure.dataset.flowReady) return;
    figure.dataset.flowReady = "true";
    const drawing = figure.querySelector("svg.pipeline-desktop");
    const button = figure.querySelector("[data-flow-toggle]");
    let visible = false;
    let manualPause;
    let initialized = false;

    drawing.pauseAnimations();

    function update() {
      const paused = manualPause ?? reducedMotion.matches;
      const desktop = wideLayout.matches;
      if (desktop && !initialized) {
        // Mobile has no animations, and does not start the hidden desktop loop.
        drawing.querySelectorAll("animate, animateMotion").forEach((animation) => animation.beginElement());
        initialized = true;
      }
      if (!desktop || paused || !visible || document.hidden) drawing.pauseAnimations();
      else drawing.unpauseAnimations();
      figure.dataset.motion = desktop ? (paused ? "paused" : "playing") : "static";
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
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }).observe(figure);
    update();
  });
})();
