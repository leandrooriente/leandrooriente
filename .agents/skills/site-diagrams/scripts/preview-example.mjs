import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mimirPipeline } from "../assets/mimir-reference/pipeline.mjs";

const destination = process.argv[2];
if (!destination || process.argv.length !== 3) {
  console.error("Usage: node scripts/preview-example.mjs <new-output-directory>");
  process.exit(1);
}

const output = resolve(destination);
const source = resolve(dirname(fileURLToPath(import.meta.url)), "../assets/mimir-reference");
await mkdir(output, { recursive: false });
for (const filename of ["controller.js", "diagram.css", "user.webp", "pi-logo.png"]) {
  await copyFile(join(source, filename), join(output, filename));
}
const css = await readFile(join(source, "diagram.css"), "utf8");
if (!css.includes(".pipeline-mobile")) throw new Error("Reference styles are incomplete.");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Site Diagrams — Mimir reference</title>
  <link rel="stylesheet" href="./diagram.css">
  <style>
    body { margin: 0; padding: 24px; background: #F3F1E8; color: #22251F; }
    main { max-width: 960px; margin-inline: auto; }
    .mimir-pipeline { margin-block: 0; }
    @media (max-width: 820px) { body { padding: 24px 20px; } }
  </style>
</head>
<body><main>${mimirPipeline("mimir-reference")}</main></body>
</html>
`;
await writeFile(join(output, "index.html"), html);
console.log(join(output, "index.html"));
