import { assetUrl } from "./assets.mjs";
import { prCardDefinitions, prCardSurface, prCardIcon, prCardRule } from "./pr-card-art.mjs";

const cycle = 22;
const resetStart = 19.5;
const resetEnd = 21;
// Apple uses this curve for transform transitions on its MacBook Air page.
const ease = "0.35 0 0.2 1";
const hold = "0 0 1 1";
const parts = [
  { key: "bug", label: "Bug fix", ink: "pale", width: 180, height: 100, added: 200, removed: 50, from: [200, 388], to: [185, 436], reveal: 2.6, start: 6.5, end: 8.5, approved: 9.7 },
  { key: "refactor", label: "Class refactor", ink: "ochre", width: 180, height: 100, added: 950, removed: 250, from: [380, 388], to: [395, 436], reveal: 3.5, start: 6.5, end: 8.5, approved: 10.3 },
  { key: "foundation", label: "Foundational work", ink: "olive", width: 360, height: 100, added: 780, removed: 170, from: [200, 288], to: [200, 270], reveal: 4.4, start: 6.5, end: 8.5, approved: 12.3 },
  { key: "feature", label: "Feature Implementation", ink: "terra", width: 360, height: 110, added: 520, removed: 80, from: [200, 178], to: [200, 94], reveal: 5.3, start: 6.5, end: 8.5, approved: 13.7 }
];
const breakdownStart = parts[0].reveal;
const totals = parts.reduce((sum, part) => ({ added: sum.added + part.added, removed: sum.removed + part.removed }), { added: 0, removed: 0 });
const number = (value) => value.toLocaleString("en-US");
const text = (x, y, value, className = "pr-breakdown-label") => `<text x="${x}" y="${y}" class="${className}" text-anchor="middle">${value}</text>`;

function timing(frames) {
  return `keyTimes="${frames.map(([at]) => at / cycle).join(";")}" keySplines="${frames.slice(1).map((frame, index) => frame[1] === frames[index][1] ? hold : ease).join(";")}" calcMode="spline" dur="${cycle}s" repeatCount="indefinite" begin="indefinite"`;
}

function opacity(frames) {
  return `<animate attributeName="opacity" values="${frames.map(([, value]) => value).join(";")}" ${timing(frames)}/>`;
}

function definitions(prefix) {
  return `<defs>${prCardDefinitions(prefix)}</defs>`;
}

function connection(route, start, end, tip = "") {
  const progress = [[0, 1], [start, 1], [end, 0], [resetStart, 0], [resetEnd, 1], [cycle, 1]];
  return `<g class="pr-breakdown-connection" opacity="1" aria-hidden="true">
    ${opacity([[0, 0], [start, 0], [start + .04, 1], [resetStart - .2, 1], [resetStart, 0], [cycle, 0]])}
    <path class="pr-breakdown-flow-line" d="${route}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0" stroke-linecap="round">
      <animate attributeName="stroke-dashoffset" values="${progress.map(([, value]) => value).join(";")}" ${timing(progress)}/>
    </path>
    ${tip ? `<path class="pr-breakdown-arrow-tip" d="${tip}" opacity="1">${opacity([[0, 0], [end, 0], [end + .05, 1], [resetStart - .2, 1], [resetStart, 0], [cycle, 0]])}</path>` : ""}
  </g>`;
}

function counts(x, y, added, removed, anchor = "middle", files) {
  return `<text x="${x}" y="${y}" class="pr-breakdown-count pr-card-art-count" text-anchor="${anchor}"><tspan class="pr-breakdown-added">+${number(added)}</tspan><tspan dx="12" class="pr-breakdown-removed">−${number(removed)}</tspan>${files ? `<tspan dx="16" fill="#22251F">${number(files)} files</tspan>` : ""}</text>`;
}

function check(part, animated) {
  return `<g class="pr-breakdown-check" transform="translate(${part.width - 18} ${part.height - 19})" opacity="1" aria-hidden="true">
    <circle r="9"/><path d="M-4.5 0L-1 3.5L5-4"/>
    ${animated ? opacity([[0, 0], [part.approved, 0], [part.approved + .3, 1], [resetStart - .2, 1], [resetStart, 0], [cycle, 0]]) : ""}
  </g>`;
}

function card(prefix, part, compact = false) {
  const [x, y] = part.to;
  const narrow = part.width <= 180;
  const titleSize = compact ? (narrow ? 16 : 20) : (narrow ? 20 : 25);
  const ruleY = part.height - 32;
  const titleY = (ruleY + titleSize * .7) / 2;
  const title = Array.isArray(part.label) ? part.label.join(" ") : part.label;
  const motion = [
    [0, part.from.join(" ")], [part.start, part.from.join(" ")],
    [part.end, part.to.join(" ")], [resetStart, part.to.join(" ")],
    [resetEnd, part.from.join(" ")], [cycle, part.from.join(" ")]
  ];
  return `<g class="pr-breakdown-card pr-card-art" data-pr-part="${part.key}" transform="translate(${x} ${y})">
    <animateTransform attributeName="transform" type="translate" values="${motion.map(([, value]) => value).join(";")}" ${timing(motion)}/>
    ${opacity([[0, 0], [part.reveal, 0], [part.reveal + .25, 1], [resetEnd + .2, 1], [resetEnd + .5, 0], [cycle, 0]])}
    ${prCardSurface(prefix, part.width, part.height)}
    ${prCardRule(12, ruleY, part.width - 24)}
    ${prCardIcon(12, part.height - 27, 16)}
    <text x="12" y="${titleY}" class="pr-card-art-title" text-anchor="start" dominant-baseline="central" style="font-size:${titleSize}px">${title}</text>
    <g class="pr-breakdown-part-counts${compact && narrow ? " pr-card-art-narrow-counts" : ""}">${counts(34, part.height - 12, part.added, part.removed, "start")}</g>${check(part, true)}
  </g>`;
}

function comment(x, y, start) {
  return `<g class="pr-breakdown-comment" transform="translate(${x} ${y})" opacity="0" aria-hidden="true">
    <path d="M0 0H36V25H18L9 33V25H0Z"/><path class="pr-breakdown-comment-lines" d="M8 8H27M8 16H21"/>
    ${opacity([[0, 0], [start, 0], [start + .3, 1], [breakdownStart - .3, 1], [breakdownStart, 0], [cycle, 0]])}
  </g>`;
}

function cross(x, y, start) {
  return `<g class="pr-breakdown-cross" transform="translate(${x} ${y})" opacity="0" aria-hidden="true"><circle r="14"/><path d="M-5-5L5 5M5-5L-5 5"/>${opacity([[0, 0], [start, 0], [start + .2, 1], [breakdownStart - .3, 1], [breakdownStart, 0], [cycle, 0]])}</g>`;
}

function blob(prefix, { x = 200, y = 178, width = 360, height = 310, compact = false } = {}) {
  const inset = compact ? 22 : 28;
  return `<g class="pr-breakdown-blob pr-card-art" transform="translate(${x} ${y})" opacity="0">
    ${prCardSurface(prefix, width, height)}
    <g class="pr-card-art-draft">
      ${prCardIcon(inset, compact ? 24 : 30, compact ? 30 : 38)}
      <text x="${inset}" y="${compact ? 84 : 111}" class="pr-card-art-title" style="font-size:${compact ? 25 : 30}px">Do a bunch of stuff</text>
      <text x="${inset}" y="${compact ? 119 : 157}" class="pr-card-art-copy"><tspan x="${inset}">A robust, seamless solution.</tspan><tspan x="${inset}" dy="23">Refactor, fix, and future-proof.</tspan></text>
      ${prCardRule(inset, height - 42, width - inset * 2)}
      ${counts(inset, height - 18, totals.added, totals.removed, "start", 75)}
    </g>
    ${opacity([[0, 1], [2.4, 1], [2.6, 0], [resetEnd + .5, 0], [resetEnd + .8, 1], [cycle, 1]])}
  </g>`;
}

function desktop(id) {
  const prefix = `${id}-desktop`;
  return `<svg class="pr-breakdown-svg pr-breakdown-desktop" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 605" role="img" aria-labelledby="${prefix}-title ${prefix}-description">
    <title id="${prefix}-title">One large pull request becomes four smaller reviews</title>
    <desc id="${prefix}-description">One undivided PR block gathers comments and rejection marks. Its bug fix, class refactor, foundational work, and feature appear one at a time, then move apart in place. Bug fix and refactor become parallel base PRs, foundational work sits above them, and the feature sits at the top. The comments and combined counter disappear. Each base PR is approved, its connector draws upward, and the next PR is approved after the connection arrives. Illustrative counts sum to 2,450 additions and 550 removals.</desc>
    ${definitions(prefix)}
    <g class="pr-breakdown-total" opacity="0">
      ${text(380, 64, "One huge PR", "pr-breakdown-stage")}
      ${opacity([[0, 1], [6.3, 1], [6.7, 0], [resetEnd + .2, 0], [resetEnd + .5, 1], [cycle, 1]])}
    </g>
    <g class="pr-breakdown-result" opacity="1">
      ${text(380, 64, "Four focused PRs", "pr-breakdown-stage")}
      ${opacity([[0, 0], [8.5, 0], [8.9, 1], [resetStart - .2, 1], [resetStart, 0], [cycle, 0]])}
    </g>
    <g class="pr-breakdown-dependencies" aria-hidden="true">
      ${connection("M275 424V402H380", 10.1, 11)}
      ${connection("M485 424V402H380", 10.7, 11.6)}
      ${connection("M380 402V382", 11.7, 12.2, "M375 388L380 382L385 388")}
      ${connection("M380 258V216", 12.7, 13.6, "M375 222L380 216L385 222")}
    </g>
    ${blob(prefix)}
    ${parts.map((part) => card(prefix, part)).join("")}
    ${comment(156, 202, .4)}${comment(579, 301, .9)}${comment(247, 504, 1.4)}
    ${cross(584, 184, .7)}${cross(181, 428, 1.2)}${cross(526, 510, 1.8)}
  </svg>`;
}

function mobile(id) {
  const prefix = `${id}-mobile`;
  const layouts = {
    bug: { width: 145, height: 82, from: [35, 258], to: [20, 334] },
    refactor: { width: 145, height: 82, from: [180, 258], to: [195, 334] },
    foundation: { width: 290, height: 70, from: [35, 188], to: [35, 181] },
    feature: { width: 290, height: 64, from: [35, 124], to: [35, 58] }
  };
  return `<svg class="pr-breakdown-svg pr-breakdown-mobile" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 470" role="img" aria-labelledby="${prefix}-title ${prefix}-description">
    <title id="${prefix}-title">One large pull request becomes four smaller reviews</title>
    <desc id="${prefix}-description">One undivided PR gathers comments and rejection marks. Its four parts appear one at a time, then move apart into a stack: bug fix and class refactor in parallel, foundational work above them, and feature at the top. The combined counter disappears and smaller counts and approval checks appear.</desc>
    ${definitions(prefix)}
    <g class="pr-breakdown-total" opacity="0">
      ${text(180, 28, "One huge PR", "pr-breakdown-stage")}
      ${opacity([[0, 1], [6.3, 1], [6.7, 0], [resetEnd + .2, 0], [resetEnd + .5, 1], [cycle, 1]])}
    </g>
    <g class="pr-breakdown-result" opacity="1">
      ${text(180, 28, "Four focused PRs", "pr-breakdown-stage")}
      ${opacity([[0, 0], [8.5, 0], [8.9, 1], [resetStart - .2, 1], [resetStart, 0], [cycle, 0]])}
    </g>
    <g class="pr-breakdown-dependencies" aria-hidden="true">
      ${connection("M92.5 322V291H180", 10.1, 11)}
      ${connection("M267.5 322V291H180", 10.7, 11.6)}
      ${connection("M180 291V263", 11.7, 12.2, "M175 269L180 263L185 269")}
      ${connection("M180 169V134", 12.7, 13.6, "M175 140L180 134L185 140")}
    </g>
    ${blob(prefix, { x: 35, y: 124, width: 290, height: 216, compact: true })}
    ${parts.map((part) => card(prefix, { ...part, ...layouts[part.key] }, true)).join("")}
    ${comment(4, 146, .4)}${comment(320, 208, .9)}${comment(60, 351, 1.4)}
    ${cross(334, 130, .7)}${cross(25, 300, 1.2)}${cross(290, 351, 1.8)}
  </svg>`;
}

export function prBreakdown(id = "focused-prs") {
  if (!/^[a-z][a-z0-9-]*$/u.test(id)) throw new Error("prBreakdown needs a unique, simple HTML id.");
  return `<figure class="pr-breakdown" id="${id}" data-pr-breakdown aria-labelledby="${id}-heading">
    <div class="pr-breakdown-toolbar"><span id="${id}-heading" class="pr-breakdown-heading">Split the work before review</span><button class="pr-breakdown-toggle" type="button" data-pr-breakdown-toggle aria-pressed="false" aria-controls="${id}-drawing" hidden>Pause animation</button></div>
    <div id="${id}-drawing" data-pr-breakdown-drawing>${desktop(id)}${mobile(id)}</div>
  </figure><script src="${assetUrl("/assets/scripts/pr-breakdown.js")}" defer></script>`.replace(/\n\s*/gu, "");
}
