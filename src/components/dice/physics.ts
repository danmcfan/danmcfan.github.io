import { Body, ConvexPolyhedron, Plane, Vec3, World } from "cannon-es";
import { BufferGeometry, Float32BufferAttribute, Quaternion, Vector3 } from "three";

/** A convex solid as outward-facing polygons, wound counter-clockwise from outside. */
export type Polyhedron = {
  vertices: Vector3[];
  faces: number[][];
  normals: Vector3[];
};

/** Position and quaternion per frame, packed as [x, y, z, qx, qy, qz, qw]. */
export type Roll = {
  frames: Float32Array;
  count: number;
  /** Simulations run before one landed flat. */
  attempts: number;
};

export type Throw = {
  position: Vector3;
  quaternion: Quaternion;
  velocity: Vector3;
  angularVelocity: Vector3;
};

export const FRAME_MS = 1000 / 60;
const STEP = 1 / 120;
const MAX_SECONDS = 5;
const FLAT = 0.995;
// Tuned so a throw settles in roughly 1–2.5 s instead of rolling across the page.
const FRICTION = 0.5;
const RESTITUTION = 0.25;
const LINEAR_DAMPING = 0.3;
const ANGULAR_DAMPING = 0.8;
const DOWN = new Vector3(0, -1, 0);

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

/** How squarely the die sits on its lowest face (1 = perfectly flat), and that face. */
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

/** Height of the centre above the floor when the die rests with orientation `q`. */
export function restHeight(poly: Polyhedron, q: Quaternion): number {
  let min = Infinity;
  for (const v of poly.vertices) min = Math.min(min, v.clone().applyQuaternion(q).y);
  return -min;
}

function simulate(poly: Polyhedron, start: Throw): { roll: Roll; flatness: number } {
  const world = new World({ gravity: new Vec3(0, -60, 0), allowSleep: true });
  world.defaultContactMaterial.friction = FRICTION;
  world.defaultContactMaterial.restitution = RESTITUTION;

  const ground = new Body({ mass: 0, shape: new Plane() });
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(ground);

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
  });
  body.position.set(start.position.x, start.position.y, start.position.z);
  body.quaternion.set(start.quaternion.x, start.quaternion.y, start.quaternion.z, start.quaternion.w);
  body.velocity.set(start.velocity.x, start.velocity.y, start.velocity.z);
  body.angularVelocity.set(start.angularVelocity.x, start.angularVelocity.y, start.angularVelocity.z);
  world.addBody(body);

  const maxFrames = Math.ceil(MAX_SECONDS * 60) + 1;
  const frames = new Float32Array(maxFrames * 7);
  let count = 0;
  const record = () => {
    const { position: p, quaternion: q } = body;
    frames.set([p.x, p.y, p.z, q.x, q.y, q.z, q.w], count * 7);
    count++;
  };

  record();
  while (count < maxFrames && body.sleepState !== Body.SLEEPING) {
    world.step(STEP);
    world.step(STEP);
    record();
  }

  const q = body.quaternion;
  const { flatness } = restingFace(poly, new Quaternion(q.x, q.y, q.z, q.w));
  return { roll: { frames, count, attempts: 1 }, flatness };
}

/** Ease the last frames onto an exactly flat resting pose. */
function settleFlat(poly: Polyhedron, roll: Roll) {
  const last = (roll.count - 1) * 7;
  const f = roll.frames;
  const q = new Quaternion(f[last + 3], f[last + 4], f[last + 5], f[last + 6]);
  const { normal } = restingFace(poly, q);
  const fix = new Quaternion().setFromUnitVectors(normal, DOWN);
  const finalQ = fix.clone().multiply(q);
  const finalY = restHeight(poly, finalQ);

  const blend = Math.min(12, roll.count);
  const partial = new Quaternion();
  const frameQ = new Quaternion();
  for (let k = 0; k < blend; k++) {
    const i = (roll.count - blend + k) * 7;
    const t = blend === 1 ? 1 : k / (blend - 1);
    const w = t * t * (3 - 2 * t);
    partial.identity().slerp(fix, w);
    frameQ.set(f[i + 3], f[i + 4], f[i + 5], f[i + 6]).premultiply(partial);
    f[i + 1] += (finalY - f[i + 1]) * w;
    f.set([frameQ.x, frameQ.y, frameQ.z, frameQ.w], i + 3);
  }
}

/**
 * Simulate throws from `makeThrow` until one comes to rest flat on a face,
 * keeping the flattest attempt if none do, then square it up exactly.
 */
export function rollUntilFlat(poly: Polyhedron, makeThrow: () => Throw, attempts = 8): Roll {
  let best: { roll: Roll; flatness: number } | undefined;
  for (let i = 0; i < attempts; i++) {
    const result = simulate(poly, makeThrow());
    result.roll.attempts = i + 1;
    if (!best || result.flatness > best.flatness) best = result;
    if (result.flatness > FLAT) break;
  }
  settleFlat(poly, best!.roll);
  return best!.roll;
}

export function readFrame(roll: Roll, index: number, position: Vector3, quaternion: Quaternion) {
  const i = Math.min(Math.max(index, 0), roll.count - 1) * 7;
  const f = roll.frames;
  position.set(f[i], f[i + 1], f[i + 2]);
  quaternion.set(f[i + 3], f[i + 4], f[i + 5], f[i + 6]);
}
