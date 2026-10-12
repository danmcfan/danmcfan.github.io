import { createSignal, For, Index, onCleanup, onMount, Show } from "solid-js";

import { education, formatMonth, type Landmark, positions } from "../../data/positions";
import { Badge } from "../ui/badge";
import { compassPath, landmarkPaths, type SceneryKind, sceneryPaths } from "./mapDoodles";

type Stop = { id: string; landmark: Landmark; label: string };

const stops: Stop[] = [
  ...positions.map((position) => ({
    id: position.id,
    landmark: position.landmark,
    label: position.location.split(",")[0],
  })),
  { id: education.id, landmark: education.landmark, label: "UC Davis" },
];

const sceneryCycle: SceneryKind[] = ["pines", "mountains", "hills", "waves", "tree", "mountains", "pines"];

function monthsBetween(start: string, end?: string) {
  const [sy, sm] = start.split("-").map(Number);
  const now = new Date();
  const [ey, em] = end ? end.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  return (ey - sy) * 12 + (em - sm);
}

function formatTenure(months: number) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo`);
  return parts.join(" ") || "1 mo";
}

type Point = { x: number; y: number };

/** Catmull-Rom spline through the points, as SVG cubic Béziers. */
function smoothPath(points: Point[]) {
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

type MapLayout = {
  width: number;
  height: number;
  stops: Point[];
  path: string;
  scenery: { kind: SceneryKind; x: number; y: number; scale: number }[];
};

/** Work history beside a hand-drawn map whose trail is inked in as the reader scrolls. */
export function CampaignLog() {
  let wrapper!: HTMLDivElement;
  let mapColumn!: HTMLDivElement;
  let trail: SVGPathElement | undefined;
  const items: HTMLElement[] = [];

  const [map, setMap] = createSignal<MapLayout>();
  const [travelled, setTravelled] = createSignal(0);
  const [active, setActive] = createSignal(-1);

  // Trail length sampled against height, so a scroll position maps to a point on the path.
  let samples: { length: number; y: number }[] = [];
  let totalLength = 0;

  const measure = () => {
    const width = mapColumn.clientWidth;
    const height = wrapper.offsetHeight;
    if (!width || !height) return;
    const wide = width >= 120;
    const points = items.map((item, i) => ({
      x: width * (i % 2 === 0 ? 0.36 : 0.64),
      // Level with the middle of the entry's title.
      y: item.offsetTop + 15,
    }));

    const route: Point[] = [{ x: width * 0.5, y: 0 }];
    points.forEach((point, i) => {
      if (i > 0) {
        const previous = points[i - 1];
        route.push({
          x: (previous.x + point.x) / 2 + width * (i % 2 ? 0.1 : -0.1),
          y: (previous.y + point.y) / 2,
        });
      }
      route.push(point);
    });
    route.push({ x: width * 0.5, y: height });

    const scenery: MapLayout["scenery"] = [];
    points.slice(0, -1).forEach((point, i) => {
      const next = points[i + 1];
      const gap = next.y - point.y;
      if (gap < 110) return;
      const y = point.y + gap / 2;
      const kind = sceneryCycle[i % sceneryCycle.length];
      if (wide) {
        scenery.push({ kind, x: width * (i % 2 ? 0.16 : 0.84), y: y - gap * 0.12, scale: 1.2 });
        if (gap > 220) {
          const other = sceneryCycle[(i + 3) % sceneryCycle.length];
          scenery.push({ kind: other, x: width * (i % 2 ? 0.8 : 0.2), y: y + gap * 0.22, scale: 1 });
        }
      } else {
        scenery.push({ kind: "pines", x: width * (i % 2 ? 0.2 : 0.8), y, scale: 0.6 });
      }
    });

    setMap({ width, height, stops: points, path: smoothPath(route), scenery });
  };

  const sampleTrail = () => {
    if (!trail) return;
    totalLength = trail.getTotalLength();
    samples = Array.from({ length: 241 }, (_, i) => {
      const length = (totalLength * i) / 240;
      return { length, y: trail!.getPointAtLength(length).y };
    });
  };

  const follow = () => {
    const layout = map();
    if (!layout || !trail || !samples.length) return;
    const anchor = window.innerHeight * 0.5 - wrapper.getBoundingClientRect().top;
    const y = Math.min(Math.max(anchor, 0), layout.height);

    let i = samples.findIndex((sample) => sample.y >= y);
    if (i === -1) i = samples.length - 1;
    const a = samples[Math.max(i - 1, 0)];
    const b = samples[i];
    const t = b.y === a.y ? 1 : (y - a.y) / (b.y - a.y);
    const length = a.length + (b.length - a.length) * t;

    setTravelled(length);

    let reached = -1;
    layout.stops.forEach((stop, index) => {
      if (stop.y <= y + 6) reached = index;
    });
    setActive(reached);
  };

  const refresh = () => {
    measure();
    // Wait for the new path to render before sampling it.
    requestAnimationFrame(() => {
      sampleTrail();
      follow();
    });
  };

  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      follow();
    });
  };

  onMount(() => {
    const observer = new ResizeObserver(refresh);
    observer.observe(wrapper);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onCleanup(() => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });
  });

  const visit = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(`campaign-${id}`)
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <section aria-labelledby="experience" class="grid gap-6">
      <h2 id="experience" class="font-display text-3xl text-dragon">
        Experience
      </h2>

      <div ref={wrapper} class="relative grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-8">
        <div ref={mapColumn} class="relative" aria-hidden="true">
          <Show when={map()}>
            {(layout) => (
              <svg
                class="absolute inset-0 overflow-visible"
                width={layout().width}
                height={layout().height}
                viewBox={`0 0 ${layout().width} ${layout().height}`}
              >
                <mask id="trail-reveal" maskUnits="userSpaceOnUse" x="-20" y="-20" width={layout().width + 40} height={layout().height + 40}>
                  <path
                    d={layout().path}
                    fill="none"
                    stroke="white"
                    stroke-width="12"
                    stroke-dasharray={`${travelled()} ${totalLength + 1}`}
                  />
                </mask>

                <g filter="url(#sketch)" class="fill-none stroke-ink-soft/60" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <Show when={layout().width >= 120}>
                    <g transform={`translate(${layout().width * 0.12} 2)`}>
                      <path d={compassPath} />
                      <text y="-19" text-anchor="middle" class="fill-ink-soft stroke-none font-display text-[12px]">
                        N
                      </text>
                    </g>
                  </Show>
                  <For each={layout().scenery}>
                    {(item) => (
                      <path d={sceneryPaths[item.kind]} transform={`translate(${item.x} ${item.y}) scale(${item.scale})`} />
                    )}
                  </For>
                </g>

                <path
                  ref={(el) => (trail = el)}
                  d={layout().path}
                  fill="none"
                  class="stroke-ink/35"
                  stroke-width="2"
                  stroke-dasharray="1 7"
                  stroke-linecap="round"
                />
                <path
                  d={layout().path}
                  fill="none"
                  class="stroke-dragon"
                  stroke-width="2.4"
                  stroke-dasharray="7 6"
                  stroke-linecap="round"
                  mask="url(#trail-reveal)"
                />

                <Index each={layout().stops}>
                  {(point, i) => {
                    const stop = stops[i];
                    const wide = () => layout().width >= 120;
                    const scale = () => (wide() ? 1 : 0.8);
                    const left = () => point().x < layout().width / 2;
                    return (
                      <g
                        class="cursor-pointer"
                        transform={`translate(${point().x} ${point().y})`}
                        onClick={() => visit(stop.id)}
                      >
                        <circle r="20" class="fill-transparent" />
                        <path
                          d={landmarkPaths[stop.landmark]}
                          transform={`scale(${scale()})`}
                          filter="url(#sketch)"
                          class="fill-card stroke-[1.8] transition-colors duration-300"
                          classList={{
                            "stroke-dragon": i <= active(),
                            "stroke-ink-soft": i > active(),
                          }}
                          stroke-linejoin="round"
                          stroke-linecap="round"
                        />
                        <Show when={wide()}>
                          <text
                            x={left() ? 22 : -22}
                            y="4"
                            text-anchor={left() ? "start" : "end"}
                            class="font-hand text-[17px] transition-colors duration-300"
                            classList={{ "fill-dragon": i <= active(), "fill-ink-soft": i > active() }}
                          >
                            {stop.label}
                          </text>
                        </Show>
                      </g>
                    );
                  }}
                </Index>
              </svg>
            )}
          </Show>
        </div>

        <ol class="grid">
          <For each={positions}>
            {(position, i) => (
              <li
                ref={(el) => (items[i()] = el)}
                id={`campaign-${position.id}`}
                class="grid gap-1 pb-10"
              >
                <h3
                  class="text-xl leading-tight font-bold transition-colors duration-300 sm:text-2xl"
                  classList={{ "text-dragon": i() === active() }}
                >
                  {position.title}
                </h3>
                <p class="text-lg leading-snug">{position.company}</p>
                <p class="text-sm text-ink-soft">
                  {formatMonth(position.start)} – {position.end ? formatMonth(position.end) : "Present"} ·{" "}
                  {formatTenure(monthsBetween(position.start, position.end))} · {position.location}
                </p>
                <Show when={position.highlights.length}>
                  <ul class="mt-2 grid max-w-[64ch] gap-1.5">
                    <For each={position.highlights}>
                      {(highlight) => (
                        <li class="relative pl-5 leading-snug before:absolute before:top-[0.55em] before:left-1 before:size-1.5 before:rotate-45 before:bg-dragon/80">
                          {highlight}
                        </li>
                      )}
                    </For>
                  </ul>
                </Show>
                <Show when={position.tools.length}>
                  <ul class="mt-3 flex flex-wrap gap-1.5" aria-label="Tools">
                    <For each={position.tools}>
                      {(tool) => (
                        <li>
                          <Badge>{tool}</Badge>
                        </li>
                      )}
                    </For>
                  </ul>
                </Show>
              </li>
            )}
          </For>
          <li ref={(el) => (items[positions.length] = el)} id={`campaign-${education.id}`} class="grid gap-1">
            <h3
              class="text-xl leading-tight font-bold transition-colors duration-300 sm:text-2xl"
              classList={{ "text-dragon": active() === positions.length }}
            >
              {education.school}
            </h3>
            <p class="text-lg leading-snug">{education.degree}</p>
            <p class="text-sm text-ink-soft">
              {education.years} · {education.location}
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
