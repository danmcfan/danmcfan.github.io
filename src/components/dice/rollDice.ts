import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  DirectionalLight,
  DodecahedronGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  OctahedronGeometry,
  OrthographicCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  TetrahedronGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

type RollDiceOptions = {
  canvas: HTMLCanvasElement;
  /** The parchment sheet. Dice land in the desk margins around it. */
  sheet: HTMLElement;
  /** Empty area in the header reserved for dice. */
  tray: HTMLElement;
};

type Target = { x: number; y: number; size: number };

type Die = {
  group: Group;
  body: Group;
  shadow: Mesh;
  target: Target;
  start: { x: number; y: number };
  finalRotation: Quaternion;
  spinAxis: Vector3;
  spinAngle: number;
  delay: number;
  duration: number;
};

const INK = 0x2e2219;

const COLORS = [
  0x8e2b1f, // dragon red
  0x2f63a8, // pencil blue
  0xc9952f, // gilt
  0x3f6f68, // verdigris
  0x6b4e7a, // plum
  0xd98a6c, // rose
  0x6f9a4e, // moss
  0x7aa6c9, // sky
];

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
  geometry.computeVertexNormals();
  geometry.scale(0.85, 0.85, 0.85);
  return geometry;
}

function diceGeometries(): BufferGeometry[] {
  return [
    new IcosahedronGeometry(1),
    new BoxGeometry(1.25, 1.25, 1.25),
    new OctahedronGeometry(1),
    d10Geometry(),
    new DodecahedronGeometry(1),
    new TetrahedronGeometry(1.15),
  ];
}

/** Normal of the first face, used to land each die with a face toward the viewer. */
function firstFaceNormal(geometry: BufferGeometry): Vector3 {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const at = (i: number) => {
    const j = index ? index.getX(i) : i;
    return new Vector3(position.getX(j), position.getY(j), position.getZ(j));
  };
  const [a, b, c] = [at(0), at(1), at(2)];
  return new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a)).normalize();
}

function shadowTexture(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(46,34,25,0.45)");
  gradient.addColorStop(1, "rgba(46,34,25,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

function toonRamp(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 3;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  ["#777", "#bbb", "#fff"].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(i, 0, 1, 1);
  });
  const texture = new CanvasTexture(canvas);
  texture.generateMipmaps = false;
  return texture;
}

/** Spread `count` points down a vertical strip. */
function column(x: number, top: number, bottom: number, count: number, size: number): Target[] {
  const step = (bottom - top) / count;
  return Array.from({ length: count }, (_, i) => ({
    x: x + (i % 2 === 0 ? -0.18 : 0.18) * size,
    y: top + step * (i + 0.5),
    size,
  }));
}

function layout(root: DOMRect, sheet: DOMRect, tray: DOMRect, viewportHeight: number): Target[] {
  const targets: Target[] = [];
  const trayLeft = tray.left - root.left;
  const trayTop = tray.top - root.top;

  // Header tray: a loose row of dice.
  const traySize = Math.min(64, tray.height * 0.6, tray.width / 4.5);
  const trayCount = tray.width > 260 ? 3 : 2;
  for (let i = 0; i < trayCount; i++) {
    targets.push({
      x: trayLeft + (tray.width * (i + 0.5)) / trayCount + (i % 2 ? 6 : -6),
      y: trayTop + tray.height * (i % 2 ? 0.62 : 0.4),
      size: traySize,
    });
  }

  // Desk margins on either side of the sheet, when there is room.
  const margin = sheet.left - root.left;
  if (margin >= 96) {
    const size = Math.min(64, margin * 0.45);
    const top = Math.max(sheet.top - root.top, 24);
    const bottom = viewportHeight - 24;
    const count = viewportHeight > 700 ? 3 : 2;
    targets.push(...column(margin / 2, top, bottom, count, size));
    targets.push(...column(root.width - margin / 2, top + 40, bottom, count - 1, size));
  }
  return targets;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function rollDice(options: RollDiceOptions): () => void {
  const { canvas, sheet, tray } = options;
  const root = canvas.parentElement!;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 0, -1, -500, 500);
  scene.add(new AmbientLight(0xffffff, 1.6));
  const sun = new DirectionalLight(0xffffff, 2.2);
  sun.position.set(-0.6, 0.9, 1.4);
  scene.add(sun);

  const geometries = diceGeometries();
  const ramp = toonRamp();
  const shadowMap = shadowTexture();
  const edgeMaterial = new LineBasicMaterial({ color: INK, transparent: true, opacity: 0.85 });
  const shadowGeometry = new PlaneGeometry(1, 1);
  const shadowMaterial = new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false });
  const materials: MeshToonMaterial[] = [];
  const edgeGeometries: EdgesGeometry[] = [];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dice: Die[] = [];
  let width = 0;
  let height = 0;

  const resize = () => {
    width = root.clientWidth;
    height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.right = width;
    camera.bottom = -height;
    camera.updateProjectionMatrix();
  };

  const place = (die: Die, t: number) => {
    const eased = easeOutCubic(t);
    const x = die.start.x + (die.target.x - die.start.x) * eased;
    const y = die.start.y + (die.target.y - die.start.y) * eased;
    // Bounces that shrink as the die settles; drives scale and shadow offset.
    const hop = Math.abs(Math.cos(Math.PI * 2.5 * t)) * (1 - t) ** 2;
    die.group.position.set(x, -y, 0);
    die.body.scale.setScalar(die.target.size * 0.5 * (1 + hop * 0.35));
    const spin = new Quaternion().setFromAxisAngle(die.spinAxis, die.spinAngle * (1 - eased));
    die.body.quaternion.copy(die.finalRotation).multiply(spin);
    const lift = hop * die.target.size * 0.6;
    die.shadow.position.set(die.target.size * 0.12 + lift * 0.5, -die.target.size * 0.18 - lift * 0.6, -200);
    die.shadow.scale.setScalar(die.target.size * (1.15 - hop * 0.3));
    (die.shadow.material as MeshBasicMaterial).opacity = 0.9 - hop * 0.5;
  };

  const build = () => {
    const rootRect = root.getBoundingClientRect();
    const targets = layout(rootRect, sheet.getBoundingClientRect(), tray.getBoundingClientRect(), height);
    dice = targets.map((target, i) => {
      const geometry = geometries[i % geometries.length];
      const material = new MeshToonMaterial({
        color: COLORS[i % COLORS.length],
        gradientMap: ramp,
      });
      materials.push(material);
      const edges = new EdgesGeometry(geometry, 10);
      edgeGeometries.push(edges);

      const body = new Group();
      body.add(new Mesh(geometry, material), new LineSegments(edges, edgeMaterial));
      const shadow = new Mesh(shadowGeometry, shadowMaterial.clone());
      const group = new Group();
      group.add(shadow, body);
      scene.add(group);

      const faceUp = new Quaternion().setFromUnitVectors(firstFaceNormal(geometry), new Vector3(0, 0, 1));
      const twist = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.random() * Math.PI * 2);
      // Rest slightly tipped so the die reads as a solid, not a flat outline.
      const tiltAxis = new Vector3(Math.random() - 0.5, Math.random() - 0.5, 0).normalize();
      const tilt = new Quaternion().setFromAxisAngle(tiltAxis, 0.4 + Math.random() * 0.25);
      const fromLeft = target.x < width / 2;
      return {
        group,
        body,
        shadow,
        target,
        start: {
          x: fromLeft ? -120 - Math.random() * 200 : width + 120 + Math.random() * 200,
          y: target.y - 260 - Math.random() * 200,
        },
        finalRotation: tilt.multiply(twist).multiply(faceUp),
        spinAxis: new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        spinAngle: Math.PI * (4 + Math.random() * 2),
        delay: i * 110 + Math.random() * 140,
        duration: 1300 + Math.random() * 500,
      };
    });
  };

  resize();
  build();

  let frame = 0;
  const startedAt = performance.now();
  const tick = (now: number) => {
    let running = false;
    for (const die of dice) {
      const t = Math.min(Math.max((now - startedAt - die.delay) / die.duration, 0), 1);
      place(die, t);
      if (t < 1) running = true;
    }
    renderer.render(scene, camera);
    frame = running ? requestAnimationFrame(tick) : 0;
  };

  if (reduceMotion) {
    for (const die of dice) place(die, 1);
    renderer.render(scene, camera);
  } else {
    frame = requestAnimationFrame(tick);
  }

  // After a resize, settle the dice at their new spots without rolling again.
  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      cancelAnimationFrame(frame);
      frame = 0;
      for (const die of dice) scene.remove(die.group);
      resize();
      build();
      for (const die of dice) place(die, 1);
      renderer.render(scene, camera);
    }, 150);
  };
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    for (const geometry of [...geometries, ...edgeGeometries, shadowGeometry]) geometry.dispose();
    for (const material of [...materials, edgeMaterial, shadowMaterial]) material.dispose();
    ramp.dispose();
    shadowMap.dispose();
    renderer.dispose();
  };
}
