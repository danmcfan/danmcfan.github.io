import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// WCAG 2.2 AA contrast for the theme's text colours against the page's surfaces.

const css = readFileSync(join(import.meta.dir, "index.css"), "utf8");

type RGB = [number, number, number];

function token(name: string): RGB {
  const match = css.match(new RegExp(`--color-${name}:\\s*#([0-9a-f]{6})`, "i"));
  if (!match) throw new Error(`missing --color-${name}`);
  const hex = match[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
}

/** Paint `top` at `alpha` over an opaque `bottom`. */
function over(top: RGB, alpha: number, bottom: RGB): RGB {
  return top.map((c, i) => c * alpha + bottom[i] * (1 - alpha)) as RGB;
}

function luminance(rgb: RGB) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: RGB, b: RGB) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const card = token("card");
// Where a major and a minor graph-paper line cross on a quest card (see `bg-graph`).
const gridLine: RGB = [70, 115, 160];
const graphCrossing = over(gridLine, 0.08, over(gridLine, 0.16, card));

const surfaces: Record<string, RGB> = {
  parchment: token("parchment"),
  // The page's vignette darkens towards this at the edges.
  "parchment-deep": token("parchment-deep"),
  card,
  "graph-paper line": graphCrossing,
};

describe("text colours meet AA (4.5:1) on every surface", () => {
  for (const text of ["ink", "ink-soft", "dragon", "pencil"]) {
    for (const [surface, background] of Object.entries(surfaces)) {
      test(`${text} on ${surface}`, () => {
        expect(contrast(token(text), background)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  test("parchment on the ink button, including its dragon hover", () => {
    expect(contrast(token("parchment"), token("ink"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token("parchment"), token("dragon"))).toBeGreaterThanOrEqual(4.5);
  });

  test("card on the pencil badge", () => {
    expect(contrast(token("card"), token("pencil"))).toBeGreaterThanOrEqual(4.5);
  });
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

describe("components keep text at full strength", () => {
  const files = sourceFiles(import.meta.dir);

  test("no faded text colours (opacity drops them below AA)", () => {
    const faded = files.flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(/\b(?:text|fill)-(?:ink|ink-soft|dragon|pencil)\/\d+/g)].map(
        (match) => `${file}: ${match[0]}`,
      ),
    );
    expect(faded).toEqual([]);
  });

  test("gold is never used for text (2.99:1 on parchment)", () => {
    const gold = files.filter((file) => /\b(?:text|fill)-gold\b/.test(readFileSync(file, "utf8")));
    expect(gold).toEqual([]);
  });
});
