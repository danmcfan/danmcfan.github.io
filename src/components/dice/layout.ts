/** A rectangle in page pixels, measured from the top-left of the layout root. */
export type Rect = { left: number; top: number; right: number; bottom: number };

export type PageGeometry = {
  /** Width and full scroll height of the layout root. */
  width: number;
  height: number;
  /** The centred content column. */
  sheet: Rect;
  /** Empty area in the header reserved for dice. */
  tray: Rect;
};

/** Somewhere dice may roam, fenced off from the text by invisible walls. */
export type Region = Rect & { kind: "tray" | "left" | "right" };

export type Target = {
  x: number;
  y: number;
  /** Index into the layout's regions. */
  region: number;
  /** Page edge the die is thrown in from. */
  from: "left" | "right";
};

export type DiceLayout = { size: number; regions: Region[]; targets: Target[] };

const MIN_MARGIN = 96;
/** Vertical gap between dice on the same side. The other side is offset by half of it. */
const SPACING = 420;
const FIRST = 120;
const MAX_MARGIN_DICE = 24;

/**
 * Where dice rest: a loose row in the header tray, then down both margins of
 * the content column to the bottom of the page. Targets are numbered from the
 * top, so a page that grows only adds targets at the end.
 */
export function layoutDice(page: PageGeometry): DiceLayout {
  const { width, height, sheet, tray } = page;
  const trayWidth = tray.right - tray.left;
  const trayHeight = tray.bottom - tray.top;
  const margin = Math.min(sheet.left, width - sheet.right);
  const hasMargins = margin >= MIN_MARGIN;

  let size = Math.min(60, trayHeight * 0.6, trayWidth / 4.5);
  if (hasMargins) size = Math.min(size, margin * 0.4);
  size = Math.max(size, 32);

  const from = (x: number) => (x < width / 2 ? "left" : "right");
  const regions: Region[] = [{ kind: "tray", ...tray }];
  const targets: Target[] = [];

  const trayCount = trayWidth > 260 ? 3 : 2;
  for (let i = 0; i < trayCount; i++) {
    const x = tray.left + (trayWidth * (i + 0.5)) / trayCount + (i % 2 ? 6 : -6);
    targets.push({ x, y: tray.top + trayHeight * (i % 2 ? 0.62 : 0.4), region: 0, from: from(x) });
  }

  if (!hasMargins) return { size, regions, targets };

  const top = Math.max(sheet.top, 0);
  regions.push(
    { kind: "left", left: 0, top, right: sheet.left, bottom: height },
    { kind: "right", left: sheet.right, top, right: width, bottom: height },
  );

  const margins: Target[] = [];
  const sides = [
    { region: 1, centre: sheet.left / 2, start: top + FIRST },
    { region: 2, centre: (sheet.right + width) / 2, start: top + FIRST + SPACING / 2 },
  ];
  for (const side of sides) {
    for (let k = 0, y = side.start; y <= height - size; k++, y += SPACING) {
      const x = side.centre + (k % 2 === 0 ? -0.18 : 0.18) * size;
      margins.push({ x, y, region: side.region, from: from(x) });
    }
  }
  margins.sort((a, b) => a.y - b.y);
  targets.push(...margins.slice(0, MAX_MARGIN_DICE));
  return { size, regions, targets };
}
