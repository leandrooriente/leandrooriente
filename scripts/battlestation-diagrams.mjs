// Physical cable maps: static, with a separate composition for small screens.
const descriptions = {
  before: "The MacBook Pro connects to the CalDigit TS4 with one Thunderbolt cable carrying power, data, and video. The dock connects to Ethernet, the monitor, keyboard, trackpad, webcam, microphone, speakers, and wired headphones.",
  after: "The MacBook Pro connects to the CalDigit TS4 by Thunderbolt, which also supplies its power. The dock keeps its Ethernet connection and connects to the shared monitor through DisplayPort and to the USB switch. The Mac mini has its own power and Ethernet, and connects to the same monitor through HDMI 2 and to the same USB switch. The switch shares one keyboard, trackpad, webcam, microphone, speaker setup, and pair of wired headphones between both computers."
};

const label = (x, y, text, kind = "label") =>
  `<text x="${x}" y="${y}" class="desk-map-${kind}" text-anchor="middle">${text}</text>`;
const cable = (path, kind = "fixed") => `<path class="desk-map-cable desk-map-${kind}" d="${path}"/>`;

function cut(prefix, path, pigment = "carbon") {
  return `<path class="desk-map-${pigment}" d="${path}"/><path d="${path}" fill="url(#${prefix}-grain)"/>`;
}

function object(prefix, kind, cx, y, width) {
  let art;
  switch (kind) {
    case "laptop":
      art = `${cut(prefix, "M10 5L92 3L96 55L5 57Z")}
        ${cut(prefix, "M16 12L87 10L90 49L11 51Z", "olive")}
        ${cut(prefix, "M5 57L96 55L101 67L0 69Z", "dark-olive")}
        <path class="desk-map-carve" d="M39 62L61 62M19 55L82 54"/>`;
      break;
    case "dock":
      art = `${cut(prefix, "M19 4L75 1L84 95L15 99Z", "shadow")}
        ${cut(prefix, "M18 1L73 0L78 91L13 95Z", "olive")}
        ${cut(prefix, "M18 1L34 6L30 94L13 95Z", "dark-olive")}
        <path class="desk-map-carve" d="M45 11L62 10M46 18L63 17M47 25L64 24M47 62L65 61M47 72L65 71"/>`;
      break;
    case "mini":
      art = `${cut(prefix, "M8 9L96 5L99 75L7 79Z", "shadow")}
        ${cut(prefix, "M5 5L92 1L95 65L4 71Z", "olive")}
        ${cut(prefix, "M4 59L95 54L95 65L4 71Z", "dark-olive")}
        <path class="desk-map-carve" d="M16 63L26 62M84 57L84 61"/>`;
      break;
    case "monitor":
      art = `${cut(prefix, "M2 3L98 0L100 60L0 63Z")}
        ${cut(prefix, "M8 9L92 7L94 53L7 55Z", "olive")}
        ${cut(prefix, "M45 62L59 61L62 77L36 79Z", "dark-olive")}
        <path class="desk-map-carve" d="M10 59L25 59"/>`;
      break;
    case "switch":
      art = `${cut(prefix, "M4 7L98 4L100 61L3 65Z", "shadow")}
        ${cut(prefix, "M2 3L96 0L98 56L0 60Z", "terra")}
        <path class="desk-map-stock" d="M51 16Q66 15 67 30Q67 44 52 45Q37 44 37 31Q36 17 51 16Z"/>
        <path class="desk-map-carve" d="M11 52L26 51"/>`;
      break;
    case "ethernet":
      art = `${cut(prefix, "M17 12L81 9L84 73L18 77Z", "olive")}
        ${cut(prefix, "M26 0L71 0L73 28L26 31Z", "dark-olive")}
        <path class="desk-map-carve" d="M36 6L37 22M45 6L46 22M55 6L56 22M64 5L65 21M34 66L68 63"/>`;
      break;
    default: throw new Error(`Unknown desk object: ${kind}`);
  }
  return `<g transform="translate(${cx - width / 2} ${y}) scale(${width / 100})" aria-hidden="true">${art}</g>`;
}

function peripherals(x, y, shared = false) {
  return `${label(x, y, shared ? "Shared peripherals" : "USB peripherals")}
    ${label(x, y + 27, "Keyboard · trackpad", "detail")}
    ${label(x, y + 51, "Webcam · microphone", "detail")}
    ${label(x, y + 75, "Speakers · wired headphones", "detail")}`;
}

function beforeDesktop(prefix) {
  return `<g aria-hidden="true">
    ${cable("M149 59C177 58 216 58 242 59", "thunderbolt")}
    ${cable("M296 59C365 57 448 59 512 59")}
    ${cable("M296 83H330Q342 83 342 96V178Q342 189 330 189H159V218")}
    ${cable("M342 178Q342 189 354 189H451V214")}
    ${object(prefix, "laptop", 98, 23, 102)}
    ${object(prefix, "dock", 271, 19, 70)}
    ${object(prefix, "monitor", 572, 19, 120)}
    ${object(prefix, "ethernet", 159, 218, 45)}
    ${label(98, 122, "MacBook Pro")}
    ${label(98, 147, "Power via TS4", "detail")}
    ${label(271, 122, "CalDigit TS4")}
    ${label(572, 142, "Monitor")}
    ${label(194, 42, "Thunderbolt", "route")}
    ${label(405, 42, "DisplayPort", "route")}
    ${label(159, 281, "Ethernet")}
    ${peripherals(451, 238)}
  </g>`;
}

function afterDesktop(prefix) {
  return `<g aria-hidden="true">
    ${cable("M123 139H230", "thunderbolt")}
    ${cable("M280 130H305Q320 130 320 115V54Q320 41 333 41H351")}
    ${cable("M568 133H539Q521 133 521 115V54Q521 41 508 41H469")}
    ${cable("M280 158H324Q338 158 338 172V236Q338 249 351 249H395V263", "usb")}
    ${cable("M568 155H512Q499 155 499 169V236Q499 249 486 249H425V263", "usb")}
    ${cable("M410 300V325", "usb")}
    ${object(prefix, "laptop", 72, 105, 102)}
    ${object(prefix, "dock", 255, 104, 70)}
    ${object(prefix, "mini", 602, 112, 68)}
    ${object(prefix, "monitor", 410, 2, 120)}
    ${object(prefix, "switch", 410, 262, 60)}
    ${label(72, 207, "MacBook Pro")}
    ${label(72, 234, "Power via TS4", "detail")}
    ${label(255, 207, "CalDigit TS4")}
    ${label(255, 234, "Ethernet", "detail")}
    ${label(602, 207, "Mac mini")}
    ${label(602, 234, "Power · Ethernet", "detail")}
    ${label(410, 116, "Same monitor")}
    ${label(176, 120, "Thunderbolt", "route")}
    ${label(306, 86, "DisplayPort", "route")}
    ${label(540, 86, "HDMI 2", "route")}
    ${label(326, 289, "USB switch", "accent-label")}
    ${peripherals(410, 346, true)}
  </g>`;
}

function beforeMobile(prefix) {
  return `<g aria-hidden="true">
    ${cable("M114 55H207", "thunderbolt")}
    ${cable("M252 70H269Q281 70 281 82V177H126")}
    ${cable("M281 177V215H246")}
    ${cable("M281 215V289Q281 301 268 301H150V316")}
    ${object(prefix, "laptop", 65, 20, 98)}
    ${object(prefix, "dock", 230, 20, 60)}
    ${object(prefix, "monitor", 72, 149, 108)}
    ${object(prefix, "ethernet", 224, 203, 44)}
    ${label(65, 117, "MacBook Pro")}
    ${label(65, 141, "Power via TS4", "detail")}
    ${label(216, 117, "CalDigit TS4")}
    ${label(72, 262, "Monitor")}
    ${label(224, 262, "Ethernet")}
    ${label(162, 39, "Thunderbolt", "route")}
    ${peripherals(150, 338)}
  </g>`;
}

function afterMobile(prefix) {
  return `<g aria-hidden="true">
    ${cable("M114 55H135Q146 55 146 68V207Q146 220 133 220H89", "thunderbolt")}
    ${cable("M89 241H169")}
    ${cable("M260 43H269Q280 43 280 54V242H279")}
    ${cable("M89 263H99Q109 263 109 276V354Q109 366 121 366H133V395", "usb")}
    ${cable("M260 63H284Q295 63 295 76V354Q295 366 283 366H171V395", "usb")}
    ${cable("M152 431V466", "usb")}
    ${object(prefix, "laptop", 65, 20, 98)}
    ${object(prefix, "mini", 230, 27, 60)}
    ${object(prefix, "dock", 65, 202, 60)}
    ${object(prefix, "monitor", 224, 214, 110)}
    ${object(prefix, "switch", 152, 395, 60)}
    ${label(65, 117, "MacBook Pro")}
    ${label(65, 142, "Power via TS4", "detail")}
    ${label(230, 117, "Mac mini")}
    ${label(230, 142, "Power", "detail")}
    ${label(230, 165, "Ethernet", "detail")}
    ${label(65, 290, "CalDigit")}
    ${label(65, 313, "TS4")}
    ${label(65, 337, "Ethernet", "detail")}
    ${label(224, 314, "Same monitor")}
    ${label(113, 182, "Thunderbolt", "route")}
    ${label(135, 229, "DisplayPort", "route")}
    ${label(236, 198, "HDMI 2", "route")}
    ${label(66, 422, "USB switch", "accent-label")}
    ${peripherals(150, 489, true)}
  </g>`;
}

function svg(stage, prefix, mobile) {
  const after = stage === "after";
  const width = mobile ? 300 : 680;
  const height = mobile ? (after ? 578 : 427) : (after ? 437 : 327);
  const render = mobile ? (after ? afterMobile : beforeMobile) : (after ? afterDesktop : beforeDesktop);
  return `<svg class="desk-map-svg desk-map-${mobile ? "mobile" : "desktop"}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${prefix}-title ${prefix}-desc">
    <title id="${prefix}-title">${after ? "After: two computers share one workstation" : "Before: one MacBook Pro and one dock"}</title>
    <desc id="${prefix}-desc">${descriptions[stage]}</desc>
    <defs><pattern id="${prefix}-grain" patternUnits="userSpaceOnUse" width="39" height="31">
      <path d="M3 7h.7M18 3h.4M32 17h.8M11 24h.5M25 28h.7" stroke="#F3F1E8" stroke-width=".8" opacity=".28"/>
      <path d="M7 18l2-.4M27 9l1-.3" stroke="#F3F1E8" stroke-width=".45" opacity=".2"/>
    </pattern></defs>
    ${render(prefix)}
  </svg>`;
}

export function battlestationDiagram(stage, id = `desk-${stage}`) {
  if (!Object.hasOwn(descriptions, stage)) throw new Error(`Unknown desk stage: ${stage}`);
  if (!/^[a-z][a-z0-9-]*$/u.test(id)) throw new Error(`Invalid diagram ID: ${id}`);
  return `<figure class="desk-map" id="${id}">
    <figcaption>${stage === "before" ? "Before" : "After"}</figcaption>
    ${svg(stage, `${id}-wide`, false)}
    ${svg(stage, `${id}-small`, true)}
  </figure>`;
}
