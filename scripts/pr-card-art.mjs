// Shared print treatment for the illustrated pull requests in the article.
export function prCardDefinitions(prefix) {
  return `<pattern id="${prefix}-paper" width="43" height="31" patternUnits="userSpaceOnUse"><path d="M3 5h.6M18 3h.7M35 10h.6M9 20h.8M27 26h.6M40 23h.5" stroke="#596046" stroke-width=".65" opacity=".13"/><path d="M12 9h1M30 17h.8M5 29h.7" stroke="#FFFFFF" stroke-width=".8" opacity=".45"/></pattern>`;
}

export function prCardSurface(prefix, width, height) {
  const frame = `M12 2Q${width / 2} .6 ${width - 12} 2Q${width - 2} 2 ${width - 2} 12L${width - 1} ${height - 13}Q${width - 1} ${height - 3} ${width - 12} ${height - 2}L13 ${height - 1}Q2 ${height - 1} 2 ${height - 12}L1 13Q.5 3 12 2Z`;
  return `<path class="pr-card-art-shadow" d="${frame}" transform="translate(2 3)"/><path class="pr-card-art-paper" d="${frame}"/><path d="${frame}" fill="url(#${prefix}-paper)" aria-hidden="true"/><path class="pr-card-art-frame" d="${frame}"/>`;
}

export function prCardIcon(x, y, height = 20) {
  return `<g class="pr-card-art-icon" transform="translate(${x} ${y}) scale(${height / 32})" aria-hidden="true"><path d="M6 9V24M22 24V19C22 13 16 14 16 8V5M12 8L16 4L20 8"/><circle cx="6" cy="5" r="3.5"/><circle cx="6" cy="27" r="3.5"/><circle cx="22" cy="27" r="3.5"/></g>`;
}

export function prCardRule(x, y, width) {
  return `<path class="pr-card-art-rule" d="M${x} ${y}Q${x + width * .48} ${y - .7} ${x + width} ${y + .3}"/>`;
}
