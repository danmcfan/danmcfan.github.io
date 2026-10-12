import { Body, Box, ContactMaterial, ConvexPolyhedron, Material, Plane, Vec3, World } from "cannon-es";
import { BufferGeometry, Float32BufferAttribute, Quaternion, Vector3 } from "three";

/** A convex solid as outward-facing polygons, wound counter-clockwise from outside. */
export type Polyhedron = {
  vertices: Vector3[];
  faces: number[][];
  normals: Vector3[];
};

export type Throw = {
  position: Vector3;
  quaternion: Quaternion;
  velocity: Vector3;
  angularVelocity: Vector3;
};

/** A walled-off area of the table, in physics units. */
export type Bounds = { x0: number; x1: number; z0: number; z1: number };

export type TableDie = {
  kind: number;
  /** Index into the table's regions. */
  region: number;
  /** Where the die is sent back to if it comes to rest outside its region. */
  home: { x: number; z: number };
  body: Body;
  /** Off the table, moving, being eased flat, or at rest. */
  state: "idle" | "moving" | "easing" | "rest";
  /** Still flying in from off the page, so its region's walls are ignored. */
  entering: boolean;
  /** Corrections since it was last thrown. */
  nudges: number;
  /** Seconds since it was last thrown. */
  age: number;
  ease?: { from: Quaternion; to: Quaternion; fromY: number; toY: number; t: number };
  /** Set when a moving die strikes this one at rest; applied after the step. */
  knock?: { x: number; z: number; speed: number };
};

const STEP = 1 / 120;
const MAX_STEPS = 12;
export const GRAVITY = 60;
const FLAT = 0.995;
/** Close enough to flat to ease the rest of the way rather than kick the die again. */
const NEARLY_FLAT = 0.9;
const EASE_SECONDS = 0.15;
const MAX_NUDGES = 3;
/** Slowest strike that knocks a resting die on. */
const KNOCK_SPEED = 2;
/** A die still moving after this long is put back on its home spot. */
const GIVE_UP_SECONDS = 10;
// Tuned so a throw settles in roughly 1–2.5 s instead of rolling across the page.
const FRICTION = 0.5;
const RESTITUTION = 0.25;
// Dice glance off each other with little grip and a lively bounce, so a hit knocks the other die on.
const DICE_FRICTION = 0.05;
const DICE_RESTITUTION = 0.6;
const LINEAR_DAMPING = 0.3;
const ANGULAR_DAMPING = 0.8;
const WALL_HEIGHT = 40;
const DOWN = new Vector3(0, -1, 0);

const FLOOR_GROUP = 1;
const DIE_GROUP = 2;
const wallGroup = (region: number) => 4 << region;

const random = (min: number, max: number) => min + Math.random() * (max - min);

/** Merge a triangle mesh's vertices and join coplanar triangles into polygons. */
export function polyhedronFromGeometry(geometry: BufferGeometry): Polyhedron {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const count = index ? index.count : position.count;

  const vertices: Vector3[] = [];
  const lookup = new Map<string, number>();
  const vertexAt = (i: number) => {
    const j = index ? index.getX(i) : i;
    const v = new Vector3(position.getX(j), position.getY(j), position.getZ(j));
    const key = [v.x, v.y, v.z].map((n) => Math.round(n * 1e4)).join();
    let id = lookup.get(key);
    if (id === undefined) {
      id = vertices.push(v) - 1;
      lookup.set(key, id);
    }
    return id;
  };

  const planes: { normal: Vector3; offset: number; ids: Set<number> }[] = [];
  for (let i = 0; i < count; i += 3) {
    const ids = [vertexAt(i), vertexAt(i + 1), vertexAt(i + 2)];
    const [a, b, c] = ids.map((id) => vertices[id]);
    const normal = new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a)).normalize();
    const offset = normal.dot(a);
    let plane = planes.find((p) => p.normal.dot(normal) > 0.9999 && Math.abs(p.offset - offset) < 1e-4);
    if (!plane) {
      plane = { normal, offset, ids: new Set() };
      planes.push(plane);
    }
    for (const id of ids) plane.ids.add(id);
  }

  const faces = planes.map(({ normal, ids }) => {
    const list = [...ids];
    const centre = list.reduce((sum, id) => sum.add(vertices[id]), new Vector3()).divideScalar(list.length);
    const u = new Vector3().subVectors(vertices[list[0]], centre).normalize();
    const w = new Vector3().crossVectors(normal, u);
    const angle = (id: number) => {
      const d = new Vector3().subVectors(vertices[id], centre);
      return Math.atan2(d.dot(w), d.dot(u));
    };
    return list.sort((p, q) => angle(p) - angle(q));
  });

  return { vertices, faces, normals: planes.map((p) => p.normal) };
}

/** Flat-shaded mesh geometry built from the same polygons the physics uses. */
export function geometryFromPolyhedron(poly: Polyhedron): BufferGeometry {
  const positions: number[] = [];
  for (const face of poly.faces) {
    for (let k = 1; k < face.length - 1; k++) {
      for (const id of [face[0], face[k], face[k + 1]]) {
        const v = poly.vertices[id];
        positions.push(v.x, v.y, v.z);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** The face pointing most nearly down, and how squarely (1 = perfectly flat). */
function restingFace(poly: Polyhedron, q: Quaternion) {
  let best = -Infinity;
  let normal = new Vector3();
  for (const n of poly.normals) {
    const world = n.clone().applyQuaternion(q);
    const d = world.dot(DOWN);
    if (d > best) {
      best = d;
      normal = world;
    }
  }
  return { flatness: best, normal };
}

/** How squarely the die sits on its lowest face: 1 is perfectly flat. */
export function flatness(poly: Polyhedron, q: Quaternion): number {
  return restingFace(poly, q).flatness;
}

/** `q` turned the least amount that leaves the die resting flat on a face. */
export function flatten(poly: Polyhedron, q: Quaternion): Quaternion {
  const { normal } = restingFace(poly, q);
  return new Quaternion().setFromUnitVectors(normal, DOWN).multiply(q);
}

/** Height of the centre above the floor when the die rests with orientation `q`. */
export function restHeight(poly: Polyhedron, q: Quaternion): number {
  let min = Infinity;
  for (const v of poly.vertices) min = Math.min(min, v.clone().applyQuaternion(q).y);
  return -min;
}

const toThree = (q: { x: number; y: number; z: number; w: number }) => new Quaternion(q.x, q.y, q.z, q.w);

/**
 * One shared physics world for every die on the page. Dice collide with each
 * other, the floor, and the invisible walls of their own region.
 */
export class DiceTable {
  readonly dice: TableDie[] = [];
  private readonly world: World;
  private readonly shapes: Polyhedron[];
  private readonly radii: number[];
  private regions: Bounds[] = [];
  private walls: Body[] = [];
  private pending = 0;
  private readonly material = new Material("die");
  private readonly byBody = new Map<Body, TableDie>();

  constructor(shapes: Polyhedron[]) {
    this.shapes = shapes;
    this.radii = shapes.map((poly) => Math.max(...poly.vertices.map((v) => v.length())));
    this.world = new World({ gravity: new Vec3(0, -GRAVITY, 0), allowSleep: true });
    this.world.defaultContactMaterial.friction = FRICTION;
    this.world.defaultContactMaterial.restitution = RESTITUTION;
    this.world.addContactMaterial(
      new ContactMaterial(this.material, this.material, { friction: DICE_FRICTION, restitution: DICE_RESTITUTION }),
    );

    const floor = new Body({
      mass: 0,
      shape: new Plane(),
      collisionFilterGroup: FLOOR_GROUP,
      collisionFilterMask: DIE_GROUP,
    });
    floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(floor);
  }

  /** True once every die on the table has come to rest. */
  get settled(): boolean {
    return this.dice.every((die) => die.state === "idle" || die.state === "rest");
  }

  /** Replace the walled regions. Dice keep their region indices. */
  setRegions(regions: Bounds[]) {
    for (const wall of this.walls) this.world.removeBody(wall);
    this.regions = regions;
    this.walls = regions.flatMap((bounds, i) => {
      const { x0, x1, z0, z1 } = bounds;
      const halfX = (x1 - x0) / 2 + 1;
      const halfZ = (z1 - z0) / 2 + 1;
      const midX = (x0 + x1) / 2;
      const midZ = (z0 + z1) / 2;
      return [
        { at: [x0 - 0.5, midZ], half: [0.5, halfZ] },
        { at: [x1 + 0.5, midZ], half: [0.5, halfZ] },
        { at: [midX, z0 - 0.5], half: [halfX, 0.5] },
        { at: [midX, z1 + 0.5], half: [halfX, 0.5] },
      ].map(({ at, half }) => {
        const wall = new Body({
          mass: 0,
          shape: new Box(new Vec3(half[0], WALL_HEIGHT, half[1])),
          position: new Vec3(at[0], WALL_HEIGHT, at[1]),
          collisionFilterGroup: wallGroup(i),
          collisionFilterMask: DIE_GROUP,
        });
        this.world.addBody(wall);
        return wall;
      });
    });
    for (const die of this.dice) this.updateMask(die);
  }

  /** A die off the table, ready to be thrown or placed. */
  add(kind: number, region: number, home: { x: number; z: number }): TableDie {
    const poly = this.shapes[kind];
    const body = new Body({
      mass: 1,
      shape: new ConvexPolyhedron({
        vertices: poly.vertices.map((v) => new Vec3(v.x, v.y, v.z)),
        faces: poly.faces,
      }),
      linearDamping: LINEAR_DAMPING,
      angularDamping: ANGULAR_DAMPING,
      sleepSpeedLimit: 0.25,
      sleepTimeLimit: 0.25,
      collisionFilterGroup: DIE_GROUP,
      material: this.material,
    });
    const die: TableDie = { kind, region, home, body, state: "idle", entering: false, nudges: 0, age: 0 };
    this.dice.push(die);
    this.byBody.set(body, die);
    body.addEventListener("collide", (event: { body: Body }) => this.struck(die, event.body));
    return die;
  }

  remove(die: TableDie) {
    this.world.removeBody(die.body);
    this.dice.splice(this.dice.indexOf(die), 1);
    this.byBody.delete(die.body);
  }

  /** Throw a die in from off the page. Walls ignore it until it is inside its region. */
  throwIn(die: TableDie, start: Throw) {
    const { body } = die;
    body.position.set(start.position.x, start.position.y, start.position.z);
    body.quaternion.set(start.quaternion.x, start.quaternion.y, start.quaternion.z, start.quaternion.w);
    body.velocity.set(start.velocity.x, start.velocity.y, start.velocity.z);
    body.angularVelocity.set(start.angularVelocity.x, start.angularVelocity.y, start.angularVelocity.z);
    die.entering = true;
    this.launch(die);
  }

  /** Flick a die already on the table. */
  hop(die: TableDie, velocity: Vector3, spin: Vector3) {
    die.body.velocity.set(velocity.x, velocity.y, velocity.z);
    die.body.angularVelocity.set(spin.x, spin.y, spin.z);
    this.launch(die);
  }

  /** Set a die down at rest, flat on a face, at (x, z). */
  place(die: TableDie, x: number, z: number, orientation?: Quaternion) {
    const poly = this.shapes[die.kind];
    const q = flatten(
      poly,
      orientation ??
        new Quaternion().setFromAxisAngle(
          new Vector3(random(-1, 1), random(-1, 1), random(-1, 1)).normalize(),
          random(0, 7),
        ),
    );
    const { body } = die;
    body.position.set(x, restHeight(poly, q), z);
    body.quaternion.set(q.x, q.y, q.z, q.w);
    body.velocity.setZero();
    body.angularVelocity.setZero();
    die.entering = false;
    die.state = "rest";
    die.ease = undefined;
    this.updateMask(die);
    if (!this.world.bodies.includes(body)) this.world.addBody(body);
    body.aabbNeedsUpdate = true;
    body.sleep();
  }

  /** Advance the simulation by `seconds` of wall-clock time in fixed steps. */
  step(seconds: number) {
    this.pending = Math.min(this.pending + seconds, STEP * MAX_STEPS);
    while (this.pending >= STEP) {
      this.world.step(STEP);
      this.pending -= STEP;
      for (const die of this.dice) this.update(die, STEP);
    }
  }

  /** Whether the die's centre lies within its region. */
  contains(die: TableDie): boolean {
    return this.inside(die, 0);
  }

  /** Lowest point of the die above the floor. */
  lift(die: TableDie): number {
    return die.body.position.y - restHeight(this.shapes[die.kind], toThree(die.body.quaternion));
  }

  private launch(die: TableDie) {
    die.state = "moving";
    die.ease = undefined;
    die.nudges = 0;
    die.age = 0;
    this.updateMask(die);
    if (!this.world.bodies.includes(die.body)) this.world.addBody(die.body);
    die.body.wakeUp();
  }

  private updateMask(die: TableDie) {
    die.body.collisionFilterMask = FLOOR_GROUP | DIE_GROUP | (die.entering ? 0 : wallGroup(die.region));
  }

  private inside(die: TableDie, inset: number) {
    const bounds = this.regions[die.region];
    if (!bounds) return true;
    const { x, z } = die.body.position;
    return x > bounds.x0 + inset && x < bounds.x1 - inset && z > bounds.z0 + inset && z < bounds.z1 - inset;
  }

  private update(die: TableDie, dt: number) {
    const { body } = die;
    if (die.state === "idle") return;
    const asleep = body.sleepState === Body.SLEEPING;

    if (die.knock) return this.knockOn(die);

    if (die.state === "rest") {
      if (!asleep) this.launch(die);
      return;
    }

    if (die.state === "easing") {
      if (!asleep) return this.launch(die);
      const ease = die.ease!;
      ease.t = Math.min(ease.t + dt / EASE_SECONDS, 1);
      const w = ease.t * ease.t * (3 - 2 * ease.t);
      const q = ease.from.clone().slerp(ease.to, w);
      body.quaternion.set(q.x, q.y, q.z, q.w);
      body.position.y = ease.fromY + (ease.toY - ease.fromY) * w;
      body.aabbNeedsUpdate = true;
      if (ease.t === 1) {
        die.state = "rest";
        die.ease = undefined;
      }
      return;
    }

    die.age += dt;
    if (die.entering && this.inside(die, this.radii[die.kind])) {
      die.entering = false;
      this.updateMask(die);
    }
    if (die.age > GIVE_UP_SECONDS) {
      this.place(die, die.home.x, die.home.z, toThree(body.quaternion));
      return;
    }
    if (asleep) this.resolve(die);
  }

  /**
   * A face resting flat on the floor grips it hard in cannon, so a struck die
   * barely slides. Pop it up and away from the striker instead, like a real knock.
   */
  private struck(die: TableDie, other: Body) {
    const striker = this.byBody.get(other);
    if (striker?.state !== "moving" || (die.state !== "rest" && die.state !== "easing")) return;
    const { velocity } = other;
    const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
    if (speed < KNOCK_SPEED) return;
    const dx = die.body.position.x - other.position.x;
    const dz = die.body.position.z - other.position.z;
    const length = Math.hypot(dx, dz) || 1;
    die.knock = { x: dx / length, z: dz / length, speed };
  }

  private knockOn(die: TableDie) {
    const { x, z, speed } = die.knock!;
    die.knock = undefined;
    const push = Math.min(speed, 20) * 0.8;
    die.body.velocity.set(x * push, 5 + push * 0.5, z * push);
    die.body.angularVelocity.set(z * push * 1.5, random(-4, 4), -x * push * 1.5);
    this.launch(die);
  }

  /** A die has stopped moving: accept it, square it up, or send it on again. */
  private resolve(die: TableDie) {
    const { body } = die;
    const poly = this.shapes[die.kind];
    const q = toThree(body.quaternion);

    if (die.entering || !this.inside(die, 0)) {
      if (++die.nudges > MAX_NUDGES) {
        this.place(die, die.home.x, die.home.z, q);
        return;
      }
      // Hop back toward home: a vertical speed of 12 keeps it airborne for 0.4 s.
      const flight = (2 * 12) / GRAVITY;
      const dx = die.home.x - body.position.x;
      const dz = die.home.z - body.position.z;
      body.velocity.set(dx / flight, 12, dz / flight);
      body.angularVelocity.set(random(-6, 6), random(-6, 6), random(-6, 6));
      body.wakeUp();
      return;
    }

    const flat = flatness(poly, q);
    if (flat > FLAT) {
      die.state = "rest";
      return;
    }
    if (flat > NEARLY_FLAT || die.nudges >= MAX_NUDGES) {
      const to = flatten(poly, q);
      die.ease = { from: q, to, fromY: body.position.y, toY: restHeight(poly, to), t: 0 };
      die.state = "easing";
      return;
    }
    die.nudges++;
    body.velocity.set(random(-1, 1), 6, random(-1, 1));
    body.angularVelocity.set(random(-8, 8), random(-8, 8), random(-8, 8));
    body.wakeUp();
  }
}
