import { chromium } from "@playwright/test";

import startBrowser, { BROWSER_ENDPOINT } from "./browser";
import { resumeHtml } from "./resume-html";

/**
 * Prints src/data/resume.ts to a PDF with the pinned Docker Chromium.
 * Usage: bun run resume [output.pdf]
 */
const output = process.argv[2] ?? "public/Daniel_OBrien_Resume.pdf";

await startBrowser();
const browser = await chromium.connect(BROWSER_ENDPOINT);
try {
  const page = await browser.newPage();
  await page.setContent(resumeHtml(), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const pdf = await page.pdf({ format: "Letter", preferCSSPageSize: true, printBackground: true, tagged: true });
  await Bun.write(output, pdf);
  console.log(`Wrote ${output}`);
} finally {
  await browser.close();
}
