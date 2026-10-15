(() => {
  const bar = document.querySelector(".article-progress");
  const heading = document.querySelector(".article-heading");
  if (!bar || !heading) return;

  const page = document.documentElement;
  let frame = null;

  const update = () => {
    frame = null;
    // Include the footer so the fill reaches the right edge at the page bottom.
    const scrollRange = page.scrollHeight - page.clientHeight;
    const progress = scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 0;
    bar.style.setProperty("--article-progress", progress);
    bar.classList.toggle("is-visible", scrollRange > 0 && heading.getBoundingClientRect().bottom <= 0);
  };

  const scheduleUpdate = () => {
    if (frame === null) frame = window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("pageshow", scheduleUpdate);
  // Images, fonts, and responsive content can change the available scroll range.
  new ResizeObserver(scheduleUpdate).observe(document.body);
  document.fonts.ready.then(scheduleUpdate);
  update();
  bar.hidden = false;
})();
