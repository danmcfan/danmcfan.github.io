import {
  BoxGeometry,
  BufferGeometry,
  DodecahedronGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
  Vector3,
} from "three";

import { type Polyhedron, polyhedronFromGeometry } from "./physics";

/** Pentagonal trapezohedron (d10), with kites kept planar. */
function d10Geometry(): BufferGeometry {
  const e = 0.1;
  const h = (e * (1 + Math.cos(Math.PI / 5))) / (1 - Math.cos(Math.PI / 5));
  const ring = Array.from({ length: 10 }, (_, k) => {
    const a = (k * Math.PI) / 5;
    return new Vector3(Math.cos(a), Math.sin(a), k % 2 === 0 ? e : -e);
  });
  const top = new Vector3(0, 0, h);
  const bottom = new Vector3(0, 0, -h);
  const tris: Vector3[][] = [];
  for (let k = 0; k < 10; k += 2) {
    const [a, b, c] = [ring[k], ring[(k + 1) % 10], ring[(k + 2) % 10]];
    tris.push([top, a, b], [top, b, c]);
  }
  for (let k = 1; k < 10; k += 2) {
    const [a, b, c] = [ring[k], ring[(k + 1) % 10], ring[(k + 2) % 10]];
    tris.push([bottom, a, b], [bottom, b, c]);
  }
  const positions: number[] = [];
  for (const [p, q, r] of tris) {
    const normal = new Vector3().subVectors(q, p).cross(new Vector3().subVectors(r, p));
    const centroid = new Vector3().add(p).add(q).add(r);
    const ordered = normal.dot(centroid) >= 0 ? [p, q, r] : [p, r, q];
    for (const v of ordered) positions.push(v.x, v.y, v.z);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.scale(0.85, 0.85, 0.85);
  return geometry;
}

/** d20, d6, d8, d10, d12 and d4, sized so each spans roughly two units. */
export function dicePolyhedra(): Polyhedron[] {
  return [
    new IcosahedronGeometry(1),
    new BoxGeometry(1.25, 1.25, 1.25),
    new OctahedronGeometry(1),
    d10Geometry(),
    new DodecahedronGeometry(1),
    new TetrahedronGeometry(1.15),
  ].map((geometry) => {
    const poly = polyhedronFromGeometry(geometry);
    geometry.dispose();
    return poly;
  });
}
