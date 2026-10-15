import { assetUrl } from "./assets.mjs";
import { prBoardProgress, prBoardToggle, prCardDefinitions, prCardSurface, prCardIcon, prCardRule, prCardReviewMarks } from "./pr-card-art.mjs";

const resetStart = 19.5;
const resetFadeEnd = resetStart + .2;
const resetEnd = resetStart + .4;
const cycle = resetEnd + .2;
// Apple uses this curve for transform transitions on its MacBook Air page.
const ease = "0.35 0 0.2 1";
const hold = "0 0 1 1";
// Leave more reading time on the opening card after its review marks arrive.
const openingHold = 7;
const duration = cycle + openingHold;
const parts = [
  { key: "bug", label: "Bug fix", ink: "pale", width: 142, height: 100, added: 200, removed: 50, from: [228, 388], to: [213, 436], reveal: 2.6, start: 6.5, end: 8.5, approved: 9.7 },
  { key: "refactor", label: "Class refactor", ink: "ochre", width: 162, height: 100, added: 950, removed: 250, from: [370, 388], to: [385, 436], reveal: 3.5, start: 6.5, end: 8.5, approved: 10.3 },
  { key: "foundation", label: "Foundational work", ink: "olive", width: 264, height: 100, added: 780, removed: 170, from: [248, 288], to: [248, 270], reveal: 4.4, start: 6.5, end: 8.5, approved: 11.9 },
  { key: "feature", label: "Upload API", ink: "terra", width: 166, height: 110, added: 520, removed: 80, from: [297, 178], to: [297, 94], reveal: 5.3, start: 6.5, end: 8.5, approved: 13.05 }
];
const breakdownStart = parts[0].reveal;
const actionStart = parts[0].start;
const actionEnd = Math.max(...parts.map((part) => part.approved + .3));
// Quicken the split and review sequence, then keep the extra time as a final hold.
// Opening, closing fades, and the complete loop duration stay unchanged.
function actionTime(at) {
  return at >= actionStart && at <= actionEnd ? actionStart + (at - actionStart) * .7 : at;
}
const totals = parts.reduce((sum, part) => ({ added: sum.added + part.added, removed: sum.removed + part.removed }), { added: 0, removed: 0 });
const number = (value) => value.toLocaleString("en-US");
const text = (x, y, value, className = "pr-breakdown-label") => `<text x="${x}" y="${y}" class="${className}" text-anchor="middle">${value}</text>`;
const draftDescription = [
  "Let’s delve into this game-changing update!",
  "src/upload.ts: implemented a robust, seamless solution.",
  "Attempt 1 failed. Attempt 2: rewrote the whole module.",
  "auth.ts: proactively fixed an unrelated bug.",
  "UploadService.ts: refactored for limitless scalability.",
  "transport.ts: added a future-proof abstraction layer.",
  "Also optimized for millions of hypothetical users.",
  "Tests not run. All concerns holistically addressed!"
];
const compactDraftDescription = [
  draftDescription[0],
  "src/upload.ts: implemented a robust,",
  "seamless solution.",
  "Attempt 1 failed. Attempt 2: rewrote",
  "the whole module.",
  draftDescription[3],
  "UploadService.ts: refactored for",
  "limitless scalability.",
  "transport.ts: added a future-proof",
  "abstraction layer.",
  draftDescription[6],
  draftDescription[7]
];

function timing(frames, shiftOpening = true) {
  return `keyTimes="${frames.map(([at]) => (shiftOpening && at > 0 ? actionTime(at) + openingHold : at) / duration).join(";")}" keySplines="${frames.slice(1).map((frame, index) => frame[1] === frames[index][1] ? hold : ease).join(";")}" calcMode="spline" dur="${duration}s" repeatCount="indefinite" begin="indefinite"`;
}

function opacity(frames, shiftOpening = true) {
  return `<animate attributeName="opacity" values="${frames.map(([, value]) => value).join(";")}" ${timing(frames, shiftOpening)}/>`;
}

function openingOpacity() {
  return opacity([[0, 0], [.35, 1], [2.4 + openingHold, 1], [2.6 + openingHold, 0], [duration, 0]], false);
}

function definitions(prefix) {
  return `<defs>${prCardDefinitions(prefix)}</defs>`;
}

function connection(route, start, end, tip = "") {
  const progress = [[0, 1], [start, 1], [end, 0], [resetFadeEnd + .05, 0], [resetEnd, 1], [cycle, 1]];
  return `<g class="pr-breakdown-connection" opacity="1" aria-hidden="true">
    ${opacity([[0, 0], [start, 0], [start + .04, 1], [resetStart - .2, 1], [resetFadeEnd, 0], [cycle, 0]])}
    <path class="pr-breakdown-flow-line" d="${route}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0" stroke-linecap="round">
      <animate attributeName="stroke-dashoffset" values="${progress.map(([, value]) => value).join(";")}" ${timing(progress)}/>
    </path>
    ${tip ? `<path class="pr-breakdown-arrow-tip" d="${tip}" opacity="1">${opacity([[0, 0], [end, 0], [end + .05, 1], [resetFadeEnd, 1], [resetFadeEnd + .05, 0], [cycle, 0]])}</path>` : ""}
  </g>`;
}

function counts(x, y, added, removed, anchor = "middle", files) {
  return `<text x="${x}" y="${y}" class="pr-breakdown-count pr-card-art-count" text-anchor="${anchor}"><tspan class="pr-breakdown-added">+${number(added)}</tspan><tspan dx="12" class="pr-breakdown-removed">−${number(removed)}</tspan>${files ? `<tspan dx="16" fill="#22251F">${number(files)} files</tspan>` : ""}</text>`;
}

function check(part, animated) {
  return `<g class="pr-breakdown-check" transform="translate(${part.width - 18} ${part.height - 19})" opacity="1" aria-hidden="true">
    <circle r="9"/><path d="M-4.5 0L-1 3.5L5-4"/>
    ${animated ? opacity([[0, 0], [part.approved, 0], [part.approved + .3, 1], [resetFadeEnd, 1], [resetFadeEnd + .05, 0], [cycle, 0]]) : ""}
  </g>`;
}

function card(prefix, part, compact = false) {
  const [x, y] = part.to;
  const narrow = part.width <= 180;
  const titleSize = part.key === "feature" ? (compact ? 20 : 25) : compact ? (narrow ? 16 : 20) : (narrow ? 20 : 25);
  const ruleY = part.height - 32;
  const titleY = (ruleY + titleSize * .7) / 2;
  const title = Array.isArray(part.label) ? part.label.join(" ") : part.label;
  const motion = [
    [0, part.from.join(" ")], [part.start, part.from.join(" ")],
    [part.end, part.to.join(" ")], [resetFadeEnd + .05, part.to.join(" ")],
    [resetEnd, part.from.join(" ")], [cycle, part.from.join(" ")]
  ];
  return `<g class="pr-breakdown-card pr-card-art" data-pr-part="${part.key}" transform="translate(${x} ${y})">
    <animateTransform attributeName="transform" type="translate" values="${motion.map(([, value]) => value).join(";")}" ${timing(motion)}/>
    ${opacity([[0, 0], [part.reveal, 0], [part.reveal + .25, 1], [resetStart - .2, 1], [resetFadeEnd, 0], [cycle, 0]])}
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
    ${opacity([[0, 0], [start, 0], [start + .3, 1], [breakdownStart + openingHold - .3, 1], [breakdownStart + openingHold, 0], [duration, 0]], false)}
  </g>`;
}

function cross(x, y, start) {
  return `<g class="pr-breakdown-cross" transform="translate(${x} ${y})" opacity="0" aria-hidden="true"><circle r="14"/><path d="M-5-5L5 5M5-5L-5 5"/>${opacity([[0, 0], [start, 0], [start + .2, 1], [breakdownStart + openingHold - .3, 1], [breakdownStart + openingHold, 0], [duration, 0]], false)}</g>`;
}

function blob(prefix, { x = 145, y = 144, width = 470, height = 316, compact = false } = {}) {
  const inset = compact ? 22 : 24;
  const description = compact ? compactDraftDescription : draftDescription;
  const copyY = compact ? 94 : 102;
  const lineHeight = compact ? 17 : 23;
  return `<g class="pr-breakdown-blob pr-card-art" transform="translate(${x} ${y})" opacity="0">
    ${prCardSurface(prefix, width, height)}
    <g class="pr-card-art-draft">
      ${prCardIcon(inset, 18, 26)}
      <text x="${inset}" y="${compact ? 68 : 72}" class="pr-card-art-title" style="font-size:${compact ? 21 : 26}px">Implement new upload API</text>
      <text x="${inset}" y="${copyY}" class="pr-card-art-copy" style="font-size:${compact ? 12.5 : 16}px">${description.map((line, index) => `<tspan x="${inset}" y="${copyY + index * lineHeight}">${line}</tspan>`).join("")}</text>
      ${prCardRule(inset, height - 42, width - inset * 2)}
      ${counts(inset, height - 18, totals.added, totals.removed, "start", 75)}
    </g>
    ${openingOpacity()}
  </g>`;
}

function desktop(id) {
  const prefix = `${id}-desktop`;
  const initialLayout = { x: 145, y: 144, width: 470, height: 316 };
  return `<svg class="pr-breakdown-svg pr-breakdown-desktop" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 605" role="img" aria-labelledby="${prefix}-title ${prefix}-description">
    <title id="${prefix}-title">One large pull request becomes four smaller reviews</title>
    <desc id="${prefix}-description">One undivided PR block gathers comments and rejection marks. Its bug fix, class refactor, foundational work, and feature appear one at a time, then move apart in place. Bug fix and refactor become parallel base PRs, foundational work sits above them, and the feature sits at the top. The comments and combined counter disappear. Each base PR is approved, its connector draws upward, and the next PR is approved after the connection arrives. Illustrative counts sum to 2,450 additions and 550 removals.</desc>
    ${definitions(prefix)}
    <g class="pr-breakdown-total" opacity="0">
      ${text(380, 64, "One huge PR", "pr-breakdown-stage")}
      ${openingOpacity()}
    </g>
    <g class="pr-breakdown-result" opacity="1">
      ${text(380, 64, "Four focused PRs", "pr-breakdown-stage")}
      ${opacity([[0, 0], [8.5, 0], [8.9, 1], [resetStart - .2, 1], [resetFadeEnd, 0], [cycle, 0]])}
    </g>
    <g class="pr-breakdown-dependencies" aria-hidden="true">
      ${connection("M284 424V402H380", 10.1, 10.75)}
      ${connection("M466 424V402H380", 10.7, 11.35)}
      ${connection("M380 402V382", 11.45, 11.8, "M375 388L380 382L385 388")}
      ${connection("M380 258V216", 12.3, 12.95, "M375 222L380 216L385 222")}
    </g>
    ${blob(prefix, initialLayout)}
    ${parts.map((part) => card(prefix, part)).join("")}
    ${prCardReviewMarks(initialLayout, comment, cross)}
  </svg>`;
}

function mobile(id) {
  const prefix = `${id}-mobile`;
  const initialLayout = { x: 18, y: 68, width: 324, height: 334, compact: true };
  const layouts = {
    bug: { width: 136, height: 82, from: [41, 258], to: [26, 334] },
    refactor: { width: 142, height: 82, from: [177, 258], to: [192, 334] },
    foundation: { width: 216, height: 70, from: [72, 188], to: [72, 181] },
    feature: { width: 138, height: 64, from: [111, 124], to: [111, 58] }
  };
  return `<svg class="pr-breakdown-svg pr-breakdown-mobile" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 470" role="img" aria-labelledby="${prefix}-title ${prefix}-description">
    <title id="${prefix}-title">One large pull request becomes four smaller reviews</title>
    <desc id="${prefix}-description">One undivided PR gathers comments and rejection marks. Its four parts appear one at a time, then move apart into a stack: bug fix and class refactor in parallel, foundational work above them, and feature at the top. The combined counter disappears and smaller counts and approval checks appear.</desc>
    ${definitions(prefix)}
    <g class="pr-breakdown-total" opacity="0">
      ${text(180, 28, "One huge PR", "pr-breakdown-stage")}
      ${openingOpacity()}
    </g>
    <g class="pr-breakdown-result" opacity="1">
      ${text(180, 28, "Four focused PRs", "pr-breakdown-stage")}
      ${opacity([[0, 0], [8.5, 0], [8.9, 1], [resetStart - .2, 1], [resetFadeEnd, 0], [cycle, 0]])}
    </g>
    <g class="pr-breakdown-dependencies" aria-hidden="true">
      ${connection("M94 322V291H180", 10.1, 10.75)}
      ${connection("M263 322V291H180", 10.7, 11.35)}
      ${connection("M180 291V263", 11.45, 11.8, "M175 269L180 263L185 269")}
      ${connection("M180 169V134", 12.3, 12.95, "M175 140L180 134L185 140")}
    </g>
    ${blob(prefix, initialLayout)}
    ${parts.map((part) => card(prefix, { ...part, ...layouts[part.key] }, true)).join("")}
    ${prCardReviewMarks(initialLayout, comment, cross)}
  </svg>`;
}

export function prBreakdown(id = "focused-prs") {
  if (!/^[a-z][a-z0-9-]*$/u.test(id)) throw new Error("prBreakdown needs a unique, simple HTML id.");
  return `<figure class="pr-breakdown" id="${id}" data-pr-breakdown aria-labelledby="${id}-heading">
    <div class="pr-breakdown-toolbar"><span id="${id}-heading" class="pr-breakdown-heading">Split the work before review</span>${prBoardToggle(id)}${prBoardProgress(duration)}</div>
    <div id="${id}-drawing" data-pr-breakdown-drawing>${desktop(id)}${mobile(id)}</div>
  </figure><script src="${assetUrl("/assets/scripts/pr-breakdown.js")}" defer></script>`.replace(/\n\s*/gu, "");
}
