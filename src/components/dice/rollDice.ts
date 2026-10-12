import {
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  DirectionalLight,
  EdgesGeometry,
  Euler,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

import {
  FRAME_MS,
  geometryFromPolyhedron,
  type Polyhedron,
  readFrame,
  type Roll,
  rollUntilFlat,
  type Throw,
} from "./physics";
import { dicePolyhedra } from "./shapes";

type RollDiceOptions = {
  canvas: HTMLCanvasElement;
  /** The centred content column. Dice land in the margins around it. */
  sheet: HTMLElement;
  /** Empty area in the header reserved for dice. */
  tray: HTMLElement;
};

type Target = { x: number; y: number; size: number };

type Die = {
  kind: number;
  group: Group;
  mesh: Mesh;
  material: MeshToonMaterial;
  shadow: Mesh;
  shadowMaterial: MeshBasicMaterial;
  target: Target;
  /** Pixels per physics unit. */
  scale: number;
  roll: Roll;
  /** World offset added to the scaled physics frames. */
  offset: Vector3;
  /** Horizontal drift blended in over the roll so the die settles on its target. */
  correction: Vector3;
  startAt: number;
  rolling: boolean;
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

// The camera looks down at the table tilted toward the viewer, so dice resting flat still show their sides.
const PITCH = (33 * Math.PI) / 180;
const SIN = Math.sin(PITCH);
const COS = Math.cos(PITCH);
const CAMERA_DISTANCE = 3000;

const random = (min: number, max: number) => min + Math.random() * (max - min);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function randomQuaternion() {
  return new Quaternion().setFromEuler(new Euler(random(0, 7), random(0, 7), random(0, 7)));
}

function randomSpin(speed: number) {
  return new Vector3(random(-speed, speed), random(-speed, speed), random(-speed, speed));
}

/** A throw onto the table from off the near side edge and above. */
function throwIn(fromLeft: boolean): Throw {
  const side = fromLeft ? 1 : -1;
  const across = random(16, 20);
  const back = random(4, 8);
  const direction = new Vector3(side * across, 0, back).normalize();
  return {
    position: new Vector3(-side * across, random(5, 6), -back),
    quaternion: randomQuaternion(),
    velocity: direction.multiplyScalar(random(24, 28)).add(new Vector3(0, -2, 0)),
    angularVelocity: randomSpin(20),
  };
}

/** A flick straight up from where the die rests. */
function throwUp(height: number, quaternion: Quaternion): Throw {
  return {
    position: new Vector3(0, height, 0),
    quaternion: quaternion.clone(),
    velocity: new Vector3(random(-2, 2), random(18, 22), random(-2, 2)),
    angularVelocity: randomSpin(30),
  };
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

  // Margins on either side of the content column, when there is room.
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

export function rollDice(options: RollDiceOptions): () => void {
  const { canvas, sheet, tray } = options;
  const root = canvas.parentElement!;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Orthographic in pixel units: a point on the table at (x, y, z) lands on screen at
  // (x, z·cos − y·sin), so page coordinates map straight onto the table.
  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 0, -1, 1, CAMERA_DISTANCE * 2);
  camera.position.set(0, CAMERA_DISTANCE * COS, CAMERA_DISTANCE * SIN);
  camera.lookAt(0, 0, 0);
  scene.add(new AmbientLight(0xffffff, 1.6));
  const sun = new DirectionalLight(0xffffff, 2.2);
  sun.position.set(-0.8, 1.6, 1);
  scene.add(sun);

  const shapes: Polyhedron[] = dicePolyhedra();
  const geometries: BufferGeometry[] = shapes.map(geometryFromPolyhedron);
  const edges = geometries.map((geometry) => new EdgesGeometry(geometry, 10));
  const ramp = toonRamp();
  const shadowMap = shadowTexture();
  const edgeMaterial = new LineBasicMaterial({ color: INK, transparent: true, opacity: 0.85 });
  const shadowGeometry = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dice: Die[] = [];
  let width = 0;
  let height = 0;
  let frame = 0;

  const resize = () => {
    width = root.clientWidth;
    height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.right = width;
    camera.bottom = -height;
    camera.updateProjectionMatrix();
  };

  /** Where a die's centre sits on the table to appear over `target` at `lift` px high. */
  const home = (target: Target, lift: number) =>
    new Vector3(target.x, lift, (target.y + lift * SIN) / COS);

  const framePosition = new Vector3();
  const frameQuaternion = new Quaternion();
  const nextPosition = new Vector3();
  const nextQuaternion = new Quaternion();

  /** Point the die's playback at `roll`, ending exactly on its target. */
  const play = (die: Die, roll: Roll, startAt: number, fromCurrent: boolean) => {
    readFrame(roll, roll.count - 1, framePosition, frameQuaternion);
    const end = framePosition.clone().multiplyScalar(die.scale);
    const goal = home(die.target, end.y);
    die.roll = roll;
    die.startAt = startAt;
    die.rolling = true;
    if (fromCurrent) {
      readFrame(roll, 0, framePosition, frameQuaternion);
      die.offset.copy(die.group.position).sub(framePosition.multiplyScalar(die.scale)).setY(0);
      die.correction.copy(goal).sub(end).sub(die.offset).setY(0);
    } else {
      die.offset.copy(goal).sub(end).setY(0);
      die.correction.set(0, 0, 0);
    }
  };

  /** Pose the die for time `now`. Returns true once it has come to rest. */
  const pose = (die: Die, now: number) => {
    const { roll, scale } = die;
    const progress = Math.max(now - die.startAt, 0) / FRAME_MS;
    const last = roll.count - 1;
    const index = Math.min(Math.floor(progress), last);
    const blend = Math.min(progress - index, 1);
    readFrame(roll, index, framePosition, frameQuaternion);
    readFrame(roll, index + 1, nextPosition, nextQuaternion);
    framePosition.lerp(nextPosition, blend);
    frameQuaternion.slerp(nextQuaternion, blend);

    const drift = last > 0 ? smoothstep(Math.min(progress / last, 1)) : 1;
    die.group.position
      .copy(framePosition)
      .multiplyScalar(scale)
      .add(die.offset)
      .addScaledVector(die.correction, drift);
    die.group.quaternion.copy(frameQuaternion);
    die.group.scale.setScalar(scale);

    // Shadow on the table, drifting away from the light as the die rises.
    readFrame(roll, last, nextPosition, nextQuaternion);
    const rise = Math.max(framePosition.y - nextPosition.y, 0);
    const { x, z } = die.group.position;
    die.shadow.position.set(x + scale * (0.15 + rise * 0.5), 0.5, z - scale * (0.1 + rise * 0.3));
    die.shadow.scale.setScalar(scale * 2.3 * (1 + rise * 0.08));
    die.shadowMaterial.opacity = 0.85 * Math.max(1 - rise / 8, 0.2);

    return progress >= last;
  };

  const tick = (now: number) => {
    let running = false;
    for (const die of dice) {
      if (!die.rolling) continue;
      if (pose(die, now)) die.rolling = false;
      else running = true;
    }
    renderer.render(scene, camera);
    frame = running ? requestAnimationFrame(tick) : 0;
  };

  const animate = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const settle = (die: Die) => {
    play(die, die.roll, -Infinity, false);
    pose(die, 0);
    die.rolling = false;
  };

  const addDie = (target: Target, index: number, startAt: number) => {
    const kind = index % shapes.length;
    const material = new MeshToonMaterial({ color: COLORS[index % COLORS.length], gradientMap: ramp });
    const mesh = new Mesh(geometries[kind], material);
    const group = new Group();
    group.add(mesh, new LineSegments(edges[kind], edgeMaterial));
    const shadowMaterial = new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false });
    const shadow = new Mesh(shadowGeometry, shadowMaterial);
    scene.add(shadow, group);

    const die: Die = {
      kind,
      group,
      mesh,
      material,
      shadow,
      shadowMaterial,
      target,
      scale: target.size / 2,
      roll: rollUntilFlat(shapes[kind], () => throwIn(target.x < width / 2)),
      offset: new Vector3(),
      correction: new Vector3(),
      startAt,
      rolling: true,
    };
    dice.push(die);
    if (startAt === -Infinity) settle(die);
    else play(die, die.roll, startAt, false);
  };

  const removeDie = (die: Die) => {
    scene.remove(die.group, die.shadow);
    die.material.dispose();
    die.shadowMaterial.dispose();
  };

  const targets = () =>
    layout(root.getBoundingClientRect(), sheet.getBoundingClientRect(), tray.getBoundingClientRect(), height);

  resize();
  const now = performance.now();
  targets().forEach((target, i) => {
    addDie(target, i, reduceMotion ? -Infinity : now + i * 160 + random(0, 140));
  });
  if (reduceMotion) renderer.render(scene, camera);
  else animate();

  const reroll = (die: Die) => {
    readFrame(die.roll, die.roll.count - 1, framePosition, frameQuaternion);
    const resting = frameQuaternion.clone();
    const lift = framePosition.y;
    const roll = rollUntilFlat(shapes[die.kind], () => throwUp(lift, resting));
    play(die, roll, performance.now(), true);
    if (reduceMotion) {
      pose(die, Infinity);
      die.rolling = false;
      renderer.render(scene, camera);
    } else {
      animate();
    }
  };

  // Dice sit above the page with pointer-events off, so hit-test them by hand.
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const dieAt = (event: MouseEvent): Die | undefined => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return undefined;
    pointer.set((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const resting = dice.filter((die) => !die.rolling);
    const [hit] = raycaster.intersectObjects(
      resting.map((die) => die.mesh),
      false,
    );
    return hit && resting.find((die) => die.mesh === hit.object);
  };

  let hovering = false;
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const over = dieAt(event) !== undefined;
    if (over === hovering) return;
    hovering = over;
    document.body.style.cursor = over ? "pointer" : "";
  };

  const onClick = (event: MouseEvent) => {
    const die = dieAt(event);
    if (!die) return;
    event.preventDefault();
    event.stopPropagation();
    reroll(die);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("click", onClick, true);

  // After a resize, settle the dice at their new spots without rolling again.
  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      cancelAnimationFrame(frame);
      frame = 0;
      resize();
      const next = targets();
      for (const die of dice.splice(next.length)) removeDie(die);
      next.forEach((target, i) => {
        const die = dice[i];
        if (!die) {
          addDie(target, i, -Infinity);
          return;
        }
        die.target = target;
        die.scale = target.size / 2;
        settle(die);
      });
      renderer.render(scene, camera);
    }, 150);
  };
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("click", onClick, true);
    if (hovering) document.body.style.cursor = "";
    for (const die of dice) removeDie(die);
    for (const geometry of [...geometries, ...edges, shadowGeometry]) geometry.dispose();
    edgeMaterial.dispose();
    ramp.dispose();
    shadowMap.dispose();
    renderer.dispose();
  };
}
