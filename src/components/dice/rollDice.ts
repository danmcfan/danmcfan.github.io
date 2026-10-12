import {
  AmbientLight,
  type BufferGeometry,
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

import { type DiceLayout, layoutDice, type PageGeometry, type Rect, type Target } from "./layout";
import { type Bounds, DiceTable, GRAVITY, geometryFromPolyhedron, type Polyhedron, type TableDie } from "./physics";
import { dicePolyhedra } from "./shapes";

type RollDiceOptions = {
  canvas: HTMLCanvasElement;
  /** The centred content column. Dice land in the margins around it. */
  sheet: HTMLElement;
  /** Empty area in the header reserved for dice. */
  tray: HTMLElement;
};

type Die = {
  kind: number;
  group: Group;
  mesh: Mesh;
  material: MeshToonMaterial;
  shadow: Mesh;
  shadowMaterial: MeshBasicMaterial;
  target: Target;
  physics: TableDie;
  /** Not thrown yet: waiting for its spot to scroll into view. */
  pending: boolean;
  /** When a pending die is due to be thrown. */
  throwAt?: number;
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
/** Rough height of a resting die's centre, in physics units, used to line dice up with page spots. */
const REST_LIFT = 0.8;
/** How far off the page edge a die starts its throw, in physics units. */
const OFF_EDGE = 1.5;

const random = (min: number, max: number) => min + Math.random() * (max - min);

function randomQuaternion() {
  return new Quaternion().setFromEuler(new Euler(random(0, 7), random(0, 7), random(0, 7)));
}

function randomSpin(speed: number) {
  return new Vector3(random(-speed, speed), random(-speed, speed), random(-speed, speed));
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

export function rollDice(options: RollDiceOptions): () => void {
  const { canvas, sheet, tray } = options;
  const root = canvas.parentElement!;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Orthographic in pixel units: a point on the table at (x, y, z) lands on the page at
  // (x, z·cos − y·sin), so page coordinates map straight onto the table. The camera
  // slides down the table as the page scrolls.
  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 0, -1, 1, CAMERA_DISTANCE * 2);
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
  const table = new DiceTable(shapes);
  const dice: Die[] = [];
  let plan: DiceLayout;
  /** Pixels per physics unit. */
  let scale = 1;
  let width = 0;
  let height = 0;
  let frame = 0;
  let last = 0;

  const resize = () => {
    width = root.clientWidth;
    height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.right = width;
    camera.bottom = -height;
    camera.updateProjectionMatrix();
  };

  /** How far the top of the layout root has scrolled above the viewport. */
  const scrolled = () => -root.getBoundingClientRect().top;

  const updateCamera = () => {
    const z = scrolled() / COS;
    camera.position.set(0, CAMERA_DISTANCE * COS, CAMERA_DISTANCE * SIN + z);
    camera.lookAt(0, 0, z);
    camera.updateMatrixWorld();
  };

  const render = () => {
    updateCamera();
    renderer.render(scene, camera);
  };

  const measure = (): PageGeometry => {
    const origin = root.getBoundingClientRect();
    const relative = (rect: DOMRect): Rect => ({
      left: rect.left - origin.left,
      top: rect.top - origin.top,
      right: rect.right - origin.left,
      bottom: rect.bottom - origin.top,
    });
    return {
      width: root.clientWidth,
      height: origin.height,
      sheet: relative(sheet.getBoundingClientRect()),
      tray: relative(tray.getBoundingClientRect()),
    };
  };

  // Page pixels to table units. A resting die's centre sits REST_LIFT above the table.
  const tableX = (x: number) => x / scale;
  const tableZ = (y: number) => (y / scale + REST_LIFT * SIN) / COS;
  const home = (target: Target) => ({ x: tableX(target.x), z: tableZ(target.y) });
  const bounds = (rect: Rect): Bounds => ({
    x0: tableX(rect.left),
    x1: tableX(rect.right),
    z0: tableZ(rect.top),
    z1: tableZ(rect.bottom),
  });

  const sync = (die: Die) => {
    const { position, quaternion } = die.physics.body;
    die.group.position.set(position.x, position.y, position.z).multiplyScalar(scale);
    die.group.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    die.group.scale.setScalar(scale);

    // Shadow on the table, drifting away from the light as the die rises.
    const rise = Math.max(table.lift(die.physics), 0);
    const { x, z } = die.group.position;
    die.shadow.position.set(x + scale * (0.15 + rise * 0.5), 0.5, z - scale * (0.1 + rise * 0.3));
    die.shadow.scale.setScalar(scale * 2.3 * (1 + rise * 0.08));
    die.shadowMaterial.opacity = 0.85 * Math.max(1 - rise / 8, 0.2);
  };

  const show = (die: Die) => {
    die.pending = false;
    die.throwAt = undefined;
    die.group.visible = die.shadow.visible = true;
  };

  const settleAt = (die: Die) => {
    show(die);
    const spot = home(die.target);
    table.place(die.physics, spot.x, spot.z);
    sync(die);
  };

  /** Throw a die in from the nearer page edge, hard enough to reach its spot. */
  const throwIn = (die: Die) => {
    show(die);
    const spot = home(die.target);
    const side = die.target.from === "left" ? 1 : -1;
    const startX = side > 0 ? -OFF_EDGE : tableX(width) + OFF_EDGE;
    const distance = Math.abs(spot.x - startX);
    // Overshooting is fine: the region's far wall stops the die.
    const speed = Math.min(6 + distance * 1.8, 40);
    table.throwIn(die.physics, {
      position: new Vector3(startX, random(4, 5.5), spot.z + random(-0.5, 0.5)),
      quaternion: randomQuaternion(),
      velocity: new Vector3(side * speed, random(-1, 1), random(-1.5, 1.5)),
      angularVelocity: randomSpin(20),
    });
    sync(die);
  };

  const addDie = (target: Target, index: number) => {
    const kind = index % shapes.length;
    const material = new MeshToonMaterial({ color: COLORS[index % COLORS.length], gradientMap: ramp });
    const mesh = new Mesh(geometries[kind], material);
    const group = new Group();
    group.add(mesh, new LineSegments(edges[kind], edgeMaterial));
    const shadowMaterial = new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false });
    const shadow = new Mesh(shadowGeometry, shadowMaterial);
    group.visible = shadow.visible = false;
    scene.add(shadow, group);
    const die: Die = {
      kind,
      group,
      mesh,
      material,
      shadow,
      shadowMaterial,
      target,
      physics: table.add(kind, target.region, home(target)),
      pending: true,
    };
    dice.push(die);
    return die;
  };

  const removeDie = (die: Die) => {
    table.remove(die.physics);
    scene.remove(die.group, die.shadow);
    die.material.dispose();
    die.shadowMaterial.dispose();
  };

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    for (const die of dice) {
      if (die.pending && die.throwAt !== undefined && now >= die.throwAt) throwIn(die);
    }
    table.step(dt);
    for (const die of dice) if (!die.pending) sync(die);
    render();
    const waiting = dice.some((die) => die.throwAt !== undefined);
    frame = waiting || !table.settled ? requestAnimationFrame(tick) : 0;
  };

  const animate = () => {
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  /**
   * Throw pending dice whose spots have scrolled into view, one after another.
   * Spots already scrolled past are filled in quietly.
   */
  const throwVisible = (stagger: number) => {
    const top = scrolled();
    const bottom = top + window.innerHeight;
    const now = performance.now();
    let queued = 0;
    for (const die of dice) {
      if (!die.pending || die.throwAt !== undefined) continue;
      if (reduceMotion || die.target.y < top - plan.size) {
        settleAt(die);
      } else if (die.target.y < bottom - plan.size * 0.25) {
        die.throwAt = now + queued * stagger + random(0, stagger * 0.8);
        queued++;
      }
    }
    if (queued) animate();
  };

  const targetsFor = (next: DiceLayout) => {
    plan = next;
    scale = next.size / 2;
    next.targets.forEach((target, i) => {
      addDie(target, i);
    });
    table.setRegions(next.regions.map(bounds));
  };

  resize();
  targetsFor(layoutDice(measure()));
  throwVisible(160);
  render();

  /** Fit the dice to a page that changed size: keep the ones still in bounds, re-home the rest. */
  const relayout = () => {
    resize();
    const next = layoutDice(measure());
    if (next.size !== plan.size) {
      // A new die size changes the physics scale, so start over with every thrown die at rest.
      const thrown = dice.map((die) => !die.pending);
      for (const die of dice.splice(0)) removeDie(die);
      targetsFor(next);
      dice.forEach((die, i) => {
        if (thrown[i]) settleAt(die);
      });
    } else {
      plan = next;
      for (const die of dice.splice(next.targets.length)) removeDie(die);
      next.targets.forEach((target, i) => {
        const die = dice[i] ?? addDie(target, i);
        die.target = target;
        die.physics.region = target.region;
        die.physics.home = home(target);
      });
      table.setRegions(next.regions.map(bounds));
      for (const die of dice) if (!die.pending && !table.contains(die.physics)) settleAt(die);
    }
    throwVisible(120);
    render();
  };

  let relayoutTimer = 0;
  const scheduleRelayout = () => {
    window.clearTimeout(relayoutTimer);
    relayoutTimer = window.setTimeout(relayout, 150);
  };
  window.addEventListener("resize", scheduleRelayout);
  // The page grows and shrinks as routes change.
  const observer = new ResizeObserver(scheduleRelayout);
  observer.observe(root);

  let scrollFrame = 0;
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      throwVisible(120);
      if (!frame) render();
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const reroll = (die: Die) => {
    if (reduceMotion) {
      table.place(die.physics, die.physics.body.position.x, die.physics.body.position.z);
      sync(die);
      render();
      return;
    }
    const { position } = die.physics.body;
    // Usually aim the hop at a neighbour so it can knock it on; otherwise hop somewhere nearby.
    let angle = random(0, Math.PI * 2);
    let distance = random(1.5, 3.5);
    const neighbour = dice
      .filter((other) => other !== die && !other.pending && other.physics.region === die.physics.region)
      .map((other) => ({
        other,
        gap: Math.hypot(other.physics.body.position.x - position.x, other.physics.body.position.z - position.z),
      }))
      .sort((a, b) => a.gap - b.gap)[0];
    if (neighbour && neighbour.gap < 7 && Math.random() < 0.6) {
      const { x, z } = neighbour.other.physics.body.position;
      angle = Math.atan2(z - position.z, x - position.x) + random(-0.3, 0.3);
      distance = neighbour.gap;
    }
    const lift = random(15, 19);
    const flight = (2 * lift) / GRAVITY;
    const speed = distance / flight;
    table.hop(die.physics, new Vector3(Math.cos(angle) * speed, lift, Math.sin(angle) * speed), randomSpin(30));
    animate();
  };

  // Dice sit above the page with pointer-events off, so hit-test them by hand.
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const dieAt = (event: MouseEvent): Die | undefined => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return undefined;
    updateCamera();
    pointer.set((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const shown = dice.filter((die) => !die.pending);
    const [hit] = raycaster.intersectObjects(
      shown.map((die) => die.mesh),
      false,
    );
    return hit && shown.find((die) => die.mesh === hit.object);
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

  return () => {
    cancelAnimationFrame(frame);
    cancelAnimationFrame(scrollFrame);
    window.clearTimeout(relayoutTimer);
    observer.disconnect();
    window.removeEventListener("resize", scheduleRelayout);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("click", onClick, true);
    if (hovering) document.body.style.cursor = "";
    for (const die of dice.splice(0)) removeDie(die);
    for (const geometry of [...geometries, ...edges, shadowGeometry]) geometry.dispose();
    edgeMaterial.dispose();
    ramp.dispose();
    shadowMap.dispose();
    renderer.dispose();
  };
}
