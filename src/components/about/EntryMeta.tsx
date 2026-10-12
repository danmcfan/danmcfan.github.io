import { type JSX, Show } from "solid-js";

import { formatMonth } from "../../data/positions";

function Glyph(props: { children: JSX.Element }) {
  return (
    <svg
      class="size-4 shrink-0 overflow-visible"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <g filter="url(#sketch)">{props.children}</g>
    </svg>
  );
}

const Calendar = () => (
  <Glyph>
    <path d="M4 6.5 h16 v13.5 h-16 z M4 10.5 h16 M8.5 4 v4.5 M15.5 4 v4.5 M8 14 h2 M14 14 h2 M8 17 h2" />
  </Glyph>
);

const Pin = () => (
  <Glyph>
    <path d="M12 21 C 8 16.5, 5.5 13, 5.5 9.5 a6.5 6.5 0 0 1 13 0 c0 3.5 -2.5 7 -6.5 11.5 z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </Glyph>
);

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

type EntryMetaProps = {
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM"; omitted for the current role. */
  end?: string;
  location: string;
  /** Show how long the stint lasted after the dates. */
  tenure?: boolean;
};

/** When and where an entry happened, each marked with its own icon. */
export function EntryMeta(props: EntryMetaProps) {
  return (
    <dl class="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1.5 font-mono text-xs tracking-[0.06em] text-ink-soft uppercase">
      <div class="flex items-center gap-2">
        <dt class="flex">
          <Calendar />
          <span class="sr-only">Dates</span>
        </dt>
        <dd class="m-0">
          <time datetime={props.start}>{formatMonth(props.start)}</time>
          {" – "}
          {props.end ? <time datetime={props.end}>{formatMonth(props.end)}</time> : "Present"}
          <Show when={props.tenure}>
            <span class="ml-2 rounded-full border border-ink-soft/40 px-1.5 py-0.5 normal-case">
              {formatTenure(monthsBetween(props.start, props.end))}
            </span>
          </Show>
        </dd>
      </div>
      <div class="flex items-center gap-2">
        <dt class="flex">
          <Pin />
          <span class="sr-only">Location</span>
        </dt>
        <dd class="m-0">{props.location}</dd>
      </div>
    </dl>
  );
}
