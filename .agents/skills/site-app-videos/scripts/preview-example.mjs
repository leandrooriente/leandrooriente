import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { phoneDemo } from "../assets/phone-demo/phone-demo.mjs";

const destination = process.argv[2];
if (!destination || process.argv.length !== 3) {
  console.error("Usage: node scripts/preview-example.mjs <new-output-directory>");
  process.exit(1);
}

const output = resolve(destination);
const assets = resolve(dirname(fileURLToPath(import.meta.url)), "../assets");
await mkdir(output, { recursive: false });
for (const filename of ["player.js", "phone-demo.css", "phone-frame-matte-black.png"]) {
  await copyFile(join(assets, "phone-demo", filename), join(output, filename));
}
for (const filename of ["mimir-demo.mp4", "mimir-demo-poster.jpg"]) {
  await copyFile(join(assets, "mimir-reference", filename), join(output, filename));
}

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Site App Videos — Mimir reference</title>
  <link rel="stylesheet" href="./phone-demo.css">
  <style>
    body { margin: 0; padding: 24px; background: #f1e7d2; color: #252820; }
    main { max-width: 620px; margin-inline: auto; }
    .phone-demo { margin-block: 0; }
    @media (max-width: 559px) { body { padding: 20px; } }
  </style>
</head>
<body><main>${phoneDemo("./mimir-demo.mp4", "./mimir-demo-poster.jpg", "Mimir app demo", "Searching for a Wikipedia donation and opening the original email in Proton Mail.", "mimir-demo-reference")}</main></body>
</html>
`;
await writeFile(join(output, "index.html"), html);
console.log(join(output, "index.html"));
