import { createSignal, For, Index, onCleanup, onMount, Show } from "solid-js";

import { education, formatMonth, type Landmark, positions } from "../../data/positions";
import { Badge } from "../ui/badge";
import { compassPath, landmarkPaths, type SceneryKind, sceneryPaths } from "./mapDoodles";

type Stop = { landmark: Landmark; label: string };

const stops: Stop[] = [
  ...positions.map((position) => ({
    landmark: position.landmark,
    label: position.location.split(",")[0],
  })),
  { landmark: education.landmark, label: "UC Davis" },
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

/** Work history beside a static, hand-drawn map of where it happened. */
export function CampaignLog() {
  let wrapper!: HTMLDivElement;
  let mapColumn!: HTMLDivElement;
  const items: HTMLElement[] = [];

  const [map, setMap] = createSignal<MapLayout>();

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

  // The map is redrawn only when the entries beside it reflow.
  onMount(() => {
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    onCleanup(() => observer.disconnect());
  });

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
                  d={layout().path}
                  fill="none"
                  class="stroke-ink/45"
                  stroke-width="2"
                  stroke-dasharray="1 7"
                  stroke-linecap="round"
                />

                <Index each={layout().stops}>
                  {(point, i) => {
                    const stop = stops[i];
                    const wide = () => layout().width >= 120;
                    const scale = () => (wide() ? 1 : 0.8);
                    const left = () => point().x < layout().width / 2;
                    return (
                      <g transform={`translate(${point().x} ${point().y})`}>
                        <path
                          d={landmarkPaths[stop.landmark]}
                          transform={`scale(${scale()})`}
                          filter="url(#sketch)"
                          class="fill-card stroke-ink-soft stroke-[1.8]"
                          stroke-linejoin="round"
                          stroke-linecap="round"
                        />
                        <Show when={wide()}>
                          <text
                            x={left() ? 22 : -22}
                            y="4"
                            text-anchor={left() ? "start" : "end"}
                            class="fill-ink-soft font-hand text-[17px]"
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
                <h3 class="text-xl leading-tight font-bold sm:text-2xl">
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
            <h3 class="text-xl leading-tight font-bold sm:text-2xl">
              {education.school}
            </h3>
            <p class="text-lg leading-snug">{education.degree}</p>
            <p class="leading-snug">{education.specialization}</p>
            <p class="text-sm text-ink-soft">
              {education.years} · {education.location}
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
