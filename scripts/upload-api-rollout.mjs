import { assetUrl } from "./assets.mjs";
import { prBoardProgress, prBoardToggle, prCardDefinitions, prCardSurface, prCardIcon, prCardRule } from "./pr-card-art.mjs";

const ease = "0.35 0 0.2 1";
const hold = "0 0 1 1";
const resetStart = 19.4;
const resetEnd = 19.5;
const duration = resetEnd + .2;
const flagStart = 9.8;
const flagEnd = 10.1;

const parts = [
  { key: "flag", title: "Add API flag", detail: "Off by default", added: 65, removed: 0, reveal: 0, approved: 2.2 },
  { key: "validation", title: "PDF validation", detail: "PDF only · up to 15 MB", added: 180, removed: 12, reveal: 3.2, approved: 4.9 },
  { key: "handler", title: "Upload handler", detail: "Reuse legacy transport", added: 240, removed: 35, reveal: 3.2, approved: 4.9 },
  { key: "endpoint", title: "Connect endpoint", detail: "Existing auth middleware", added: 140, removed: 8, reveal: 6.05, approved: 8.3 }
];

const layouts = {
  desktop: {
    width: 760, height: 570,
    status: { x: 270, y: 16, width: 220, height: 84 },
    cards: {
      flag: { x: 269, y: 440, width: 222, height: 92 },
      validation: { x: 108, y: 288, width: 230, height: 92 },
      handler: { x: 422, y: 288, width: 230, height: 92 },
      endpoint: { x: 260, y: 136, width: 240, height: 92 }
    },
    routes: [
      { path: "M380 428V410", start: 2.55, end: 2.72 },
      { path: "M380 410H223V392", start: 2.73, end: 3.13, tip: "M218 398L223 392L228 398" },
      { path: "M380 410H537V392", start: 2.73, end: 3.13, tip: "M532 398L537 392L542 398" },
      { path: "M223 276V254H380", start: 5.25, end: 5.75 },
      { path: "M537 276V254H380", start: 5.25, end: 5.75 },
      { path: "M380 254V240", start: 5.78, end: 6, tip: "M375 246L380 240L385 246" }
    ]
  },
  mobile: {
    width: 360, height: 558,
    status: { x: 102, y: 14, width: 156, height: 76 },
    cards: {
      flag: { x: 78, y: 434, width: 204, height: 88 },
      validation: { x: 16, y: 278, width: 156, height: 88 },
      handler: { x: 188, y: 278, width: 156, height: 88 },
      endpoint: { x: 78, y: 126, width: 204, height: 84 }
    },
    routes: [
      { path: "M180 422V400", start: 2.55, end: 2.72 },
      { path: "M180 400H94V378", start: 2.73, end: 3.13, tip: "M89 384L94 378L99 384" },
      { path: "M180 400H266V378", start: 2.73, end: 3.13, tip: "M261 384L266 378L271 384" },
      { path: "M94 266V242H180", start: 5.25, end: 5.75 },
      { path: "M266 266V242H180", start: 5.25, end: 5.75 },
      { path: "M180 242V222", start: 5.78, end: 6, tip: "M175 228L180 222L185 228" }
    ]
  }
};

function timing(frames) {
  return `keyTimes="${frames.map(([at]) => at / duration).join(";")}" keySplines="${frames.slice(1).map((frame, index) => frame[1] === frames[index][1] ? hold : ease).join(";")}" calcMode="spline" dur="${duration}s" repeatCount="indefinite" begin="indefinite"`;
}

function animate(attribute, frames) {
  return `<animate attributeName="${attribute}" values="${frames.map(([, value]) => value).join(";")}" ${timing(frames)}/>`;
}

function sceneOpacity() {
  return animate("opacity", [[0, 0], [.35, 1], [18.8, 1], [19.3, 0], [duration, 0]]);
}

function reveal(at) {
  return animate("opacity", [[0, 0], [at, 0], [at + .25, 1], [resetStart, 1], [resetEnd, 0], [duration, 0]]);
}

function check(part, { width, height }) {
  return `<g class="pr-breakdown-check" data-upload-rollout-check="${part.key}" transform="translate(${width - 18} ${height - 17})" opacity="1" aria-hidden="true">
    <circle r="8"/><path d="M-4 0L-1 3L4.5-3.5"/>
    ${reveal(part.approved)}
  </g>`;
}

function card(prefix, part, geometry, compact) {
  const { x, y, width, height } = geometry;
  const narrow = compact && width < 180;
  const titleSize = compact ? (narrow ? 17 : 18) : 21;
  const detailSize = compact ? 12 : 15;
  return `<g class="pr-card-art upload-rollout-card" data-upload-rollout-pr="${part.key}" transform="translate(${x} ${y})" opacity="1">
    ${part.reveal ? reveal(part.reveal) : ""}
    ${prCardSurface(prefix, width, height)}
    <text x="12" y="${compact ? 26 : 29}" class="pr-card-art-title" text-anchor="start" style="font-size:${titleSize}px">${part.title}</text>
    <text x="12" y="${compact ? 45 : 49}" class="pr-card-art-copy upload-rollout-card-detail" text-anchor="start" style="font-size:${detailSize}px">${part.detail}</text>
    ${prCardRule(12, height - 30, width - 24)}
    ${prCardIcon(12, height - 25, 15)}
    <g class="pr-breakdown-part-counts${narrow ? " pr-card-art-narrow-counts" : ""}"><text x="34" y="${height - 11}" class="pr-breakdown-count pr-card-art-count" text-anchor="start"><tspan class="pr-breakdown-added">+${part.added}</tspan><tspan dx="12" class="pr-breakdown-removed">−${part.removed}</tspan></text></g>
    ${check(part, geometry)}
  </g>`;
}

function connection({ path, start, end, tip }) {
  const progress = [[0, 1], [start, 1], [end, 0], [resetStart, 0], [resetEnd, 1], [duration, 1]];
  return `<g class="pr-breakdown-connection" opacity="1" aria-hidden="true">
    ${animate("opacity", [[0, 0], [start, 0], [start + .03, 1], [resetStart, 1], [resetEnd, 0], [duration, 0]])}
    <path d="${path}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0" stroke-linecap="round">${animate("stroke-dashoffset", progress)}</path>
    ${tip ? `<path d="${tip}" opacity="1">${animate("opacity", [[0, 0], [end, 0], [end + .05, 1], [resetStart, 1], [resetEnd, 0], [duration, 0]])}</path>` : ""}
  </g>`;
}

function statusFrame(width, height) {
  return `<path class="upload-rollout-status-frame" d="M10 1.5Q${width / 2} .7 ${width - 10} 1.5Q${width - 1.5} 1.5 ${width - 1.5} 10L${width - 1} ${height - 10}Q${width - 1} ${height - 1.5} ${width - 10} ${height - 1.5}L10 ${height - 1}Q1.5 ${height - 1} 1.5 ${height - 10}L1 10Q1 1.5 10 1.5Z"/>`;
}

function newStatus(status, compact) {
  return `<g class="upload-rollout-new" transform="translate(${status.x} ${status.y})">
    ${statusFrame(status.width, status.height)}
    <text x="14" y="25" class="upload-rollout-status-title" text-anchor="start" style="font-size:${compact ? 16 : 18}px">New upload API</text>
    <g class="upload-rollout-flag" aria-label="New upload API availability flag">
      <rect x="14" y="42" width="42" height="22" rx="11" class="upload-rollout-flag-track"/>
      <rect x="14" y="42" width="42" height="22" rx="11" class="upload-rollout-flag-track-on" opacity="1">
        ${animate("opacity", [[0, 0], [flagStart, 0], [flagEnd, 1], [resetStart, 1], [resetEnd, 0], [duration, 0]])}
      </rect>
      <circle cx="45" cy="53" r="8" class="upload-rollout-flag-knob">
        ${animate("cx", [[0, 25], [flagStart, 25], [flagEnd, 45], [resetStart, 45], [resetEnd, 25], [duration, 25]])}
      </circle>
      <text x="67" y="58" class="upload-rollout-flag-label" text-anchor="start" style="font-size:${compact ? 13 : 15}px" opacity="0">FLAG OFF
        ${animate("opacity", [[0, 1], [flagStart, 1], [9.95, 0], [resetStart, 0], [resetEnd, 1], [duration, 1]])}
      </text>
      <text x="67" y="58" class="upload-rollout-flag-label" text-anchor="start" style="font-size:${compact ? 13 : 15}px" opacity="1">FLAG ON
        ${animate("opacity", [[0, 0], [9.95, 0], [flagEnd, 1], [resetStart, 1], [resetEnd, 0], [duration, 0]])}
      </text>
    </g>
  </g>`;
}

function drawing(id, layout) {
  const prefix = `${id}-${layout}`;
  const compact = layout === "mobile";
  const { width, height, status, cards, routes } = layouts[layout];
  return `<svg class="pr-breakdown-svg pr-breakdown-${layout} upload-rollout-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${prefix}-title ${prefix}-description">
    <title id="${prefix}-title">Four tested pull requests enable the upload API</title>
    <desc id="${prefix}-description">A separate availability flag keeps the new upload API off while the work is reviewed. First add the flag, off by default. PDF validation and the upload handler can then be built and reviewed in parallel, accepting PDFs up to 15 MB and reusing the legacy transport. Finally connect the endpoint through the existing authentication middleware. Every PR includes tests. Approval checks and upward arrows show the dependencies. Enable the new API only after all four PRs are approved.</desc>
    <defs>${prCardDefinitions(prefix)}</defs>
    <g class="upload-rollout-sequence" opacity="1">
      ${sceneOpacity()}
      ${newStatus(status, compact)}
      <g class="pr-breakdown-dependencies">${routes.map(connection).join("")}</g>
      ${parts.map((part) => card(prefix, part, cards[part.key], compact)).join("")}
    </g>
  </svg>`;
}

export function uploadApiRollout(id = "upload-api-rollout") {
  if (!/^[a-z][a-z0-9-]*$/u.test(id)) throw new Error("uploadApiRollout needs a unique, simple HTML id.");
  return `<figure class="pr-breakdown upload-rollout" id="${id}" data-pr-breakdown aria-labelledby="${id}-heading">
    <div class="pr-breakdown-toolbar"><span id="${id}-heading" class="pr-breakdown-heading">Build behind a feature flag</span>${prBoardToggle(id)}${prBoardProgress(duration)}</div>
    <div id="${id}-drawing" data-pr-breakdown-drawing>${drawing(id, "desktop")}${drawing(id, "mobile")}</div>
  </figure><script src="${assetUrl("/assets/scripts/pr-breakdown.js")}" defer></script>`.replace(/\n\s*/gu, "");
}
