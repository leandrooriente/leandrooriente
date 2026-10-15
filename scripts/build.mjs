import { rm } from "node:fs/promises";
import Eleventy from "@11ty/eleventy";
import { checkSeo } from "./check-seo.mjs";

// A clean build prevents removed posts and assets from surviving in deploy output.
await rm(new URL("../dist/", import.meta.url), { recursive: true, force: true });
await new Eleventy().write();
await checkSeo();
