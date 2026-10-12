import { describe, expect, test } from "bun:test";
import { Quaternion, Vector3 } from "three";

import { DiceTable, flatness, type TableDie } from "./physics";
import { dicePolyhedra } from "./shapes";

const shapes = dicePolyhedra();
const region = { x0: 0, x1: 7, z0: 0, z1: 40 };

/** Step until every die has come to rest, or give up after `seconds`. */
function settle(table: DiceTable, seconds = 20) {
  for (let t = 0; t < seconds && !table.settled; t += 1 / 60) table.step(1 / 60);
  return table.settled;
}

const orientation = (die: TableDie) => {
  const q = die.body.quaternion;
  return new Quaternion(q.x, q.y, q.z, q.w);
};

function expectInside(die: TableDie) {
  const { x, z } = die.body.position;
  expect(x).toBeGreaterThan(region.x0);
  expect(x).toBeLessThan(region.x1);
  expect(z).toBeGreaterThan(region.z0);
  expect(z).toBeLessThan(region.z1);
}

describe("DiceTable", () => {
  test("a die thrown in from off the page edge ends up inside its walls", () => {
    for (let kind = 0; kind < shapes.length; kind++) {
      const table = new DiceTable(shapes);
      table.setRegions([region]);
      const die = table.add(kind, 0, { x: 3.5, z: 10 });
      // Hard enough to fly straight across the region if the far wall were missing.
      table.throwIn(die, {
        position: new Vector3(-2, 5, 10),
        quaternion: new Quaternion(),
        velocity: new Vector3(40, 0, 1),
        angularVelocity: new Vector3(5, 8, -3),
      });
      expect(settle(table)).toBe(true);
      expectInside(die);
    }
  });

  test("a die thrown at a resting die knocks it", () => {
    const table = new DiceTable(shapes);
    table.setRegions([{ x0: -20, x1: 20, z0: -20, z1: 20 }]);
    const target = table.add(1, 0, { x: 0, z: 0 });
    table.place(target, 0, 0);
    const before = target.body.position.clone();
    const thrown = table.add(0, 0, { x: -3, z: 0 });
    table.throwIn(thrown, {
      position: new Vector3(-3, 1.2, 0),
      quaternion: new Quaternion(),
      velocity: new Vector3(12, 2, 0),
      angularVelocity: new Vector3(0, 0, -6),
    });
    settle(table);
    expect(target.body.position.distanceTo(before)).toBeGreaterThan(0.3);
  });

  test("every die comes to rest flat on a face", () => {
    const table = new DiceTable(shapes);
    table.setRegions([{ x0: -30, x1: 30, z0: -30, z1: 30 }]);
    const dice = Array.from({ length: 12 }, (_, i) => {
      const die = table.add(i % shapes.length, 0, { x: (i % 4) * 4 - 6, z: Math.floor(i / 4) * 4 - 4 });
      table.throwIn(die, {
        position: new Vector3((i % 4) * 4 - 6, 4 + i * 0.5, Math.floor(i / 4) * 4 - 4),
        quaternion: new Quaternion().setFromAxisAngle(new Vector3(1, 2, 3).normalize(), i),
        velocity: new Vector3(1, 0, -1),
        angularVelocity: new Vector3(20, -14, 9),
      });
      return die;
    });
    expect(settle(table, 30)).toBe(true);
    for (const die of dice) expect(flatness(shapes[die.kind], orientation(die))).toBeGreaterThan(0.995);
  });

  test("a die that stops outside its region is sent back", () => {
    const table = new DiceTable(shapes);
    table.setRegions([region]);
    const die = table.add(2, 0, { x: 3.5, z: 10 });
    // Thrown in far too gently to clear the edge of the region.
    table.throwIn(die, {
      position: new Vector3(-4, 1.2, 10),
      quaternion: new Quaternion(),
      velocity: new Vector3(1, 0, 0),
      angularVelocity: new Vector3(),
    });
    expect(settle(table)).toBe(true);
    expectInside(die);
  });
});
