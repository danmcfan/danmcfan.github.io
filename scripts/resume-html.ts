import { readFileSync } from "node:fs";
import { join } from "node:path";

import { renderResumeHtml } from "../src/resume/template";

const FONTS = join(process.cwd(), "node_modules/@fontsource/source-sans-3/files");

function face(weight: number, style: "normal" | "italic") {
  const file = join(FONTS, `source-sans-3-latin-${weight}-${style}.woff2`);
  const data = readFileSync(file).toString("base64");
  return `@font-face{font-family:"Source Sans 3";font-weight:${weight};font-style:${style};src:url(data:font/woff2;base64,${data}) format("woff2");}`;
}

/** The résumé page with its fonts inlined, so it renders the same from `page.setContent` anywhere. */
export function resumeHtml() {
  return renderResumeHtml([face(400, "normal"), face(400, "italic"), face(700, "normal")].join(""));
}
