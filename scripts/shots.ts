import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { type Browser, chromium } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

import startBrowser, { BROWSER_ENDPOINT } from "./browser";

/**
 * Before/after screenshots for a PR description. Never committed.
 * Usage: bun run shots [base]   (base defaults to origin/main)
 *
 * Writes test-results/shots/{before,after,diff}/*.png and screenshots.md, a PR body
 * section whose image paths `gh pr create|edit|comment --attach` turns into uploads.
 */

const PAGES = [
  { name: "quests", path: "/projects" },
  { name: "character-sheet", path: "/about" },
  { name: "blog", path: "/blog" },
  { name: "not-found", path: "/no-such-page" },
];

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1280, height: 900 }, isMobile: false },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true },
];

// The footer year and "years of experience" read the clock; the dice are random by design.
const NOW = new Date("2026-10-12T12:00:00");
const STYLE = readFileSync(join(import.meta.dir, "screenshot.css"), "utf8");

const ROOT = process.cwd();
const OUT = "test-results/shots";
const base = process.argv[2] ?? "origin/main";

function run(cmd: string[], cwd = ROOT) {
  const result = Bun.spawnSync(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0) throw new Error(`${cmd.join(" ")} failed:\n${result.stderr.toString()}`);
  return result.stdout.toString().trim();
}

async function serve(cwd: string, outDir: string, port: number) {
  const server = Bun.spawn(
    ["bun", "--bunx", "vite", "preview", "--outDir", outDir, "--port", String(port), "--strictPort"],
    {
      cwd,
      stdout: "ignore",
      stderr: "ignore",
    },
  );
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await fetch(`http://localhost:${port}/`);
      return server;
    } catch {
      await Bun.sleep(250);
    }
  }
  server.kill();
  throw new Error(`vite preview did not start on port ${port}`);
}

/** Screenshot every page of the site built into `outDir`, plus the résumé if `resumeHtml` is given. */
async function capture(
  browser: Browser,
  side: string,
  cwd: string,
  outDir: string,
  port: number,
  resumeHtml?: () => string,
) {
  const dir = join(OUT, side);
  mkdirSync(dir, { recursive: true });
  const server = await serve(cwd, outDir, port);
  try {
    for (const { name: device, viewport, isMobile } of VIEWPORTS) {
      const context = await browser.newContext({ viewport, isMobile, hasTouch: isMobile });
      const page = await context.newPage();
      await page.clock.setFixedTime(NOW);
      for (const { name, path } of PAGES) {
        await page.goto(`http://localhost:${port}${path}`);
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: join(dir, `${device}-${name}.png`),
          fullPage: true,
          animations: "disabled",
          caret: "hide",
          style: STYLE,
        });
      }
      await context.close();
    }
  } finally {
    server.kill();
  }

  if (!resumeHtml) return;
  const context = await browser.newContext({ viewport: { width: 816, height: 1056 } });
  const page = await context.newPage();
  await page.emulateMedia({ media: "print" });
  await page.setContent(resumeHtml(), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(dir, "resume.png"), fullPage: true });
  await context.close();
}

type Status = "unchanged" | "changed" | "added" | "removed";

function compare(file: string): { status: Status; pixels?: number } {
  const [before, after] = ["before", "after"].map((side) => join(OUT, side, file));
  if (!existsSync(before)) return { status: "added" };
  if (!existsSync(after)) return { status: "removed" };
  const a = PNG.sync.read(readFileSync(before));
  const b = PNG.sync.read(readFileSync(after));
  if (a.width !== b.width || a.height !== b.height) return { status: "changed" };
  const diff = new PNG({ width: a.width, height: a.height });
  const pixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  if (pixels === 0) return { status: "unchanged" };
  mkdirSync(join(OUT, "diff"), { recursive: true });
  writeFileSync(join(OUT, "diff", file), PNG.sync.write(diff));
  return { status: "changed", pixels };
}

rmSync(OUT, { recursive: true, force: true });
const sha = run(["git", "rev-parse", "--short", base]);
const worktree = mkdtempSync(join(tmpdir(), "shots-base-"));

await startBrowser();
const browser = await chromium.connect(BROWSER_ENDPOINT, { exposeNetwork: "<loopback>" });
try {
  console.log(`Building ${base} (${sha})…`);
  run(["git", "worktree", "add", "--detach", worktree, sha]);
  run(["bun", "install", "--frozen-lockfile"], worktree);
  const beforeBuild = resolve(OUT, "build-before");
  run(["bun", "--bunx", "vite", "build", "--outDir", beforeBuild], worktree);
  const baseResume = join(worktree, "scripts/resume-html.ts");
  const beforeResume = existsSync(baseResume) ? (await import(baseResume)).resumeHtml : undefined;
  await capture(browser, "before", worktree, beforeBuild, 4174, beforeResume);

  console.log("Building this branch…");
  const afterBuild = resolve(OUT, "build-after");
  run(["bun", "--bunx", "vite", "build", "--outDir", afterBuild]);
  await capture(browser, "after", ROOT, afterBuild, 4173, (await import("./resume-html")).resumeHtml);
} finally {
  await browser.close();
  run(["git", "worktree", "remove", "--force", worktree]);
}

const files = [...VIEWPORTS.flatMap((v) => PAGES.map((p) => `${v.name}-${p.name}.png`)), "resume.png"];
const rows = files.map((file) => ({ file, ...compare(file) }));
const shown = rows.filter((row) => row.status !== "unchanged");

const image = (side: string, file: string) => `./${OUT}/${side}/${file}`;
const lines = [
  `## Screenshots`,
  "",
  `Against \`${base}\` (${sha}). Unchanged: ${rows.length - shown.length} of ${rows.length}.`,
  "",
];
if (shown.length === 0) lines.push("No visual changes.");
for (const row of shown) {
  const label = row.file.replace(".png", "");
  const note = row.pixels
    ? ` (${row.pixels.toLocaleString()} px differ)`
    : row.status === "changed"
      ? " (size changed)"
      : ` (${row.status})`;
  lines.push(`### ${label}${note}`, "", "| Before | After |", "| --- | --- |");
  const before = row.status === "added" ? "—" : `![${label} before](${image("before", row.file)})`;
  const after = row.status === "removed" ? "—" : `![${label} after](${image("after", row.file)})`;
  lines.push(`| ${before} | ${after} |`, "");
}
writeFileSync(join(OUT, "screenshots.md"), `${lines.join("\n")}\n`);

const attach = shown.flatMap((row) =>
  [row.status !== "added" && image("before", row.file), row.status !== "removed" && image("after", row.file)].filter(
    Boolean,
  ),
);
writeFileSync(join(OUT, "attach.txt"), attach.map((path) => `--attach ${path}`).join(" "));

for (const row of rows) console.log(`${row.status.padEnd(9)} ${row.file}${row.pixels ? ` (${row.pixels} px)` : ""}`);
console.log(`\nPR section: ${OUT}/screenshots.md\ngh flags:   $(cat ${OUT}/attach.txt)`);
