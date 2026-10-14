(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wideLayout = window.matchMedia("(min-width: 821px)");
  const startThreshold = 0.25;

  document.querySelectorAll("[data-pr-breakdown]").forEach((figure) => {
    if (figure.dataset.prBreakdownReady) return;
    const button = figure.querySelector("[data-pr-breakdown-toggle]");
    const viewport = figure.querySelector("[data-pr-breakdown-drawing]");
    const layouts = [
      { drawing: figure.querySelector("svg.pr-breakdown-desktop"), wide: true, initialized: false },
      { drawing: figure.querySelector("svg.pr-breakdown-mobile"), wide: false, initialized: false }
    ].filter(({ drawing }) => drawing && typeof drawing.pauseAnimations === "function");
    if (!button || !viewport || !layouts.length) return;
    figure.dataset.prBreakdownReady = "true";

    let visible = false;
    let hasEntered = false;
    let manualPause;
    layouts.forEach(({ drawing }) => drawing.pauseAnimations());

    function prepareLayouts() {
      if (reducedMotion.matches && manualPause !== false) return;
      layouts.forEach((layout) => {
        if (layout.initialized) return;
        // Prepare the first frame while paused; viewport changes only resume it.
        layout.drawing.querySelectorAll("animate, animateMotion, animateTransform, set").forEach((animation) => {
          animation.beginElement();
        });
        layout.initialized = true;
      });
    }

    function update() {
      const paused = manualPause ?? reducedMotion.matches;
      const active = layouts.find(({ wide }) => wide === wideLayout.matches);
      const canPlay = Boolean(active?.initialized) && !paused && visible && hasEntered && !document.hidden;

      layouts.forEach((layout) => {
        const { drawing } = layout;
        const playing = layout === active && canPlay;
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
      prepareLayouts();
      update();
    });
    reducedMotion.addEventListener("change", () => {
      manualPause = undefined;
      prepareLayouts();
      update();
    });
    wideLayout.addEventListener("change", () => window.requestAnimationFrame(update));
    document.addEventListener("visibilitychange", update);

    prepareLayouts();

    if (window.IntersectionObserver) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio > 0;
        hasEntered ||= entry.intersectionRatio >= startThreshold;
        update();
      }, { threshold: [0, 0.001, startThreshold] }).observe(viewport);
    } else {
      const checkViewport = () => {
        const bounds = viewport.getBoundingClientRect();
        const width = Math.max(0, Math.min(bounds.right, window.innerWidth) - Math.max(bounds.left, 0));
        const height = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0));
        const ratio = bounds.width > 0 && bounds.height > 0 ? (width * height) / (bounds.width * bounds.height) : 0;
        visible = ratio > 0;
        hasEntered ||= ratio >= startThreshold;
        update();
      };
      window.addEventListener("scroll", checkViewport, { passive: true });
      window.addEventListener("resize", checkViewport);
      checkViewport();
    }

    update();
  });
})();
