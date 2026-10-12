// Portable resolver for the bundled reference. Use the target site's asset pipeline in production.
const bundledAssets = new Map([
  ["/assets/illustrations/mimir-user-editorial.webp", "./user.webp"],
  ["/assets/logos/pi-supplied.png", "./pi-logo.png"],
  ["/assets/scripts/mimir-pipeline.js", "./controller.js"],
]);
const assetUrl = (path) => {
  const url = bundledAssets.get(path);
  if (!url) throw new Error(`Unbundled reference asset: ${path}`);
  return url;
};

const cycle = 28;
// Core Animation's .easeInEaseOut, shared by movement and soft arrivals.
const appleEase = "0.42 0 0.58 1";
const holdEase = "0 0 1 1";
const requestColors = { email: "#A3372D", calendar: "#916031" };
const title = "Mimir, Pi, and Hermes: requests and synchronization";
const description = "A user sends a request to Mimir. Pi runs the local agent with Qwen3.5, calls Hermes’s read-only tools, and returns sources and an answer through Mimir. Hermes searches email in SQLite using text and vector indexes, and queries separate calendar mirrors. Proton Mail Bridge feeds the mail sync and local embedding process. Calendar sync updates the ICS mirrors independently.";

const label = (x, y, text, className = "pipeline-label") =>
  `<text x="${x}" y="${y}" class="${className}" text-anchor="middle">${text}</text>`;

// Objects use cut-paper silhouettes, with lettering kept outside the artwork.
function ink(prefix, path, className) {
  return `<path class="${className}" d="${path}"/><path d="${path}" fill="url(#${prefix}-grain)" pointer-events="none"/>`;
}

function illustration(prefix, kind) {
  const mark = (path, pigment = "pipeline-carbon") => ink(prefix, path, pigment);
  switch (kind) {
    case "phone":
      return `${mark("M44 8L117 4L124 145L43 148Z", "pipeline-shadow")}
        ${mark("M40 3Q76-4 113 1L120 137Q82 145 39 140L36 15Z")}
        ${mark("M46 14L106 12L111 126L46 130Z", "pipeline-stock")}
        ${mark("M46 15L107 13L108 33L47 34Z", "pipeline-olive")}
        <path class="pipeline-carve" d="M66 23L87 23M70 135L89 134"/>
        ${mark("M56 44L97 42L98 63L88 64L82 72L83 64L57 66Z", "pipeline-terra")}
        <path class="pipeline-token-carve" d="M63 52L89 51M64 58L80 57"/>
        ${mark("M56 82L98 79L100 113L57 116Z", "pipeline-pale")}
        <path class="pipeline-ink-line" d="M64 88L88 86M65 95L93 93M65 102L83 101"/>
        ${mark("M94 109L102 108L101 117L93 118Z", "pipeline-terra")}`;
    case "catalogue":
      return `${mark("M9 42L139 30L154 112L13 117Z", "pipeline-shadow")}
        ${mark("M20 5L114 0L120 32L17 41Z", "pipeline-pale")}
        ${mark("M37 0L137 8L129 36L27 34Z", "pipeline-stock")}
        <path class="pipeline-ink-line" d="M50 13L108 16M49 20L87 23"/>
        ${mark("M9 33L130 25L148 105L11 113Z", "pipeline-olive")}
        ${mark("M130 25L152 36L157 104L148 105Z")}
        ${mark("M19 46L127 39L132 64L20 72Z", "pipeline-dark-olive")}
        ${mark("M21 80L135 72L139 99L23 106Z", "pipeline-dark-olive")}
        ${mark("M67 48L93 46L94 57L68 59Z", "pipeline-stock")}
        ${mark("M72 82L100 81L101 93L73 95Z", "pipeline-stock")}
        <path class="pipeline-ink-line" d="M77 52L85 52M82 88L90 87"/>
        <path class="pipeline-carve" d="M25 38L114 32M30 109L118 103"/>`;
    case "bridge":
      return `${mark("M5 70L159 68L157 104L118 105Q114 68 82 70Q47 73 45 108L7 108Z", "pipeline-shadow")}
        ${mark("M3 58L151 54L153 88L117 89Q112 55 80 58Q45 61 41 93L5 95Z", "pipeline-olive")}
        ${mark("M6 88L40 87L37 103L9 105ZM118 82L151 80L156 96L120 100Z", "pipeline-dark-olive")}
        <path class="pipeline-carve" d="M13 67L138 63M15 78L37 76M121 72L141 71"/>
        <g transform="rotate(-13 48 32)">${mark("M20 12L73 10L76 49L22 52Z", "pipeline-stock")}<path class="pipeline-ink-line" d="M22 15L48 34L73 13M24 47L40 31M71 46L55 31"/></g>
        <g transform="rotate(9 115 22)">${mark("M91 2L143 4L141 41L89 39Z", "pipeline-terra")}<path class="pipeline-token-carve" d="M92 7L115 24L139 9M93 35L107 22M137 35L122 23"/></g>`;
    case "indexer":
      return `${mark("M13 47L141 40L155 113L11 111Z", "pipeline-shadow")}
        ${mark("M12 55L146 50L145 104L11 109Z", "pipeline-dark-olive")}
        ${mark("M16 10L62 3L78 71L27 79Z", "pipeline-stock")}
        <path class="pipeline-ink-line" d="M26 22L55 17M28 31L62 26M31 41L58 36M34 51L52 47"/>
        ${mark("M65 15L113 11L118 76L67 81Z", "pipeline-pale")}
        <path class="pipeline-ink-line" d="M76 29L102 26M77 40L107 37M78 51L99 49"/>
        ${mark("M11 73L147 65L150 106L14 111Z", "pipeline-olive")}
        ${mark("M49 83L102 79L104 97L51 101Z", "pipeline-stock")}
        <path class="pipeline-ink-line" d="M59 91L94 88"/>
        ${[0,1,2,3].map(i => mark(`M${121+i%2*13} ${17+Math.floor(i/2)*14}l8-1l1 8l-8 1Z`, "pipeline-terra")).join("")}`;
    case "calendar-sync":
      return `${mark("M28 5L137 1L134 109L27 113Z", "pipeline-shadow")}
        ${mark("M24 3L133 0L129 103L21 109Z", "pipeline-stock")}
        ${mark("M24 3L133 0L132 28L23 31Z", "pipeline-terra")}
        <path class="pipeline-ring" d="M45-3L44 14M107-5L106 12"/>
        <path class="pipeline-calendar-grid" d="M42 49L111 46M41 67L110 64M40 85L109 82M62 38L60 94M86 36L84 92"/>
        ${mark("M65 51L83 50L81 64L63 66Z", "pipeline-olive")}
        ${mark("M101 87L136 68L126 103L93 115Z", "pipeline-pale")}
        <path class="pipeline-ink-line" d="M100 107L125 85M119 85L126 83L125 91"/>`;
    case "model":
      return `${mark("M20 14L145 5L157 111L20 119Z", "pipeline-shadow")}
        ${mark("M12 7L132 1L142 102L16 111Z", "pipeline-olive")}
        ${mark("M3 16L123 8L135 108L9 119Z")}
        <path class="pipeline-carve" d="M17 31L104 25M20 100L117 91M24 106L119 98"/>
        <text x="66" y="80" class="pipeline-model-mark" text-anchor="middle">9B</text>
        ${mark("M106 7L125 6L126 31L112 41Z", "pipeline-terra")}`;
    default: throw new Error(`Missing pipeline illustration: ${kind}`);
  }
}

function system(prefix, { x, y, w, lines, detail, kind }) {
  const scale = Math.min(w / 160, 1.1);
  const height = kind === "phone" ? 148 : kind === "model" ? 119 : 113;
  const textY = y + height * scale + 24;
  return `<g class="pipeline-system pipeline-object-${kind}">
    <g transform="translate(${x + w / 2 - 80 * scale} ${y}) scale(${scale})">${illustration(prefix, kind)}</g>
    ${lines.map((line, i) => label(x + w / 2, textY + i * 24, line, "pipeline-title")).join("")}
    ${detail.map((line, i) => label(x + w / 2, textY + lines.length * 24 + i * 19, line, "pipeline-detail")).join("")}
  </g>`;
}

function user(prefix, cx, cy) {
  return `<g class="pipeline-user" transform="translate(${cx} ${cy})">
    <image class="pipeline-user-portrait" href="${assetUrl("/assets/illustrations/mimir-user-editorial.webp")}" x="-54" y="-78" width="108" height="162" preserveAspectRatio="xMidYMid meet" aria-hidden="true"/>
  </g>`;
}

function harness(prefix, { x, y, w, h }) {
  const sx = w / 212, sy = h / 210;
  return `<g class="pipeline-harness" transform="translate(${x} ${y}) scale(${sx} ${sy})">
    ${ink(prefix, "M48 183Q111 177 170 184L173 189Q111 194 45 188Z", "pipeline-shadow")}
    ${ink(prefix, "M85 146L92 145L93 173L86 174ZM124 145L131 145L132 172L125 172Z", "pipeline-carbon")}
    ${ink(prefix, "M80 164L98 164L100 180L81 183ZM122 164L141 165L143 181L123 180Z", "pipeline-dark-olive")}
    ${ink(prefix, "M51 185Q58 171 83 170L98 178L99 187L50 190ZM121 177L142 170Q164 172 173 186L171 190L120 188Z", "pipeline-carbon")}
    ${ink(prefix, "M57 184Q66 175 83 175L93 181L92 184ZM126 180L143 175Q157 176 166 184L128 184Z", "pipeline-olive")}
    <path class="pipeline-carve" d="M59 187L90 185M130 187L164 188M85 167L95 167M125 168L138 168"/>
    ${ink(prefix, "M83 129L134 128L135 145L84 146Z", "pipeline-carbon")}
    <path class="pipeline-carve" d="M95 135L100 144M106 135L107 144M119 135L115 145"/>
    ${ink(prefix, "M78 139Q110 134 140 138L146 145L139 152L79 152L73 147Z", "pipeline-dark-olive")}
    <path class="pipeline-ink-line" d="M87 141L88 149M135 141L135 149"/>
    ${ink(prefix, "M66 103L73 106L61 129L54 126ZM143 105L149 102L167 129L161 132Z", "pipeline-carbon")}
    ${ink(prefix, "M50 123L64 127L61 136L46 132ZM159 127L173 123L177 134L163 139Z", "pipeline-dark-olive")}
    ${ink(prefix, "M47 133L60 137L56 150L43 147ZM164 139L176 135L181 149L167 153Z", "pipeline-olive")}
    ${ink(prefix, "M43 145L48 147L46 154L49 157L52 150L57 151L53 161L46 160L39 153ZM168 149L172 150L177 158L180 155L177 149L182 146L186 155L182 161L175 162Z", "pipeline-carbon")}
    ${ink(prefix, "M63 100Q62 89 74 89Q86 91 85 101Q82 114 71 113Q62 111 63 100ZM132 101Q133 91 143 93Q154 94 154 104Q152 115 141 114Q131 113 132 101Z", "pipeline-carbon")}
    ${ink(prefix, "M68 99Q68 94 74 94Q81 95 80 101Q79 108 73 108Q67 107 68 99ZM137 102Q137 97 143 98Q149 98 149 104Q148 109 142 109Q136 108 137 102Z", "pipeline-dark-olive")}
    ${ink(prefix, "M71 99L76 98L77 104L71 105ZM140 101L145 101L145 105L140 106Z", "pipeline-terra")}
    ${ink(prefix, "M101 81L121 80L124 98L100 100Z", "pipeline-carbon")}
    <path class="pipeline-carve" d="M103 91L120 91"/>
    ${ink(prefix, "M75 94Q109 88 144 94L144 129L132 139L86 135L75 122Z", "pipeline-shadow")}
    ${ink(prefix, "M73 93Q108 88 141 94L138 128L129 136L85 132L76 121Z", "pipeline-carbon")}
    ${ink(prefix, "M80 97L136 97L132 126L124 133L89 129L81 120Z", "pipeline-dark-olive")}
    <image class="pipeline-pi-logo" href="${assetUrl("/assets/logos/pi-supplied.png")}" x="94" y="99" width="38" height="35.15" preserveAspectRatio="xMidYMid meet"/>
    <path class="pipeline-carve" d="M84 101L86 116M132 128L127 132"/>
    <g class="pipeline-robot-head" transform="translate(13 -10) scale(.88 1.12)">
      <path class="pipeline-ink-line" d="M132 21Q154-4 166 12Q183 29 170 48"/>
      ${ink(prefix, "M48 48Q47 12 107 5Q162 4 173 43Q187 73 148 91Q76 99 53 75Z", "pipeline-shadow")}
      ${ink(prefix, "M45 47Q45 11 105 5Q161 4 171 43Q182 73 144 88Q77 98 51 74Z", "pipeline-carbon")}
      ${ink(prefix, "M50 47Q52 17 106 11Q153 10 165 44L163 65Q116 82 60 73Z", "pipeline-olive")}
      ${ink(prefix, "M55 69Q106 81 164 62Q164 80 141 85Q88 95 61 77Z", "pipeline-dark-olive")}
      ${ink(prefix, "M94 10L119 9L129 24L102 26Z", "pipeline-dark-olive")}
      <path class="pipeline-carve" d="M99 13L117 13M125 22Q139 47 130 67L124 84M67 79Q99 90 127 84"/>
      ${ink(prefix, "M64 53Q63 35 82 33Q103 32 106 53Q107 75 85 78Q65 79 64 53Z", "pipeline-carbon")}
      ${ink(prefix, "M69 53Q68 40 82 39Q98 37 100 54Q100 71 84 72Q69 72 69 53Z", "pipeline-dark-olive")}
      ${ink(prefix, "M75 53Q74 44 84 44Q94 43 95 54Q95 66 84 67Q75 67 75 53Z", "pipeline-stock")}
      <path class="pipeline-ink-line" d="M78 59L89 48M82 62L92 53"/>
      ${ink(prefix, "M143 51Q142 38 153 36Q166 35 169 49Q171 66 157 70Q143 70 143 51Z", "pipeline-carbon")}
      ${ink(prefix, "M147 51Q147 41 155 41Q163 40 164 51Q165 62 156 64Q147 64 147 51Z", "pipeline-dark-olive")}
      ${ink(prefix, "M151 51Q151 45 156 45Q161 45 161 52Q161 59 156 59Q151 59 151 51Z", "pipeline-stock")}
      ${ink(prefix, "M165 42L171 43L173 49L167 52Z", "pipeline-terra")}
    </g>
    ${label(108, 202, "Pi · Agent harness", "pipeline-harness-label")}
  </g>`;
}

function database(prefix, { x, y, w }) {
  const scale = w / 168;
  return `<g class="pipeline-database" transform="translate(${x} ${y}) scale(${scale})">
    ${ink(prefix, "M6 30Q93 3 167 29L173 150Q81 183 7 158Z", "pipeline-shadow")}
    ${ink(prefix, "M3 27L164 26L165 148Q88 181 4 153Z", "pipeline-dark-olive")}
    ${ink(prefix, "M3 28Q-4 4 84 0Q168-2 164 26Q154 53 79 52Q14 50 3 28Z", "pipeline-olive")}
    <path class="pipeline-db-carve" d="M8 73Q88 100 160 69M8 114Q86 140 160 111"/>
    ${ink(prefix, "M27 28L99 16L127 31L53 43Z", "pipeline-stock")}
    <path class="pipeline-ink-line" d="M50 31L89 24M62 35L105 28"/>
    <g class="pipeline-embeddings" opacity=".45">
      ${[0,1,2,3,4,5].map(i=>`<path d="M${45+i*13} 142l5-1l1 5l-5 1Z" class="pipeline-vector-dot"/>`).join("")}
      <animate begin="indefinite" attributeName="opacity" values=".45;.45;1;.45" keyTimes="0;.72;.85;1" keySplines="${holdEase};${appleEase};${appleEase}" calcMode="spline" dur="11s" repeatCount="indefinite"/>
    </g>
    ${label(84, 190, "Email indexes", "pipeline-title")}
    ${label(84, 213, "SQLite", "pipeline-detail")}
    ${label(84, 235, "Text · FTS5", "pipeline-detail")}
    ${label(84, 254, "Vectors · sqlite-vec", "pipeline-detail")}
  </g>`;
}

function calendarFiles(prefix, { x, y, w }) {
  const scale = w / 179;
  return `<g class="pipeline-files" transform="translate(${x} ${y}) scale(${scale})">
    ${ink(prefix, "M12 7L165 3L173 111L16 116Z", "pipeline-shadow")}
    ${ink(prefix, "M16 0L159 6L157 101L10 95Z", "pipeline-olive")}
    ${ink(prefix, "M3 19L156 10L169 104L13 117Z", "pipeline-pale")}
    ${ink(prefix, "M20 12L146 19L140 108L12 103Z", "pipeline-stock")}
    ${ink(prefix, "M114 17L146 19L140 45Z", "pipeline-pale")}
    <path class="pipeline-calendar-grid" d="M30 47L117 52M29 63L117 67M28 81L115 84M49 36L47 91M72 38L70 93M94 40L92 95"/>
    ${ink(prefix, "M50 64L71 65L69 81L49 80Z", "pipeline-terra")}
    ${label(89, 141, "Calendar mirrors", "pipeline-title")}
    ${label(89, 164, "Local .ics files", "pipeline-detail")}
  </g>`;
}

function definitions(prefix) {
  return `<defs>
    <pattern id="${prefix}-grain" width="41" height="47" patternUnits="userSpaceOnUse"><path d="M3 7l1.3-.6l.5 1.2l-1.4.4ZM21 33l.8-.4l.5 1.4l-1 .4ZM34 12l1.2-.2l.3.8l-1.1.6Z" fill="#F3F1E8" opacity=".45"/><path d="M12 22l1.6-.4M29 42l.9.7M38 31l-.4 1" stroke="#F3F1E8" stroke-width=".65" opacity=".35"/></pattern>
    <marker id="${prefix}-request-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9Z" fill="#A3372D"/></marker>
    <marker id="${prefix}-data-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9Z" fill="#596046"/></marker>
    ${Object.entries(requestColors).map(([request, color]) => `<marker id="${prefix}-${request}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9Z" fill="${color}"/></marker>`).join("")}
    <g id="${prefix}-question"><path class="pipeline-question" d="M-10-8L10-9L11 6L-2 7L-8 12L-7 7L-11 7Z"/><path class="pipeline-token-carve" d="M-5-3H5M-5 1H2"/></g>
    <g id="${prefix}-answer"><path class="pipeline-answer" d="M-11-9L11-8L10 7L-1 7L-8 12L-7 7L-11 7Z"/><path class="pipeline-token-carve" d="M-6-2L-2 2L5-4"/></g>
    <g id="${prefix}-letter"><path class="pipeline-letter" d="M-13-9L13-8L12 9L-13 9Z"/><path class="pipeline-letter-line" d="M-12-7L0 2L12-6M-12 8L-4 1M12 8L4 1"/></g>
    <g id="${prefix}-calendar"><path class="pipeline-letter" d="M-11-11L11-10L11 11L-11 11Z"/><path class="pipeline-calendar-top" d="M-11-10H11V-4H-11Z"/><path class="pipeline-letter-line" d="M-5-14V-8M5-14V-8M-5 1H-2M3 1H6M-5 6H-2M3 6H6"/></g>
    <g id="${prefix}-source"><path class="pipeline-source" d="M-8-11L5-11L10-6L9 12L-9 12Z"/><path class="pipeline-token-carve" d="M5-11V-5H10M-4 1H5M-4 5H4M-4 9H1"/></g>
  </defs>`;
}

function wire(prefix, path, kind = "request") {
  return `<path class="pipeline-wire pipeline-wire-${kind}" d="${path}" marker-end="url(#${prefix}-${kind === "request" ? "request" : "data"}-arrow)"/>`;
}

// One spline per interval, including holds, with distinct loop-edge key times.
const splines = (frames) => frames.slice(1)
  .map((frame, index) => frame[1] === frames[index][1] ? holdEase : appleEase).join(";");

function visibilityAnimation(start, end, duration) {
  const startAt = start / duration;
  const endAt = end / duration;
  const fade = Math.min(.16, (end - start) / 5) / duration;
  const visibility = [[0, 0]];
  if (start > 0) visibility.push([startAt, 0]);
  visibility.push([startAt + fade, 1], [endAt - fade, 1], [endAt, 0]);
  if (end < duration) visibility.push([1, 0]);

  return `<animate begin="indefinite" attributeName="opacity" values="${visibility.map(frame => frame[1]).join(";")}" keyTimes="${visibility.map(frame => frame[0]).join(";")}" keySplines="${splines(visibility)}" calcMode="spline" dur="${duration}s" repeatCount="indefinite"/>`;
}

function particle(prefix, path, symbol, start, end, duration = cycle) {
  const movement = [[0, 0]];
  if (start > 0) movement.push([start / duration, 0]);
  movement.push([end / duration, 1]);
  if (end < duration) movement.push([1, 1]);
  return `<g class="pipeline-particle" opacity="0" data-particle="${symbol}">
    <use href="#${prefix}-${symbol}"/>
    <animateMotion begin="indefinite" path="${path}" keyPoints="${movement.map(frame => frame[1]).join(";")}" keyTimes="${movement.map(frame => frame[0]).join(";")}" keySplines="${splines(movement)}" calcMode="spline" dur="${duration}s" repeatCount="indefinite"/>
    ${visibilityAnimation(start, end, duration)}
  </g>`;
}

function trace(prefix, request, path, start, end) {
  return `<path class="pipeline-trace" d="${path}" opacity="0" marker-end="url(#${prefix}-${request}-arrow)">
    ${visibilityAnimation(start, end, cycle)}
  </path>`;
}

function requestGroup(request, content) {
  return `<g class="pipeline-journey" data-request="${request}" style="--journey-ink:${requestColors[request]}">${content}</g>`;
}

const layouts = {
  desktop: {
    box: "0 0 1140 875", boundary: [155, 24, 976, 817], user: [62, 350],
    mimir: { x: 182, y: 268, w: 162, kind: "phone", lines: ["Mimir"], detail: ["Web app + API"] },
    pi: { x: 405, y: 268, w: 212, h: 210 },
    model: { x: 417, y: 565, w: 188, kind: "model", lines: ["Qwen3.5 9B"], detail: ["Local · llama.cpp"] },
    hermes: { x: 663, y: 291, w: 177, kind: "catalogue", lines: ["Hermes"], detail: ["Read-only tools"] },
    email: { x: 931, y: 270, w: 168 },
    calendar: { x: 920, y: 590, w: 179 },
    bridge: { x: 684, y: 46, w: 173, kind: "bridge", lines: ["Proton Mail Bridge"], detail: ["Local IMAP"] },
    indexer: { x: 927, y: 46, w: 173, kind: "indexer", lines: ["Mail sync"], detail: ["Extract text", "Embed locally"] },
    calendarSync: { x: 680, y: 622, w: 187, kind: "calendar-sync", lines: ["Calendar sync"], detail: ["Fetch ICS feeds"] },
    paths: {
      userIn: "M132 337 Q167 330 202 337", mimirIn: "M324 337 Q378 328 431 337", modelIn: "M485 483 Q471 521 485 560", modelOut: "M537 560 Q550 521 537 483",
      toolIn: "M588 337 Q623 333 658 337", mailIn: "M845 337 Q885 328 926 337", mailOut: "M926 386 Q885 393 845 386",
      // Separate ports and uninterrupted curves keep the calendar routes apart.
      calendarIn: "M852 416 C883 416 879 632 907 632",
      calendarOut: "M907 678 C822 678 854 465 818 431",
      toolOut: "M658 386 Q630 391 602 386", mimirOut: "M420 386 Q374 396 324 386", userOut: "M202 386 Q168 402 132 394",
      mailSync: "M862 104 Q887 90 922 104", indexing: "M1099 134 Q1120 208 1061 265",
      calendarSync: "M844 707 Q873 728 896 711 Q908 698 915 690"
    },
    annotations: `${label(885, 316, "Search", "pipeline-route-label")}${label(885, 414, "Sources", "pipeline-route-label")}`
  },

};

function renderLayout(id, name) {
  const prefix = `${id}-${name}`;
  const layout = layouts[name];
  const p = layout.paths;
  const [x, y, w, h] = layout.boundary;
  const queryWires = [p.userIn, p.mimirIn, p.modelIn, p.toolIn, p.mailIn, p.calendarIn];
  const dataWires = [p.userOut, p.mimirOut, p.modelOut, p.toolOut, p.mailOut, p.calendarOut, p.mailSync, p.indexing, p.calendarSync];
  const requests = Object.keys(requestColors).map((request, round) => {
    const offset = round * 14;
    return { request, steps: [
      [p.userIn, "question", offset, offset + 1.6],
      [p.mimirIn, "question", offset + 1.6, offset + 3.2],
      [p.modelIn, "question", offset + 3.2, offset + 4.2],
      [p.modelOut, "answer", offset + 4.3, offset + 5.5],
      [p.toolIn, "question", offset + 5.5, offset + 6.7],
      [request === "email" ? p.mailIn : p.calendarIn, "question", offset + 6.7, offset + 8],
      [request === "email" ? p.mailOut : p.calendarOut, "source", offset + 8.3, offset + 9.5],
      [p.toolOut, "source", offset + 9.5, offset + 10.7],
      [p.modelIn, "source", offset + 10.7, offset + 11.5],
      [p.modelOut, "answer", offset + 11.6, offset + 12.4],
      [p.mimirOut, "answer", offset + 12.4, offset + 13.2],
      [p.userOut, "answer", offset + 13.2, offset + 14]
    ] };
  });
  const requestTraces = requests.map(({ request, steps }) => requestGroup(request,
    steps.map(([path, , start, end]) => trace(prefix, request, path, start, end)).join(""))).join("");
  const requestParticles = requests.map(({ request, steps }) => requestGroup(request,
    steps.map(step => particle(prefix, ...step)).join(""))).join("");
  return `<svg class="pipeline-svg pipeline-${name}" xmlns="http://www.w3.org/2000/svg" viewBox="${layout.box}" role="img" aria-labelledby="${prefix}-title ${prefix}-description">
    <title id="${prefix}-title">${title}</title><desc id="${prefix}-description">${description}</desc>
    ${definitions(prefix)}
    <path class="pipeline-lab-paper" d="M${x + 6} ${y + 8}L${x + w - 9} ${y}L${x + w} ${y + h - 4}L${x} ${y + h}Z"/><path class="pipeline-boundary" d="M${x} ${y + 53}L${x + 1} ${y + 4}L${x + 55} ${y + 3}M${x + w - 50} ${y + 1}L${x + w - 2} ${y}L${x + w} ${y + 45}M${x + w} ${y + h - 49}L${x + w - 1} ${y + h - 1}L${x + w - 52} ${y + h}M${x + 49} ${y + h}L${x} ${y + h - 1}L${x + 1} ${y + h - 52}"/>
    <text x="${x + 19}" y="${y + 28}" class="pipeline-boundary-label">HOME LAB</text>
    ${queryWires.map((path) => wire(prefix, path)).join("")}${dataWires.map((path) => wire(prefix, path, "data")).join("")}
    <g aria-hidden="true">${requestTraces}</g>
    ${user(prefix, ...layout.user)}
    ${system(prefix, layout.mimir)}${harness(prefix, layout.pi)}${system(prefix, layout.model)}${system(prefix, layout.hermes)}
    ${database(prefix, layout.email)}${calendarFiles(prefix, layout.calendar)}
    ${system(prefix, layout.bridge)}${system(prefix, layout.indexer)}${system(prefix, layout.calendarSync)}
    ${layout.annotations}
    <g aria-hidden="true">${requestParticles}
      ${particle(prefix, p.mailSync, "letter", 0, 4.4, 11)}
      ${particle(prefix, p.indexing, "letter", 4.6, 8.1, 11)}
      ${particle(prefix, p.calendarSync, "calendar", 2.5, 8, 11)}
    </g>
  </svg>`;
}

// Narrow screens use a static overview rather than the illustrated pipeline.
function renderMobile(id) {
  const prefix = `${id}-mobile`;
  const card = (x, y, w, h, heading, detail, extraClass = "") => {
    const contour = `M${x + 1} ${y + 1}L${x + w - 1} ${y}L${x + w} ${y + h - 1}L${x} ${y + h}Z`;
    return `<g class="pipeline-mobile-card ${extraClass}">
      <path class="pipeline-mobile-underprint" d="${contour}" transform="translate(2 3)" aria-hidden="true"/>
      <path class="pipeline-mobile-panel" d="${contour}"/>
      <path class="pipeline-mobile-grain" d="${contour}" fill="url(#${prefix}-dry-ink)" aria-hidden="true"/>
      <path class="pipeline-mobile-cut" d="M${x + 7} ${y + 8}L${x + 30} ${y + 7}" aria-hidden="true"/>
      ${label(x + w / 2, y + 24, heading, "pipeline-mobile-heading")}
      ${label(x + w / 2, y + 45, detail, "pipeline-mobile-detail")}
    </g>`;
  };
  const route = (path, type = "request", bothWays = false) => `<path class="pipeline-mobile-route pipeline-mobile-route-${type}" d="${path}" marker-end="url(#${prefix}-${type}-arrow)"${bothWays ? ` marker-start="url(#${prefix}-${type}-arrow)"` : ""}/>`;
  return `<svg class="pipeline-svg pipeline-mobile" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 620" role="img" aria-labelledby="${prefix}-title ${prefix}-description">
    <title id="${prefix}-title">Mimir, Pi, and Hermes: compact architecture</title>
    <desc id="${prefix}-description">Requests and answers travel between the user, Mimir, Pi, and Hermes. Pi uses the local Qwen3.5 9B model. Hermes searches email in SQLite using text and vector indexes, and queries separate calendar ICS mirrors. Proton Mail Bridge provides email to mail sync, which builds the local embeddings and indexes. Calendar sync updates the ICS mirrors separately. Everything except the user runs in the home lab.</desc>
    <defs>
      <marker id="${prefix}-request-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M1 1L9 5L1 9Z" fill="#A3372D"/></marker>
      <marker id="${prefix}-data-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M1 1L9 5L1 9Z" fill="#596046"/></marker>
      <pattern id="${prefix}-dry-ink" width="31" height="27" patternUnits="userSpaceOnUse">
        <path d="M3 5h1.6M21 18h1.2M12 25h.8" stroke="#F3F1E8" stroke-width=".7" opacity=".42"/>
        <circle cx="26" cy="7" r=".5" fill="#F3F1E8" opacity=".3"/>
      </pattern>
    </defs>
    <path class="pipeline-mobile-boundary" d="M3 80V53H42M322 53H357V80M3 583V615H38M322 615H357V583"/>
    <text x="244" y="46" class="pipeline-mobile-home">HOME LAB</text>
    <g class="pipeline-mobile-user">
      <ellipse class="pipeline-mobile-panel" cx="93" cy="24" rx="35" ry="17"/>
      ${label(93, 30, "User", "pipeline-mobile-heading")}
    </g>
    ${route("M84 45V57")}${route("M103 57V45", "data")}
    ${route("M84 126V149")}${route("M103 149V126", "data")}
    ${route("M84 223V246")}${route("M103 246V223", "data")}
    ${route("M184 182H204", "request", true)}
    ${route("M80 318V341")}${route("M99 341V318", "data")}
    ${route("M182 296H266V341")}${route("M284 341V278H182", "data")}
    ${route("M88 461V445", "data")}
    ${route("M88 544V526", "data")}
    ${route("M275 544V446", "data")}
    ${card(10, 63, 166, 57, "Mimir", "Web app + API", "pipeline-mobile-mimir")}
    ${card(10, 155, 166, 62, "Pi", "Agent harness", "pipeline-mobile-agent")}
    ${card(211, 155, 139, 62, "Qwen3.5 9B", "Local model", "pipeline-mobile-model")}
    ${card(10, 252, 166, 60, "Hermes", "Read-only tools", "pipeline-mobile-hermes")}
    <g class="pipeline-mobile-email">
      <path class="pipeline-mobile-panel" d="M10 358V427C10 442 175 442 175 427V358Z"/>
      <ellipse class="pipeline-mobile-panel pipeline-mobile-db-lid" cx="92.5" cy="358" rx="82.5" ry="11"/>
      <path class="pipeline-mobile-grain" d="M10 358V427C10 442 175 442 175 427V358Z" fill="url(#${prefix}-dry-ink)" aria-hidden="true"/>
      <path class="pipeline-mobile-db-cut" d="M29 356C53 350 127 350 150 356" aria-hidden="true"/>
      ${label(92.5, 387, "Email indexes", "pipeline-mobile-heading")}
      ${label(92.5, 408, "SQLite", "pipeline-mobile-detail")}
      ${label(92.5, 429, "Text + vectors", "pipeline-mobile-detail")}
    </g>
    <g class="pipeline-mobile-calendars">
      <path class="pipeline-mobile-panel" d="M201 347H333L350 365V438H201Z"/>
      <path class="pipeline-mobile-calendar-ink" d="M202 348H332L349 365L202 364Z" aria-hidden="true"/>
      <path class="pipeline-mobile-fold" d="M333 348V365H349"/>
      <path class="pipeline-mobile-calendar-cut" d="M214 354L231 353M242 354L258 354" aria-hidden="true"/>
      ${label(275.5, 379, "Calendar", "pipeline-mobile-heading")}
      ${label(275.5, 402, "mirrors", "pipeline-mobile-heading")}
      ${label(275.5, 425, "ICS files", "pipeline-mobile-detail")}
    </g>
    ${card(10, 468, 165, 52, "Mail sync", "Local embeddings")}
    ${card(10, 550, 165, 55, "Proton Mail", "Bridge", "pipeline-mobile-bridge")}
    ${card(201, 550, 149, 55, "Calendar sync", "ICS feeds", "pipeline-mobile-calendar-sync")}
  </svg>`;
}

export function mimirPipeline(id = "mimir-architecture") {
  if (!/^[a-z][a-z0-9-]*$/u.test(id)) throw new Error("mimirPipeline needs a unique, simple HTML id.");
  return `<figure class="mimir-pipeline" id="${id}" data-mimir-pipeline aria-labelledby="${id}-heading">
    <div class="pipeline-toolbar">
      <span class="pipeline-heading" id="${id}-heading">Mimir’s Architecture</span>
      <button class="pipeline-toggle" type="button" data-flow-toggle aria-pressed="false" aria-controls="${id}-drawing" hidden>Pause animation</button>
    </div>
    <div id="${id}-drawing" class="pipeline-drawing">${renderLayout(id, "desktop")}${renderMobile(id)}</div>
  </figure><script src="${assetUrl("/assets/scripts/mimir-pipeline.js")}" defer></script>`;
}
