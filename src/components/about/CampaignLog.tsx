import { createSignal, For, Index, onCleanup, onMount, Show } from "solid-js";

import { education, type Landmark, positions } from "../../data/positions";
import { Die, type DieSides } from "../ui/die";
import { EntryMeta } from "./EntryMeta";
import { compassPath, landmarkPaths, type SceneryKind, sceneryPaths } from "./mapDoodles";

type Stop = { landmark: Landmark; label: string };

const stops: Stop[] = [
  ...positions.map((position) => ({
    landmark: position.landmark,
    label: position.location.split(",")[0],
  })),
  { landmark: education.landmark, label: "UC Davis" },
];

const sceneryCycle: SceneryKind[] = ["pines", "mountains", "tree", "hills", "waves", "pines"];

const dice: DieSides[] = [20, 6, 8, 4];

type Point = { x: number; y: number };

/**
 * Snakes through the points with a vertical tangent at each one, so the trail
 * leaves and arrives at every bend heading straight down the page.
 */
function snakePath(points: Point[]) {
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const pull = (b.y - a.y) / 2;
    d += ` C${a.x.toFixed(1)} ${(a.y + pull).toFixed(1)}, ${b.x.toFixed(1)} ${(b.y - pull).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

type MapLayout = {
  width: number;
  height: number;
  stops: Point[];
  path: string;
  scenery: { kind: SceneryKind; x: number; y: number }[];
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
    const scale = wide ? 1.15 : 0.8;
    const left = width * 0.34;
    const right = width * 0.66;
    const points = items.map((item, i) => ({
      x: i % 2 === 0 ? left : right,
      // Level with the middle of the first line of the entry's title.
      y: item.offsetTop + parseFloat(getComputedStyle(item.firstElementChild!).lineHeight) / 2,
    }));

    // The trail runs from just below each landmark to just above the next, so
    // it never crosses a doodle or its label.
    const route: Point[][] = [];
    const scenery: MapLayout["scenery"] = [];
    points.slice(0, -1).forEach((from, i) => {
      const to = points[i + 1];
      const exit = { x: from.x, y: from.y + 22 * scale };
      const entry = { x: to.x, y: to.y - 26 * scale };
      const gap = entry.y - exit.y;
      // Long stretches wander out towards the edges and back before arriving.
      const swings = wide && gap > 240 ? 2 : 0;
      const leg: Point[] = [exit];
      for (let k = 1; k <= swings; k++) {
        const outward = k % 2 === 1 ? to.x : from.x;
        leg.push({ x: outward < width / 2 ? width * 0.2 : width * 0.8, y: exit.y + (gap * k) / (swings + 1) });
      }
      leg.push(entry);
      route.push(leg);

      if (!wide || gap < 140) return;
      // Scenery sits where the trail is furthest away: opposite each bend, or
      // opposite the trail as it sets off on a single sweep.
      const bends = swings ? leg.slice(1, -1) : [{ x: exit.x, y: exit.y + gap * 0.3 }];
      bends.forEach((bend, k) => {
        scenery.push({
          kind: sceneryCycle[(i * 2 + k) % sceneryCycle.length],
          x: bend.x < width / 2 ? width * 0.8 : width * 0.2,
          y: bend.y,
        });
      });
    });

    setMap({ width, height, stops: points, path: route.map(snakePath).join(" "), scenery });
  };

  // The map is redrawn only when the entries beside it reflow.
  onMount(() => {
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    onCleanup(() => observer.disconnect());
  });

  return (
    <section aria-labelledby="experience" class="grid gap-8">
      <h2 id="experience" class="font-display text-3xl text-dragon">
        Experience
      </h2>

      <div
        ref={wrapper}
        class="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-10"
      >
        <div ref={mapColumn} class="relative" aria-hidden="true">
          <Show when={map()}>
            {(layout) => (
              <svg
                aria-hidden="true"
                class="absolute inset-0 overflow-visible"
                width={layout().width}
                height={layout().height}
                viewBox={`0 0 ${layout().width} ${layout().height}`}
              >
                <g
                  filter="url(#sketch)"
                  class="fill-none stroke-ink-soft"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d={layout().path} stroke-width="1.8" stroke-dasharray="5 6" />
                  <g class="stroke-ink-soft/70" stroke-width="1.5">
                    <For each={layout().scenery}>
                      {(item) => <path d={sceneryPaths[item.kind]} transform={`translate(${item.x} ${item.y})`} />}
                    </For>
                  </g>
                  <Show when={layout().width >= 120}>
                    <g transform={`translate(${layout().width * 0.8} ${layout().height - 18})`} stroke-width="1.5">
                      <path d={compassPath} />
                      <text y="-19" text-anchor="middle" class="fill-ink-soft stroke-none font-display text-[13px]">
                        N
                      </text>
                    </g>
                  </Show>
                </g>

                <Index each={layout().stops}>
                  {(point, i) => {
                    const stop = stops[i];
                    const wide = () => layout().width >= 120;
                    const scale = () => (wide() ? 1.15 : 0.8);
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
                            x={left() ? 25 : -25}
                            y="4"
                            text-anchor={left() ? "start" : "end"}
                            class="fill-ink-soft font-hand text-[19px]"
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
              <li ref={(el) => (items[i()] = el)} id={`campaign-${position.id}`} class="grid gap-1.5 pb-16">
                <h3 class="text-xl leading-tight font-bold sm:text-2xl">{position.title}</h3>
                <p class="text-lg leading-snug">{position.company}</p>
                <EntryMeta start={position.start} end={position.end} location={position.location} tenure />
                <Show when={position.highlights.length}>
                  <ul class="mt-4 grid max-w-[64ch] gap-3">
                    <For each={position.highlights}>
                      {(highlight, k) => (
                        <li class="relative pl-8 leading-relaxed">
                          <Die
                            sides={dice[k() % dice.length]}
                            class={`absolute top-[0.3em] left-0.5 size-[1.1em] text-dragon ${k() % 2 ? "rotate-6" : "-rotate-6"}`}
                          />
                          {highlight}
                        </li>
                      )}
                    </For>
                  </ul>
                </Show>
              </li>
            )}
          </For>
          <li ref={(el) => (items[positions.length] = el)} id={`campaign-${education.id}`} class="grid gap-1.5">
            <h3 class="text-xl leading-tight font-bold sm:text-2xl">{education.school}</h3>
            <p class="text-lg leading-snug">{education.degree}</p>
            <p class="leading-snug">{education.specialization}</p>
            <EntryMeta start={education.start} end={education.end} location={education.location} />
          </li>
        </ol>
      </div>
    </section>
  );
}
