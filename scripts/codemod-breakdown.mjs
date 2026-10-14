import { assetUrl } from "./assets.mjs";
import { prBoardProgress, prBoardToggle, prCardDefinitions, prCardSurface, prCardIcon, prCardRule, prCardReviewMarks } from "./pr-card-art.mjs";

const splitStart = 8.3;
const splitEnd = 10.5;
const resetStart = 23;
const resetFadeEnd = resetStart + .2;
const resetEnd = resetStart + .4;
const cycle = resetEnd + .7;
const ease = "0.35 0 0.2 1";
const hold = "0 0 1 1";
// Hold the opening card for four extra seconds after its review marks arrive.
const openingHold = 4;
const duration = cycle + openingHold;
const cardHeight = 66;
const sourceTop = 67;
const footerY = 516;
const drawingHeight = 530;
const parts = [
  { key: "interface", label: "1 · Add interface + tests", changed: 600, desktopWidth: 252, mobileWidth: 216, y: 422, approved: 11 },
  { key: "codemod", label: "2 · Add codemod + tests", changed: 400, desktopWidth: 256, mobileWidth: 224, y: 306, approved: 12.15 },
  { key: "first-batch", label: "3 · First batch", mobileLabel: "Batch 1", changed: 9600, desktopWidth: 204, mobileWidth: 104, desktopCenter: 148, mobileCenter: 62, y: 190, approved: 13.65 },
  { key: "second-batch", label: "4 · Second batch", mobileLabel: "Batch 2", changed: 9600, desktopWidth: 204, mobileWidth: 104, desktopCenter: 380, mobileCenter: 180, y: 190, approved: 13.65 },
  { key: "third-batch", label: "5 · Third batch", mobileLabel: "Batch 3", changed: 9400, desktopWidth: 204, mobileWidth: 104, desktopCenter: 612, mobileCenter: 298, y: 190, approved: 13.65 },
  { key: "cleanup", label: "6 · Drop codemod + old API", changed: 400, desktopWidth: 296, mobileWidth: 256, y: 74, approved: 15.15 }
].map((part, index) => ({ ...part, reveal: 2.6 + index * .9 }));
const breakdownStart = parts[0].reveal;
const actionEnd = Math.max(...parts.map((part) => part.approved + .25));
// Quicken the split and review sequence, then keep the extra time as a final hold.
// Opening, closing fades, and the complete loop duration stay unchanged.
function actionTime(at) {
  return at >= splitStart && at <= actionEnd ? splitStart + (at - splitStart) * .7 : at;
}

const number = (value) => value.toLocaleString("en-US");
const text = (x, y, value, className, anchor = "middle", attributes = "") => `<text x="${x}" y="${y}" class="${className}" text-anchor="${anchor}" ${attributes}>${value}</text>`;

function timing(frames, shiftOpening = true) {
  return `keyTimes="${frames.map(([at]) => (shiftOpening && at > 0 ? actionTime(at) + openingHold : at) / duration).join(";")}" keySplines="${frames.slice(1).map((frame, index) => frame[1] === frames[index][1] ? hold : ease).join(";")}" calcMode="spline" dur="${duration}s" repeatCount="indefinite" begin="indefinite"`;
}

function opacity(frames, shiftOpening = true) {
  return `<animate attributeName="opacity" values="${frames.map(([, value]) => value).join(";")}" ${timing(frames, shiftOpening)}/>`;
}

function openingOpacity() {
  return opacity([[0, 1], [2.4, 1], [2.6, 0], [resetEnd + .1, 0], [resetEnd + .5, 1], [cycle, 1]]);
}

function definitions(prefix) {
  return `<defs>
    ${prCardDefinitions(prefix)}
  </defs>`;
}

function card(prefix, part, index, { center, compact }) {
  const width = compact ? part.mobileWidth : part.desktopWidth;
  const destinationCenter = (compact ? part.mobileCenter : part.desktopCenter) ?? center;
  const narrow = compact && Boolean(part.mobileLabel);
  const band = parts.length - index - 1;
  const from = `${center - width / 2} ${sourceTop + band * cardHeight}`;
  const to = `${destinationCenter - width / 2} ${part.y}`;
  const motion = [[0, from], [splitStart, from], [splitEnd, to], [resetFadeEnd + .05, to], [resetEnd, from], [cycle, from]];
  const titleClass = compact ? "pr-card-art-title pr-card-art-mobile-title" : "pr-card-art-title";
  return `<g class="pr-breakdown-card pr-card-art" data-pr-part="${part.key}" transform="translate(${to})">
    <animateTransform attributeName="transform" type="translate" values="${motion.map(([, value]) => value).join(";")}" ${timing(motion)}/>
    ${opacity([[0, 0], [part.reveal, 0], [part.reveal + .25, 1], [resetStart - .2, 1], [resetFadeEnd, 0], [cycle, 0]])}
    ${prCardSurface(prefix, width, cardHeight)}
    <g class="codemod-card-content">
      ${text(narrow ? 8 : 12, compact ? 22 : 23, narrow ? part.mobileLabel : part.label, titleClass, "start")}
      ${prCardRule(narrow ? 8 : 12, 35, width - (narrow ? 16 : 24))}
      ${prCardIcon(narrow ? 8 : 13, narrow ? 44 : 42, narrow ? 12 : 17)}
      ${text(narrow ? 26 : 38, 55, narrow ? `${part.changed / 1000}k lines` : `${number(part.changed)} lines changed`, "pr-card-art-count pr-breakdown-added", "start", narrow ? 'style="font-size:12px"' : "")}
    </g>
    <g class="pr-breakdown-check" transform="translate(${width - (narrow ? 12 : 22)} 49)" opacity="1" aria-hidden="true"><circle r="${narrow ? 7 : 9.5}"/><path d="${narrow ? "M-3.5 0L-1 2.5L4-3.5" : "M-5 0L-1 4L6-5"}"/>
      ${opacity([[0, 0], [part.approved, 0], [part.approved + .25, 1], [resetFadeEnd, 1], [resetFadeEnd + .05, 0], [cycle, 0]])}
    </g>
  </g>`;
}

function blob(prefix, { x, y, width, height, compact }) {
  const titleClass = compact ? "pr-card-art-title pr-card-art-mobile-title" : "pr-card-art-title";
  return `<g class="pr-breakdown-blob pr-card-art" transform="translate(${x} ${y})" opacity="0">
    ${prCardSurface(prefix, width, height)}
    <g>
      ${prCardIcon(24, 20, 28)}
      ${text(24, 75, "New interface", titleClass, "start")}${text(24, 101, "+ every caller", titleClass, "start")}
      ${text(24, 128, "A seamless, future-proof update.", "pr-card-art-copy", "start")}
      ${text(24, 151, "Modernize the entire codebase.", "pr-card-art-copy", "start")}
      ${prCardRule(24, 173, width - 48)}
      ${text(24, 198, "30,000 lines changed", "pr-card-art-count pr-breakdown-added", "start")}
      ${text(24, 221, "700 files changed", "pr-card-art-count pr-breakdown-added", "start")}
    </g>
    ${openingOpacity()}
  </g>`;
}

function comment(x, y, start) {
  return `<g class="pr-breakdown-comment" transform="translate(${x} ${y})" opacity="0" aria-hidden="true">
    <path d="M0 0H36V25H18L9 33V25H0Z"/><path class="pr-breakdown-comment-lines" d="M8 8H27M8 16H21"/>
    ${opacity([[0, 0], [start, 0], [start + .3, 1], [breakdownStart + openingHold - .3, 1], [breakdownStart + openingHold, 0], [duration, 0]], false)}
  </g>`;
}

function cross(x, y, start) {
  return `<g class="pr-breakdown-cross" transform="translate(${x} ${y})" opacity="0" aria-hidden="true"><circle r="14"/><path d="M-5-5L5 5M5-5L-5 5"/>
    ${opacity([[0, 0], [start, 0], [start + .2, 1], [breakdownStart + openingHold - .3, 1], [breakdownStart + openingHold, 0], [duration, 0]], false)}
  </g>`;
}

function connector({ from, to, path, start, end, tip }) {
  const draw = [[0, 1], [start, 1], [end, 0], [resetFadeEnd + .05, 0], [resetEnd, 1], [cycle, 1]];
  return `<g class="pr-breakdown-dependency" data-pr-from="${from}" data-pr-to="${to}" opacity="1" aria-hidden="true">
    <path class="pr-breakdown-link" d="${path}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0">
      <animate attributeName="stroke-dashoffset" values="${draw.map(([, value]) => value).join(";")}" ${timing(draw)}/>
    </path>
    ${tip ? `<path class="pr-breakdown-arrow-tip" d="M${tip.x - 4} ${tip.y + 5}L${tip.x} ${tip.y}L${tip.x + 4} ${tip.y + 5}">
      ${opacity([[0, 0], [end, 0], [end + .05, 1], [resetFadeEnd, 1], [resetFadeEnd + .05, 0], [cycle, 0]])}
    </path>` : ""}
    ${opacity([[0, 0], [start, 0], [start + .05, 1], [resetStart - .2, 1], [resetFadeEnd, 0], [cycle, 0]])}
  </g>`;
}

function drawing(id, compact) {
  const prefix = `${id}-${compact ? "mobile" : "desktop"}`;
  const center = compact ? 180 : 380;
  const layout = { center, compact };
  const initialLayout = { ...layout, x: center - 140, width: 280, height: 242, y: sourceTop + (parts.length * cardHeight - 242) / 2 };
  const width = compact ? 360 : 760;
  const batches = parts.filter((part) => part.mobileLabel);
  const connectors = [
    { from: "interface", to: "codemod", path: `M${center} 414V380`, start: 11.35, end: 12, tip: { x: center, y: 380 } },
    { from: "codemod", to: "batch-fork", path: `M${center} 298V282`, start: 12.5, end: 12.75 },
    ...batches.map((part) => {
      const targetCenter = compact ? part.mobileCenter : part.desktopCenter;
      return { from: "batch-fork", to: part.key, path: `M${center} 282H${targetCenter}V264`, start: 12.85, end: 13.5, tip: { x: targetCenter, y: 264 } };
    }),
    ...batches.map((part) => {
      const sourceCenter = compact ? part.mobileCenter : part.desktopCenter;
      return { from: part.key, to: "batch-join", path: `M${sourceCenter} 182V166H${center}`, start: 14, end: 14.65 };
    }),
    { from: "batch-join", to: "cleanup", path: `M${center} 166V148`, start: 14.75, end: 15, tip: { x: center, y: 148 } }
  ].map(connector).join("");
  const decorations = prCardReviewMarks(initialLayout, comment, cross);
  return `<svg class="pr-breakdown-svg pr-breakdown-${compact ? "mobile" : "desktop"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${drawingHeight}" role="img" aria-labelledby="${prefix}-title ${prefix}-description">
    <title id="${prefix}-title">One large interface migration becomes six focused pull requests</title>
    <desc id="${prefix}-description">One undivided pull request changes 30,000 lines across 700 files to introduce a new interface for a widely used method. Its six parts move into four tiers. Read bottom to top: add the new interface and tests; add the codemod and tests; apply first, second, and third batches in parallel; remove the codemod and deprecated interface after all batches finish. Individual changed-line counts sum to 30,000. Approvals send connectors upward, branching into the three parallel batches and joining before cleanup. Counts are illustrative; files can recur between PRs.</desc>
    ${definitions(prefix)}
    <g class="pr-breakdown-total" opacity="0">
      ${text(center, 28, "One huge migration PR", "pr-breakdown-stage")}
      ${openingOpacity()}
    </g>
    <g class="pr-breakdown-result" opacity="1">${text(center, 28, "Six focused PRs", "pr-breakdown-stage")}
      ${opacity([[0, 0], [splitEnd, 0], [splitEnd + .4, 1], [resetStart - .2, 1], [resetFadeEnd, 0], [cycle, 0]])}
    </g>
    <g class="pr-breakdown-dependencies">${connectors}</g>
    ${blob(prefix, initialLayout)}${parts.map((part, index) => card(prefix, part, index, layout)).join("")}
    ${decorations}
    <g opacity="1">${text(center, footerY, "Three batches reviewed in parallel", "pr-breakdown-detail")}
      ${opacity([[0, 0], [splitEnd, 0], [splitEnd + .4, 1], [resetStart - .2, 1], [resetFadeEnd, 0], [cycle, 0]])}
    </g>
  </svg>`;
}

export function codemodBreakdown(id = "codemod-migration") {
  if (!/^[a-z][a-z0-9-]*$/u.test(id)) throw new Error("codemodBreakdown needs a unique, simple HTML id.");
  return `<figure class="pr-breakdown codemod-breakdown" id="${id}" data-pr-breakdown aria-labelledby="${id}-heading">
    <div class="pr-breakdown-toolbar"><span id="${id}-heading" class="pr-breakdown-heading">Review the migration in stages</span>${prBoardToggle(id)}${prBoardProgress(duration)}</div>
    <div id="${id}-drawing" data-pr-breakdown-drawing>${drawing(id, false)}${drawing(id, true)}</div>
  </figure><script src="${assetUrl("/assets/scripts/pr-breakdown.js")}" defer></script>`.replace(/\n\s*/gu, "");
}
