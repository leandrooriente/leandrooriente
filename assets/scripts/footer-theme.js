(() => {
  const theme = document.querySelector('meta[name="theme-color"]');
  const ground = document.querySelector(".footer-ground");
  if (!theme || !ground || !("IntersectionObserver" in window)) return;

  const paper = theme.content;
  const forest = getComputedStyle(ground).backgroundColor;

  // Older Safari and other mobile browsers use the meta color instead of
  // sampling the sticky footer. Restore the paper color when scrolling back.
  new IntersectionObserver(([entry]) => {
    theme.content = entry.isIntersecting ? forest : paper;
  }).observe(ground);
})();
