import { assetUrl } from "./assets.mjs";

const cycle = 26;
const splitStart = 8.3;
const splitEnd = 10.5;
const resetStart = 23;
const resetEnd = 24.5;
const ease = "0.35 0 0.2 1";
const hold = "0 0 1 1";
const cardHeight = 112;
const cardPadding = 16;
const titleLineHeight = 26;
const titleCountGap = 12;
const gap = 26;
const finalTop = 52;
const parts = [
  { key: "interface", label: ["1 · Add new interface", "+ tests"], ink: "olive", changed: 600 },
  { key: "codemod", label: ["2 · Add codemod", "+ tests"], ink: "ochre", changed: 400 },
  { key: "first-batch", label: ["3 · First batch"], ink: "pale", changed: 9600 },
  { key: "second-batch", label: ["4 · Second batch"], ink: "pale", changed: 9600 },
  { key: "third-batch", label: ["5 · Third batch"], ink: "pale", changed: 9400 },
  { key: "cleanup", label: ["6 · Remove codemod", "+ deprecated interface"], ink: "terra", changed: 400 }
].map((part, index) => ({ ...part, reveal: 2.6 + index * .9, approved: 11 + index * .65 }));
const sourceTop = finalTop + (parts.length - 1) * gap / 2;
const finalBottom = finalTop + parts.length * cardHeight + (parts.length - 1) * gap;
const footerY = finalBottom + 41;
const drawingHeight = footerY + 11;

const number = (value) => value.toLocaleString("en-US");
const text = (x, y, value, className, attributes = "") => `<text x="${x}" y="${y}" class="${className}" text-anchor="middle" ${attributes}>${value}</text>`;

function timing(frames) {
  return `keyTimes="${frames.map(([at]) => at / cycle).join(";")}" keySplines="${frames.slice(1).map((frame, index) => frame[1] === frames[index][1] ? hold : ease).join(";")}" calcMode="spline" dur="${cycle}s" repeatCount="indefinite" begin="indefinite"`;
}

function opacity(frames) {
  return `<animate attributeName="opacity" values="${frames.map(([, value]) => value).join(";")}" ${timing(frames)}/>`;
}

function contour(width, height) {
  return `M1 1L${width - 2} 0L${width} ${height - 2}L0 ${height}Z`;
}

function definitions(prefix) {
  return `<defs>
    <pattern id="${prefix}-grain" width="17" height="13" patternUnits="userSpaceOnUse"><path d="M3 3h.7M12 9h.8" stroke="#F3F1E8" stroke-width=".7" opacity=".18"/></pattern>
    <marker id="${prefix}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L8 5L1 9" fill="none" stroke="#596046" stroke-width="1.5"/></marker>
  </defs>`;
}

function card(prefix, part, index, { x, width, compact }) {
  const band = parts.length - index - 1;
  const from = `${x} ${sourceTop + band * cardHeight}`;
  const to = `${x} ${finalTop + band * (cardHeight + gap)}`;
  const shape = contour(width, cardHeight);
  const motion = [[0, from], [splitStart, from], [splitEnd, to], [resetStart, to], [resetEnd, from], [cycle, from]];
  const titleClass = compact ? "pr-breakdown-mobile-title" : "pr-breakdown-card-title";
  const titleSize = compact ? 21 : 24;
  const countSize = compact ? 16 : 17;
  const titleHeight = titleSize + (part.label.length - 1) * titleLineHeight;
  const contentHeight = titleHeight + titleCountGap + countSize;
  const contentTop = (cardHeight - contentHeight) / 2;
  const badgeRadius = 12;
  const badgeInset = cardPadding + badgeRadius;
  return `<g class="pr-breakdown-card pr-breakdown-${part.ink}" data-pr-part="${part.key}" transform="translate(${to})">
    <animateTransform attributeName="transform" type="translate" values="${motion.map(([, value]) => value).join(";")}" ${timing(motion)}/>
    ${opacity([[0, 0], [part.reveal, 0], [part.reveal + .25, 1], [resetEnd + .2, 1], [resetEnd + .5, 0], [cycle, 0]])}
    <path class="pr-breakdown-shadow" d="${shape}" transform="translate(2 3)"/><path class="pr-breakdown-tile" d="${shape}"/>
    <path d="${shape}" fill="url(#${prefix}-grain)" aria-hidden="true"/>
    <path class="pr-breakdown-highlight" d="M5 5H${width - 6}V${cardHeight - 6}H5Z" opacity="0" aria-hidden="true">
      ${opacity([[0, 0], [part.reveal, 0], [part.reveal + .15, 1], [part.reveal + .65, 1], [part.reveal + .9, 0], [cycle, 0]])}
    </path>
    <g class="codemod-card-content">
      ${part.label.map((line, lineIndex) => text(width / 2, contentTop + titleSize / 2 + lineIndex * titleLineHeight, line, titleClass, 'dominant-baseline="central"')).join("")}
      <g>${text(width / 2, contentTop + titleHeight + titleCountGap + countSize / 2, `${number(part.changed)} lines changed`, "pr-breakdown-count pr-breakdown-added", 'dominant-baseline="central"')}${opacity([[0, 0], [splitEnd, 0], [splitEnd + .4, 1], [resetStart - .2, 1], [resetStart, 0], [cycle, 0]])}</g>
    </g>
    <g class="pr-breakdown-check" transform="translate(${width - badgeInset} ${badgeInset})" opacity="1" aria-hidden="true"><circle r="${badgeRadius}"/><path d="M-7 0L-2 5L8-6"/>
      ${opacity([[0, 0], [part.approved, 0], [part.approved + .25, 1], [resetStart - .2, 1], [resetStart, 0], [cycle, 0]])}
    </g>
  </g>`;
}

function blob(prefix, { x, width, compact }) {
  const height = parts.length * cardHeight;
  const shape = contour(width, height);
  const titleClass = compact ? "pr-breakdown-card-title pr-breakdown-mobile-title" : "pr-breakdown-card-title";
  return `<g class="pr-breakdown-blob pr-breakdown-terra" transform="translate(${x} ${sourceTop})" opacity="0">
    <path class="pr-breakdown-shadow" d="${shape}" transform="translate(2 3)"/><path class="pr-breakdown-tile" d="${shape}"/>
    <path d="${shape}" fill="url(#${prefix}-grain)" aria-hidden="true"/>
    <g>${text(width / 2, height / 2 - 7, "New interface", titleClass)}${text(width / 2, height / 2 + 23, "+ every caller", titleClass)}
      ${opacity([[0, 1], [2.4, 1], [2.6, 0], [resetEnd + .5, 0], [resetEnd + .8, 1], [cycle, 1]])}
    </g>
    ${opacity([[0, 1], [splitStart - .2, 1], [splitStart, 0], [resetEnd, 0], [resetEnd + .2, 1], [cycle, 1]])}
  </g>`;
}

function comment(x, y, start) {
  return `<g class="pr-breakdown-comment" transform="translate(${x} ${y})" opacity="0" aria-hidden="true">
    <path d="M0 0H36V25H18L9 33V25H0Z"/><path class="pr-breakdown-comment-lines" d="M8 8H27M8 16H21"/>
    ${opacity([[0, 0], [start, 0], [start + .3, 1], [splitStart - .2, 1], [splitStart + .2, 0], [cycle, 0]])}
  </g>`;
}

function cross(x, y, start) {
  return `<g class="pr-breakdown-cross" transform="translate(${x} ${y})" opacity="0" aria-hidden="true"><circle r="14"/><path d="M-5-5L5 5M5-5L-5 5"/>
    ${opacity([[0, 0], [start, 0], [start + .2, 1], [splitStart - .2, 1], [splitStart + .2, 0], [cycle, 0]])}
  </g>`;
}

function drawing(id, compact) {
  const prefix = `${id}-${compact ? "mobile" : "desktop"}`;
  const layout = { x: compact ? 35 : 180, width: compact ? 290 : 400, compact };
  const center = compact ? 180 : 380;
  const width = compact ? 360 : 760;
  const connectors = parts.slice(0, -1).map((part, index) => {
    const lowerTop = finalTop + (parts.length - index - 1) * (cardHeight + gap);
    const upperBottom = lowerTop - gap;
    return `<g opacity="1" aria-hidden="true"><path d="M${center} ${lowerTop - 8}V${upperBottom + 8}" marker-end="url(#${prefix}-arrow)"/>
      ${opacity([[0, 0], [part.approved + .3, 0], [part.approved + .55, 1], [resetStart - .2, 1], [resetStart, 0], [cycle, 0]])}
    </g>`;
  }).join("");
  const decorations = compact
    ? `${comment(4, 154, .4)}${comment(320, 292, .9)}${comment(60, 526, 1.4)}${cross(334, 130, .7)}${cross(25, 420, 1.2)}${cross(285, 527, 1.8)}`
    : `${comment(136, 154, .4)}${comment(588, 292, .9)}${comment(245, 526, 1.4)}${cross(592, 130, .7)}${cross(166, 420, 1.2)}${cross(526, 527, 1.8)}`;
  return `<svg class="pr-breakdown-svg pr-breakdown-${compact ? "mobile" : "desktop"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${drawingHeight}" role="img" aria-labelledby="${prefix}-title ${prefix}-description">
    <title id="${prefix}-title">One large interface migration becomes six stacked pull requests</title>
    <desc id="${prefix}-description">One undivided pull request changes 30,000 lines across 700 files to introduce a new interface for a widely used method. Its six parts are highlighted from the bottom, then move apart into a serial stack. Read bottom to top: add the new interface and tests; add the codemod and tests; apply first, second, and third batches; remove the codemod and deprecated interface. Individual changed-line counts sum to 30,000. Arrows and approvals appear from the base upward. Counts are illustrative; files can recur between PRs.</desc>
    ${definitions(prefix)}
    <g class="pr-breakdown-total" opacity="0">
      ${text(center, 28, "One huge migration PR", "pr-breakdown-stage")}
      ${text(center, 69, "30,000 lines changed", "pr-breakdown-count")}${text(center, 94, "700 files changed", "pr-breakdown-detail")}
      ${opacity([[0, 1], [splitStart - .2, 1], [splitStart + .2, 0], [resetEnd + .2, 0], [resetEnd + .5, 1], [cycle, 1]])}
    </g>
    <g class="pr-breakdown-result" opacity="1">${text(center, 28, "Six stacked PRs", "pr-breakdown-stage")}
      ${opacity([[0, 0], [splitEnd, 0], [splitEnd + .4, 1], [resetStart - .2, 1], [resetStart, 0], [cycle, 0]])}
    </g>
    <g class="pr-breakdown-dependencies">${connectors}</g>
    ${blob(prefix, layout)}${parts.map((part, index) => card(prefix, part, index, layout)).join("")}
    ${decorations}
    <g opacity="1">${text(center, footerY, "Stack reads bottom to top", "pr-breakdown-detail")}
      ${opacity([[0, 0], [splitEnd, 0], [splitEnd + .4, 1], [resetStart - .2, 1], [resetStart, 0], [cycle, 0]])}
    </g>
  </svg>`;
}

export function codemodBreakdown(id = "codemod-migration") {
  if (!/^[a-z][a-z0-9-]*$/u.test(id)) throw new Error("codemodBreakdown needs a unique, simple HTML id.");
  return `<figure class="pr-breakdown codemod-breakdown" id="${id}" data-pr-breakdown aria-labelledby="${id}-heading">
    <div class="pr-breakdown-toolbar"><span id="${id}-heading" class="pr-breakdown-heading">Review the migration in stages</span><button class="pr-breakdown-toggle" type="button" data-pr-breakdown-toggle aria-pressed="false" aria-controls="${id}-drawing" hidden>Pause animation</button></div>
    <div id="${id}-drawing" data-pr-breakdown-drawing>${drawing(id, false)}${drawing(id, true)}</div>
  </figure><script src="${assetUrl("/assets/scripts/pr-breakdown.js")}" defer></script>`.replace(/\n\s*/gu, "");
}
