import { assetUrl } from "./assets.mjs";

const escapeHtml = (value) => String(value).replace(/[&<>"']/gu, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));

// A transparent print illustration surrounds any portrait video and poster.
export function phoneDemo(video, poster, label, caption, id = "phone-demo") {
  if (!/^[a-z][a-z0-9-]*$/u.test(id)) throw new Error("phoneDemo needs a unique, simple HTML id.");
  const videoUrl = escapeHtml(assetUrl(video));
  const posterUrl = escapeHtml(assetUrl(poster));
  const frameUrl = escapeHtml(assetUrl("/assets/illustrations/phone-frame-matte-black.png"));
  return `<figure class="phone-demo" id="${id}" data-phone-demo aria-labelledby="${id}-caption">
  <div class="phone-demo-device">
    <video class="phone-demo-screen" id="${id}-video" controls playsinline preload="auto" poster="${posterUrl}" aria-label="${escapeHtml(label)}" aria-describedby="${id}-caption">
      <source src="${videoUrl}" type="video/mp4">
      <a href="${videoUrl}">Watch ${escapeHtml(label)}</a>
    </video>
    <div class="phone-demo-wash" aria-hidden="true"></div>
    <img class="phone-demo-frame" src="${frameUrl}" width="866" height="1816" alt="" loading="lazy" decoding="async" aria-hidden="true">
    <button class="phone-demo-play" type="button" aria-label="Play ${escapeHtml(label)}" aria-controls="${id}-video" hidden>
      <svg viewBox="0 0 100 68" width="100" height="68" aria-hidden="true" focusable="false">
        <path class="phone-demo-play-stock" d="M17 4C37 3 60 2 82 4C90 4 96 8 97 17L98 49C98 57 93 62 85 63C62 64 39 64 16 62C8 62 3 58 2 50L3 17C3 9 8 5 17 4Z"/>
        <path class="phone-demo-play-ink" d="M17 6C37 5 61 5 81 6C89 6 94 10 95 18L96 48C96 55 92 60 84 61C63 62 39 61 17 60C9 60 5 57 4 49L5 18C5 11 10 7 17 6Z"/>
        <path d="M43 20C41.9 19.3 41.2 20 41.4 21.5C42.1 30 40.9 39.3 41.8 47.8C41.9 49.3 42.7 49.5 44 48.5C50.4 44.1 57.5 40.5 64 36C66 34.6 66 33.7 64.1 32.8C56.8 29.4 50.2 24.2 43 20Z" fill="currentColor"/>
        <path d="M16 13h1.3v.8H16ZM84 48h.8v1.3H84ZM25 55h1v.7H25Z" fill="currentColor" opacity=".35"/>
      </svg>
    </button>
  </div>
  <figcaption id="${id}-caption">${escapeHtml(caption)}</figcaption>
</figure><script src="${escapeHtml(assetUrl("/assets/scripts/phone-media.js"))}" defer></script>`;
}
