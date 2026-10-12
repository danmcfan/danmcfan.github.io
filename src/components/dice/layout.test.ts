import { describe, expect, test } from "bun:test";

import { layoutDice, type PageGeometry } from "./layout";

const desktop = (height: number): PageGeometry => ({
  width: 1440,
  height,
  sheet: { left: 208, top: 0, right: 1232, bottom: height },
  tray: { left: 856, top: 48, right: 1176, bottom: 200 },
});

const mobile: PageGeometry = {
  width: 390,
  height: 3000,
  sheet: { left: 0, top: 0, right: 390, bottom: 3000 },
  tray: { left: 20, top: 32, right: 370, bottom: 128 },
};

const inside = (x: number, y: number, rect: { left: number; top: number; right: number; bottom: number }) =>
  x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;

describe("layoutDice", () => {
  test("spreads margin dice down the whole page", () => {
    const page = desktop(5000);
    const { targets, size } = layoutDice(page);
    const margin = targets.filter((target) => target.region !== 0);
    const lowest = Math.max(...margin.map((target) => target.y));
    expect(lowest).toBeGreaterThan(page.height - 500);
    expect(lowest).toBeLessThanOrEqual(page.height - size);
    expect(margin.some((target) => target.x < page.sheet.left)).toBe(true);
    expect(margin.some((target) => target.x > page.sheet.right)).toBe(true);
  });

  test("keeps dice out of the content column except in the tray", () => {
    const page = desktop(4000);
    const { targets, regions, size } = layoutDice(page);
    for (const target of targets) {
      const region = regions[target.region];
      expect(inside(target.x, target.y, region)).toBe(true);
      if (region.kind !== "tray") {
        expect(target.x + size / 2 <= page.sheet.left || target.x - size / 2 >= page.sheet.right).toBe(true);
      }
    }
  });

  test("puts dice only in the tray when there are no margins", () => {
    const { targets, regions } = layoutDice(mobile);
    expect(regions.map((region) => region.kind)).toEqual(["tray"]);
    expect(targets.length).toBeGreaterThanOrEqual(2);
    expect(targets.every((target) => target.region === 0)).toBe(true);
  });

  test("keeps existing targets when the page grows", () => {
    const short = layoutDice(desktop(1800)).targets;
    const tall = layoutDice(desktop(4200)).targets;
    expect(tall.length).toBeGreaterThan(short.length);
    expect(tall.slice(0, short.length)).toEqual(short);
  });

  test("caps the number of dice on very tall pages", () => {
    expect(layoutDice(desktop(40_000)).targets.length).toBeLessThanOrEqual(27);
  });

  test("throws each die in from the nearer page edge", () => {
    const page = desktop(3000);
    for (const target of layoutDice(page).targets) {
      expect(target.from).toBe(target.x < page.width / 2 ? "left" : "right");
    }
  });
});
